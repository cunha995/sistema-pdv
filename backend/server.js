const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados mockados em memória (temporário)
let produtos = [
  {
    id: 1,
    nome: 'Coca-Cola 2L',
    descricao: 'Refrigerante Coca-Cola 2 litros',
    preco: 8.99,
    codigo_barras: '7894900011517',
    estoque: 50,
    categoria: 'Bebidas',
    ativo: 1
  },
  {
    id: 2,
    nome: 'Arroz Tio João 5kg',
    descricao: 'Arroz branco tipo 1',
    preco: 25.90,
    codigo_barras: '7896496903498',
    estoque: 30,
    categoria: 'Alimentos',
    ativo: 1
  }
];

let clientes = [];
let vendas = [];
let nextProdutoId = 3;
let nextClienteId = 1;
let nextVendaId = 1;

// ============= ROTAS DE PRODUTOS =============
app.get('/api/produtos', (req, res) => {
  const produtosAtivos = produtos.filter(p => p.ativo === 1);
  res.json(produtosAtivos);
});

app.get('/api/produtos/:id', (req, res) => {
  const produto = produtos.find(p => p.id === parseInt(req.params.id));
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(produto);
});

app.get('/api/produtos/codigo/:codigo', (req, res) => {
  const produto = produtos.find(p => p.codigo_barras === req.params.codigo);
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }
  res.json(produto);
});

app.post('/api/produtos', (req, res) => {
  const { nome, descricao, preco, codigo_barras, estoque, categoria } = req.body;
  
  if (!nome || !preco) {
    return res.status(400).json({ error: 'Nome e preço são obrigatórios' });
  }

  const novoProduto = {
    id: nextProdutoId++,
    nome,
    descricao: descricao || '',
    preco: parseFloat(preco),
    codigo_barras: codigo_barras || '',
    estoque: parseInt(estoque) || 0,
    categoria: categoria || '',
    ativo: 1
  };

  produtos.push(novoProduto);
  res.status(201).json(novoProduto);
});

app.put('/api/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = produtos.findIndex(p => p.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  const { nome, descricao, preco, codigo_barras, estoque, categoria } = req.body;
  
  produtos[index] = {
    ...produtos[index],
    nome: nome || produtos[index].nome,
    descricao: descricao !== undefined ? descricao : produtos[index].descricao,
    preco: preco !== undefined ? parseFloat(preco) : produtos[index].preco,
    codigo_barras: codigo_barras !== undefined ? codigo_barras : produtos[index].codigo_barras,
    estoque: estoque !== undefined ? parseInt(estoque) : produtos[index].estoque,
    categoria: categoria !== undefined ? categoria : produtos[index].categoria
  };

  res.json(produtos[index]);
});

app.delete('/api/produtos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  produto.ativo = 0;
  res.json({ message: 'Produto removido com sucesso' });
});

app.patch('/api/produtos/:id/estoque', (req, res) => {
  const id = parseInt(req.params.id);
  const { quantidade } = req.body;
  const produto = produtos.find(p => p.id === id);
  
  if (!produto) {
    return res.status(404).json({ error: 'Produto não encontrado' });
  }

  produto.estoque = parseInt(quantidade);
  res.json(produto);
});

// ============= ROTAS DE CLIENTES =============
app.get('/api/clientes', (req, res) => {
  res.json(clientes);
});

app.post('/api/clientes', (req, res) => {
  const { nome, cpf, telefone, email, endereco } = req.body;
  
  if (!nome) {
    return res.status(400).json({ error: 'Nome é obrigatório' });
  }

  const novoCliente = {
    id: nextClienteId++,
    nome,
    cpf: cpf || '',
    telefone: telefone || '',
    email: email || '',
    endereco: endereco || ''
  };

  clientes.push(novoCliente);
  res.status(201).json(novoCliente);
});

app.put('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  const { nome, cpf, telefone, email, endereco } = req.body;
  
  clientes[index] = {
    ...clientes[index],
    nome: nome || clientes[index].nome,
    cpf: cpf !== undefined ? cpf : clientes[index].cpf,
    telefone: telefone !== undefined ? telefone : clientes[index].telefone,
    email: email !== undefined ? email : clientes[index].email,
    endereco: endereco !== undefined ? endereco : clientes[index].endereco
  };

  res.json(clientes[index]);
});

app.delete('/api/clientes/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = clientes.findIndex(c => c.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Cliente não encontrado' });
  }

  clientes.splice(index, 1);
  res.json({ message: 'Cliente removido com sucesso' });
});

// ============= ROTAS DE VENDAS =============
app.get('/api/vendas', (req, res) => {
  res.json(vendas);
});

app.get('/api/vendas/:id', (req, res) => {
  const venda = vendas.find(v => v.id === parseInt(req.params.id));
  if (!venda) {
    return res.status(404).json({ error: 'Venda não encontrada' });
  }
  res.json(venda);
});

app.post('/api/vendas', (req, res) => {
  const { cliente_id, total, desconto, metodo_pagamento, itens, observacoes } = req.body;
  
  if (!itens || itens.length === 0) {
    return res.status(400).json({ error: 'Venda deve ter pelo menos um item' });
  }

  // Validar estoque
  for (const item of itens) {
    const produto = produtos.find(p => p.id === item.produto_id);
    if (!produto) {
      return res.status(400).json({ error: `Produto ${item.produto_id} não encontrado` });
    }
    if (produto.estoque < item.quantidade) {
      return res.status(400).json({ error: `Estoque insuficiente para ${produto.nome}` });
    }
  }

  // Atualizar estoque
  for (const item of itens) {
    const produto = produtos.find(p => p.id === item.produto_id);
    produto.estoque -= item.quantidade;
  }

  const novaVenda = {
    id: nextVendaId++,
    cliente_id: cliente_id || null,
    total: parseFloat(total),
    desconto: parseFloat(desconto) || 0,
    metodo_pagamento: metodo_pagamento || 'Dinheiro',
    observacoes: observacoes || '',
    itens: itens,
    created_at: new Date().toISOString()
  };

  vendas.push(novaVenda);
  res.status(201).json(novaVenda);
});

app.get('/api/vendas/relatorio', (req, res) => {
  const { data_inicio, data_fim } = req.query;
  
  let vendasFiltradas = vendas;
  
  if (data_inicio) {
    vendasFiltradas = vendasFiltradas.filter(v => v.created_at >= data_inicio);
  }
  
  if (data_fim) {
    vendasFiltradas = vendasFiltradas.filter(v => v.created_at <= data_fim);
  }

  const totalVendas = vendasFiltradas.reduce((sum, v) => sum + v.total, 0);
  const quantidadeVendas = vendasFiltradas.length;

  res.json({
    vendas: vendasFiltradas,
    total: totalVendas,
    quantidade: quantidadeVendas
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema PDV',
    version: '1.0.0',
    endpoints: {
      produtos: '/api/produtos',
      clientes: '/api/clientes',
      vendas: '/api/vendas'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor PDV rodando na porta ${PORT}`);
  console.log(`📦 ${produtos.length} produtos carregados`);
  console.log(`👥 ${clientes.length} clientes`);
  console.log(`🛒 ${vendas.length} vendas`);
});
