
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { clearAuth, getUsuarioFromStorage } from '../services/authStorage';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vendasHoje, setVendasHoje] = useState({ total: 0, quantidade: 0 });
  const [totalCaixa, setTotalCaixa] = useState(0);
  const [produtosAtivos, setProdutosAtivos] = useState(0);
  const [estoqueBaixo, setEstoqueBaixo] = useState(0);
  const [clientesTotal, setClientesTotal] = useState(0);
  const navigate = useNavigate();

  // Pegar informações do usuário
  const usuario = getUsuarioFromStorage();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        if (usuario?.empresa_id) {
          const vendasRaw = await api.vendas.listar(usuario.empresa_id);
          const vendas = (vendasRaw || []).filter((v: any) => v.empresa_id === usuario.empresa_id);
          const hoje = new Date().toLocaleDateString('pt-BR');
          const vendasDeHoje = vendas.filter((v: any) => {
            const dataVenda = new Date(v.created_at).toLocaleDateString('pt-BR');
            return dataVenda === hoje;
          });
          const totalHoje = vendasDeHoje.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
          const totalGeral = vendas.reduce((sum: number, v: any) => sum + (v.total || 0), 0);
          setVendasHoje({ total: totalHoje, quantidade: vendasDeHoje.length });
          setTotalCaixa(totalGeral);

          const produtos = await api.produtos.listar(usuario.empresa_id);
          setProdutosAtivos(produtos.length);
          setEstoqueBaixo(produtos.filter((p: any) => p.estoque <= 10).length);

          const clientes = await api.clientes.listar(usuario.empresa_id);
          setClientesTotal(clientes.length);
        }
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      }
    };

    carregarDados();
    const interval = setInterval(carregarDados, 10000);
    return () => clearInterval(interval);
  }, [usuario?.empresa_id]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      {/* Hero Header */}
      <div className="dashboard-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-welcome">
            <h1 className="hero-title">
              <span className="wave">👋</span>
              Bem-vindo, {usuario?.nome || 'Usuário'}
            </h1>
            <p className="hero-subtitle">
              {usuario?.empresa_nome || 'Sistema PDV'} 
              {usuario?.is_demo && <span className="badge-demo">DEMO</span>}
            </p>
          </div>
          <div className="hero-actions">
            <div className="hero-time">
              <div className="time-display">{formatTime(currentTime)}</div>
              <div className="date-display">{formatDate(currentTime)}</div>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card stat-vendas">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-label">Vendas Hoje</div>
              <div className="stat-value">R$ {vendasHoje.total.toFixed(2)}</div>
              <div className="stat-detail">
                <span className="stat-badge success">Hoje</span>
                <span className="stat-text">{vendasHoje.quantidade} vendas realizadas</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-caixa">
            <div className="stat-icon">💵</div>
            <div className="stat-info">
              <div className="stat-label">Total em Caixa</div>
              <div className="stat-value">R$ {totalCaixa.toFixed(2)}</div>
              <div className="stat-detail">
                <span className="stat-badge info">Atualizado</span>
                <span className="stat-text">{formatDate(new Date())} {formatTime(currentTime)}</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-produtos">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-label">Produtos Ativos</div>
              <div className="stat-value">{produtosAtivos}</div>
              <div className="stat-detail">
                <span className="stat-badge warning">{estoqueBaixo} baixos</span>
                <span className="stat-text">estoque crítico</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-clientes">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <div className="stat-label">Clientes</div>
              <div className="stat-value">{clientesTotal}</div>
              <div className="stat-detail">
                <span className="stat-badge success">Total</span>
                <span className="stat-text">clientes cadastrados</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2 className="section-title">
            <span className="title-icon">⚡</span>
            Ações Rápidas
          </h2>
          <div className="quick-actions-grid">
            <a href="/admin/pdv" className="action-card action-primary">
              <div className="action-icon">🛒</div>
              <div className="action-content">
                <h3>Caixa</h3>
                <p>Iniciar venda</p>
              </div>
              <div className="action-arrow">→</div>
            </a>

            <a href="/admin/mesas" className="action-card action-purple">
              <div className="action-icon">🍽️</div>
              <div className="action-content">
                <h3>Mesas</h3>
                <p>Gerenciar pedidos</p>
              </div>
              <div className="action-arrow">→</div>
            </a>

            <a href="/admin/delivery" className="action-card action-orange">
              <div className="action-icon">🚚</div>
              <div className="action-content">
                <h3>Delivery</h3>
                <p>Entregas pendentes</p>
              </div>
              <div className="action-arrow">→</div>
            </a>

            <a href="/admin/estoque" className="action-card action-teal">
              <div className="action-icon">📦</div>
              <div className="action-content">
                <h3>Estoque</h3>
                <p>Controlar produtos</p>
              </div>
              <div className="action-arrow">→</div>
            </a>
          </div>
        </div>

        {/* Management Grid */}
        <div className="management-section">
          <h2 className="section-title">
            <span className="title-icon">🎯</span>
            Gerenciamento
          </h2>
          <div className="management-grid">
            <a href="/admin/produtos" className="mgmt-card">
              <div className="mgmt-icon">📋</div>
              <h3>Produtos</h3>
              <p>Cadastro e edição</p>
            </a>

            <a href="/admin/clientes" className="mgmt-card">
              <div className="mgmt-icon">👤</div>
              <h3>Clientes</h3>
              <p>Base de clientes</p>
            </a>

            <a href="/admin/vendas" className="mgmt-card">
              <div className="mgmt-icon">📊</div>
              <h3>Relatórios</h3>
              <p>Análises e dados</p>
            </a>

            <a href="/admin/config" className="mgmt-card">
              <div className="mgmt-icon">⚙️</div>
              <h3>Configurações</h3>
              <p>Sistema e perfil</p>
            </a>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="alerts-section">
          <div className="alerts-header">
            <h2 className="section-title">
              <span className="title-icon">🔔</span>
              Notificações
            </h2>
            <span className="alerts-count">3</span>
          </div>
          <div className="alerts-list">
            <div className="alert-item alert-warning">
              <div className="alert-icon">⚠️</div>
              <div className="alert-content">
                <h4>Estoque Baixo</h4>
                <p>10 produtos estão com estoque crítico</p>
              </div>
              <div className="alert-time">Agora</div>
            </div>

            <div className="alert-item alert-info">
              <div className="alert-icon">📝</div>
              <div className="alert-content">
                <h4>Notas Pendentes</h4>
                <p>2 notas fiscais aguardando emissão</p>
              </div>
              <div className="alert-time">2h atrás</div>
            </div>

            <div className="alert-item alert-success">
              <div className="alert-icon">✅</div>
              <div className="alert-content">
                <h4>Meta Atingida</h4>
                <p>Vendas do dia ultrapassaram a meta!</p>
              </div>
              <div className="alert-time">5h atrás</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
