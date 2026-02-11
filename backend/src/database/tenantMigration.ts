import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { getTenantDb } from './tenant';

const hasLegacyTable = (db: DatabaseType, tableName: string) => {
  const row = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`)
    .get(tableName);
  return !!row;
};

export const migrateLegacyTenantData = (masterDb: DatabaseType) => {
  try {
    if (!hasLegacyTable(masterDb, 'produtos')) {
      return;
    }

    masterDb.exec(`
      CREATE TABLE IF NOT EXISTS tenant_migrations (
        empresa_id INTEGER PRIMARY KEY,
        migrated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const empresas = masterDb
      .prepare('SELECT id FROM empresas WHERE ativo = 1')
      .all() as { id: number }[];

    const hasPedidosMesa = hasLegacyTable(masterDb, 'pedidos_mesa');
    const hasItensPedido = hasLegacyTable(masterDb, 'itens_pedido_mesa');

    for (const empresa of empresas) {
      const jaMigrado = masterDb
        .prepare('SELECT empresa_id FROM tenant_migrations WHERE empresa_id = ?')
        .get(empresa.id);
      if (jaMigrado) continue;

      const tenantDb = getTenantDb(empresa.id);
      const empresaId = empresa.id;

      tenantDb.transaction(() => {
        const produtos = masterDb
          .prepare('SELECT * FROM produtos WHERE empresa_id = ?')
          .all(empresaId) as any[];
        if (produtos.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO produtos
            (id, empresa_id, nome, descricao, preco, codigo_barras, estoque, categoria, imagem_url, ativo, created_at, updated_at)
            VALUES (@id, @empresa_id, @nome, @descricao, @preco, @codigo_barras, @estoque, @categoria, @imagem_url, @ativo, @created_at, @updated_at)
          `);
          produtos.forEach((row) => stmt.run(row));
        }

        const clientes = masterDb
          .prepare('SELECT * FROM clientes WHERE empresa_id = ?')
          .all(empresaId) as any[];
        if (clientes.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO clientes
            (id, empresa_id, nome, cpf, telefone, email, endereco, created_at, updated_at)
            VALUES (@id, @empresa_id, @nome, @cpf, @telefone, @email, @endereco, @created_at, @updated_at)
          `);
          clientes.forEach((row) => stmt.run(row));
        }

        const vendas = masterDb
          .prepare('SELECT * FROM vendas WHERE empresa_id = ?')
          .all(empresaId) as any[];
        if (vendas.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO vendas
            (id, empresa_id, cliente_id, total, desconto, metodo_pagamento, observacoes, created_at)
            VALUES (@id, @empresa_id, @cliente_id, @total, @desconto, @metodo_pagamento, @observacoes, @created_at)
          `);
          vendas.forEach((row) => stmt.run(row));
        }

        const itensVenda = masterDb.prepare(`
          SELECT iv.*
          FROM itens_venda iv
          JOIN vendas v ON v.id = iv.venda_id
          WHERE v.empresa_id = ?
        `).all(empresaId) as any[];
        if (itensVenda.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO itens_venda
            (id, venda_id, produto_id, quantidade, preco_unitario, subtotal)
            VALUES (@id, @venda_id, @produto_id, @quantidade, @preco_unitario, @subtotal)
          `);
          itensVenda.forEach((row) => stmt.run(row));
        }

        const funcionarios = masterDb
          .prepare('SELECT * FROM funcionarios WHERE empresa_id = ?')
          .all(empresaId) as any[];
        if (funcionarios.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO funcionarios
            (id, empresa_id, nome, cpf, email, telefone, cargo, senha, ativo, created_at, updated_at)
            VALUES (@id, @empresa_id, @nome, @cpf, @email, @telefone, @cargo, @senha, @ativo, @created_at, @updated_at)
          `);
          funcionarios.forEach((row) => stmt.run(row));
        }

        const caixa = masterDb
          .prepare('SELECT * FROM caixa_fechamentos WHERE empresa_id = ?')
          .all(empresaId) as any[];
        if (caixa.length) {
          const stmt = tenantDb.prepare(`
            INSERT OR IGNORE INTO caixa_fechamentos
            (id, empresa_id, operador_id, operador_nome, operador_tipo, valor_abertura, recebiveis, dinheiro, cartao, pix, observacoes, created_at)
            VALUES (@id, @empresa_id, @operador_id, @operador_nome, @operador_tipo, @valor_abertura, @recebiveis, @dinheiro, @cartao, @pix, @observacoes, @created_at)
          `);
          caixa.forEach((row) => stmt.run(row));
        }

        if (hasPedidosMesa && hasItensPedido) {
          const pedidos = masterDb.prepare(`
            SELECT DISTINCT pm.*
            FROM pedidos_mesa pm
            JOIN itens_pedido_mesa ipm ON ipm.pedido_id = pm.id
            JOIN produtos p ON p.id = ipm.produto_id
            WHERE p.empresa_id = ?
          `).all(empresaId) as any[];
          if (pedidos.length) {
            const stmt = tenantDb.prepare(`
              INSERT OR IGNORE INTO pedidos_mesa
              (id, mesa_id, status, total, created_at, updated_at)
              VALUES (@id, @mesa_id, @status, @total, @created_at, @updated_at)
            `);
            pedidos.forEach((row) => stmt.run(row));
          }

          const itensPedido = masterDb.prepare(`
            SELECT ipm.*
            FROM itens_pedido_mesa ipm
            JOIN produtos p ON p.id = ipm.produto_id
            WHERE p.empresa_id = ?
          `).all(empresaId) as any[];
          if (itensPedido.length) {
            const stmt = tenantDb.prepare(`
              INSERT OR IGNORE INTO itens_pedido_mesa
              (id, pedido_id, produto_id, quantidade, preco_unitario, subtotal)
              VALUES (@id, @pedido_id, @produto_id, @quantidade, @preco_unitario, @subtotal)
            `);
            itensPedido.forEach((row) => stmt.run(row));
          }
        }
      })();

      masterDb
        .prepare('INSERT OR IGNORE INTO tenant_migrations (empresa_id) VALUES (?)')
        .run(empresa.id);
    }
  } catch (error) {
    console.error('Erro ao migrar dados para tenant db:', error);
  }
};
