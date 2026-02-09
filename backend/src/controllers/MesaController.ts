import { db } from '../database';

export class MesaController {
  // Criar pedido para uma mesa
  static criarPedido(req: any, res: any) {
    try {
      const { mesa_id } = req.params;
      const { itens } = req.body;

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'Itens obrigatórios' });
      }

      // Calcular total
      let total = 0;
      const itensPrepados = itens.map((item: any) => {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        return { ...item, subtotal };
      });

      // Inserir pedido
      const stmt = db.prepare(`
        INSERT INTO pedidos_mesa (mesa_id, total, status)
        VALUES (?, ?, 'pendente')
      `);
      const result = stmt.run(mesa_id, total);

      // Inserir itens do pedido
      const stmtItem = db.prepare(`
        INSERT INTO itens_pedido_mesa (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      itensPrepados.forEach((item: any) => {
        stmtItem.run(result.lastInsertRowid, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal);
      });

      res.status(201).json({ id: result.lastInsertRowid, mesa_id, total, status: 'pendente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Listar histórico de pedidos da mesa
  static listarPedidos(req: any, res: any) {
    try {
      const { mesa_id } = req.params;

      const stmt = db.prepare(`
        SELECT pm.id, pm.mesa_id, pm.status, pm.total, pm.created_at, pm.updated_at,
               json_group_array(json_object('id', ipm.id, 'produto_id', ipm.produto_id, 'quantidade', ipm.quantidade, 'preco_unitario', ipm.preco_unitario, 'subtotal', ipm.subtotal)) as itens
        FROM pedidos_mesa pm
        LEFT JOIN itens_pedido_mesa ipm ON pm.id = ipm.pedido_id
        WHERE pm.mesa_id = ?
        GROUP BY pm.id
        ORDER BY pm.created_at DESC
      `);

      const pedidos = stmt.all(mesa_id);
      res.json(pedidos.map((p: any) => ({
        ...p,
        itens: JSON.parse(p.itens || '[]')
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar status do pedido
  static atualizarStatusPedido(req: any, res: any) {
    try {
      const { mesa_id, pedido_id } = req.params;
      const { status } = req.body;

      const stmt = db.prepare(`
        UPDATE pedidos_mesa
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND mesa_id = ?
      `);

      stmt.run(status, pedido_id, mesa_id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Chamar atendente
  static chamarAtendente(req: any, res: any) {
    try {
      const { mesa_id } = req.params;

      const stmt = db.prepare(`
        INSERT INTO chamados_mesa (mesa_id, status)
        VALUES (?, 'pendente')
      `);

      const result = stmt.run(mesa_id);

      res.status(201).json({ id: result.lastInsertRowid, mesa_id, status: 'pendente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fechar conta (consolidar todos os pedidos em uma venda)
  static fecharConta(req: any, res: any) {
    const transaction = db.transaction(() => {
      const { mesa_id } = req.params;
      const { metodo_pagamento, desconto, empresa_id } = req.body;

      // Validar método de pagamento
      if (!metodo_pagamento) {
        throw new Error('Método de pagamento obrigatório');
      }

      // Buscar todos os pedidos abertos da mesa
      const pedidos = db.prepare(`
        SELECT * FROM pedidos_mesa
        WHERE mesa_id = ? AND status != 'fechado' AND status != 'cancelado'
      `).all(mesa_id);

      if (pedidos.length === 0) {
        throw new Error('Nenhum pedido pendente para fechar');
      }

      // Calcular total
      let totalVenda = 0;
      const todosItens: any[] = [];

      pedidos.forEach((pedido: any) => {
        const itens = db.prepare(`
          SELECT * FROM itens_pedido_mesa WHERE pedido_id = ?
        `).all(pedido.id);

        itens.forEach((item: any) => {
          totalVenda += item.subtotal;
          todosItens.push(item);
        });
      });

      const descontoValor = desconto || 0;
      const totalComDesconto = Math.max(0, totalVenda - descontoValor);

      // Criar venda consolidada
      const stmtVenda = db.prepare(`
        INSERT INTO vendas (empresa_id, total, desconto, metodo_pagamento, observacoes)
        VALUES (?, ?, ?, ?, ?)
      `);

      const resultVenda = stmtVenda.run(
        empresa_id || null, 
        totalComDesconto, 
        descontoValor, 
        metodo_pagamento, 
        `Mesa ${mesa_id}`
      );

      // Inserir itens da venda
      const stmtItemVenda = db.prepare(`
        INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      const stmtEstoque = db.prepare(`
        UPDATE produtos 
        SET estoque = estoque - ? 
        WHERE id = ?
      `);

      todosItens.forEach((item: any) => {
        stmtItemVenda.run(
          resultVenda.lastInsertRowid, 
          item.produto_id, 
          item.quantidade, 
          item.preco_unitario, 
          item.subtotal
        );

        // Atualizar estoque do produto sem bloquear o fechamento
        stmtEstoque.run(item.quantidade, item.produto_id);
      });

      // Marcar TODOS os pedidos da mesa como fechados
      const stmtAtualizar = db.prepare(`
        UPDATE pedidos_mesa 
        SET status = 'fechado', updated_at = CURRENT_TIMESTAMP 
        WHERE mesa_id = ? AND (status != 'fechado' AND status != 'cancelado')
      `);
      const resultUpdate = stmtAtualizar.run(mesa_id);

      return { 
        venda_id: resultVenda.lastInsertRowid, 
        mesa_id, 
        total: totalComDesconto,
        total_original: totalVenda,
        desconto: descontoValor,
        pedidos_fechados: resultUpdate.changes,
        itens_total: todosItens.length
      };
    });

    try {
      const resultado = transaction();
      res.json(resultado);
    } catch (error: any) {
      console.error('Erro ao fechar conta:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Finalizar mesa sem gerar nova venda (liberar para novos pedidos)
  static finalizarMesa(req: any, res: any) {
    try {
      const { mesa_id } = req.params;

      const stmtAtualizar = db.prepare(`
        UPDATE pedidos_mesa 
        SET status = 'fechado', updated_at = CURRENT_TIMESTAMP 
        WHERE mesa_id = ? AND status != 'fechado' AND status != 'cancelado'
      `);
      const result = stmtAtualizar.run(mesa_id);

      res.json({ mesa_id, fechados: result.changes || 0 });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Cancelar pedido específico
  static cancelarPedido(req: any, res: any) {
    try {
      const { mesa_id, pedido_id } = req.params;

      // Verificar se o pedido existe e pertence à mesa
      const pedido = db.prepare(`
        SELECT * FROM pedidos_mesa WHERE id = ? AND mesa_id = ?
      `).get(pedido_id, mesa_id);

      if (!pedido) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }

      // Cancelar o pedido
      const stmt = db.prepare(`
        UPDATE pedidos_mesa 
        SET status = 'cancelado', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ? AND mesa_id = ?
      `);

      stmt.run(pedido_id, mesa_id);
      res.json({ success: true, pedido_id, status: 'cancelado' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
