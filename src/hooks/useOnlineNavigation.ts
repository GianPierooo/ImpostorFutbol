/**
 * Hook para manejar la navegación automática en modo online
 * Escucha los cambios de fase y navega automáticamente
 * 
 * IMPORTANTE: Este hook SOLO debe ejecutarse cuando realmente estamos en modo online.
 * Verifica los parámetros de ruta para asegurar que no se ejecute en modo local.
 */

import { useEffect, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnlineGame } from '../contexts';
import { NavigationParamList, GamePhase } from '../types';

type NavigationProp = NativeStackNavigationProp<NavigationParamList>;

export const useOnlineNavigation = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<NavigationParamList, keyof NavigationParamList>>();
  const { gameState, roomState, roomCode, playerId, playerName } = useOnlineGame();
  const previousPhaseRef = useRef<GamePhase | null>(null);
  const isNavigatingRef = useRef(false);
  
  // Obtener parámetros de la ruta
  const routeParams = route.params as any;
  const modeFromRoute = routeParams?.mode;
  const roomCodeFromRoute = routeParams?.roomCode;
  const codeFromRoute = routeParams?.code; // OnlineRoom usa 'code' en lugar de 'roomCode'
  
  // VERIFICAR SI REALMENTE ESTAMOS EN MODO ONLINE
  // Usar parámetros de ruta como fuente de verdad
  // OnlineRoom usa 'code', otras rutas usan 'roomCode'
  const isOnlineFromRoute = modeFromRoute === 'online' || 
                            roomCodeFromRoute !== undefined || 
                            codeFromRoute !== undefined;
  
  // También verificar que el contexto online tenga datos válidos
  // IMPORTANTE: No requerir gameState !== null porque puede ser null en lobby
  // y queremos que la navegación funcione cuando el juego se inicia
  // El roomCode del contexto debe coincidir con el code/roomCode de la ruta
  const routeRoomCode = roomCodeFromRoute || codeFromRoute;
  const hasValidOnlineContext = roomCode !== null && 
                                 roomCode === routeRoomCode; // El roomCode debe coincidir

  // SOLO ejecutar navegación automática si realmente estamos en modo online
  const shouldNavigate = isOnlineFromRoute && hasValidOnlineContext;

  useEffect(() => {
    // Si no estamos en modo online, no hacer nada
    if (!shouldNavigate || !roomCode) return;
    
    // Prevenir navegaciones duplicadas si ya estamos navegando
    if (isNavigatingRef.current) {
      console.log('[useOnlineNavigation] Ya hay una navegación en curso, ignorando');
      return;
    }

    const currentPhase = gameState?.phase || roomState?.room?.status;
    
    // Solo navegar si la fase cambió
    if (currentPhase && currentPhase !== previousPhaseRef.current) {
      console.log(`[useOnlineNavigation] Fase cambió de ${previousPhaseRef.current} a ${currentPhase}`);
      previousPhaseRef.current = currentPhase;
      
      // Marcar que estamos navegando
      isNavigatingRef.current = true;

      // Navegar según la fase, asegurando que siempre se pase mode: 'online'
      try {
        switch (currentPhase) {
          case 'lobby':
            // Si estamos en Results y la sala vuelve a lobby, navegar a OnlineRoom
            if (route.name === 'Results' && playerId && playerName) {
              console.log('[useOnlineNavigation] Navegando a OnlineRoom (reset a lobby)');
              navigation.navigate('OnlineRoom', {
                code: roomCode,
                playerId,
                playerName,
              });
            }
            break;
          case 'roleAssignment':
            console.log('[useOnlineNavigation] Navegando a RoleAssignment');
            navigation.navigate('RoleAssignment', { 
              mode: 'online', 
              roomCode 
            });
            break;
          case 'round':
            console.log('[useOnlineNavigation] Navegando a Round');
            navigation.navigate('Round', { 
              mode: 'online', 
              roomCode 
            });
            break;
          case 'discussion':
            console.log('[useOnlineNavigation] Navegando a Discussion');
            navigation.navigate('Discussion', { 
              mode: 'online', 
              roomCode 
            });
            break;
          case 'voting':
            console.log('[useOnlineNavigation] Navegando a Voting');
            navigation.navigate('Voting', { 
              mode: 'online', 
              roomCode 
            });
            break;
          case 'results':
            console.log('[useOnlineNavigation] Navegando a Results');
            navigation.navigate('Results', { 
              mode: 'online', 
              roomCode 
            });
            break;
          default:
            console.log(`[useOnlineNavigation] Fase desconocida: ${currentPhase}`);
            break;
        }
      } catch (error) {
        console.error('[useOnlineNavigation] Error al navegar:', error);
      } finally {
        // Resetear el flag después de un pequeño delay para evitar re-navegaciones inmediatas
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 500);
      }
    }
  }, [gameState?.phase, roomState?.room?.status, roomCode, navigation, shouldNavigate, playerId, playerName, route.name]);
};

