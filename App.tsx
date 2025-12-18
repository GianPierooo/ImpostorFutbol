import React, { useEffect } from 'react';
import { PaperProvider, Portal } from 'react-native-paper';
import { AppNavigator } from './src/navigation';
import { GameProvider } from './src/game';
import { OnlineGameProvider } from './src/contexts';
import { paperTheme } from './src/theme/paperTheme';
import { soundService } from './src/services';

/**
 * App principal de Impostor Fútbol
 * 
 * Estructura:
 * - Navegación: AppNavigator maneja el flujo de pantallas
 * - Tema: Centralizado en src/theme
 * - Componentes: Reutilizables en src/components
 * - Pantallas: En src/screens
 * - Game Context: Maneja el estado del juego (local)
 * - OnlineGame Context: Maneja el estado del juego (online)
 * - Sound Service: Gestiona efectos de sonido (opcional)
 */
const App: React.FC = () => {
  // Inicializar servicio de sonido al montar la app
  useEffect(() => {
    soundService.initialize().catch(() => {
      // Ignorar errores de inicialización
    });

    // Limpiar recursos al desmontar
    return () => {
      soundService.cleanup();
    };
  }, []);

  return (
    <PaperProvider theme={paperTheme}>
      <Portal.Host>
        <GameProvider>
          <OnlineGameProvider>
            <AppNavigator />
          </OnlineGameProvider>
        </GameProvider>
      </Portal.Host>
    </PaperProvider>
  );
};

export default App;

