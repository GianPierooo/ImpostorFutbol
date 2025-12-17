/**
 * Servicio para operaciones con usuarios
 */

const postgresService = require('./postgresService');

class UserService {
  /**
   * Crear o obtener usuario
   * @param {string} username - Nombre de usuario
   * @param {string} email - Email (opcional)
   * @param {string} avatar - URL del avatar (opcional)
   * @returns {Promise<object>}
   */
  async createOrGetUser(username, email = null, avatar = null) {
    try {
      // Intentar obtener usuario existente
      const existing = await postgresService.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      if (existing.rows.length > 0) {
        return {
          success: true,
          data: existing.rows[0],
          created: false,
        };
      }

      // Crear nuevo usuario
      const result = await postgresService.query(
        `INSERT INTO users (username, email, avatar, rating, games_played, games_won, games_lost)
         VALUES ($1, $2, $3, 1000, 0, 0, 0)
         RETURNING *`,
        [username, email, avatar]
      );

      // Indexar usuario en Elasticsearch (si está disponible)
      try {
        const searchService = require('./searchService');
        await searchService.indexUser({
          id: result.rows[0].id,
          username: username,
          rating: 1000,
          gamesPlayed: 0,
          gamesWon: 0,
          winRate: 0,
          lastActive: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('No se pudo indexar usuario en Elasticsearch:', error.message);
      }

      return {
        success: true,
        data: result.rows[0],
        created: true,
      };
    } catch (error) {
      console.error('Error creating/getting user:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   * @param {string} userId - ID del usuario
   * @returns {Promise<object|null>}
   */
  async getUserById(userId) {
    try {
      const result = await postgresService.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por username
   * @param {string} username - Nombre de usuario
   * @returns {Promise<object|null>}
   */
  async getUserByUsername(username) {
    try {
      const result = await postgresService.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );

      return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil de usuario
   * @param {string} userId - ID del usuario
   * @param {object} updates - Campos a actualizar
   * @returns {Promise<object>}
   */
  async updateUser(userId, updates) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      if (updates.email !== undefined) {
        fields.push(`email = $${paramIndex++}`);
        values.push(updates.email);
      }
      if (updates.avatar !== undefined) {
        fields.push(`avatar = $${paramIndex++}`);
        values.push(updates.avatar);
      }

      if (fields.length === 0) {
        return { success: false, error: 'No fields to update' };
      }

      values.push(userId);
      const result = await postgresService.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      return {
        success: true,
        data: result.rows[0],
      };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuario
   * @param {string} userId - ID del usuario
   * @returns {Promise<object>}
   */
  async getUserStats(userId) {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return null;
      }

      // Obtener partidas ganadas como impostor
      const impostorWins = await postgresService.query(
        `SELECT COUNT(*) as count FROM participations p
         JOIN game_history g ON p.game_id = g.id
         WHERE p.user_id = $1 AND p.role = 'impostor' AND g.winner = 'impostor' AND p.won = true`,
        [userId]
      );

      // Obtener partidas ganadas como normal
      const normalWins = await postgresService.query(
        `SELECT COUNT(*) as count FROM participations p
         JOIN game_history g ON p.game_id = g.id
         WHERE p.user_id = $1 AND p.role = 'normal' AND g.winner = 'group' AND p.won = true`,
        [userId]
      );

      return {
        ...user,
        impostor_wins: parseInt(impostorWins.rows[0].count),
        normal_wins: parseInt(normalWins.rows[0].count),
        win_rate: user.games_played > 0 
          ? ((user.games_won / user.games_played) * 100).toFixed(2) 
          : '0.00',
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Obtener partidas de un usuario
   * @param {string} userId - ID del usuario
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>}
   */
  async getUserGames(userId, limit = 10, offset = 0) {
    try {
      const result = await postgresService.query(
        `SELECT g.*, p.role, p.won
         FROM game_history g
         JOIN participations p ON g.id = p.game_id
         WHERE p.user_id = $1
         ORDER BY g.finished_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting user games:', error);
      throw error;
    }
  }
}

module.exports = new UserService();

