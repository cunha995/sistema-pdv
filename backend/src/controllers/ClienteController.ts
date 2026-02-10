import { Request, Response } from 'express';
import { getTenantDb } from '../database/tenant';
import { getAuthContext } from '../middleware/auth';
import { Cliente } from '../models/types';

export class ClienteController {
  // Listar todos os clientes
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
      const clientes = tenantDb
        .prepare('SELECT * FROM clientes WHERE empresa_id = ? ORDER BY nome')
        .all(auth.empresaId);
      return res.json(clientes);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  }

  // Buscar cliente por ID
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
      const cliente = tenantDb
        .prepare('SELECT * FROM clientes WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);
      
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const empresaId = auth.empresaId;

      if (!nome) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }

      const tenantDb = getTenantDb(auth.usuarioId);
      const result = tenantDb.prepare(`
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const empresaId = auth.empresaId;

      const tenantDb = getTenantDb(auth.usuarioId);
      const result = tenantDb.prepare(`
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.usuarioId);
      const result = tenantDb
        .prepare('DELETE FROM clientes WHERE id = ? AND empresa_id = ?')
        .run(id, auth.empresaId);
      
      if (result.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
  }
}
