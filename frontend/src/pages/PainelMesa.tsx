

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Produto } from '../types';

const PainelMesa: React.FC = () => {
  const { id } = useParams();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pedido, setPedido] = useState<{produto: Produto, quantidade: number}[]>([]);
  const [mensagem, setMensagem] = useState('');
  const [ultimoPedido, setUltimoPedido] = useState<any>(null);


  useEffect(() => {
    api.produtos.listar().then(setProdutos);
  }, []);

  // Buscar status do último pedido da mesa
  useEffect(() => {
    if (!id) return;
    const buscarUltimoPedido = async () => {
      const resp = await fetch(`/api/mesas/${id}/pedidos`);
      const pedidos = await resp.json();
      if (pedidos.length > 0) {
        setUltimoPedido(pedidos[pedidos.length - 1]);
      } else {
        setUltimoPedido(null);
      }
    };
    buscarUltimoPedido();
    const interval = setInterval(buscarUltimoPedido, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const adicionarAoPedido = (produto: Produto) => {
    setPedido(prev => {
      const existe = prev.find(p => p.produto.id === produto.id);
      if (existe) {
        return prev.map(p => p.produto.id === produto.id ? {...p, quantidade: p.quantidade + 1} : p);
      }
      return [...prev, {produto, quantidade: 1}];
    });
  };

  const removerDoPedido = (produtoId: number) => {
    setPedido(prev => prev.filter(p => p.produto.id !== produtoId));
  };


  const enviarPedido = async () => {
    if (!id) return;
    try {
      const itens = pedido.map(item => ({ produto_id: item.produto.id, quantidade: item.quantidade }));
      const resp = await fetch(`/api/mesas/${id}/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens })
      });
      if (resp.ok) {
        setMensagem('Pedido enviado com sucesso!');
        setPedido([]);
      } else {
        setMensagem('Erro ao enviar pedido');
      }
    } catch (e) {
      setMensagem('Erro ao enviar pedido');
    }
    setTimeout(() => setMensagem(''), 3000);
  };

  return (
    <div className="painel-mesa-main">
      <h2>Painel da Mesa {id}</h2>
      {ultimoPedido && (
        <div style={{marginBottom: 16}}>
          <b>Status do último pedido:</b> <span style={{color: ultimoPedido.status === 'pronto' ? 'green' : ultimoPedido.status === 'entregue' ? 'blue' : 'orange'}}>{ultimoPedido.status}</span>
        </div>
      )}
      <h3>Escolha seus produtos:</h3>
      <div className="produtos-list">
        {produtos.map(produto => (
          <div key={produto.id} className="produto-card">
            <div><b>{produto.nome}</b></div>
            <div>R$ {produto.preco.toFixed(2)}</div>
            <button onClick={() => adicionarAoPedido(produto)}>Adicionar</button>
          </div>
        ))}
      </div>
      <h3>Seu Pedido:</h3>
      <ul>
        {pedido.map(item => (
          <li key={item.produto.id}>
            {item.produto.nome} x {item.quantidade}
            <button onClick={() => removerDoPedido(item.produto.id)}>Remover</button>
          </li>
        ))}
      </ul>
      {pedido.length > 0 && <button onClick={enviarPedido}>Enviar Pedido</button>}
      {mensagem && <div className="mensagem-ok">{mensagem}</div>}
    </div>
  );
};

export default PainelMesa;
