/**
 * Lógica del juego - Asignación de roles y gestión del estado
 */

import { Player, Role } from '../types';
import { getRandomSecretWord, SecretWord } from './secretWords';

export interface GameState {
  players: Player[];
  secretWord: SecretWord;
  impostorId: string;
  currentRound: number;
  maxRounds: number;
  phase: 'roleAssignment' | 'round' | 'voting' | 'results';
}

export interface RoleAssignment {
  secretWord: SecretWord;
  impostorId: string;
  players: (Player & { role: Role })[];
}

/**
 * Asigna roles aleatorios a los jugadores
 * - Selecciona una palabra secreta aleatoria
 * - Selecciona un impostor aleatorio
 * - Asigna roles a todos los jugadores
 */
export const assignRoles = (players: Player[]): RoleAssignment => {
  if (players.length < 3) {
    throw new Error('Se necesitan al menos 3 jugadores para jugar');
  }

  // Seleccionar palabra secreta aleatoria
  const secretWord = getRandomSecretWord();

  // Seleccionar impostor aleatorio
  const randomIndex = Math.floor(Math.random() * players.length);
  const impostorId = players[randomIndex].id;

  // Asignar roles a todos los jugadores
  const playersWithRoles = players.map((player) => ({
    ...player,
    role: player.id === impostorId ? ('impostor' as Role) : ('normal' as Role),
  }));

  return {
    secretWord,
    impostorId,
    players: playersWithRoles,
  };
};

/**
 * Obtiene el rol de un jugador específico
 */
export const getPlayerRole = (
  playerId: string,
  gameState: RoleAssignment
): Role => {
  const player = gameState.players.find((p) => p.id === playerId);
  return player?.role || 'normal';
};

/**
 * Verifica si un jugador es el impostor
 */
export const isImpostor = (playerId: string, gameState: RoleAssignment): boolean => {
  return gameState.impostorId === playerId;
};

/**
 * Obtiene la información que debe ver un jugador
 * - Si es impostor: no ve la palabra secreta
 * - Si es normal: ve la palabra secreta
 */
export const getPlayerInfo = (
  playerId: string,
  gameState: RoleAssignment
): {
  role: Role;
  secretWord: SecretWord | null;
  isImpostor: boolean;
} => {
  const isImpostorPlayer = isImpostor(playerId, gameState);
  const role = getPlayerRole(playerId, gameState);

  return {
    role,
    secretWord: isImpostorPlayer ? null : gameState.secretWord,
    isImpostor: isImpostorPlayer,
  };
};

