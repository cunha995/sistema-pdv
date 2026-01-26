# 🚀 Deploy Frontend PDV no Render

## 📋 Guia Completo Passo a Passo

### Passo 1: Acessar Dashboard do Render
1. Abra o navegador e acesse: **https://dashboard.render.com/**
2. Faça login com sua conta GitHub
3. No dashboard, clique no botão **"New +"** no canto superior direito
4. Selecione **"Web Service"**

---

### Passo 2: Conectar Repositório
1. Na tela "Create a new Web Service"
2. Em "Connect a repository":
   - Se ainda não conectou, clique em **"Connect GitHub"**
   - Autorize o Render a acessar seus repositórios
3. Procure por **"cunha995/sistema-pdv"**
4. Clique em **"Connect"** ao lado do repositório

---

### Passo 3: Configurações Básicas
Preencha os campos:

**Name (Nome do serviço):**
```
sistema-pdv-frontend
```

**Region (Região):**
```
Oregon (US West)
```
*Escolha a mesma região do backend para menor latência*

**Branch:**
```
main
```

**Root Directory (IMPORTANTE!):**
```
frontend
```
*⚠️ Não esqueça de preencher este campo!*

---

### Passo 4: Build Settings

**Build Command:**
```bash
npm install && npm run build
```
*Este comando instala as dependências e compila o React*

**Start Command:**
```bash
node server.js
```
*Este comando inicia o servidor Express que serve os arquivos compilados*

---

### Passo 5: Plano (Opcional)

**Instance Type:**
```
Free ($0/month)
```
*Suficiente para testes e pequenos projetos*

**Recursos do plano Free:**
- ✅ 750 horas/mês
- ✅ Deploy automático do GitHub
- ⚠️ Serviço "dorme" após 15 min sem uso
- ⚠️ Reinício leva ~30 segundos

---

### Passo 6: Environment Variables (Opcional)

Clique em **"Advanced"** e adicione:

**Key:** `VITE_API_URL`  
**Value:** `https://sistema-pdv-api.onrender.com/api`

*Nota: Se não adicionar, o frontend usará esta URL por padrão (já configurada no código)*

---

### Passo 7: Criar Serviço

1. Revise todas as configurações:
   - ✅ Name: sistema-pdv-frontend
   - ✅ Root Directory: frontend
   - ✅ Build Command: npm install && npm run build
   - ✅ Start Command: node server.js

2. Clique em **"Create Web Service"**

---

### Passo 8: Aguardar Deploy

O Render irá:
1. ✅ Clonar o repositório
2. ✅ Navegar para a pasta `frontend/`
3. ✅ Executar `npm install` (instalação de dependências)
4. ✅ Executar `npm run build` (compilação do Vite)
5. ✅ Iniciar o servidor com `node server.js`

**Tempo estimado:** 3-5 minutos

Você verá logs em tempo real como:
```
Installing dependencies...
Building for production...
✓ built in 45s
Your service is live 🎉
```

---

### Passo 9: Testar a Aplicação

Após o deploy bem-sucedido:

**URL do Frontend:**
```
https://sistema-pdv-frontend.onrender.com
```

**Testar funcionalidades:**
1. ✅ Acesse a URL do frontend
2. ✅ Navegue para "Produtos" - deve carregar dados da API
3. ✅ Teste criar um produto
4. ✅ Navegue para "PDV" - deve funcionar normalmente
5. ✅ Teste uma venda

---

### Passo 10: Configurar Auto-Deploy (Já Ativo!)

O Render já está configurado para:
- ✅ Detectar pushes no branch `main`
- ✅ Fazer deploy automático a cada commit
- ✅ Notificar por email sobre status do deploy

Para fazer novo deploy:
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
```

O Render detectará automaticamente e fará o deploy!

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
