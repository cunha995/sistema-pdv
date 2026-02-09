import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Produto } from '../types';
import './PainelMesa.css';

interface ItemPedido {
  id: number;
  produto_id: number;
  quantidade: number;
  preco_unitario: number;
  subtotal: number;
}

interface Pedido {
  id: number;
  mesa_id: number;
  status: string;
  total: number;
  created_at: string;
  itens: ItemPedido[];
}

const PainelMesa: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedidoAtual, setPedidoAtual] = useState<{ produto: Produto; quantidade: number }[]>([]);
  const [historicoPedidos, setHistoricoPedidos] = useState<Pedido[]>([]);
  const [totalConta, setTotalConta] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [chamandoAtendente, setChamandoAtendente] = useState(false);
  const statusAnteriorRef = useRef<Record<number, string>>({});
  const [clienteNome, setClienteNome] = useState('');

  useEffect(() => {
    api.produtos.listar().then(setProdutos);
  }, []);

  useEffect(() => {
    if (!id) return;
    const chave = `mesa_cliente_nome_${id}`;
    const salvo = localStorage.getItem(chave);
    if (salvo) {
      setClienteNome(salvo);
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const buscarPedidos = async () => {
      try {
        const pedidos = await api.mesas.listarPedidos(Number(id));
        // Filtrar apenas pedidos que não estão fechados
        const pedidosAtivos = pedidos.filter((pedido: Pedido) => 
          pedido.status !== 'fechado' && pedido.status !== 'cancelado'
        );
        
        const statusAnterior = statusAnteriorRef.current;
        pedidosAtivos.forEach((pedido: Pedido) => {
          const anterior = statusAnterior[pedido.id];
          if (anterior && anterior !== pedido.status) {
            if (pedido.status === 'aceito' || pedido.status === 'preparando') {
              setMensagem('✅ Seu pedido foi aceito e está sendo preparado!');
              setTimeout(() => setMensagem(''), 3000);
            }
            if (pedido.status === 'pronto') {
              setMensagem('✅ Seu pedido está pronto!');
              setTimeout(() => setMensagem(''), 3000);
            }
          }
          statusAnterior[pedido.id] = pedido.status;
        });

        setHistoricoPedidos(pedidosAtivos);
        const total = pedidosAtivos.reduce((acc: number, pedido: Pedido) => acc + pedido.total, 0);
        setTotalConta(total);

        if (pedidosAtivos.length === 0) {
          setPedidoAtual([]);
          setDesconto(0);
          statusAnteriorRef.current = {};
          if (id) {
            localStorage.removeItem(`mesa_cliente_nome_${id}`);
          }
          setClienteNome('');
        }
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
      }
    };

    buscarPedidos();
    const interval = setInterval(buscarPedidos, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const adicionarAoPedido = (produto: Produto) => {
    setPedidoAtual((prev) => {
      const existe = prev.find((p) => p.produto.id === produto.id);
      if (existe) {
        return prev.map((p) =>
          p.produto.id === produto.id ? { ...p, quantidade: p.quantidade + 1 } : p
        );
      }
      return [...prev, { produto, quantidade: 1 }];
    });
  };

  const removerDoPedido = (produtoId: number) => {
    setPedidoAtual((prev) => prev.filter((p) => p.produto.id !== produtoId));
  };

  const enviarPedido = async () => {
    if (!id || pedidoAtual.length === 0) return;

    try {
      const itens = pedidoAtual.map((item) => ({
        produto_id: item.produto.id,
        quantidade: item.quantidade,
        preco_unitario: item.produto.preco,
      }));

      await api.mesas.criarPedido(Number(id), itens);
      setMensagem('✓ Pedido enviado com sucesso!');
      setPedidoAtual([]);
      setTimeout(() => setMensagem(''), 2000);
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao enviar pedido';
      setMensagem(`✗ ${mensagemErro}`);
      console.error(error);
    }
  };

  const chamarAtendente = async () => {
    if (!id || chamandoAtendente) return;
    setChamandoAtendente(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(`${apiUrl}/mesas/${id}/chamar-atendente`, {
        method: 'POST'
      });

      if (response.ok) {
        setMensagem('✓ Atendente chamado!');
      } else {
        setMensagem('✗ Erro ao chamar atendente');
      }
    } catch (error) {
      setMensagem('✗ Erro ao chamar atendente');
      console.error(error);
    } finally {
      setChamandoAtendente(false);
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const fecharConta = async () => {
    if (!id) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '/api';
      const response = await fetch(
        `${apiUrl}/mesas/${id}/fechar-conta`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ metodo_pagamento: metodoPagamento, desconto: parseFloat(desconto.toString()) }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setMensagem(`✓ Conta fechada! Venda #${result.venda_id}`);
        
        // Limpar todos os estados
        setHistoricoPedidos([]);
        setTotalConta(0);
        setPedidoAtual([]);
        setDesconto(0);
        setClienteNome('');
        
        // Limpar localStorage
        if (id) {
          localStorage.removeItem(`mesa_cliente_nome_${id}`);
        }
        
        // Limpar histórico de status
        statusAnteriorRef.current = {};

        try {
          const pedidosAtualizados = await api.mesas.listarPedidos(Number(id));
          const pedidosAtivos = pedidosAtualizados.filter((pedido: Pedido) => 
            pedido.status !== 'fechado' && pedido.status !== 'cancelado'
          );
          setHistoricoPedidos(pedidosAtivos);
          const total = pedidosAtivos.reduce((acc: number, pedido: Pedido) => acc + pedido.total, 0);
          setTotalConta(total);
        } catch {
          // ignore refresh errors
        }
        
        setTimeout(() => setMensagem(''), 3000);
      } else {
        const errorData = await response.json();
        setMensagem(`✗ ${errorData.error || 'Erro ao fechar conta'}`);
      }
    } catch (error) {
      setMensagem('✗ Erro ao fechar conta');
      console.error(error);
    }
  };

  const calcularTotalPedidoAtual = () => {
    return pedidoAtual.reduce((acc, item) => acc + item.produto.preco * item.quantidade, 0);
  };

  return (
    <div className="painel-mesa">
      <div className="painel-header">
        <div className="painel-header-left">
          <div className="painel-identificacao">
            <h1>Mesa {id}</h1>
            <div className="identificacao-input">
              <label>Seu nome</label>
              <input
                type="text"
                placeholder="Digite seu nome"
                value={clienteNome}
                onChange={(e) => {
                  const valor = e.target.value;
                  setClienteNome(valor);
                  if (id) {
                    localStorage.setItem(`mesa_cliente_nome_${id}`, valor);
                  }
                }}
              />
            </div>
          </div>
          <button
            className="btn-atendente"
            onClick={chamarAtendente}
            disabled={chamandoAtendente}
          >
            {chamandoAtendente ? 'Chamando...' : '🔔 Chamar Atendente'}
          </button>
        </div>
        <div className="total-conta">
          <strong>Total da Conta: R$ {(totalConta - desconto).toFixed(2)}</strong>
        </div>
      </div>

      {mensagem && <div className="mensagem">{mensagem}</div>}

      <div className="painel-content">
        <div className="historico-pedidos">
          <h2>Pedidos em andamento ({historicoPedidos.length})</h2>
          {historicoPedidos.length === 0 ? (
            <p className="sem-pedidos">Nenhum pedido feito ainda</p>
          ) : (
            <div className="lista-pedidos">
              {historicoPedidos.map((pedido) => (
                <div key={pedido.id} className="pedido-item">
                  <div className="pedido-header">
                    <span className="pedido-id">Pedido #{pedido.id}</span>
                    <span className={`status status-${pedido.status}`}>{pedido.status}</span>
                    <span className="pedido-total">R$ {pedido.total.toFixed(2)}</span>
                  </div>
                  <div className="pedido-itens">
                    {pedido.itens.map((item) => (
                      <div key={item.id} className="item-linha">
                        <span>{item.quantidade}x</span>
                        <span>Produto {item.produto_id}</span>
                        <span>R$ {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="novo-pedido">
          <h2>Novo Pedido</h2>
          <div className="produtos-grid">
            {produtos.map((produto) => (
              <button
                key={produto.id}
                className="produto-btn"
                onClick={() => adicionarAoPedido(produto)}
              >
                <div>{produto.nome}</div>
                <div className="preco">R$ {produto.preco.toFixed(2)}</div>
              </button>
            ))}
          </div>

          {pedidoAtual.length > 0 && (
            <div className="pedido-carrinho">
              <h3>Itens do Pedido</h3>
              <div className="carrinho-itens">
                {pedidoAtual.map((item) => (
                  <div key={item.produto.id} className="carrinho-item">
                    <span>{item.quantidade}x {item.produto.nome}</span>
                    <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
                    <button onClick={() => item.produto.id && removerDoPedido(item.produto.id)}>✕</button>
                  </div>
                ))}
              </div>
              <div className="subtotal">
                <strong>Subtotal do Pedido: R$ {calcularTotalPedidoAtual().toFixed(2)}</strong>
              </div>
              <button className="btn-enviar" onClick={enviarPedido}>
                Enviar Pedido
              </button>
            </div>
          )}
        </div>
      </div>

      {historicoPedidos.length > 0 && (
        <div className="painel-fechamento">
          <h2>Fechar Conta</h2>
          <div className="fechamento-form">
            <div className="form-group">
              <label>Método de Pagamento:</label>
              <select value={metodoPagamento} onChange={(e) => setMetodoPagamento(e.target.value)}>
                <option value="dinheiro">Dinheiro</option>
                <option value="credito">Crédito</option>
                <option value="debito">Débito</option>
                <option value="pix">PIX</option>
              </select>
            </div>

            <div className="form-group">
              <label>Desconto (R$):</label>
              <input
                type="number"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(parseFloat(e.target.value))}
              />
            </div>

            <div className="resumo">
              <p>Total: R$ {totalConta.toFixed(2)}</p>
              <p>Desconto: R$ {desconto.toFixed(2)}</p>
              <p className="total-final">
                <strong>Total a Pagar: R$ {(totalConta - desconto).toFixed(2)}</strong>
              </p>
            </div>

            <button className="btn-fechar" onClick={fecharConta}>
              Fechar Conta
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PainelMesa;
