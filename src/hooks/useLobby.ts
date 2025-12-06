import { useState, useCallback } from 'react';
import { Player } from '../types';

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 10;

export const useLobby = () => {
  const [players, setPlayers] = useState<Player[]>([]);

  const addPlayer = useCallback((name: string) => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      return { success: false, error: 'El nombre no puede estar vacío' };
    }

    if (players.length >= MAX_PLAYERS) {
      return { success: false, error: `Máximo ${MAX_PLAYERS} jugadores` };
    }

    // Verificar duplicados (case insensitive)
    const isDuplicate = players.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      return { success: false, error: 'Este nombre ya está en uso' };
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: trimmedName,
    };

    setPlayers(prev => [...prev, newPlayer]);
    return { success: true };
  }, [players]);

  const removePlayer = useCallback((id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearPlayers = useCallback(() => {
    setPlayers([]);
  }, []);

  const canStart = players.length >= MIN_PLAYERS;
  const isFull = players.length >= MAX_PLAYERS;

  return {
    players,
    addPlayer,
    removePlayer,
    clearPlayers,
    canStart,
    isFull,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    playerCount: players.length,
  };
};

