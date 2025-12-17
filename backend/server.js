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

// WebSocket
const setupSocketHandlers = require('./websocket/socketHandler');

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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.',
});
app.use('/api/', limiter);

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use('/api/health', healthRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/games', gamesRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Impostor Fútbol Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      rooms: '/api/rooms',
      games: '/api/games',
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

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`
🚀 Servidor iniciado en puerto ${PORT}
📡 WebSocket disponible en ws://localhost:${PORT}
🌐 API disponible en http://localhost:${PORT}
📋 Health check: http://localhost:${PORT}/api/health
  `);
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

