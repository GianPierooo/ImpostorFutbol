/**
 * Servicio para operaciones con Redis
 */

const redisClient = require('../config/redis');
const constants = require('../config/constants');

class RedisService {
  /**
   * Guarda una sala en Redis
   * @param {string} code - Código de la sala
   * @param {object} roomData - Datos de la sala
   */
  async saveRoom(code, roomData) {
    const key = `room:${code}`;
    await redisClient.hSet(key, {
      hostId: roomData.hostId,
      status: roomData.status || 'lobby',
      config: JSON.stringify(roomData.config || { rounds: 3 }),
      createdAt: roomData.createdAt || Date.now(),
      lastActivity: Date.now(),
    });
    
    // Expirar después de ROOM_EXPIRY_SECONDS
    await redisClient.expire(key, constants.ROOM_EXPIRY_SECONDS);
  }

  /**
   * Obtiene una sala de Redis
   * @param {string} code - Código de la sala
   * @returns {object|null}
   */
  async getRoom(code) {
    const key = `room:${code}`;
    const data = await redisClient.hGetAll(key);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    return {
      code,
      hostId: data.hostId,
      status: data.status,
      config: JSON.parse(data.config || '{}'),
      createdAt: parseInt(data.createdAt),
      lastActivity: parseInt(data.lastActivity),
    };
  }

  /**
   * Elimina una sala de Redis
   * @param {string} code - Código de la sala
   */
  async deleteRoom(code) {
    const key = `room:${code}`;
    await redisClient.del(key);
    
    // Eliminar también datos relacionados
    await redisClient.del(`players:${code}`);
    await redisClient.del(`game:${code}`);
    await redisClient.del(`pistas:${code}`);
    await redisClient.del(`votes:${code}`);
    await redisClient.del(`roles:${code}`);
    
    // Eliminar información de jugadores individuales
    const players = await this.getPlayers(code);
    for (const playerId of players) {
      await redisClient.del(`player:${code}:${playerId}`);
    }
  }

  /**
   * Agrega un jugador a la sala
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @param {string} playerName - Nombre del jugador
   * @param {boolean} isHost - Si es el host
   */
  async addPlayer(code, playerId, playerName, isHost = false) {
    // Agregar a set de jugadores
    await redisClient.sAdd(`players:${code}`, playerId);
    
    // Guardar información del jugador
    await redisClient.hSet(`player:${code}:${playerId}`, {
      name: playerName,
      joinedAt: Date.now(),
      isHost: isHost ? 'true' : 'false',
    });
    
    // Actualizar última actividad de la sala
    await this.updateRoomActivity(code);
  }

  /**
   * Elimina un jugador de la sala
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   */
  async removePlayer(code, playerId) {
    await redisClient.sRem(`players:${code}`, playerId);
    await redisClient.del(`player:${code}:${playerId}`);
  }

  /**
   * Obtiene todos los jugadores de una sala
   * @param {string} code - Código de la sala
   * @returns {string[]} Array de playerIds
   */
  async getPlayers(code) {
    return await redisClient.sMembers(`players:${code}`);
  }

  /**
   * Obtiene información de un jugador
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @returns {object|null}
   */
  async getPlayerInfo(code, playerId) {
    const data = await redisClient.hGetAll(`player:${code}:${playerId}`);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    return {
      id: playerId,
      name: data.name,
      joinedAt: parseInt(data.joinedAt),
      isHost: data.isHost === 'true',
    };
  }

  /**
   * Obtiene información de todos los jugadores
   * @param {string} code - Código de la sala
   * @returns {object[]}
   */
  async getAllPlayersInfo(code) {
    const playerIds = await this.getPlayers(code);
    const players = [];
    
    for (const playerId of playerIds) {
      const info = await this.getPlayerInfo(code, playerId);
      if (info) {
        players.push(info);
      }
    }
    
    return players;
  }

  /**
   * Guarda el estado del juego
   * @param {string} code - Código de la sala
   * @param {object} gameState - Estado del juego
   */
  async saveGameState(code, gameState) {
    const key = `game:${code}`;
    await redisClient.hSet(key, {
      secretWord: gameState.secretWord,
      impostorId: gameState.impostorId,
      currentRound: gameState.currentRound.toString(),
      maxRounds: gameState.maxRounds ? gameState.maxRounds.toString() : 'null',
      phase: gameState.phase,
      currentPlayerIndex: gameState.currentPlayerIndex.toString(),
      currentVoterIndex: gameState.currentVoterIndex.toString(),
      currentTurn: gameState.currentTurn.toString(),
    });
  }

