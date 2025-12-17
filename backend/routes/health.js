/**
 * Rutas de health check
 */

const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');

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

module.exports = router;

