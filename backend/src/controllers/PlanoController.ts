import { Request, Response } from 'express';
import { db } from '../database';

export class PlanoController {
  // Listar todos os planos
  static listar(req: Request, res: Response) {
    try {
      const planos = db.prepare(`
        SELECT * FROM planos 
        WHERE ativo = 1
        ORDER BY preco_mensal ASC
      `).all();
      res.json(planos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar planos' });
    }
  }

  // Buscar plano por ID
  static buscar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plano = db.prepare('SELECT * FROM planos WHERE id = ?').get(id);
      
      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }
      
      res.json(plano);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar plano' });
    }
  }

  // Criar novo plano
  static criar(req: Request, res: Response) {
    try {
      const {
        nome,
        descricao,
        preco_mensal,
        limite_usuarios,
        limite_mesas,
        limite_produtos,
        limite_vendas_mes,
        inclui_delivery,
        inclui_relatorios
      } = req.body;

      if (!nome || !preco_mensal) {
        return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
      }

      const nomeExistente = db.prepare('SELECT id FROM planos WHERE nome = ?').get(nome);
      if (nomeExistente) {
        return res.status(400).json({ error: 'Plano com este nome já existe' });
      }

      const result = db.prepare(`
        INSERT INTO planos (
          nome, descricao, preco_mensal, limite_usuarios, limite_mesas,
          limite_produtos, limite_vendas_mes, inclui_delivery, inclui_relatorios
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, descricao, preco_mensal,
        limite_usuarios || 5, limite_mesas || 10, limite_produtos || 500,
        limite_vendas_mes || -1, inclui_delivery ? 1 : 0, inclui_relatorios ? 1 : 0
      );

      res.status(201).json({
        id: result.lastInsertRowid,
        nome,
        preco_mensal,
        ativo: 1
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar plano' });
    }
  }

  // Atualizar plano
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        preco_mensal,
        limite_usuarios,
        limite_mesas,
        limite_produtos,
        limite_vendas_mes,
        inclui_delivery,
        inclui_relatorios,
        ativo
      } = req.body;

      const plano = db.prepare('SELECT id FROM planos WHERE id = ?').get(id);
      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      db.prepare(`
        UPDATE planos 
        SET nome = ?, descricao = ?, preco_mensal = ?,
            limite_usuarios = ?, limite_mesas = ?, limite_produtos = ?,
            limite_vendas_mes = ?, inclui_delivery = ?, inclui_relatorios = ?,
            ativo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        nome, descricao, preco_mensal,
        limite_usuarios, limite_mesas, limite_produtos,
        limite_vendas_mes, inclui_delivery ? 1 : 0, inclui_relatorios ? 1 : 0,
        ativo !== undefined ? ativo : 1, id
      );

      res.json({ message: 'Plano atualizado com sucesso' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar plano' });
    }
  }

  // Deletar plano (desativar)
  static deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const plano = db.prepare('SELECT id FROM planos WHERE id = ?').get(id);
      if (!plano) {
        return res.status(404).json({ error: 'Plano não encontrado' });
      }

      db.prepare('UPDATE planos SET ativo = 0 WHERE id = ?').run(id);

      res.json({ message: 'Plano desativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar plano' });
    }
  }
}
