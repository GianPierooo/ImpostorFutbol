/**
 * Hook para detectar y manejar el modo de juego (local vs online)
 * 
 * IMPORTANTE: Este hook usa los parámetros de ruta (route.params.mode) como fuente de verdad
 * para determinar el modo, en lugar de confiar solo en el estado del contexto online.
 * Esto previene problemas cuando el contexto online tiene estado residual.
 */

import { useOnlineGame } from '../contexts';
import { useGame } from '../game';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NavigationParamList } from '../types';

export type GameMode = 'local' | 'online';

/**
 * Hook que detecta el modo de juego y retorna el contexto apropiado
 * 
 * @param routeParams - Parámetros opcionales de la ruta. Si no se proporcionan, se obtienen del hook useRoute
 * @returns Objeto con el modo detectado y los contextos apropiados
 */
export const useGameMode = (routeParams?: { mode?: GameMode; roomCode?: string }) => {
  const onlineGame = useOnlineGame();
  const localGame = useGame();
  
  // Intentar obtener parámetros de la ruta si no se proporcionaron
  let route: RouteProp<NavigationParamList, keyof NavigationParamList> | undefined;
  try {
    route = useRoute();
  } catch (e) {
    // Si no hay ruta disponible, continuar sin ella
  }
  
  // Obtener mode de los parámetros proporcionados o de la ruta
  const modeFromParams = routeParams?.mode || (route?.params as any)?.mode;
  const roomCodeFromParams = routeParams?.roomCode || (route?.params as any)?.roomCode;
  
  // DETERMINAR MODO: Usar parámetros de ruta como fuente de verdad
  // Si route.params.mode existe, usarlo directamente
  // Si no, verificar si hay roomCode en los parámetros (indica modo online)
  // Solo como último recurso, verificar roomCode del contexto (puede tener estado residual)
  let isOnline: boolean;
  let mode: GameMode;
  
  if (modeFromParams === 'online' || modeFromParams === 'local') {
    // Los parámetros de ruta son la fuente de verdad
    mode = modeFromParams;
    isOnline = mode === 'online';
  } else if (roomCodeFromParams) {
    // Si hay roomCode en los parámetros, estamos en modo online
    mode = 'online';
    isOnline = true;
  } else if (modeFromParams === undefined && !roomCodeFromParams) {
    // Si no hay parámetros de modo ni roomCode, verificar contexto online
    // PERO solo si realmente hay un roomCode activo (no residual)
    // Verificar también que el contexto online tenga datos válidos
    const hasValidOnlineContext = onlineGame.roomCode !== null && 
                                   onlineGame.playerId !== null &&
                                   onlineGame.roomState !== null;
    isOnline = hasValidOnlineContext;
    mode = isOnline ? 'online' : 'local';
  } else {
    // Por defecto, modo local
    mode = 'local';
    isOnline = false;
  }

  return {
    mode,
    isOnline,
    onlineGame: isOnline ? onlineGame : null,
    localGame: !isOnline ? localGame : null,
    // Helper para obtener el contexto activo
    game: isOnline ? onlineGame : localGame,
  };
};

