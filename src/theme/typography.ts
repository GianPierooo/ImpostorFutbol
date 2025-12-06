/**
 * Sistema de tipografía
 * Enfocado en legibilidad: tipografía clara y grande
 */

export const typography = {
  // Tamaños de fuente
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Pesos
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Familias (usar fuentes del sistema para mejor rendimiento)
  families: {
    regular: 'System',
    bold: 'System',
  },
  
  // Estilos predefinidos
  styles: {
    h1: {
      fontSize: 48,
      fontWeight: '700' as const,
      lineHeight: 56,
    },
    h2: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
    },
    h3: {
      fontSize: 30,
      fontWeight: '600' as const,
      lineHeight: 38,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    button: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
  },
} as const;

