/**
 * Mazo de palabras secretas para el juego
 * Versión JavaScript para backend
 */

const SECRET_WORDS = [
  // Jugadores
  'Messi',
  'Cristiano Ronaldo',
  'Mbappé',
  'Haaland',
  'Benzema',
  'Modric',
  'De Bruyne',
  'Neymar',
  'Lewandowski',
  'Salah',
  'Mané',
  'Van Dijk',
  'Casemiro',
  'Kroos',
  'Vinicius Jr',
  'Rodrygo',
  'Foden',
  'Grealish',
  'Kane',
  'Son',
  'Bellingham',
  'Pedri',
  'Gavi',
  'Ansu Fati',
  'Lautaro Martínez',
  'Di María',
  'Ángel Di María',
  'Dybala',
  'Enzo Fernández',
  'Álvarez',
  'De Paul',
  'Mac Allister',
  'Martínez',
  'Romero',
  'Molina',
  'Tagliafico',
  'Acuña',
  'Paredes',
  'Lo Celso',
  
  // Equipos
  'Barcelona',
  'Real Madrid',
  'Manchester City',
  'Liverpool',
  'Chelsea',
  'Arsenal',
  'Manchester United',
  'Tottenham',
  'Bayern Munich',
  'Borussia Dortmund',
  'PSG',
  'Juventus',
  'AC Milan',
  'Inter Milan',
  'Atlético Madrid',
  'Sevilla',
  'Valencia',
  'Napoli',
  'Roma',
  'Lazio',
  'Ajax',
  'Benfica',
  'Porto',
  'River Plate',
  'Boca Juniors',
  'Flamengo',
  'Palmeiras',
  'Santos',
  'Corinthians',
  'São Paulo',
  'Independiente',
  'Racing',
  'San Lorenzo',
  'Estudiantes',
  'Gimnasia',
  'Newell\'s',
  'Rosario Central',
  'Colón',
  'Unión',
  'Talleres',
];

/**
 * Obtiene una palabra secreta aleatoria del mazo
 * @returns {string}
 */
function getRandomSecretWord() {
  const randomIndex = Math.floor(Math.random() * SECRET_WORDS.length);
  return SECRET_WORDS[randomIndex];
}

module.exports = {
  SECRET_WORDS,
  getRandomSecretWord,
};

