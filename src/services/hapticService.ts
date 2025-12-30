/**
 * Servicio de feedback háptico (vibración) como alternativa a sonidos
 * No requiere archivos de audio ni módulos nativos adicionales
 */

import { Vibration, Platform } from 'react-native';

export enum HapticType {
  TAP = 'tap',
  SUCCESS = 'success',
  ERROR = 'error',
  FLIP = 'flip',
  TRANSITION = 'transition',
  VOTE = 'vote',
  REVEAL = 'reveal',
  BUTTON_CLICK = 'button_click',
  HEARTBEAT = 'heartbeat',
}

class HapticService {
  private enabled: boolean = true;

  /**
   * Reproducir feedback háptico
   */
  play(type: HapticType): void {
    if (!this.enabled) {
      return;
    }

    try {
      switch (type) {
        case HapticType.TAP:
        case HapticType.BUTTON_CLICK:
          // Vibración corta para clicks
          if (Platform.OS === 'ios') {
            // En iOS, usar HapticFeedback si está disponible
            Vibration.vibrate(10);
          } else {
            Vibration.vibrate(10);
          }
          break;

        case HapticType.SUCCESS:
        case HapticType.VOTE:
          // Vibración doble para éxito
          Vibration.vibrate([10, 50, 10]);
          break;

        case HapticType.ERROR:
          // Vibración triple para error
          Vibration.vibrate([10, 50, 10, 50, 10]);
          break;

        case HapticType.FLIP:
        case HapticType.REVEAL:
          // Vibración media para revelaciones
          Vibration.vibrate([20, 30, 20]);
          break;

        case HapticType.TRANSITION:
          // Vibración muy corta para transiciones
          Vibration.vibrate(5);
          break;

        case HapticType.HEARTBEAT:
          // Patrón de latidos de corazón: dos latidos rápidos seguidos de pausa
          // Patrón: latido1 (corto), pausa corta, latido2 (corto)
          // No usar repetición automática, se controla con setInterval en los componentes
          Vibration.vibrate([50, 100, 50]);
          break;

        default:
          Vibration.vibrate(10);
      }
    } catch (error) {
      // Ignorar errores de vibración
    }
  }

  /**
   * Iniciar patrón de latidos de corazón continuo
   */
  startHeartbeat(): void {
    if (!this.enabled) {
      return;
    }
    this.play(HapticType.HEARTBEAT);
  }

  /**
   * Detener vibración (cancelar patrón repetitivo)
   */
  stop(): void {
    try {
      Vibration.cancel();
    } catch (error) {
      // Ignorar errores
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export const hapticService = new HapticService();

