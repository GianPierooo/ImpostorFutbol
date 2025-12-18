/**
 * Utilidad para generar colores únicos y consistentes para cada jugador
 * Basado en el ID del jugador para garantizar consistencia
 */

import { colors } from '../theme/colors';

/**
 * Paleta de colores vibrantes pero armoniosos para avatares
 * Colores que contrastan bien con el fondo oscuro y entre sí
 */
const PLAYER_COLORS = [
  '#22C55E', // Verde esmeralda (primary)
  '#3B82F6', // Azul vibrante
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#F59E0B', // Ámbar
  '#10B981', // Verde esmeralda claro
  '#06B6D4', // Cyan
  '#EF4444', // Rojo claro
  '#6366F1', // Índigo
  '#14B8A6', // Turquesa
];

/**
 * Genera un color único y consistente para un jugador basado en su ID
 * @param playerId - ID único del jugador
 * @returns Color hexadecimal
 */
export const getPlayerColor = (playerId: string): string => {
  // Convertir el ID a un número usando hash simple
  let hash = 0;
  for (let i = 0; i < playerId.length; i++) {
    hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Usar el hash para seleccionar un color de la paleta
  const index = Math.abs(hash) % PLAYER_COLORS.length;
  return PLAYER_COLORS[index];
};

/**
 * Genera un color más claro para efectos de brillo/borde
 * @param color - Color base hexadecimal
 * @returns Color más claro
 */
export const getPlayerColorLight = (color: string): string => {
  // Aumentar brillo en 20%
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const lightR = Math.min(255, Math.floor(r + (255 - r) * 0.2));
  const lightG = Math.min(255, Math.floor(g + (255 - g) * 0.2));
  const lightB = Math.min(255, Math.floor(b + (255 - b) * 0.2));
  
  return `#${lightR.toString(16).padStart(2, '0')}${lightG.toString(16).padStart(2, '0')}${lightB.toString(16).padStart(2, '0')}`;
};

/**
 * Genera un color más oscuro para efectos de sombra
 * @param color - Color base hexadecimal
 * @returns Color más oscuro
 */
export const getPlayerColorDark = (color: string): string => {
  // Reducir brillo en 20%
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const darkR = Math.max(0, Math.floor(r * 0.8));
  const darkG = Math.max(0, Math.floor(g * 0.8));
  const darkB = Math.max(0, Math.floor(b * 0.8));
  
  return `#${darkR.toString(16).padStart(2, '0')}${darkG.toString(16).padStart(2, '0')}${darkB.toString(16).padStart(2, '0')}`;
};

