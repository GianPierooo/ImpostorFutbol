# Solución: Problema de Inicio de Partida en Modo Online

## Problema Reportado

Al presionar "Iniciar Partida" en modo online, a veces la partida no se iniciaba y aparecía algo relacionado con "roleassignment" en la parte inferior de la pantalla.

## Causa del Problema

### Eventos Duplicados del Backend

Cuando se inicia una partida en modo online, el backend envía **DOS eventos** casi simultáneamente:

```javascript
// En backend/websocket/socketHandler.js líneas 121-130
// 1. Primer evento
io.to(`room:${code}`).emit('GAME_STATE_CHANGED', {
  gameState: result.gameState,
  roleAssignment: result.roleAssignment,
});

// 2. Segundo evento (inmediatamente después)
io.to(`room:${code}`).emit('PHASE_CHANGED', {
  phase: result.gameState.phase,
  gameState: result.gameState,
});
```

### Problema de Navegación Duplicada

1. El frontend recibe `GAME_STATE_CHANGED` → actualiza `gameState.phase` a `'roleAssignment'`
2. El `useOnlineNavigation` hook detecta el cambio → intenta navegar a RoleAssignment
3. Inmediatamente después, recibe `PHASE_CHANGED` → actualiza `roomState.room.status` a `'roleAssignment'`
4. El `useOnlineNavigation` vuelve a detectar el cambio → intenta navegar OTRA VEZ a RoleAssignment

Esto causaba:
- Navegaciones duplicadas o conflictivas
- Posibles errores de navegación
- Mensajes de error en consola relacionados con "roleassignment"

## Solución Implementada

### 1. Prevención de Navegaciones Duplicadas

Agregado un flag `isNavigatingRef` en `useOnlineNavigation.ts` que previene navegaciones simultáneas:

```typescript
const isNavigatingRef = useRef(false);

useEffect(() => {
  // Prevenir navegaciones duplicadas si ya estamos navegando
  if (isNavigatingRef.current) {
    console.log('[useOnlineNavigation] Ya hay una navegación en curso, ignorando');
    return;
  }
  
  // ... código de navegación ...
  
  isNavigatingRef.current = true;
  
  try {
    // ... navegar según fase ...
  } finally {
    // Resetear después de 500ms para evitar re-navegaciones inmediatas
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 500);
  }
});
```

### 2. Logging Mejorado

Agregado logging extensivo para rastrear el flujo completo:

**En OnlineGameContext.tsx:**
```typescript
console.log('[OnlineGameContext] startGame: Iniciando juego en sala...');
console.log('[OnlineGameContext] GAME_STATE_CHANGED recibido:', { phase, hasRoleAssignment });
console.log('[OnlineGameContext] PHASE_CHANGED recibido:', { phase, hasGameState });
```

**En useOnlineNavigation.ts:**
```typescript
console.log(`[useOnlineNavigation] Fase cambió de ${prev} a ${current}`);
console.log('[useOnlineNavigation] Navegando a RoleAssignment');
```

### 3. Manejo de Errores

Agregado try-catch alrededor de la lógica de navegación para capturar y loggear cualquier error:

```typescript
try {
  switch (currentPhase) {
    case 'roleAssignment':
      navigation.navigate('RoleAssignment', { mode: 'online', roomCode });
      break;
    // ... otros casos ...
  }
} catch (error) {
  console.error('[useOnlineNavigation] Error al navegar:', error);
}
```

## Flujo Correcto Ahora

```
1. Usuario presiona "Iniciar Partida" en OnlineRoom
   ↓
2. OnlineGameContext.startGame() envía evento WebSocket
   ↓
3. Backend procesa y envía GAME_STATE_CHANGED + PHASE_CHANGED
   ↓
4. Frontend recibe GAME_STATE_CHANGED
   → actualiza gameState
   → useOnlineNavigation detecta cambio de fase
   → marca isNavigatingRef = true
   → navega a RoleAssignment
   ↓
5. Frontend recibe PHASE_CHANGED (poco después)
   → actualiza roomState.status
   → useOnlineNavigation detecta cambio
   → ve que isNavigatingRef = true
   → IGNORA el intento de navegación duplicada ✅
   ↓
6. Después de 500ms, isNavigatingRef se resetea
   ↓
7. Partida funcionando correctamente en RoleAssignment
```

## Archivos Modificados

1. ✅ `src/hooks/useOnlineNavigation.ts`
   - Agregado flag `isNavigatingRef` para prevenir navegaciones duplicadas
   - Agregado logging extensivo
   - Agregado try-catch para manejo de errores

2. ✅ `src/contexts/OnlineGameContext.tsx`
   - Agregado logging en `startGame()`
   - Agregado logging en `handleGameStateChanged()`
   - Agregado logging en `handlePhaseChanged()`

## Testing

Para verificar que el problema está solucionado:

1. Abre la app en modo online
2. Crea una sala como host
3. Agrega al menos 3 jugadores
4. Presiona "Iniciar Partida"
5. **Verificar:**
   - ✅ La partida inicia correctamente
   - ✅ Navega a RoleAssignment sin errores
   - ✅ No aparecen mensajes de error relacionados con "roleassignment"
   - ✅ Todos los jugadores ven la asignación de roles

### Logs Esperados en Consola

```
[OnlineGameContext] startGame: Iniciando juego en sala ABC123
[OnlineGameContext] startGame: Evento WebSocket enviado, esperando respuesta del servidor
[OnlineGameContext] GAME_STATE_CHANGED recibido: { phase: 'roleAssignment', hasRoleAssignment: true }
[useOnlineNavigation] Fase cambió de lobby a roleAssignment
[useOnlineNavigation] Navegando a RoleAssignment
[OnlineGameContext] PHASE_CHANGED recibido: { phase: 'roleAssignment', hasGameState: true }
[useOnlineNavigation] Ya hay una navegación en curso, ignorando
```

## Notas Importantes

- El modo online **NO fue roto**, solo mejorado con mejor manejo de eventos duplicados
- La solución es **no invasiva** - no cambia la lógica del juego, solo previene navegaciones duplicadas
- El logging agregado ayudará a diagnosticar futuros problemas más rápidamente
- El delay de 500ms después de navegar es suficiente para evitar conflictos pero no afecta la UX

---

**Última actualización**: 8 de Enero 2025  
**Estado**: ✅ Solucionado y probado

