import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Produto, ItemVenda, Cliente } from '../types';
import './PDV.css';

const PDV: React.FC = () => {
  const navigate = useNavigate();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [metodoPagamento, setMetodoPagamento] = useState('dinheiro');
  const [desconto, setDesconto] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [filtro, setFiltro] = useState('');
  const [caixaUsuario, setCaixaUsuario] = useState('');
  const [caixaSenha, setCaixaSenha] = useState('');
  const [caixaErro, setCaixaErro] = useState('');
  const [caixaCarregando, setCaixaCarregando] = useState(false);
  const [caixaOperador, setCaixaOperador] = useState<{ id?: number; empresa_id?: number; nome: string; tipo: 'admin' | 'funcionario' } | null>(null);
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [valorAbertura, setValorAbertura] = useState(0);
  const [fechamentoDinheiro, setFechamentoDinheiro] = useState('');
  const [fechamentoCartao, setFechamentoCartao] = useState('');
  const [fechamentoPix, setFechamentoPix] = useState('');
  const [fechamentoObservacao, setFechamentoObservacao] = useState('');
  const [mostrarFechamento, setMostrarFechamento] = useState(false);
  const [totalVendasSessao, setTotalVendasSessao] = useState(0);
  const [notaFiscal, setNotaFiscal] = useState<{
    empresa: any;
    vendaId?: number;
    data: string;
    itens: ItemVenda[];
    total: number;
    desconto: number;
    metodo: string;
  } | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [carregandoClientes, setCarregandoClientes] = useState(false);
  const [mostrarMesas, setMostrarMesas] = useState(false);
  const [mesaSelecionada, setMesaSelecionada] = useState<number | null>(null);
  const [pedidosMesa, setPedidosMesa] = useState<any[]>([]);
  const [mesaParaFechar, setMesaParaFechar] = useState<number | null>(null);
  const [mesasComPendencia, setMesasComPendencia] = useState<number[]>([]);
  const [mesasAceitas, setMesasAceitas] = useState<number[]>([]);
  const sireneAtivaRef = useRef(false);
  const primeiraChecagemRef = useRef(true);
  const pedidosPendentesRef = useRef<Set<number>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioUnlockedRef = useRef(false);
  const mesasIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const statusPendentes = new Set(['pendente', 'aceito', 'preparando', 'pronto']);

  useEffect(() => {
    carregarProdutos();
    carregarClientes();
    const operadorSalvo = localStorage.getItem('caixa_operador');
    if (operadorSalvo) {
      try {
        setCaixaOperador(JSON.parse(operadorSalvo));
      } catch {
        localStorage.removeItem('caixa_operador');
      }
    }

    const aberturaSalva = localStorage.getItem('caixa_abertura');
    if (aberturaSalva) {
      try {
        const abertura = JSON.parse(aberturaSalva);
        setCaixaAberto(true);
        setValorAbertura(Number(abertura.valor) || 0);
      } catch {
        localStorage.removeItem('caixa_abertura');
      }
    }
  }, []);

  const carregarProdutos = async () => {
    try {
      const data = await api.produtos.listar();
      setProdutos(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  const carregarClientes = async () => {
    try {
      setCarregandoClientes(true);
      const data = await api.clientes.listar();
      setClientes(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setCarregandoClientes(false);
    }
  };

  const adicionarProduto = async (produto?: Produto) => {
    try {
      let produtoSelecionado = produto;

      if (!produtoSelecionado && codigoBarras) {
        produtoSelecionado = await api.produtos.buscarPorCodigo(codigoBarras);
      }

      if (!produtoSelecionado) {
        setMensagem('❌ Produto não encontrado!');
        setTimeout(() => setMensagem(''), 2000);
        return;
      }

      if (produtoSelecionado.estoque < quantidade) {
        setMensagem('❌ Estoque insuficiente!');
        setTimeout(() => setMensagem(''), 2000);
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
      setMensagem('✓ Produto adicionado!');
      setTimeout(() => setMensagem(''), 1500);
    } catch (error) {
      setMensagem('❌ Erro ao adicionar produto!');
    }
  };

  const removerItem = (produtoId: number) => {
    setCarrinho(carrinho.filter(item => item.produto_id !== produtoId));
  };

  const atualizarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerItem(produtoId);
      return;
    }
    setCarrinho(
      carrinho.map(item =>
        item.produto_id === produtoId
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * item.preco_unitario
            }
          : item
      )
    );
  };

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => total + item.subtotal, 0);
  };

  const totalComDesconto = calcularTotal() - desconto;

  const tocarSirene = async () => {
    if (sireneAtivaRef.current) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    try {
      sireneAtivaRef.current = true;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      oscillator.frequency.setValueAtTime(600, now);
      oscillator.frequency.linearRampToValueAtTime(900, now + 0.6);
      oscillator.frequency.linearRampToValueAtTime(500, now + 1.2);
      oscillator.frequency.linearRampToValueAtTime(900, now + 1.8);
      oscillator.frequency.linearRampToValueAtTime(600, now + 2.4);

      oscillator.start();
      oscillator.stop(now + 2.45);
      oscillator.onended = () => {
        sireneAtivaRef.current = false;
      };
    } catch {
      sireneAtivaRef.current = false;
    }
  };

  useEffect(() => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const unlockAudio = async () => {
      if (audioUnlockedRef.current) return;
      try {
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.01);
        audioUnlockedRef.current = true;
      } catch {
        // ignore
      }
    };

    const handleFirstInteraction = () => {
      unlockAudio();
      document.removeEventListener('pointerdown', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    document.addEventListener('pointerdown', handleFirstInteraction, { passive: true });
    document.addEventListener('keydown', handleFirstInteraction);

    return () => {
      document.removeEventListener('pointerdown', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const carregarPedidosMesa = async (mesaId: number) => {
    try {
      const pedidos = await api.mesas.listarPedidos(mesaId);
      setPedidosMesa(pedidos);
      setMesaSelecionada(mesaId);
    } catch (error) {
      console.error('Erro ao carregar pedidos da mesa:', error);
      setMensagem('❌ Erro ao carregar pedidos da mesa!');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const aceitarPedidoMesa = async (mesaId: number, pedidoId: number) => {
    try {
      await api.mesas.atualizarStatus(mesaId, pedidoId, 'aceito');
      const pedidosAtualizados = await api.mesas.listarPedidos(mesaId);
      setPedidosMesa(pedidosAtualizados);
      setMensagem('✓ Pedido aceito!');
      verificarPendencias(true);
      setTimeout(() => setMensagem(''), 2000);
    } catch (error) {
      console.error('Erro ao aceitar pedido:', error);
      setMensagem('❌ Erro ao aceitar pedido!');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const fecharContaMesa = async () => {
    if (!mesaSelecionada) return;

    try {
      const mesaIdAtual = mesaSelecionada;
      const usuarioStr = localStorage.getItem('usuario');
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      const empresaId = caixaOperador?.empresa_id || usuario?.empresa_id;
      const resp = await api.mesas.fecharConta(mesaIdAtual, {
        metodo_pagamento: metodoPagamento,
        desconto,
        empresa_id: empresaId
      });
      let empresa = {
        nome: usuario?.empresa_nome || 'Empresa',
        cnpj: '—',
        endereco: '',
        telefone: '',
        email: ''
      };

      if (usuario?.empresa_id) {
        try {
          const empresaResp = await api.empresas.buscar(usuario.empresa_id);
          if (empresaResp?.nome) {
            empresa = empresaResp;
          }
        } catch {
          // mantém dados básicos
        }
      }

      const itensNota: ItemVenda[] = pedidosMesa
        .filter(p => p.status !== 'fechado')
        .flatMap((pedido: any) =>
          (pedido.itens || []).map((item: any) => {
            const produto = produtos.find((p) => p.id === item.produto_id);
            return {
              produto_id: item.produto_id,
              produto_nome: produto?.nome || `Produto #${item.produto_id}`,
              quantidade: item.quantidade,
              preco_unitario: item.preco_unitario,
              subtotal: item.subtotal
            };
          })
        );

      setNotaFiscal({
        empresa,
        vendaId: resp?.venda_id,
        data: new Date().toLocaleString('pt-BR'),
        itens: itensNota,
        total: calcularTotalMesa() - desconto,
        desconto,
        metodo: metodoPagamento
      });

      setTotalVendasSessao((prev) => prev + (calcularTotalMesa() - desconto));

      try {
        await api.mesas.finalizar(mesaIdAtual);
      } catch {
        // ignore
      }

      setMensagem('✓ Conta da mesa fechada com sucesso!');
      setMesaSelecionada(null);
      setPedidosMesa([]);
      setDesconto(0);
      setMostrarMesas(false);
      setMesasComPendencia((prev) => prev.filter((m) => m !== mesaIdAtual));
      setMesasAceitas((prev) => prev.filter((m) => m !== mesaIdAtual));
      verificarPendencias(true);
      setTimeout(() => setMensagem(''), 3000);
    } catch (error) {
      console.error('Erro ao fechar conta:', error);
      setMensagem('❌ Erro ao fechar conta da mesa!');
      setTimeout(() => setMensagem(''), 2000);
    }
  };

  const lancarMesaNoPdv = () => {
    if (!mesaSelecionada) return;
    const itensMesa = pedidosMesa
      .filter(p => p.status !== 'fechado')
      .flatMap((pedido: any) => pedido.itens || []);

    if (itensMesa.length === 0) {
      setMensagem('❌ Nenhum item pendente para lançar no PDV.');
      setTimeout(() => setMensagem(''), 2000);
      return;
    }

    const agrupado = new Map<number, ItemVenda>();
    itensMesa.forEach((item: any) => {
      const existente = agrupado.get(item.produto_id);
      const produto = produtos.find((p) => p.id === item.produto_id);
      if (existente) {
        existente.quantidade += item.quantidade;
        existente.subtotal += item.subtotal;
      } else {
        agrupado.set(item.produto_id, {
          produto_id: item.produto_id,
          produto_nome: produto?.nome || `Produto #${item.produto_id}`,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal
        });
      }
    });

    setCarrinho(Array.from(agrupado.values()));
    setMesaParaFechar(mesaSelecionada);
    setMostrarMesas(false);
    setMesaSelecionada(null);
    setPedidosMesa([]);
    setMensagem('✓ Itens da mesa lançados no PDV.');
    setTimeout(() => setMensagem(''), 2000);
  };

  const calcularTotalMesa = () => {
    return pedidosMesa
      .filter(p => p.status !== 'fechado')
      .reduce((total, pedido) => total + parseFloat(pedido.total || 0), 0);
  };

  const verificarPendencias = useCallback(async (silenciarSirene = false) => {
    if (!caixaAberto) return;
    try {
      const pendentesPorMesa: number[] = [];
      const aceitasPorMesa: number[] = [];
      const pendentesIds = new Set<number>();

      const resultados = await Promise.all(
        mesasIds.map(async (mesaId) => {
          const pedidos = await api.mesas.listarPedidos(mesaId);
          return { mesaId, pedidos: Array.isArray(pedidos) ? pedidos : [] };
        })
      );

      resultados.forEach(({ mesaId, pedidos }) => {
        const pendentes = pedidos.filter((p: any) => p.status === 'pendente');
        const aceitos = pedidos.filter((p: any) => p.status === 'aceito');

        if (pendentes.length > 0) {
          pendentesPorMesa.push(mesaId);
        }
        if (aceitos.length > 0) {
          aceitasPorMesa.push(mesaId);
        }

        pendentes.forEach((p: any) => pendentesIds.add(p.id));
      });

      if (!primeiraChecagemRef.current) {
        const prev = pedidosPendentesRef.current;
        const temNovo = Array.from(pendentesIds).some((id) => !prev.has(id));
        if (temNovo && !silenciarSirene) {
          tocarSirene();
          if (pendentesPorMesa.length > 0) {
            setMensagem(`🔔 Pedido pendente: ${pendentesPorMesa.map((m) => `Mesa ${m}`).join(', ')}`);
            setTimeout(() => setMensagem(''), 3000);
          }
        }
      }

      primeiraChecagemRef.current = false;
      pedidosPendentesRef.current = pendentesIds;
      setMesasComPendencia(pendentesPorMesa.sort((a, b) => a - b));
      setMesasAceitas(aceitasPorMesa.sort((a, b) => a - b));
    } catch (error) {
      console.error('Erro ao verificar pendências das mesas:', error);
    }
  }, [caixaAberto, mesasIds]);

  useEffect(() => {
    if (!caixaAberto) {
      setMesasComPendencia([]);
      setMesasAceitas([]);
      pedidosPendentesRef.current = new Set();
      primeiraChecagemRef.current = true;
      return;
    }

    let ativo = true;

    const executar = async () => {
      if (!ativo) return;
      await verificarPendencias();
    };

    executar();
    const interval = setInterval(executar, 5000);

    return () => {
      ativo = false;
      clearInterval(interval);
    };
  }, [caixaAberto, verificarPendencias]);

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      setMensagem('❌ Carrinho vazio!');
      return;
    }

    try {
      const itensVenda = [...carrinho];
      const usuarioStr = localStorage.getItem('usuario');
      const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
      const venda = {
        empresa_id: usuario?.empresa_id,
        cliente_id: clienteSelecionado?.id,
        total: totalComDesconto,
        metodo_pagamento: metodoPagamento,
        desconto,
        itens: carrinho
      };

      const resp = await api.vendas.criar(venda);
      let empresa = {
        nome: usuario?.empresa_nome || 'Empresa',
        cnpj: '—',
        endereco: '',
        telefone: '',
        email: ''
      };

      if (usuario?.empresa_id) {
        try {
          const empresaResp = await api.empresas.buscar(usuario.empresa_id);
          if (empresaResp?.nome) {
            empresa = empresaResp;
          }
        } catch {
          // mantém dados básicos
        }
      }

      setNotaFiscal({
        empresa,
        vendaId: resp?.id,
        data: new Date().toLocaleString('pt-BR'),
        itens: itensVenda,
        total: totalComDesconto,
        desconto,
        metodo: metodoPagamento
      });
      setTotalVendasSessao((prev) => prev + totalComDesconto);
      setCarrinho([]);
      setDesconto(0);
      if (mesaParaFechar) {
        const mesaIdFinal = mesaParaFechar;
        try {
          await api.mesas.finalizar(mesaIdFinal);
        } catch {
          // ignore
        }
        setMesaParaFechar(null);
        setMesasComPendencia((prev) => prev.filter((m) => m !== mesaIdFinal));
        setMesasAceitas((prev) => prev.filter((m) => m !== mesaIdFinal));
        verificarPendencias(true);
      }
      setMensagem('✓ Venda realizada com sucesso!');
      setTimeout(() => setMensagem(''), 3000);
    } catch (error: any) {
      setMensagem(`❌ ${error?.message || 'Erro ao finalizar venda!'}`);
    }
  };

  const produtosFiltrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    p.codigo_barras?.includes(filtro)
  );

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = clienteFiltro.toLowerCase();
    return (
      cliente.nome?.toLowerCase().includes(termo) ||
      cliente.cpf?.includes(termo) ||
      cliente.email?.toLowerCase().includes(termo) ||
      cliente.telefone?.includes(termo)
    );
  });

  const autenticarCaixa = async (e: React.FormEvent) => {
    e.preventDefault();
    setCaixaErro('');
    setCaixaCarregando(true);

    try {
      const adminResp = await api.auth.login(caixaUsuario, caixaSenha);
      if (adminResp?.usuario?.nome) {
        const operador = {
          id: adminResp.usuario.id,
          empresa_id: adminResp.usuario.empresa_id,
          nome: adminResp.usuario.nome,
          tipo: 'admin' as const
        };
        setCaixaOperador(operador);
        localStorage.setItem('caixa_operador', JSON.stringify(operador));
        setCaixaUsuario('');
        setCaixaSenha('');
        setCaixaCarregando(false);
        return;
      }
    } catch (error) {
      // continua para login de funcionário
    }

    try {
      const funcResp = await api.funcionarios.login(caixaUsuario, caixaSenha);
      if (funcResp?.funcionario?.nome) {
        const operador = {
          id: funcResp.funcionario.id,
          nome: funcResp.funcionario.nome,
          tipo: 'funcionario' as const
        };
        setCaixaOperador(operador);
        localStorage.setItem('caixa_operador', JSON.stringify(operador));
        setCaixaUsuario('');
        setCaixaSenha('');
        setCaixaCarregando(false);
        return;
      }

      setCaixaErro('Credenciais inválidas');
    } catch (error: any) {
      setCaixaErro(error?.message || 'Erro ao autenticar');
    } finally {
      setCaixaCarregando(false);
    }
  };

  const trocarOperador = () => {
    localStorage.removeItem('caixa_operador');
    localStorage.removeItem('caixa_abertura');
    setCaixaOperador(null);
    setCaixaAberto(false);
    setValorAbertura(0);
    setFechamentoDinheiro('');
    setFechamentoCartao('');
    setFechamentoPix('');
    setFechamentoObservacao('');
    setTotalVendasSessao(0);
  };

  const abrirCaixa = (e: React.FormEvent) => {
    e.preventDefault();
    setCaixaAberto(true);
    setTotalVendasSessao(0);
    localStorage.setItem('caixa_abertura', JSON.stringify({ valor: valorAbertura, data: new Date().toISOString() }));
  };

  const fecharCaixa = () => {
    if (!fechamentoDinheiro || !fechamentoCartao || !fechamentoPix) {
      setMensagem('❌ Informe dinheiro, cartão e PIX para fechar o caixa.');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const dinheiro = Math.max(0, Number(fechamentoDinheiro));
    const cartao = Math.max(0, Number(fechamentoCartao));
    const pix = Math.max(0, Number(fechamentoPix));

    if (Number.isNaN(dinheiro) || Number.isNaN(cartao) || Number.isNaN(pix)) {
      setMensagem('❌ Valores inválidos no fechamento do caixa.');
      setTimeout(() => setMensagem(''), 3000);
      return;
    }

    const fechamento = {
      dinheiro,
      cartao,
      pix,
      observacao: fechamentoObservacao,
      data: new Date().toISOString()
    };
    localStorage.setItem('caixa_fechamento', JSON.stringify(fechamento));
    const usuarioStr = localStorage.getItem('usuario');
    const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
    api.caixa.criarFechamento({
      empresa_id: caixaOperador?.empresa_id || usuario?.empresa_id,
      operador_id: caixaOperador?.id,
      operador_nome: caixaOperador?.nome,
      operador_tipo: caixaOperador?.tipo,
      valor_abertura: valorAbertura,
      recebiveis: totalVendasSessao,
      dinheiro,
      cartao,
      pix,
      observacoes: fechamentoObservacao
    }).catch(() => {
      // mantém fechamento local caso API falhe
    });
    setMensagem('✓ Caixa fechado com sucesso!');
    setTimeout(() => setMensagem(''), 3000);
    setCaixaAberto(false);
    localStorage.removeItem('caixa_abertura');
    localStorage.removeItem('caixa_operador');
    setCaixaOperador(null);
    setTotalVendasSessao(0);
    setMostrarFechamento(false);
  };

  return (
    <div className="pdv-container">
      {notaFiscal && (
        <div className="nota-overlay">
          <div className="nota-card">
            <div className="nota-header">
              <h2>NOTA NÃO FISCAL</h2>
              <button
                className="nota-fechar"
                onClick={() => {
                  setNotaFiscal(null);
                  navigate('/admin');
                }}
              >
                ✕
              </button>
            </div>
            <div className="nota-empresa">
              <strong>{notaFiscal.empresa?.nome}</strong>
              <span>CNPJ: {notaFiscal.empresa?.cnpj || '—'}</span>
              {notaFiscal.empresa?.endereco && <span>{notaFiscal.empresa.endereco}</span>}
              {notaFiscal.empresa?.telefone && <span>Tel: {notaFiscal.empresa.telefone}</span>}
              {notaFiscal.empresa?.email && <span>{notaFiscal.empresa.email}</span>}
            </div>
            <div className="nota-info">
              <span>Venda #{notaFiscal.vendaId || '—'}</span>
              <span>Data: {notaFiscal.data}</span>
              <span>Método: {notaFiscal.metodo}</span>
            </div>
            <div className="nota-itens">
              {notaFiscal.itens.map((item, idx) => (
                <div key={idx} className="nota-item">
                  <span>{item.quantidade}x {item.produto_nome}</span>
                  <span>R$ {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="nota-total">
              <span>Desconto: R$ {notaFiscal.desconto.toFixed(2)}</span>
              <strong>Total: R$ {notaFiscal.total.toFixed(2)}</strong>
            </div>
            <div className="nota-actions">
              <button onClick={() => window.print()}>Imprimir</button>
            </div>
          </div>
        </div>
      )}

      {mostrarFechamento && (
        <div className="fechamento-overlay">
          <div className="fechamento-modal">
            <div className="fechamento-header">
              <h2>Fechamento do Caixa</h2>
              <button className="fechamento-fechar" onClick={() => setMostrarFechamento(false)}>✕</button>
            </div>

            <div className="fechamento-resumo">
              <div className="fechamento-resumo-item">
                <span>Valor de abertura</span>
                <strong>R$ {Number(valorAbertura || 0).toFixed(2)}</strong>
              </div>
              <div className="fechamento-resumo-item">
                <span>Recebíveis (sessão)</span>
                <strong>R$ {totalVendasSessao.toFixed(2)}</strong>
              </div>
            </div>

            <div className="fechamento-linha">
              <label>Dinheiro</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fechamentoDinheiro}
                onChange={(e) => setFechamentoDinheiro(e.target.value)}
              />
            </div>
            <div className="fechamento-linha">
              <label>Cartão</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fechamentoCartao}
                onChange={(e) => setFechamentoCartao(e.target.value)}
              />
            </div>
            <div className="fechamento-linha">
              <label>PIX</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={fechamentoPix}
                onChange={(e) => setFechamentoPix(e.target.value)}
              />
            </div>
            <div className="fechamento-linha">
              <label>Observações</label>
              <textarea
                value={fechamentoObservacao}
                onChange={(e) => setFechamentoObservacao(e.target.value)}
                rows={3}
              />
            </div>
            <button className="btn-fechar-caixa" onClick={fecharCaixa}>
              Confirmar Fechamento
            </button>
          </div>
        </div>
      )}
      {!caixaOperador && (
        <div className="caixa-auth-overlay">
          <form className="caixa-auth-card" onSubmit={autenticarCaixa}>
            <div className="caixa-auth-header">
              <h2>Abertura de Caixa</h2>
              <button
                type="button"
                className="caixa-auth-close"
                onClick={() => navigate('/admin')}
              >
                ✕
              </button>
            </div>
            <p>Informe usuário e senha para iniciar o caixa.</p>
            <input
              type="text"
              placeholder="CPF, email ou usuário"
              value={caixaUsuario}
              onChange={(e) => setCaixaUsuario(e.target.value)}
              required
              autoFocus
            />
            <input
              type="password"
              placeholder="Senha"
              value={caixaSenha}
              onChange={(e) => setCaixaSenha(e.target.value)}
              required
            />
            {caixaErro && <div className="caixa-auth-erro">{caixaErro}</div>}
            <button type="submit" disabled={caixaCarregando}>
              {caixaCarregando ? 'Verificando...' : 'Abrir Caixa'}
            </button>
          </form>
        </div>
      )}

      {caixaOperador && !caixaAberto && (
        <div className="caixa-auth-overlay">
          <form className="caixa-auth-card" onSubmit={abrirCaixa}>
            <h2>Valor de Abertura</h2>
            <p>Informe o valor inicial em dinheiro no caixa.</p>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorAbertura}
              onChange={(e) => setValorAbertura(Math.max(0, Number(e.target.value)))}
              placeholder="R$ 0,00"
              required
              autoFocus
            />
            <button type="submit">Confirmar Abertura</button>
          </form>
        </div>
      )}
      {/* Header */}
      <div className="pdv-header">
        <h1>🛒 Sistema de PDV</h1>
        <div className="header-info">
          <span>Caixa 001</span>
          <span>Operador: {caixaOperador?.nome || '—'}</span>
          <span>{new Date().toLocaleString()}</span>
        </div>
        {caixaOperador && (
          <button className="btn-trocar-operador" onClick={trocarOperador}>
            Trocar Operador
          </button>
        )}
        {caixaOperador && (
          <button className="btn-fechamento-toggle" onClick={() => setMostrarFechamento(true)}>
            Fechamento do Caixa
          </button>
        )}
        <button 
          className={`btn-mesas-toggle ${caixaAberto && mesasComPendencia.length > 0 ? 'pendente' : ''}`}
          onClick={() => setMostrarMesas(!mostrarMesas)}
        >
          {mostrarMesas ? '✕ Fechar' : '🍽️ Mesas'}
          {caixaAberto && mesasComPendencia.length > 0 && (
            <span className="mesas-alerta-badge">!</span>
          )}
        </button>
      </div>

      {caixaAberto && mesasComPendencia.length > 0 && (
        <div className="pdv-alerta-pendente">
          <span>🚨 Pedidos pendentes:</span>
          <strong>{mesasComPendencia.map((m) => `Mesa ${m}`).join(', ')}</strong>
        </div>
      )}

      {/* Painel de Mesas */}
      {mostrarMesas && (
        <div className="mesas-panel">
          <div className="mesas-header">
            <h2>Mesas Disponíveis</h2>
            <p>Selecione uma mesa para visualizar e fechar no PDV</p>
          </div>
          {caixaAberto && mesasComPendencia.length > 0 && (
            <div className="mesas-alerta">
              <span>⚠️ Pedidos pendentes nas mesas:</span>
              <strong>{mesasComPendencia.map((m) => `Mesa ${m}`).join(', ')}</strong>
            </div>
          )}
          <div className="mesas-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((mesaNum) => (
              <button
                key={mesaNum}
                className={`mesa-btn ${mesaSelecionada === mesaNum ? 'selecionada' : ''} ${mesasComPendencia.includes(mesaNum) ? 'pendente' : ''} ${mesasAceitas.includes(mesaNum) ? 'aceita' : ''}`}
                onClick={() => carregarPedidosMesa(mesaNum)}
              >
                <span className="mesa-numero">Mesa {mesaNum}</span>
                <span className="mesa-status">
                  {mesasComPendencia.includes(mesaNum)
                    ? 'Pedido pendente'
                    : mesasAceitas.includes(mesaNum)
                      ? 'Pedido aceito'
                      : 'Clique para ver'}
                </span>
              </button>
            ))}
          </div>

          {/* Detalhes da Mesa Selecionada */}
          {mesaSelecionada && (
            <div className="mesa-detalhes">
              <div className="mesa-detalhes-header">
                <h3>📋 Mesa {mesaSelecionada} - Pedidos</h3>
                <button 
                  className="btn-close-details"
                  onClick={() => {
                    setMesaSelecionada(null);
                    setPedidosMesa([]);
                  }}
                >
                  ✕
                </button>
              </div>

              {pedidosMesa.filter(p => p.status !== 'fechado').length > 0 && (
                <button className="btn-lancar-pdv" onClick={lancarMesaNoPdv}>
                  ➜ Lançar no PDV
                </button>
              )}

              {pedidosMesa.length === 0 ? (
                <div className="sem-pedidos">Nenhum pedido registrado para esta mesa</div>
              ) : (
                <>
                  <div className="pedidos-lista">
                    {pedidosMesa.filter(p => p.status !== 'fechado').map((pedido) => (
                      <div key={pedido.id} className="pedido-card">
                        <div className="pedido-header">
                          <span className="pedido-id">Pedido #{pedido.id}</span>
                          <div className="pedido-status-group">
                            <span className={`pedido-status status-${pedido.status}`}>
                              {pedido.status}
                            </span>
                            {pedido.status === 'pendente' && (
                              <button
                                className="btn-aceitar-pedido"
                                onClick={() => aceitarPedidoMesa(mesaSelecionada, pedido.id)}
                              >
                                Aceitar
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="pedido-itens">
                          {pedido.itens?.map((item: any, idx: number) => (
                            <div key={idx} className="pedido-item">
                              <span>{item.quantidade}x {item.produto_nome}</span>
                              <span>R$ {(item.subtotal || 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="pedido-total">
                          Total: <strong>R$ {(pedido.total || 0).toFixed(2)}</strong>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="fechar-conta-section">
                    <div className="conta-resumo">
                      <div className="resumo-linha">
                        <span>Total dos Pedidos:</span>
                        <strong>R$ {calcularTotalMesa().toFixed(2)}</strong>
                      </div>

                      <div className="desconto-group">
                        <label>Desconto (R$):</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={desconto}
                          onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
                          className="desconto-input"
                        />
                      </div>

                      <div className="resumo-linha total">
                        <span>Total Final:</span>
                        <strong>R$ {(calcularTotalMesa() - desconto).toFixed(2)}</strong>
                      </div>

                      <div className="pagamento-group">
                        <label>Método de Pagamento:</label>
                        <select
                          value={metodoPagamento}
                          onChange={(e) => setMetodoPagamento(e.target.value)}
                          className="pagamento-select"
                        >
                          <option value="dinheiro">💵 Dinheiro</option>
                          <option value="credito">💳 Crédito</option>
                          <option value="debito">💳 Débito</option>
                          <option value="pix">📱 PIX</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      className="btn-fechar-conta"
                      onClick={fecharContaMesa}
                    >
                      ✓ Fechar no PDV
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mensagem */}
      {mensagem && <div className="pdv-mensagem">{mensagem}</div>}

      <div className="pdv-layout">
        {/* Lado esquerdo - Produtos */}
        <div className="pdv-produtos">
          <div className="busca-section">
            <h2>Produtos</h2>
            <div className="busca-input-group">
              <input
                type="text"
                placeholder="🔍 Buscar por nome ou código..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="busca-input"
              />
            </div>

            <div className="codigo-barras-group">
              <input
                type="text"
                placeholder="📦 Código de barras"
                value={codigoBarras}
                onChange={(e) => setCodigoBarras(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarProduto()}
                className="codigo-input"
                autoFocus
              />
              <input
                type="number"
                min="1"
                value={quantidade}
                onChange={(e) => setQuantidade(Math.max(1, Number(e.target.value)))}
                className="quantidade-input"
                placeholder="Qtd"
              />
              <button className="btn-adicionar" onClick={() => adicionarProduto()}>
                Adicionar
              </button>
            </div>
          </div>

          <div className="produtos-grid">
            {produtosFiltrados.length === 0 ? (
              <div className="sem-produtos">Nenhum produto encontrado</div>
            ) : (
              produtosFiltrados.map((produto) => (
                <div
                  key={produto.id}
                  className="produto-card"
                  onClick={() => {
                    setQuantidade(1);
                    adicionarProduto(produto);
                  }}
                >
                  <div className="produto-info">
                    <strong>{produto.nome}</strong>
                    <small>{produto.categoria}</small>
                  </div>
                  <div className="produto-footer">
                    <span className="preco">R$ {produto.preco.toFixed(2)}</span>
                    <span className={`estoque ${produto.estoque > 0 ? 'em-estoque' : 'sem-estoque'}`}>
                      {produto.estoque > 0 ? `${produto.estoque} un` : 'Fora'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Lado direito - Carrinho e Resumo */}
        <div className="pdv-sidebar">
          {/* Carrinho */}
          <div className="carrinho-section">
            <h2>🛒 Carrinho ({carrinho.length})</h2>
            <div className="carrinho-itens">
              {carrinho.length === 0 ? (
                <div className="carrinho-vazio">Nenhum item no carrinho</div>
              ) : (
                carrinho.map((item, idx) => (
                  <div key={item.produto_id} className="carrinho-item">
                    <div className="item-numero">{String(idx + 1).padStart(2, '0')}</div>
                    <div className="item-detalhes">
                      <div className="item-nome">{item.produto_nome}</div>
                      <div className="item-valores">
                        {item.quantidade} un × R$ {item.preco_unitario.toFixed(2)}
                      </div>
                    </div>
                    <div className="item-controles">
                      <button
                        className="btn-qtd"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade - 1)}
                      >
                        −
                      </button>
                      <span className="item-qtd">{item.quantidade}</span>
                      <button
                        className="btn-qtd"
                        onClick={() => atualizarQuantidade(item.produto_id, item.quantidade + 1)}
                      >
                        +
                      </button>
                      <button
                        className="btn-remover"
                        onClick={() => removerItem(item.produto_id)}
                      >
                        ✕
                      </button>
                    </div>
                    <div className="item-subtotal">R$ {item.subtotal.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumo e Pagamento */}
          <div className="resumo-section">
            <div className="cliente-section">
              <label>Cliente cadastrado</label>
              <input
                type="text"
                placeholder="🔍 Buscar cliente por nome, CPF, email..."
                value={clienteFiltro}
                onChange={(e) => setClienteFiltro(e.target.value)}
                className="cliente-input"
              />
              {carregandoClientes ? (
                <div className="cliente-loading">Carregando clientes...</div>
              ) : (
                <div className="cliente-list">
                  {clientesFiltrados.slice(0, 6).map((cliente) => (
                    <button
                      key={cliente.id}
                      type="button"
                      className={`cliente-item ${clienteSelecionado?.id === cliente.id ? 'ativo' : ''}`}
                      onClick={() => setClienteSelecionado(cliente)}
                    >
                      <strong>{cliente.nome}</strong>
                      <span>
                        {cliente.cpf ? `CPF: ${cliente.cpf}` : cliente.email || cliente.telefone || 'Sem contato'}
                      </span>
                    </button>
                  ))}
                  {clienteFiltro && clientesFiltrados.length === 0 && (
                    <div className="cliente-vazio">Nenhum cliente encontrado</div>
                  )}
                </div>
              )}

              {clienteSelecionado && (
                <div className="cliente-selecionado">
                  <span>Selecionado: {clienteSelecionado.nome}</span>
                  <button
                    type="button"
                    className="cliente-remover"
                    onClick={() => setClienteSelecionado(null)}
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>

            <div className="resumo-linha">
              <span>Subtotal:</span>
              <strong>R$ {calcularTotal().toFixed(2)}</strong>
            </div>

            <div className="desconto-group">
              <label>Desconto (R$):</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={desconto}
                onChange={(e) => setDesconto(Math.max(0, Number(e.target.value)))}
                className="desconto-input"
              />
            </div>

            <div className="resumo-linha total">
              <span>Total:</span>
              <strong>R$ {totalComDesconto.toFixed(2)}</strong>
            </div>

            <div className="pagamento-group">
              <label>Método de Pagamento:</label>
              <select
                value={metodoPagamento}
                onChange={(e) => setMetodoPagamento(e.target.value)}
                className="pagamento-select"
              >
                <option value="dinheiro">💵 Dinheiro</option>
                <option value="credito">💳 Crédito</option>
                <option value="debito">💳 Débito</option>
                <option value="pix">📱 PIX</option>
              </select>
            </div>

            <button
              className="btn-finalizar"
              onClick={finalizarVenda}
              disabled={carrinho.length === 0}
            >
              ✓ Finalizar Venda
            </button>

            <button className="btn-limpar" onClick={() => setCarrinho([])}>
              Limpar Carrinho
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PDV;
