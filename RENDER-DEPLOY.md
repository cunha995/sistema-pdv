# Guia Rápido de Deploy no Render

## ✅ Código está PRONTO para o Render!

### O que foi otimizado:
- ✅ Servidor escuta em `0.0.0.0` (necessário para Render)
- ✅ Porta dinâmica via `process.env.PORT`
- ✅ CORS configurado para aceitar requisições
- ✅ TypeScript nas dependencies (build no Render)
- ✅ Postinstall script para better-sqlite3
- ✅ Rota raiz `/` com informações da API
- ✅ Health check em `/api/health`

---

## 🚀 Deploy no Render (3 minutos)

### 1. Enviar código para GitHub
```bash
git add .
git commit -m "Código otimizado para Render"
git push origin main
```

### 2. Criar Web Service no Render (Backend)

**Acesse**: https://dashboard.render.com

1. Clique **"New +"** → **"Web Service"**
2. Conecte ao GitHub e selecione `sistema-pdv`
3. Configure:

```
Name: sistema-pdv-backend
Region: Oregon (US West)
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free
```

4. **Environment Variables** (clique em "Advanced"):
   - `NODE_ENV` = `production`

5. Clique **"Create Web Service"**

### 3. Criar Web Service no Render (Frontend)

```
Name: sistema-pdv-frontend
Region: Oregon (US West)
Branch: main
Root Directory: frontend
Runtime: Node
Build Command: npm install --include=dev && npm run build
Start Command: node server.js
Instance Type: Free
```

**Environment Variables**:
- `NODE_ENV` = `production`
- `VITE_API_URL` = `https://sistema-pdv-backend.onrender.com/api`
- `API_URL` = `https://sistema-pdv-backend.onrender.com`

### 4. Aguarde o Deploy (2-5 min)

Você verá os logs em tempo real. Quando aparecer:
```
✅ Build successful
🚀 Servidor rodando na porta 10000
```

Está pronto!

---

## 🎯 Testando

Sua API estará em:
```
https://sistema-pdv-backend.onrender.com
```

Seu Frontend estará em:
```
https://sistema-pdv-frontend.onrender.com
```

**Endpoints para testar:**
- `GET /` - Informações da API
- `GET /api/health` - Health check
- `GET /api/produtos` - Lista produtos (com token)
- `GET /api/vendas` - Lista vendas
- `GET /api/clientes` - Lista clientes

**Teste no navegador:**
```
https://SEU-APP.onrender.com/api/health
```

Deve retornar:
```json
{"status":"ok","message":"Sistema PDV API está funcionando!"}
```

---

## ⚠️ Observações Importantes

### SQLite no Render Free
- ✅ Funciona perfeitamente
- ⚠️ Dados são perdidos a cada redeploy
- 💡 Para persistência: migre para PostgreSQL (veja `migrate-to-postgres.sql`)

### Plano Free
- ⏰ Serviço "dorme" após 15 min sem uso
- 🕐 Primeira requisição pode demorar 30-60s (wake up)
- 🆓 750 horas/mês grátis
- 🔄 Auto-deploy quando fizer push no GitHub

### Próximos Passos
1. ✅ Backend no Render
2. ✅ Frontend no Render
3. 🗄️ PostgreSQL para dados persistentes

---

## ❌ Problemas?

### Build falha
- Veja logs no Render Dashboard
- Verifique se o GitHub está conectado
- Certifique-se que a pasta `backend` existe na raiz

### "Application failed to respond"
- Aguarde até 5 minutos no primeiro deploy
- Verifique se a porta está correta (deve usar `process.env.PORT`)

### 404 nas rotas
- Acesse `/` para ver se API está rodando
- Certifique-se de usar `/api/` nas URLs

---

## 🆘 Suporte

Logs em tempo real: Render Dashboard → Seu serviço → "Logs"

Documentação: https://render.com/docs
