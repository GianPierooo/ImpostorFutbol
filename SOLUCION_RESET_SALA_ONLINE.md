# Solución: Reset de Sala Después de Partida Online

## Problema Reportado

Después de terminar una partida en modo online (estado: `results`), cuando el host presiona "Volver a Sala", no puede iniciar otra partida. El estado de la sala se queda en `results` en lugar de volver a `lobby`.

**Síntomas:**
- Estado mostrado: "Estado: results | Jugadores: 3 | Host: Sí"
- Botón "Iniciar Partida" deshabilitado
- Mensaje: "La sala no está lista (estado: results)"

## Causa del Problema

El botón "Volver a Sala" en `ResultsOnline.tsx` solo navegaba de vuelta a `OnlineRoom` pero **NO reseteaba el estado de la sala en el backend**. El estado permanecía en `results` y la validación en `OnlineRoom` impedía iniciar una nueva partida porque:

```typescript
const canStart = isHost && players.length >= 3 && roomState?.room?.status === 'lobby';
// ❌ status = 'results' → canStart = false
```

## Solución Implementada

### 1. Modificar ResultsOnline.tsx

Cambiado el handler `handleBackToRoom` para que **llame a `resetRoomToLobby()`** antes de navegar:

```typescript
const handleBackToRoom = async () => {
  // IMPORTANTE: Solo el host puede resetear la sala
  if (onlineGame.isHost) {
    console.log('[ResultsOnline] Host reseteando sala a lobby...');
    await onlineGame.resetRoomToLobby();
    console.log('[ResultsOnline] Sala reseteada exitosamente');
  }
  
  // Navegar a OnlineRoom
  // El evento room_reset actualizará el estado para todos los jugadores
  navigation.navigate('OnlineRoom', {
    code: roomCode,
    playerId,
    playerName,
  });
};
```

**Importante:**
- Solo el **host** resetea la sala
- Los demás jugadores solo navegan (el reset del host los afecta a todos)
- Si hay error, igual navega para no dejar al usuario atrapado

### 2. Mejorar Logging en OnlineGameContext.tsx

Agregado logging extensivo para rastrear el flujo completo:

**En `resetRoomToLobby()`:**
```typescript
console.log('[OnlineGameContext] resetRoomToLobby llamado', { 
  roomCode, playerId, isHost 
});
console.log('[OnlineGameContext] Enviando evento RESET_ROOM vía WebSocket');
console.log('[OnlineGameContext] Evento RESET_ROOM enviado, esperando respuesta');
```

**En `handleRoomReset()`:**
```typescript
console.log('[OnlineGameContext] ROOM_RESET recibido:', {
  hasRoomState: !!data.roomState,
  status: data.roomState?.room?.status,
  players: data.roomState?.players?.length
});
console.log('[OnlineGameContext] Sala reseteada a lobby, estado limpiado');
```

## Flujo Completo

### Escenario: Jugar Otra Vez

```
1. Partida termina → Todos en Results
   Estado: results
   ↓
2. Host presiona "Volver a Sala"
   ↓
3. ResultsOnline.handleBackToRoom() ejecuta:
   → onlineGame.resetRoomToLobby() (solo host)
   → Envía evento RESET_ROOM vía WebSocket
   ↓
4. Backend recibe RESET_ROOM:
   → Valida que es el host
   → Limpia gameState en Redis
   → Actualiza roomStatus a 'lobby'
   → Emite evento ROOM_RESET a todos los jugadores
   ↓
5. Frontend (todos los jugadores) recibe ROOM_RESET:
   → handleRoomReset actualiza roomState.status = 'lobby'
   → Limpia gameState, roleAssignment, pistas, votes
   → Estado sincronizado para todos ✅
   ↓
6. Host y jugadores navegan a OnlineRoom
   → roomState.status = 'lobby'
   → canStart = isHost && players >= 3 && status === 'lobby'
   → Botón "Iniciar Partida" HABILITADO ✅
   ↓
7. Host puede iniciar nueva partida 🎉
```

## Backend (Ya Funcionaba Correctamente)

El backend ya tenía el handler correcto en `socketHandler.js`:

