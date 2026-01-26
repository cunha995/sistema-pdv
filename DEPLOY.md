# 🚀 COMO FAZER DEPLOY - Guia Simplificado

## Qual é o problema que está tendo?

### ❌ "Não tenho conta no GitHub"
👉 Crie em [github.com/signup](https://github.com/signup) - é gratuito!

### ❌ "Não consigo colocar o código no GitHub"
👉 Veja o guia: [.render/GITHUB.md](.render/GITHUB.md)

### ❌ "O Render não encontra meu repositório"
👉 Certifique-se de:
1. Repositório está público ou Render tem permissão
2. Você conectou sua conta GitHub no Render
3. Reconecte a conta: Render → Account Settings → GitHub

### ❌ "O build falha no Render"
👉 Veja soluções comuns: [.render/TROUBLESHOOTING.md](.render/TROUBLESHOOTING.md)

---

## ✅ PASSO A PASSO COMPLETO

### 1️⃣ Colocar código no GitHub

```powershell
# Na pasta sistema-PDV, execute:

git init
git add .
git commit -m "Sistema PDV completo"

# Crie repositório em github.com primeiro, depois:
git remote add origin https://github.com/SEU-USUARIO/sistema-pdv.git
git branch -M main
git push -u origin main
```

### 2️⃣ Criar serviço no Render

1. Acesse [render.com](https://render.com)
2. Clique em **"New +"** → **"Web Service"**
3. Conecte ao GitHub
4. Selecione o repositório `sistema-pdv`

**Configure:**
- **Build Command**: `cd backend && npm install && npm run build`
- **Start Command**: `cd backend && node dist/server.js`
- **Environment Variable**: `NODE_ENV=production`

5. Clique em **"Create Web Service"**

### 3️⃣ Aguarde o deploy (2-5 minutos)

Teste em: `https://seu-app.onrender.com/api/health`

---

## 📚 Documentação Completa

- 📖 [Guia Rápido](.render/QUICKSTART.md)
- 📖 [Guia Completo do Render](.render/README.md)
- 🐙 [Como usar GitHub](.render/GITHUB.md)
- ❌ [Solução de Problemas](.render/TROUBLESHOOTING.md)
- 🗄️ [Migrar para PostgreSQL](.render/migrate-to-postgres.sql)

---

## 💡 Dicas Importantes

- ⏰ **Render Free**: O serviço "dorme" após 15 min sem uso
- 🗄️ **SQLite**: Dados são perdidos a cada redeploy (use PostgreSQL para produção)
- 🆓 **Gratuito**: 750 horas/mês de execução grátis
- 🔄 **Auto-deploy**: Quando você faz push no GitHub, o Render atualiza automaticamente

---

## 🆘 Ainda com problemas?

**Descreva o erro exato que está aparecendo:**
- Mensagem de erro
- Em qual etapa travou
- Print da tela ajuda!
