/**
 * Modelo de Juego
 */

class Game {
  constructor(data) {
    this.roomCode = data.roomCode;
    this.secretWord = data.secretWord;
    this.impostorId = data.impostorId;
    this.currentRound = data.currentRound || 1;
    this.maxRounds = data.maxRounds;
    this.phase = data.phase || 'roleAssignment';
    this.currentPlayerIndex = data.currentPlayerIndex || 0;
    this.currentVoterIndex = data.currentVoterIndex || 0;
    this.currentTurn = data.currentTurn || 1;
  }

  /**
   * Convierte el modelo a objeto plano
   * @returns {object}
   */
  toJSON() {
    return {
      roomCode: this.roomCode,
      secretWord: this.secretWord,
      impostorId: this.impostorId,
      currentRound: this.currentRound,
      maxRounds: this.maxRounds,
      phase: this.phase,
      currentPlayerIndex: this.currentPlayerIndex,
      currentVoterIndex: this.currentVoterIndex,
      currentTurn: this.currentTurn,
    };
  }

  /**
   * Avanza al siguiente turno
   * @param {number} totalPlayers - Total de jugadores
   */
  nextTurn(totalPlayers) {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % totalPlayers;
    
    if (this.currentPlayerIndex === 0) {
      this.currentTurn += 1;
    }
  }

  /**
   * Avanza a la siguiente ronda
   */
  nextRound() {
    this.currentRound += 1;
    this.currentPlayerIndex = 0;
    this.currentTurn = 1;
  }
}

module.exports = Game;

