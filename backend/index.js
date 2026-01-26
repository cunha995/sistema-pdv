const http = require('http');
const PORT = process.env.PORT || 10000;

console.log('Iniciando servidor HTTP básico...');
console.log('PORT:', PORT);

const server = http.createServer((req, res) => {
  console.log('Requisição recebida:', req.url);
  
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    status: 'ok', 
    message: 'Sistema PDV funcionando!',
    url: req.url
  }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor HTTP rodando na porta ${PORT}`);
});
