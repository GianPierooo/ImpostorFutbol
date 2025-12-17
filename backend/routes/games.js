/**
 * Rutas de juegos
 */

const express = require('express');
const router = express.Router();
const gameService = require('../services/gameService');
const redisService = require('../services/redisService');

/**
 * Iniciar un juego
 * POST /api/games/:code/start
 * Body: { hostId }
 */
router.post('/:code/start', async (req, res) => {
  try {
    const { code } = req.params;
    const { hostId } = req.body;

    if (!hostId) {
      return res.status(400).json({
        error: 'hostId es requerido',
      });
    }

    const result = await gameService.startGame(code, hostId);

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
 * Obtener estado del juego
 * GET /api/games/:code/state
 */
router.get('/:code/state', async (req, res) => {
  try {
    const { code } = req.params;
    
    const room = await redisService.getRoom(code);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: 'Sala no encontrada',
      });
    }

    const gameState = await redisService.getGameState(code);
    const players = await redisService.getAllPlayersInfo(code);
    const pistas = await redisService.getPistas(code);
    const votes = await redisService.getVotes(code);

    res.json({
      success: true,
      data: {
        room,
        gameState,
        players,
        pistas,
        votes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Agregar una pista
 * POST /api/games/:code/pista
 * Body: { playerId, text }
 */
router.post('/:code/pista', async (req, res) => {
  try {
    const { code } = req.params;
    const { playerId, text } = req.body;

    if (!playerId || !text) {
      return res.status(400).json({
        error: 'playerId y text son requeridos',
      });
    }

    const result = await gameService.addPista(code, playerId, text);

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
 * Agregar un voto
 * POST /api/games/:code/vote
 * Body: { voterId, targetId }
 */
router.post('/:code/vote', async (req, res) => {
  try {
    const { code } = req.params;
    const { voterId, targetId } = req.body;

    if (!voterId || !targetId) {
      return res.status(400).json({
        error: 'voterId y targetId son requeridos',
      });
    }

    const result = await gameService.addVote(code, voterId, targetId);

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
 * Cambiar fase del juego
 * POST /api/games/:code/phase
 * Body: { playerId, phase }
 */
router.post('/:code/phase', async (req, res) => {
  try {
    const { code } = req.params;
    const { playerId, phase } = req.body;

    if (!playerId || !phase) {
      return res.status(400).json({
        error: 'playerId y phase son requeridos',
      });
    }

    const result = await gameService.changePhase(code, phase, playerId);

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
 * Obtener rol de un jugador
 * GET /api/games/:code/role/:playerId
 */
router.get('/:code/role/:playerId', async (req, res) => {
  try {
    const { code, playerId } = req.params;

    const result = await gameService.getPlayerRole(code, playerId);

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
 * Obtener resultados de votación
 * GET /api/games/:code/voting-results
 */
router.get('/:code/voting-results', async (req, res) => {
  try {
    const { code } = req.params;

    const result = await gameService.getVotingResults(code);

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
 * Finalizar y guardar partida en historial
 * POST /api/games/:code/finish
 * Body: { playerId } (debe ser el host)
 */
router.post('/:code/finish', async (req, res) => {
  try {
    const { code } = req.params;
    const { playerId } = req.body;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        error: 'playerId es requerido',
      });
    }

    // Verificar que es el host
    const playerInfo = await redisService.getPlayerInfo(code, playerId);
    if (!playerInfo || !playerInfo.isHost) {
      return res.status(403).json({
        success: false,
        error: 'Solo el host puede finalizar la partida',
      });
    }

    // Obtener todos los datos de la partida
    const gameData = await gameService.getGameDataForHistory(code);

    // Guardar en PostgreSQL (si está disponible)
    const historyService = require('../services/historyService');
    let savedGame = null;
    
    try {
      const saveResult = await historyService.saveGame(gameData);
      savedGame = saveResult.data;
    } catch (error) {
      console.error('Error guardando partida en PostgreSQL:', error.message);
      // Continuar aunque falle el guardado en PostgreSQL
    }

    res.json({
      success: true,
      data: {
        gameData,
        saved: savedGame !== null,
        gameId: savedGame?.id || null,
      },
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

