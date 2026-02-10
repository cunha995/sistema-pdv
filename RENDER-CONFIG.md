# ✅ CONFIGURAÇÃO VIA render.yaml (RECOMENDADO)

O projeto usa o arquivo render.yaml na raiz para criar os serviços no Render.

## Como aplicar

1. **Acesse** https://dashboard.render.com
2. Clique em **"New +"** → **"Blueprint"**
3. Selecione o repositório
4. O Render vai ler o render.yaml e criar:
	- `sistema-pdv-backend`
	- `sistema-pdv-frontend`

## Variáveis de ambiente usadas

**Backend**
- `NODE_ENV=production`

**Frontend**
- `NODE_ENV=production`
- `VITE_API_URL=https://sistema-pdv-backend.onrender.com/api`
- `API_URL=https://sistema-pdv-backend.onrender.com`

---

Se preferir configurar manualmente, use os mesmos valores do render.yaml.
