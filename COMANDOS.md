# Comandos do Sistema PDV

## 🚀 Instalação

```bash
# Instalar todas as dependências (backend + frontend)
npm run install:all
```

## 💻 Desenvolvimento Local

```bash
# Rodar apenas o backend (porta 3000)
npm run dev

# Rodar apenas o frontend (porta 5173)
npm run dev:frontend

# Rodar backend + frontend simultaneamente
npm run dev:full
```

## 📦 Build

```bash
# Build do frontend para produção
npm run build:frontend
```

## 🧪 Testes

```bash
# Testar todos os endpoints da API local
npm run test:api

# Testar API em produção
API_URL=https://sistema-pdv-api.onrender.com npm run test:api
```

## 🌐 Deploy

```bash
# Commit e push para GitHub (dispara deploy automático no Render)
npm run deploy
```

## 📡 Endpoints da API

### Produtos
- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos/:id` - Buscar produto por ID
- `GET /api/produtos/codigo/:codigo` - Buscar por código de barras
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto (soft delete)
- `PATCH /api/produtos/:id/estoque` - Atualizar estoque

### Clientes
- `GET /api/clientes` - Listar todos os clientes
- `POST /api/clientes` - Criar cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

### Vendas
- `GET /api/vendas` - Listar todas as vendas
- `GET /api/vendas/:id` - Buscar venda por ID (com itens)
- `POST /api/vendas` - Criar venda
- `GET /api/vendas/relatorio?data_inicio=&data_fim=` - Relatório de vendas

### Utilitários
- `GET /` - Informações da API
- `GET /health` - Health check

## 🔧 Exemplos de Requisições

### Criar Produto
```bash
curl -X POST https://sistema-pdv-api.onrender.com/api/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Produto Teste",
    "descricao": "Descrição",
    "preco": 19.90,
    "codigo_barras": "1234567890123",
    "estoque": 50,
    "categoria": "Teste"
  }'
```

### Buscar Produtos
```bash
curl https://sistema-pdv-api.onrender.com/api/produtos
```

### Criar Cliente
```bash
curl -X POST https://sistema-pdv-api.onrender.com/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "cpf": "12345678900",
    "telefone": "11999999999",
    "email": "joao@email.com"
  }'
```

### Criar Venda
```bash
curl -X POST https://sistema-pdv-api.onrender.com/api/vendas \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": 1,
    "total": 17.98,
    "desconto": 0,
    "metodo_pagamento": "Cartão",
    "itens": [
      {
        "produto_id": 1,
        "quantidade": 2,
        "preco_unitario": 8.99,
        "subtotal": 17.98
      }
    ]
  }'
```

### Relatório de Vendas
```bash
curl "https://sistema-pdv-api.onrender.com/api/vendas/relatorio?data_inicio=2026-01-01&data_fim=2026-12-31"
```

## 🔑 Variáveis de Ambiente

### Backend
```env
PORT=3000
NODE_ENV=production
```

### Frontend
```env
VITE_API_URL=https://sistema-pdv-api.onrender.com
```

## 📂 Estrutura do Projeto

```
sistema-PDV/
├── backend/
│   ├── server.js          # Servidor Express
│   ├── index.js           # Servidor HTTP simples (fallback)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/         # PDV, Produtos, Vendas, Clientes
│   │   ├── services/      # api.ts
│   │   └── types/
│   └── package.json
├── scripts/
│   └── test-api.js        # Script de testes
├── package.json           # Scripts raiz
└── README.md
```

## 🌐 URLs

- **API Produção**: https://sistema-pdv-api.onrender.com
- **GitHub**: https://github.com/cunha995/sistema-pdv
- **API Local**: http://localhost:3000
- **Frontend Local**: http://localhost:5173

## ⚠️ Notas Importantes

1. **Dados em memória**: Atualmente os dados são armazenados em memória e são perdidos quando o servidor reinicia
2. **Sleep no Render**: O servidor "dorme" após 15 minutos de inatividade (plano gratuito)
3. **CORS**: Configurado para aceitar requisições de qualquer origem
4. **Validações**: API valida estoque antes de criar vendas
