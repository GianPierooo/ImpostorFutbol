/**
 * Tipos globales del proyecto
 */

export type Player = {
  id: string;
  name: string;
  avatar?: string;
};

export type Role = 'impostor' | 'normal';

export type GamePhase = 
  | 'lobby'
  | 'roleAssignment'
  | 'round'
  | 'voting'
  | 'results';

export type GameState = {
  phase: GamePhase;
  players: Player[];
  secretWord: string; // Jugador o equipo de fútbol
  impostorId: string | null;
  currentRound: number;
  maxRounds: number;
};

export type GameConfig = {
  rounds: number;
  timePerRound: number | null;
};

export type NavigationParamList = {
  Home: undefined;
  Lobby: undefined;
  RoleAssignment: {
    players: Player[];
    config: GameConfig;
  };
  Round: undefined;
  Voting: undefined;
  Results: undefined;
};

