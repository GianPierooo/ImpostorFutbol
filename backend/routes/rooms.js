/**
 * Rutas de salas
 */

const express = require('express');
const router = express.Router();
const roomService = require('../services/roomService');

/**
 * Crear una nueva sala
 * POST /api/rooms
 * Body: { hostId, hostName, config? }
 */
router.post('/', async (req, res) => {
  try {
    const { hostId, hostName, config } = req.body;

    if (!hostId || !hostName) {
      return res.status(400).json({
        error: 'hostId y hostName son requeridos',
      });
    }

    const result = await roomService.createRoom(hostId, hostName, config || {});

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Obtener una sala
 * GET /api/rooms/:code
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const roomState = await roomService.getRoomState(code);

    if (!roomState) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada',
      });
    }

    res.json({
      success: true,
      data: roomState,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Unirse a una sala
 * POST /api/rooms/:code/join
 * Body: { playerId, playerName }
 */
router.post('/:code/join', async (req, res) => {
  try {
    const { code } = req.params;
    const { playerId, playerName } = req.body;

    if (!playerId || !playerName) {
      return res.status(400).json({
        error: 'playerId y playerName son requeridos',
      });
    }

    const result = await roomService.joinRoom(code, playerId, playerName);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Salir de una sala
 * POST /api/rooms/:code/leave
 * Body: { playerId }
 */
router.post('/:code/leave', async (req, res) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        error: 'playerId es requerido',
      });
    }

    const result = await roomService.leaveRoom(code, playerId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

