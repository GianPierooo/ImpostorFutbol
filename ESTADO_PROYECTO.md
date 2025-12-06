# 📋 Estado Detallado del Proyecto - Impostor Fútbol

Este documento contiene información detallada sobre el estado actual del proyecto para referencia de la IA y desarrolladores.

## 🎯 Contexto del Proyecto

**Impostor Fútbol** es una aplicación móvil tipo party game inspirada en el concepto del "impostor futbolero". Los jugadores deben dar pistas sobre una palabra secreta (jugador o equipo de fútbol) mientras intentan descubrir quién es el impostor que no conoce la palabra.

## ✅ Fases Completadas

### Fase 1: Setup Base ✅

**Componentes Creados:**
- `Button`: Botón reutilizable con variantes (primary, secondary, accent)
- `Typography`: Sistema de tipografía con variantes (h1, h2, h3, h4, body, button, etc.)
- `ScreenContainer`: Contenedor de pantalla con SafeArea

**Tema Configurado:**
- Colores: Minimalista (negro #1a1a1a, blanco #ffffff, acento cyan #00d4ff)
- Tipografía: Sistema de tamaños (xs a 5xl) y pesos (regular, medium, semibold, bold)
- Espaciado: Tokens consistentes (xs: 4, sm: 8, md: 16, lg: 24, xl: 32, etc.)

**Navegación:**
- React Navigation Native Stack configurado
- 6 pantallas creadas: Home, Lobby, RoleAssignment, Round, Voting, Results
- Navegación sin headers (fullscreen)

### Fase 2: Lobby y Gestión de Jugadores ✅

**Componentes:**
- `PlayerInput`: Input con validación (no vacío, máximo 20 caracteres, sin duplicados)
- `PlayerList`: Lista con avatares generados (iniciales), botón eliminar
- `GameConfig`: Selector de rondas (1-3) y tiempo opcional (30s, 60s, 120s, sin límite)

**Hook Personalizado:**
- `useLobby`: Gestión de estado de jugadores
  - `addPlayer(name)`: Añade jugador con validación
  - `removePlayer(id)`: Elimina jugador
  - `clearPlayers()`: Limpia todos los jugadores
  - `canStart`: Boolean (mínimo 3 jugadores)
  - `isFull`: Boolean (máximo 10 jugadores)

**Validaciones:**
- Mínimo 3 jugadores para iniciar
- Máximo 10 jugadores
- Nombres únicos (case insensitive)
- Longitud máxima 20 caracteres

### Fase 3: Asignación de Roles ✅

**Lógica del Juego:**
- `secretWords.ts`: 90+ palabras (jugadores y equipos de fútbol)
- `gameLogic.ts`: 
  - `assignRoles(players)`: Asigna palabra secreta aleatoria e impostor aleatorio
  - `getPlayerRole(playerId, gameState)`: Obtiene rol del jugador
  - `isImpostor(playerId, gameState)`: Verifica si es impostor
  - `getPlayerInfo(playerId, gameState)`: Obtiene información que debe ver el jugador

**Context API:**
- `GameContext`: Estado global del juego
  - `gameState`: Estado actual (phase, players, secretWord, impostorId, rounds)
  - `roleAssignment`: Asignación de roles
  - `startGame(players, config)`: Inicia el juego
  - `resetGame()`: Reinicia el juego
  - `nextPhase()`: Avanza a la siguiente fase
  - `getPlayerInfo(playerId)`: Obtiene info del jugador

**Pantalla RoleAssignment:**
- Muestra rol a un jugador a la vez
- Impostor ve: "Eres el IMPOSTOR" + instrucciones
- Normal ve: "La palabra secreta es: [PALABRA]" + instrucciones
- Botón "Siguiente Jugador" / "Continuar"
- Al final: Botón "Continuar" para ir a Round

## 🎯 Fases Pendientes

### Fase 4: Ronda de Pistas

**Funcionalidades a Implementar:**
- Control de turnos (cada jugador da una pista)
- Interfaz de ronda mostrando:
  - Jugador actual destacado
  - Palabra secreta (solo a normales) o "Eres impostor"
  - Historial de pistas de la ronda
  - Contador de ronda (Ronda X de Y)
- Botón "Siguiente Turno" / "Finalizar Ronda"
- Lógica para avanzar rondas

**Archivos a Crear/Modificar:**
- `src/hooks/useRound.ts`: Hook para gestión de rondas
- `src/screens/Round/Round.tsx`: Implementar interfaz completa
- `src/components/PistaHistory/PistaHistory.tsx`: Componente para historial (opcional)

### Fase 5: Sistema de Votación

**Funcionalidades a Implementar:**
- Cada jugador vota por quién cree que es el impostor
- Validación: no votar por uno mismo
- Conteo de votos
- Determinar ganador (grupo o impostor)

**Archivos a Crear/Modificar:**
- `src/hooks/useVoting.ts`: Hook para gestión de votación
- `src/screens/Voting/Voting.tsx`: Implementar interfaz completa

### Fase 6: Resultados

**Funcionalidades a Implementar:**
- Mostrar quién era el impostor
- Mostrar la palabra secreta
- Mostrar quién ganó
- Mostrar quién votó por quién (opcional)
- Botones: "Nueva Partida", "Jugar Otra Vez"

**Archivos a Modificar:**
- `src/screens/Results/Results.tsx`: Implementar interfaz completa

## 🔧 Configuración Técnica Realizada

### Actualizaciones y Correcciones

1. **React Native**: Actualizado de 0.73.0 a 0.74.5
2. **Librerías**: Actualizadas a versiones compatibles
   - react-native-gesture-handler: ~2.18.0
   - react-native-safe-area-context: ~4.10.5
   - react-native-screens: ~3.31.1
3. **Android Configuration**:
   - minSdkVersion: 21 → 23 (requerido por RN 0.74)
   - Kotlin: 1.8.0 → 1.9.0
   - Removida dependencia de Flipper (no disponible en RN 0.74)
   - Limitadas arquitecturas a armeabi-v7a y arm64-v8a (evita problemas con x86_64 en Windows)

### Problemas Resueltos

1. **Error "BaseReactPackage not found"**: 
   - Solucionado actualizando React Native y librerías a versiones compatibles

2. **Error "minSdkVersion 21 cannot be smaller than version 23"**:
   - Solucionado actualizando minSdkVersion a 23

3. **Error CMake build failed para x86_64**:
   - Solucionado limitando arquitecturas en build.gradle

4. **Error "flipper-integration not found"**:
   - Solucionado removiendo dependencia de Flipper

## 📦 Estructura de Archivos Clave

### Tipos TypeScript (`src/types/index.ts`)
```typescript
- Player: { id, name, avatar? }
- Role: 'impostor' | 'normal'
- GamePhase: 'lobby' | 'roleAssignment' | 'round' | 'voting' | 'results'
- GameState: { phase, players, secretWord, impostorId, currentRound, maxRounds }
- GameConfig: { rounds, timePerRound }
```

### Palabras Secretas (`src/game/secretWords.ts`)
- 90+ palabras incluyendo:
  - Jugadores: Messi, Cristiano Ronaldo, Mbappé, Haaland, etc.
  - Equipos: Barcelona, Real Madrid, Manchester City, River Plate, Boca Juniors, etc.

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Ejecutar en Android
npm run android

# Iniciar Metro Bundler
npm start

# Limpiar caché de Android
cd android && .\gradlew.bat clean && cd ..

# Verificar emulador
adb devices
```

## 📝 Notas Importantes

1. **Emulador**: Debe estar corriendo antes de ejecutar `npm run android`
2. **Metro Bundler**: Se inicia automáticamente con `npm run android`, pero puede iniciarse manualmente con `npm start`
3. **Caché**: Si hay problemas, limpiar con `gradlew clean` y `npm start -- --reset-cache`
4. **Arquitecturas**: Solo se compilan armeabi-v7a y arm64-v8a (suficiente para emuladores modernos)

## 🎨 Convenciones de Código

- **Componentes**: PascalCase, en carpetas con index.ts
- **Hooks**: camelCase con prefijo "use"
- **Tipos**: PascalCase, exportados desde `src/types`
- **Tema**: Siempre usar tokens de `src/theme`
- **Navegación**: TypeScript con tipos definidos en `NavigationParamList`

## 🔄 Flujo de Datos

1. **Lobby**: `useLobby` → Estado local → `startGame()` → `GameContext`
2. **RoleAssignment**: `GameContext` → Muestra roles individualmente
3. **Round**: `GameContext` → Control de turnos (pendiente)
4. **Voting**: `GameContext` → Votación (pendiente)
5. **Results**: `GameContext` → Muestra resultados (pendiente)

---

**Última actualización**: Diciembre 2024
**Versión del proyecto**: 0.1.0
**React Native**: 0.74.5

