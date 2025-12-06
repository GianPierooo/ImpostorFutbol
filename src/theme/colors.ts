/**
 * Paleta de colores minimalista
 * 2-3 colores principales + neutros + color de acento fuerte
 */

export const colors = {
  // Colores principales
  primary: '#1a1a1a', // Negro suave (fondo principal)
  secondary: '#ffffff', // Blanco (texto principal sobre fondo oscuro)
  
  // Color de acento fuerte
  accent: '#00d4ff', // Cyan brillante para acciones importantes
  
  // Neutros
  background: '#ffffff',
  surface: '#f5f5f5',
  text: '#1a1a1a',
  textSecondary: '#666666',
  textLight: '#ffffff',
  
  // Estados
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  
  // Bordes y divisores
  border: '#e0e0e0',
  divider: '#e0e0e0',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export type ColorName = keyof typeof colors;

