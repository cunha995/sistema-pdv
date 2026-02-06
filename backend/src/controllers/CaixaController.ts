import { Request, Response } from 'express';
import { db } from '../database';

export class CaixaController {
  static listar(req: Request, res: Response) {
    try {
      const { operador_nome, empresa_id } = req.query;

      let query = 'SELECT * FROM caixa_fechamentos';
      const params: any[] = [];
      if (empresa_id) {
        query += ' WHERE empresa_id = ?';
        params.push(empresa_id);
      }
      if (operador_nome) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' operador_nome LIKE ?';
        params.push(`%${operador_nome}%`);
      }
      query += ' ORDER BY created_at DESC';

      const fechamentos = db.prepare(query).all(...params);
      res.json(fechamentos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar fechamentos' });
    }
  }

  static criar(req: Request, res: Response) {
    try {
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

      const result = db.prepare(`
        INSERT INTO caixa_fechamentos (
          empresa_id, operador_id, operador_nome, operador_tipo,
          valor_abertura, recebiveis, dinheiro, cartao, pix, observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        empresa_id || null,
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
