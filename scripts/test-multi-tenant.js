const BASE_URL = process.env.API_URL || 'https://sistema-pdv-backend.onrender.com/api';

const EMPRESA_A = Number(process.env.EMPRESA_A || 0);
const EMPRESA_B = Number(process.env.EMPRESA_B || 0);
const EMAIL_A = process.env.EMAIL_A || '';
const EMAIL_B = process.env.EMAIL_B || '';
const SENHA_A = process.env.SENHA_A || '';
const SENHA_B = process.env.SENHA_B || '';

const requireEnv = (value, name) => {
  if (!value) {
    throw new Error(`Missing env: ${name}`);
  }
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!response.ok) {
    const message = json?.error || response.statusText || 'Request failed';
    throw new Error(`${response.status} ${message}`);
  }
  return json;
};

const login = async (email, senha, empresaId) => {
  return requestJson(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha, empresa_id: empresaId })
  });
};

const criarProduto = async (token, nome) => {
  return requestJson(`${BASE_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      nome,
      preco: 9.99,
      estoque: 5,
      categoria: 'TESTE'
    })
  });
};

const listarProdutos = async (token, empresaId) => {
  return requestJson(`${BASE_URL}/produtos?empresa_id=${empresaId}&t=${Date.now()}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const run = async () => {
  requireEnv(EMAIL_A, 'EMAIL_A');
  requireEnv(EMAIL_B, 'EMAIL_B');
  requireEnv(SENHA_A, 'SENHA_A');
  requireEnv(SENHA_B, 'SENHA_B');
  requireEnv(EMPRESA_A, 'EMPRESA_A');
  requireEnv(EMPRESA_B, 'EMPRESA_B');

  const loginA = await login(EMAIL_A, SENHA_A, EMPRESA_A);
  const loginB = await login(EMAIL_B, SENHA_B, EMPRESA_B);

  const tokenA = loginA?.token;
  const tokenB = loginB?.token;

  assert(tokenA, 'Token A nao retornou');
  assert(tokenB, 'Token B nao retornou');

  const produtoA = `TESTE A ${Date.now()}`;
  const produtoB = `TESTE B ${Date.now()}`;

  await criarProduto(tokenA, produtoA);
  const produtosB1 = await listarProdutos(tokenB, EMPRESA_B);
  assert(!produtosB1.some((p) => p.nome === produtoA), 'Produto A apareceu na empresa B');

  await criarProduto(tokenB, produtoB);
  const produtosA1 = await listarProdutos(tokenA, EMPRESA_A);
  assert(!produtosA1.some((p) => p.nome === produtoB), 'Produto B apareceu na empresa A');

  console.log('OK: isolamento por empresa validado para produtos.');
};

run().catch((err) => {
  console.error('FALHA:', err.message);
  process.exit(1);
});
