# Sistema PDV (Ponto de Venda)

Sistema completo de Ponto de Venda com gestão de produtos, vendas, estoque e clientes.

## 🚀 Tecnologias

- **Backend**: Node.js + Express + TypeScript + SQLite
- **Frontend**: React + TypeScript + Vite
- **Estilização**: CSS Modules

## 📦 Instalação

```bash
# Instalar todas as dependências
npm run install:all
```

## 🎯 Como Executar

### Desenvolvimento (Backend + Frontend juntos)
```bash
npm run dev
```

### Executar separadamente

**Backend** (porta 3000):
```bash
npm run dev:backend
```

**Frontend** (porta 5173):
```bash
npm run dev:frontend
```

## 📂 Estrutura do Projeto

```
sistema-PDV/
├── backend/          # API REST com Express
│   ├── src/
│   │   ├── controllers/   # Lógica de negócios
│   │   ├── models/        # Modelos de dados
│   │   ├── routes/        # Rotas da API
│   │   ├── database/      # Configuração do BD
│   │   └── server.ts      # Entrada da aplicação
│   └── database.db        # Banco SQLite
│
└── frontend/         # Interface React
    ├── src/
    │   ├── components/    # Componentes reutilizáveis
    │   ├── pages/         # Páginas da aplicação
    │   ├── services/      # Comunicação com API
    │   └── types/         # Tipos TypeScript
    └── ...
```

## 🔌 API Endpoints

### Produtos
- `GET /api/produtos` - Listar todos os produtos
- `GET /api/produtos/:id` - Buscar produto por ID
- `POST /api/produtos` - Criar novo produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Deletar produto

### Vendas
- `GET /api/vendas` - Listar todas as vendas
- `GET /api/vendas/:id` - Buscar venda por ID
- `POST /api/vendas` - Registrar nova venda

### Clientes
- `GET /api/clientes` - Listar todos os clientes
- `GET /api/clientes/:id` - Buscar cliente por ID
- `POST /api/clientes` - Cadastrar novo cliente
- `PUT /api/clientes/:id` - Atualizar cliente
- `DELETE /api/clientes/:id` - Deletar cliente

## 💻 Funcionalidades

### Gestão de Produtos
- ✅ Cadastro de produtos
- ✅ Controle de estoque
- ✅ Preços e códigos de barras
- ✅ Categorias

### PDV (Caixa)
- ✅ Interface de vendas rápida
- ✅ Busca por código de barras
- ✅ Cálculo automático de total
- ✅ Registro de vendas

### Gestão de Vendas
- ✅ Histórico de vendas
- ✅ Detalhes de cada venda
- ✅ Relatórios básicos

### Clientes
- ✅ Cadastro de clientes
- ✅ Histórico de compras

## 🗄️ Banco de Dados

O sistema usa SQLite com as seguintes tabelas:

- **produtos**: Armazena informações dos produtos
- **vendas**: Registra as vendas realizadas
- **itens_venda**: Itens individuais de cada venda
- **clientes**: Cadastro de clientes

## 🔧 Build para Produção

```bash
npm run build
npm start
```

## 🌐 Deploy

### Backend (Render)
Veja instruções completas em [.render/README.md](.render/README.md)

**Resumo rápido:**
1. Crie conta no [Render](https://render.com)
2. Conecte seu repositório GitHub
3. Use o arquivo `render.yaml` para deploy automático

### Frontend (Vercel/Netlify)
1. **Vercel**: Conecte o repositório, configure root como `frontend`
2. **Netlify**: Mesmo processo, apontando para pasta `frontend`

⚠️ **Importante**: No Render Free, o SQLite não é persistente. Para produção, migre para PostgreSQL.

## 📝 Licença

MIT
