/**
 * Servidor principal del backend
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');

// Rutas
const healthRoutes = require('./routes/health');
const roomsRoutes = require('./routes/rooms');
const gamesRoutes = require('./routes/games');
const usersRoutes = require('./routes/users');
const historyRoutes = require('./routes/history');
const rankingsRoutes = require('./routes/rankings');
const searchRoutes = require('./routes/search');

// WebSocket
const setupSocketHandlers = require('./websocket/socketHandler');

// PostgreSQL
const { testConnection } = require('./config/postgres');

// Elasticsearch
const { testConnection: testElasticsearchConnection, createIndex } = require('./config/elasticsearch');
const { initIndices } = require('./database/elasticsearch/init_indices');

// Configuración
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Crear app Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.io
const io = new Server(server, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting (aumentado para desarrollo)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // máximo 1000 requests por IP (aumentado de 100)
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Aplicar rate limiting a todas las rutas API EXCEPTO health check y getAllRolesSeen
app.use('/api/', (req, res, next) => {
  // Excluir health check y getAllRolesSeen del rate limiting
  if (req.path.startsWith('/health') || req.path.includes('/all-roles-seen')) {
    return next();
  }
  return limiter(req, res, next);
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/health', healthRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/games/history', historyRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/search', searchRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Impostor Fútbol Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      games: '/api/games',
      users: '/api/users',
      history: '/api/games/history',
      rankings: '/api/rankings',
      search: '/api/search',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Error interno del servidor',
  });
});

// Configurar WebSocket
setupSocketHandlers(io);

// Iniciar servidor (escuchar en todas las interfaces para conexiones externas)
server.listen(PORT, '0.0.0.0', async () => {
  console.log(`
🚀 Servidor iniciado en puerto ${PORT}
📡 WebSocket disponible en ws://0.0.0.0:${PORT}
🌐 API disponible en http://0.0.0.0:${PORT}
📋 Health check: http://0.0.0.0:${PORT}/api/health
  `);
  
  // Probar conexión a PostgreSQL (no crítico si falla)
  try {
    await testConnection();
  } catch (error) {
    console.warn('⚠️ PostgreSQL no disponible. El servidor continuará sin historial de partidas.');
    console.warn('   Para habilitar historial, instala PostgreSQL y configura las variables de entorno.');
  }

  // Probar conexión a Elasticsearch (no crítico si falla)
  try {
    const esConnected = await testElasticsearchConnection();
    if (esConnected) {
      // Inicializar índices si no existen
      await initIndices();
    }
  } catch (error) {
    console.warn('⚠️ Elasticsearch no disponible. El servidor continuará sin búsqueda avanzada.');
    console.warn('   Para habilitar búsqueda, instala Elasticsearch y configura las variables de entorno.');
  }
});

// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = { app, server, io };

