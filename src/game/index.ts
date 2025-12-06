/**
 * Exportaciones del módulo de juego
 */

export { GameProvider, useGame } from './GameContext';
export { assignRoles, getPlayerRole, isImpostor, getPlayerInfo } from './gameLogic';
export type { GameState, RoleAssignment } from './gameLogic';
export { getRandomSecretWord, getRandomSecretWords, SECRET_WORDS } from './secretWords';
export type { SecretWord } from './secretWords';