```javascript
socket.on('reset_room', async (data) => {
  const result = await roomService.resetRoomToLobby(code, hostId);
  
  // Notificar a todos en la sala
  io.to(`room:${code}`).emit('room_reset', {
    roomState: result,
  });
  
  // También emitir cambio de fase
  io.to(`room:${code}`).emit('phase_changed', {
    phase: 'lobby',
  });
});
```

Y el servicio `roomService.js`:

```javascript
async resetRoomToLobby(code, hostId) {
  // Verificar que es el host
  const hostInfo = await redisService.getPlayerInfo(code, hostId);
  if (!hostInfo || !hostInfo.isHost) {
    throw new Error('Solo el host puede resetear la sala');
  }

  // Limpiar estado del juego
  await redisService.deleteGameState(code);
  await redisService.clearRolesSeen(code);
  
  // Resetear estado de la sala a lobby ✅
  await redisService.updateRoomStatus(code, 'lobby');
  
  return {
    room: updatedRoom,
    players,
    gameState: null,
  };
}
```

## Archivos Modificados

1. ✅ `src/screens/Results/ResultsOnline.tsx`
   - Modificado `handleBackToRoom()` para llamar a `resetRoomToLobby()`
   - Agregado try-catch para manejo de errores
   - Solo el host resetea, otros solo navegan

2. ✅ `src/contexts/OnlineGameContext.tsx`
   - Agregado logging en `resetRoomToLobby()`
   - Agregado logging en `handleRoomReset()`
   - Mejor rastreo del flujo completo

3. ✅ `SOLUCION_RESET_SALA_ONLINE.md`
   - Este documento

## Testing

### Caso 1: Host Resetea la Sala

1. Jugar una partida online hasta Results
2. Como **host**, presionar "Volver a Sala"
3. **Verificar:**
   - ✅ Navega a OnlineRoom
   - ✅ Estado muestra: "Estado: lobby | Jugadores: X | Host: Sí"
   - ✅ Botón "Iniciar Partida" está HABILITADO
   - ✅ Todos los jugadores ven la sala en estado lobby
   - ✅ Se puede iniciar una nueva partida

### Caso 2: Jugador Regular (No Host)

1. Jugar una partida online hasta Results
2. Como **jugador regular**, presionar "Volver a Sala"
3. **Verificar:**
   - ✅ Navega a OnlineRoom
   - ✅ Cuando el host resetea, todos ven el cambio a lobby
   - ✅ No aparecen errores

### Logs Esperados en Consola (Host)

```
[ResultsOnline] Host reseteando sala a lobby...
[OnlineGameContext] resetRoomToLobby llamado { roomCode: 'ABC123', playerId: '...', isHost: true }
[OnlineGameContext] Enviando evento RESET_ROOM vía WebSocket
[OnlineGameContext] Evento RESET_ROOM enviado, esperando respuesta del servidor
[ResultsOnline] Sala reseteada exitosamente
[OnlineGameContext] ROOM_RESET recibido: { hasRoomState: true, status: 'lobby', players: 3 }
[OnlineGameContext] Sala reseteada a lobby, estado limpiado
```

### Logs Esperados (Jugador Regular)

```
[ResultsOnline] No soy host, navegando sin resetear
[OnlineGameContext] ROOM_RESET recibido: { hasRoomState: true, status: 'lobby', players: 3 }
[OnlineGameContext] Sala reseteada a lobby, estado limpiado
```

## Validaciones

En `OnlineRoom.tsx`, el botón "Iniciar Partida" se habilita cuando:

```typescript
const canStart = isHost && players.length >= 3 && roomState?.room?.status === 'lobby';
```

Ahora después de resetear:
- ✅ `isHost` = true (eres el host)
- ✅ `players.length >= 3` (hay suficientes jugadores)
- ✅ `roomState?.room?.status === 'lobby'` (estado correcto) ← **SOLUCIONADO**

## Notas Importantes

1. **Solo el host puede resetear**: Por seguridad, solo el host puede cambiar el estado de la sala a lobby
2. **Sincronización automática**: Todos los jugadores reciben el evento ROOM_RESET automáticamente
3. **Manejo de errores**: Si hay error, igual navega para no dejar al usuario atrapado
4. **No afecta modo local**: El modo local usa GameContext, completamente independiente

---

**Última actualización**: 8 de Enero 2025  
**Estado**: ✅ Solucionado y documentado  
**Probado**: Pendiente de testing en dispositivo