  /**
   * Obtiene el estado del juego
   * @param {string} code - Código de la sala
   * @returns {object|null}
   */
  async getGameState(code) {
    const data = await redisClient.hGetAll(`game:${code}`);
    
    if (!data || Object.keys(data).length === 0) {
      return null;
    }
    
    return {
      secretWord: data.secretWord,
      impostorId: data.impostorId,
      currentRound: parseInt(data.currentRound),
      maxRounds: data.maxRounds === 'null' ? null : parseInt(data.maxRounds),
      phase: data.phase,
      currentPlayerIndex: parseInt(data.currentPlayerIndex),
      currentVoterIndex: parseInt(data.currentVoterIndex),
      currentTurn: parseInt(data.currentTurn),
    };
  }

  /**
   * Guarda los roles asignados
   * @param {string} code - Código de la sala
   * @param {object} roles - Objeto { playerId: role }
   */
  async saveRoles(code, roles) {
    const key = `roles:${code}`;
    await redisClient.hSet(key, roles);
  }

  /**
   * Obtiene el rol de un jugador
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @returns {string|null}
   */
  async getPlayerRole(code, playerId) {
    return await redisClient.hGet(`roles:${code}`, playerId);
  }

  /**
   * Obtiene todos los roles de una sala
   * @param {string} code - Código de la sala
   * @returns {object} Objeto { playerId: role }
   */
  async getRoles(code) {
    return await redisClient.hGetAll(`roles:${code}`);
  }

  /**
   * Agrega una pista
   * @param {string} code - Código de la sala
   * @param {object} pista - Objeto pista
   */
  async addPista(code, pista) {
    await redisClient.rPush(`pistas:${code}`, JSON.stringify(pista));
  }

  /**
   * Obtiene todas las pistas de una sala
   * @param {string} code - Código de la sala
   * @returns {object[]}
   */
  async getPistas(code) {
    const pistas = await redisClient.lRange(`pistas:${code}`, 0, -1);
    return pistas.map(p => JSON.parse(p));
  }

  /**
   * Obtiene las pistas de una ronda específica
   * @param {string} code - Código de la sala
   * @param {number} round - Número de ronda
   * @returns {object[]}
   */
  async getPistasByRound(code, round) {
    const allPistas = await this.getPistas(code);
    return allPistas.filter(p => p.round === round);
  }

  /**
   * Agrega un voto
   * @param {string} code - Código de la sala
   * @param {string} voterId - ID del votante
   * @param {string} targetId - ID del objetivo
   */
  async addVote(code, voterId, targetId) {
    await redisClient.hSet(`votes:${code}`, voterId, targetId);
  }

  /**
   * Obtiene todos los votos
   * @param {string} code - Código de la sala
   * @returns {object} Objeto { voterId: targetId }
   */
  async getVotes(code) {
    return await redisClient.hGetAll(`votes:${code}`);
  }

  /**
   * Elimina todos los votos
   * @param {string} code - Código de la sala
   */
  async clearVotes(code) {
    await redisClient.del(`votes:${code}`);
  }

  /**
   * Actualiza la última actividad de una sala
   * @param {string} code - Código de la sala
   */
  async updateRoomActivity(code) {
    await redisClient.hSet(`room:${code}`, 'lastActivity', Date.now());
  }

  /**
   * Actualiza el estado de una sala
   * @param {string} code - Código de la sala
   * @param {string} status - Nuevo estado
   */
  async updateRoomStatus(code, status) {
    await redisClient.hSet(`room:${code}`, 'status', status);
    await this.updateRoomActivity(code);
  }

  /**
   * Publica un evento en el canal Pub/Sub
   * @param {string} code - Código de la sala
   * @param {string} event - Nombre del evento
   * @param {object} data - Datos del evento
   */
  async publishEvent(code, event, data) {
    const channel = `room:${code}`;
    const message = JSON.stringify({ event, data });
    await redisClient.publish(channel, message);
  }
}

module.exports = new RedisService();

