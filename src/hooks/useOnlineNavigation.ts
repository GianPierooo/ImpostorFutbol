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
  const { gameState, roomState, roomCode } = useOnlineGame();
  const previousPhaseRef = useRef<GamePhase | null>(null);
  
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

    const currentPhase = gameState?.phase || roomState?.room?.status;
    
    // Solo navegar si la fase cambió
    if (currentPhase && currentPhase !== previousPhaseRef.current) {
      previousPhaseRef.current = currentPhase;

      // Navegar según la fase, asegurando que siempre se pase mode: 'online'
      switch (currentPhase) {
        case 'roleAssignment':
          navigation.navigate('RoleAssignment', { 
            mode: 'online', 
            roomCode 
          });
          break;
        case 'round':
          navigation.navigate('Round', { 
            mode: 'online', 
            roomCode 
          });
          break;
        case 'discussion':
          navigation.navigate('Discussion', { 
            mode: 'online', 
            roomCode 
          });
          break;
        case 'voting':
          navigation.navigate('Voting', { 
            mode: 'online', 
            roomCode 
          });
          break;
        case 'results':
          navigation.navigate('Results', { 
            mode: 'online', 
            roomCode 
          });
          break;
        default:
          break;
      }
    }
  }, [gameState?.phase, roomState?.room?.status, roomCode, navigation, shouldNavigate]);
};

