import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables FIRST
dotenv.config();

// Import routes
import documentsRouter from './routes/documents.js';
import uploadRouter from './routes/upload.js';
import aiRouter from './routes/ai.js';
import searchRouter from './routes/search.js';
import chatRouter from './routes/chat.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// General middleware
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      supabase: process.env.SUPABASE_URL ? 'configured' : 'missing',
      googleAI: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'missing'
    }
  });
});

// API routes
app.use('/api/documents', documentsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/ai', aiRouter);
app.use('/api/search', searchRouter);
app.use('/api/chat', chatRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KMRL Document Intelligence Backend API',
    version: '1.0.0',
    status: 'running',
    features: [
      'Document Processing with LangChain',
      'Google AI Integration',
      'Vector Embeddings',
      'RAG-based Q&A',
      'Real-time Processing'
    ],
    endpoints: {
      health: '/health',
      documents: '/api/documents',
      upload: '/api/upload',
      ai: '/api/ai',
      search: '/api/search',
      chat: '/api/chat'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start server with error handling
try {
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 KMRL Document Intelligence Backend running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    logger.info(`🤖 Google AI: ${process.env.GOOGLE_AI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    logger.info(`🗄️ Supabase: ${process.env.SUPABASE_URL ? '✅ Configured' : '❌ Missing'}`);
  });
} catch (error) {
  logger.error('Failed to start server:', error);
  console.error('Failed to start server:', error);
  process.exit(1);
}

export default app;