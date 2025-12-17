/**
 * Cliente WebSocket para comunicación en tiempo real
 */

import { io, Socket } from 'socket.io-client';

import { API_CONFIG } from '../config/api';

const SOCKET_URL = API_CONFIG.SOCKET_URL;

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Conectar al servidor WebSocket
   */
  connect(): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ WebSocket desconectado');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Obtener la instancia del socket
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Verificar si está conectado
   */
  connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Unirse a una sala
   */
  joinRoom(code: string, playerId: string): void {
    if (!this.socket) {
      this.connect();
    }
    this.socket?.emit('join_room', { code, playerId });
  }

  /**
   * Salir de una sala
   */
  leaveRoom(code: string, playerId: string): void {
    this.socket?.emit('leave_room', { code, playerId });
  }

  /**
   * Iniciar juego
   */
  startGame(code: string, hostId: string): void {
    this.socket?.emit('start_game', { code, hostId });
  }

  /**
   * Agregar pista
   */
  addPista(code: string, playerId: string, text: string): void {
    this.socket?.emit('add_pista', { code, playerId, text });
  }

  /**
   * Agregar voto
   */
  addVote(code: string, voterId: string, targetId: string): void {
    this.socket?.emit('add_vote', { code, voterId, targetId });
  }

  /**
   * Cambiar fase
   */
  changePhase(code: string, playerId: string, phase: string): void {
    this.socket?.emit('change_phase', { code, playerId, phase });
  }

  /**
   * Escuchar eventos del servidor
   */
  on(event: string, callback: (data: any) => void): void {
    this.socket?.on(event, callback);
  }

  /**
   * Dejar de escuchar eventos
   */
  off(event: string, callback?: (data: any) => void): void {
    this.socket?.off(event, callback);
  }
}

// Instancia singleton
export const socketService = new SocketService();
export default socketService;

