/**
 * Servicio de lógica del juego
 */

const redisService = require('./redisService');
const { validatePista } = require('../utils/validation');
const constants = require('../config/constants');
const { assignRoles } = require('./gameLogic');

class GameService {
  /**
   * Inicia un juego
   * @param {string} code - Código de la sala
   * @param {string} hostId - ID del host
   * @returns {Promise<object>}
   */
  /**
   * Inicia un juego
   * 
   * IMPORTANTE: El orden de los jugadores en roleAssignment.players es crítico.
   * Este orden se usa para determinar el turno de cada jugador durante las rondas.
   * currentPlayerIndex apunta a la posición en este array.
   * 
   * Flujo:
   * 1. Obtiene todos los jugadores de la sala (orden: orden de unión)
   * 2. Asigna roles manteniendo el mismo orden
   * 3. Inicializa currentPlayerIndex = 0 (primer jugador en el array)
   * 4. Los turnos avanzan secuencialmente: 0 -> 1 -> 2 -> ... -> 0 (circular)
   * 
   * @param {string} code - Código de la sala
   * @param {string} hostId - ID del host
   * @returns {Promise<object>}
   */
  async startGame(code, hostId) {
    const room = await redisService.getRoom(code);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    // Verificar que es el host
    const hostInfo = await redisService.getPlayerInfo(code, hostId);
    if (!hostInfo || !hostInfo.isHost) {
      throw new Error('Solo el host puede iniciar el juego');
    }

    // Verificar que hay suficientes jugadores
    const players = await redisService.getAllPlayersInfo(code);
    if (players.length < constants.MIN_PLAYERS_TO_START) {
      throw new Error(`Se necesitan al menos ${constants.MIN_PLAYERS_TO_START} jugadores para iniciar`);
    }

    // Verificar que la sala está en lobby
    if (room.status !== constants.GAME_PHASES.LOBBY) {
      throw new Error('El juego ya ha comenzado');
    }

    // Verificar que no hay un estado de juego previo (limpiar si existe)
    const existingGameState = await redisService.getGameState(code);
    if (existingGameState) {
      // Si hay un estado de juego pero la sala está en lobby, limpiarlo
      console.log(`⚠️ Limpiando estado de juego previo para sala ${code}`);
      await redisService.deleteGameState(code);
    }

    // Limpiar tracking de roles vistos al iniciar un nuevo juego
    await redisService.clearRolesSeen(code);

    // Convertir a formato Player para assignRoles
    // IMPORTANTE: Mantener el orden de los jugadores tal como están en Redis
    // Este orden se preservará en roleAssignment.players y se usará para los turnos
    const playersForRoles = players.map(p => ({
      id: p.id,
      name: p.name,
    }));

    // Asignar roles
    // assignRoles mantiene el orden de los jugadores y solo asigna roles
    const roleAssignment = assignRoles(playersForRoles);

    // Guardar roles en Redis
    // Mapeo: playerId -> role
    const rolesMap = {};
    roleAssignment.players.forEach(player => {
      rolesMap[player.id] = player.role;
    });
    await redisService.saveRoles(code, rolesMap);

    // Crear estado del juego
    // currentPlayerIndex = 0 significa que el primer jugador en roleAssignment.players es el primero en dar pista
    const gameState = {
      secretWord: roleAssignment.secretWord,
      impostorId: roleAssignment.impostorId,
      currentRound: 1,
      maxRounds: room.config.rounds,
      phase: constants.GAME_PHASES.ROLE_ASSIGNMENT,
      currentPlayerIndex: 0, // Índice del jugador actual en roleAssignment.players (0 = primer jugador)
      currentVoterIndex: 0, // Índice del votante actual (0 = primer jugador)
      currentTurn: 1, // Número de turno dentro de la ronda actual (incrementa cuando currentPlayerIndex vuelve a 0)
    };

    await redisService.saveGameState(code, gameState);
    await redisService.updateRoomStatus(code, constants.GAME_PHASES.ROLE_ASSIGNMENT);

    return {
      gameState,
      roleAssignment: {
        secretWord: roleAssignment.secretWord,
        impostorId: roleAssignment.impostorId,
        players: roleAssignment.players, // Array ordenado de jugadores (orden de turnos)
      },
    };
  }

