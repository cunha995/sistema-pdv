import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { setAuthItem } from '../services/authStorage';
import './Login.css';

interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    empresa_id: number;
    empresa_nome: string;
    tipo: string;
    is_demo: boolean;
    demo_expira_em: string | null;
  };
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [empresaId, setEmpresaId] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const empresaIdNum = empresaId ? Number(empresaId) : undefined;
      const data = await api.auth.login(email, senha, empresaIdNum);

      // Salvar dados no storage da sessao
      setAuthItem('token', data.token);
      setAuthItem('usuario', JSON.stringify(data.usuario));

      // Redirecionar para o dashboard
      navigate('/admin');
    } catch (error: any) {
      console.error('Erro:', error);
      if (error?.message?.includes('Conta demo expirada')) {
        setErro('Sua conta demo expirou. Entre em contato para contratar um plano.');
      } else {
        setErro(error?.message || 'Erro ao conectar com o servidor');
      }
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <div className="login-visual">
          <span className="visual-badge">Painel Administrador</span>
          <h2>Controle total do seu PDV</h2>
          <p>
            Acesse métricas, gerencie empresas e acompanhe planos com uma
            experiência premium e segura.
          </p>
          <div className="visual-metrics">
            <div className="metric">
              <strong>99,9%</strong>
              <span>Disponibilidade</span>
            </div>
            <div className="metric">
              <strong>24/7</strong>
              <span>Monitoramento</span>
            </div>
            <div className="metric">
              <strong>+120</strong>
              <span>Empresas</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-brand">
            <div className="brand-icon brand-icon-photo" />
            <div className="brand-text">
              <h1>PDV Master</h1>
              <p>Acesso Administrativo</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Usuário ou Email</label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario ou email"
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="empresaId">ID da Empresa (obrigatorio se usar usuario)</label>
              <input
                type="number"
                id="empresaId"
                value={empresaId}
                onChange={(e) => setEmpresaId(e.target.value)}
                placeholder="Ex: 2"
                min="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <div className="password-field">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  id="senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarSenha((prev) => !prev)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {erro && (
              <div className="erro-mensagem">
                {erro}
              </div>
            )}

            <button type="submit" className="btn-login" disabled={carregando}>
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="login-footer">
            <p>Ainda não tem uma conta?</p>
            <span>Solicite uma conta demo</span>
            <a
              href="https://wa.me/44998840934"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-link"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
//.