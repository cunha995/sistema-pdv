import { Request, Response } from 'express';
import { db } from '../database';
import { Produto } from '../models/types';

export class ProdutoController {
  // Listar todos os produtos
  static listar(req: Request, res: Response) {
    try {
      const produtos = db.prepare('SELECT * FROM produtos WHERE ativo = 1 ORDER BY nome').all();
      res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Buscar produto por ID
  static buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = db.prepare('SELECT * FROM produtos WHERE id = ?').get(id);
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // Buscar produto por código de barras
  static buscarPorCodigoBarras(req: Request, res: Response) {
    try {
      const { codigo } = req.params;
      const produto = db.prepare('SELECT * FROM produtos WHERE codigo_barras = ? AND ativo = 1').get(codigo);
      
      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(produto);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }

  // Criar novo produto
  static criar(req: Request, res: Response) {
    try {
      const { nome, descricao, preco, codigo_barras, estoque, categoria }: Produto = req.body;
      
      if (!nome || !preco) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const result = db.prepare(`
        INSERT INTO produtos (nome, descricao, preco, codigo_barras, estoque, categoria)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(nome, descricao || null, preco, codigo_barras || null, estoque || 0, categoria || null);

      res.status(201).json({ id: result.lastInsertRowid, message: 'Produto criado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  // Atualizar produto
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, codigo_barras, estoque, categoria }: Produto = req.body;

      const result = db.prepare(`
        UPDATE produtos 
        SET nome = ?, descricao = ?, preco = ?, codigo_barras = ?, estoque = ?, categoria = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(nome, descricao || null, preco, codigo_barras || null, estoque, categoria || null, id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  // Deletar produto (soft delete)
  static deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = db.prepare('UPDATE produtos SET ativo = 0 WHERE id = ?').run(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  }

  // Atualizar estoque
  static atualizarEstoque(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { quantidade } = req.body;

      const result = db.prepare(`
        UPDATE produtos 
        SET estoque = estoque + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(quantidade, id);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Estoque atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }
}
