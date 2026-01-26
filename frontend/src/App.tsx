import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PDV from './pages/PDV';
import Produtos from './pages/Produtos';
import Vendas from './pages/Vendas';
import Clientes from './pages/Clientes';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <aside className="sidebar">
          <h1>Sistema PDV</h1>
          <nav>
            <Link to="/">🛒 Caixa (PDV)</Link>
            <Link to="/produtos">📦 Produtos</Link>
            <Link to="/vendas">💰 Vendas</Link>
            <Link to="/clientes">👥 Clientes</Link>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<PDV />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/vendas" element={<Vendas />} />
            <Route path="/clientes" element={<Clientes />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
