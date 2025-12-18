/**
 * Servicio de sonido para efectos de audio en la aplicación
 * Gestiona la reproducción de efectos de sonido para interacciones y transiciones
 * 
 * NOTA: Este servicio es completamente opcional. Si react-native-sound no está vinculado,
 * el servicio funcionará en modo "silencioso" sin causar errores.
 */

// Variable para almacenar el módulo Sound (se carga de forma lazy)
let Sound: any = null;
let soundModuleLoaded = false;
let soundModuleError: Error | null = null;

/**
 * Función para cargar el módulo react-native-sound de forma segura
 * Solo se ejecuta cuando realmente se necesita
 */
const loadSoundModule = (): boolean => {
  // Si ya intentamos cargar el módulo, retornar el resultado anterior
  if (soundModuleLoaded) {
    return Sound !== null;
  }
  
  soundModuleLoaded = true;
  
  // Verificar si el módulo nativo está disponible antes de intentar cargarlo
  try {
    // Primero verificar si NativeModules tiene el módulo
    const ReactNative = require('react-native');
    const { NativeModules } = ReactNative;
    
    // Si el módulo nativo no está disponible, no intentar cargar react-native-sound
    if (!NativeModules || !NativeModules.RNSound) {
      console.warn('⚠️ react-native-sound no está vinculado. Los efectos de sonido estarán deshabilitados.');
      console.warn('💡 Para habilitar sonidos, ejecuta: npx react-native run-android (o run-ios) después de instalar.');
      Sound = null;
      return false;
    }
    
    // Si el módulo nativo está disponible, intentar cargar react-native-sound
    // Usar una función wrapper para capturar cualquier error durante el require
    try {
      // Usar eval para evitar que el bundler intente resolver el módulo inmediatamente
      const soundModule = eval('require')('react-native-sound');
      Sound = soundModule.default || soundModule;
      
      // Verificar que Sound sea válido
      if (!Sound || typeof Sound !== 'function') {
        throw new Error('Sound module is not a valid constructor');
      }
      
      // Habilitar modo de reproducción en silencio (para iOS)
      if (Sound && typeof Sound.setCategory === 'function') {
        try {
          Sound.setCategory('Playback', true);
        } catch (e) {
          // Ignorar errores al configurar la categoría
        }
      }
      
      return true;
    } catch (requireError: any) {
      console.warn('⚠️ Error al cargar react-native-sound:', requireError?.message || requireError);
      Sound = null;
      soundModuleError = requireError as Error;
      return false;
    }
  } catch (error: any) {
    console.warn('⚠️ react-native-sound no está disponible. Los efectos de sonido estarán deshabilitados.');
    console.warn('💡 Para habilitar sonidos, ejecuta: npx react-native run-android (o run-ios) después de instalar.');
    Sound = null;
    soundModuleError = error as Error;
    return false;
  }
};

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
// NOTA: En Android, los archivos deben estar en android/app/src/main/res/raw/ SIN extensión
// En iOS, los archivos deben estar en el bundle con extensión
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

  /**
   * Inicializar el servicio de sonido
   * Carga todos los sonidos en memoria
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Intentar cargar el módulo si no se ha cargado
    if (!loadSoundModule()) {
      // Si Sound no está disponible, marcar como inicializado pero deshabilitado
      this.initialized = true;
      this.enabled = false;
      console.warn('⚠️ Servicio de sonido deshabilitado: react-native-sound no está vinculado');
      return;
    }

    try {
      // Cargar todos los sonidos
      const loadPromises = Object.entries(SOUND_CONFIG).map(([type, config]) => {
        return new Promise<void>((resolve) => {
          try {
            const sound = new Sound(
              config.file,
              Sound.MAIN_BUNDLE,
              (error: any) => {
                if (error) {
                  console.warn(`⚠️ No se pudo cargar el sonido ${type}:`, error);
                  soundCache[type] = null;
                  resolve(); // Continuar aunque falle un sonido
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
      this.initialized = true; // Marcar como inicializado para no bloquear la app
    }
  }

  /**
   * Reproducir un efecto de sonido
   */
  play(type: SoundType): void {
    // Intentar cargar el módulo si no se ha cargado
    if (!loadSoundModule()) {
      return;
    }
    
    // Si Sound no está disponible, simplemente retornar
    if (!Sound || !this.enabled || !this.initialized) {
      return;
    }

    const sound = soundCache[type];
    if (!sound) {
      // Silenciosamente fallar si el sonido no está disponible
      return;
    }

    try {
      // Detener el sonido si ya se está reproduciendo
      sound.stop(() => {
        // Reproducir desde el inicio
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

  /**
   * Habilitar o deshabilitar los sonidos
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Verificar si los sonidos están habilitados
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Limpiar recursos (llamar cuando se desmonte el servicio)
   */
  cleanup(): void {
    Object.values(soundCache).forEach((sound) => {
      if (sound) {
        sound.stop();
        sound.release();
      }
    });
    Object.keys(soundCache).forEach((key) => {
      soundCache[key] = null;
    });
    this.initialized = false;
  }
}

// Instancia singleton - crear de forma segura
let soundServiceInstance: SoundService | null = null;

export const soundService: SoundService = (() => {
  if (!soundServiceInstance) {
    try {
      soundServiceInstance = new SoundService();
    } catch (error) {
      console.warn('⚠️ No se pudo crear el servicio de sonido:', error);
      // Crear una instancia "dummy" que no hace nada
      soundServiceInstance = {
        initialize: async () => {},
        play: () => {},
        setEnabled: () => {},
        isEnabled: () => false,
        cleanup: () => {},
      } as SoundService;
    }
  }
  return soundServiceInstance;
})();

