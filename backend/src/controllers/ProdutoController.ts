import { Request, Response } from 'express';
import { getTenantDb } from '../database/tenant';
import { getAuthContext } from '../middleware/auth';
import { Produto } from '../models/types';

export class ProdutoController {
  // Listar todos os produtos
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

      const tenantDb = getTenantDb(auth.empresaId);
      const produtos = tenantDb.prepare(
        'SELECT * FROM produtos WHERE ativo = 1 AND empresa_id = ? ORDER BY nome'
      ).all(auth.empresaId);
      return res.json(produtos);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }

  // Buscar produto por ID
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

      const tenantDb = getTenantDb(auth.empresaId);
      const produto = tenantDb
        .prepare('SELECT * FROM produtos WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);
      
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const produto = tenantDb.prepare(
        'SELECT * FROM produtos WHERE codigo_barras = ? AND ativo = 1 AND empresa_id = ?'
      ).get(codigo, auth.empresaId);
      
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
      const { nome, descricao, preco, codigo_barras, estoque, categoria, imagem_url, empresa_id }: Produto = req.body;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const empresaId = auth.empresaId;

      if (!nome || !preco) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const result = tenantDb.prepare(`
        INSERT INTO produtos (empresa_id, nome, descricao, preco, codigo_barras, estoque, categoria, imagem_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(empresaId, nome, descricao || null, preco, codigo_barras || null, estoque || 0, categoria || null, imagem_url || null);

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
      const { nome, descricao, preco, codigo_barras, estoque, categoria, imagem_url, empresa_id }: Produto = req.body;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const empresaId = auth.empresaId;

      const tenantDb = getTenantDb(auth.empresaId);
      const existente: any = tenantDb
        .prepare('SELECT imagem_url FROM produtos WHERE id = ? AND empresa_id = ?')
        .get(id, empresaId);
      if (!existente) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      const imagemUrlFinal = imagem_url !== undefined ? imagem_url : existente.imagem_url;
      const result = tenantDb.prepare(`
        UPDATE produtos 
        SET nome = ?, descricao = ?, preco = ?, codigo_barras = ?, estoque = ?, categoria = ?, imagem_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(nome, descricao || null, preco, codigo_barras || null, estoque, categoria || null, imagemUrlFinal || null, id, empresaId);

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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const result = tenantDb
        .prepare('UPDATE produtos SET ativo = 0 WHERE id = ? AND empresa_id = ?')
        .run(id, auth.empresaId);
      
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const result = tenantDb.prepare(`
        UPDATE produtos 
        SET estoque = estoque + ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(quantidade, id, auth.empresaId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      res.json({ message: 'Estoque atualizado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }

  // Atualizar imagem do produto
  static atualizarImagem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const file = (req as any).file as Express.Multer.File | undefined;
      if (!file) {
        return res.status(400).json({ error: 'Arquivo de imagem não enviado' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const produto = tenantDb
        .prepare('SELECT id FROM produtos WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);

      if (!produto) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }

      const imagemUrl = `/uploads/${auth.empresaId}/${file.filename}`;
      tenantDb.prepare(`
        UPDATE produtos
        SET imagem_url = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(imagemUrl, id, auth.empresaId);

      res.json({ imagem_url: imagemUrl });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar imagem do produto' });
    }
  }
}
