/**
 * Tema personalizado para React Native Paper
 * Basado en los colores del juego Impostor Fútbol
 */
import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    // Colores primarios - Verde fútbol
    primary: colors.primary, // #22C55E - Verde esmeralda
    primaryContainer: colors.successLight, // #4ADE80
    secondary: colors.secondary, // #3B82F6 - Azul
    secondaryContainer: colors.surfaceLight,
    
    // Fondos - Oscuros elegantes
    background: colors.background, // #0F172A - Azul muy oscuro
    surface: colors.surface, // #1E293B - Azul oscuro
    surfaceVariant: colors.surfaceLight, // #334155
    
    // Textos - Claros sobre fondo oscuro
    onPrimary: colors.textLight, // Blanco sobre índigo
    onSecondary: colors.textLight, // Blanco sobre púrpura
    onBackground: colors.text, // Blanco sobre fondo oscuro
    onSurface: colors.text, // Blanco sobre superficie oscura
    
    // Estados
    error: colors.error, // #FF0000 - Rojo fuerte
    errorContainer: colors.errorLight,
    
    // Bordes
    outline: colors.border, // Gris azulado
    outlineVariant: colors.borderLight,
    
    // Colores específicos del juego
    tertiary: colors.secondary, // Púrpura
  },
  
  // Personalización de forma
  roundness: 16, // Bordes redondeados modernos
};

