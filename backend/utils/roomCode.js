/**
 * Utilidades para generar códigos de sala únicos
 */

const constants = require('../config/constants');

/**
 * Genera un código de sala aleatorio
 * @returns {string} Código de sala (ej: "ABC123")
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = constants.ROOM_CODE_LENGTH;
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
}

/**
 * Valida que un código de sala tenga el formato correcto
 * @param {string} code - Código a validar
 * @returns {boolean}
 */
function isValidRoomCode(code) {
  if (!code || typeof code !== 'string') {
    return false;
  }
  
  if (code.length !== constants.ROOM_CODE_LENGTH) {
    return false;
  }
  
  // Solo letras mayúsculas y números
  const regex = /^[A-Z0-9]+$/;
  return regex.test(code);
}

module.exports = {
  generateRoomCode,
  isValidRoomCode,
};

