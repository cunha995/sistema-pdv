// Script para testar todos os endpoints da API
const API_URL = process.env.API_URL || 'http://localhost:3000';

console.log('🧪 Testando API do Sistema PDV');
console.log(`📍 URL: ${API_URL}\n`);

async function testEndpoint(method, path, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${path}`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Resposta:`, JSON.stringify(data).substring(0, 100));
    console.log('');
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${method} ${path}`);
    console.log(`   Erro: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('=== TESTE DE ENDPOINTS ===\n');

  // Health check
  await testEndpoint('GET', '/health');
  
  // Info
  await testEndpoint('GET', '/');
  
  // Produtos
  console.log('--- PRODUTOS ---');
  await testEndpoint('GET', '/api/produtos');
  await testEndpoint('GET', '/api/produtos/1');
  await testEndpoint('GET', '/api/produtos/codigo/7894900011517');
  
  const novoProduto = await testEndpoint('POST', '/api/produtos', {
    nome: 'Produto Teste',
    descricao: 'Descrição teste',
    preco: 10.50,
    codigo_barras: '1234567890123',
    estoque: 100,
    categoria: 'Teste'
  });
  
  if (novoProduto.success) {
    const produtoId = novoProduto.data.id;
    await testEndpoint('PUT', `/api/produtos/${produtoId}`, {
      nome: 'Produto Atualizado',
      preco: 15.00
    });
    await testEndpoint('PATCH', `/api/produtos/${produtoId}/estoque`, {
      quantidade: 50
    });
  }
  
  // Clientes
  console.log('--- CLIENTES ---');
  await testEndpoint('GET', '/api/clientes');
  
  const novoCliente = await testEndpoint('POST', '/api/clientes', {
    nome: 'Cliente Teste',
    cpf: '12345678900',
    telefone: '11999999999',
    email: 'teste@email.com'
  });
  
  if (novoCliente.success) {
    const clienteId = novoCliente.data.id;
    await testEndpoint('PUT', `/api/clientes/${clienteId}`, {
      nome: 'Cliente Atualizado'
    });
  }
  
  // Vendas
  console.log('--- VENDAS ---');
  await testEndpoint('GET', '/api/vendas');
  
  await testEndpoint('POST', '/api/vendas', {
    cliente_id: null,
    total: 17.98,
    desconto: 0,
    metodo_pagamento: 'Dinheiro',
    itens: [
      {
        produto_id: 1,
        quantidade: 2,
        preco_unitario: 8.99,
        subtotal: 17.98
      }
    ]
  });
  
  await testEndpoint('GET', '/api/vendas/relatorio?data_inicio=2026-01-01&data_fim=2026-12-31');
  
  console.log('✅ Testes concluídos!');
}

runTests().catch(console.error);
