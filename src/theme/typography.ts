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
  
  // Familias - Fuentes modernas y futuristas
  families: {
    regular: 'System', // Usará la fuente del sistema (San Francisco en iOS, Roboto en Android)
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    // Para Android, Roboto es moderna. Para iOS, San Francisco es excelente.
  },
  
  // Estilos predefinidos - Modernos y legibles
  styles: {
    h1: {
      fontSize: 48,
      fontWeight: '800' as const, // Extra bold para títulos futuristas
      lineHeight: 56,
      letterSpacing: -0.5, // Espaciado ajustado
    },
    h2: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.3,
    },
    h3: {
      fontSize: 30,
      fontWeight: '700' as const, // Más bold
      lineHeight: 38,
      letterSpacing: -0.2,
    },
    h4: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 32,
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
      letterSpacing: 0.1,
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '500' as const, // Medium para mejor legibilidad
      lineHeight: 28,
      letterSpacing: 0.1,
    },
    caption: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    button: {
      fontSize: 18,
      fontWeight: '700' as const, // Bold para botones
      lineHeight: 24,
      letterSpacing: 0.5, // Más espaciado para botones
    },
  },
} as const;

