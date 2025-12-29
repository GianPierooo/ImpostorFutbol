/**
 * Mazo de palabras secretas para el juego
 * Jugadores y equipos de fútbol
 */

export const SECRET_WORDS = [
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
] as const;

export type SecretWord = typeof SECRET_WORDS[number];

/**
 * Obtiene una palabra secreta aleatoria del mazo
 */
export const getRandomSecretWord = (): SecretWord => {
  const randomIndex = Math.floor(Math.random() * SECRET_WORDS.length);
  return SECRET_WORDS[randomIndex];
};

/**
 * Obtiene múltiples palabras secretas aleatorias (útil para pruebas)
 */
export const getRandomSecretWords = (count: number): SecretWord[] => {
  const shuffled = [...SECRET_WORDS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SECRET_WORDS.length));
};

