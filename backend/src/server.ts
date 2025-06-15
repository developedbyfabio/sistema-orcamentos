import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rotas
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import nivelRoutes from './routes/niveis';
import orcamentoRoutes from './routes/orcamentos';
import filialRoutes from './routes/filiais';
import dashboardRoutes from './routes/dashboard';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = parseInt(process.env.PORT || '5000');

// Middleware de segurança
app.use(helmet());

// Configurar CORS - Permitir todas as origens em desenvolvimento
app.use(cors({
  origin: true, // Permitir todas as origens
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Configurar trust proxy para resolver warning do rate limit
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 30000, // 30 segundos
  max: 5000, // máximo 5000 requests por 30 segundos
  message: {
    error: 'Muitas requisições. Tente novamente em alguns segundos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para servir arquivos estáticos (uploads)
app.use('/uploads', express.static('uploads'));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/niveis', nivelRoutes);
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/filiais', filialRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro:', err);
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON inválido',
    });
  }
  
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : err.message,
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada',
  });
});

// Função para iniciar o servidor
async function startServer() {
  try {
    // Testar conexão com o banco
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados PostgreSQL');
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API disponível em: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 CORS configurado para todas as origens`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, fechando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, fechando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

// Iniciar servidor
startServer(); 