/**
 * Paleta de colores moderna y sofisticada
 * Inspirada en diseño moderno con colores vibrantes pero elegantes
 * Mejor contraste y profundidad visual
 */

export const colors = {
  // Colores principales - Verde césped de fútbol
  primary: '#16A34A', // Verde césped vibrante (más temático de fútbol)
  secondary: '#22C55E', // Verde esmeralda brillante
  
  // Color de acento principal - Rojo elegante para impostor
  accent: '#EF4444', // Rojo coral vibrante pero elegante
  accentLight: '#F87171', // Rojo claro suave
  accentDark: '#DC2626', // Rojo oscuro profundo
  
  // Gradientes armoniosos mejorados
  gradientStart: '#10B981', // Verde esmeralda
  gradientEnd: '#6366F1', // Índigo
  gradientAccent: ['#EF4444', '#F87171'], // Rojo gradiente suave
  gradientGreen: ['#10B981', '#34D399'], // Verde gradiente más vibrante
  gradientBlue: ['#6366F1', '#818CF8'], // Índigo gradiente
  gradientNeon: ['#10B981', '#6366F1', '#A78BFA'], // Gradiente armonioso mejorado
  
  // Fondos y superficies - Con más profundidad y elegancia
  background: '#0F172A', // Azul oscuro profundo (slate-900) - más sofisticado
  backgroundDark: '#020617', // Casi negro con tinte azul
  surface: '#1E293B', // Slate-800 - más elegante que gris
  surfaceLight: '#334155', // Slate-700 - con tinte azul
  surfaceDark: '#0F172A', // Superficie oscura
  surfaceNeon: '#1E293B', // Con borde neón
  
  // Textos - Claros con mejor contraste
  text: '#F8FAFC', // Blanco casi puro (slate-50)
  textSecondary: '#CBD5E1', // Gris claro con tinte azul (slate-300)
  textLight: '#FFFFFF', // Blanco puro
  textMuted: '#94A3B8', // Gris medio (slate-400)
  textAccent: '#10B981', // Verde para acentos
  textNeon: '#EF4444', // Rojo para destacados
  
  // Estados y acentos - Más vibrantes y elegantes
  success: '#10B981', // Verde esmeralda
  successLight: '#34D399', // Verde claro vibrante
  error: '#EF4444', // Rojo coral (impostor) - más elegante que #FF0000
  errorLight: '#F87171', // Rojo claro suave
  warning: '#F59E0B', // Ámbar
  warningLight: '#FBBF24', // Ámbar claro
  info: '#6366F1', // Índigo
  impostor: '#EF4444', // Rojo coral específico para impostor
  
  // Colores especiales del juego
  normal: '#10B981', // Verde esmeralda para jugadores normales
  normalLight: '#34D399',
  
  // Bordes y divisores - Más elegantes
  border: '#475569', // Slate-600 - con tinte azul
  borderLight: '#64748B', // Slate-500
  borderNeon: '#10B981', // Verde para bordes destacados
  divider: '#334155', // Slate-700
  
  // Sombras y efectos - Glow más sofisticado
  shadow: 'rgba(15, 23, 42, 0.4)', // Sombra suave con tinte azul
  shadowMedium: 'rgba(15, 23, 42, 0.5)', // Sombra media
  shadowStrong: 'rgba(15, 23, 42, 0.7)', // Sombra fuerte
  shadowAccent: 'rgba(239, 68, 68, 0.4)', // Sombra roja suave
  shadowGlow: 'rgba(16, 185, 129, 0.4)', // Brillo verde más intenso
  shadowNeon: 'rgba(99, 102, 241, 0.4)', // Brillo índigo
  
  // Overlay
  overlay: 'rgba(15, 23, 42, 0.95)', // Overlay oscuro con tinte azul
  overlayLight: 'rgba(15, 23, 42, 0.8)', // Overlay claro
} as const;

export type ColorName = keyof typeof colors;
