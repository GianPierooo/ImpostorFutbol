/**
 * Servicio de sonido SEGURO - versión que no falla si el módulo no está disponible
 * Esta versión verifica primero si el módulo nativo está disponible antes de intentar usarlo
 */

// Tipos de sonidos disponibles
export enum SoundType {
  TAP = 'tap',
  SUCCESS = 'success',
  ERROR = 'error',
  FLIP = 'flip',
  TRANSITION = 'transition',
  VOTE = 'vote',
  REVEAL = 'reveal',
  BUTTON_CLICK = 'button_click',
}

// Cache de sonidos cargados
const soundCache: { [key: string]: any | null } = {};

// Configuración de sonidos
const SOUND_CONFIG: { [key in SoundType]: { file: string; volume?: number } } = {
  [SoundType.TAP]: { file: 'tap', volume: 0.5 },
  [SoundType.SUCCESS]: { file: 'success', volume: 0.7 },
  [SoundType.ERROR]: { file: 'error', volume: 0.6 },
  [SoundType.FLIP]: { file: 'flip', volume: 0.6 },
  [SoundType.TRANSITION]: { file: 'transition', volume: 0.5 },
  [SoundType.VOTE]: { file: 'vote', volume: 0.6 },
  [SoundType.REVEAL]: { file: 'reveal', volume: 0.7 },
  [SoundType.BUTTON_CLICK]: { file: 'button_click', volume: 0.5 },
};

class SoundService {
  private enabled: boolean = true;
  private initialized: boolean = false;
  private soundAvailable: boolean = false;
  private Sound: any = null;

  /**
   * Verificar si el módulo de sonido está disponible
   */
  private checkSoundAvailability(): boolean {
    if (this.soundAvailable !== undefined && this.Sound !== undefined) {
      return this.soundAvailable;
    }

    try {
      const ReactNative = require('react-native');
      const { NativeModules } = ReactNative;
      
      // Verificar si el módulo nativo está disponible
      if (!NativeModules || !NativeModules.RNSound) {
        this.soundAvailable = false;
        return false;
      }

      // Intentar cargar el módulo de sonido
      try {
        const soundModule = require('react-native-sound');
        this.Sound = soundModule.default || soundModule;
        
        if (this.Sound && typeof this.Sound === 'function') {
          // Intentar configurar la categoría
          if (typeof this.Sound.setCategory === 'function') {
            try {
              this.Sound.setCategory('Playback', true);
            } catch (e) {
              // Ignorar errores
            }
          }
          this.soundAvailable = true;
          return true;
        }
      } catch (e) {
        this.soundAvailable = false;
        return false;
      }
    } catch (e) {
      this.soundAvailable = false;
      return false;
    }

    this.soundAvailable = false;
    return false;
  }

  /**
   * Inicializar el servicio de sonido
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Verificar si el módulo está disponible
    if (!this.checkSoundAvailability()) {
      this.initialized = true;
      this.enabled = false;
      console.warn('⚠️ Servicio de sonido deshabilitado: react-native-sound no está vinculado');
      console.warn('💡 Para habilitar sonidos, ejecuta: npx react-native run-android (o run-ios)');
      return;
    }

    try {
      // Cargar todos los sonidos
      const loadPromises = Object.entries(SOUND_CONFIG).map(([type, config]) => {
        return new Promise<void>((resolve) => {
          try {
            const sound = new this.Sound(
              config.file,
              this.Sound.MAIN_BUNDLE,
              (error: any) => {
                if (error) {
                  console.warn(`⚠️ No se pudo cargar el sonido ${type}:`, error);
                  soundCache[type] = null;
                  resolve();
                } else {
                  if (config.volume !== undefined) {
                    sound.setVolume(config.volume);
                  }
                  soundCache[type] = sound;
                  resolve();
                }
              }
            );
          } catch (error) {
            console.warn(`⚠️ Error al crear sonido ${type}:`, error);
            soundCache[type] = null;
            resolve();
          }
        });
      });

      await Promise.all(loadPromises);
      this.initialized = true;
      console.log('✅ Servicio de sonido inicializado');
    } catch (error) {
      console.warn('⚠️ Error al inicializar servicio de sonido:', error);
      this.initialized = true;
    }
  }

  /**
   * Reproducir un efecto de sonido
   */
  play(type: SoundType): void {
    if (!this.checkSoundAvailability() || !this.enabled || !this.initialized) {
      return;
    }

    const sound = soundCache[type];
    if (!sound) {
      return;
    }

    try {
      sound.stop(() => {
        sound.play((success: boolean) => {
          if (!success) {
            console.warn(`⚠️ No se pudo reproducir el sonido ${type}`);
          }
        });
      });
    } catch (error) {
      console.warn(`⚠️ Error al reproducir sonido ${type}:`, error);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  cleanup(): void {
    Object.values(soundCache).forEach((sound) => {
      if (sound) {
        try {
          sound.stop();
          sound.release();
        } catch (e) {
          // Ignorar errores
        }
      }
    });
    Object.keys(soundCache).forEach((key) => {
      soundCache[key] = null;
    });
    this.initialized = false;
  }
}

// Instancia singleton
export const soundService = new SoundService();

