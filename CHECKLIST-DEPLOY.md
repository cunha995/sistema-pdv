# 📝 Checklist de Deploy - Frontend PDV

## ✅ Antes do Deploy

- [x] Código commitado no GitHub
- [x] Arquivo `server.js` criado no frontend
- [x] Script `start` adicionado ao package.json
- [x] Variável `VITE_API_URL` configurada no código
- [x] Build testado localmente (`npm run build`)

## 📋 Configurações Render

### Informações Básicas
```
✓ Service Name: sistema-pdv-frontend
✓ Region: Oregon (US West)
✓ Branch: main
✓ Root Directory: frontend
```

### Build & Deploy
```
✓ Build Command: npm install && npm run build
✓ Start Command: node server.js
✓ Instance Type: Free
```

### Environment Variables (Opcional)
```
VITE_API_URL=https://sistema-pdv-api.onrender.com/api
```

## 🔍 Verificações Pós-Deploy

Após o deploy, teste:

- [ ] Frontend carrega sem erros (https://sistema-pdv-frontend.onrender.com)
- [ ] Página inicial aparece corretamente
- [ ] Menu de navegação funciona
- [ ] Produtos carregam da API
- [ ] Consegue criar um novo produto
- [ ] Clientes carregam e podem ser criados
- [ ] PDV funciona (adicionar produtos ao carrinho)
- [ ] Venda é registrada com sucesso
- [ ] Estoque atualiza após venda

## ⚡ Comandos Úteis

### Testar build localmente
```bash
cd frontend
npm run build
npm start
# Acesse: http://localhost:5173
```

### Fazer novo deploy
```bash
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático inicia no Render
```

### Ver logs do Render
```
1. Acesse dashboard.render.com
2. Clique em "sistema-pdv-frontend"
3. Aba "Logs" mostra saída em tempo real
```

## 🐛 Troubleshooting

### Frontend não carrega
- Verifique logs no Render
- Confirme que Build Command executou com sucesso
- Verifique se pasta `dist/` foi criada no build

### API não responde
- Confirme que backend está rodando
- Teste: https://sistema-pdv-api.onrender.com/health
- Verifique CORS no backend (já configurado)

### Erro 404 em rotas
- Confirme que `server.js` tem o código correto
- React Router precisa do `app.get('*')` no Express

### Dados não carregam
- Verifique variável `VITE_API_URL` 
- Abra DevTools → Network → veja as requisições
- Backend pode estar "dormindo" (plano free)

## 📊 Status dos Serviços

### Backend
```
URL: https://sistema-pdv-api.onrender.com
Status: [ ] Online  [ ] Offline
Última atualização: _____
```

### Frontend
```
URL: https://sistema-pdv-frontend.onrender.com
Status: [ ] Online  [ ] Offline
Última atualização: _____
```

## 🎯 Próximos Passos

Após deploy bem-sucedido:
- [ ] Adicionar autenticação (JWT)
- [ ] Configurar domínio customizado (opcional)
- [ ] Implementar banco de dados persistente
- [ ] Adicionar testes automatizados
- [ ] Configurar SSL/HTTPS (já incluído no Render)
- [ ] Implementar cache para melhor performance
