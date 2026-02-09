import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import './Master.css';

interface Empresa {
  id?: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  contato_nome: string;
  contato_email: string;
  contato_telefone: string;
  plano_id: number;
  ativo?: boolean;
  total_vendas?: number;
  quantidade_vendas?: number;
  plano_nome?: string;
  preco_mensal?: number;
  data_contratacao?: string;
  // Campos para criação de usuário
  usuario_nome?: string;
  usuario_email?: string;
  usuario_senha?: string;
  is_demo?: boolean;
  duracao_demo_minutos?: number;
}

interface Plano {
  id?: number;
  nome: string;
  descricao: string;
  categoria?: string;
  detalhes?: string;
  servicos?: string;
  preco_mensal: number;
  limite_usuarios: number;
  limite_mesas: number;
  limite_produtos: number;
  limite_vendas_mes?: number;
  inclui_delivery: boolean;
  inclui_relatorios: boolean;
  ativo?: boolean;
}

interface Estatisticas {
  totalEmpresas: number;
  empresasAtivas: number;
  totalVendas: number;
  receita: string;
}

const Master: React.FC = () => {
  const [tab, setTab] = useState<'dashboard' | 'empresas' | 'planos'>('dashboard');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [mostrarFormEmpresa, setMostrarFormEmpresa] = useState(false);
  const [mostrarFormPlano, setMostrarFormPlano] = useState(false);
  const [editandoEmpresa, setEditandoEmpresa] = useState<Empresa | null>(null);
  const [editandoPlano, setEditandoPlano] = useState<Plano | null>(null);
  const [mensagem, setMensagem] = useState('');

  const [formEmpresa, setFormEmpresa] = useState<Empresa>({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    contato_nome: '',
    contato_email: '',
    contato_telefone: '',
    plano_id: 1,
    usuario_email: ''
  });

  const [formPlano, setFormPlano] = useState<Plano>({
    nome: '',
    descricao: '',
    categoria: '',
    detalhes: '',
    servicos: '',
    preco_mensal: 99.90,
    limite_usuarios: 5,
    limite_mesas: 10,
    limite_produtos: 500,
    limite_vendas_mes: -1,
    inclui_delivery: false,
    inclui_relatorios: true
  });

  useEffect(() => {
    if (tab === 'dashboard') carregarEstatisticas();
    if (tab === 'empresas') carregarEmpresas();
    if (tab === 'planos') carregarPlanos();
  }, [tab]);

  const carregarEstatisticas = async () => {
    try {
      const data = await api.empresas.estatisticas();
      setEstatisticas(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const carregarEmpresas = async () => {
    try {
      const data = await api.empresas.listar();
      setEmpresas(data);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
    }
  };

  const carregarPlanos = async () => {
    try {
      const data = await api.planos.listar();
      setPlanos(data);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  const handleSubmitEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoEmpresa) {
        await api.empresas.atualizar(editandoEmpresa.id!, formEmpresa);
        setMensagem('✓ Empresa atualizada!');
      } else {
        // Normalizar valores
        const nomeEmpresa = formEmpresa.nome?.trim();
        const emailEmpresa = formEmpresa.email?.trim();
        const usuarioNome = formEmpresa.usuario_nome?.trim();
        const usuarioEmail = formEmpresa.usuario_email?.trim();
        const usuarioSenha = formEmpresa.usuario_senha?.trim();

        if (!nomeEmpresa || !emailEmpresa) {
          setMensagem('❌ Nome e email da empresa são obrigatórios');
          return;
        }

        if (!usuarioNome) {
          setMensagem('❌ Informe o usuário de login');
          return;
        }

        if (!usuarioEmail) {
          setMensagem('❌ Informe o email de login');
          return;
        }

        if (!usuarioSenha) {
          setMensagem('❌ Informe a senha do usuário');
          return;
        }

        // Separar dados da empresa dos dados do usuário
        const dadosEmpresa = {
          nome: nomeEmpresa,
          cnpj: formEmpresa.cnpj?.trim() || '',
          email: emailEmpresa,
          telefone: formEmpresa.telefone?.trim() || '',
          endereco: formEmpresa.endereco?.trim() || '',
          contato_nome: formEmpresa.contato_nome?.trim() || '',
          contato_email: formEmpresa.contato_email?.trim() || '',
          contato_telefone: formEmpresa.contato_telefone?.trim() || '',
          plano_id: formEmpresa.plano_id
        };

        // Criar empresa
        const empresaCriada = await api.empresas.criar(dadosEmpresa);
        if (!empresaCriada?.id) {
          throw new Error('Erro ao criar empresa');
        }

        // Atualizar lista imediatamente (otimista)
        const planoSelecionado = planos.find(p => p.id === dadosEmpresa.plano_id);
        const empresaParaLista: Empresa = {
          ...dadosEmpresa,
          id: empresaCriada.id,
          ativo: true,
          plano_nome: planoSelecionado?.nome,
          preco_mensal: planoSelecionado?.preco_mensal
        };
        setEmpresas((prev) => [empresaParaLista, ...prev.filter(e => e.id !== empresaCriada.id)]);
        
        // Criar usuário para a empresa se as credenciais foram preenchidas
        if (usuarioNome && usuarioEmail && usuarioSenha) {
          try {
            await api.auth.criarUsuario({
              empresa_id: empresaCriada.id,
              nome: usuarioNome,
              email: usuarioEmail,
              senha: usuarioSenha,
              tipo: 'admin',
              is_demo: formEmpresa.is_demo || false,
              duracao_demo_minutos: formEmpresa.duracao_demo_minutos || 30
            });
            setMensagem('✓ Empresa e usuário cadastrados com sucesso!');
          } catch (userError: any) {
            console.error('Erro ao criar usuário:', userError);
            setMensagem(`⚠️ Empresa criada mas erro ao criar usuário: ${userError.message}`);
          }
        } else {
          setMensagem('✓ Empresa cadastrada! (sem usuário)');
        }
      }
      limparFormEmpresa();
      // Revalidar imediatamente para garantir consistência
      carregarEmpresas();
      setTimeout(() => setMensagem(''), 4000);
    } catch (error: any) {
      console.error('Erro ao salvar empresa:', error);
      setMensagem(`❌ ${error.message || 'Erro ao salvar empresa'}`);
    }
  };

  const handleSubmitPlano = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editandoPlano) {
        await api.planos.atualizar(editandoPlano.id!, formPlano);
        setMensagem('✓ Plano atualizado!');
      } else {
        await api.planos.criar(formPlano);
        setMensagem('✓ Plano criado!');
      }
      limparFormPlano();
      carregarPlanos();
      setTimeout(() => setMensagem(''), 3000);
    } catch (error: any) {
      setMensagem(`❌ ${error.message || 'Erro ao salvar plano'}`);
    }
  };

  const handleEditarEmpresa = (empresa: Empresa) => {
    setEditandoEmpresa(empresa);
    setFormEmpresa(empresa);
    setMostrarFormEmpresa(true);
  };

  const handleEditarPlano = (plano: Plano) => {
    setEditandoPlano(plano);
    setFormPlano(plano);
    setMostrarFormPlano(true);
  };

  const handleDeletarEmpresa = async (id: number) => {
    if (!confirm('Apagar esta empresa?')) return;
    try {
      await api.empresas.deletar(id);
      setEmpresas((prev) => prev.filter((e) => e.id !== id));
      setMensagem('✓ Empresa apagada!');
      setTimeout(() => carregarEmpresas(), 800);
    } catch (error) {
      setMensagem('❌ Erro ao apagar empresa');
    }
  };

  const handleCriarAcesso = async (empresa: Empresa) => {
    if (!empresa.id) return;

    const nome = prompt('Nome do usuário admin:', empresa.nome || '');
    if (!nome) return;

    const email = prompt('Email de login:', empresa.email || '');
    if (!email) return;

    const senha = prompt('Senha de acesso:');
    if (!senha) return;

    try {
      await api.auth.criarUsuario({
        empresa_id: empresa.id,
        nome: nome.trim(),
        email: email.trim(),
        senha,
        tipo: 'admin'
      });
      setMensagem(`✓ Acesso criado para ${email}`);
      setTimeout(() => setMensagem(''), 4000);
    } catch (error: any) {
      setMensagem(`❌ ${error.message || 'Erro ao criar acesso'}`);
    }
  };

  const handleDeletarPlano = async (id: number) => {
    if (!confirm('Desativar este plano?')) return;
    try {
      await api.planos.deletar(id);
      setMensagem('✓ Plano desativado!');
      carregarPlanos();
    } catch (error) {
      setMensagem('❌ Erro ao desativar plano');
    }
  };

  const limparFormEmpresa = () => {
    setFormEmpresa({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      contato_nome: '',
      contato_email: '',
      contato_telefone: '',
      plano_id: 1,
      usuario_email: ''
    });
    setEditandoEmpresa(null);
    setMostrarFormEmpresa(false);
  };

  const limparFormPlano = () => {
    setFormPlano({
      nome: '',
      descricao: '',
      categoria: '',
      detalhes: '',
      preco_mensal: 99.90,
      limite_usuarios: 5,
      limite_mesas: 10,
      limite_produtos: 500,
      limite_vendas_mes: -1,
      inclui_delivery: false,
      inclui_relatorios: true
    });
    setEditandoPlano(null);
    setMostrarFormPlano(false);
  };

  return (
    <div className="master-container">
      {/* Header */}
      <div className="master-header">
        <div className="master-title">
          <h1>👑 Painel Master</h1>
          <p>Gerenciar plataforma, empresas e planos</p>
        </div>
        <div className="master-user">
          <span>Administrador Master</span>
          <div className="user-avatar">AM</div>
        </div>
      </div>

      {/* Mensagem */}
      {mensagem && <div className="master-mensagem">{mensagem}</div>}

      {/* Navegação */}
      <div className="master-nav">
        <button
          className={`nav-btn ${tab === 'dashboard' ? 'ativo' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button
          className={`nav-btn ${tab === 'empresas' ? 'ativo' : ''}`}
          onClick={() => setTab('empresas')}
        >
          🏢 Empresas
        </button>
        <button
          className={`nav-btn ${tab === 'planos' ? 'ativo' : ''}`}
          onClick={() => setTab('planos')}
        >
          💎 Planos
        </button>
      </div>

      {/* Dashboard */}
      {tab === 'dashboard' && (
        <div className="master-content">
          <div className="stats-grid">
            <div className="stat-card stat-1">
              <div className="stat-icon">🏢</div>
              <div className="stat-content">
                <div className="stat-value">{estatisticas?.totalEmpresas || 0}</div>
                <div className="stat-label">Total de Empresas</div>
              </div>
            </div>

            <div className="stat-card stat-2">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <div className="stat-value">{estatisticas?.empresasAtivas || 0}</div>
                <div className="stat-label">Empresas Ativas</div>
              </div>
            </div>

            <div className="stat-card stat-3">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-value">R$ {(parseFloat(estatisticas?.totalVendas.toString() || '0')/1000).toFixed(1)}K</div>
                <div className="stat-label">Total em Vendas</div>
              </div>
            </div>

            <div className="stat-card stat-4">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <div className="stat-value">R$ {estatisticas?.receita || '0'}</div>
                <div className="stat-label">Receita Estimada</div>
              </div>
            </div>
          </div>

          <div className="dashboard-info">
            <div className="info-box">
              <h3>📈 Sobre a Plataforma</h3>
              <p>Painel administrativo master para gerenciar múltiplas instâncias de PDV. Cadastre novas empresas, escolha planos e acompanhe todas as métricas.</p>
            </div>
            <div className="info-box">
              <h3>🎯 Próximos Passos</h3>
              <ul>
                <li>Cadastre novos planos de cobrança</li>
                <li>Registre empresas/clientes</li>
                <li>Acompanhe vendas e receita</li>
                <li>Gerencie assinaturas ativas</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empresas */}
      {tab === 'empresas' && (
        <div className="master-content">
          <div className="section-header">
            <h2>🏢 Gerenciar Empresas</h2>
            <button
              className="btn-novo"
              onClick={() => setMostrarFormEmpresa(!mostrarFormEmpresa)}
            >
              {mostrarFormEmpresa ? '✕ Fechar' : '+ Nova Empresa'}
            </button>
          </div>

          {mostrarFormEmpresa && (
            <div className="form-container">
              <div className="form-title">{editandoEmpresa ? '✏️ Editar' : '➕ Nova'} Empresa</div>
              <form onSubmit={handleSubmitEmpresa} className="master-form">
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Nome da Empresa"
                    required
                    value={formEmpresa.nome}
                    onChange={(e) => setFormEmpresa({...formEmpresa, nome: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="CNPJ"
                    value={formEmpresa.cnpj}
                    onChange={(e) => setFormEmpresa({...formEmpresa, cnpj: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formEmpresa.email}
                    onChange={(e) => setFormEmpresa({...formEmpresa, email: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={formEmpresa.telefone}
                    onChange={(e) => setFormEmpresa({...formEmpresa, telefone: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Endereço"
                    value={formEmpresa.endereco}
                    onChange={(e) => setFormEmpresa({...formEmpresa, endereco: e.target.value})}
                  />
                  <select
                    value={formEmpresa.plano_id}
                    onChange={(e) => setFormEmpresa({...formEmpresa, plano_id: Number(e.target.value)})}
                  >
                    {planos.map(p => (
                      <option key={p.id} value={p.id}>{p.nome} - R$ {p.preco_mensal}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <input
                    type="text"
                    placeholder="Contato - Nome"
                    value={formEmpresa.contato_nome}
                    onChange={(e) => setFormEmpresa({...formEmpresa, contato_nome: e.target.value})}
                  />
                  <input
                    type="email"
                    placeholder="Contato - Email"
                    value={formEmpresa.contato_email}
                    onChange={(e) => setFormEmpresa({...formEmpresa, contato_email: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Contato - Telefone"
                    value={formEmpresa.contato_telefone}
                    onChange={(e) => setFormEmpresa({...formEmpresa, contato_telefone: e.target.value})}
                  />
                </div>

                {!editandoEmpresa && (
                  <>
                    <div className="form-divider">
                      <span>🔐 Credenciais de Acesso</span>
                    </div>
                    <div className="form-row">
                      <input
                        type="text"
                        placeholder="Usuário (login)"
                        value={formEmpresa.usuario_nome || ''}
                        onChange={(e) => setFormEmpresa({...formEmpresa, usuario_nome: e.target.value})}
                      />
                      <input
                        type="email"
                        placeholder="Email de login"
                        value={formEmpresa.usuario_email || ''}
                        onChange={(e) => setFormEmpresa({...formEmpresa, usuario_email: e.target.value})}
                      />
                    </div>
                    <div className="form-row">
                      <input
                        type="password"
                        placeholder="Senha do usuário"
                        required
                        value={formEmpresa.usuario_senha || ''}
                        onChange={(e) => setFormEmpresa({...formEmpresa, usuario_senha: e.target.value})}
                      />
                      <div className="checkbox-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={formEmpresa.is_demo || false}
                            onChange={(e) => setFormEmpresa({...formEmpresa, is_demo: e.target.checked})}
                          />
                          Conta Demo
                        </label>
                        {formEmpresa.is_demo && (
                          <select
                            value={formEmpresa.duracao_demo_minutos || 30}
                            onChange={(e) => setFormEmpresa({...formEmpresa, duracao_demo_minutos: Number(e.target.value)})}
                          >
                            <option value={15}>15 minutos</option>
                            <option value={30}>30 minutos</option>
                            <option value={60}>60 minutos</option>
                            <option value={120}>2 horas</option>
                            <option value={1440}>24 horas</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={limparFormEmpresa}>Cancelar</button>
                  <button type="submit" className="btn-submit">Salvar</button>
                </div>
              </form>
            </div>
          )}

          <div className="grid-empresas">
            {empresas.map(emp => (
              <div key={emp.id} className="empresa-card">
                <div className="empresa-header">
                  <h3>{emp.nome}</h3>
                  <span className={`status ${emp.ativo ? 'ativo' : 'inativo'}`}>
                    {emp.ativo ? '🟢' : '🔴'}
                  </span>
                </div>
                <div className="empresa-info">
                  <p><strong>Email:</strong> {emp.email}</p>
                  <p><strong>Plano:</strong> {emp.plano_nome}</p>
                  <p><strong>Valor:</strong> R$ {emp.preco_mensal?.toFixed(2)}</p>
                  <p><strong>Vendas:</strong> {emp.quantidade_vendas} ({emp.total_vendas ? `R$ ${(emp.total_vendas as number).toFixed(2)}` : 'R$ 0,00'})</p>
                </div>
                <div className="empresa-actions">
                  <button className="btn-acesso" onClick={() => handleCriarAcesso(emp)}>🔐 Criar Acesso</button>
                  <button className="btn-editar" onClick={() => handleEditarEmpresa(emp)}>✏️ Editar</button>
                  <button className="btn-deletar" onClick={() => handleDeletarEmpresa(emp.id!)}>🗑️ Apagar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Planos */}
      {tab === 'planos' && (
        <div className="master-content">
          <div className="section-header">
            <h2>💎 Gerenciar Planos</h2>
            <button
              className="btn-novo"
              onClick={() => setMostrarFormPlano(!mostrarFormPlano)}
            >
              {mostrarFormPlano ? '✕ Fechar' : '+ Novo Plano'}
            </button>
          </div>

          {mostrarFormPlano && (
            <div className="form-container">
              <div className="form-title">{editandoPlano ? '✏️ Editar' : '➕ Novo'} Plano</div>
              <form onSubmit={handleSubmitPlano} className="master-form">
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Nome do Plano</label>
                    <input
                      type="text"
                      placeholder="Nome do Plano"
                      required
                      value={formPlano.nome}
                      onChange={(e) => setFormPlano({...formPlano, nome: e.target.value})}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Preço Mensal</label>
                    <input
                      type="number"
                      placeholder="Preço Mensal"
                      step="0.01"
                      required
                      value={formPlano.preco_mensal}
                      onChange={(e) => setFormPlano({...formPlano, preco_mensal: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Categoria do Plano</label>
                    <input
                      type="text"
                      placeholder="Categoria do Plano"
                      value={formPlano.categoria || ''}
                      onChange={(e) => setFormPlano({...formPlano, categoria: e.target.value})}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Limite de Vendas/Mês</label>
                    <input
                      type="number"
                      placeholder="Limite de Vendas/Mês"
                      value={formPlano.limite_vendas_mes ?? -1}
                      onChange={(e) => setFormPlano({...formPlano, limite_vendas_mes: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="field-group full">
                  <label className="field-label">Descrição</label>
                  <textarea
                    placeholder="Descrição"
                    value={formPlano.descricao}
                    onChange={(e) => setFormPlano({...formPlano, descricao: e.target.value})}
                    rows={2}
                  />
                </div>
                <div className="field-group full">
                  <label className="field-label">Detalhes do Plano</label>
                  <textarea
                    placeholder="Detalhes (ex: suporte, SLA, recursos extras)"
                    value={formPlano.detalhes || ''}
                    onChange={(e) => setFormPlano({...formPlano, detalhes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="field-group full">
                  <label className="field-label">Serviços/Categorias adicionais</label>
                  <input
                    type="text"
                    placeholder="Ex: Suporte premium, Integração, Treinamento (separe por vírgula)"
                    value={formPlano.servicos || ''}
                    onChange={(e) => setFormPlano({...formPlano, servicos: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label className="field-label">Limite de Usuários</label>
                    <input
                      type="number"
                      placeholder="Limite Usuários"
                      value={formPlano.limite_usuarios}
                      onChange={(e) => setFormPlano({...formPlano, limite_usuarios: Number(e.target.value)})}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Limite de Mesas</label>
                    <input
                      type="number"
                      placeholder="Limite Mesas"
                      value={formPlano.limite_mesas}
                      onChange={(e) => setFormPlano({...formPlano, limite_mesas: Number(e.target.value)})}
                    />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Limite de Produtos</label>
                    <input
                      type="number"
                      placeholder="Limite Produtos"
                      value={formPlano.limite_produtos}
                      onChange={(e) => setFormPlano({...formPlano, limite_produtos: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="form-checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={formPlano.inclui_delivery}
                      onChange={(e) => setFormPlano({...formPlano, inclui_delivery: e.target.checked})}
                    />
                    Incluir Delivery
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={formPlano.inclui_relatorios}
                      onChange={(e) => setFormPlano({...formPlano, inclui_relatorios: e.target.checked})}
                    />
                    Incluir Relatórios
                  </label>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={limparFormPlano}>Cancelar</button>
                  <button type="submit" className="btn-submit">Salvar</button>
                </div>
              </form>
            </div>
          )}

          <div className="planos-showcase">
            {planos.map(plano => (
              <div key={plano.id} className="plano-card">
                <div className="plano-header">
                  <h3>{plano.nome}</h3>
                  <div className="preco">R$ {plano.preco_mensal.toFixed(2)}<span>/mês</span></div>
                </div>
                <p className="descricao">{plano.descricao}</p>
                {plano.categoria && <div className="plano-categoria">Categoria: {plano.categoria}</div>}
                {plano.detalhes && <p className="descricao">{plano.detalhes}</p>}
                <ul className="features">
                  <li>👥 {plano.limite_usuarios === -1 ? 'Ilimitados' : plano.limite_usuarios} usuários</li>
                  <li>🍽️ {plano.limite_mesas === -1 ? 'Ilimitadas' : plano.limite_mesas} mesas</li>
                  <li>📦 {plano.limite_produtos === -1 ? 'Ilimitados' : plano.limite_produtos} produtos</li>
                  <li>💳 {plano.limite_vendas_mes === -1 ? 'Vendas ilimitadas' : `${plano.limite_vendas_mes} vendas/mês`}</li>
                  {plano.inclui_delivery && <li>✓ Delivery incluído</li>}
                  {plano.inclui_relatorios && <li>✓ Relatórios incluídos</li>}
                  {plano.servicos?.split(',').map((item, index) => {
                    const label = item.trim();
                    if (!label) return null;
                    return <li key={`${plano.id}-servico-${index}`}>✓ {label}</li>;
                  })}
                </ul>
                <div className="plano-actions">
                  <button className="btn-editar-plano" onClick={() => handleEditarPlano(plano)}>✏️ Editar</button>
                  <button className="btn-deletar-plano" onClick={() => handleDeletarPlano(plano.id!)}>🗑️ Desativar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Master;
