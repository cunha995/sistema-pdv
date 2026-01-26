# Como Criar Repositório no GitHub

## Passo a Passo Completo

### 1. Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique no botão **"+"** no canto superior direito
3. Selecione **"New repository"**
4. Configure:
   - **Repository name**: `sistema-pdv`
   - **Description**: "Sistema de Ponto de Venda completo"
   - **Public** ou **Private** (Render funciona com ambos)
   - **NÃO** marque "Initialize with README" (já temos um)
5. Clique em **"Create repository"**

### 2. Conectar seu Projeto Local ao GitHub

Abra o PowerShell na pasta do projeto e execute:

```powershell
# Inicializar repositório Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Sistema PDV completo"

# Conectar ao repositório remoto (substitua SEU-USUARIO pelo seu username do GitHub)
git remote add origin https://github.com/SEU-USUARIO/sistema-pdv.git

# Renomear branch para main
git branch -M main

# Enviar código para GitHub
git push -u origin main
```

**Nota**: Se pedir usuário e senha, use seu **Personal Access Token** do GitHub (não a senha da conta).

### 3. Criar Personal Access Token (se necessário)

Se o Git pedir autenticação:

1. No GitHub, vá em **Settings** (sua foto → Settings)
2. No menu esquerdo, clique em **Developer settings**
3. Clique em **Personal access tokens** → **Tokens (classic)**
4. Clique em **"Generate new token"** → **"Generate new token (classic)"**
5. Configure:
   - **Note**: "Deploy Sistema PDV"
   - **Expiration**: 90 days (ou o que preferir)
   - Marque: ✅ **repo** (acesso total aos repositórios)
6. Clique em **"Generate token"**
7. **COPIE O TOKEN** (você só verá ele uma vez!)
8. Use este token como senha quando o Git pedir

### 4. Verificar se funcionou

No GitHub, acesse seu repositório e veja se os arquivos aparecem.

---

## 🎯 Agora pode fazer o deploy no Render!

Volte para [README.md](README.md) e siga o guia de deploy.
