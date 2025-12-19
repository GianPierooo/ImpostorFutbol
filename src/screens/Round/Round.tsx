import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Card, Chip, ProgressBar } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useGame } from '../../game';
import { useGameMode } from '../../hooks/useGameMode';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode, isOnline, onlineGame, localGame } = useGameMode();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  // Usar el contexto apropiado según el modo
  const gameState = isOnline ? onlineGame?.gameState : localGame?.gameState;
  const roleAssignment = isOnline ? onlineGame?.roleAssignment : localGame?.roleAssignment;
  const pistas = isOnline ? onlineGame?.pistas || [] : localGame?.pistas || [];
  const currentTurn = isOnline ? onlineGame?.gameState?.currentTurn : localGame?.currentTurn;
  const currentPlayerIndex = isOnline ? onlineGame?.gameState?.currentPlayerIndex : localGame?.currentPlayerIndex;
  const getPlayerInfo = isOnline 
    ? (playerId: string) => onlineGame?.getPlayerInfo(playerId) || null
    : (playerId: string) => localGame?.getPlayerInfo(playerId) || null;
  const getCurrentPlayer = isOnline
    ? () => onlineGame?.getCurrentPlayer() || null
    : () => localGame?.getCurrentPlayer() || null;
  const getRoundPistas = isOnline
    ? (round: number) => onlineGame?.pistas.filter(p => p.round === round) || []
    : (round: number) => localGame?.getRoundPistas(round) || [];
  /**
   * Verifica si todos los jugadores dieron su pista en una ronda
   * 
   * IMPORTANTE: En modo online, debe usar roleAssignment.players como fuente de verdad
   * porque ese es el orden original de los jugadores cuando se asignaron los roles.
   * 
   * @param {number} round - Número de ronda a verificar
   * @returns {boolean} true si todos los jugadores dieron su pista, false en caso contrario
   */
  const allPlayersGavePista = isOnline
    ? (round: number) => {
        if (!onlineGame || !roleAssignment) return false;
        
        // Obtener todas las pistas de la ronda especificada
        const roundPistas = onlineGame.pistas.filter((p) => p.round === round);
        
        // Crear un Set con los IDs de los jugadores que dieron pista
        const playersWhoGavePista = new Set(roundPistas.map((p) => p.playerId));
        
        // IMPORTANTE: Usar roleAssignment.players como fuente de verdad
        // porque ese es el orden original y todos los jugadores deben estar ahí
        // onlineGame.players puede tener jugadores desconectados, pero todos deben dar pista
        const currentPlayers = roleAssignment.players;
        
        // Verificar que todos los jugadores en roleAssignment.players dieron su pista
        return currentPlayers.every((p: Player) => playersWhoGavePista.has(p.id));
      }
    : (round: number) => localGame?.allPlayersGavePista(round) || false;
  const canFinishRound = isOnline
    ? () => {
        if (!gameState || !roleAssignment) return false;
        return allPlayersGavePista(gameState.currentRound);
      }
    : () => localGame?.canFinishRound() || false;

  const [pistaText, setPistaText] = useState('');
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const currentPlayer = getCurrentPlayer();
  const currentPlayerInfo = viewingPlayerId ? getPlayerInfo(viewingPlayerId) : (currentPlayer ? getPlayerInfo(currentPlayer.id) : null);
  const roundPistas = gameState ? getRoundPistas(gameState.currentRound) : [];

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    return getRoundColorScheme(gameState.currentRound, gameState.maxRounds);
  }, [gameState?.currentRound, gameState?.maxRounds]);
  /**
   * MODO ONLINE: Verificar si es el turno del jugador actual
   * 
   * IMPORTANTE: El orden de los jugadores debe ser consistente:
   * - roleAssignment.players tiene el orden original de asignación de roles
   * - onlineGame.players tiene la lista actual (puede cambiar si alguien se desconecta)
   * - gameState.currentPlayerIndex apunta a la posición en roleAssignment.players
   * 
   * Flujo de validación:
   * 1. Obtener la lista de jugadores (preferir onlineGame.players, fallback a roleAssignment.players)
   * 2. Validar que currentPlayerIndex esté dentro del rango
   * 3. Obtener el jugador en la posición currentPlayerIndex
   * 4. Comparar si ese jugador es el jugador actual (onlineGame.playerId)
   * 
   * @returns {boolean} true si es el turno del jugador actual, false en caso contrario
   */
  const isMyTurn = isOnline && onlineGame 
    ? (() => {
        if (!gameState || !onlineGame.playerId || !roleAssignment) return false;
        
        // IMPORTANTE: Usar roleAssignment.players como fuente de verdad para el orden
        // porque currentPlayerIndex se basa en este orden
        // onlineGame.players puede tener jugadores desconectados, pero el orden debe ser el mismo
        const currentPlayers = roleAssignment.players;
        
        // Validar que el índice esté dentro del rango
        if (gameState.currentPlayerIndex >= currentPlayers.length || gameState.currentPlayerIndex < 0) {
          console.warn(`⚠️ currentPlayerIndex (${gameState.currentPlayerIndex}) fuera de rango (0-${currentPlayers.length - 1})`);
          return false;
        }
        
        // Obtener el jugador que debería estar escribiendo según currentPlayerIndex
        const currentPlayerFromState = currentPlayers[gameState.currentPlayerIndex];
        if (!currentPlayerFromState) {
          return false;
        }
        
        // Verificar si el jugador actual es el que tiene el turno
        return currentPlayerFromState.id === onlineGame.playerId;
      })()
    : true; // En modo local siempre es el turno del jugador actual

  /**
   * MODO ONLINE: Obtener el jugador que está escribiendo actualmente
   * 
   * IMPORTANTE: Debe usar roleAssignment.players para obtener el jugador correcto
   * porque currentPlayerIndex se basa en el orden de roleAssignment.players
   * 
   * @returns {Player | null} El jugador que tiene el turno actual, o null si hay error
   */
  const playerWriting = isOnline && roleAssignment && gameState && onlineGame
    ? (() => {
        // IMPORTANTE: Usar roleAssignment.players como fuente de verdad
        // porque currentPlayerIndex se basa en este orden
        const currentPlayers = roleAssignment.players;
        
        // Validar que el índice esté dentro del rango
        if (gameState.currentPlayerIndex >= currentPlayers.length || gameState.currentPlayerIndex < 0) {
          console.warn(`⚠️ currentPlayerIndex (${gameState.currentPlayerIndex}) fuera de rango (0-${currentPlayers.length - 1})`);
          return null;
        }
        
        // Retornar el jugador en la posición currentPlayerIndex
        return currentPlayers[gameState.currentPlayerIndex];
      })()
    : currentPlayer;

  // Reiniciar cuando cambia la ronda
  useEffect(() => {
    if (gameState && gameState.currentRound !== currentRound) {
      setCurrentRound(gameState.currentRound);
      setViewingPlayerId(null);
      setPistaText('');
    }
  }, [gameState, currentRound]);

  // Inicializar el jugador que está viendo la pantalla - optimizado para evitar delay
  useEffect(() => {
    if (currentPlayer) {
      // Actualizar inmediatamente sin verificar viewingPlayerId para evitar delay inicial
      if (viewingPlayerId !== currentPlayer.id) {
        setViewingPlayerId(currentPlayer.id);
      }
    }
  }, [currentPlayer?.id, viewingPlayerId]);

  // MODO ONLINE: Intentar cargar el estado si no está disponible
  const [loadingState, setLoadingState] = useState(false);
  useEffect(() => {
    if (isOnline && onlineGame?.roomCode && onlineGame?.loadGameState && (!gameState || !roleAssignment) && !loadingState) {
      setLoadingState(true);
      const loadState = async () => {
        try {
          // Usar loadGameState del contexto que ya carga roleAssignment
          await onlineGame.loadGameState();
        } catch (error) {
          console.error('Error loading game state in Round:', error);
        } finally {
          setLoadingState(false);
        }
      };
      loadState();
    }
  }, [isOnline, onlineGame?.roomCode, onlineGame?.loadGameState, gameState, roleAssignment, loadingState]);

  // Si no hay estado del juego después de intentar cargarlo, mostrar loading
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Cargando...
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            Cargando estado del juego...
          </Text>
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
        </View>
      </ScreenContainer>
    );
  }

  /**
   * Maneja el envío de una pista
   * 
   * Flujo:
   * 1. Valida que hay texto, jugador actual, gameState y roleAssignment
   * 2. En modo online, verifica que es el turno del jugador (isMyTurn)
   * 3. Envía la pista al backend (modo online) o al contexto local (modo local)
   * 4. Limpia el campo de texto
   * 5. En modo local, avanza automáticamente si todos dieron pista
   * 
   * IMPORTANTE: En modo online, el backend valida el turno y actualiza currentPlayerIndex.
   * El frontend solo muestra/oculta el input según isMyTurn.
   */
  const handleAddPista = async () => {
    if (!pistaText.trim() || !currentPlayer || !gameState || !roleAssignment) return;

    // En modo online, verificar que es el turno del jugador ANTES de intentar enviar
    // Esto previene envíos fuera de turno y mejora la UX
    if (isOnline && !isMyTurn) {
      console.warn('⚠️ Intento de enviar pista fuera de turno - bloqueado en frontend');
      return;
    }

    try {
      // Agregar pista según el modo
      if (isOnline && onlineGame) {
        // MODO ONLINE: El backend valida el turno y actualiza currentPlayerIndex
        // Si no es el turno del jugador, el backend lanzará un error
        await onlineGame.addPista(pistaText);
        // El WebSocket actualizará el estado automáticamente
      } else if (localGame) {
        // MODO LOCAL: Agregar pista y avanzar turno localmente
        localGame.addPista(pistaText, currentPlayer.id);
        localGame.nextTurn();
      }
      
      // Limpiar el campo de texto después de enviar
      setPistaText('');
    } catch (error: any) {
      console.error('Error adding pista:', error);
      
      // No mostrar error al usuario si es rate limiting (429) - es temporal
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit alcanzado al enviar pista - reintentando más tarde');
        return;
      }
      
      // Para otros errores, podrías mostrar un mensaje al usuario
      // Por ejemplo: "No es tu turno" o "Error al enviar la pista"
      return;
    }
    
    // MODO LOCAL: Si todos dieron pista, avanzar automáticamente
    // En modo online, el host controla la navegación manualmente
    if (!isOnline) {
      const roundPistasAfter = getRoundPistas(gameState.currentRound);
      const playersWhoGavePista = new Set(roundPistasAfter.map((p) => p.playerId));
      const allGavePista = roleAssignment.players.every((p: Player) => playersWhoGavePista.has(p.id));
      
      if (allGavePista) {
        // Si es la última ronda configurada, ir directo a votación
        if (gameState.maxRounds !== null && gameState.currentRound === gameState.maxRounds) {
          localGame?.finishRound();
          navigation.navigate('Voting', { mode: 'local' });
        } else {
          // SIEMPRE ir a Discussion después de cada ronda (excepto la última)
          navigation.navigate('Discussion', { mode: 'local' });
        }
      }
    }
  };


  return (
    <ScreenContainer backgroundColor={roundColors?.background}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con información de ronda */}
          <View style={styles.header}>
            <Chip 
              icon="timer" 
              style={[
                styles.roundChip,
                { backgroundColor: roundColors?.accent || theme.colors.primary }
              ]}
              textStyle={styles.chipText}
            >
              Ronda {gameState.currentRound} {gameState.maxRounds ? `de ${gameState.maxRounds}` : '(sin límite)'}
            </Chip>
            <Text variant="headlineSmall" style={styles.title}>
              Turno de {playerWriting?.name || 'Cargando...'}
            </Text>
            <ProgressBar 
              progress={
                roleAssignment?.players && roleAssignment.players.length > 0
                  ? Math.min(1, Math.max(0, roundPistas.length / roleAssignment.players.length))
                  : 0
              } 
              color={roundColors?.accent || theme.colors.primary} 
              style={styles.progressBar} 
            />
          </View>

          {/* Información del jugador actual */}
          {currentPlayerInfo && (
            <Card 
              style={[
                styles.infoCard,
                roundColors && {
                  borderColor: roundColors.accent,
                  backgroundColor: roundColors.surface,
                }
              ]} 
              mode="elevated"
            >
              <Card.Content style={styles.infoCardContent}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.sm, flexWrap: 'wrap' }}>
                  <AnimatedEmoji emoji="🕵️" animation="pulse" size={28} duration={3500} />
                  <Text variant="titleLarge" style={styles.instructionTitle}>
                    {' '}Busquemos al <Text style={styles.impostorText}>impostor</Text>
                  </Text>
                </View>
                <Text variant="bodyMedium" style={styles.instructionText}>
                  Da pistas sobre la palabra secreta sin decirla directamente. Observa las pistas de los demás para descubrir quién es el <Text style={styles.impostorText}>impostor</Text>.
                </Text>
              </Card.Content>
            </Card>
          )}

          {/* Input para pista */}
          {isOnline && !isMyTurn ? (
            // MODO ONLINE: No es el turno del jugador - SOLO mostrar mensaje de espera
            <Card style={styles.waitingCard} mode="outlined">
              <Card.Content style={styles.waitingContent}>
                <Text variant="displaySmall" style={styles.waitingEmoji}>
                  ⏳
                </Text>
                <Text variant="bodyLarge" style={styles.waitingText}>
                  {playerWriting?.name} está escribiendo su pista...
                </Text>
                <Text variant="bodyMedium" style={styles.waitingSubtext}>
                  Espera tu turno para escribir
                </Text>
              </Card.Content>
            </Card>
          ) : (
            // Es el turno del jugador (modo local o online cuando es su turno)
            currentPlayer && (
              <Card style={styles.inputCard} mode="elevated">
                <Card.Content style={styles.inputCardContent}>
                  <Text variant="titleMedium" style={styles.inputLabel}>
                    Tu pista
                  </Text>
                  <TextInput
                    mode="outlined"
                    placeholder="Escribe tu pista aquí..."
                    placeholderTextColor={theme.colors.textSecondary}
                    value={pistaText}
                    onChangeText={setPistaText}
                    multiline
                    numberOfLines={4}
                    maxLength={20}
                    style={styles.input}
                    outlineColor={theme.colors.border}
                    activeOutlineColor={theme.colors.primary}
                    theme={{ colors: { text: theme.colors.text } }}
                    editable={isMyTurn || !isOnline}
                  />
                  <View style={styles.charCount}>
                    <Text variant="bodySmall" style={styles.charCountText}>
                      {pistaText.length} / 20
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={handleAddPista}
                    disabled={!pistaText.trim() || (isOnline && !isMyTurn)}
                    style={styles.sendButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon="send"
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.textLight}
                  >
                    Enviar Pista
                  </Button>
                </Card.Content>
              </Card>
            )
          )}

          {/* Botón para host avanzar a Discussion cuando todos dieron pista (solo modo online) */}
          {isOnline && onlineGame?.isHost && canFinishRound() && (
            <View style={styles.hostActions}>
              <Card style={styles.hostCard} mode="elevated">
                <Card.Content style={styles.hostCardContent}>
                  <Text variant="titleMedium" style={styles.hostCardTitle}>
                    ✅ Todos los jugadores han dado su pista
                  </Text>
                  <Text variant="bodyMedium" style={styles.hostCardText}>
                    Como host, puedes avanzar a la discusión
                  </Text>
                  <Button
                    mode="contained"
                    onPress={async () => {
                      if (onlineGame) {
                        await onlineGame.changePhase('discussion');
                      }
                    }}
                    style={styles.continueButton}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon="arrow-forward"
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.textLight}
                  >
                    Ir a Discusión
                  </Button>
                </Card.Content>
              </Card>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  roundChip: {
    marginBottom: theme.spacing.sm,
  },
  chipText: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.text,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: theme.spacing.sm,
    maxWidth: 300,
  },
  infoCard: {
    width: '100%',
    marginBottom: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  infoCardContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  instructionTitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    fontSize: 18,
    color: theme.colors.text,
  },
  instructionText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  inputCard: {
    width: '100%',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  inputCardContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  inputLabel: {
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
  },
  input: {
    marginBottom: theme.spacing.xs,
  },
  waitingCard: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.surface + '80',
    borderColor: theme.colors.border,
  },
  waitingContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  waitingEmoji: {
    marginBottom: theme.spacing.md,
    fontSize: 48,
  },
  waitingText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  waitingSubtext: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  charCount: {
    alignItems: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  charCountText: {
    color: theme.colors.textSecondary,
  },
  sendButton: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  hostActions: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  hostCard: {
    backgroundColor: theme.colors.primaryContainer,
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  hostCardContent: {
    alignItems: 'center',
  },
  hostCardTitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },
  hostCardText: {
    marginBottom: theme.spacing.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  continueButton: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '700',
  },
});
