import { Request, Response } from 'express';
import { getTenantDb } from '../database/tenant';
import { getAuthContext } from '../middleware/auth';

export class CaixaController {
  static listar(req: Request, res: Response) {
    try {
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { operador_nome, empresa_id } = req.query as { operador_nome?: string; empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      let query = 'SELECT * FROM caixa_fechamentos';
      const params: any[] = [];
      if (auth.empresaId) {
        query += ' WHERE empresa_id = ?';
        params.push(auth.empresaId);
      }
      if (operador_nome) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' operador_nome LIKE ?';
        params.push(`%${operador_nome}%`);
      }
      query += ' ORDER BY created_at DESC';

      const tenantDb = getTenantDb(auth.empresaId);
      const fechamentos = tenantDb.prepare(query).all(...params);
      res.json(fechamentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar fechamentos' });
    }
  }

  static criar(req: Request, res: Response) {
    try {
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const {
        empresa_id,
        operador_id,
        operador_nome,
        operador_tipo,
        valor_abertura,
        recebiveis,
        dinheiro,
        cartao,
        pix,
        observacoes
      } = req.body;

      if (!operador_nome || !operador_tipo) {
        return res.status(400).json({ error: 'Operador é obrigatório' });
      }

      if (dinheiro === undefined || cartao === undefined || pix === undefined) {
        return res.status(400).json({ error: 'Valores de fechamento são obrigatórios' });
      }

      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const result = tenantDb.prepare(`
        INSERT INTO caixa_fechamentos (
          empresa_id, operador_id, operador_nome, operador_tipo,
          valor_abertura, recebiveis, dinheiro, cartao, pix, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        auth.empresaId,
        operador_id || null,
        operador_nome,
        operador_tipo,
        valor_abertura || 0,
        recebiveis || 0,
        dinheiro,
        cartao,
        pix,
        observacoes || null
      );

      res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar fechamento' });
    }
  }
}
