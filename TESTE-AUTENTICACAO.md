# 🧪 Teste Rápido do Sistema de Autenticação

## ⚡ TL;DR - Teste em 5 Minutos

### 1. Inicie o servidor
```bash
npm run dev
```
Aguarde até ver:
- `✅ Banco de dados inicializado!`
- Frontend em http://localhost:5173

### 2. Crie uma empresa com usuário

Acesse: http://localhost:5173/master

**Preencha o formulário:**
```
Nome da Empresa: Minha Loja
CNPJ: 12.345.678/0001-99
Email: contato@minhaloja.com
Telefone: (11) 99999-9999
Endereço: Rua ABC 123
Plano: Starter (R$ 99.90)
Contato Nome: João Silva
Contato Email: joao@minhaloja.com
Contato Telefone: (11) 98888-8888

🔐 Credenciais de Acesso:
Nome do Usuário: João Silva
Email de Login: joao@minhaloja.com
Senha: minhasenha123

🎫 Marque "Conta Demo" (opcional)
   Duração: 30 minutos (selecione)
```

Clique em **Salvar** ✅

### 3. Faça login

Acesse: http://localhost:5173/login

```
Email: joao@minhaloja.com
Senha: minhasenha123
```

Clique em **Entrar** ✅

### 4. Você deve ver o Dashboard

- ✅ "Bem-vindo, João Silva" no topo
- ✅ "Minha Loja" como empresa
- ✅ Badge "DEMO" (se criou conta demo)
- ✅ Botão "Sair" no canto

### 5. Clique em "Sair" para testar logout

Você será redirecionado para `/login` ✅

---

## 🔍 Testes Detalhados

### Teste 1: Login com Credenciais Incorretas

**Esperado:**
```
Email: joao@minhaloja.com
Senha: senhaerrada
```
Resultado: ❌ "Credenciais inválidas"

### Teste 2: Demo Account Expirada

**Ao criar:**
```
Marque "Conta Demo"
Duração: 15 minutos
```

**Aguarde 15 minutos e tente login:**
```
Email: joao@minhaloja.com
Senha: minhasenha123
```

Resultado: ❌ "Sua conta demo expirou..."

### Teste 3: Proteção de Rotas

**Sem fazer login:**
1. Acesse: http://localhost:5173/admin
2. Você será redirecionado para: http://localhost:5173/login ✅

**Com login:**
1. Faça login normalmente
2. Acesse: http://localhost:5173/admin/pdv
3. Deve funcionar ✅

### Teste 4: Logout

**Ao clicar "Sair":**
1. localStorage.token é removido ✅
2. localStorage.usuario é removido ✅
3. Redireciona para /login ✅
4. Tente acessar /admin, volta para /login ✅

### Teste 5: Informações do Usuário no Dashboard

**Seu nome deve aparecer:**
```
Bem-vindo, João Silva
```

**Sua empresa deve aparecer:**
```
Minha Loja
```

**Se for demo, deve aparecer:**
```
Minha Loja DEMO
```

---

## 🛠️ Comandos Úteis

### Visualizar banco de dados
```bash
# Usuários criados
sqlite3 backend/database.db "SELECT id, nome, email, tipo, is_demo, ativo FROM usuarios;"

# Empresas criadas
sqlite3 backend/database.db "SELECT id, nome, plano_id FROM empresas;"
```

### Limpar dados de teste
```bash
# Deletar usuário
sqlite3 backend/database.db "DELETE FROM usuarios WHERE email = 'joao@minhaloja.com';"

# Deletar empresa
sqlite3 backend/database.db "DELETE FROM empresas WHERE nome = 'Minha Loja';"

# Ver localStorage no navegador
# F12 → Storage → Local Storage → http://localhost:5173
```

### Testar API via curl/PowerShell

**Login:**
```powershell
$body = @{
  email = "joao@minhaloja.com"
  senha = "minhasenha123"
} | ConvertTo-Json

Invoke-WebRequest `
  -Uri http://localhost:3000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Resultado esperado:**
```json
{
  "token": "...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@minhaloja.com",
    "empresa_id": 1,
    "empresa_nome": "Minha Loja",
    "tipo": "admin",
    "is_demo": false,
    "demo_expira_em": null
  }
}
```

---

## 🐛 Troubleshooting

### "Credenciais inválidas" mas email está correto

**Causas possíveis:**
1. Senha está errada (sem espaços extras?)
2. Usuário não foi criado (check banco de dados)
3. Usuário está desativado (is_ativo = 0)
4. Empresa está desativada

**Solução:**
```bash
sqlite3 backend/database.db "SELECT * FROM usuarios WHERE email = 'joao@minhaloja.com';"
```

### "Conta demo expirada" mas deveria ser válida

**Causas possíveis:**
1. Seu relógio do PC está errado
2. Tempo expirou realmente
3. Fuso horário errado

**Solução:**
```bash
sqlite3 backend/database.db "SELECT email, is_demo, demo_expira_em FROM usuarios;"
```

### Não posso acessar /admin (redireciona para login)

**Causas:**
1. Token expirou (localStorage limpo)
2. localStorage.token é inválido
3. Token foi corrompido

**Solução:**
```javascript
// No console (F12)
localStorage.getItem('token')     // Deve ter um valor
localStorage.getItem('usuario')   // Deve ter JSON válido
```

### "Address already in use 3000"

**Há outro servidor rodando:**
```bash
# Windows - matar processo na porta 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force

# Depois:
npm run dev
```

---

## ✅ Checklist Final

- [ ] Backend rodando na porta 3000
- [ ] Frontend rodando na porta 5173
- [ ] Conseguiu acessar /master
- [ ] Conseguiu criar empresa com usuário
- [ ] Conseguiu fazer login
- [ ] Dashboard exibe seu nome
- [ ] Dashboard exibe nome da empresa
- [ ] Botão "Sair" existe e funciona
- [ ] Logout remove token
- [ ] Não pode acessar /admin sem login
- [ ] Badge DEMO aparece (se demo)
- [ ] Rota protegida funciona

---

## 💡 Dicas

1. **Para testar demo expirada rapidamente:**
   - Crie uma conta demo com duração 15 minutos
   - Depois, abra DevTools (F12) → Storage → Local Storage
   - Mude `demo_expira_em` para uma data passada manualmente
   - Recarregue a página e tente fazer login novamente

2. **Para visualizar o token:**
   ```javascript
   // Console (F12)
   JSON.parse(localStorage.getItem('usuario'))
   ```

3. **Para resetar tudo:**
   ```javascript
   // Console (F12)
   localStorage.clear()
   location.href = '/login'
   ```

---

**Sucesso no teste! 🎉**
