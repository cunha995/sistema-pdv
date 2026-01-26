import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Venda } from '../types';

const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    const data = await api.vendas.listar();
    setVendas(data);
  };

  const verDetalhes = async (id: number) => {
    const venda = await api.vendas.buscar(id);
    setVendaSelecionada(venda);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  return (
    <div>
      <h1 className="mb-20">Histórico de Vendas</h1>

      <div className="card">
        <h2>Vendas Realizadas</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Pagamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda: any) => (
              <tr key={venda.id}>
                <td>#{venda.id}</td>
                <td>{formatarData(venda.created_at)}</td>
                <td>{venda.cliente_nome || 'Sem cadastro'}</td>
                <td>R$ {venda.total.toFixed(2)}</td>
                <td>{venda.metodo_pagamento || '-'}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => verDetalhes(venda.id)}>
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {vendaSelecionada && (
        <div className="card mt-20">
          <div className="flex-between mb-20">
            <h2>Detalhes da Venda #{vendaSelecionada.id}</h2>
            <button className="btn btn-secondary" onClick={() => setVendaSelecionada(null)}>
              Fechar
            </button>
          </div>

          <div className="grid-2 mb-20">
            <div>
              <p><strong>Data:</strong> {formatarData(vendaSelecionada.created_at!)}</p>
              <p><strong>Cliente:</strong> {vendaSelecionada.cliente_nome || 'Sem cadastro'}</p>
            </div>
            <div>
              <p><strong>Método de Pagamento:</strong> {vendaSelecionada.metodo_pagamento || '-'}</p>
              <p><strong>Total:</strong> R$ {vendaSelecionada.total.toFixed(2)}</p>
            </div>
          </div>

          <h3>Itens da Venda</h3>
          <table>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Preço Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {vendaSelecionada.itens?.map((item) => (
                <tr key={item.id}>
                  <td>{item.produto_nome}</td>
                  <td>{item.quantidade}</td>
                  <td>R$ {item.preco_unitario.toFixed(2)}</td>
                  <td>R$ {item.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Vendas;
