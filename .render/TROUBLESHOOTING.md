# ❌ Problemas Comuns e Soluções

## 1. "Repository not found" no Render

**Problema**: Render não encontra seu repositório

**Soluções**:
- Certifique-se de que o repositório está **público** ou que você autorizou o Render a acessar repositórios privados
- No Render, clique em "Account Settings" → "GitHub" e reautorize a conexão
- Tente desconectar e reconectar sua conta GitHub no Render

## 2. Build falha com "ENOENT: no such file or directory"

**Problema**: Render não encontra a pasta backend

**Solução**: Certifique-se de que:
- A estrutura do projeto no GitHub está correta (pasta `backend` na raiz)
- O campo "Root Directory" no Render está **VAZIO**
- O Build Command é: `cd backend && npm install && npm run build`

## 3. Build falha com "better-sqlite3" erro

**Problema**: better-sqlite3 precisa ser compilado para Linux

**Solução 1**: Adicione ao `backend/package.json`:
```json
"scripts": {
  "postinstall": "npm rebuild better-sqlite3"
}
```

**Solução 2**: Use PostgreSQL (recomendado para produção):
1. No Render, crie um PostgreSQL (Free)
2. Use o script `migrate-to-postgres.sql`
3. Instale: `npm install pg`
4. Atualize o código do database

## 4. "Port already in use"

**Problema**: Porta 3000 já está em uso

**Solução**: O Render define a porta automaticamente. Atualize `backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3000;
```

## 5. Deploy fica "In Progress" por muito tempo

**Problema**: Build travado

**Soluções**:
- Aguarde até 10 minutos (primeira vez pode demorar)
- Verifique os logs do build clicando em "Events"
- Cancele e tente novamente
- Verifique se não há erros de TypeScript

## 6. "Cannot find module" após deploy

**Problema**: Dependências não instaladas

**Solução**: Certifique-se de que:
- Todas as dependências estão em `dependencies` (não em `devDependencies`)
- TypeScript está em `devDependencies`
- O comando build compila o código

## 7. Banco de dados vazio após cada deploy

**Problema**: SQLite não persiste no Render Free

**Solução**: 
- Isso é esperado com SQLite no Render Free
- Para produção, use PostgreSQL
- Ou aceite que dados sejam perdidos (útil para testes)

## 8. Frontend não consegue acessar a API

**Problema**: CORS ou URL incorreta

**Solução 1 - Backend**: Certifique-se de que CORS está configurado:
```typescript
app.use(cors());
```

**Solução 2 - Frontend**: Atualize a URL da API:
```typescript
const API_URL = 'https://SEU-APP.onrender.com/api';
```

## 9. "Application failed to respond"

**Problema**: App não está escutando na porta correta

**Solução**: Em `backend/src/server.ts`:
```typescript
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
```

## 10. Deploy funciona mas API retorna 404

**Problema**: Rotas não estão corretas

**Solução**: Verifique:
- URL completa: `https://seu-app.onrender.com/api/produtos`
- Servidor está iniciando corretamente (veja logs)
- Rotas estão registradas em `server.ts`

---

## 🆘 Precisa de mais ajuda?

1. **Veja os logs**: No Render, clique em "Logs" para ver erros em tempo real
2. **Documentação Render**: [render.com/docs](https://render.com/docs)
3. **Teste localmente**: Execute `npm run build && npm start` na pasta backend

## ✅ Checklist de Verificação

Antes de fazer deploy, confirme:

- [ ] Código está no GitHub
- [ ] Estrutura de pastas está correta (pasta `backend` na raiz)
- [ ] `backend/package.json` tem scripts `build` e `start`
- [ ] TypeScript compila sem erros (`cd backend && npm run build`)
- [ ] `backend/.env` NÃO está commitado (deve estar no `.gitignore`)
- [ ] `dist/` do backend NÃO está no `.gitignore`
- [ ] Todas as dependências estão listadas em `package.json`
