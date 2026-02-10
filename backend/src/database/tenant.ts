import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const isProd = process.env.NODE_ENV === 'production';
const baseDir = isProd
  ? '/tmp/empresas'
  : path.join(__dirname, '../../data/empresas');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

const tenantDbCache = new Map<number, Database>();

const ensureTenantSchema = (db: Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER,
      nome TEXT NOT NULL,
      descricao TEXT,
      preco REAL NOT NULL,
      codigo_barras TEXT,
      estoque INTEGER DEFAULT 0,
      categoria TEXT,
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER,
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
      empresa_id INTEGER,
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

    CREATE TABLE IF NOT EXISTS pedidos_mesa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pendente',
      total REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS chamados_mesa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pendente',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS itens_pedido_mesa (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      produto_id INTEGER NOT NULL,
      quantidade INTEGER NOT NULL,
      preco_unitario REAL NOT NULL,
      subtotal REAL NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos_mesa(id) ON DELETE CASCADE,
      FOREIGN KEY (produto_id) REFERENCES produtos(id)
    );

    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER,
      nome TEXT NOT NULL,
      cpf TEXT UNIQUE NOT NULL,
      email TEXT,
      telefone TEXT,
      cargo TEXT DEFAULT 'Operador de Caixa',
      senha TEXT,
      ativo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS caixa_fechamentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      empresa_id INTEGER,
      operador_id INTEGER,
      operador_nome TEXT NOT NULL,
      operador_tipo TEXT NOT NULL,
      valor_abertura REAL DEFAULT 0,
      recebiveis REAL DEFAULT 0,
      dinheiro REAL NOT NULL,
      cartao REAL NOT NULL,
      pix REAL NOT NULL,
      observacoes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_empresa_codigo
    ON produtos (empresa_id, codigo_barras)
    WHERE codigo_barras IS NOT NULL;
  `);
};

export const getTenantDb = (usuarioId: number) => {
  if (!Number.isFinite(usuarioId)) {
    throw new Error('usuario_id inválido para tenant db');
  }

  const cached = tenantDbCache.get(usuarioId);
  if (cached) return cached;

  const dbPath = path.join(baseDir, `${usuarioId}.db`);
  const db = new Database(dbPath);
  ensureTenantSchema(db);
  tenantDbCache.set(usuarioId, db);
  return db;
};
