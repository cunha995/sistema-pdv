
import React from 'react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-main">
      {/* Topo com título e ícones */}
      <div className="dashboard-topbar">
        <div className="dashboard-title-area">
          <div className="dashboard-title-app">Meu sistema PDV</div>
          <div className="dashboard-icons">
            <span title="Atualizar">🔄</span>
            <span title="Visão">👁️</span>
            <span title="Configurações">⚙️</span>
          </div>
        </div>
        <div className="dashboard-user">Administrador</div>
      </div>

      {/* Cards resumo */}
      <div className="dashboard-cards">
        <div className="dashboard-card dashboard-card-vendas">
          <div className="dashboard-card-title">Vendas</div>
          <div className="dashboard-card-value">R$ 3216,50</div>
          <div className="dashboard-card-desc">Hoje - 30 vendas realizadas</div>
        </div>
        <div className="dashboard-card dashboard-card-caixa">
          <div className="dashboard-card-title">Totais em caixa</div>
          <div className="dashboard-card-value">R$ 5238,25</div>
          <div className="dashboard-card-desc">04/07/2024 08:00</div>
        </div>
      </div>

      {/* Menu ícones principais */}
      <div className="dashboard-menu">
        <a className="dashboard-menu-item" href="/admin/pdv"><span role="img" aria-label="Caixa">🛒</span><span>Caixa</span></a>
        <a className="dashboard-menu-item" href="/admin/mesas"><span role="img" aria-label="Mesas">🍽️</span><span>Mesas</span></a>
        <a className="dashboard-menu-item" href="/admin/delivery"><span role="img" aria-label="Delivery">🚚</span><span>Delivery</span></a>
        <a className="dashboard-menu-item" href="/admin/estoque"><span role="img" aria-label="Estoque">📦</span><span>Estoque</span></a>
        <a className="dashboard-menu-item" href="/admin/produtos"><span role="img" aria-label="Produtos">📋</span><span>Produtos</span></a>
        <a className="dashboard-menu-item" href="/admin/clientes"><span role="img" aria-label="Clientes">👤</span><span>Cliente</span></a>
        <a className="dashboard-menu-item" href="/admin/vendas"><span role="img" aria-label="Relatórios">📊</span><span>Relatório</span></a>
        <a className="dashboard-menu-item" href="/admin/config"><span role="img" aria-label="Configurações">⚙️</span><span>Configuração</span></a>
      </div>

      {/* Painel de alertas */}
      <div className="dashboard-alerts">
        <div className="dashboard-alerts-title">
          <span className="dashboard-alerts-icon">🔔</span>
          <span>Alertas</span>
          <span className="dashboard-alerts-badge">3</span>
        </div>
        <ul className="dashboard-alerts-list">
          <li><span className="dot dot-blue"></span> Estoque mínimo <strong>10 Produtos</strong></li>
          <li><span className="dot dot-blue"></span> Notas pendentes <strong>2 Notas</strong></li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
