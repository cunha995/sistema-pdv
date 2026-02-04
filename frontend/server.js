const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;

const distPath = path.join(__dirname, 'dist');

console.log(`📁 Servindo arquivos de: ${distPath}`);
console.log(`🔌 Porta: ${PORT}`);

// Servir arquivos estáticos da pasta dist
app.use(express.static(distPath));

// Log de requisições
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.url}`);
  next();
});

// Todas as rotas retornam o index.html (para React Router funcionar)
app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  console.log(`↪️  Redirecionando ${req.url} para index.html`);
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Erro ao servir index.html:', err);
      res.status(404).send('404 - index.html não encontrado');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend PDV rodando em http://0.0.0.0:${PORT}`);
});
