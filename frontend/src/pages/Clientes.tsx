import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Cliente } from '../types';
import { getUsuarioFromStorage } from '../services/authStorage';

const Clientes: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [clienteEdit, setClienteEdit] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState<Cliente>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: ''
  });

  const usuario = getUsuarioFromStorage();
  const empresaId = usuario?.empresa_id;

  useEffect(() => {
    carregarClientes();
  }, [empresaId]);

  const carregarClientes = async () => {
    const data = await api.clientes.listar(empresaId);
    setClientes(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (clienteEdit) {
        await api.clientes.atualizar(clienteEdit.id!, formData);
      } else {
        await api.clientes.criar({ ...formData, empresa_id: empresaId });
      }
      
      carregarClientes();
      resetForm();
    } catch (error) {
      alert('Erro ao salvar cliente');
    }
  };

  const handleEdit = (cliente: Cliente) => {
    setClienteEdit(cliente);
    setFormData(cliente);
    setMostrarForm(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente deletar este cliente?')) {
      await api.clientes.deletar(id);
      carregarClientes();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: ''
    });
    setClienteEdit(null);
    setMostrarForm(false);
  };

  return (
    <div>
      <div className="flex-between mb-20">
        <h1>Gestão de Clientes</h1>
        <button className="btn btn-primary" onClick={() => setMostrarForm(!mostrarForm)}>
          {mostrarForm ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>

      {mostrarForm && (
        <div className="card mb-20">
          <h2>{clienteEdit ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nome*</label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <textarea
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              />
            </div>

            <div className="flex-gap mt-20">
              <button type="submit" className="btn btn-success">
                {clienteEdit ? 'Atualizar' : 'Cadastrar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Lista de Clientes</h2>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf || '-'}</td>
                <td>{cliente.telefone || '-'}</td>
                <td>{cliente.email || '-'}</td>
                <td>
                  <div className="flex-gap">
                    <button className="btn btn-primary" onClick={() => handleEdit(cliente)}>
                      Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(cliente.id!)}>
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

export default Clientes;
