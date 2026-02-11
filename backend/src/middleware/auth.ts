import { NextFunction, Request, Response } from 'express';
import { db } from '../database';

type AuthContext = {
  usuarioId: number;
  empresaId: number;
};

const GRACE_DAYS = 2;

const isEmpresaInadimplente = (dataRenovacao?: string | null) => {
  if (!dataRenovacao) return false;
  const vencimento = new Date(dataRenovacao);
  if (Number.isNaN(vencimento.getTime())) return false;
  const limite = new Date(vencimento);
  limite.setDate(limite.getDate() + GRACE_DAYS + 1);
  limite.setHours(0, 0, 0, 0);
  return new Date() >= limite;
};

const parseAuthToken = (req: Request): AuthContext | null => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parts = decoded.split(':');
    const usuarioId = Number(parts[0]);
    const empresaId = Number(parts[1]);
    if (!Number.isFinite(usuarioId) || !Number.isFinite(empresaId)) {
      return null;
    }
    return { usuarioId, empresaId };
  } catch {
    return null;
  }
};

export const getAuthContext = (req: Request): AuthContext | null => {
  const cached = (req as any)?.user;
  if (cached?.id && cached?.empresa_id) {
    return { usuarioId: Number(cached.id), empresaId: Number(cached.empresa_id) };
  }
  return parseAuthToken(req);
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = parseAuthToken(req);
    if (!auth) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const usuario: any = db.prepare(`
      SELECT u.*, e.ativo as empresa_ativa, e.data_renovacao as data_renovacao
      FROM usuarios u
      JOIN empresas e ON u.empresa_id = e.id
      WHERE u.id = ? AND u.empresa_id = ? AND u.ativo = 1
    `).get(auth.usuarioId, auth.empresaId);

    if (!usuario || !usuario.empresa_ativa) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (isEmpresaInadimplente(usuario.data_renovacao)) {
      return res.status(403).json({
        error: 'Mensalidade vencida. Entre em contato com o suporte.',
        pagamento_atrasado: true,
        data_vencimento: usuario.data_renovacao
      });
    }

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

    (req as any).user = {
      id: usuario.id,
      empresa_id: usuario.empresa_id,
      tipo: usuario.tipo,
      is_demo: usuario.is_demo,
      demo_expira_em: usuario.demo_expira_em
    };

    return next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: 'Token inválido' });
  }
};
