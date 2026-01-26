-- Script para migração de SQLite para PostgreSQL
-- Execute este script no PostgreSQL após criar o banco de dados

CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL,
  codigo_barras VARCHAR(50) UNIQUE,
  estoque INTEGER DEFAULT 0,
  categoria VARCHAR(100),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) UNIQUE,
  telefone VARCHAR(20),
  email VARCHAR(255),
  endereco TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vendas (
  id SERIAL PRIMARY KEY,
  cliente_id INTEGER REFERENCES clientes(id),
  total DECIMAL(10, 2) NOT NULL,
  desconto DECIMAL(10, 2) DEFAULT 0,
  metodo_pagamento VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_venda (
  id SERIAL PRIMARY KEY,
  venda_id INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id INTEGER NOT NULL REFERENCES produtos(id),
  quantidade INTEGER NOT NULL,
  preco_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- Inserir dados de exemplo
INSERT INTO produtos (nome, descricao, preco, codigo_barras, estoque, categoria) VALUES
  ('Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 8.99, '7894900011517', 50, 'Bebidas'),
  ('Arroz Tipo 1 5kg', 'Arroz branco tipo 1 pacote 5kg', 25.90, '7896016601234', 30, 'Alimentos'),
  ('Feijão Preto 1kg', 'Feijão preto pacote 1kg', 7.50, '7896016602345', 40, 'Alimentos'),
  ('Sabão em Pó 1kg', 'Sabão em pó para roupas 1kg', 12.90, '7891150012345', 25, 'Limpeza')
ON CONFLICT DO NOTHING;

-- Índices para melhor performance
CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);
CREATE INDEX idx_clientes_cpf ON clientes(cpf);
CREATE INDEX idx_vendas_created_at ON vendas(created_at);
CREATE INDEX idx_itens_venda_venda_id ON itens_venda(venda_id);
CREATE INDEX idx_itens_venda_produto_id ON itens_venda(produto_id);
