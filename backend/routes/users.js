/**
 * Rutas de usuarios
 */

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

/**
 * Crear o obtener usuario
 * POST /api/users
 * Body: { username, email?, avatar? }
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, avatar } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'username es requerido',
      });
    }

    const result = await userService.createOrGetUser(username, email, avatar);

    res.json({
      success: true,
      data: result.data,
      created: result.created,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Obtener usuario por ID
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Obtener estadísticas de usuario
 * GET /api/users/:id/stats
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    const stats = await userService.getUserStats(id);

    if (!stats) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Actualizar perfil de usuario
 * PUT /api/users/:id
 * Body: { email?, avatar? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, avatar } = req.body;

    const result = await userService.updateUser(id, { email, avatar });

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Obtener partidas de un usuario
 * GET /api/users/:id/games
 * Query: limit?, offset?
 */
router.get('/:id/games', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const games = await userService.getUserGames(id, limit, offset);

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

module.exports = router;

