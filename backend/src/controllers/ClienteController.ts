import { Request, Response } from 'express';
import { db } from '../database';
import { Cliente } from '../models/types';

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

export class ClienteController {
  // Listar todos os clientes
  static listar(req: Request, res: Response) {
    try {
      const { empresa_id } = req.query as { empresa_id?: string };
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ? Number(empresa_id) : tokenEmpresaId;
      if (!empresaId) {
        return res.json([]);
      }

      const clientes = db.prepare('SELECT * FROM clientes WHERE empresa_id = ? ORDER BY nome').all(empresaId);
      return res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  }

  // Buscar cliente por ID
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
      const cliente = db.prepare('SELECT * FROM clientes WHERE id = ? AND empresa_id = ?').get(id, empresaId);
      
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      
      res.json(cliente);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  // Criar novo cliente
  static criar(req: Request, res: Response) {
    try {
      const { nome, cpf, telefone, email, endereco, empresa_id }: Cliente = req.body;
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ?? tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }
      
      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const result = db.prepare(`
        INSERT INTO clientes (empresa_id, nome, cpf, telefone, email, endereco)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(empresaId, nome, cpf || null, telefone || null, email || null, endereco || null);

      res.status(201).json({ id: result.lastInsertRowid, message: 'Cliente criado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  }

  // Atualizar cliente
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cpf, telefone, email, endereco, empresa_id }: Cliente = req.body;
      const tokenEmpresaId = getEmpresaIdFromAuth(req);
      const empresaId = empresa_id ?? tokenEmpresaId;

      if (tokenEmpresaId && empresaId && tokenEmpresaId !== empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!empresaId) {
        return res.status(400).json({ error: 'empresa_id obrigatório' });
      }

      const result = db.prepare(`
        UPDATE clientes 
        SET nome = ?, cpf = ?, telefone = ?, email = ?, endereco = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND empresa_id = ?
      `).run(nome, cpf || null, telefone || null, email || null, endereco || null, id, empresaId);

      if (result.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente atualizado com sucesso' });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }

  // Deletar cliente
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
      
      const result = db.prepare('DELETE FROM clientes WHERE id = ? AND empresa_id = ?').run(id, empresaId);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }
}
