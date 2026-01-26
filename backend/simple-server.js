const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

console.log('🚀 Iniciando servidor minimalista...');
console.log('📊 PORT:', PORT);
console.log('📊 NODE_ENV:', process.env.NODE_ENV);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  console.log('✅ Requisição recebida em /');
  res.json({ 
    status: 'ok', 
    message: 'Sistema PDV Backend',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  console.log('✅ Requisição recebida em /api/health');
  res.json({ 
    status: 'ok', 
    message: 'API funcionando!',
    port: PORT,
    env: process.env.NODE_ENV
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('✅✅✅ SERVIDOR INICIADO COM SUCESSO ✅✅✅');
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌍 Host: 0.0.0.0`);
});

server.on('error', (err) => {
  console.error('❌ ERRO AO INICIAR SERVIDOR:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});
