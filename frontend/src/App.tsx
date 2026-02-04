import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';

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
import { Navigate } from 'react-router-dom';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redireciona raiz para /admin */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        {/* Painel Master (SaaS) */}
        <Route path="/master" element={<Master />} />
        {/* Painel do administrador/atendente */}
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/pdv" element={<PDV />} />
        <Route path="/admin/produtos" element={<Produtos />} />
        <Route path="/admin/vendas" element={<Vendas />} />
        <Route path="/admin/clientes" element={<Clientes />} />
        <Route path="/admin/mesas" element={<Mesas />} />
        <Route path="/admin/pedidos-mesas" element={<PedidosMesas />} />
        <Route path="/admin/delivery" element={<Delivery />} />
        <Route path="/admin/estoque" element={<Estoque />} />
        <Route path="/admin/config" element={<Config />} />
        {/* Painel do cliente */}
        <Route path="/mesa" element={<Mesas />} />
        <Route path="/mesa/:id" element={<PainelMesa />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
