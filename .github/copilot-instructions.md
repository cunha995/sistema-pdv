# Instruções para GitHub Copilot - Sistema PDV

## Arquitetura do Sistema

Este é um sistema PDV (Ponto de Venda) full-stack com:
- **Backend**: Node.js + Express + TypeScript + SQLite
- **Frontend**: React + TypeScript + Vite
- **Estrutura monorepo**: Backend e frontend em diretórios separados, gerenciados pela raiz

## Estrutura de Diretórios

```
sistema-PDV/
├── backend/              # API REST
│   ├── src/
│   │   ├── controllers/  # Lógica de negócio (Produto, Cliente, Venda)
│   │   ├── routes/       # Definição de rotas da API
│   │   ├── models/       # Tipos TypeScript
│   │   ├── database/     # Configuração do SQLite
│   │   └── server.ts     # Ponto de entrada
│   └── database.db       # Banco SQLite (criado automaticamente)
│
└── frontend/             # Interface React
    ├── src/
    │   ├── pages/        # PDV, Produtos, Vendas, Clientes
    │   ├── services/     # Comunicação com API (api.ts)
    │   └── types/        # Tipos compartilhados
    └── vite.config.ts    # Proxy /api -> localhost:3000
```

## Como Executar

### Primeira vez (instalar dependências):
```bash
npm run install:all
```

### Desenvolvimento (Backend + Frontend juntos):
```bash
npm run dev
```

O backend roda na porta 3000 e o frontend na porta 5173.

## Padrões de Código

### Backend
- **Controllers**: Métodos estáticos que recebem `(req, res)` e retornam JSON
- **Rotas**: Registradas em arquivos separados (produtos.ts, clientes.ts, vendas.ts)
- **Database**: Usa `better-sqlite3` com prepared statements para segurança
- **Transações**: Vendas usam transações para garantir consistência (estoque + venda)
- **Soft Delete**: Produtos usam flag `ativo` ao invés de DELETE físico

### Frontend
- **Serviços API**: Centralizados em `services/api.ts` usando fetch
- **Estado**: useState para estado local, sem Redux/Context (projeto pequeno)
- **Formulários**: Formulários controlados com validação básica
- **Estilização**: CSS global em `App.css` (sem CSS-in-JS ou Tailwind)

## API Endpoints

### Produtos
- `GET /api/produtos` - Listar todos
- `GET /api/produtos/:id` - Buscar por ID
- `GET /api/produtos/codigo/:codigo` - Buscar por código de barras
- `POST /api/produtos` - Criar
- `PUT /api/produtos/:id` - Atualizar
- `DELETE /api/produtos/:id` - Deletar (soft delete)
- `PATCH /api/produtos/:id/estoque` - Atualizar estoque

### Clientes
- `GET /api/clientes` - Listar todos
- `POST /api/clientes` - Criar
- `PUT /api/clientes/:id` - Atualizar
- `DELETE /api/clientes/:id` - Deletar

### Vendas
- `GET /api/vendas` - Listar todas
- `GET /api/vendas/:id` - Buscar com itens
- `POST /api/vendas` - Criar (transação: insere venda + itens + atualiza estoque)
- `GET /api/vendas/relatorio?data_inicio=&data_fim=` - Relatório

## Fluxo de Dados Críticos

### Criar Venda (PDV)
1. Frontend envia: `{ total, metodo_pagamento, itens: [{ produto_id, quantidade, preco_unitario, subtotal }] }`
2. Backend valida estoque de todos os itens
3. Transação: insere venda → insere itens → decrementa estoque
4. Rollback automático em caso de erro

### Buscar Produto por Código de Barras
- Rota especial: `/api/produtos/codigo/:codigo`
- Usada no PDV para busca rápida por leitor de código de barras

## Convenções de Nomenclatura

- **Arquivos**: PascalCase para componentes React e controllers (ProdutoController.ts)
- **Rotas**: kebab-case em URLs (/api/produtos)
- **Variáveis**: camelCase
- **Tabelas**: snake_case (itens_venda, codigo_barras)

## Banco de Dados

### Schema SQLite
```sql
produtos (id, nome, descricao, preco, codigo_barras UNIQUE, estoque, categoria, ativo, timestamps)
clientes (id, nome, cpf UNIQUE, telefone, email, endereco, timestamps)
vendas (id, cliente_id, total, desconto, metodo_pagamento, observacoes, created_at)
itens_venda (id, venda_id, produto_id, quantidade, preco_unitario, subtotal)
```

### Inicialização
- Database auto-criado na primeira execução do backend
- Dados de exemplo inseridos automaticamente (4 produtos)

## Decisões Técnicas

1. **SQLite**: Escolhido para facilitar setup (sem servidor de BD externo)
2. **Monorepo simples**: Sem ferramentas como Nx/Turborepo para manter simplicidade
3. **Sem ORM**: better-sqlite3 direto para controle total e performance
4. **Proxy Vite**: Frontend faz chamadas para `/api` que são redirecionadas ao backend
5. **Sem autenticação**: Sistema básico, adicionar JWT futuramente se necessário

## Debugging

- Backend: Logs aparecem no terminal do backend
- Erros de API: Retornados como `{ error: "mensagem" }` com status HTTP apropriado
- Database: Arquivo `backend/database.db` pode ser inspecionado com ferramentas SQLite

## Expansões Futuras

Ao adicionar funcionalidades, considere:
- Autenticação/autorização (JWT)
- Relatórios avançados (gráficos)
- Impressão de notas fiscais
- Integração com leitores de código de barras
- Backup automático do banco de dados
- Deploy (backend: Railway/Render, frontend: Vercel/Netlify)
