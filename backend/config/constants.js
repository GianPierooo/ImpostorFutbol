/**
 * Constantes de configuración del backend
 */

module.exports = {
  // Configuración de salas
  ROOM_CODE_LENGTH: parseInt(process.env.ROOM_CODE_LENGTH) || 6,
  ROOM_EXPIRY_SECONDS: parseInt(process.env.ROOM_EXPIRY_SECONDS) || 3600,
  MAX_PLAYERS_PER_ROOM: parseInt(process.env.MAX_PLAYERS_PER_ROOM) || 10,
  MIN_PLAYERS_TO_START: parseInt(process.env.MIN_PLAYERS_TO_START) || 3,

  // Estados del juego
  GAME_PHASES: {
    LOBBY: 'lobby',
    ROLE_ASSIGNMENT: 'roleAssignment',
    ROUND: 'round',
    DISCUSSION: 'discussion',
    VOTING: 'voting',
    RESULTS: 'results',
  },

  // Roles
  ROLES: {
    IMPOSTOR: 'impostor',
    NORMAL: 'normal',
  },

  // Eventos WebSocket
  SOCKET_EVENTS: {
    // Cliente → Servidor
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
    START_GAME: 'start_game',
    ADD_PISTA: 'add_pista',
    ADD_VOTE: 'add_vote',
    CHANGE_PHASE: 'change_phase',
    
    // Servidor → Cliente
    ROOM_UPDATED: 'room_updated',
    PLAYER_JOINED: 'player_joined',
    PLAYER_LEFT: 'player_left',
    GAME_STATE_CHANGED: 'game_state_changed',
    PISTA_ADDED: 'pista_added',
    VOTE_ADDED: 'vote_added',
    PHASE_CHANGED: 'phase_changed',
    ERROR: 'error',
  },
};

