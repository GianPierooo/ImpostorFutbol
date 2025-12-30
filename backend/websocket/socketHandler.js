/**
 * Handler de WebSocket con Socket.io
 */

const constants = require('../config/constants');
const roomService = require('../services/roomService');
const gameService = require('../services/gameService');
const redisService = require('../services/redisService');

/**
 * Configura los handlers de Socket.io
 * @param {object} io - Instancia de Socket.io
 */
function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✅ Cliente conectado: ${socket.id}`);

    let currentRoomCode = null;
    let currentPlayerId = null;

    /**
     * Unirse a una sala
     */
    socket.on(constants.SOCKET_EVENTS.JOIN_ROOM, async (data) => {
      try {
        const { code, playerId } = data;

        if (!code || !playerId) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code y playerId son requeridos',
          });
          return;
        }

        // Unirse a la sala de Socket.io
        socket.join(`room:${code}`);
        currentRoomCode = code;
        currentPlayerId = playerId;

        // Obtener estado actual de la sala
        const roomState = await roomService.getRoomState(code);

        // Notificar al cliente
        socket.emit(constants.SOCKET_EVENTS.ROOM_UPDATED, {
          roomState,
        });

        // Notificar a otros jugadores
        socket.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PLAYER_JOINED, {
          playerId,
          roomState,
        });

        console.log(`👤 ${playerId} se unió a la sala ${code}`);
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Salir de una sala
     */
    socket.on(constants.SOCKET_EVENTS.LEAVE_ROOM, async (data) => {
      try {
        const { code, playerId } = data;

        if (code && playerId) {
          const result = await roomService.leaveRoom(code, playerId);
          
          socket.leave(`room:${code}`);
          
          // Si la sala fue eliminada (último jugador salió), notificar a todos
          if (!result.room) {
            io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.ROOM_UPDATED, {
              roomState: null,
            });
          } else {
            // Obtener estado actualizado y notificar a los demás jugadores
            const roomState = await roomService.getRoomState(code);
            socket.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PLAYER_LEFT, {
              playerId,
              roomState,
            });
          }

          console.log(`👋 ${playerId} salió de la sala ${code}`);
        }

        currentRoomCode = null;
        currentPlayerId = null;
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Iniciar juego
     */
    socket.on(constants.SOCKET_EVENTS.START_GAME, async (data) => {
      try {
        const { code, hostId } = data;

        if (!code || !hostId) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code y hostId son requeridos',
          });
          return;
        }

        const result = await gameService.startGame(code, hostId);

        // Obtener lista de sockets en la sala para debugging
        const socketsInRoom = await io.in(`room:${code}`).fetchSockets();
        console.log(`🎮 Juego iniciado en sala ${code} - ${socketsInRoom.length} jugadores conectados`);

        // Notificar a todos en la sala (incluyendo al que inició)
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.GAME_STATE_CHANGED, {
          gameState: result.gameState,
          roleAssignment: result.roleAssignment,
        });

        // También notificar cambio de fase
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PHASE_CHANGED, {
          phase: result.gameState.phase,
          gameState: result.gameState,
        });
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Agregar pista
     */
    socket.on(constants.SOCKET_EVENTS.ADD_PISTA, async (data) => {
      try {
        const { code, playerId, text } = data;

        if (!code || !playerId || !text) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code, playerId y text son requeridos',
          });
          return;
        }

        // Procesar la pista y actualizar el estado
        const result = await gameService.addPista(code, playerId, text);

        // Notificar a todos en la sala INMEDIATAMENTE después de actualizar
        // Esto asegura que todos los jugadores vean el cambio de turno al instante
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PISTA_ADDED, {
          pista: result.pista,
          gameState: result.gameState,
        });

        // Si todos los jugadores dieron su pista, notificar cambio de fase automático
        if (result.allPlayersGavePista) {
          io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PHASE_CHANGED, {
            phase: result.gameState.phase,
            gameState: result.gameState,
          });
          console.log(`🔄 Fase cambiada automáticamente a DISCUSSION en sala ${code} (todos dieron su pista)`);
        }

        console.log(`💬 Pista agregada en sala ${code} por ${playerId} - Turno actualizado a índice ${result.gameState.currentPlayerIndex}`);
      } catch (error) {
        // Enviar error solo al jugador que intentó enviar la pista
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
        console.error(`❌ Error agregando pista en sala ${code}:`, error.message);
      }
    });

    /**
     * Agregar voto
     */
    socket.on(constants.SOCKET_EVENTS.ADD_VOTE, async (data) => {
      try {
        const { code, voterId, targetId } = data;

        if (!code || !voterId || !targetId) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code, voterId y targetId son requeridos',
          });
          return;
        }

        const result = await gameService.addVote(code, voterId, targetId);

        // Notificar a todos en la sala
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.VOTE_ADDED, {
          vote: result.vote,
          gameState: result.gameState,
          allVotesComplete: result.allVotesComplete,
        });

        // Si todos votaron, notificar cambio de fase
        if (result.allVotesComplete) {
          io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PHASE_CHANGED, {
            phase: result.gameState.phase,
            gameState: result.gameState,
          });
        }

        console.log(`🗳️ Voto agregado en sala ${code}: ${voterId} vota por ${targetId}`);
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Cambiar fase
     */
    socket.on(constants.SOCKET_EVENTS.CHANGE_PHASE, async (data) => {
      try {
        const { code, playerId, phase } = data;

        if (!code || !playerId || !phase) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code, playerId y phase son requeridos',
          });
          return;
        }

        const result = await gameService.changePhase(code, phase, playerId);

        // Notificar a todos en la sala
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PHASE_CHANGED, {
          phase: result.phase,
          gameState: result.gameState,
        });

        console.log(`🔄 Fase cambiada a ${phase} en sala ${code}`);
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Resetear sala a lobby (jugar otra vez)
     */
    socket.on(constants.SOCKET_EVENTS.RESET_ROOM, async (data) => {
      try {
        const { code, hostId } = data;

        if (!code || !hostId) {
          socket.emit(constants.SOCKET_EVENTS.ERROR, {
            message: 'code y hostId son requeridos',
          });
          return;
        }

        const result = await roomService.resetRoomToLobby(code, hostId);

        // Notificar a todos en la sala que la sala fue reseteada
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.ROOM_RESET, {
          roomState: result,
        });

        // También notificar cambio de fase a lobby
        io.to(`room:${code}`).emit(constants.SOCKET_EVENTS.PHASE_CHANGED, {
          phase: constants.GAME_PHASES.LOBBY,
          gameState: null,
        });

        console.log(`🔄 Sala ${code} reseteada a lobby por el host`);
      } catch (error) {
        socket.emit(constants.SOCKET_EVENTS.ERROR, {
          message: error.message,
        });
      }
    });

    /**
     * Desconexión
     */
    socket.on('disconnect', async () => {
      console.log(`❌ Cliente desconectado: ${socket.id}`);

      // Si estaba en una sala, notificar
      if (currentRoomCode && currentPlayerId) {
        try {
          const result = await roomService.leaveRoom(currentRoomCode, currentPlayerId);
          
          // Si la sala fue eliminada, notificar a todos
          if (!result.room) {
            io.to(`room:${currentRoomCode}`).emit(constants.SOCKET_EVENTS.ROOM_UPDATED, {
              roomState: null,
            });
          } else {
            // Obtener estado actualizado y notificar a los demás jugadores
            const roomState = await roomService.getRoomState(currentRoomCode);
            socket.to(`room:${currentRoomCode}`).emit(constants.SOCKET_EVENTS.PLAYER_LEFT, {
              playerId: currentPlayerId,
              roomState,
            });
          }
        } catch (error) {
          console.error('Error al manejar desconexión:', error);
        }
      }
    });
  });
}

module.exports = setupSocketHandlers;

