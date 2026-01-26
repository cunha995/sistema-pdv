# Deploy no Render - Guia Completo

## 📋 Pré-requisitos

1. ✅ Código no GitHub (crie um repositório e faça push)
2. ✅ Conta gratuita no [Render](https://render.com)

## 🚀 MÉTODO SIMPLES (Passo a Passo)

### Passo 1: Preparar o Repositório GitHub

```bash
# Na pasta do projeto, inicialize o git (se ainda não fez)
git init
git add .
git commit -m "Sistema PDV completo"

# Crie um repositório no GitHub e conecte:
git remote add origin https://github.com/SEU-USUARIO/sistema-pdv.git
git branch -M main
git push -u origin main
```

### Passo 2: Criar Web Service no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique no botão **"New +"** no canto superior direito
3. Selecione **"Web Service"**
4. Clique em **"Connect GitHub"** e autorize o Render
5. Selecione o repositório **sistema-pdv**

### Passo 3: Configurar o Serviço

Preencha exatamente assim:

| Campo | Valor |
|-------|-------|
| **Name** | `sistema-pdv-backend` (ou qualquer nome) |
| **Region** | Oregon (US West) |
| **Branch** | `main` |
| **Root Directory** | deixe VAZIO |
| **Runtime** | `Node` |
| **Build Command** | `cd backend && npm install && npm run build` |
| **Start Command** | `cd backend && node dist/server.js` |
| **Plan** | Free |

### Passo 4: Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

- **Key**: `NODE_ENV` | **Value**: `production`

### Passo 5: Criar o Serviço

1. Clique em **"Create Web Service"**
2. Aguarde o deploy (pode levar 2-5 minutos)
3. Você verá os logs do build em tempo real

### ✅ Pronto!

Seu backend estará disponível em:
```
https://sistema-pdv-backend.onrender.com
```

Teste acessando:
```
https://sistema-pdv-backend.onrender.com/api/health
```

---

## 🔧 MÉTODO ALTERNATIVO (Via Dashboard Manual)

1. Acesse [render.com](https://render.com) e faça login
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório Git
4. Configure:
   - **Name**: `sistema-pdv-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (ou outro de sua escolha)
5. Em "Advanced", adicione variável de ambiente:
   - `NODE_ENV` = `production`
6. Clique em "Create Web Service"

### Opção 2: Deploy via render.yaml (Infraestrutura como Código)

1. Commit o arquivo `render.yaml` na raiz do projeto
2. No Render Dashboard, clique em "New +" → "Blueprint"
3. Conecte seu repositório
4. O Render detectará automaticamente o `render.yaml` e criará os serviços

## 🔧 Configurações Importantes

### Banco de Dados
- O SQLite funcionará no Render, mas os dados serão perdidos a cada redeploy
- Para persistência, considere migrar para PostgreSQL:
  1. Crie um PostgreSQL no Render (Free tier disponível)
  2. Instale `pg` no backend: `npm install pg`
  3. Atualize `backend/src/database/index.ts` para usar PostgreSQL

### Variáveis de Ambiente
Adicione no Render Dashboard (ou no render.yaml):
- `NODE_ENV=production`
- `PORT=3000` (automático no Render)
- `DATABASE_URL` (se usar PostgreSQL)

## 📡 Após o Deploy

Seu backend estará disponível em:
```
https://sistema-pdv-backend.onrender.com
```

Endpoints disponíveis:
- `GET /api/health` - Health check
- `GET /api/produtos` - Listar produtos
- `GET /api/vendas` - Listar vendas
- etc.

## 🖥️ Deploy do Frontend

Para o frontend, recomenda-se usar **Vercel** ou **Netlify**:

### Vercel:
1. Conecte o repositório
2. Configure:
   - **Framework**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Adicione variável de ambiente:
   - `VITE_API_URL` = `https://sistema-pdv-backend.onrender.com`
4. Atualize `frontend/src/services/api.ts`:
   ```typescript
   const API_URL = import.meta.env.VITE_API_URL || '/api';
   ```

## ⚠️ Limitações do Plano Free do Render

- Serviço "dorme" após 15 minutos de inatividade
- Primeiro acesso pode demorar 30-60 segundos para "acordar"
- Banco SQLite não é persistente entre deploys
- 750 horas/mês de execução grátis

## 🔄 Redeploy

O Render faz redeploy automaticamente quando você:
- Faz push para a branch principal (main/master)
- Clica em "Manual Deploy" no dashboard

## 📝 Notas

- Certifique-se de que o `.gitignore` não inclui `dist/` do backend
- O banco `database.db` será recriado a cada deploy
- Para produção real, migre para PostgreSQL
