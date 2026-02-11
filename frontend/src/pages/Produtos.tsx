import React, { useState, useEffect } from 'react';
import { api, resolveAssetUrl } from '../services/api';
import { Produto } from '../types';
import { getUsuarioFromStorage } from '../services/authStorage';

const Produtos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState<Produto | null>(null);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const [imagemPreview, setImagemPreview] = useState('');
  const [formData, setFormData] = useState<Produto>({
    nome: '',
    descricao: '',
    preco: 0,
    codigo_barras: '',
    estoque: 0,
    categoria: '',
    imagem_url: ''
  });

  const usuario = getUsuarioFromStorage();
  const empresaId = usuario?.empresa_id;

  useEffect(() => {
    carregarProdutos();
  }, [empresaId]);

  useEffect(() => {
    if (!imagemPreview || !imagemPreview.startsWith('blob:')) return;
    return () => {
      URL.revokeObjectURL(imagemPreview);
    };
  }, [imagemPreview]);

  const carregarProdutos = async () => {
    const data = await api.produtos.listar(empresaId);
    setProdutos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let produtoId = produtoEdit?.id;
      if (produtoEdit) {
        await api.produtos.atualizar(produtoEdit.id!, formData);
      } else {
        const criado = await api.produtos.criar({ ...formData, empresa_id: empresaId });
        produtoId = criado?.id;
      }

      if (imagemArquivo && produtoId) {
        await api.produtos.uploadImagem(produtoId, imagemArquivo);
      }

      await carregarProdutos();
      resetForm();
    } catch (error) {
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (produto: Produto) => {
    setProdutoEdit(produto);
    setFormData(produto);
    setImagemArquivo(null);
    setImagemPreview(resolveAssetUrl(produto.imagem_url));
    setMostrarForm(true);
  };

  const handleImagemChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    setImagemArquivo(file);
    setImagemPreview(URL.createObjectURL(file));
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente deletar este produto?')) {
      await api.produtos.deletar(id);
      await carregarProdutos();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      preco: 0,
      codigo_barras: '',
      estoque: 0,
      categoria: '',
      imagem_url: ''
    });
    setProdutoEdit(null);
    setMostrarForm(false);
    setImagemArquivo(null);
    setImagemPreview('');
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

            <div className="form-group">
              <label>Foto do Produto</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
              />
              {imagemPreview && (
                <div className="produto-imagem-preview">
                  <img src={imagemPreview} alt="Preview do produto" />
                </div>
              )}
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
              <th>Foto</th>
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
                <td>
                  {produto.imagem_url ? (
                    <img
                      src={resolveAssetUrl(produto.imagem_url)}
                      alt={produto.nome}
                      className="produto-thumb"
                    />
                  ) : (
                    <span className="produto-thumb vazio">—</span>
                  )}
                </td>
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
