import { Request, Response } from 'express';
import { getTenantDb } from '../database/tenant';
import { getAuthContext } from '../middleware/auth';
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionarios = tenantDb.prepare(`
        SELECT id, nome, cpf, email, telefone, cargo, ativo, created_at, updated_at 
        FROM funcionarios 
        WHERE empresa_id = ?
        ORDER BY nome
      `).all(auth.empresaId);
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionario = tenantDb.prepare(`
        SELECT id, nome, cpf, email, telefone, cargo, ativo, created_at, updated_at 
        FROM funcionarios 
        WHERE id = ? AND empresa_id = ?
      `).get(id, auth.empresaId);
      
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
      const { nome, cpf, email, telefone, cargo, senha, empresa_id } = req.body;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!nome || !cpf) {
        return res.status(400).json({ error: 'Nome e CPF são obrigatórios' });
      }

      // Verificar se CPF já existe
      const tenantDb = getTenantDb(auth.empresaId);
      const cpfExistente = tenantDb
        .prepare('SELECT id FROM funcionarios WHERE cpf = ? AND empresa_id = ?')
        .get(cpf, auth.empresaId);
      if (cpfExistente) {
        return res.status(400).json({ error: 'CPF já cadastrado' });
      }

      const senhaHash = senha ? hashSenha(senha) : null;

      const result = tenantDb.prepare(`
        INSERT INTO funcionarios (empresa_id, nome, cpf, email, telefone, cargo, senha)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(auth.empresaId, nome, cpf, email, telefone, cargo || 'Operador de Caixa', senhaHash);

      res.status(201).json({
        id: result.lastInsertRowid,
        empresa_id: auth.empresaId,
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
      const { nome, cpf, email, telefone, cargo, ativo, senha, empresa_id } = req.body;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionario = tenantDb
        .prepare('SELECT id FROM funcionarios WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      const senhaHash = senha ? hashSenha(senha) : null;

      if (senhaHash) {
        tenantDb.prepare(`
          UPDATE funcionarios 
          SET nome = ?, cpf = ?, email = ?, telefone = ?, cargo = ?, ativo = ?, senha = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND empresa_id = ?
        `).run(nome, cpf, email, telefone, cargo, ativo !== undefined ? ativo : 1, senhaHash, id, auth.empresaId);
      } else {
        tenantDb.prepare(`
          UPDATE funcionarios 
          SET nome = ?, cpf = ?, email = ?, telefone = ?, cargo = ?, ativo = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ? AND empresa_id = ?
        `).run(nome, cpf, email, telefone, cargo, ativo !== undefined ? ativo : 1, id, auth.empresaId);
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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionario = tenantDb
        .prepare('SELECT id FROM funcionarios WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      // Soft delete - apenas desativa
      tenantDb
        .prepare('UPDATE funcionarios SET ativo = 0 WHERE id = ? AND empresa_id = ?')
        .run(id, auth.empresaId);

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
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      const { empresa_id } = req.query as { empresa_id?: string };
      if (empresa_id && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionario = tenantDb
        .prepare('SELECT id FROM funcionarios WHERE id = ? AND empresa_id = ?')
        .get(id, auth.empresaId);
      if (!funcionario) {
        return res.status(404).json({ error: 'Funcionário não encontrado' });
      }

      tenantDb
        .prepare('UPDATE funcionarios SET ativo = 1 WHERE id = ? AND empresa_id = ?')
        .run(id, auth.empresaId);

      res.json({ message: 'Funcionário ativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao ativar funcionário' });
    }
  }

  // Login de funcionário
  static login(req: Request, res: Response) {
    try {
      const { usuario, senha, empresa_id } = req.body;
      const auth = getAuthContext(req);
      if (!auth) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }
      if (empresa_id !== undefined && Number(empresa_id) !== auth.empresaId) {
        return res.status(403).json({ error: 'Empresa inválida' });
      }

      if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }

      const tenantDb = getTenantDb(auth.empresaId);
      const funcionario: any = tenantDb.prepare(`
        SELECT * FROM funcionarios
        WHERE (cpf = ? OR email = ? OR nome = ?) AND ativo = 1 AND empresa_id = ?
      `).get(usuario, usuario, usuario, auth.empresaId);

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
