/**
 * Hook para manejar la navegación automática en modo online
 * Escucha los cambios de fase y navega automáticamente
 */

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnlineGame } from '../contexts';
import { NavigationParamList, GamePhase } from '../types';

type NavigationProp = NativeStackNavigationProp<NavigationParamList>;

export const useOnlineNavigation = () => {
  const navigation = useNavigation<NavigationProp>();
  const { gameState, roomState, roomCode } = useOnlineGame();
  const previousPhaseRef = useRef<GamePhase | null>(null);
  
  // Calcular isOnline basado en roomCode
  const isOnline = roomCode !== null;

  useEffect(() => {
    if (!isOnline || !roomCode) return;

    const currentPhase = gameState?.phase || roomState?.status;
    
    // Solo navegar si la fase cambió
    if (currentPhase && currentPhase !== previousPhaseRef.current) {
      previousPhaseRef.current = currentPhase;

      // Navegar según la fase
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
  }, [gameState?.phase, roomState?.status, isOnline, roomCode, navigation]);
};

