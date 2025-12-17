/**
 * Servicio para búsquedas avanzadas con Elasticsearch
 */

const elasticsearchService = require('./elasticsearchService');
const userService = require('./userService');
const historyService = require('./historyService');

class SearchService {
  /**
   * Buscar partidas públicas
   * @param {object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async searchGames(filters = {}) {
    try {
      const query = {
        bool: {
          must: [],
        },
      };

      // Filtrar por estado
      if (filters.status) {
        query.bool.must.push({
          term: { status: filters.status },
        });
      }

      // Filtrar por número de jugadores
      if (filters.minPlayers) {
        query.bool.must.push({
          range: {
            player_count: {
              gte: filters.minPlayers,
            },
          },
        });
      }

      if (filters.maxPlayers) {
        query.bool.must.push({
          range: {
            player_count: {
              lte: filters.maxPlayers,
            },
          },
        });
      }

      // Buscar por nombre del host
      if (filters.hostName) {
        query.bool.must.push({
          match: {
            host_name: {
              query: filters.hostName,
              fuzziness: 'AUTO',
            },
          },
        });
      }

      // Si no hay filtros, buscar todas las partidas activas
      if (query.bool.must.length === 0) {
        query.bool.must.push({
          match_all: {},
        });
      }

      const response = await elasticsearchService.search(
        'games',
        query,
        filters.limit || 20,
        filters.offset || 0
      );

      return response.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      console.error('Error searching games:', error);
      // Si Elasticsearch no está disponible, retornar array vacío
      return [];
    }
  }

  /**
   * Buscar jugadores
   * @param {object} filters - Filtros de búsqueda
   * @returns {Promise<Array>}
   */
  async searchPlayers(filters = {}) {
    try {
      const query = {
        bool: {
          must: [],
        },
      };

      // Buscar por username
      if (filters.username) {
        query.bool.must.push({
          match: {
            username: {
              query: filters.username,
              fuzziness: 'AUTO',
            },
          },
        });
      }

      // Filtrar por rating
      if (filters.minRating) {
        query.bool.must.push({
          range: {
            rating: {
              gte: filters.minRating,
            },
          },
        });
      }

      if (filters.maxRating) {
        query.bool.must.push({
          range: {
            rating: {
              lte: filters.maxRating,
            },
          },
        });
      }

      // Si no hay filtros, buscar todos
      if (query.bool.must.length === 0) {
        query.bool.must.push({
          match_all: {},
        });
      }

      // Ordenar por rating descendente
      const response = await elasticsearchService.search(
        'users',
        query,
        filters.limit || 20,
        filters.offset || 0
      );

      return response.hits.hits.map(hit => ({
        ...hit._source,
        score: hit._score,
      }));
    } catch (error) {
      console.error('Error searching players:', error);
      // Si Elasticsearch no está disponible, retornar array vacío
      return [];
    }
  }

  /**
   * Indexar una partida pública
   * @param {object} gameData - Datos de la partida
   * @returns {Promise<boolean>}
   */
  async indexGame(gameData) {
    try {
      const { roomCode, hostId, hostName, status, playerCount, maxPlayers, createdAt, lastActivity } = gameData;

      await elasticsearchService.index('games', roomCode, {
        room_code: roomCode,
        host_id: hostId,
        host_name: hostName,
        status: status,
        player_count: playerCount,
        max_players: maxPlayers,
        created_at: createdAt,
        last_activity: lastActivity,
      });

      return true;
    } catch (error) {
      console.error('Error indexing game:', error.message);
      return false;
    }
  }

  /**
   * Indexar un usuario
   * @param {object} userData - Datos del usuario
   * @returns {Promise<boolean>}
   */
  async indexUser(userData) {
    try {
      const { id, username, rating, gamesPlayed, gamesWon, winRate, lastActive } = userData;

      await elasticsearchService.index('users', id, {
        user_id: id,
        username: username,
        rating: rating,
        games_played: gamesPlayed,
        games_won: gamesWon,
        win_rate: winRate || 0,
        last_active: lastActive || new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Error indexing user:', error.message);
      return false;
    }
  }

  /**
   * Actualizar índice de usuario
   * @param {string} userId - ID del usuario
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<boolean>}
   */
  async updateUserIndex(userId, updates) {
    try {
      await elasticsearchService.update('users', userId, updates);
      return true;
    } catch (error) {
      console.error('Error updating user index:', error.message);
      return false;
    }
  }

  /**
   * Eliminar partida del índice
   * @param {string} roomCode - Código de la sala
   * @returns {Promise<boolean>}
   */
  async deleteGame(roomCode) {
    try {
      await elasticsearchService.delete('games', roomCode);
      return true;
    } catch (error) {
      console.error('Error deleting game from index:', error.message);
      return false;
    }
  }
}

module.exports = new SearchService();

