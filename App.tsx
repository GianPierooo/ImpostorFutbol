import React from 'react';
import { AppNavigator } from './src/navigation';
import { GameProvider } from './src/game';

/**
 * App principal de Impostor Fútbol
 * 
 * Estructura:
 * - Navegación: AppNavigator maneja el flujo de pantallas
 * - Tema: Centralizado en src/theme
 * - Componentes: Reutilizables en src/components
 * - Pantallas: En src/screens
 * - Game Context: Maneja el estado del juego
 */
const App: React.FC = () => {
  return (
    <GameProvider>
      <AppNavigator />
    </GameProvider>
  );
};

export default App;

