const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

console.log('=== TESTE SIMPLES ===');
console.log('PORT:', PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema PDV API está funcionando!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
