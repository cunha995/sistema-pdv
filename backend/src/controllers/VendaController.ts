import { Request, Response } from 'express';
import db from '../database';
import { Venda } from '../models/types';

export class VendaController {
  // Listar todas as vendas
  static listar(req: Request, res: Response) {
    try {
      const vendas = db.prepare(`
        SELECT v.*, c.nome as cliente_nome 
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        ORDER BY v.created_at DESC
      `).all();

      res.json(vendas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar vendas' });
    }
  }

  // Buscar venda por ID com itens
  static buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const venda = db.prepare(`
        SELECT v.*, c.nome as cliente_nome 
        FROM vendas v
        LEFT JOIN clientes c ON v.cliente_id = c.id
        WHERE v.id = ?
      `).get(id);
      
      if (!venda) {
        return res.status(404).json({ error: 'Venda não encontrada' });
      }

      const itens = db.prepare(`
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
    const transaction = db.transaction((vendaData: Venda) => {
      try {
        const { cliente_id, total, desconto, metodo_pagamento, observacoes, itens } = vendaData;

        // Validações
        if (!itens || itens.length === 0) {
          throw new Error('Venda deve conter pelo menos um item');
        }

        // Inserir venda
        const resultVenda = db.prepare(`
          INSERT INTO vendas (cliente_id, total, desconto, metodo_pagamento, observacoes)
          VALUES (?, ?, ?, ?, ?)
        `).run(cliente_id || null, total, desconto || 0, metodo_pagamento || null, observacoes || null);

        const vendaId = resultVenda.lastInsertRowid;

        // Inserir itens e atualizar estoque
        const insertItem = db.prepare(`
          INSERT INTO itens_venda (venda_id, produto_id, quantidade, preco_unitario, subtotal)
          VALUES (?, ?, ?, ?, ?)
        `);

        const updateEstoque = db.prepare(`
          UPDATE produtos SET estoque = estoque - ? WHERE id = ?
        `);

        for (const item of itens) {
          // Verificar estoque disponível
          const produto: any = db.prepare('SELECT estoque FROM produtos WHERE id = ?').get(item.produto_id);
          
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
      const { data_inicio, data_fim } = req.query;

      let query = 'SELECT * FROM vendas';
      const params: any[] = [];

      if (data_inicio && data_fim) {
        query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(data_inicio, data_fim);
      }

      query += ' ORDER BY created_at DESC';

      const vendas = db.prepare(query).all(...params);

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
