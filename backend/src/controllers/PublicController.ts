import { Request, Response } from 'express';
import { db as masterDb } from '../database';
import { getTenantDb } from '../database/tenant';

const getEmpresaId = (req: Request) => {
  const raw = req.query.empresa_id || req.params.empresa_id;
  const empresaId = Number(raw);
  if (!Number.isFinite(empresaId) || empresaId <= 0) return null;
  return empresaId;
};

export class PublicController {
  static listarProdutos(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id inválido' });
      }

      const tenantDb = getTenantDb(empresaId);
      const produtos = tenantDb.prepare(
        'SELECT * FROM produtos WHERE ativo = 1 AND empresa_id = ? ORDER BY nome'
      ).all(empresaId);

      return res.json(produtos);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  static listarPedidos(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id inválido' });
      }

      const { mesa_id } = req.params;
      const tenantDb = getTenantDb(empresaId);

      const stmt = tenantDb.prepare(`
        SELECT pm.id, pm.mesa_id, pm.status, pm.total, pm.created_at, pm.updated_at,
               json_group_array(json_object('id', ipm.id, 'produto_id', ipm.produto_id, 'quantidade', ipm.quantidade, 'preco_unitario', ipm.preco_unitario, 'subtotal', ipm.subtotal)) as itens
        FROM pedidos_mesa pm
        LEFT JOIN itens_pedido_mesa ipm ON pm.id = ipm.pedido_id
        WHERE pm.mesa_id = ?
        GROUP BY pm.id
        ORDER BY pm.created_at DESC
      `);

      const pedidos = stmt.all(mesa_id);
      return res.json(pedidos.map((p: any) => ({
        ...p,
        itens: JSON.parse(p.itens || '[]')
      })));
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Erro ao listar pedidos' });
    }
  }

  static criarPedido(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id inválido' });
      }

      const { mesa_id } = req.params;
      const { itens } = req.body;
      const tenantDb = getTenantDb(empresaId);

      if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ error: 'Itens obrigatórios' });
      }

      let total = 0;
      const itensPrepados = itens.map((item: any) => {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        return { ...item, subtotal };
      });

      const stmt = tenantDb.prepare(`
        INSERT INTO pedidos_mesa (mesa_id, total, status)
        VALUES (?, ?, 'pendente')
      `);
      const result = stmt.run(mesa_id, total);

      const stmtItem = tenantDb.prepare(`
        INSERT INTO itens_pedido_mesa (pedido_id, produto_id, quantidade, preco_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)
      `);

      itensPrepados.forEach((item: any) => {
        stmtItem.run(result.lastInsertRowid, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal);
      });

      return res.status(201).json({ id: result.lastInsertRowid, mesa_id, total, status: 'pendente' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Erro ao criar pedido' });
    }
  }

  static chamarAtendente(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id inválido' });
      }

      const { mesa_id } = req.params;
      const tenantDb = getTenantDb(empresaId);

      const stmt = tenantDb.prepare(`
        INSERT INTO chamados_mesa (mesa_id, status)
        VALUES (?, 'pendente')
      `);

      const result = stmt.run(mesa_id);
      return res.status(201).json({ id: result.lastInsertRowid, mesa_id, status: 'pendente' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ error: error.message || 'Erro ao chamar atendente' });
    }
  }

  static fecharConta(req: Request, res: Response) {
    try {
      const empresaId = getEmpresaId(req);
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id inválido' });
      }

      const tenantDb = getTenantDb(empresaId);
      const { mesa_id } = req.params;
      const { metodo_pagamento, desconto } = req.body;

      if (!metodo_pagamento) {
        return res.status(400).json({ error: 'Método de pagamento obrigatório' });
      }

      const transaction = tenantDb.transaction(() => {
        const pedidos = tenantDb.prepare(`
          SELECT * FROM pedidos_mesa
          WHERE mesa_id = ? AND status != 'fechado' AND status != 'cancelado'
        `).all(mesa_id);

        if (pedidos.length === 0) {
          throw new Error('Nenhum pedido pendente para fechar');
        }

        let totalVenda = 0;
        const todosItens: any[] = [];

        pedidos.forEach((pedido: any) => {
          const itens = tenantDb.prepare(`
            SELECT * FROM itens_pedido_mesa WHERE pedido_id = ?
          `).all(pedido.id);

          itens.forEach((item: any) => {
            totalVenda += item.subtotal;
            todosItens.push(item);
          });
        });

        const descontoValor = desconto || 0;
        const totalComDesconto = Math.max(0, totalVenda - descontoValor);

        const stmtVenda = tenantDb.prepare(`
          INSERT INTO vendas (empresa_id, total, desconto, metodo_pagamento, observacoes)
          VALUES (?, ?, ?, ?, ?)
        `);

        const resultVenda = stmtVenda.run(
          empresaId,
          totalComDesconto,
          descontoValor,
          metodo_pagamento,
          `Mesa ${mesa_id}`
        );

        const stmtEmpresa = masterDb.prepare(`
          UPDATE empresas
          SET total_vendas = COALESCE(total_vendas, 0) + ?,
              quantidade_vendas = COALESCE(quantidade_vendas, 0) + 1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `);
        stmtEmpresa.run(totalComDesconto, empresaId);

        const stmtItemVenda = tenantDb.prepare(`
          INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `);

        const stmtEstoque = tenantDb.prepare(`
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

          stmtEstoque.run(item.quantidade, item.produto_id);
        });

        const stmtAtualizar = tenantDb.prepare(`
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

      const resultado = transaction();
      return res.json(resultado);
    } catch (error: any) {
      console.error('Erro ao fechar conta:', error);
      return res.status(500).json({ error: error.message || 'Erro ao fechar conta' });
    }
  }
}
