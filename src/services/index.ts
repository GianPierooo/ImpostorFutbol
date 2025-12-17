/**
 * Exportaciones de servicios
 */

export { default as api, roomsAPI, gamesAPI, healthAPI } from './api';
export { default as socketService } from './socket';
export type {
  CreateRoomRequest,
  JoinRoomRequest,
  RoomResponse,
  GameStateResponse,
} from './api';

