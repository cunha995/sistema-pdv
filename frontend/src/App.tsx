import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import { getTokenFromStorage } from './services/authStorage';

import Dashboard from './pages/Dashboard';
import PDV from './pages/PDV';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Clientes from './pages/Clientes';
import Mesas from './pages/Mesas';
import PainelMesa from './pages/PainelMesa';
import PedidosMesas from './pages/PedidosMesas';
import Delivery from './pages/Delivery';
import Estoque from './pages/Estoque';
import Config from './pages/Config';
import Master from './pages/Master';
import Login from './pages/Login';

// Componente de proteção de rotas
function RotaProtegida({ children }: { children: React.ReactNode }) {
  const token = getTokenFromStorage();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona raiz para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Tela de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Painel Master (SaaS) - Aberto */}
        <Route path="/master" element={<Master />} />
        
        {/* Painel do administrador/atendente - Protegido */}
        <Route path="/admin" element={<RotaProtegida><Dashboard /></RotaProtegida>} />
        <Route path="/admin/pdv" element={<RotaProtegida><PDV /></RotaProtegida>} />
        <Route path="/admin/produtos" element={<RotaProtegida><Produtos /></RotaProtegida>} />
        <Route path="/admin/vendas" element={<RotaProtegida><Vendas /></RotaProtegida>} />
        <Route path="/admin/clientes" element={<RotaProtegida><Clientes /></RotaProtegida>} />
        <Route path="/admin/mesas" element={<RotaProtegida><Mesas /></RotaProtegida>} />
        <Route path="/admin/pedidos-mesas" element={<RotaProtegida><PedidosMesas /></RotaProtegida>} />
        <Route path="/admin/delivery" element={<RotaProtegida><Delivery /></RotaProtegida>} />
        <Route path="/admin/estoque" element={<RotaProtegida><Estoque /></RotaProtegida>} />
        <Route path="/admin/config" element={<RotaProtegida><Config /></RotaProtegida>} />
        
        {/* Painel do cliente - Aberto */}
        <Route path="/mesa" element={<Mesas />} />
        <Route path="/mesa/:id" element={<PainelMesa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
