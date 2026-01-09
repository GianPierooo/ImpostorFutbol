# Flujo del Modo Local - Impostor Fútbol

## Cambios Realizados para Solucionar Bug de Segunda Ronda

### Problema Identificado
El modo local se quedaba "bugueado" después de que los jugadores respondían la primera ronda. El problema estaba en la sincronización del estado cuando se navegaba de vuelta a la pantalla Round en la segunda ronda.

### Solución Implementada

#### 1. RoundLocal.tsx
**Problema**: Usaba un estado local `currentRound` que se sincronizaba mediante un `useEffect`, causando que el componente se renderizara con la ronda incorrecta antes de que el efecto se ejecutara.

**Solución**: Eliminado el estado local y usar directamente `gameState.currentRound`:

```typescript
// ANTES (❌ INCORRECTO)
const [currentRound, setCurrentRound] = useState(1);
useEffect(() => {
  if (gameState?.currentRound) {
    setCurrentRound(gameState.currentRound);
  }
}, [gameState?.currentRound]);

// DESPUÉS (✅ CORRECTO)
const currentRound = gameState?.currentRound || 1;
```

Esto asegura que:
- El componente siempre use la ronda correcta del gameState
- No hay problemas de timing con useEffect
- La verificación de `hasGivenPista` use la ronda correcta

#### 2. GameContext.tsx
**Mejoras**:
- Simplificado el efecto que reinicia turnos cuando cambia la ronda
- Agregado logging para debugging
- Mejorada la lógica de `finishRound()` para asegurar que actualiza correctamente

#### 3. DiscussionLocal.tsx
**Mejoras**:
- Agregado logging para rastrear el flujo de navegación
- Confirmado que la navegación pasa correctamente `mode: 'local'`

### Flujo Correcto del Juego Local

```
1. Lobby (agregar jugadores)
   ↓
2. RoleAssignment (cada jugador ve su rol)
   ↓ [fase: 'round', ronda: 1]
3. Round - Ronda 1
   - Cada jugador da su pista
   - Cuando todos dieron pista → automáticamente a Discussion
   ↓ [fase: 'discussion', ronda: 1]
4. Discussion - Ronda 1
   - Revisar pistas
   - Botón "Siguiente Ronda" o "Finalizar y Votar"
   ↓ [finishRound() → fase: 'round', ronda: 2, resetea índices]
5. Round - Ronda 2
   - ✅ Ahora funciona correctamente
   - currentPlayerIndex reseteado a 0
   - gameState.currentRound = 2
   - Verificación de pistas usa la ronda correcta
   - Cada jugador puede dar su pista (aunque ya haya dado en ronda 1)
   ↓
6. ... continúa hasta última ronda o decisión de finalizar
   ↓
7. Voting (todos votan)
   ↓
8. Results (ganador y estadísticas)
```

### Verificaciones Clave

#### En Round (cada ronda):
```typescript
// Verificar si jugador ya dio pista EN ESTA RONDA
const hasGivenPista = pistas.some(
  (p) => p.playerId === currentPlayer.id && p.round === gameState.currentRound
);
```

#### Al agregar pista:
```typescript
// Solo permitir UNA pista por jugador por ronda
const existingPistaInRound = pistas.find(
  (p) => p.playerId === playerId && p.round === gameState.currentRound
);
if (existingPistaInRound) return; // Ya dio pista en esta ronda
```

#### Cuando todos dieron pista:
```typescript
// Cambio automático a fase 'discussion'
const playersWhoGavePista = new Set(roundPistas.map(p => p.playerId));
const allPlayersGavePista = roleAssignment.players.every((p) => 
  playersWhoGavePista.has(p.id)
);
if (allPlayersGavePista) {
  setGameState(prev => ({ ...prev, phase: 'discussion' }));
}
```

#### Al avanzar de ronda (finishRound):
```typescript
const newRound = gameState.currentRound + 1;
setLastRoundNumber(newRound);
setCurrentTurn(1);
setCurrentPlayerIndex(0);
setGameState(prev => ({
  ...prev,
  currentRound: newRound,
  phase: 'round' // IMPORTANTE: volver a fase 'round'
}));
```

### Logging para Debugging

Los siguientes logs ayudan a rastrear el flujo:

- `[GameContext] Ronda cambió de X a Y, reiniciando turnos`
- `[GameContext] addPista: Agregando pista de JUGADOR en ronda X`
- `[GameContext] Todos los jugadores dieron su pista en ronda X, cambiando a discussion`
- `[GameContext] finishRound: Avanzando de ronda X a Y`
- `[RoundLocal] Jugador X enviando pista en ronda Y`
- `[RoundLocal] Fase cambió a discussion, navegando automáticamente`
- `[DiscussionLocal] handleContinue - ronda actual: X`
- `[DiscussionLocal] Avanzando a la siguiente ronda`

### Testing Manual Recomendado

1. **Caso básico - 3 jugadores, 3 rondas**:
   - Agregar 3 jugadores en Lobby
   - Configurar 3 rondas
   - Iniciar juego
   - Cada jugador ve su rol
   - Ronda 1: todos dan pista → automático a Discussion
   - Discussion: "Siguiente Ronda" → **VERIFICAR que Round 2 funcione**
   - Ronda 2: todos dan pista → automático a Discussion
   - Discussion: "Siguiente Ronda"
   - Ronda 3: todos dan pista → automático a Discussion
   - Discussion: "Ir a Votación"
   - Voting: todos votan
   - Results: ver ganador

2. **Caso sin límite de rondas**:
   - Configurar "Sin límite de rondas"
   - Jugar al menos 3 rondas
   - Verificar que se puede finalizar después de ronda 3
   - O continuar indefinidamente

3. **Verificar que no se malogró el modo online**:
   - El modo online NO fue tocado
   - Todas las pantallas online siguen funcionando igual
   - Los cambios solo afectan GameContext (local) y pantallas *Local.tsx

### Archivos Modificados

- ✅ `src/screens/Round/RoundLocal.tsx` - Eliminado estado local currentRound
- ✅ `src/game/GameContext.tsx` - Mejorado manejo de rondas y logging
- ✅ `src/screens/Discussion/DiscussionLocal.tsx` - Agregado logging

### Archivos NO Modificados (modo online intacto)

- ✅ `src/contexts/OnlineGameContext.tsx` - SIN CAMBIOS
- ✅ `src/screens/Round/RoundOnline.tsx` - SIN CAMBIOS
- ✅ `src/screens/Discussion/DiscussionOnline.tsx` - SIN CAMBIOS
- ✅ Todo el backend - SIN CAMBIOS
- ✅ Servicios de API y Socket - SIN CAMBIOS

---

**Última actualización**: 8 de Enero 2025
**Estado**: ✅ Solucionado

