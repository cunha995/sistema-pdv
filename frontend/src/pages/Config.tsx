import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Config.css';

interface Funcionario {
  id?: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  senha?: string;
  ativo?: boolean;
  created_at?: string;
}

const Config: React.FC = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editando, setEditando] = useState<Funcionario | null>(null);
  const [mensagem, setMensagem] = useState('');
  const [formData, setFormData] = useState<Funcionario>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: 'Operador de Caixa',
    senha: ''
  });

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const data = await api.funcionarios.listar();
      setFuncionarios(data);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editando) {
        await api.funcionarios.atualizar(editando.id!, formData);
        setMensagem('✓ Funcionário atualizado com sucesso!');
      } else {
        await api.funcionarios.criar(formData);
        setMensagem('✓ Funcionário cadastrado com sucesso!');
      }
      
      limparForm();
      carregarFuncionarios();
      setTimeout(() => setMensagem(''), 3000);
    } catch (error: any) {
      setMensagem(`❌ ${error.message || 'Erro ao salvar funcionário'}`);
      setTimeout(() => setMensagem(''), 3000);
    }
  };

  const handleEditar = (funcionario: Funcionario) => {
    setEditando(funcionario);
    setFormData({
      nome: funcionario.nome,
      cpf: funcionario.cpf,
      email: funcionario.email || '',
      telefone: funcionario.telefone || '',
      cargo: funcionario.cargo,
      senha: ''
    });
    setMostrarForm(true);
  };

  const handleDeletar = async (id: number) => {
    if (!confirm('Deseja realmente desativar este funcionário?')) return;
    
    try {
      await api.funcionarios.deletar(id);
      setMensagem('✓ Funcionário desativado!');
      carregarFuncionarios();
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('❌ Erro ao desativar funcionário');
    }
  };

  const handleAtivar = async (id: number) => {
    try {
      await api.funcionarios.ativar(id);
      setMensagem('✓ Funcionário ativado!');
      carregarFuncionarios();
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      setMensagem('❌ Erro ao ativar funcionário');
    }
  };

  const limparForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: 'Operador de Caixa',
      senha: ''
    });
    setEditando(null);
    setMostrarForm(false);
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatTelefone = (tel: string) => {
    if (tel.length === 11) {
      return tel.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return tel.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  return (
    <div className="config-container">
      {/* Header */}
      <div className="config-header">
        <div className="config-title-section">
          <h1>⚙️ Configurações</h1>
          <p>Gerencie funcionários e operadores de caixa</p>
        </div>
        <button 
          className="btn-novo-funcionario"
          onClick={() => setMostrarForm(!mostrarForm)}
        >
          {mostrarForm ? '✕ Fechar' : '+ Novo Funcionário'}
        </button>
      </div>

      {/* Mensagem */}
      {mensagem && <div className="config-mensagem">{mensagem}</div>}

      {/* Formulário */}
      {mostrarForm && (
        <div className="funcionario-form-container">
          <div className="form-header">
            <h2>{editando ? '✏️ Editar Funcionário' : '➕ Novo Funcionário'}</h2>
            <button className="btn-fechar-form" onClick={limparForm}>✕</button>
          </div>
          
          <form onSubmit={handleSubmit} className="funcionario-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})}
                  placeholder="Apenas números"
                />
              </div>

              <div className="form-group">
                <label>E-mail</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="exemplo@email.com"
                />
              </div>

              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="text"
                  maxLength={11}
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value.replace(/\D/g, '')})}
                  placeholder="DDD + Número"
                />
              </div>

              <div className="form-group">
                <label>Cargo</label>
                <select
                  value={formData.cargo}
                  onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                >
                  <option value="Operador de Caixa">Operador de Caixa</option>
                  <option value="Gerente">Gerente</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Atendente">Atendente</option>
                </select>
              </div>

              <div className="form-group">
                <label>Senha de Acesso</label>
                <input
                  type="password"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  placeholder={editando ? 'Deixe em branco para manter' : 'Opcional'}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancelar" onClick={limparForm}>
                Cancelar
              </button>
              <button type="submit" className="btn-salvar">
                {editando ? '💾 Atualizar' : '➕ Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Funcionários */}
      <div className="funcionarios-section">
        <h2 className="section-subtitle">
          👥 Funcionários Cadastrados ({funcionarios.length})
        </h2>
        
        {funcionarios.length === 0 ? (
          <div className="sem-funcionarios">
            <p>Nenhum funcionário cadastrado ainda</p>
            <button className="btn-cadastrar-primeiro" onClick={() => setMostrarForm(true)}>
              Cadastrar Primeiro Funcionário
            </button>
          </div>
        ) : (
          <div className="funcionarios-grid">
            {funcionarios.map((func) => (
              <div key={func.id} className={`funcionario-card ${!func.ativo ? 'inativo' : ''}`}>
                <div className="func-header">
                  <div className="func-avatar">
                    {func.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div className="func-info">
                    <h3>{func.nome}</h3>
                    <span className="func-cargo">{func.cargo}</span>
                  </div>
                  <div className={`func-status ${func.ativo ? 'ativo' : 'inativo'}`}>
                    {func.ativo ? '🟢 Ativo' : '🔴 Inativo'}
                  </div>
                </div>

                <div className="func-details">
                  <div className="func-detail-item">
                    <span className="detail-icon">📄</span>
                    <span>{formatCPF(func.cpf)}</span>
                  </div>
                  {func.email && (
                    <div className="func-detail-item">
                      <span className="detail-icon">📧</span>
                      <span>{func.email}</span>
                    </div>
                  )}
                  {func.telefone && (
                    <div className="func-detail-item">
                      <span className="detail-icon">📱</span>
                      <span>{formatTelefone(func.telefone)}</span>
                    </div>
                  )}
                </div>

                <div className="func-actions">
                  <button 
                    className="btn-editar-func"
                    onClick={() => handleEditar(func)}
                  >
                    ✏️ Editar
                  </button>
                  {func.ativo ? (
                    <button 
                      className="btn-desativar-func"
                      onClick={() => handleDeletar(func.id!)}
                    >
                      🚫 Desativar
                    </button>
                  ) : (
                    <button 
                      className="btn-ativar-func"
                      onClick={() => handleAtivar(func.id!)}
                    >
                      ✓ Ativar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Config;
