import { Request, Response } from 'express';
import { db } from '../database';
import crypto from 'crypto';

// Função simples de hash (em produção, use bcrypt)
function hashSenha(senha: string): string {
  return crypto.createHash('sha256').update(senha).digest('hex');
}

// Gerar token simples (em produção, use JWT)
function gerarToken(usuarioId: number, empresaId: number): string {
  const payload = `${usuarioId}:${empresaId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

export class AuthController {
  // Login
  static login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
      }

      // Buscar usuário
      const usuario: any = db.prepare(`
        SELECT u.*, e.nome as empresa_nome, e.ativo as empresa_ativa
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        WHERE (u.email = ? OR u.nome = ?) AND u.ativo = 1
      `).get(email, email);

      if (!usuario) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Verificar empresa ativa
      if (!usuario.empresa_ativa) {
        return res.status(403).json({ error: 'Empresa desativada. Entre em contato com o suporte.' });
      }

      // Verificar se é demo expirada
      if (usuario.is_demo && usuario.demo_expira_em) {
        const agora = new Date();
        const expiracao = new Date(usuario.demo_expira_em);
        
        if (agora > expiracao) {
          return res.status(403).json({ 
            error: 'Conta demo expirada',
            demo_expirada: true
          });
        }
      }

      // Verificar senha
      const senhaHash = hashSenha(senha);
      if (usuario.senha !== senhaHash) {
        return res.status(401).json({ error: 'Credenciais inválidas' });
      }

      // Gerar token
      const token = gerarToken(usuario.id, usuario.empresa_id);

      res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          empresa_id: usuario.empresa_id,
          empresa_nome: usuario.empresa_nome,
          tipo: usuario.tipo,
          is_demo: usuario.is_demo,
          demo_expira_em: usuario.demo_expira_em
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Criar usuário para empresa (chamado do painel master)
  static criarUsuario(req: Request, res: Response) {
    try {
      const { empresa_id, nome, email, senha, tipo, is_demo, duracao_demo_minutos } = req.body;

      if (!empresa_id || !nome || !email || !senha) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando' });
      }

      // Verificar se email já existe
      const emailExiste = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
      if (emailExiste) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Hash da senha
      const senhaHash = hashSenha(senha);

      // Calcular data de expiração se for demo
      let demoExpiraEm = null;
      if (is_demo && duracao_demo_minutos) {
        const expiracao = new Date();
        expiracao.setMinutes(expiracao.getMinutes() + duracao_demo_minutos);
        demoExpiraEm = expiracao.toISOString();
      }

      // Inserir usuário
      const result = db.prepare(`
        INSERT INTO usuarios (empresa_id, nome, email, senha, tipo, is_demo, demo_expira_em)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(empresa_id, nome, email, senhaHash, tipo || 'admin', is_demo ? 1 : 0, demoExpiraEm);

      res.status(201).json({
        id: result.lastInsertRowid,
        nome,
        email,
        empresa_id,
        tipo: tipo || 'admin',
        is_demo: is_demo ? 1 : 0,
        demo_expira_em: demoExpiraEm
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  // Listar usuários de uma empresa
  static listarUsuarios(req: Request, res: Response) {
    try {
      const { empresa_id } = req.params;

      const usuarios = db.prepare(`
        SELECT id, empresa_id, nome, email, tipo, is_demo, demo_expira_em, ativo, created_at
        FROM usuarios
        WHERE empresa_id = ?
        ORDER BY created_at DESC
      `).all(empresa_id);

      res.json(usuarios);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  // Deletar usuário
  static deletarUsuario(req: Request, res: Response) {
    try {
      const { id } = req.params;

      db.prepare('UPDATE usuarios SET ativo = 0 WHERE id = ?').run(id);

      res.json({ message: 'Usuário desativado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }

  // Verificar status do token (middleware)
  static verificarToken(req: Request, res: Response) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
      }

      // Decodificar token
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [usuarioId, empresaId] = decoded.split(':');

      // Buscar usuário
      const usuario: any = db.prepare(`
        SELECT u.*, e.ativo as empresa_ativa
        FROM usuarios u
        JOIN empresas e ON u.empresa_id = e.id
        WHERE u.id = ? AND u.empresa_id = ? AND u.ativo = 1
      `).get(usuarioId, empresaId);

      if (!usuario || !usuario.empresa_ativa) {
        return res.status(401).json({ error: 'Token inválido' });
      }

      // Verificar demo expirada
      if (usuario.is_demo && usuario.demo_expira_em) {
        const agora = new Date();
        const expiracao = new Date(usuario.demo_expira_em);
        
        if (agora > expiracao) {
          return res.status(403).json({ 
            error: 'Conta demo expirada',
            demo_expirada: true
          });
        }
      }

      res.json({
        valido: true,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          empresa_id: usuario.empresa_id,
          tipo: usuario.tipo,
          is_demo: usuario.is_demo,
          demo_expira_em: usuario.demo_expira_em
        }
      });
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Token inválido' });
    }
  }
}
