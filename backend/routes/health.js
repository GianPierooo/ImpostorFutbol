/**
 * Rutas de health check
 */

const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');
const { testConnection } = require('../config/postgres');

/**
 * Health check básico
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'impostor-futbol-backend',
  });
});

/**
 * Health check con Redis
 */
router.get('/redis', async (req, res) => {
  try {
    // Intentar hacer una operación simple en Redis
    await redisService.getRoom('test');
    
    res.json({
      status: 'ok',
      redis: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Health check con PostgreSQL
 */
router.get('/postgres', async (req, res) => {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      res.json({
        status: 'ok',
        postgres: 'connected',
        timestamp: new Date().toISOString(),
      });
    } else {
      res.status(503).json({
        status: 'error',
        postgres: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'error',
      postgres: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Health check completo (Redis + PostgreSQL)
 */
router.get('/full', async (req, res) => {
  const status = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Verificar Redis
  try {
    await redisService.getRoom('test');
    status.services.redis = 'connected';
  } catch (error) {
    status.services.redis = 'disconnected';
    status.status = 'degraded';
  }

  // Verificar PostgreSQL
  try {
    const isConnected = await testConnection();
    status.services.postgres = isConnected ? 'connected' : 'disconnected';
    if (!isConnected) {
      status.status = 'degraded';
    }
  } catch (error) {
    status.services.postgres = 'disconnected';
    status.status = 'degraded';
  }

  const statusCode = status.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(status);
});

module.exports = router;

