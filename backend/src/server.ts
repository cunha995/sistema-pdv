import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtosRoutes from './routes/produtos';
import clientesRoutes from './routes/clientes';
import vendasRoutes from './routes/vendas';
import './database'; // Inicializa o banco de dados

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: '*', // Em produção, especifique o domínio do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rotas
app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vendas', vendasRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Sistema PDV API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      produtos: '/api/produtos',
      clientes: '/api/clientes',
      vendas: '/api/vendas'
    }
  });
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Sistema PDV API está funcionando!' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
