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
    <div>
      <h1 className="mb-20">Ponto de Venda (PDV)</h1>

      {mensagem && (
        <div className={`alert ${mensagem.includes('sucesso') ? 'alert-success' : 'alert-error'}`}>
          {mensagem}
        </div>
      )}

      <div className="grid-2">
        {/* Busca por Código de Barras */}
        <div className="card">
          <h2>Buscar Produto</h2>
          <div className="form-group">
            <label>Código de Barras</label>
            <input
              type="text"
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && adicionarProduto()}
              placeholder="Digite ou escaneie o código"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>Quantidade</label>
            <input
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
            />
          </div>
          <button className="btn btn-primary" onClick={() => adicionarProduto()}>
            Adicionar
          </button>
        </div>

        {/* Lista de Produtos */}
        <div className="card">
          <h2>Produtos Disponíveis</h2>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {produtos.map(produto => (
              <div
                key={produto.id}
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer'
                }}
                onClick={() => adicionarProduto(produto)}
              >
                <strong>{produto.nome}</strong> - R$ {produto.preco.toFixed(2)}
                <br />
                <small>Estoque: {produto.estoque}</small>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carrinho */}
      <div className="card mt-20">
        <h2>Carrinho de Compras</h2>
        {carrinho.length === 0 ? (
          <p>Carrinho vazio</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Quantidade</th>
                  <th>Preço Unit.</th>
                  <th>Subtotal</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {carrinho.map((item) => (
                  <tr key={item.produto_id}>
                    <td>{item.produto_nome}</td>
                    <td>{item.quantidade}</td>
                    <td>R$ {item.preco_unitario.toFixed(2)}</td>
                    <td>R$ {item.subtotal.toFixed(2)}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        onClick={() => removerItem(item.produto_id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-20 flex-between">
              <div>
                <h3>Total: R$ {calcularTotal().toFixed(2)}</h3>
                <div className="form-group mt-20">
                  <label>Método de Pagamento</label>
                  <select
                    value={metodoPagamento}
                    onChange={(e) => setMetodoPagamento(e.target.value)}
                  >
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>
              </div>
              <div className="flex-gap">
                <button className="btn btn-secondary" onClick={() => setCarrinho([])}>
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={finalizarVenda}>
                  Finalizar Venda
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PDV;
