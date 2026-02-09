import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Produto } from '../types';
import { getUsuarioFromStorage } from '../services/authStorage';

const mesas = [
  { id: 1, nome: 'Mesa 1' },
  { id: 2, nome: 'Mesa 2' },
  { id: 3, nome: 'Mesa 3' },
  { id: 4, nome: 'Mesa 4' }
];

const PedidosMesas: React.FC = () => {
  const [pedidos, setPedidos] = useState<Record<string, any[]>>({});
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);

  const usuario = getUsuarioFromStorage();
  const empresaId = usuario?.empresa_id;

  const carregarPedidos = async () => {
    setLoading(true);
    const result: Record<string, any[]> = {};
    for (const mesa of mesas) {
      const resp = await fetch(`/api/mesas/${mesa.id}/pedidos`);
      const todosPedidos = await resp.json();
      // Filtrar apenas pedidos ativos (não fechados/cancelados)
      result[mesa.id] = todosPedidos.filter((p: any) => 
        p.status !== 'fechado' && p.status !== 'cancelado'
      );
    }
    setPedidos(result);
    setLoading(false);
  };

  useEffect(() => {
    carregarPedidos();
    api.produtos.listar(empresaId).then(setProdutos);
    const interval = setInterval(carregarPedidos, 5000); // Atualiza a cada 5s
    return () => clearInterval(interval);
  }, [empresaId]);

  const nomeProduto = (id: number) => {
    const p = produtos.find((p: Produto) => p.id === id);
    return p ? p.nome : `Produto #${id}`;
  };

  const atualizarStatus = async (mesaId: number, pedidoId: number, status: string, mensagemCliente: string) => {
    await fetch(`/api/mesas/${mesaId}/pedidos/${pedidoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    carregarPedidos();
    window.alert(mensagemCliente);
  };

  const cancelarPedido = async (mesaId: number, pedidoId: number) => {
    if (!window.confirm('Deseja realmente cancelar este pedido?')) {
      return;
    }

    try {
      await api.mesas.cancelarPedido(mesaId, pedidoId);
      carregarPedidos();
      window.alert('Pedido cancelado com sucesso');
    } catch (error) {
      window.alert('Erro ao cancelar pedido');
      console.error(error);
    }
  };

  return (
    <div className="pedidos-mesas-main">
      <h1>Pedidos por Mesa</h1>
      {loading && <div>Carregando...</div>}
      <div className="mesas-pedidos-list">
        {mesas.map(mesa => (
          <div key={mesa.id} className="mesa-pedidos-card">
            <h2>{mesa.nome}</h2>
            <ul>
              {(pedidos[mesa.id] || []).map((pedido: any) => (
                <li key={pedido.id}>
                  <b>Pedido #{pedido.id}</b> - <span className={`status-${pedido.status}`}>{pedido.status}</span> <br />
                  {pedido.itens.map((item: any, idx: number) => (
                    <span key={idx}>{nomeProduto(item.produto_id)} x {item.quantidade}<br /></span>
                  ))}
                  <small>{new Date(pedido.criado_em).toLocaleString()}</small>
                  <div style={{marginTop: 4}}>
                    {pedido.status !== 'entregue' && pedido.status !== 'cancelado' && (
                      <>
                        {pedido.status === 'pendente' && (
                          <button onClick={() => atualizarStatus(mesa.id, pedido.id, 'aceito', 'Cliente notificado: Pedido aceito!')}>
                            Aceitar Pedido
                          </button>
                        )}
                        {pedido.status !== 'pronto' && (
                          <button
                            onClick={() => atualizarStatus(mesa.id, pedido.id, 'preparando', 'Cliente notificado: Pedido em preparo!')}
                            style={{marginLeft: 8}}
                          >
                            Marcar como Preparando
                          </button>
                        )}
                        <button
                          onClick={() => atualizarStatus(mesa.id, pedido.id, 'pronto', 'Cliente notificado: Pedido pronto!')}
                          style={{marginLeft: 8}}
                        >
                          Marcar como Pronto
                        </button>
                        <button
                          onClick={() => atualizarStatus(mesa.id, pedido.id, 'entregue', 'Cliente notificado: Pedido entregue!')}
                          style={{marginLeft: 8}}
                        >
                          Marcar como Entregue
                        </button>
                        {pedido.status === 'pendente' && (
                          <button
                            onClick={() => cancelarPedido(mesa.id, pedido.id)}
                            style={{marginLeft: 8, background: '#dc3545'}}
                          >
                            Cancelar Pedido
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </li>
              ))}
              {(pedidos[mesa.id] || []).length === 0 && <li>Nenhum pedido</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PedidosMesas;
