import { Request, Response } from 'express';
import { db } from '../database';
import crypto from 'crypto';

function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

function isSha256Hash(value?: string) {
  return !!value && /^[a-f0-9]{64}$/i.test(value);
}

export class FuncionarioController {
  // Listar todos os funcionários
  static listar(req: Request, res: Response) {
    try {
      const funcionarios = db.prepare(`
        SELECT id, nome, cpf, email, telefone, cargo, ativo, created_at, updated_at 
        FROM funcionarios 
        ORDER BY nome
      `).all();
      res.json(funcionarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar funcionários' });
    }
  }

  // Buscar funcionário por ID
  static buscar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const funcionario = db.prepare(`
        SELECT id, nome, cpf, email, telefone, cargo, ativo, created_at, updated_at 
        FROM funcionarios 
        WHERE id = ?
      `).get(id);
      
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }
      
      res.json(funcionario);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar funcionário' });
    }
  }

  // Criar novo funcionário
  static criar(req: Request, res: Response) {
    try {
      const { nome, cpf, email, telefone, cargo, senha } = req.body;

      if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
      }

      // Verificar se CPF já existe
      const cpfExistente = db.prepare('SELECT id FROM funcionarios WHERE cpf = ?').get(cpf);
      if (cpfExistente) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }

      const senhaHash = senha ? hashSenha(senha) : null;

      const result = db.prepare(`
        INSERT INTO funcionarios (nome, cpf, email, telefone, cargo, senha)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(nome, cpf, email, telefone, cargo || 'Operador de Caixa', senhaHash);

      res.status(201).json({
        id: result.lastInsertRowid,
        nome,
        cpf,
        email,
        telefone,
        cargo: cargo || 'Operador de Caixa',
        ativo: 1
      });
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }
      res.status(500).json({ error: 'Erro ao criar funcionário' });
    }
  }

  // Atualizar funcionário
  static atualizar(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome, cpf, email, telefone, cargo, ativo, senha } = req.body;

      const funcionario = db.prepare('SELECT id FROM funcionarios WHERE id = ?').get(id);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      const senhaHash = senha ? hashSenha(senha) : null;

      if (senhaHash) {
        db.prepare(`
          UPDATE funcionarios 
          SET nome = ?, cpf = ?, email = ?, telefone = ?, cargo = ?, ativo = ?, senha = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(nome, cpf, email, telefone, cargo, ativo !== undefined ? ativo : 1, senhaHash, id);
      } else {
        db.prepare(`
          UPDATE funcionarios 
          SET nome = ?, cpf = ?, email = ?, telefone = ?, cargo = ?, ativo = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(nome, cpf, email, telefone, cargo, ativo !== undefined ? ativo : 1, id);
      }

      res.json({ message: 'Funcionário atualizado com sucesso' });
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'CPF já cadastrado para outro funcionário' });
      }
      res.status(500).json({ error: 'Erro ao atualizar funcionário' });
    }
  }

  // Deletar funcionário (desativar)
  static deletar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const funcionario = db.prepare('SELECT id FROM funcionarios WHERE id = ?').get(id);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      // Soft delete - apenas desativa
      db.prepare('UPDATE funcionarios SET ativo = 0 WHERE id = ?').run(id);

      res.json({ message: 'Funcionário desativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar funcionário' });
    }
  }

  // Ativar funcionário
  static ativar(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const funcionario = db.prepare('SELECT id FROM funcionarios WHERE id = ?').get(id);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      db.prepare('UPDATE funcionarios SET ativo = 1 WHERE id = ?').run(id);

      res.json({ message: 'Funcionário ativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao ativar funcionário' });
    }
  }

  // Login de funcionário
  static login(req: Request, res: Response) {
    try {
      const { usuario, senha } = req.body;

      if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }

      const funcionario: any = db.prepare(`
        SELECT * FROM funcionarios
        WHERE (cpf = ? OR email = ? OR nome = ?) AND ativo = 1
      `).get(usuario, usuario, usuario);

      if (!funcionario || !funcionario.senha) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      const senhaHash = hashSenha(senha);
      const senhaValida = isSha256Hash(funcionario.senha)
        ? funcionario.senha === senhaHash
        : funcionario.senha === senha;

      if (!senhaValida) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      return res.json({
        funcionario: {
          id: funcionario.id,
          nome: funcionario.nome,
          cpf: funcionario.cpf,
          email: funcionario.email,
          telefone: funcionario.telefone,
          cargo: funcionario.cargo
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
}
