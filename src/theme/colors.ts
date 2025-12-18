/**
 * Paleta de colores moderna y armoniosa
 * Inspirada en juegos modernos de fútbol y sociales
 * Colores que combinan perfectamente entre sí
 */

export const colors = {
  // Colores principales - Verde fútbol vibrante
  primary: '#22C55E', // Verde esmeralda brillante (fútbol)
  secondary: '#3B82F6', // Azul vibrante
  
  // Color de acento principal - Rojo fuerte para impostor
  accent: '#DC2626', // Rojo fuerte pero elegante
  accentLight: '#EF4444', // Rojo claro
  accentDark: '#B91C1C', // Rojo oscuro
  
  // Gradientes armoniosos
  gradientStart: '#22C55E', // Verde
  gradientEnd: '#3B82F6', // Azul
  gradientAccent: ['#DC2626', '#EF4444'], // Rojo gradiente
  gradientGreen: ['#22C55E', '#4ADE80'], // Verde gradiente
  gradientBlue: ['#3B82F6', '#60A5FA'], // Azul gradiente
  gradientNeon: ['#22C55E', '#3B82F6', '#8B5CF6'], // Gradiente armonioso
  
  // Fondos y superficies - Oscuros elegantes con buen contraste
  background: '#111827', // Gris muy oscuro (gray-900) - elegante
  backgroundDark: '#030712', // Casi negro
  surface: '#1F2937', // Gris oscuro para tarjetas (gray-800)
  surfaceLight: '#374151', // Gris medio (gray-700)
  surfaceDark: '#111827', // Superficie oscura
  surfaceNeon: '#1F2937', // Con borde neón
  
  // Textos - Claros sobre fondo oscuro
  text: '#F9FAFB', // Blanco suave (gray-50)
  textSecondary: '#D1D5DB', // Gris claro (gray-300)
  textLight: '#FFFFFF', // Blanco puro
  textMuted: '#9CA3AF', // Gris medio (gray-400)
  textAccent: '#22C55E', // Verde para acentos
  textNeon: '#DC2626', // Rojo para destacados
  
  // Estados y acentos - Vibrantes pero armoniosos
  success: '#22C55E', // Verde esmeralda
  successLight: '#4ADE80', // Verde claro
  error: '#FF0000', // Rojo fuerte (impostor)
  errorLight: '#FF3333', // Rojo claro
  warning: '#F59E0B', // Ámbar
  warningLight: '#FBBF24', // Ámbar claro
  info: '#3B82F6', // Azul
  impostor: '#FF0000', // Rojo fuerte específico para impostor
  
  // Colores especiales del juego
  normal: '#22C55E', // Verde esmeralda para jugadores normales
  normalLight: '#4ADE80',
  
  // Bordes y divisores - Armoniosos
  border: '#4B5563', // Gris azulado (gray-600)
  borderLight: '#6B7280', // Gris claro (gray-500)
  borderNeon: '#22C55E', // Verde para bordes destacados
  divider: '#374151', // Gris medio (gray-700)
  
  // Sombras y efectos - Glow suave
  shadow: 'rgba(0, 0, 0, 0.3)', // Sombra suave
  shadowMedium: 'rgba(0, 0, 0, 0.4)', // Sombra media
  shadowStrong: 'rgba(0, 0, 0, 0.6)', // Sombra fuerte
  shadowAccent: 'rgba(220, 38, 38, 0.4)', // Sombra roja
  shadowGlow: 'rgba(34, 197, 94, 0.3)', // Brillo verde
  shadowNeon: 'rgba(59, 130, 246, 0.4)', // Brillo azul
  
  // Overlay
  overlay: 'rgba(17, 24, 39, 0.9)', // Overlay muy oscuro
  overlayLight: 'rgba(17, 24, 39, 0.7)', // Overlay claro
} as const;

export type ColorName = keyof typeof colors;
