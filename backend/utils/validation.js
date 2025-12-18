/**
 * Utilidades de validación
 */

const constants = require('../config/constants');

/**
 * Valida un nombre de jugador
 * @param {string} name - Nombre a validar
 * @returns {{ valid: boolean, error?: string }}
 */
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'El nombre es requerido' };
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'El nombre no puede estar vacío' };
  }

  if (trimmed.length > 20) {
    return { valid: false, error: 'El nombre no puede tener más de 20 caracteres' };
  }

  return { valid: true };
}

/**
 * Valida una pista
 * @param {string} text - Texto de la pista
 * @param {string} secretWord - Palabra secreta (opcional, para validar que no la contenga)
 * @returns {{ valid: boolean, error?: string }}
 */
function validatePista(text, secretWord = null) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'La pista es requerida' };
  }

  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return { valid: false, error: 'La pista no puede estar vacía' };
  }

  if (trimmed.length > 200) {
    return { valid: false, error: 'La pista no puede tener más de 200 caracteres' };
  }

  // Validar que no contenga la palabra secreta (si se proporciona)
  if (secretWord) {
    const normalizedText = trimmed.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const normalizedSecret = secretWord.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Verificar si el texto contiene la palabra secreta completa
    if (normalizedText.includes(normalizedSecret)) {
      return { valid: false, error: 'La pista no puede contener la palabra secreta' };
    }
    
    // Verificar palabras individuales (por si la palabra secreta tiene espacios)
    const textWords = normalizedText.split(/\s+/);
    const secretWords = normalizedSecret.split(/\s+/);
    
    // Verificar si alguna palabra de la pista coincide con alguna palabra de la palabra secreta
    for (const secretWordPart of secretWords) {
      if (secretWordPart.length > 2 && textWords.includes(secretWordPart)) {
        return { valid: false, error: 'La pista no puede contener palabras de la palabra secreta' };
      }
    }
  }

  return { valid: true };
}

/**
 * Valida la configuración del juego
 * @param {object} config - Configuración
 * @returns {{ valid: boolean, error?: string }}
 */
function validateGameConfig(config) {
  if (!config || typeof config !== 'object') {
    return { valid: false, error: 'La configuración es requerida' };
  }

  if (config.rounds !== null && config.rounds !== undefined) {
    if (typeof config.rounds !== 'number' || config.rounds < 1 || config.rounds > 10) {
      return { valid: false, error: 'El número de rondas debe estar entre 1 y 10' };
    }
  }

  return { valid: true };
}

module.exports = {
  validatePlayerName,
  validatePista,
  validateGameConfig,
};

