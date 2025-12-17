/**
 * Servicio para calcular y actualizar ratings
 * Sistema de rating simple basado en victorias/derrotas
 */

const postgresService = require('./postgresService');

class RatingService {
  /**
   * Calcular nuevo rating después de una partida
   * Sistema simple: +25 por victoria, -15 por derrota
   * @param {number} currentRating - Rating actual
   * @param {boolean} won - Si ganó la partida
   * @returns {number}
   */
  calculateNewRating(currentRating, won) {
    if (won) {
      return currentRating + 25;
    } else {
      return Math.max(100, currentRating - 15); // Mínimo 100
    }
  }

  /**
   * Actualizar rating de un usuario
   * @param {string} userId - ID del usuario
   * @param {boolean} won - Si ganó la partida
   * @returns {Promise<object>}
   */
  async updateUserRating(userId, won) {
    try {
      // Obtener rating actual
      const userResult = await postgresService.query(
        'SELECT rating FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentRating = userResult.rows[0].rating;
      const newRating = this.calculateNewRating(currentRating, won);

      // Actualizar rating
      const result = await postgresService.query(
        'UPDATE users SET rating = $1 WHERE id = $2 RETURNING *',
        [newRating, userId]
      );

      return {
        success: true,
        data: {
          oldRating: currentRating,
          newRating: newRating,
          change: won ? 25 : -15,
        },
      };
    } catch (error) {
      console.error('Error updating user rating:', error);
      throw error;
    }
  }

  /**
   * Obtener rankings globales
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>}
   */
  async getRankings(limit = 100, offset = 0) {
    try {
      const result = await postgresService.query(
        `SELECT id, username, avatar, rating, games_played, games_won,
                CASE WHEN games_played > 0 
                  THEN ROUND((games_won::numeric / games_played::numeric) * 100, 2)
                  ELSE 0 
                END as win_rate
         FROM users
         WHERE games_played > 0
         ORDER BY rating DESC, games_won DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      // Agregar posición
      const rankings = result.rows.map((user, index) => ({
        position: offset + index + 1,
        ...user,
      }));

      return rankings;
    } catch (error) {
      console.error('Error getting rankings:', error);
      throw error;
    }
  }

  /**
   * Obtener posición de un usuario en el ranking
   * @param {string} userId - ID del usuario
   * @returns {Promise<number|null>}
   */
  async getUserRankPosition(userId) {
    try {
      const result = await postgresService.query(
        `SELECT COUNT(*) + 1 as position
         FROM users u1
         WHERE u1.rating > (SELECT rating FROM users WHERE id = $1)
            OR (u1.rating = (SELECT rating FROM users WHERE id = $1) 
                AND u1.games_won > (SELECT games_won FROM users WHERE id = $1))
            OR (u1.rating = (SELECT rating FROM users WHERE id = $1) 
                AND u1.games_won = (SELECT games_won FROM users WHERE id = $1)
                AND u1.id < $1)`,
        [userId]
      );

      return parseInt(result.rows[0].position);
    } catch (error) {
      console.error('Error getting user rank position:', error);
      throw error;
    }
  }
}

module.exports = new RatingService();

