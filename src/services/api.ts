/**
 * Cliente API para comunicación con el backend
 */

import axios from 'axios';

import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Aumentado a 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores de red
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      error.message = 'Tiempo de espera agotado. Verifica tu conexión a internet.';
    } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      error.message = `No se pudo conectar al servidor. Verifica que:\n1. Tienes conexión a internet\n2. El servidor está activo (163.192.223.30:3000)`;
    } else if (error.response) {
      // Error del servidor
      error.message = error.response.data?.error || error.message;
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      error.message = 'El servidor no respondió. Verifica que el backend esté corriendo.';
    }
    return Promise.reject(error);
  }
);

// Tipos
export interface CreateRoomRequest {
  hostId: string;
  hostName: string;
  config?: {
    rounds?: number | null;
  };
}

export interface JoinRoomRequest {
  playerId: string;
  playerName: string;
}

export interface RoomResponse {
  success: boolean;
  data?: {
    code: string;
    room: {
      code: string;
      hostId: string;
      status: string;
      config: {
        rounds: number | null;
      };
      createdAt: number;
      lastActivity: number;
    };
    players?: Array<{
      id: string;
      name: string;
      joinedAt: number;
      isHost: boolean;
    }>;
    gameState?: any;
  };
  error?: string;
}

export interface GameStateResponse {
  success: boolean;
  data?: {
    room: any;
    gameState: any;
    players: any[];
    pistas: any[];
    votes: any;
  };
  error?: string;
}

// API de Salas
export const roomsAPI = {
  /**
   * Crear una nueva sala
   */
  create: async (data: CreateRoomRequest): Promise<RoomResponse> => {
    const response = await api.post('/rooms', data);
    return response.data;
  },

  /**
   * Obtener una sala
   */
  get: async (code: string): Promise<RoomResponse> => {
    const response = await api.get(`/rooms/${code}`);
    return response.data;
  },

  /**
   * Unirse a una sala
   */
  join: async (code: string, data: JoinRoomRequest): Promise<RoomResponse> => {
    const response = await api.post(`/rooms/${code}/join`, data);
    return response.data;
  },

  /**
   * Salir de una sala
   */
  leave: async (code: string, playerId: string): Promise<RoomResponse> => {
    const response = await api.post(`/rooms/${code}/leave`, { playerId });
    return response.data;
  },
};

// API de Juegos
export const gamesAPI = {
  /**
   * Iniciar un juego
   */
  start: async (code: string, hostId: string): Promise<any> => {
    const response = await api.post(`/games/${code}/start`, { hostId });
    return response.data;
  },

  /**
   * Obtener estado del juego
   */
  getState: async (code: string): Promise<GameStateResponse> => {
    const response = await api.get(`/games/${code}/state`);
    return response.data;
  },

  /**
   * Agregar una pista
   */
  addPista: async (code: string, playerId: string, text: string): Promise<any> => {
    const response = await api.post(`/games/${code}/pista`, { playerId, text });
    return response.data;
  },

  /**
   * Agregar un voto
   */
  addVote: async (code: string, voterId: string, targetId: string): Promise<any> => {
    const response = await api.post(`/games/${code}/vote`, { voterId, targetId });
    return response.data;
  },

  /**
   * Cambiar fase
   */
  changePhase: async (code: string, playerId: string, phase: string): Promise<any> => {
    const response = await api.post(`/games/${code}/phase`, { playerId, phase });
    return response.data;
  },

  /**
   * Avanzar a la siguiente ronda
   */
  nextRound: async (code: string, playerId: string): Promise<any> => {
    const response = await api.post(`/games/${code}/next-round`, { playerId });
    return response.data;
  },

  /**
   * Obtener rol de un jugador
   */
  getRole: async (code: string, playerId: string): Promise<any> => {
    const response = await api.get(`/games/${code}/role/${playerId}`);
    return response.data;
  },

  /**
   * Obtener resultados de votación
   */
  getVotingResults: async (code: string): Promise<any> => {
    const response = await api.get(`/games/${code}/voting-results`);
    return response.data;
  },

  /**
   * Marcar que un jugador ha visto su rol
   */
  markRoleSeen: async (code: string, playerId: string): Promise<any> => {
    const response = await api.post(`/games/${code}/role-seen`, { playerId });
    return response.data;
  },

  /**
   * Verificar si todos los jugadores han visto su rol
   */
  getAllRolesSeen: async (code: string): Promise<any> => {
    const response = await api.get(`/games/${code}/all-roles-seen`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;

