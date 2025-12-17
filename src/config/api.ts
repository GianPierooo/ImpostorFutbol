/**
 * Configuración de la API
 * TODO: Cambiar estas URLs por la IP de tu VM
 */

export const API_CONFIG = {
  // URL del backend
  BASE_URL: __DEV__
    ? 'http://localhost:3000/api'
    : 'http://163.192.223.30:3000/api',
  
  // URL del WebSocket
  SOCKET_URL: __DEV__
    ? 'http://localhost:3000'
    : 'http://163.192.223.30:3000',
};

