import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Produto, ItemVenda } from '../types';

const PDV: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [mensagem, setMensagem] = useState('');

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
        setMensagem('Produto não encontrado!');
        return;
      }

      if (produtoSelecionado.estoque < quantidade) {
        setMensagem('Estoque insuficiente!');
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
      setMensagem('');
    } catch (error) {
      setMensagem('Erro ao adicionar produto!');
    }
  };

  const removerItem = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.subtotal, 0);
  };

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      setMensagem('Carrinho vazio!');
      return;
    }

    try {
      const venda = {
        total: calcularTotal(),
        metodo_pagamento: metodoPagamento,
        itens: carrinho
      };

      await api.vendas.criar(venda);
      setCarrinho([]);
      setMensagem('Venda realizada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('Erro ao finalizar venda!');
    }
  };

  return (
    <div className="pdv-main-layout" style={{ display: 'flex', height: '100vh', background: '#7a0026' }}>
      {/* Painel principal amarelo */}
      <div className="pdv-pedido" style={{ flex: 1, background: '#ffe082', margin: 24, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', padding: 24 }}>
        {/* Cabeçalho */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
          <div>
            <label style={{ fontWeight: 'bold', color: '#7a0026' }}>Quantidade</label>
            <input type="number" min="0.01" step="0.01" value={quantidade} onChange={e => setQuantidade(Number(e.target.value))} style={{ width: 80, fontSize: 22, fontWeight: 'bold', textAlign: 'center', background: '#fff', border: '2px solid #7a0026', borderRadius: 6 }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontWeight: 'bold', color: '#7a0026' }}>Código/Pesquisa</label>
            <input type="text" value={codigoBarras} onChange={e => setCodigoBarras(e.target.value)} onKeyDown={e => e.key === 'Enter' && adicionarProduto()} style={{ width: '100%', fontSize: 22, fontWeight: 'bold', background: '#fff', border: '2px solid #7a0026', borderRadius: 6 }} />
          </div>
          <button style={{ fontSize: 18, fontWeight: 'bold', background: '#7a0026', color: '#fff', border: 'none', borderRadius: 6, padding: '0 18px' }} onClick={() => adicionarProduto()}>F2</button>
        </div>

        {/* Pedido aberto edição */}
        <div style={{ display: 'flex', gap: 24, flex: 1 }}>
          {/* Imagem do produto (mock) */}
          <div style={{ minWidth: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
            <img src="https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=120&q=80" alt="Produto" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }} />
            <div style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 8 }}>VALOR UNITÁRIO</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', background: '#fff', border: '2px solid #7a0026', borderRadius: 6, padding: '6px 0', textAlign: 'center' }}>R$ {carrinho.length > 0 ? carrinho[carrinho.length-1].preco_unitario.toFixed(2) : '0,00'}</div>
            <div style={{ fontWeight: 'bold', fontSize: 18, margin: '16px 0 8px 0' }}>Quantidade</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', background: '#fff', border: '2px solid #7a0026', borderRadius: 6, padding: '6px 0', textAlign: 'center' }}>{carrinho.length > 0 ? carrinho[carrinho.length-1].quantidade : '0'} UN</div>
            <div style={{ fontWeight: 'bold', fontSize: 18, margin: '16px 0 8px 0' }}>SUBTOTAL</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', background: '#fff', border: '2px solid #7a0026', borderRadius: 6, padding: '6px 0', textAlign: 'center' }}>R$ {carrinho.length > 0 ? carrinho[carrinho.length-1].subtotal.toFixed(2) : '0,00'}</div>
          </div>

          {/* Lista de itens do pedido */}
          <div style={{ flex: 1, background: '#fffde7', borderRadius: 8, padding: 18, fontFamily: 'monospace', fontSize: 18 }}>
            <div style={{ fontWeight: 'bold', fontSize: 28, color: '#7a0026', marginBottom: 8 }}>PEDIDO ABERTO EDIÇÃO</div>
            <div>
              {carrinho.length === 0 ? <div style={{ color: '#aaa', fontSize: 20 }}>Nenhum item</div> : (
                carrinho.map((item, idx) => (
                  <div key={item.produto_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ffe082', padding: '4px 0' }}>
                    <span>{String(idx+1).padStart(3,'0')}  {item.produto_nome}</span>
                    <span>{item.quantidade} UN X {item.preco_unitario.toFixed(2)}</span>
                    <span>{item.subtotal.toFixed(2)}</span>
                    <button style={{ marginLeft: 12, background: 'none', border: 'none', color: '#c00', fontWeight: 'bold', fontSize: 18, cursor: 'pointer' }} onClick={() => removerItem(item.produto_id)}>✖</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Rodapé valor total */}
        <div style={{ background: '#ffc107', borderRadius: 8, padding: '18px 0', marginTop: 18, textAlign: 'right', fontWeight: 'bold', fontSize: 32, color: '#7a0026' }}>
          VALOR TOTAL DA VENDA: <span style={{ fontSize: 40 }}>R$ {calcularTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Painel lateral vinho */}
      <div className="pdv-lateral" style={{ width: 340, background: '#7a0026', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 24, borderTopRightRadius: 12, borderBottomRightRadius: 12 }}>
        {/* Dicas de teclas */}
        <div>
          <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 12 }}>Dicas</div>
          <div style={{ fontSize: 16, lineHeight: '1.7' }}>
            F9 - Cliente<br />
            F5 - Dinheiro<br />
            F6 - Cartão<br />
            F8 - Pós-pago<br />
            F10 - Finalizar<br />
            F12 - NFC-e<br />
            F3 - Pesquisa Avançada<br />
            F3 - Abrir Pedido (Editar)<br />
            Alt+1 - Cancelar um item<br />
            CTRL+S - Sangria<br />
            CTRL+F - Fechar caixa<br />
            'PREÇO'+'*'+'9' - Venda diverso<br />
            F4 - Todas funções<br />
          </div>
        </div>
        {/* Dados do caixa */}
        <div style={{ background: '#fff', color: '#7a0026', borderRadius: 8, padding: 16, fontWeight: 'bold', fontSize: 18 }}>
          <div style={{ marginBottom: 8 }}>CAIXA 001</div>
          <div style={{ fontSize: 16 }}>OPERADOR DE CAIXA</div>
          <div style={{ fontSize: 20, margin: '8px 0' }}>ADMINISTRADOR</div>
          <div style={{ fontSize: 16 }}>VENDEDOR</div>
          <div style={{ fontSize: 20, margin: '8px 0' }}>Vendedor não informado</div>
          <div style={{ fontSize: 16 }}>DATA DA VENDA</div>
          <div style={{ fontSize: 20, margin: '8px 0' }}>{new Date().toLocaleDateString()}</div>
          <div style={{ fontSize: 16 }}>HORA ATUAL</div>
          <div style={{ fontSize: 20, margin: '8px 0' }}>{new Date().toLocaleTimeString()}</div>
        </div>
      </div>
    </div>
  );
};

export default PDV;
