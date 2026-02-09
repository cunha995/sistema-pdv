import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Produto } from '../types';

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState<Produto | null>(null);
  const [formData, setFormData] = useState<Produto>({
    nome: '',
    descricao: '',
    preco: 0,
    codigo_barras: '',
    estoque: 0,
    categoria: ''
  });

  const usuarioStr = localStorage.getItem('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  const empresaId = usuario?.empresa_id;

  useEffect(() => {
    carregarProdutos();
  }, [empresaId]);

  const carregarProdutos = async () => {
    const data = await api.produtos.listar(empresaId);
    setProdutos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (produtoEdit) {
        await api.produtos.atualizar(produtoEdit.id!, formData);
      } else {
        await api.produtos.criar({ ...formData, empresa_id: empresaId });
      }
      
      carregarProdutos();
      resetForm();
    } catch (error) {
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (produto: Produto) => {
    setProdutoEdit(produto);
    setFormData(produto);
    setMostrarForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente deletar este produto?')) {
      await api.produtos.deletar(id);
      carregarProdutos();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      codigo_barras: '',
      estoque: 0,
      categoria: ''
    });
    setProdutoEdit(null);
    setMostrarForm(false);
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <h1>Gestão de Produtos</h1>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Novo Produto'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card mb-20">
          <h2>{produtoEdit ? 'Editar Produto' : 'Novo Produto'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Nome*</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Código de Barras</label>
                <input
                  type="text"
                  value={formData.codigo_barras}
                  onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Preço*</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Estoque*</label>
                <input
                  type="number"
                  required
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: Number(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label>Categoria</label>
                <input
                  type="text"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>
            </div>

            <div className="flex-gap mt-20">
              <button type="submit" className="btn btn-success">
                {produtoEdit ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Lista de Produtos</h2>
        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Preço</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr key={produto.id}>
                <td>{produto.codigo_barras || '-'}</td>
                <td>{produto.nome}</td>
                <td>{produto.categoria || '-'}</td>
                <td>R$ {produto.preco.toFixed(2)}</td>
                <td>{produto.estoque}</td>
                <td>
                  <div className="flex-gap">
                    <button className="btn btn-primary" onClick={() => handleEdit(produto)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(produto.id!)}>
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Produtos;
