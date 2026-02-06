import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Venda } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface FechamentoCaixa {
  id: number;
  operador_nome: string;
  operador_tipo: string;
  valor_abertura: number;
  recebiveis: number;
  dinheiro: number;
  cartao: number;
  pix: number;
  created_at: string;
}

const Vendas: React.FC = () => {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [fechamentos, setFechamentos] = useState<FechamentoCaixa[]>([]);

  useEffect(() => {
    carregarVendas();
    carregarFechamentos();
  }, []);

  const carregarVendas = async () => {
    const data = await api.vendas.listar();
    setVendas(data);
  };

  const carregarFechamentos = async () => {
    const data = await api.caixa.listarFechamentos();
    setFechamentos(data || []);
  };

  const gerarPdfFechamentos = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Relatorio de Fechamentos de Caixa', 14, 16);

    const linhas = fechamentos.map((f) => ([
      formatarData(f.created_at),
      f.operador_nome,
      f.operador_tipo,
      `R$ ${Number(f.valor_abertura || 0).toFixed(2)}`,
      `R$ ${Number(f.recebiveis || 0).toFixed(2)}`,
      `R$ ${Number(f.dinheiro || 0).toFixed(2)}`,
      `R$ ${Number(f.cartao || 0).toFixed(2)}`,
      `R$ ${Number(f.pix || 0).toFixed(2)}`
    ]));

    autoTable(doc, {
      head: [[
        'Data', 'Operador', 'Tipo', 'Abertura', 'Recebiveis', 'Dinheiro', 'Cartao', 'PIX'
      ]],
      body: linhas,
      startY: 24,
      styles: { fontSize: 9 }
    });

    doc.save('fechamentos-caixa.pdf');
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

      <div className="card mt-20">
        <div className="flex-between mb-20">
          <h2>Fechamentos de Caixa por Funcionário</h2>
          <button className="btn btn-primary" onClick={gerarPdfFechamentos}>
            Gerar PDF
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Operador</th>
              <th>Tipo</th>
              <th>Abertura</th>
              <th>Recebíveis</th>
              <th>Dinheiro</th>
              <th>Cartão</th>
              <th>PIX</th>
            </tr>
          </thead>
          <tbody>
            {fechamentos.map((f) => (
              <tr key={f.id}>
                <td>{formatarData(f.created_at)}</td>
                <td>{f.operador_nome}</td>
                <td>{f.operador_tipo}</td>
                <td>R$ {Number(f.valor_abertura || 0).toFixed(2)}</td>
                <td>R$ {Number(f.recebiveis || 0).toFixed(2)}</td>
                <td>R$ {Number(f.dinheiro || 0).toFixed(2)}</td>
                <td>R$ {Number(f.cartao || 0).toFixed(2)}</td>
                <td>R$ {Number(f.pix || 0).toFixed(2)}</td>
              </tr>
            ))}
            {fechamentos.length === 0 && (
              <tr>
                <td colSpan={8}>Nenhum fechamento registrado</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Vendas;
