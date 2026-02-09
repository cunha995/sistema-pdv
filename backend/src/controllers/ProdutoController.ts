import { Request, Response } from 'express';
import { db } from '../database';
import { Produto } from '../models/types';

const getEmpresaIdFromAuth = (req: Request) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return undefined;
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    const empresaId = Number(parts[1]);
    return Number.isFinite(empresaId) ? empresaId : undefined;
  } catch {
    return undefined;
  }
};

export class ProdutoController {
  // Listar todos os produtos
  static listar(req: Request, res: Response) {
    try {
      const { empresa_id } = req.query as { empresa_id?: string };
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ? Number(empresa_id) : tokenEmpresaId;
      if (!empresaId) {
        return res.json([]);
      }

      const produtos = db.prepare(
        'SELECT * FROM produtos WHERE ativo = 1 AND empresa_id = ? ORDER BY nome'
      ).all(empresaId);
      return res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Buscar produto por ID
  static buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { empresa_id } = req.query as { empresa_id?: string };
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ? Number(empresa_id) : tokenEmpresaId;
      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }
      const produto = db.prepare('SELECT * FROM produtos WHERE id = ? AND empresa_id = ?').get(id, empresaId);
      
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
      const { empresa_id } = req.query as { empresa_id?: string };
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ? Number(empresa_id) : tokenEmpresaId;
      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }
      const produto = db.prepare(
        'SELECT * FROM produtos WHERE codigo_barras = ? AND ativo = 1 AND empresa_id = ?'
      ).get(codigo, empresaId);
      
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
      const { nome, descricao, preco, codigo_barras, estoque, categoria, empresa_id }: Produto = req.body;
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ?? tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }
      
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }

      if (!nome || !preco) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const result = db.prepare(`
        INSERT INTO produtos (empresa_id, nome, descricao, preco, codigo_barras, estoque, categoria)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(empresaId, nome, descricao || null, preco, codigo_barras || null, estoque || 0, categoria || null);

      res.status(201).json({ id: result.lastInsertRowid, message: 'Produto criado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado para esta empresa' });
      }
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }

  // Atualizar produto
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, descricao, preco, codigo_barras, estoque, categoria, empresa_id }: Produto = req.body;
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ?? tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }

      const result = db.prepare(`
        UPDATE produtos 
        SET nome = ?, descricao = ?, preco = ?, codigo_barras = ?, estoque = ?, categoria = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(nome, descricao || null, preco, codigo_barras || null, estoque, categoria || null, id, empresaId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Produto atualizado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Código de barras já cadastrado para esta empresa' });
      }
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }

  // Deletar produto (soft delete)
  static deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { empresa_id } = req.query as { empresa_id?: string };
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ? Number(empresa_id) : tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }
      
      const result = db.prepare('UPDATE produtos SET ativo = 0 WHERE id = ? AND empresa_id = ?').run(id, empresaId);
      
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
      const { quantidade, empresa_id } = req.body;
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ?? tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }

      const result = db.prepare(`
        UPDATE produtos 
        SET estoque = estoque + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(quantidade, id, empresaId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Estoque atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }
}
