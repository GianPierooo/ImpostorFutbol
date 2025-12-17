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
  maxRounds: number | null; // null = sin límite
};

export type GameConfig = {
  rounds: number | null; // null = sin límite
};

export type Pista = {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  round: number;
  turn: number;
};

export type Voto = {
  voterId: string; // Quién vota
  voterName: string;
  targetId: string; // Por quién vota
  targetName: string;
};

export type VotingResult = {
  votes: Voto[];
  voteCounts: Record<string, number>; // targetId -> cantidad de votos
  mostVoted: string | null; // ID del más votado
  isTie: boolean;
};

export type GameMode = 'local' | 'online';

export type OnlineRoom = {
  code: string;
  hostId: string;
  status: GamePhase;
  players: Player[];
  config: GameConfig;
  createdAt: number;
};

export type NavigationParamList = {
  Home: undefined;
  Lobby: undefined;
  OnlineLobby: undefined;
  OnlineRoom: {
    code: string;
    playerId: string;
    playerName: string;
  };
  RoleAssignment: {
    players: Player[];
    config: GameConfig;
  };
  Round: undefined;
  Discussion: undefined;
  Voting: undefined;
  Results: undefined;
};

