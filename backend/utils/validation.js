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
 * @returns {{ valid: boolean, error?: string }}
 */
function validatePista(text) {
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

