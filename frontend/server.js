const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5173;

// Servir arquivos estáticos da pasta dist
app.use(express.static(path.join(__dirname, 'dist')));

// Todas as rotas retornam o index.html (para React Router funcionar)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend PDV rodando na porta ${PORT}`);
});
