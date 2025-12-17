/**
 * Configuración de la API
 * IP de la VM de Oracle Cloud
 */

const VM_IP = '163.192.223.30';

export const API_CONFIG = {
  // URL del backend (siempre usar IP de la VM, no localhost)
  BASE_URL: `http://${VM_IP}:3000/api`,
  
  // URL del WebSocket
  SOCKET_URL: `http://${VM_IP}:3000`,
};

