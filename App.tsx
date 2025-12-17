import React from 'react';
import { AppNavigator } from './src/navigation';
import { GameProvider } from './src/game';
import { OnlineGameProvider } from './src/contexts';

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
    <GameProvider>
      <OnlineGameProvider>
        <AppNavigator />
      </OnlineGameProvider>
    </GameProvider>
  );
};

export default App;

