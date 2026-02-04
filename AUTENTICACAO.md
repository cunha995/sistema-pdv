# Sistema de Autenticação - Guia de Uso

## 📋 Resumo

Implementamos um sistema completo de autenticação com:
- ✅ Login com email/senha
- ✅ Proteção de rotas do painel admin
- ✅ Conta demo com expiração automática
- ✅ Gerenciamento de usuários por empresa

## 🔑 Como Usar

### 1. Criar uma Empresa com Usuário no Painel Master

1. Acesse: `http://localhost:5173/master` (ou em produção)
2. Clique na aba "Empresas"
3. Clique em "+ Nova Empresa"
4. Preencha os dados da empresa:
   - Nome da Empresa
   - CNPJ
   - Email
   - Telefone
   - Endereço
   - Selecione um Plano

5. **Na seção "🔐 Credenciais de Acesso"**:
   - Nome do Usuário: Ex. "João Silva"
   - Email de Login: Ex. "joao@empresa.com"
   - Senha: Ex. "Senha123!!"
   
6. **Opcionalmente, marque "Conta Demo"**:
   - Selecione a duração: 15 min, 30 min, 60 min, 2h, ou 24h
   - A conta será automaticamente desativada após o tempo expirar

7. Clique em "Salvar"

### 2. Fazer Login no Painel Admin

1. Acesse: `http://localhost:5173/login`
2. Digite o email e senha criados acima
3. Clique em "Entrar"
4. Você será redirecionado para o Dashboard

### 3. Visualizar Informações do Usuário Logado

No Dashboard, você verá:
- Seu nome de usuário
- Nome da empresa
- Badge "DEMO" se for uma conta demo (com animação de pulso)
- Um botão "Sair" para logout

### 4. Logout

Clique no botão "Sair" no Dashboard para:
- Limpar tokens de autenticação
- Ser redirecionado para a página de login

## 🗄️ Banco de Dados

### Nova Tabela: `usuarios`

```sql
CREATE TABLE usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  empresa_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha TEXT NOT NULL,
  tipo TEXT DEFAULT 'admin',
  is_demo BOOLEAN DEFAULT 0,
  demo_expira_em DATETIME,
  ativo BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id)
);
```

### Campos:
- **empresa_id**: Vincula o usuário a uma empresa
- **email**: Único, usado para login
- **senha**: Hash SHA-256 (em produção, usar bcrypt)
- **tipo**: Tipo de usuário (default: 'admin', expandível para 'gerente', 'caixa', etc.)
- **is_demo**: Flag para contas demo (1 = sim, 0 = não)
- **demo_expira_em**: Timestamp de expiração (se demo)
- **ativo**: Soft delete (0 = desativado)

## 🔐 API Endpoints

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "joao@empresa.com",
  "senha": "Senha123!!"
}

Response:
{
  "token": "eyJkYXRhIjoiZW5jb2RlZCJ9...",
  "usuario": {
    "id": 1,
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "empresa_id": 1,
    "empresa_nome": "Empresa XYZ",
    "tipo": "admin",
    "is_demo": false,
    "demo_expira_em": null
  }
}
```

### Criar Usuário
```http
POST /api/auth/usuarios
Content-Type: application/json

{
  "empresa_id": 1,
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "Senha123!!",
  "tipo": "admin",
  "is_demo": true,
  "duracao_demo_minutos": 30
}
```

### Listar Usuários de uma Empresa
```http
GET /api/auth/usuarios/{empresa_id}
```

### Deletar Usuário (Soft Delete)
```http
DELETE /api/auth/usuarios/{id}
```

### Verificar Token
```http
GET /api/auth/verificar
Authorization: Bearer {token}
```

## 💾 LocalStorage

Ao fazer login, o sistema armazena no navegador:

```javascript
// Token de autenticação
localStorage.getItem('token')

