import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { migrateLegacyTenantData } from './tenantMigration';

// Em produção (Render), usar /tmp que tem permissão de escrita
// Em desenvolvimento, usar a pasta local
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/tmp/database.db' 
  : path.join(__dirname, '../../database.db');

// Criar diretório se não existir (para desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export const db = new Database(dbPath);

console.log(`📁 Banco de dados: ${dbPath}`);

// Criar tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER,
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

  CREATE TABLE IF NOT EXISTS planos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    servicos TEXT,
    preco_mensal REAL NOT NULL,
    limite_usuarios INTEGER DEFAULT 5,
    limite_mesas INTEGER DEFAULT 10,
    limite_produtos INTEGER DEFAULT 500,
    limite_vendas_mes INTEGER DEFAULT -1,
    inclui_delivery BOOLEAN DEFAULT 0,
    inclui_relatorios BOOLEAN DEFAULT 1,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    email TEXT NOT NULL UNIQUE,
    telefone TEXT,
    endereco TEXT,
    contato_nome TEXT,
    contato_email TEXT,
    contato_telefone TEXT,
    plano_id INTEGER,
    data_contratacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_renovacao DATETIME,
    ativo BOOLEAN DEFAULT 1,
    total_vendas REAL DEFAULT 0,
    quantidade_vendas INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plano_id) REFERENCES planos(id)
  );

  CREATE TABLE IF NOT EXISTS assinaturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    plano_id INTEGER NOT NULL,
    data_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_fim DATETIME,
    data_renovacao DATETIME,
    status TEXT DEFAULT 'ativa',
    valor_pago REAL,
    metodo_pagamento TEXT,
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id),
    FOREIGN KEY (plano_id) REFERENCES planos(id)
  );

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    empresa_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    senha TEXT NOT NULL,
    tipo TEXT DEFAULT 'admin',
    is_demo BOOLEAN DEFAULT 0,
    demo_expira_em DATETIME,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id)
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

  -- Inserir dados de exemplo de planos
  INSERT OR IGNORE INTO planos (id, nome, descricao, preco_mensal, limite_usuarios, limite_mesas, limite_produtos, inclui_delivery) VALUES
    (1, 'Starter', 'Plano básico para pequenos negócios', 99.90, 3, 5, 200, 0),
    (2, 'Professional', 'Plano intermediário com mais recursos', 199.90, 10, 20, 1000, 1),
    (3, 'Enterprise', 'Plano completo com suporte prioritário', 499.90, -1, -1, -1, 1),
    (4, 'Premium', 'Plano premium com todas as funcionalidades', 299.90, 15, 30, 2000, 1);

  -- Inserir dados de exemplo
  INSERT OR IGNORE INTO produtos (id, nome, descricao, preco, codigo_barras, estoque, categoria) VALUES
    (1, 'Coca-Cola 2L', 'Refrigerante Coca-Cola 2 litros', 8.99, '7894900011517', 50, 'Bebidas'),
    (2, 'Arroz Tipo 1 5kg', 'Arroz branco tipo 1 pacote 5kg', 25.90, '7896016601234', 30, 'Alimentos'),
    (3, 'Feijão Preto 1kg', 'Feijão preto pacote 1kg', 7.50, '7896016602345', 40, 'Alimentos'),
    (4, 'Sabão em Pó 1kg', 'Sabão em pó para roupas 1kg', 12.90, '7891150012345', 25, 'Limpeza');
  `);

console.log('✅ Banco de dados inicializado!');

// Migração simples: adicionar empresa_id na tabela vendas se não existir
try {
  const columns = db.prepare('PRAGMA table_info(vendas)').all();
  const hasEmpresaId = columns.some((c: any) => c.name === 'empresa_id');
  if (!hasEmpresaId) {
    db.prepare('ALTER TABLE vendas ADD COLUMN empresa_id INTEGER').run();
  }
} catch (error) {
  console.error('Erro ao migrar vendas.empresa_id:', error);
}

// Migração simples: adicionar empresa_id na tabela produtos se não existir
try {
  const columns = db.prepare('PRAGMA table_info(produtos)').all();
  const hasEmpresaId = columns.some((c: any) => c.name === 'empresa_id');
  if (!hasEmpresaId) {
    db.prepare('ALTER TABLE produtos ADD COLUMN empresa_id INTEGER').run();
  }
} catch (error) {
  console.error('Erro ao migrar produtos.empresa_id:', error);
}

// Migração: permitir código de barras por empresa (unique por empresa_id + codigo_barras)
try {
  const indices = db.prepare('PRAGMA index_list(produtos)').all() as any[];
  const hasCompositeIndex = indices.some((i: any) => i.name === 'idx_produtos_empresa_codigo');

  if (!hasCompositeIndex) {
    const hasSingleCodigoUnique = indices.some((i: any) => {
      if (!i.unique) return false;
      const cols = db.prepare(`PRAGMA index_info(${i.name})`).all() as any[];
      return cols.length === 1 && (cols[0] as any)?.name === 'codigo_barras';
    });

    if (hasSingleCodigoUnique) {
      db.exec(`
        BEGIN TRANSACTION;

        ALTER TABLE produtos RENAME TO produtos_old;

        CREATE TABLE produtos (
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

        INSERT INTO produtos (id, empresa_id, nome, descricao, preco, codigo_barras, estoque, categoria, ativo, created_at, updated_at)
        SELECT id, empresa_id, nome, descricao, preco, codigo_barras, estoque, categoria, ativo, created_at, updated_at
        FROM produtos_old;

        DROP TABLE produtos_old;

        CREATE UNIQUE INDEX idx_produtos_empresa_codigo
        ON produtos (empresa_id, codigo_barras)
        WHERE codigo_barras IS NOT NULL;

        COMMIT;
      `);
    } else {
      db.exec(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_produtos_empresa_codigo
        ON produtos (empresa_id, codigo_barras)
        WHERE codigo_barras IS NOT NULL;
      `);
    }
  }
} catch (error) {
  console.error('Erro ao migrar unique de produtos.codigo_barras:', error);
}

