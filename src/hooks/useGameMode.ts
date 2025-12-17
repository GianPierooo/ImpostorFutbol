/**
 * Hook para detectar y manejar el modo de juego (local vs online)
 */

import { useOnlineGame } from '../contexts';
import { useGame } from '../game';

export type GameMode = 'local' | 'online';

/**
 * Hook que detecta el modo de juego y retorna el contexto apropiado
 */
export const useGameMode = () => {
  const onlineGame = useOnlineGame();
  const localGame = useGame();

  // Detectar si estamos en modo online
  const isOnline = onlineGame.roomCode !== null;

  return {
    mode: isOnline ? ('online' as GameMode) : ('local' as GameMode),
    isOnline,
    onlineGame: isOnline ? onlineGame : null,
    localGame: !isOnline ? localGame : null,
    // Helper para obtener el contexto activo
    game: isOnline ? onlineGame : localGame,
  };
};