  /**
   * Agrega una pista
   * 
   * IMPORTANTE: El orden de los jugadores debe ser el mismo que en roleAssignment.players
   * para que currentPlayerIndex apunte al jugador correcto.
   * 
   * Flujo:
   * 1. Verifica que el juego está en fase ROUND
   * 2. Valida la pista (texto, longitud, palabra secreta)
   * 3. Obtiene la lista de jugadores (debe estar en el mismo orden que roleAssignment.players)
   * 4. Verifica que currentPlayerIndex apunta al jugador correcto
   * 5. Valida que es el turno del jugador (currentPlayer.id === playerId)
   * 6. Guarda la pista
   * 7. Avanza al siguiente jugador: currentPlayerIndex = (currentPlayerIndex + 1) % totalPlayers
   * 8. Si currentPlayerIndex vuelve a 0, incrementa currentTurn (nueva vuelta completa)
   * 
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador que envía la pista
   * @param {string} text - Texto de la pista
   * @returns {Promise<object>}
   */
  async addPista(code, playerId, text) {
    // Verificar que el juego está en fase de ronda
    const gameState = await redisService.getGameState(code);
    if (!gameState || gameState.phase !== constants.GAME_PHASES.ROUND) {
      throw new Error('No puedes agregar pistas en este momento');
    }

    // Validar pista (incluyendo validación de palabra secreta)
    const validation = validatePista(text, gameState.secretWord);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // IMPORTANTE: Reconstruir roleAssignment.players desde los roles guardados en Redis
    // Este orden es la fuente de verdad para currentPlayerIndex
    // No usar getAllPlayersInfo porque puede tener un orden diferente
    const roles = await redisService.getRoles(code);
    const allPlayers = await redisService.getAllPlayersInfo(code);
    
    // Reconstruir roleAssignment.players en el orden original
    // El orden se preserva porque los roles se guardan en el mismo orden que se asignaron
    const roleAssignmentPlayers = [];
    const playerMap = new Map(allPlayers.map(p => [p.id, p]));
    
    // Iterar sobre los roles en el orden en que se guardaron (orden de asignación)
    // Esto mantiene el orden original de roleAssignment.players
    for (const [pId, role] of Object.entries(roles)) {
      const player = playerMap.get(pId);
      if (player) {
        roleAssignmentPlayers.push({
          id: player.id,
          name: player.name,
          role: role,
        });
      }
    }
    
    // Si no hay roles guardados, usar getAllPlayersInfo como fallback (no debería pasar)
    const players = roleAssignmentPlayers.length > 0 ? roleAssignmentPlayers : allPlayers.map(p => ({ ...p, role: 'normal' }));
    
    // Validar que el índice esté dentro del rango
    if (gameState.currentPlayerIndex >= players.length || gameState.currentPlayerIndex < 0) {
      console.warn(`⚠️ currentPlayerIndex (${gameState.currentPlayerIndex}) fuera de rango, reseteando a 0`);
      gameState.currentPlayerIndex = 0;
      await redisService.saveGameState(code, gameState);
    }
    
    // Obtener el jugador que debería estar escribiendo según currentPlayerIndex
    // IMPORTANTE: Usar players (roleAssignment.players reconstruido) no allPlayers
    const currentPlayer = players[gameState.currentPlayerIndex];
    if (!currentPlayer) {
      throw new Error('Error: No hay jugador en el índice actual');
    }
    
    // Verificar que es el turno del jugador que intenta enviar la pista
    if (currentPlayer.id !== playerId) {
      throw new Error(`No es tu turno. Es el turno de ${currentPlayer.name}`);
    }

    // Obtener información del jugador (optimizado: ya tenemos el nombre en currentPlayer)
    const playerName = currentPlayer.name;

    // Crear pista
    const pista = {
      id: `pista-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      playerName: playerName,
      text: text.trim(),
      round: gameState.currentRound,
      turn: gameState.currentTurn,
    };

    // Avanzar al siguiente jugador ANTES de guardar
    // El orden es circular: 0 -> 1 -> 2 -> ... -> (n-1) -> 0 -> ...
    const totalPlayers = players.length;
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % totalPlayers;
    
    // Si currentPlayerIndex vuelve a 0, significa que completamos una vuelta completa
    // Incrementamos currentTurn para indicar que empezamos una nueva vuelta
    if (gameState.currentPlayerIndex === 0) {
      gameState.currentTurn += 1;
    }

    // Optimización: Guardar pista y gameState en paralelo usando Promise.all
    // Esto reduce la latencia total
    await Promise.all([
      redisService.addPista(code, pista),
      redisService.saveGameState(code, gameState),
    ]);

    // Verificar si todos los jugadores han dado su pista en el PRIMER TURNO de la ronda actual
    // IMPORTANTE: Solo considerar el turno 1 para evitar que se active cuando hay múltiples turnos
    const roundPistas = await redisService.getPistasByRound(code, gameState.currentRound);
    const firstTurnPistas = roundPistas.filter(p => p.turn === 1);
    const playersWhoGavePista = new Set(firstTurnPistas.map(p => p.playerId));
    const allPlayersGavePista = players.every((p) => playersWhoGavePista.has(p.id));

    // Si todos dieron su pista en el primer turno, cambiar automáticamente a fase de discusión
    if (allPlayersGavePista) {
      gameState.phase = constants.GAME_PHASES.DISCUSSION;
      await redisService.saveGameState(code, gameState);
      await redisService.updateRoomStatus(code, constants.GAME_PHASES.DISCUSSION);
      console.log(`✅ Todos los jugadores dieron su pista en ronda ${gameState.currentRound} (turno 1) - Cambiando a fase DISCUSSION`);
    }

    // Retornar el gameState actualizado (ya está guardado)
    return {
      pista,
      gameState: gameState, // Usar el gameState ya actualizado, no hacer otra llamada a Redis
      allPlayersGavePista, // Indicar si todos dieron su pista
    };
  }

  /**
   * Agrega un voto
   * @param {string} code - Código de la sala
   * @param {string} voterId - ID del votante
   * @param {string} targetId - ID del objetivo
   * @returns {Promise<object>}
   */
  async addVote(code, voterId, targetId) {
    // Verificar que el juego está en fase de votación
    const gameState = await redisService.getGameState(code);
    if (!gameState || gameState.phase !== constants.GAME_PHASES.VOTING) {
      throw new Error('No puedes votar en este momento');
    }

    // Verificar que es el turno del votante
    const players = await redisService.getAllPlayersInfo(code);
    
    // Validar que el índice esté dentro del rango
    if (gameState.currentVoterIndex >= players.length || gameState.currentVoterIndex < 0) {
      // Ajustar índice si está fuera de rango
      gameState.currentVoterIndex = 0;
      await redisService.saveGameState(code, gameState);
    }
    
    const currentVoter = players[gameState.currentVoterIndex];
    if (!currentVoter || currentVoter.id !== voterId) {
      throw new Error('No es tu turno de votar');
    }

    // Verificar que no se vote a uno mismo
    if (voterId === targetId) {
      throw new Error('No puedes votar por ti mismo');
    }

    // Verificar que el objetivo existe
    const targetInfo = await redisService.getPlayerInfo(code, targetId);
    if (!targetInfo) {
      throw new Error('Jugador objetivo no encontrado');
    }

    // Obtener información del votante
    const voterInfo = await redisService.getPlayerInfo(code, voterId);
    if (!voterInfo) {
      throw new Error('Jugador no encontrado');
    }

    // Guardar voto
    await redisService.addVote(code, voterId, targetId);

    // Verificar si todos los jugadores ya votaron
    const allVotes = await redisService.getVotes(code);
    const allPlayersVoted = players.every(player => 
      Object.keys(allVotes).includes(player.id)
    );

    // Avanzar al siguiente votante
    const totalPlayers = players.length;
    gameState.currentVoterIndex = (gameState.currentVoterIndex + 1) % totalPlayers;

    // Si todos votaron, cambiar a fase de resultados
    if (allPlayersVoted) {
      gameState.phase = constants.GAME_PHASES.RESULTS;
      await redisService.updateRoomStatus(code, constants.GAME_PHASES.RESULTS);
      
      // Guardar la partida en PostgreSQL
      try {
        const historyService = require('./historyService');
        const gameData = await this.getGameDataForHistory(code);
        await historyService.saveGame(gameData);
        console.log(`✅ Partida ${code} guardada en historial (todos votaron)`);
      } catch (error) {
        console.error(`⚠️ Error guardando partida ${code} en historial:`, error.message);
        // Continuar aunque falle el guardado
      }
    }

    await redisService.saveGameState(code, gameState);

    return {
      vote: {
        voterId,
        voterName: voterInfo.name,
        targetId,
        targetName: targetInfo.name,
      },
      gameState: await redisService.getGameState(code),
      allVotesComplete: allPlayersVoted,
    };
  }

  /**
   * Cambia la fase del juego
   * @param {string} code - Código de la sala
   * @param {string} phase - Nueva fase
   * @param {string} playerId - ID del jugador que solicita el cambio
   * @returns {Promise<object>}
   */
  async changePhase(code, phase, playerId) {
    const room = await redisService.getRoom(code);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    // Verificar que es el host
    const playerInfo = await redisService.getPlayerInfo(code, playerId);
    if (!playerInfo || !playerInfo.isHost) {
      throw new Error('Solo el host puede cambiar la fase');
    }

    // Validar fase
    const validPhases = Object.values(constants.GAME_PHASES);
    if (!validPhases.includes(phase)) {
      throw new Error('Fase inválida');
    }

    // Si se cambia a 'results', guardar la partida en PostgreSQL
    if (phase === constants.GAME_PHASES.RESULTS) {
      try {
        const historyService = require('./historyService');
        const gameData = await this.getGameDataForHistory(code);
        await historyService.saveGame(gameData);
        console.log(`✅ Partida ${code} guardada en historial`);
      } catch (error) {
        console.error(`⚠️ Error guardando partida ${code} en historial:`, error.message);
        // Continuar aunque falle el guardado
      }
    }

    // Actualizar estado
    const gameState = await redisService.getGameState(code);
    if (gameState) {
      gameState.phase = phase;
      await redisService.saveGameState(code, gameState);
    }

    await redisService.updateRoomStatus(code, phase);

    return {
      phase,
      gameState: await redisService.getGameState(code),
    };
  }

  /**
   * Avanza a la siguiente ronda
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador que solicita
   * @returns {Promise<object>}
   */
  async nextRound(code, playerId) {
    const gameState = await redisService.getGameState(code);
    if (!gameState) {
      throw new Error('Juego no encontrado');
    }

    // Verificar que es el host
    const playerInfo = await redisService.getPlayerInfo(code, playerId);
    if (!playerInfo || !playerInfo.isHost) {
      throw new Error('Solo el host puede avanzar la ronda');
    }

    // Verificar que no es la última ronda
    if (gameState.maxRounds !== null && gameState.currentRound >= gameState.maxRounds) {
      throw new Error('Ya es la última ronda');
    }

    // Avanzar ronda: incrementar número de ronda y resetear índices
    gameState.currentRound += 1;
    gameState.currentPlayerIndex = 0;
    gameState.currentTurn = 1;
    gameState.phase = constants.GAME_PHASES.ROUND; // Cambiar a fase ROUND

    await redisService.saveGameState(code, gameState);
    await redisService.updateRoomStatus(code, constants.GAME_PHASES.ROUND);

    return {
      gameState: await redisService.getGameState(code),
    };
  }

  /**
   * Obtiene el rol de un jugador
   * @param {string} code - Código de la sala
   * @param {string} playerId - ID del jugador
   * @returns {Promise<object>}
   */
  async getPlayerRole(code, playerId) {
    const gameState = await redisService.getGameState(code);
    if (!gameState) {
      throw new Error('Juego no encontrado');
    }

    const role = await redisService.getPlayerRole(code, playerId);
    if (!role) {
      throw new Error('Rol no encontrado');
    }

    const isImpostor = role === constants.ROLES.IMPOSTOR;

    return {
      role,
      secretWord: isImpostor ? null : gameState.secretWord,
      isImpostor,
    };
  }

  /**
   * Obtiene los resultados de la votación
   * @param {string} code - Código de la sala
   * @returns {Promise<object>}
   */
  async getVotingResults(code) {
    const gameState = await redisService.getGameState(code);
    if (!gameState) {
      throw new Error('Juego no encontrado');
    }

    const votes = await redisService.getVotes(code);
    const players = await redisService.getAllPlayersInfo(code);

    // Contar votos
    const voteCounts = {};
    players.forEach(player => {
      voteCounts[player.id] = 0;
    });

    Object.values(votes).forEach(targetId => {
      if (voteCounts[targetId] !== undefined) {
        voteCounts[targetId] += 1;
      }
    });

    // Encontrar el más votado
    let maxVotes = 0;
    let mostVoted = null;
    let isTie = false;

    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = playerId;
        isTie = false;
      } else if (count === maxVotes && count > 0) {
        isTie = true;
      }
    });

    // Crear array de votos con nombres
    const votesArray = Object.entries(votes).map(([voterId, targetId]) => {
      const voter = players.find(p => p.id === voterId);
      const target = players.find(p => p.id === targetId);
      return {
        voterId,
        voterName: voter?.name || 'Desconocido',
        targetId,
        targetName: target?.name || 'Desconocido',
      };
    });

    return {
      votes: votesArray,
      voteCounts,
      mostVoted: isTie ? null : mostVoted,
      isTie,
    };
  }

  /**
   * Obtiene todos los datos de la partida para guardar en historial
   * @param {string} code - Código de la sala
   * @returns {Promise<object>}
   */
  async getGameDataForHistory(code) {
    const room = await redisService.getRoom(code);
    if (!room) {
      throw new Error('Sala no encontrada');
    }

    const gameState = await redisService.getGameState(code);
    if (!gameState) {
      throw new Error('Juego no encontrado');
    }

    const players = await redisService.getAllPlayersInfo(code);
    const pistas = await redisService.getPistas(code);
    const votes = await redisService.getVotes(code);
    const roles = await redisService.getRoles(code);

    // Obtener resultados de votación
    const votingResults = await this.getVotingResults(code);

    // Determinar ganador
    const mostVotedId = votingResults.mostVoted;
    const winner = mostVotedId === gameState.impostorId ? 'group' : 'impostor';

    // Preparar datos de jugadores
    const playersData = players.map(player => {
      const role = roles[player.id] || 'normal';
      const playerVote = votes[player.id];
      const won = (role === 'impostor' && winner === 'impostor') ||
                  (role === 'normal' && winner === 'group');

      return {
        id: player.id,
        name: player.name,
        role: role,
        votedFor: playerVote || null,
        won: won,
      };
    });

    // Preparar datos de pistas (pistas es un array)
    const pistasData = Array.isArray(pistas) 
      ? pistas.map(pista => ({
          playerId: pista.playerId,
          playerName: pista.playerName,
          text: pista.text,
          round: pista.round,
          turn: pista.turn,
        }))
      : Object.values(pistas).map(pista => ({
          playerId: pista.playerId,
          playerName: pista.playerName,
          text: pista.text,
          round: pista.round,
          turn: pista.turn,
        }));

    // Preparar datos de votos
    const votesData = votingResults.votes;

    return {
      roomCode: code,
      secretWord: gameState.secretWord,
      impostorId: gameState.impostorId,
      winner: winner,
      totalRounds: gameState.currentRound,
      players: playersData,
      pistas: pistasData,
      votes: votesData,
      startedAt: room.createdAt || Date.now(),
      finishedAt: Date.now(),
    };
  }
}

module.exports = new GameService();