// Migração simples: adicionar empresa_id na tabela funcionarios se não existir
try {
  const columns = db.prepare('PRAGMA table_info(funcionarios)').all();
  const hasEmpresaId = columns.some((c: any) => c.name === 'empresa_id');
  if (!hasEmpresaId) {
    db.prepare('ALTER TABLE funcionarios ADD COLUMN empresa_id INTEGER').run();
  }
} catch (error) {
  console.error('Erro ao migrar funcionarios.empresa_id:', error);
}

// Migração simples: adicionar campos extras em planos se não existirem
try {
  const columns = db.prepare('PRAGMA table_info(planos)').all();
  const hasCategoria = columns.some((c: any) => c.name === 'categoria');
  const hasDetalhes = columns.some((c: any) => c.name === 'detalhes');
  const hasServicos = columns.some((c: any) => c.name === 'servicos');
  if (!hasCategoria) {
    db.prepare('ALTER TABLE planos ADD COLUMN categoria TEXT').run();
  }
  if (!hasDetalhes) {
    db.prepare('ALTER TABLE planos ADD COLUMN detalhes TEXT').run();
  }
  if (!hasServicos) {
    db.prepare('ALTER TABLE planos ADD COLUMN servicos TEXT').run();
  }
} catch (error) {
  console.error('Erro ao migrar planos.categoria/detalhes:', error);
}

// Migrações: adicionar empresa_id em produtos e clientes
try {
  const prodCols = db.prepare('PRAGMA table_info(produtos)').all();
  const prodHasEmpresaId = prodCols.some((c: any) => c.name === 'empresa_id');
  if (!prodHasEmpresaId) {
    db.prepare('ALTER TABLE produtos ADD COLUMN empresa_id INTEGER').run();
  }
} catch (error) {
  console.error('Erro ao migrar produtos.empresa_id:', error);
}

try {
  const cliCols = db.prepare('PRAGMA table_info(clientes)').all();
  const cliHasEmpresaId = cliCols.some((c: any) => c.name === 'empresa_id');
  if (!cliHasEmpresaId) {
    db.prepare('ALTER TABLE clientes ADD COLUMN empresa_id INTEGER').run();
  }
} catch (error) {
  console.error('Erro ao migrar clientes.empresa_id:', error);
}

// Migrar dados do banco legado para bancos por usuario (tenant)
migrateLegacyTenantData(db);

export default db;
