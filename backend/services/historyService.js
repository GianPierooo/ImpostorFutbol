/**
 * Servicio para guardar y obtener historial de partidas
 */

const postgresService = require('./postgresService');
const userService = require('./userService');

class HistoryService {
  /**
   * Guardar partida completada
   * @param {object} gameData - Datos de la partida
   * @returns {Promise<object>}
   */
  async saveGame(gameData) {
    const {
      roomCode,
      secretWord,
      impostorId,
      winner, // 'group' o 'impostor'
      totalRounds,
      players, // Array de {id, name, role, votedFor, won}
      pistas, // Array de {playerId, playerName, text, round, turn}
      votes, // Array de {voterId, voterName, targetId, targetName}
      startedAt,
      finishedAt,
    } = gameData;

    try {
      return await postgresService.transaction(async (client) => {
        // 1. Crear o obtener usuarios
        const userIds = {};
        for (const player of players) {
          const userResult = await userService.createOrGetUser(
            player.name,
            null,
            player.avatar
          );
          userIds[player.id] = userResult.data.id;
        }

        // 2. Insertar partida en game_history
        const gameResult = await client.query(
          `INSERT INTO game_history 
           (room_code, secret_word, impostor_id, winner, total_rounds, total_players, started_at, finished_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *`,
          [
            roomCode,
            secretWord,
            impostorId ? userIds[impostorId] : null,
            winner,
            totalRounds,
            players.length,
            new Date(startedAt),
            new Date(finishedAt),
          ]
        );

        const gameId = gameResult.rows[0].id;

        // 3. Insertar participaciones
        for (const player of players) {
          const userId = userIds[player.id];
          const votedForUserId = player.votedFor ? userIds[player.votedFor] : null;

          await client.query(
            `INSERT INTO participations (game_id, user_id, role, voted_for, won)
             VALUES ($1, $2, $3, $4, $5)`,
            [gameId, userId, player.role, votedForUserId, player.won]
          );
        }

        // 4. Insertar pistas
        for (const pista of pistas) {
          const userId = userIds[pista.playerId];
          await client.query(
            `INSERT INTO pistas_history (game_id, user_id, text, round, turn)
             VALUES ($1, $2, $3, $4, $5)`,
            [gameId, userId, pista.text, pista.round, pista.turn]
          );
        }

        // 5. Insertar votos
        for (const vote of votes) {
          const voterUserId = userIds[vote.voterId];
          const targetUserId = userIds[vote.targetId];
          await client.query(
            `INSERT INTO votes_history (game_id, voter_id, target_id)
             VALUES ($1, $2, $3)`,
            [gameId, voterUserId, targetUserId]
          );
        }

        // 6. Actualizar estadísticas de usuarios
        for (const player of players) {
          const userId = userIds[player.id];
          await client.query(
            `UPDATE users 
             SET games_played = games_played + 1,
                 games_won = games_won + CASE WHEN $1 THEN 1 ELSE 0 END,
                 games_lost = games_lost + CASE WHEN $1 THEN 0 ELSE 1 END
             WHERE id = $2`,
            [player.won, userId]
          );
        }

        // 7. Actualizar índices de usuarios en Elasticsearch
        try {
          const searchService = require('./searchService');
          for (const player of players) {
            const userId = userIds[player.id];
            const user = await userService.getUserById(userId);
            if (user) {
              const winRate = user.games_played > 0 
                ? (user.games_won / user.games_played) * 100 
                : 0;
              
              await searchService.indexUser({
                id: userId,
                username: user.username,
                rating: user.rating,
                gamesPlayed: user.games_played,
                gamesWon: user.games_won,
                winRate: winRate,
                lastActive: new Date().toISOString(),
              });
            }
          }
        } catch (error) {
          console.warn('No se pudieron actualizar índices de usuarios:', error.message);
        }

        return {
          success: true,
          data: {
            gameId: gameId,
            ...gameResult.rows[0],
          },
        };
      });
    } catch (error) {
      console.error('Error saving game:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de partidas
   * @param {number} limit - Límite de resultados
   * @param {number} offset - Offset para paginación
   * @returns {Promise<Array>}
   */
  async getGameHistory(limit = 20, offset = 0) {
    try {
      const result = await postgresService.query(
        `SELECT g.*, u.username as impostor_name
         FROM game_history g
         LEFT JOIN users u ON g.impostor_id = u.id
         ORDER BY g.finished_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting game history:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle de una partida
   * @param {string} gameId - ID de la partida
   * @returns {Promise<object|null>}
   */
  async getGameDetails(gameId) {
    try {
      // Obtener información de la partida
      const gameResult = await postgresService.query(
        `SELECT g.*, u.username as impostor_name
         FROM game_history g
         LEFT JOIN users u ON g.impostor_id = u.id
         WHERE g.id = $1`,
        [gameId]
      );

      if (gameResult.rows.length === 0) {
        return null;
      }

      const game = gameResult.rows[0];

      // Obtener participantes
      const participantsResult = await postgresService.query(
        `SELECT p.*, u.username, u.avatar
         FROM participations p
         JOIN users u ON p.user_id = u.id
         WHERE p.game_id = $1`,
        [gameId]
      );

      // Obtener pistas
      const pistasResult = await postgresService.query(
        `SELECT ph.*, u.username
         FROM pistas_history ph
         JOIN users u ON ph.user_id = u.id
         WHERE ph.game_id = $1
         ORDER BY ph.round, ph.turn`,
        [gameId]
      );

      // Obtener votos
      const votesResult = await postgresService.query(
        `SELECT v.*, 
                voter.username as voter_name,
                target.username as target_name
         FROM votes_history v
         JOIN users voter ON v.voter_id = voter.id
         JOIN users target ON v.target_id = target.id
         WHERE v.game_id = $1`,
        [gameId]
      );

      return {
        ...game,
        participants: participantsResult.rows,
        pistas: pistasResult.rows,
        votes: votesResult.rows,
      };
    } catch (error) {
      console.error('Error getting game details:', error);
      throw error;
    }
  }
}

module.exports = new HistoryService();