// Dados do usuário
JSON.parse(localStorage.getItem('usuario'))
// {
//   id, nome, email, empresa_id, empresa_nome, tipo, is_demo, demo_expira_em
// }
```

## 🛡️ Proteção de Rotas

Rotas protegidas (requerem login):
- `/admin` - Dashboard
- `/admin/pdv` - PDV
- `/admin/produtos` - Produtos
- `/admin/vendas` - Vendas
- `/admin/clientes` - Clientes
- `/admin/mesas` - Mesas
- `/admin/pedidos-mesas` - Pedidos
- `/admin/delivery` - Delivery
- `/admin/estoque` - Estoque
- `/admin/config` - Config

Rotas públicas:
- `/login` - Tela de login
- `/master` - Painel Master (SaaS)
- `/mesa` - Painel do cliente

## ⏱️ Contas Demo

### Como Funcionam:
1. Ao criar uma empresa, marque "Conta Demo"
2. Selecione a duração (15, 30, 60 min, 2h, ou 24h)
3. O sistema calcula `demo_expira_em = agora + duracao_minutos`
4. Ao fazer login, verifica se `agora > demo_expira_em`
5. Se expirada, retorna erro: "Conta demo expirada"

### Exemplo:
```
Criado: 2024-02-04 10:00:00
Duração: 30 minutos
demo_expira_em: 2024-02-04 10:30:00

Login em 10:25: ✅ Sucesso
Login em 10:35: ❌ Conta expirada
```

## 🔧 Configurações Futuras

### Para Produção:
1. **Hash de Senha**: Usar `bcrypt` em vez de SHA-256
   ```javascript
   import bcrypt from 'bcrypt';
   const senhaHash = await bcrypt.hash(senha, 10);
   ```

2. **JWT Real**: Usar JWT assinado com secret
   ```javascript
   import jwt from 'jsonwebtoken';
   const token = jwt.sign({ usuarioId, empresaId }, process.env.JWT_SECRET);
   ```

3. **HTTPS**: Usar TLS em produção

4. **Variáveis de Ambiente**:
   ```env
   JWT_SECRET=sua_chave_secreta
   BCRYPT_ROUNDS=12
   TOKEN_EXPIRY=24h
   ```

5. **Middleware de Autenticação**:
   Aplicar verificação de token em todas as rotas da API

## 📊 Fluxo de Autenticação

```
1. Usuário acessa /login
2. Preenche email e senha
3. Clica em "Entrar"
4. Frontend faz POST /api/auth/login
5. Backend busca usuário por email
6. Verifica senha (hash)
7. Verifica se é demo (se sim, valida expiração)
8. Retorna token + dados do usuário
9. Frontend armazena em localStorage
10. Redireciona para /admin
11. ProtectedRoute verifica token antes de renderizar
12. Dashboard renderiza com dados do usuário
```

## ❓ FAQ

**P: O token expirou?**
R: Neste sistema, o token não tem expiração definida. Em produção, implemente expiração com JWT.

**P: Posso mudar a senha?**
R: Não há endpoints de mudança de senha ainda. Pode ser implementado como PUT /api/auth/usuarios/{id}/senha

**P: Quero adicionar mais tipos de usuário (gerente, caixa)?**
R: Modifique o campo `tipo` na tabela `usuarios` e ajuste o control de acesso no frontend/backend.

**P: Como funciona a validação de demo no frontend?**
R: Armazenamos `demo_expira_em` no localStorage. Na próxima execução, o Dashboard verifica se expirou.

**P: Posso resetar a senha de um usuário?**
R: Pode ser feito via API ou criar um endpoint /api/auth/usuarios/{id}/reset-senha

## 📝 Próximos Passos

1. Implementar middleware de autenticação nas rotas da API
2. Adicionar endpoints de mudança de senha
3. Implementar refresh tokens
4. Adicionar 2FA (autenticação de dois fatores)
5. Criar painel de usuários/funcionários no Config
6. Adicionar logs de auditoria para login/logout
