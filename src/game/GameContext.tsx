/**
 * Context para manejar el estado del juego entre pantallas
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Player, GameConfig, GamePhase } from '../types';
import { assignRoles, RoleAssignment, GameState } from './gameLogic';

interface GameContextType {
  // Estado del juego
  gameState: GameState | null;
  roleAssignment: RoleAssignment | null;
  
  // Funciones
  startGame: (players: Player[], config: GameConfig) => void;
  resetGame: () => void;
  nextPhase: () => void;
  
  // Helpers
  getPlayerInfo: (playerId: string) => {
    role: 'impostor' | 'normal';
    secretWord: string | null;
    isImpostor: boolean;
  } | null;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame debe usarse dentro de GameProvider');
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [roleAssignment, setRoleAssignment] = useState<RoleAssignment | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  const startGame = useCallback((players: Player[], config: GameConfig) => {
    // Asignar roles
    const assignment = assignRoles(players);
    setRoleAssignment(assignment);

    // Crear estado inicial del juego
    const initialState: GameState = {
      players: assignment.players,
      secretWord: assignment.secretWord,
      impostorId: assignment.impostorId,
      currentRound: 1,
      maxRounds: config.rounds,
      phase: 'roleAssignment',
    };

    setGameState(initialState);
  }, []);

  const resetGame = useCallback(() => {
    setRoleAssignment(null);
    setGameState(null);
  }, []);

  const nextPhase = useCallback(() => {
    if (!gameState) return;

    const phases: GamePhase[] = ['roleAssignment', 'round', 'voting', 'results'];
    const currentIndex = phases.indexOf(gameState.phase);
    
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1] as GamePhase;
      
      setGameState((prev) => {
        if (!prev) return prev;
        
        // Si pasamos a la siguiente ronda
        if (nextPhase === 'round' && prev.currentRound < prev.maxRounds) {
          return {
            ...prev,
            phase: nextPhase,
          };
        }
        
        // Si terminamos todas las rondas, ir a votación
        if (prev.phase === 'round' && prev.currentRound >= prev.maxRounds) {
          return {
            ...prev,
            phase: 'voting',
          };
        }
        
        return {
          ...prev,
          phase: nextPhase,
        };
      });
    }
  }, [gameState]);

  const getPlayerInfo = useCallback((playerId: string) => {
    if (!roleAssignment) return null;

    const player = roleAssignment.players.find((p) => p.id === playerId);
    if (!player) return null;

    const isImpostor = player.role === 'impostor';

    return {
      role: player.role,
      secretWord: isImpostor ? null : roleAssignment.secretWord,
      isImpostor,
    };
  }, [roleAssignment]);

  const value: GameContextType = {
    gameState,
    roleAssignment,
    startGame,
    resetGame,
    nextPhase,
    getPlayerInfo,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

