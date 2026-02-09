import { Request, Response, NextFunction } from 'express';
import { db } from '../database';

type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    empresa_id: number;
    tipo: string;
    is_demo: number;
    demo_expira_em?: string | null;
  };
};

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : '';

    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [usuarioId, empresaId] = decoded.split(':');

    if (!usuarioId || !empresaId) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const usuario: any = db.prepare(`
      SELECT u.id, u.empresa_id, u.tipo, u.is_demo, u.demo_expira_em, u.ativo, e.ativo as empresa_ativa
      FROM usuarios u
      JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = ? AND u.empresa_id = ? AND u.ativo = 1
    `).get(usuarioId, empresaId);

    if (!usuario || !usuario.empresa_ativa) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (usuario.is_demo && usuario.demo_expira_em) {
      const agora = new Date();
      const expiracao = new Date(usuario.demo_expira_em);
      if (agora > expiracao) {
        return res.status(403).json({ error: 'Conta demo expirada', demo_expirada: true });
      }
    }

    req.user = {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      tipo: usuario.tipo,
      is_demo: usuario.is_demo,
      demo_expira_em: usuario.demo_expira_em
    };

    if (req.body && typeof req.body === 'object') {
      req.body.empresa_id = usuario.empresa_id;
    }

    if (req.query && typeof req.query === 'object') {
      (req.query as any).empresa_id = String(usuario.empresa_id);
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};