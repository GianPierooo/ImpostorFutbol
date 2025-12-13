/**
 * Sistema de colores dinámicos según la ronda
 * Se intensifica hacia rojo/naranja a medida que avanza el juego
 */

import { colors } from './colors';

export interface RoundColorScheme {
  background: string;
  accent: string;
  surface: string;
  border: string;
  intensity: number; // 0-1, donde 0 es inicio y 1 es final
}

/**
 * Calcula el esquema de colores según la ronda actual
 * @param currentRound - Ronda actual (1, 2, 3, etc.)
 * @param maxRounds - Máximo de rondas (null si es sin límite)
 * @returns Esquema de colores para la ronda
 */
export const getRoundColorScheme = (
  currentRound: number,
  maxRounds: number | null
): RoundColorScheme => {
  // Calcular intensidad (0 = inicio, 1 = final)
  let intensity = 0;
  
  if (maxRounds === null) {
    // Sin límite: intensidad basada en rondas completadas
    // Ronda 1-2: baja intensidad, 3+: aumenta gradualmente
    if (currentRound <= 2) {
      intensity = (currentRound - 1) * 0.2; // 0, 0.2
    } else {
      intensity = 0.4 + Math.min((currentRound - 3) * 0.15, 0.6); // 0.4-1.0
    }
  } else {
    // Con límite: intensidad basada en progreso
    intensity = (currentRound - 1) / Math.max(maxRounds - 1, 1);
    intensity = Math.min(intensity, 1);
  }

  // Colores base
  const baseColors = {
    // Ronda 1: Cyan suave (inicio)
    start: {
      background: colors.background,
      accent: colors.accent,
      surface: colors.surface,
      border: colors.border,
    },
    // Ronda final: Rojo/naranja intenso
    end: {
      background: '#fff5f5', // Fondo rojizo muy suave
      accent: '#ff4444', // Rojo intenso
      surface: '#ffe5e5', // Superficie rojiza suave
      border: '#ff9999', // Borde rojizo
    },
  };

  // Colores predefinidos por nivel de intensidad
  const getColorByIntensity = (type: 'background' | 'accent' | 'surface' | 'border'): string => {
    if (intensity < 0.33) {
      // Baja intensidad (rondas iniciales)
      const colors = {
        background: '#ffffff',
        accent: '#00d4ff',
        surface: '#f8f9fa',
        border: '#e5e7eb',
      };
      return colors[type];
    } else if (intensity < 0.66) {
      // Media intensidad (rondas intermedias)
      const colors = {
        background: '#fff8f0',
        accent: '#ff8800',
        surface: '#ffe8d0',
        border: '#ffcc99',
      };
      return colors[type];
    } else {
      // Alta intensidad (rondas finales)
      const colors = {
        background: '#fff5f5',
        accent: '#ff4444',
        surface: '#ffe5e5',
        border: '#ff9999',
      };
      return colors[type];
    }
  };

  return {
    background: getColorByIntensity('background'),
    accent: getColorByIntensity('accent'),
    surface: getColorByIntensity('surface'),
    border: getColorByIntensity('border'),
    intensity,
  };
};

