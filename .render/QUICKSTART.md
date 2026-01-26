# 🚀 GUIA RÁPIDO - Deploy no Render

## Opção Mais Simples (sem GitHub)

O Render também permite fazer upload direto, mas o melhor é usar GitHub.

---

## ✅ MÉTODO RECOMENDADO (com GitHub)

### Passo 1: Colocar no GitHub

```powershell
# Execute no PowerShell dentro da pasta sistema-PDV

# 1. Inicializar Git
git init

# 2. Adicionar arquivos
git add .

# 3. Fazer commit
git commit -m "Sistema PDV completo"

# 4. Criar repositório no GitHub primeiro (acesse github.com)
# Depois conecte:
git remote add origin https://github.com/SEU-USUARIO/sistema-pdv.git
git branch -M main
git push -u origin main
```

📖 **Precisa de ajuda com GitHub?** Veja [GITHUB.md](GITHUB.md)

---

### Passo 2: Deploy no Render

1. Acesse **[render.com](https://render.com)**
2. Faça login/cadastro (gratuito)
3. Clique em **"New +"** → **"Web Service"**
4. Conecte ao GitHub e selecione o repositório `sistema-pdv`

**Configure exatamente assim:**

```
Name: sistema-pdv-backend
Region: Oregon
Root Directory: (deixe vazio)
Runtime: Node
Build Command: cd backend && npm install && npm run build
Start Command: cd backend && node dist/server.js
Plan: Free
```

**Variáveis de Ambiente:**
- `NODE_ENV` = `production`

5. Clique em **"Create Web Service"**
6. Aguarde 2-5 minutos

---

## ✅ Testando

Após deploy, acesse:
```
https://SEU-APP.onrender.com/api/health
```

Deve retornar:
```json
{
  "status": "ok",
  "message": "Sistema PDV API está funcionando!"
}
```

---

## ❌ Problemas?

Veja [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📝 Próximos Passos

1. ✅ Backend no Render
2. 🎨 Frontend no Vercel/Netlify ([README.md](README.md))
3. 🗄️ Migrar para PostgreSQL para dados persistentes ([migrate-to-postgres.sql](migrate-to-postgres.sql))
