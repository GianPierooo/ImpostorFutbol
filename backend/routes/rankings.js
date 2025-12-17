/**
 * Rutas de rankings
 */

const express = require('express');
const router = express.Router();
const ratingService = require('../services/ratingService');

/**
 * Obtener rankings globales
 * GET /api/rankings
 * Query: limit?, offset?
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const rankings = await ratingService.getRankings(limit, offset);

    res.json({
      success: true,
      data: rankings,
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
 * Obtener posición de un usuario en el ranking
 * GET /api/rankings/user/:id
 */
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const position = await ratingService.getUserRankPosition(id);

    if (position === null) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        userId: id,
        position,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

