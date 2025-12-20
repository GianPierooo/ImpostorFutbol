/**
 * Context para manejar el estado del juego entre pantallas
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Player, GameConfig, GamePhase, Pista, Voto, VotingResult } from '../types';
import { assignRoles, RoleAssignment, GameState } from './gameLogic';

interface GameContextType {
  // Estado del juego
  gameState: GameState | null;
  roleAssignment: RoleAssignment | null;
  pistas: Pista[];
  currentTurn: number;
  currentPlayerIndex: number;
  votes: Voto[];
  currentVoterIndex: number;
  
  // Funciones
  startGame: (players: Player[], config: GameConfig) => void;
  resetGame: () => void;
  nextPhase: () => void;
  addPista: (text: string, playerId: string) => void;
  nextTurn: () => void;
  finishRound: () => void;
  addVote: (voterId: string, targetId: string) => void;
  nextVoter: () => void;
  finishVoting: () => void;
  getVotingResults: () => VotingResult | null;
  hasVoted: (playerId: string) => boolean;
  getCurrentVoter: () => Player | null;
  allVotesComplete: () => boolean;
  
  // Helpers
  getPlayerInfo: (playerId: string) => {
    role: 'impostor' | 'normal';
    secretWord: string | null;
    isImpostor: boolean;
  } | null;
  getCurrentPlayer: () => Player | null;
  getRoundPistas: (round: number) => Pista[];
  getGameWinner: () => {
    winner: 'impostor' | 'group';
    mostVotedId: string | null;
    isCorrect: boolean;
  } | null;
  allPlayersGavePista: (round: number) => boolean;
  canFinishRound: () => boolean;
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
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);
  const [votes, setVotes] = useState<Voto[]>([]);
  const [currentVoterIndex, setCurrentVoterIndex] = useState<number>(0);
  const [lastRoundNumber, setLastRoundNumber] = useState<number>(0);

  // Efecto para reiniciar turno cuando cambia la ronda
  React.useEffect(() => {
    if (gameState && gameState.currentRound !== lastRoundNumber) {
      // La ronda cambió, reiniciar turno a 1
      setCurrentTurn(1);
      setCurrentPlayerIndex(0);
      setLastRoundNumber(gameState.currentRound);
    }
  }, [gameState?.currentRound, lastRoundNumber]);

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
    setPistas([]);
    setCurrentTurn(1);
    setCurrentPlayerIndex(0);
    setVotes([]);
    setCurrentVoterIndex(0);
    setLastRoundNumber(1); // Inicializar con ronda 1
  }, []);

  const resetGame = useCallback(() => {
    setRoleAssignment(null);
    setGameState(null);
    setPistas([]);
    setCurrentTurn(1);
    setCurrentPlayerIndex(0);
    setVotes([]);
    setCurrentVoterIndex(0);
    setLastRoundNumber(0); // Resetear lastRoundNumber para evitar problemas en próxima partida
  }, []);

  const nextPhase = useCallback(() => {
    if (!gameState) return;

    const phases: GamePhase[] = ['roleAssignment', 'round', 'voting', 'results'];
    const currentIndex = phases.indexOf(gameState.phase);
    
    if (currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1] as GamePhase;
      
      setGameState((prev) => {
        if (!prev) return prev;
        
        // Si pasamos a la fase 'round'
        if (nextPhase === 'round') {
          // Permitir avanzar si no hay límite o si no hemos alcanzado el límite
          const canAdvance = prev.maxRounds === null || prev.currentRound < prev.maxRounds;
          if (canAdvance) {
            return {
              ...prev,
              phase: nextPhase,
            };
          }
        }
        
        // Si terminamos todas las rondas, ir a votación
        if (prev.phase === 'round' && prev.maxRounds !== null && prev.currentRound >= prev.maxRounds) {
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

  /**
   * Agrega una pista de un jugador
   * 
   * IMPORTANTE: En modo local, cada jugador solo puede dar UNA pista por ronda.
   * Si el jugador ya dio una pista en la ronda actual, no se permite agregar otra.
   * 
   * @param {string} text - Texto de la pista
   * @param {string} playerId - ID del jugador que envía la pista
   */
  const addPista = useCallback((text: string, playerId: string) => {
    if (!gameState || !roleAssignment) return;

    const player = roleAssignment.players.find((p) => p.id === playerId);
    if (!player) return;

    // IMPORTANTE: Verificar si el jugador ya dio una pista en esta ronda
    // Cada jugador solo puede dar UNA pista por ronda
    const existingPistaInRound = pistas.find(
      (p) => p.playerId === playerId && p.round === gameState.currentRound
    );
    
    if (existingPistaInRound) {
      console.warn(`⚠️ El jugador ${player.name} ya dio una pista en la ronda ${gameState.currentRound}`);
      return; // No permitir agregar otra pista en la misma ronda
    }

    const newPista: Pista = {
      id: `pista-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      playerId,
      playerName: player.name,
      text: text.trim(),
      round: gameState.currentRound,
      turn: currentTurn,
    };

    setPistas((prev) => [...prev, newPista]);
  }, [gameState, roleAssignment, currentTurn, pistas]);

  /**
   * Avanza al siguiente turno/jugador
   * 
   * IMPORTANTE: En modo local, cada jugador solo puede dar UNA pista por ronda.
   * Esta función debe saltar automáticamente a los jugadores que ya dieron su pista
   * en la ronda actual, hasta encontrar uno que no haya dado pista o hasta que
   * todos hayan dado su pista.
   * 
   * Flujo:
   * 1. Avanzar al siguiente índice de jugador
   * 2. Si volvemos al índice 0, incrementar el turno (nueva vuelta completa)
   * 3. Verificar si el jugador actual ya dio pista en esta ronda
   * 4. Si ya dio pista, saltar al siguiente jugador (recursivamente hasta encontrar uno que no haya dado)
   * 5. Si todos dieron pista, mantener el índice actual (se manejará en finishRound)
   */
  const nextTurn = useCallback(() => {
    if (!gameState || !roleAssignment) return;

    const totalPlayers = roleAssignment.players.length;
    let nextIndex = (currentPlayerIndex + 1) % totalPlayers;

    if (nextIndex === 0) {
      // Completamos una vuelta completa de todos los jugadores, avanzamos al siguiente turno
      setCurrentTurn((prev) => prev + 1);
    }

    // IMPORTANTE: Verificar si el siguiente jugador ya dio su pista en esta ronda
    // Si es así, saltar al siguiente jugador que no haya dado pista
    const roundPistas = pistas.filter(p => p.round === gameState.currentRound);
    const playersWhoGavePista = new Set(roundPistas.map(p => p.playerId));
    
    // Buscar el siguiente jugador que no haya dado pista en esta ronda
    let attempts = 0;
    while (attempts < totalPlayers) {
      const nextPlayer = roleAssignment.players[nextIndex];
      if (!nextPlayer) break;
      
      // Si este jugador no ha dado pista en esta ronda, usar este índice
      if (!playersWhoGavePista.has(nextPlayer.id)) {
        break;
      }
      
      // Si ya dio pista, avanzar al siguiente
      nextIndex = (nextIndex + 1) % totalPlayers;
      
      // Si volvemos al inicio, incrementar el turno
      if (nextIndex === 0) {
        setCurrentTurn((prev) => prev + 1);
      }
      
      attempts++;
    }

    setCurrentPlayerIndex(nextIndex);
  }, [gameState, roleAssignment, currentPlayerIndex, pistas]);

  const finishRound = useCallback(() => {
    if (!gameState) return;

    // Avanzar a la siguiente ronda si no hay límite o no es la última
    const hasMoreRounds = gameState.maxRounds === null || gameState.currentRound < gameState.maxRounds;
    
    if (hasMoreRounds) {
      setGameState((prev) => {
        if (!prev) return prev;
        const newRound = prev.currentRound + 1;
        // Actualizar lastRoundNumber usando el valor del estado previo
        setLastRoundNumber(newRound);
        return {
          ...prev,
          currentRound: newRound,
        };
      });
      // Reiniciar turnos solo si hay más rondas
      setCurrentTurn(1);
      setCurrentPlayerIndex(0);
    } else {
      // Si es la última ronda, cambiar a fase de votación
      setGameState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: 'voting',
        };
      });
    }
  }, [gameState]);

  const allPlayersGavePista = useCallback((round: number): boolean => {
    if (!roleAssignment) return false;

    const roundPistas = pistas.filter((p) => p.round === round);
    const playersWhoGavePista = new Set(roundPistas.map((p) => p.playerId));
    
    // Verificar que todos los jugadores dieron pista
    return roleAssignment.players.every((player) => playersWhoGavePista.has(player.id));
  }, [roleAssignment, pistas]);

  const canFinishRound = useCallback((): boolean => {
    if (!gameState) return false;
    
    // Mínimo 3 rondas completadas para poder finalizar
    // Si estamos en la ronda 3, significa que ya completamos 3 rondas
    if (gameState.currentRound < 3) return false;
    
    // Verificar que todos dieron pista en la ronda actual
    return allPlayersGavePista(gameState.currentRound);
  }, [gameState, allPlayersGavePista]);

  const getCurrentPlayer = useCallback((): Player | null => {
    if (!roleAssignment) return null;
    return roleAssignment.players[currentPlayerIndex] || null;
  }, [roleAssignment, currentPlayerIndex]);

  const getRoundPistas = useCallback((round: number): Pista[] => {
    return pistas.filter((p) => p.round === round);
  }, [pistas]);

  const addVote = useCallback((voterId: string, targetId: string) => {
    if (!roleAssignment) return;

    // No permitir votar por uno mismo
    if (voterId === targetId) return;

    // Verificar si ya votó, si es así, reemplazar el voto
    const voter = roleAssignment.players.find((p) => p.id === voterId);
    const target = roleAssignment.players.find((p) => p.id === targetId);

    if (!voter || !target) return;

    setVotes((prev) => {
      // Remover voto anterior si existe
      const filtered = prev.filter((v) => v.voterId !== voterId);
      
      // Agregar nuevo voto
      const newVote: Voto = {
        voterId,
        voterName: voter.name,
        targetId,
        targetName: target.name,
      };

      return [...filtered, newVote];
    });
  }, [roleAssignment]);

  const nextVoter = useCallback(() => {
    if (!roleAssignment) return;

    const totalPlayers = roleAssignment.players.length;
    const nextIndex = (currentVoterIndex + 1) % totalPlayers;
    setCurrentVoterIndex(nextIndex);
  }, [roleAssignment, currentVoterIndex]);

  const finishVoting = useCallback(() => {
    if (!gameState) return;

    setGameState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'results',
      };
    });
  }, [gameState]);

  const getVotingResults = useCallback((): VotingResult | null => {
    if (!roleAssignment || votes.length === 0) return null;

    // Contar votos por cada jugador
    const voteCounts: Record<string, number> = {};
    
    roleAssignment.players.forEach((player) => {
      voteCounts[player.id] = 0;
    });

    votes.forEach((vote) => {
      voteCounts[vote.targetId] = (voteCounts[vote.targetId] || 0) + 1;
    });

    // Encontrar el más votado
    let maxVotes = 0;
    let mostVoted: string | null = null;
    let isTie = false;

    Object.entries(voteCounts).forEach(([playerId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        mostVoted = playerId;
        isTie = false;
      } else if (count === maxVotes && count > 0) {
        isTie = true;
      }
    });

    return {
      votes,
      voteCounts,
      mostVoted: isTie ? null : mostVoted,
      isTie,
    };
  }, [roleAssignment, votes]);

  const hasVoted = useCallback((playerId: string): boolean => {
    return votes.some((v) => v.voterId === playerId);
  }, [votes]);

  const getCurrentVoter = useCallback((): Player | null => {
    if (!roleAssignment) return null;
    return roleAssignment.players[currentVoterIndex] || null;
  }, [roleAssignment, currentVoterIndex]);

  const allVotesComplete = useCallback((): boolean => {
    if (!roleAssignment) return false;
    return votes.length === roleAssignment.players.length;
  }, [roleAssignment, votes]);

  const getGameWinner = useCallback((): {
    winner: 'impostor' | 'group';
    mostVotedId: string | null;
    isCorrect: boolean;
  } | null => {
    if (!gameState || !roleAssignment) return null;

    const votingResults = getVotingResults();
    if (!votingResults || !votingResults.mostVoted) return null;

    const mostVotedId = votingResults.mostVoted;
    const isCorrect = mostVotedId === roleAssignment.impostorId;

    return {
      winner: isCorrect ? 'group' : 'impostor',
      mostVotedId,
      isCorrect,
    };
  }, [gameState, roleAssignment, getVotingResults]);

  const value: GameContextType = {
    gameState,
    roleAssignment,
    pistas,
    currentTurn,
    currentPlayerIndex,
    votes,
    currentVoterIndex,
    startGame,
    resetGame,
    nextPhase,
    addPista,
    nextTurn,
    finishRound,
    addVote,
    nextVoter,
    finishVoting,
    getVotingResults,
    hasVoted,
    getCurrentVoter,
    allVotesComplete,
    getPlayerInfo,
    getCurrentPlayer,
    getRoundPistas,
    getGameWinner,
    allPlayersGavePista,
    canFinishRound,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

