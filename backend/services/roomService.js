/**
 * Servicio de lógica de salas
 */

const redisService = require('./redisService');
const { generateRoomCode, isValidRoomCode } = require('../utils/roomCode');
const { validatePlayerName, validateGameConfig } = require('../utils/validation');
const constants = require('../config/constants');

class RoomService {
  /**
   * Crea una nueva sala
   * @param {string} hostId - ID del host
   * @param {string} hostName - Nombre del host
   * @param {object} config - Configuración del juego
   * @returns {Promise<{ code: string, room: object }>}
   */
  async createRoom(hostId, hostName, config = {}) {
    // Validar configuración
    const configValidation = validateGameConfig(config);
    if (!configValidation.valid) {
      throw new Error(configValidation.error);
    }

    // Validar nombre del host
    const nameValidation = validatePlayerName(hostName);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Generar código único
    let code;
    let exists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (exists && attempts < maxAttempts) {
      code = generateRoomCode();
      const existingRoom = await redisService.getRoom(code);
      exists = existingRoom !== null;
      attempts++;
    }

    if (exists) {
      throw new Error('No se pudo generar un código único. Intenta de nuevo.');
    }

    // Limpiar cualquier estado previo de juego si existe (por si se reutiliza un código)
    await redisService.deleteRoom(code);
    
    // Crear sala
    const roomData = {
      code,
      hostId,
      status: constants.GAME_PHASES.LOBBY,
      config: config.rounds ? { rounds: config.rounds } : { rounds: null },
      createdAt: Date.now(),
    };

    await redisService.saveRoom(code, roomData);
    await redisService.addPlayer(code, hostId, hostName, true);

    // Indexar partida en Elasticsearch (si está disponible)
    try {
      const searchService = require('./searchService');
      await searchService.indexGame({
        roomCode: code,
        hostId: hostId,
        hostName: hostName,
        status: constants.GAME_PHASES.LOBBY,
        playerCount: 1,
        maxPlayers: constants.MAX_PLAYERS_PER_ROOM,
        createdAt: roomData.createdAt,
        lastActivity: Date.now(),
      });
    } catch (error) {
      // Continuar aunque falle la indexación
      console.warn('No se pudo indexar partida en Elasticsearch:', error.message);
    }

    return {
      code,
      room: await redisService.getRoom(code),
    };
  }

  /**
   * Obtiene una sala
   * @param {string} code - Código de la sala
   * @returns {Promise<object|null>}
   */
  async getRoom(code) {
    if (!isValidRoomCode(code)) {
      return null;
    }

    return await redisService.getRoom(code);
  }

  /**
   * Une un jugador a una sala
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @param {string} playerName - Nombre del jugador
   * @returns {Promise<object>}
   */
  async joinRoom(code, playerId, playerName) {
    // Validar código
    if (!isValidRoomCode(code)) {
      throw new Error('Código de sala inválido');
    }

    // Validar nombre
    const nameValidation = validatePlayerName(playerName);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Verificar que la sala existe
    const room = await redisService.getRoom(code);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    // Verificar que no esté llena
    const players = await redisService.getPlayers(code);
    if (players.length >= constants.MAX_PLAYERS_PER_ROOM) {
      throw new Error(`La sala está llena (máximo ${constants.MAX_PLAYERS_PER_ROOM} jugadores)`);
    }

    // Verificar que el jugador no esté ya en la sala
    if (players.includes(playerId)) {
      throw new Error('Ya estás en esta sala');
    }

    // Agregar jugador
    await redisService.addPlayer(code, playerId, playerName, false);

    return {
      room: await redisService.getRoom(code),
      players: await redisService.getAllPlayersInfo(code),
    };
  }

  /**
   * Saca un jugador de una sala
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @returns {Promise<object>}
   */
  async leaveRoom(code, playerId) {
    const room = await redisService.getRoom(code);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    const playerInfo = await redisService.getPlayerInfo(code, playerId);
    if (!playerInfo) {
      throw new Error('Jugador no encontrado en la sala');
    }

    // Si es el host y hay otros jugadores, transferir host
    if (playerInfo.isHost) {
      const players = await redisService.getPlayers(code);
      const otherPlayers = players.filter(id => id !== playerId);
      
      if (otherPlayers.length > 0) {
        // Transferir host al primer jugador
        const newHostId = otherPlayers[0];
        const newHostInfo = await redisService.getPlayerInfo(code, newHostId);
        await redisService.addPlayer(code, newHostId, newHostInfo.name, true);
      } else {
        // No hay más jugadores, eliminar sala
        await redisService.deleteRoom(code);
        return { room: null, players: [] };
      }
    }

    // Remover jugador
    await redisService.removePlayer(code, playerId);

    return {
      room: await redisService.getRoom(code),
      players: await redisService.getAllPlayersInfo(code),
    };
  }

  /**
   * Obtiene el estado completo de una sala
   * @param {string} code - Código de la sala
   * @returns {Promise<object>}
   */
  async getRoomState(code) {
    const room = await redisService.getRoom(code);
    if (!room) {
      return null;
    }

    const players = await redisService.getAllPlayersInfo(code);
    const gameState = await redisService.getGameState(code);

    // Si la sala está en lobby pero hay un estado de juego previo, limpiarlo
    if (room.status === constants.GAME_PHASES.LOBBY && gameState) {
      console.log(`⚠️ Limpiando estado de juego residual para sala ${code} en lobby`);
      await redisService.deleteGameState(code);
      return {
        room,
        players,
        gameState: null,
      };
    }

    // Si no hay juego en curso y el estado no es lobby, resetear a lobby
    if (!gameState && room.status !== constants.GAME_PHASES.LOBBY) {
      await redisService.updateRoomStatus(code, constants.GAME_PHASES.LOBBY);
      room.status = constants.GAME_PHASES.LOBBY;
    }

    return {
      room,
      players,
      gameState,
    };
  }
}

module.exports = new RoomService();

