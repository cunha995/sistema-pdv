import { Request, Response } from 'express';
import { getTenantDb } from '../database/tenant';
import { getAuthContext } from '../middleware/auth';
import { Venda } from '../models/types';

export class VendaController {
  // Listar todas as vendas
  static listar(req: Request, res: Response) {
    try {
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.usuarioId);

      let query = `
        SELECT v.*, c.nome as cliente_nome 
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
      `;
      const params: any[] = [];
      if (auth.empresaId) {
        query += ' WHERE v.empresa_id = ?';
        params.push(auth.empresaId);
      }
      query += ' ORDER BY v.created_at DESC';

      const vendas = tenantDb.prepare(query).all(...params);

      res.json(vendas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar vendas' });
    }
  }

  // Buscar venda por ID com itens
  static buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.usuarioId);
      const venda = tenantDb.prepare(`
        SELECT v.*, c.nome as cliente_nome 
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        WHERE v.id = ? AND v.empresa_id = ?
      `).get(id, auth.empresaId);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      const itens = tenantDb.prepare(`
        SELECT iv.*, p.nome as produto_nome
        FROM itens_venda iv
        JOIN produtos p ON iv.produto_id = p.id
        WHERE iv.venda_id = ?
      `).all(id);

      res.json({ ...venda, itens });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar venda' });
    }
  }

  // Criar nova venda
  static criar(req: Request, res: Response) {
    const auth = getAuthContext(req);
    if (!auth) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const tenantDb = getTenantDb(auth.usuarioId);
    const transaction = tenantDb.transaction((vendaData: Venda) => {
      try {
        const { empresa_id, cliente_id, total, desconto, metodo_pagamento, observacoes, itens } = vendaData;
        if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
          throw new Error('Empresa inválida');
        }

        const empresaId = auth.empresaId;

        // Validações
        if (!itens || itens.length === 0) {
          throw new Error('Venda deve conter pelo menos um item');
        }

        // Inserir venda
        const resultVenda = tenantDb.prepare(`
          INSERT INTO vendas (empresa_id, cliente_id, total, desconto, metodo_pagamento, observacoes)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(empresaId, cliente_id || null, total, desconto || 0, metodo_pagamento || null, observacoes || null);

        const vendaId = resultVenda.lastInsertRowid;

        // Inserir itens e atualizar estoque
        const insertItem = tenantDb.prepare(`
          INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `);

        const updateEstoque = tenantDb.prepare(`
          UPDATE produtos SET estoque = estoque - ? WHERE id = ?
        `);

        for (const item of itens) {
          // Verificar estoque disponível
          const produto: any = tenantDb
            .prepare('SELECT estoque FROM produtos WHERE id = ?')
            .get(item.produto_id);
          
          if (!produto) {
            throw new Error(`Produto ${item.produto_id} não encontrado`);
          }

          if (produto.estoque < item.quantidade) {
            throw new Error(`Estoque insuficiente para produto ${item.produto_id}`);
          }

          // Inserir item
          insertItem.run(vendaId, item.produto_id, item.quantidade, item.preco_unitario, item.subtotal);
          
          // Atualizar estoque
          updateEstoque.run(item.quantidade, item.produto_id);
        }

        return vendaId;
      } catch (error) {
        throw error;
      }
    });

    try {
      const vendaId = transaction(req.body);
      res.status(201).json({ id: vendaId, message: 'Venda registrada com sucesso' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Erro ao criar venda' });
    }
  }

  // Relatório de vendas por período
  static relatorio(req: Request, res: Response) {
    try {
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { data_inicio, data_fim, empresa_id } = req.query as { data_inicio?: string; data_fim?: string; empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.usuarioId);

      let query = 'SELECT * FROM vendas';
      const params: any[] = [];

      query += ' WHERE empresa_id = ?';
      params.push(auth.empresaId);

      if (data_inicio && data_fim) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' DATE(created_at) BETWEEN ? AND ?';
        params.push(data_inicio, data_fim);
      }

      query += ' ORDER BY created_at DESC';

      const vendas = tenantDb.prepare(query).all(...params);

      const totalVendas = vendas.length;
      const valorTotal = vendas.reduce((sum: number, venda: any) => sum + venda.total, 0);

      res.json({
        total_vendas: totalVendas,
        valor_total: valorTotal,
        vendas
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar relatório' });
    }
  }
}
