/**
 * Lógica del juego - Asignación de roles
 * Versión para backend (sin dependencias de React)
 */

const { getRandomSecretWord } = require('./secretWords');

/**
 * Asigna roles aleatorios a los jugadores
 * @param {Array} players - Array de jugadores { id, name }
 * @returns {object} RoleAssignment
 */
function assignRoles(players) {
  if (players.length < 3) {
    throw new Error('Se necesitan al menos 3 jugadores para jugar');
  }

  // Seleccionar palabra secreta aleatoria
  const secretWord = getRandomSecretWord();

  // Seleccionar impostor aleatorio
  const randomIndex = Math.floor(Math.random() * players.length);
  const impostorId = players[randomIndex].id;

  // Asignar roles a todos los jugadores
  const playersWithRoles = players.map((player) => ({
    ...player,
    role: player.id === impostorId ? 'impostor' : 'normal',
  }));

  return {
    secretWord,
    impostorId,
    players: playersWithRoles,
  };
}

module.exports = {
  assignRoles,
};

