/**
 * Rutas de búsqueda
 */

const express = require('express');
const router = express.Router();
const searchService = require('../services/searchService');

/**
 * Buscar partidas públicas
 * GET /api/search/games
 * Query: status?, minPlayers?, maxPlayers?, hostName?, limit?, offset?
 */
router.get('/games', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      minPlayers: req.query.minPlayers ? parseInt(req.query.minPlayers) : undefined,
      maxPlayers: req.query.maxPlayers ? parseInt(req.query.maxPlayers) : undefined,
      hostName: req.query.hostName,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const games = await searchService.searchGames(filters);

    res.json({
      success: true,
      data: games,
      count: games.length,
      filters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Buscar jugadores
 * GET /api/search/players
 * Query: username?, minRating?, maxRating?, limit?, offset?
 */
router.get('/players', async (req, res) => {
  try {
    const filters = {
      username: req.query.username,
      minRating: req.query.minRating ? parseInt(req.query.minRating) : undefined,
      maxRating: req.query.maxRating ? parseInt(req.query.maxRating) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
    };

    const players = await searchService.searchPlayers(filters);

    res.json({
      success: true,
      data: players,
      count: players.length,
      filters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

module.exports = router;

