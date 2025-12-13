/**
 * Paleta de colores moderna y vibrante
 * Diseño llamativo con gradientes y efectos visuales
 */

export const colors = {
  // Colores principales
  primary: '#0a0a0a', // Negro profundo (fondo principal)
  secondary: '#ffffff', // Blanco (texto principal sobre fondo oscuro)
  
  // Color de acento fuerte - Gradiente cyan vibrante
  accent: '#00d4ff', // Cyan brillante para acciones importantes
  accentLight: '#33dfff', // Cyan claro para efectos
  accentDark: '#00a8cc', // Cyan oscuro para sombras
  
  // Gradientes
  gradientStart: '#00d4ff', // Inicio del gradiente
  gradientEnd: '#0099cc', // Fin del gradiente
  gradientAccent: ['#00d4ff', '#00a8cc'], // Array para gradientes
  
  // Neutros mejorados
  background: '#ffffff',
  backgroundDark: '#0f0f0f', // Fondo oscuro alternativo
  surface: '#f8f9fa', // Superficie más suave
  surfaceDark: '#1a1a1a', // Superficie oscura
  text: '#1a1a1a',
  textSecondary: '#6b7280', // Gris más suave
  textLight: '#ffffff',
  textMuted: '#9ca3af', // Texto muy suave
  
  // Estados mejorados
  success: '#10b981', // Verde más vibrante
  successLight: '#34d399',
  error: '#ef4444', // Rojo más vibrante
  errorLight: '#f87171',
  warning: '#f59e0b', // Naranja más vibrante
  warningLight: '#fbbf24',
  info: '#3b82f6', // Azul para información
  
  // Bordes y divisores mejorados
  border: '#e5e7eb', // Borde más suave
  borderLight: '#f3f4f6', // Borde muy claro
  divider: '#e5e7eb',
  
  // Sombras y efectos
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowStrong: 'rgba(0, 0, 0, 0.25)',
  shadowAccent: 'rgba(0, 212, 255, 0.3)', // Sombra con color de acento
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ColorName = keyof typeof colors;

