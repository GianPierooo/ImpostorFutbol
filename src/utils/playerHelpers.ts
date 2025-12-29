/**
 * Utilidades para manejar información de jugadores
 */

/**
 * Obtiene las iniciales de un nombre
 * Si el nombre tiene dos palabras, usa la primera letra de cada palabra
 * Si tiene una sola palabra, usa las primeras dos letras
 * 
 * @param name - Nombre del jugador
 * @returns Iniciales en mayúsculas
 */
export const getInitials = (name: string): string => {
  const words = name.trim().split(' ').filter(w => w.length > 0);
  
  // Si tiene dos o más palabras, usar la primera letra de cada una
  if (words.length >= 2 && words[0].length > 0 && words[1].length > 0) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  // Fallback: usar las primeras 2 letras del nombre
  const trimmedName = name.trim();
  if (trimmedName.length >= 2) {
    return trimmedName.substring(0, 2).toUpperCase();
  }
  
  // Último fallback: usar el nombre completo o '??'
  return trimmedName.toUpperCase() || '??';
};

