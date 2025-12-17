/**
 * Rutas de historial de partidas
 */

const express = require('express');
const router = express.Router();
const historyService = require('../services/historyService');

/**
 * Obtener historial de partidas
 * GET /api/games/history
 * Query: limit?, offset?
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const games = await historyService.getGameHistory(limit, offset);

    res.json({
      success: true,
      data: games,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Obtener detalle de una partida
 * GET /api/games/history/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const game = await historyService.getGameDetails(id);

    if (!game) {
      return res.status(404).json({
        success: false,
        error: 'Partida no encontrada',
      });
    }

    res.json({
      success: true,
      data: game,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

