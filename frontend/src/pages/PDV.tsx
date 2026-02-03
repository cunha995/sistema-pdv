import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Produto, ItemVenda } from '../types';
import './PDV.css';

const PDV: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [mostrarMesas, setMostrarMesas] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [pedidosMesa, setPedidosMesa] = useState<any[]>([]);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const data = await api.produtos.listar();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const adicionarProduto = async (produto?: Produto) => {
    try {
      let produtoSelecionado = produto;

      if (!produtoSelecionado && codigoBarras) {
        produtoSelecionado = await api.produtos.buscarPorCodigo(codigoBarras);
      }

      if (!produtoSelecionado) {
        setMensagem('❌ Produto não encontrado!');
        setTimeout(() => setMensagem(''), 2000);
        return;
      }

      if (produtoSelecionado.estoque < quantidade) {
        setMensagem('❌ Estoque insuficiente!');
        setTimeout(() => setMensagem(''), 2000);
        return;
      }

      const itemExistente = carrinho.find(
        item => item.produto_id === produtoSelecionado!.id
      );

      if (itemExistente) {
        setCarrinho(
          carrinho.map(item =>
            item.produto_id === produtoSelecionado!.id
              ? {
                  ...item,
                  quantidade: item.quantidade + quantidade,
                  subtotal: (item.quantidade + quantidade) * item.preco_unitario
                }
              : item
          )
        );
      } else {
        setCarrinho([
          ...carrinho,
          {
            produto_id: produtoSelecionado.id!,
            produto_nome: produtoSelecionado.nome,
            quantidade,
            preco_unitario: produtoSelecionado.preco,
            subtotal: produtoSelecionado.preco * quantidade
          }
        ]);
      }

      setCodigoBarras('');
      setQuantidade(1);
      setMensagem('✓ Produto adicionado!');
      setTimeout(() => setMensagem(''), 1500);
    } catch (error) {
      setMensagem('❌ Erro ao adicionar produto!');
    }
  };

  const removerItem = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setCarrinho(
      carrinho.map(item =>
        item.produto_id === produtoId
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * item.preco_unitario
            }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.subtotal, 0);
  };

  const totalComDesconto = calcularTotal() - desconto;

  const carregarPedidosMesa = async (mesaId: number) => {
    try {
      const pedidos = await api.mesas.listarPedidos(mesaId);
      setPedidosMesa(pedidos);
      setMesaSelecionada(mesaId);
    } catch (error) {
      console.error('Erro ao carregar pedidos da mesa:', error);
      setMensagem('❌ Erro ao carregar pedidos da mesa!');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const fecharContaMesa = async () => {
    if (!mesaSelecionada) return;

    try {
      await api.mesas.fecharConta(mesaSelecionada, {
        metodo_pagamento: metodoPagamento,
        desconto
      });
      setMensagem('✓ Conta da mesa fechada com sucesso!');
      setMesaSelecionada(null);
      setPedidosMesa([]);
      setDesconto(0);
      setMostrarMesas(false);
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      console.error('Erro ao fechar conta:', error);
      setMensagem('❌ Erro ao fechar conta da mesa!');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const calcularTotalMesa = () => {
    return pedidosMesa
      .filter(p => p.status !== 'fechado')
      .reduce((total, pedido) => total + parseFloat(pedido.total || 0), 0);
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      setMensagem('❌ Carrinho vazio!');
      return;
    }

    try {
      const venda = {
        total: totalComDesconto,
        metodo_pagamento: metodoPagamento,
        desconto,
        itens: carrinho
      };

      await api.vendas.criar(venda);
      setCarrinho([]);
      setDesconto(0);
      setMensagem('✓ Venda realizada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('❌ Erro ao finalizar venda!');
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo_barras?.includes(filtro)
  );

  return (
    <div className="pdv-container">
      {/* Header */}
      <div className="pdv-header">
        <h1>🛒 Sistema de PDV</h1>
        <div className="header-info">
          <span>Caixa 001</span>
          <span>Operador: Admin</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        <button 
          className="btn-mesas-toggle"
          onClick={() => setMostrarMesas(!mostrarMesas)}
        >
          {mostrarMesas ? '✕ Fechar' : '🍽️ Mesas'}
        </button>
      </div>

      {/* Painel de Mesas */}
      {mostrarMesas && (
        <div className="mesas-panel">
          <div className="mesas-header">
            <h2>Mesas Disponíveis</h2>
            <p>Selecione uma mesa para visualizar e fechar a conta</p>
          </div>
          <div className="mesas-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mesaNum) => (
              <button
                key={mesaNum}
                className={`mesa-btn ${mesaSelecionada === mesaNum ? 'selecionada' : ''}`}
                onClick={() => carregarPedidosMesa(mesaNum)}
              >
                <span className="mesa-numero">Mesa {mesaNum}</span>
                <span className="mesa-status">Clique para ver</span>
              </button>
            ))}
          </div>

          {/* Detalhes da Mesa Selecionada */}
          {mesaSelecionada && (
            <div className="mesa-detalhes">
              <div className="mesa-detalhes-header">
                <h3>📋 Mesa {mesaSelecionada} - Pedidos</h3>
                <button 
                  className="btn-close-details"
                  onClick={() => {
                    setMesaSelecionada(null);
                    setPedidosMesa([]);
                  }}
                >
                  ✕
                </button>
              </div>

              {pedidosMesa.length === 0 ? (
                <div className="sem-pedidos">Nenhum pedido registrado para esta mesa</div>
              ) : (
                <>
                  <div className="pedidos-lista">
                    {pedidosMesa.filter(p => p.status !== 'fechado').map((pedido) => (
                      <div key={pedido.id} className="pedido-card">
                        <div className="pedido-header">
                          <span className="pedido-id">Pedido #{pedido.id}</span>
                          <span className={`pedido-status status-${pedido.status}`}>
                            {pedido.status}
                          </span>
                        </div>
                        <div className="pedido-itens">
                          {pedido.itens?.map((item: any, idx: number) => (
                            <div key={idx} className="pedido-item">
                              <span>{item.quantidade}x {item.produto_nome}</span>
                              <span>R$ {(item.subtotal || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pedido-total">
                          Total: <strong>R$ {(pedido.total || 0).toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="fechar-conta-section">
                    <div className="conta-resumo">
                      <div className="resumo-linha">
                        <span>Total dos Pedidos:</span>
                        <strong>R$ {calcularTotalMesa().toFixed(2)}</strong>
                      </div>

                      <div className="desconto-group">
                        <label>Desconto (R$):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={desconto}
                          onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
                          className="desconto-input"
                        />
                      </div>

                      <div className="resumo-linha total">
                        <span>Total Final:</span>
                        <strong>R$ {(calcularTotalMesa() - desconto).toFixed(2)}</strong>
                      </div>

                      <div className="pagamento-group">
                        <label>Método de Pagamento:</label>
                        <select
                          value={metodoPagamento}
                          onChange={(e) => setMetodoPagamento(e.target.value)}
                          className="pagamento-select"
                        >
                          <option value="dinheiro">💵 Dinheiro</option>
                          <option value="credito">💳 Crédito</option>
                          <option value="debito">💳 Débito</option>
                          <option value="pix">📱 PIX</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      className="btn-fechar-conta"
                      onClick={fecharContaMesa}
                    >
                      ✓ Fechar Conta da Mesa
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mensagem */}
      {mensagem && <div className="pdv-mensagem">{mensagem}</div>}

      <div className="pdv-layout">
        {/* Lado esquerdo - Produtos */}
        <div className="pdv-produtos">
          <div className="busca-section">
            <h2>Produtos</h2>
            <div className="busca-input-group">
              <input
                type="text"
                placeholder="🔍 Buscar por nome ou código..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="busca-input"
              />
            </div>

            <div className="codigo-barras-group">
              <input
                type="text"
                placeholder="📦 Código de barras"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarProduto()}
                className="codigo-input"
                autoFocus
              />
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="quantidade-input"
                placeholder="Qtd"
              />
              <button className="btn-adicionar" onClick={() => adicionarProduto()}>
                Adicionar
              </button>
            </div>
          </div>

          <div className="produtos-grid">
            {produtosFiltrados.length === 0 ? (
              <div className="sem-produtos">Nenhum produto encontrado</div>
            ) : (
              produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="produto-card"
                  onClick={() => {
                    setQuantidade(1);
                    adicionarProduto(produto);
                  }}
                >
                  <div className="produto-info">
                    <strong>{produto.nome}</strong>
                    <small>{produto.categoria}</small>
                  </div>
                  <div className="produto-footer">
                    <span className="preco">R$ {produto.preco.toFixed(2)}</span>
                    <span className={`estoque ${produto.estoque > 0 ? 'em-estoque' : 'sem-estoque'}`}>
                      {produto.estoque > 0 ? `${produto.estoque} un` : 'Fora'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado direito - Carrinho e Resumo */}
        <div className="pdv-sidebar">
          {/* Carrinho */}
          <div className="carrinho-section">
            <h2>🛒 Carrinho ({carrinho.length})</h2>
            <div className="carrinho-itens">
              {carrinho.length === 0 ? (
                <div className="carrinho-vazio">Nenhum item no carrinho</div>
              ) : (
                carrinho.map((item, idx) => (
                  <div key={item.produto_id} className="carrinho-item">
                    <div className="item-numero">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="item-detalhes">
                      <div className="item-nome">{item.produto_nome}</div>
                      <div className="item-valores">
                        {item.quantidade} un × R$ {item.preco_unitario.toFixed(2)}
                      </div>
                    </div>
                    <div className="item-controles">
                      <button
                        className="btn-qtd"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                      >
                        −
                      </button>
                      <span className="item-qtd">{item.quantidade}</span>
                      <button
                        className="btn-qtd"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                      >
                        +
                      </button>
                      <button
                        className="btn-remover"
                        onClick={() => removerItem(item.produto_id)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="item-subtotal">R$ {item.subtotal.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo e Pagamento */}
          <div className="resumo-section">
            <div className="resumo-linha">
              <span>Subtotal:</span>
              <strong>R$ {calcularTotal().toFixed(2)}</strong>
            </div>

            <div className="desconto-group">
              <label>Desconto (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
                className="desconto-input"
              />
            </div>

            <div className="resumo-linha total">
              <span>Total:</span>
              <strong>R$ {totalComDesconto.toFixed(2)}</strong>
            </div>

            <div className="pagamento-group">
              <label>Método de Pagamento:</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="pagamento-select"
              >
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="credito">💳 Crédito</option>
                <option value="debito">💳 Débito</option>
                <option value="pix">📱 PIX</option>
              </select>
            </div>

            <button
              className="btn-finalizar"
              onClick={finalizarVenda}
              disabled={carrinho.length === 0}
            >
              ✓ Finalizar Venda
            </button>

            <button className="btn-limpar" onClick={() => setCarrinho([])}>
              Limpar Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDV;
