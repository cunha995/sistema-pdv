# 🚀 Deploy Frontend PDV no Render

## Passo a Passo:

### 1. Criar Novo Web Service no Render

Acesse: https://dashboard.render.com/

**Configurações:**
- **Name**: `sistema-pdv-frontend`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `frontend`

### 2. Build & Deploy Settings

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
node server.js
```

### 3. Environment Variables

Adicione esta variável de ambiente:
- **Key**: `VITE_API_URL`
- **Value**: `https://sistema-pdv-api.onrender.com/api`

### 4. Salvar e Deploy

Clique em **Create Web Service** e aguarde o deploy (3-5 minutos).

### 5. URL do Frontend

Após o deploy, sua aplicação estará disponível em:
```
https://sistema-pdv-frontend.onrender.com
```

## Arquitetura Final:

```
┌─────────────────────────────────────────┐
│  Frontend (React + Vite)                │
│  https://sistema-pdv-frontend.onrender  │
│  - Interface do PDV                     │
│  - Gestão de produtos                   │
│  - Gestão de clientes                   │
│  - Relatórios                           │
└────────────────┬────────────────────────┘
                 │ API Calls
                 ▼
┌─────────────────────────────────────────┐
│  Backend (Express + Node.js)            │
│  https://sistema-pdv-api.onrender.com   │
│  - API REST                             │
│  - Lógica de negócio                    │
│  - Controle de estoque                  │
└─────────────────────────────────────────┘
```

## Teste Local do Build de Produção:

```bash
# Na pasta frontend
npm run build
node server.js

# Acesse: http://localhost:5173
```

## Comandos Úteis:

```bash
# Build local
cd frontend
npm run build

# Testar build localmente
npm start

# Deploy automático (push para GitHub)
cd ..
git add .
git commit -m "Deploy: Frontend configurado"
git push origin main
```

## Notas:

- ✅ Frontend aponta para API de produção automaticamente
- ✅ Build otimizado para produção (Vite)
- ✅ CORS já configurado no backend
- ✅ React Router configurado para funcionar em produção
- ⚠️  Serviços Render free dormem após 15 min de inatividade
