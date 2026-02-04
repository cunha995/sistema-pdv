import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.demo_expirada) {
          setErro('Sua conta demo expirou. Entre em contato para contratar um plano.');
        } else {
          setErro(data.error || 'Erro ao fazer login');
        }
        setCarregando(false);
        return;
      }

      // Salvar dados no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Redirecionar para o dashboard
      navigate('/admin');
    } catch (error) {
      console.error('Erro:', error);
      setErro('Erro ao conectar com o servidor');
      setCarregando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Sistema PDV</h1>
          <p>Faça login para acessar o painel</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
            />
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
          <a href="/master">Solicite uma conta demo</a>
        </div>
      </div>
    </div>
  );
}
