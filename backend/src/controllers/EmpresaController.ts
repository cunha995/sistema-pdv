import { Request, Response } from 'express';
import { db } from '../database';
import { getTenantDb } from '../database/tenant';

export class EmpresaController {
  // Listar todas as empresas
  static listar(req: Request, res: Response) {
    try {
      const empresas = db.prepare(`
        SELECT 
          e.id, e.nome, e.cnpj, e.email, e.telefone, e.endereco,
          e.contato_nome, e.contato_email, e.contato_telefone,
          e.plano_id, e.data_contratacao, e.data_renovacao, e.ativo,
          e.total_vendas, e.quantidade_vendas,
          p.nome as plano_nome, p.preco_mensal
        FROM empresas e
        LEFT JOIN planos p ON e.plano_id = p.id
        WHERE e.ativo = 1
        ORDER BY e.nome
      `).all();
      res.json(empresas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  // Buscar empresa por ID
  static buscar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const empresa = db.prepare(`
        SELECT 
          e.id, e.nome, e.cnpj, e.email, e.telefone, e.endereco,
          e.contato_nome, e.contato_email, e.contato_telefone,
          e.plano_id, e.data_contratacao, e.data_renovacao, e.ativo,
          e.total_vendas, e.quantidade_vendas,
          p.nome as plano_nome, p.preco_mensal
        FROM empresas e
        LEFT JOIN planos p ON e.plano_id = p.id
        WHERE e.id = ?
      `).get(id);
      
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }
      
      res.json(empresa);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar empresa' });
    }
  }

  // Criar nova empresa
  static criar(req: Request, res: Response) {
    try {
      const { 
        nome, cnpj, email, telefone, endereco,
        contato_nome, contato_email, contato_telefone, plano_id 
      } = req.body;

      if (!nome || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
      }

      const emailExistente = db.prepare('SELECT id FROM empresas WHERE email = ?').get(email);
      if (emailExistente) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      const result = db.prepare(`
        INSERT INTO empresas (
          nome, cnpj, email, telefone, endereco,
          contato_nome, contato_email, contato_telefone, plano_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        nome, cnpj, email, telefone, endereco,
        contato_nome, contato_email, contato_telefone, plano_id || 1
      );

      const empresaId = Number(result.lastInsertRowid);
      getTenantDb(empresaId);

      res.status(201).json({
        id: empresaId,
        nome,
        email,
        plano_id: plano_id || 1,
        ativo: 1
      });
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email ou CNPJ já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }

  // Atualizar empresa
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const {
        nome, cnpj, email, telefone, endereco,
        contato_nome, contato_email, contato_telefone, plano_id, ativo
      } = req.body;

      const empresa = db.prepare('SELECT id FROM empresas WHERE id = ?').get(id);
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      db.prepare(`
        UPDATE empresas 
        SET nome = ?, cnpj = ?, email = ?, telefone = ?, endereco = ?,
            contato_nome = ?, contato_email = ?, contato_telefone = ?,
            plano_id = ?, ativo = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        nome, cnpj, email, telefone, endereco,
        contato_nome, contato_email, contato_telefone,
        plano_id, ativo !== undefined ? ativo : 1, id
      );

      res.json({ message: 'Empresa atualizada com sucesso' });
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email ou CNPJ já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao atualizar empresa' });
    }
  }

  // Deletar empresa (desativar)
  static deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const empresa = db.prepare('SELECT id FROM empresas WHERE id = ?').get(id);
      if (!empresa) {
        return res.status(404).json({ error: 'Empresa não encontrada' });
      }

      db.prepare('UPDATE empresas SET ativo = 0 WHERE id = ?').run(id);

      res.json({ message: 'Empresa desativada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar empresa' });
    }
  }

  // Estatísticas da plataforma
  static estatisticas(req: Request, res: Response) {
    try {
      const totalEmpresas = (db.prepare('SELECT COUNT(*) as count FROM empresas WHERE ativo = 1').get() as any).count;
      const empresasAtivas = (db.prepare('SELECT COUNT(*) as count FROM empresas WHERE ativo = 1').get() as any).count;
      const totalVendas = (db.prepare('SELECT SUM(total_vendas) as sum FROM empresas').get() as any).sum || 0;
      const receita = (db.prepare('SELECT SUM(quantidade_vendas * preco_mensal) as sum FROM empresas e JOIN planos p ON e.plano_id = p.id').get() as any).sum || 0;

      res.json({
        totalEmpresas,
        empresasAtivas,
        totalVendas,
        receita: receita.toFixed(2)
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  }
}
