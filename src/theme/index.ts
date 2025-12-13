/**
 * Tema global centralizado
 * Exporta todos los tokens de diseño
 */

export { colors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { shadows } from './shadows';
export { getRoundColorScheme } from './roundColors';
export type { RoundColorScheme } from './roundColors';

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { shadows } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  shadows,
} as const;

export type Theme = typeof theme;

