/**
 * Context para manejar el estado del juego online
 * Sincroniza con el backend mediante WebSocket y API REST
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Player, GameConfig, GamePhase, Pista, Voto, VotingResult } from '../types';
import { roomsAPI, gamesAPI, socketService } from '../services';

interface OnlineGameContextType {
  // Estado
  roomCode: string | null;
  playerId: string | null;
  playerName: string | null;
  isHost: boolean;
  roomState: any | null;
  gameState: any | null;
  players: Player[];
  pistas: Pista[];
  votes: Voto[];
  roleAssignment: any | null;
  
  // Estado de conexión
  isConnected: boolean;
  loading: boolean;
  
  // Funciones
  joinRoom: (code: string, playerId: string, playerName: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  startGame: () => Promise<void>;
  addPista: (text: string) => Promise<void>;
  addVote: (targetId: string) => Promise<void>;
  changePhase: (phase: GamePhase) => Promise<void>;
  getPlayerRole: (playerId: string) => Promise<any>;
  getVotingResults: () => Promise<VotingResult | null>;
  markRoleSeen: () => Promise<{ allSeen: boolean }>;
  getAllRolesSeen: () => Promise<{ allSeen: boolean; playersWhoSeen: number; totalPlayers: number }>;
  loadGameState: () => Promise<void>;
  
  // Helpers
  getCurrentPlayer: () => Player | null;
  getPlayerInfo: (playerId: string) => {
    role: 'impostor' | 'normal';
    secretWord: string | null;
    isImpostor: boolean;
  } | null;
}

const OnlineGameContext = createContext<OnlineGameContextType | undefined>(undefined);

export const useOnlineGame = (): OnlineGameContextType => {
  const context = useContext(OnlineGameContext);
  if (!context) {
    throw new Error('useOnlineGame debe usarse dentro de OnlineGameProvider');
  }
  return context;
};

interface OnlineGameProviderProps {
  children: ReactNode;
}

export const OnlineGameProvider: React.FC<OnlineGameProviderProps> = ({ children }) => {
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [roomState, setRoomState] = useState<any | null>(null);
  const [gameState, setGameState] = useState<any | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pistas, setPistas] = useState<Pista[]>([]);
  const [votes, setVotes] = useState<Voto[]>([]);
  const [roleAssignment, setRoleAssignment] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Definir loadRoomState antes del useEffect que lo usa
  const loadRoomState = useCallback(async () => {
    if (!roomCode) return;

    try {
      const result = await roomsAPI.get(roomCode);
      if (result.success && result.data) {
        setRoomState(result.data);
        setPlayers(result.data.players || []);
        setIsHost(result.data.room?.hostId === playerId);
      }
    } catch (error: any) {
      // Ignorar errores 429 (rate limiting) - no es crítico
      if (error.response?.status === 429) {
        console.warn('Rate limit alcanzado al cargar room state, reintentando más tarde...');
        return;
      }
      console.error('Error loading room state:', error);
    }
  }, [roomCode, playerId]);

  // Escuchar eventos del WebSocket (solo cuando hay una sala activa)
  useEffect(() => {
    // No conectar automáticamente - solo cuando se une a una sala
    if (!roomCode) return;

    // Conectar solo si hay una sala activa
    if (!socketService.connected()) {
      socketService.connect();
    }
    setIsConnected(socketService.connected());

    // Escuchar eventos
    const handleRoomUpdated = (data: any) => {
      if (data.roomState) {
        setRoomState(data.roomState);
        setPlayers(data.roomState.players || []);
        setIsHost(data.roomState.room?.hostId === playerId);
      }
    };

    const handlePlayerJoined = async (data: any) => {
      // Si se recibió el estado actualizado en el evento, usarlo directamente
      if (data.roomState) {
        setRoomState(data.roomState);
        setPlayers(data.roomState.players || []);
        setIsHost(data.roomState.room?.hostId === playerId);
      } else {
        // Si no, recargar estado de la sala
        await loadRoomState();
      }
    };

    const handlePlayerLeft = async (data: any) => {
      // Si se recibió el estado actualizado en el evento, usarlo directamente
      if (data.roomState) {
        setRoomState(data.roomState);
        setPlayers(data.roomState.players || []);
        setIsHost(data.roomState.room?.hostId === playerId);
      } else {
        // Si no, recargar estado de la sala
        if (roomCode) {
          try {
            const result = await roomsAPI.get(roomCode);
            if (result.success && result.data) {
              setRoomState(result.data);
              setPlayers(result.data.players || []);
              setIsHost(result.data.room?.hostId === playerId);
            }
          } catch (error) {
            console.error('Error loading room state after player left:', error);
          }
        }
      }
    };

    const handleGameStateChanged = async (data: any) => {
      if (data.gameState) {
        setGameState(data.gameState);
        // Actualizar también el status de la sala cuando cambia el estado del juego
        setRoomState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            room: prev.room ? { ...prev.room, status: data.gameState.phase } : { status: data.gameState.phase },
          };
        });
      }
      if (data.roleAssignment) {
        setRoleAssignment(data.roleAssignment);
      }
      
      // Si no recibimos roleAssignment en el evento pero el juego inició, cargarlo manualmente
      if (data.gameState && !data.roleAssignment && data.gameState.phase === 'roleAssignment' && roomCode) {
        try {
          await loadGameState();
        } catch (error: any) {
          // Ignorar errores 429 (rate limiting)
          if (error.response?.status !== 429) {
            console.error('Error loading game state after GAME_STATE_CHANGED:', error);
          }
        }
      }
    };

    const handlePistaAdded = (data: any) => {
      if (data.pista) {
        setPistas((prev) => [...prev, data.pista]);
      }
      if (data.gameState) {
        setGameState(data.gameState);
      }
    };

    const handleVoteAdded = (data: any) => {
      if (data.vote) {
        setVotes((prev) => {
          const filtered = prev.filter((v) => v.voterId !== data.vote.voterId);
          return [...filtered, data.vote];
        });
      }
      // Actualizar gameState si viene en el evento (para sincronizar currentVoterIndex)
      if (data.gameState) {
        setGameState(data.gameState);
        // Actualizar también el status de la sala
        setRoomState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            room: prev.room ? { ...prev.room, status: data.gameState.phase } : { status: data.gameState.phase },
          };
        });
      }
    };

    const handlePhaseChanged = async (data: any) => {
      if (data.gameState) {
        setGameState(data.gameState);
      }
      if (data.phase) {
        setRoomState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            room: prev.room ? { ...prev.room, status: data.phase } : { status: data.phase },
          };
        });
      }
      
      // Si cambió a roleAssignment y no tenemos gameState o roleAssignment, cargarlos
      if (data.phase === 'roleAssignment' && (!gameState || !roleAssignment) && roomCode) {
        try {
          await loadGameState();
        } catch (error: any) {
          // Ignorar errores 429 (rate limiting)
          if (error.response?.status !== 429) {
            console.error('Error loading game state after PHASE_CHANGED:', error);
          }
        }
      }
    };

    socketService.on('room_updated', handleRoomUpdated);
    socketService.on('player_joined', handlePlayerJoined);
    socketService.on('player_left', handlePlayerLeft);
    socketService.on('game_state_changed', handleGameStateChanged);
    socketService.on('pista_added', handlePistaAdded);
    socketService.on('vote_added', handleVoteAdded);
    socketService.on('phase_changed', handlePhaseChanged);

    return () => {
      socketService.off('room_updated', handleRoomUpdated);
      socketService.off('player_joined', handlePlayerJoined);
      socketService.off('player_left', handlePlayerLeft);
      socketService.off('game_state_changed', handleGameStateChanged);
      socketService.off('pista_added', handlePistaAdded);
      socketService.off('vote_added', handleVoteAdded);
      socketService.off('phase_changed', handlePhaseChanged);
    };
  }, [roomCode, playerId, loadRoomState, loadGameState, gameState, roleAssignment]);

  const loadGameState = useCallback(async () => {
    if (!roomCode) return;

    try {
      const result = await gamesAPI.getState(roomCode);
      if (result.success && result.data) {
        setGameState(result.data.gameState);
        setPistas(result.data.pistas || []);
        
        // Cargar roleAssignment si viene en la respuesta
        if (result.data.roleAssignment) {
          setRoleAssignment(result.data.roleAssignment);
        }
        
        // Actualizar players si vienen en la respuesta
        if (result.data.players) {
          setPlayers(result.data.players);
        }
        
        // Actualizar roomState?.room?.status basándose en gameState.phase
        // Esto es crítico para que useOnlineNavigation detecte el cambio de fase
        if (result.data.gameState?.phase) {
          setRoomState((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              room: prev.room ? { ...prev.room, status: result.data.gameState.phase } : { status: result.data.gameState.phase },
            };
          });
        }
        
        // Convertir votos del formato del backend
        const votesData = result.data.votes || {};
        const votesArray: Voto[] = [];
        const currentPlayers = result.data.players || players;
        Object.entries(votesData).forEach(([voterId, targetId]) => {
          const voter = currentPlayers.find((p: Player) => p.id === voterId);
          const target = currentPlayers.find((p: Player) => p.id === targetId as string);
          if (voter && target) {
            votesArray.push({
              voterId,
              voterName: voter.name,
              targetId: targetId as string,
              targetName: target.name,
            });
          }
        });
        setVotes(votesArray);
      }
    } catch (error: any) {
      // Ignorar errores 429 (rate limiting) - no es crítico
      if (error.response?.status === 429) {
        console.warn('Rate limit alcanzado al cargar game state, reintentando más tarde...');
        return;
      }
      console.error('Error loading game state:', error);
    }
  }, [roomCode, players]);

  const joinRoom = useCallback(async (code: string, pId: string, pName: string) => {
    setLoading(true);
    try {
      // Primero establecer roomCode para que el useEffect configure los listeners
      setRoomCode(code);
      setPlayerId(pId);
      setPlayerName(pName);

      // Conectar WebSocket antes de unirse a la sala
      if (!socketService.connected()) {
        socketService.connect();
      }
      
      // Esperar a que el WebSocket se conecte completamente
      let attempts = 0;
      while (!socketService.connected() && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // Esperar un momento adicional para que los listeners se configuren
      await new Promise(resolve => setTimeout(resolve, 200));
      
      socketService.joinRoom(code, pId);
      
      // Cargar estado después de establecer roomCode
      const result = await roomsAPI.get(code);
      if (result.success && result.data) {
        setRoomState(result.data);
        setPlayers(result.data.players || []);
        setIsHost(result.data.room?.hostId === pId);
      }
      
      // Cargar estado inmediatamente después de unirse para sincronización
      await loadRoomState();
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [loadRoomState]);

  const leaveRoom = useCallback(async () => {
    if (!roomCode || !playerId) return;

    try {
      await roomsAPI.leave(roomCode, playerId);
      socketService.leaveRoom(roomCode, playerId);
      
      // Resetear estado
      setRoomCode(null);
      setPlayerId(null);
      setPlayerName(null);
      setRoomState(null);
      setGameState(null);
      setPlayers([]);
      setPistas([]);
      setVotes([]);
      setRoleAssignment(null);
      setIsHost(false);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [roomCode, playerId]);

  const startGame = useCallback(async () => {
    if (!roomCode || !playerId || !isHost) return;

    setLoading(true);
    try {
      const result = await gamesAPI.start(roomCode, playerId);
      if (result.success) {
        socketService.startGame(roomCode, playerId);
        setGameState(result.data.gameState);
        setRoleAssignment(result.data.roleAssignment);
        // Actualizar también el status de la sala
        if (result.data.gameState?.phase) {
          setRoomState((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              room: prev.room ? { ...prev.room, status: result.data.gameState.phase } : { status: result.data.gameState.phase },
            };
          });
        }
      }
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [roomCode, playerId, isHost]);

  const addPista = useCallback(async (text: string) => {
    if (!roomCode || !playerId) return;

    try {
      const result = await gamesAPI.addPista(roomCode, playerId, text);
      if (result.success) {
        socketService.addPista(roomCode, playerId, text);
        // El WebSocket actualizará el estado
      }
    } catch (error) {
      console.error('Error adding pista:', error);
      throw error;
    }
  }, [roomCode, playerId]);

  const addVote = useCallback(async (targetId: string) => {
    if (!roomCode || !playerId) return;

    try {
      const result = await gamesAPI.addVote(roomCode, playerId, targetId);
      if (result.success) {
        socketService.addVote(roomCode, playerId, targetId);
        // El WebSocket actualizará el estado
      }
    } catch (error) {
      console.error('Error adding vote:', error);
      throw error;
    }
  }, [roomCode, playerId]);

  const changePhase = useCallback(async (phase: GamePhase) => {
    if (!roomCode || !playerId || !isHost) return;

    try {
      const result = await gamesAPI.changePhase(roomCode, playerId, phase);
      if (result.success) {
        socketService.changePhase(roomCode, playerId, phase);
        // El WebSocket actualizará el estado
      }
    } catch (error) {
      console.error('Error changing phase:', error);
      throw error;
    }
  }, [roomCode, playerId, isHost]);

  const getPlayerRole = useCallback(async (pId: string) => {
    if (!roomCode) return null;

    try {
      const result = await gamesAPI.getRole(roomCode, pId);
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error('Error getting player role:', error);
    }
    return null;
  }, [roomCode]);

  const getVotingResults = useCallback(async (): Promise<VotingResult | null> => {
    if (!roomCode) return null;

    try {
      const result = await gamesAPI.getVotingResults(roomCode);
      if (result.success) {
        return result.data;
      }
    } catch (error) {
      console.error('Error getting voting results:', error);
    }
    return null;
  }, [roomCode]);

  const markRoleSeen = useCallback(async (): Promise<{ allSeen: boolean }> => {
    if (!roomCode || !playerId) {
      return { allSeen: false };
    }

    try {
      const result = await gamesAPI.markRoleSeen(roomCode, playerId);
      if (result.success) {
        return { allSeen: result.data.allSeen };
      }
    } catch (error) {
      console.error('Error marking role seen:', error);
    }
    return { allSeen: false };
  }, [roomCode, playerId]);

  const getAllRolesSeen = useCallback(async (): Promise<{ allSeen: boolean; playersWhoSeen: number; totalPlayers: number }> => {
    if (!roomCode) {
      return { allSeen: false, playersWhoSeen: 0, totalPlayers: 0 };
    }

    try {
      const result = await gamesAPI.getAllRolesSeen(roomCode);
      if (result.success) {
        return {
          allSeen: result.data.allSeen,
          playersWhoSeen: result.data.playersWhoSeen,
          totalPlayers: result.data.totalPlayers,
        };
      }
    } catch (error) {
      console.error('Error getting all roles seen:', error);
    }
    return { allSeen: false, playersWhoSeen: 0, totalPlayers: 0 };
  }, [roomCode]);

  /**
   * Obtiene el jugador actual (el que está usando esta instancia de la app)
   * 
   * IMPORTANTE: Este método busca el jugador en la lista `players` (lista actual de jugadores en la sala).
   * No debe confundirse con el jugador que tiene el turno (que se obtiene con gameState.currentPlayerIndex).
   * 
   * @returns {Player | null} El jugador actual, o null si no se encuentra
   */
  const getCurrentPlayer = useCallback((): Player | null => {
    if (!playerId) return null;
    return players.find((p) => p.id === playerId) || null;
  }, [playerId, players]);

  /**
   * Obtiene la información del rol de un jugador
   * 
   * IMPORTANTE: Busca el jugador en roleAssignment.players, que contiene:
   * - El orden de los jugadores (usado para determinar turnos)
   * - El rol asignado a cada jugador
   * 
   * @param {string} pId - ID del jugador
   * @returns {object | null} Objeto con:
   *   - role: 'impostor' | 'normal'
   *   - secretWord: string | null (null si es impostor)
   *   - isImpostor: boolean
   */
  const getPlayerInfo = useCallback((pId: string) => {
    if (!roleAssignment || !gameState) return null;

    // Buscar el jugador en roleAssignment.players
    // Este array mantiene el orden de asignación de roles y se usa para los turnos
    const player = roleAssignment.players?.find((p: any) => p.id === pId);
    if (!player) return null;

    const isImpostor = player.role === 'impostor';

    return {
      role: player.role,
      secretWord: isImpostor ? null : gameState.secretWord, // Los impostores no conocen la palabra secreta
      isImpostor,
    };
  }, [roleAssignment, gameState]);

  // Cargar estado del juego cuando cambia roomCode o cuando el estado de la sala cambia de lobby
  useEffect(() => {
    if (roomCode && roomState?.room?.status && roomState.room.status !== 'lobby' && !gameState) {
      // Cargar inmediatamente cuando cambia de lobby a cualquier otra fase y no tenemos gameState
      loadGameState();
    }
  }, [roomCode, roomState?.room?.status, gameState, loadGameState]);

  // Verificar periódicamente el estado de la sala (solo en lobby para sincronizar jugadores)
  useEffect(() => {
    if (!roomCode || !isConnected) return;

    // Solo hacer polling si estamos en lobby
    if (roomState?.room?.status === 'lobby') {
      let pollCount = 0;
      const maxPolls = 20; // Máximo 20 polls (60 segundos)
      
      const interval = setInterval(async () => {
        pollCount++;
        if (pollCount > maxPolls) {
          clearInterval(interval);
          return;
        }
        
        try {
          // Cargar estado de la sala para verificar si cambió
          const result = await roomsAPI.get(roomCode);
          if (result.success && result.data) {
            const newStatus = result.data.room?.status;
            // Si el estado cambió de lobby a otra fase, actualizar y cargar gameState
            if (newStatus && newStatus !== 'lobby') {
              // Actualizar roomState primero para que useOnlineNavigation lo detecte
              setRoomState(result.data);
              setPlayers(result.data.players || []);
              setIsHost(result.data.room?.hostId === playerId);
              // Cargar gameState inmediatamente (esto también actualizará roomState.status)
              await loadGameState();
              clearInterval(interval); // Dejar de hacer polling cuando se detecta el cambio
            } else {
              // Si sigue en lobby, solo actualizar roomState
              setRoomState(result.data);
              setPlayers(result.data.players || []);
              setIsHost(result.data.room?.hostId === playerId);
            }
          }
        } catch (error: any) {
          // Ignorar errores 429 (rate limiting) - no es crítico
          if (error.response?.status !== 429) {
            console.error('Error en polling de lobby:', error);
          }
        }
      }, 3000); // Verificar cada 3 segundos (reducido para evitar rate limiting)

      return () => clearInterval(interval);
    }
  }, [roomCode, isConnected, roomState?.room?.status, loadGameState, playerId]);

  // Polling de fallback cuando el juego inicia pero no recibimos el evento (para jugadores que no recibieron GAME_STATE_CHANGED)
  useEffect(() => {
    if (!roomCode || !isConnected) return;
    
    // Si el estado de la sala cambió a roleAssignment pero no tenemos gameState, hacer polling
    if (roomState?.room?.status === 'roleAssignment' && !gameState) {
      // Cargar inmediatamente
      loadGameState();
      
      // Y hacer polling cada 3 segundos hasta que se cargue (reducido para evitar rate limiting)
      const interval = setInterval(async () => {
        try {
          await loadGameState();
          // Si ya tenemos gameState, dejar de hacer polling
          // (el intervalo se limpiará cuando gameState cambie)
        } catch (error: any) {
          // Ignorar errores 429 (rate limiting) - no es crítico
          if (error.response?.status !== 429) {
            console.error('Error polling game state:', error);
          }
        }
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [roomCode, isConnected, roomState?.room?.status, gameState, loadGameState]);

  const value: OnlineGameContextType = {
    roomCode,
    playerId,
    playerName,
    isHost,
    roomState,
    gameState,
    players,
    pistas,
    votes,
    roleAssignment,
    isConnected,
    loading,
    joinRoom,
    leaveRoom,
    startGame,
    addPista,
    addVote,
    changePhase,
    getPlayerRole,
    getVotingResults,
    markRoleSeen,
    getAllRolesSeen,
    loadGameState,
    getCurrentPlayer,
    getPlayerInfo,
  };

  return <OnlineGameContext.Provider value={value}>{children}</OnlineGameContext.Provider>;
};

