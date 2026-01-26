# ⚠️ CONFIGURAÇÃO MANUAL NO RENDER

## O arquivo render.yaml foi removido para evitar conflitos.

## Configure MANUALMENTE no Render Dashboard:

1. **Acesse seu serviço** no dashboard
2. Clique em **"Settings"** (menu lateral)
3. Configure EXATAMENTE assim:

### Build & Deploy

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm ci && npm run build` |
| **Start Command** | `node dist/server.js` |

### Environment Variables

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |

4. **Clique em "Save Changes"**
5. **Manual Deploy** → "Deploy latest commit"

---

## ✅ Com essa configuração deve funcionar!

O problema era o render.yaml conflitando com as configurações.
Agora configure manualmente e vai funcionar.
