import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(__dirname, '../../database.db'));

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    codigo_barras TEXT UNIQUE,
    estoque INTEGER DEFAULT 0,
    categoria TEXT,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER,
    total REAL NOT NULL,
    desconto REAL DEFAULT 0,
    metodo_pagamento TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
  );

  CREATE TABLE IF NOT EXISTS itens_venda (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    venda_id INTEGER NOT NULL,
    produto_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario REAL NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
  );

  -- Inserir dados de exemplo
  INSERT OR IGNORE INTO produtos (id, nome, descricao, preco, codigo_barras, estoque, categoria) VALUES
    (1, 'Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 8.99, '7894900011517', 50, 'Bebidas'),
    (2, 'Arroz Tipo 1 5kg', 'Arroz branco tipo 1 pacote 5kg', 25.90, '7896016601234', 30, 'Alimentos'),
    (3, 'Feijão Preto 1kg', 'Feijão preto pacote 1kg', 7.50, '7896016602345', 40, 'Alimentos'),
    (4, 'Sabão em Pó 1kg', 'Sabão em pó para roupas 1kg', 12.90, '7891150012345', 25, 'Limpeza');
`);

console.log('✅ Banco de dados inicializado!');

export default db;
