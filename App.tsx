import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, Portal } from 'react-native-paper';
import { AppNavigator } from './src/navigation';
import { GameProvider } from './src/game';
import { OnlineGameProvider } from './src/contexts';
import { paperTheme } from './src/theme/paperTheme';

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
 */
const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <Portal.Host>
          <GameProvider>
            <OnlineGameProvider>
              <AppNavigator />
            </OnlineGameProvider>
          </GameProvider>
        </Portal.Host>
      </PaperProvider>
    </GestureHandlerRootView>
  );
};

export default App;

