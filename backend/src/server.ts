import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import produtosRoutes from './routes/produtos';
import clientesRoutes from './routes/clientes';
import vendasRoutes from './routes/vendas';
import mesasRoutes from './routes/mesas';
import funcionariosRoutes from './routes/funcionarios';
import empresasRoutes from './routes/empresas';
import planosRoutes from './routes/planos';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔧 Iniciando servidor...');
console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Porta: ${PORT}`);

// Middlewares
app.use(cors({
  origin: '*', // Em produção, especifique o domínio do frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Inicializar banco DEPOIS dos middlewares
try {
  console.log('💾 Inicializando banco de dados...');
  require('./database');
  console.log('✅ Banco de dados inicializado!');
} catch (error) {
  console.error('❌ Erro ao inicializar banco:', error);
  process.exit(1);
}

// Rotas
app.use('/api/produtos', produtosRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/planos', planosRoutes);
app.use('/api/auth', authRoutes);

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
  res.json({ 
    status: 'ok', 
    message: 'Sistema PDV API está funcionando!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Tratamento de erros global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Erro:', err);
  res.status(500).json({ error: 'Erro interno do servidor', message: err.message });
});

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`📡 API disponível`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

export default app;
