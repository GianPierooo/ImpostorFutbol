import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
  const allPlayersGavePista = isOnline
    ? (round: number) => {
        if (!onlineGame || !roleAssignment) return false;
        const roundPistas = onlineGame.pistas.filter((p) => p.round === round);
        const playersWhoGavePista = new Set(roundPistas.map((p) => p.playerId));
        return roleAssignment.players.every((p: Player) => playersWhoGavePista.has(p.id));
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
  // MODO ONLINE: Verificar si es el turno del jugador actual
  const isMyTurn = isOnline && onlineGame 
    ? (() => {
        if (!gameState || !onlineGame.playerId || !roleAssignment) return false;
        const currentPlayerFromState = roleAssignment.players[gameState.currentPlayerIndex];
        return currentPlayerFromState?.id === onlineGame.playerId;
      })()
    : true; // En modo local siempre es el turno del jugador actual

  // MODO ONLINE: Obtener el jugador que está escribiendo actualmente
  const playerWriting = isOnline && roleAssignment && gameState
    ? roleAssignment.players[gameState.currentPlayerIndex]
    : currentPlayer;

  // Reiniciar cuando cambia la ronda
  useEffect(() => {
    if (gameState && gameState.currentRound !== currentRound) {
      setCurrentRound(gameState.currentRound);
      setViewingPlayerId(null);
      setPistaText('');
    }
  }, [gameState, currentRound]);

  // Inicializar el jugador que está viendo la pantalla
  useEffect(() => {
    if (currentPlayer && !viewingPlayerId) {
      setViewingPlayerId(currentPlayer.id);
    }
  }, [currentPlayer, viewingPlayerId]);

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo cargar el estado del juego. Vuelve al inicio.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="home"
          >
            Volver al Inicio
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  const handleAddPista = async () => {
    if (!pistaText.trim() || !currentPlayer || !gameState || !roleAssignment) return;

    // Verificar si este es el último jugador que falta dar pista
    const roundPistasBefore = getRoundPistas(gameState.currentRound);
    const playersWhoGavePista = new Set(roundPistasBefore.map((p) => p.playerId));
    const missingPlayers = roleAssignment.players.filter((p: Player) => !playersWhoGavePista.has(p.id));
    const isLastPlayer = missingPlayers.length === 1 && missingPlayers[0].id === currentPlayer.id;
    
    // Agregar pista según el modo
    if (isOnline && onlineGame) {
      await onlineGame.addPista(pistaText);
    } else if (localGame) {
      localGame.addPista(pistaText, currentPlayer.id);
      localGame.nextTurn();
    }
    
    setPistaText('');
    
    // Si todos dieron pista, avanzar automáticamente (solo en modo local)
    // En modo online, el host controla la navegación
    if (!isOnline && isLastPlayer) {
      // Esperar un momento para que se actualice el estado
      setTimeout(() => {
        // Si es la última ronda configurada, ir directo a votación
        if (gameState.maxRounds !== null && gameState.currentRound === gameState.maxRounds) {
          localGame?.finishRound();
          navigation.navigate('Voting', { mode: 'local' });
        } else {
          // SIEMPRE ir a Discussion después de cada ronda (excepto la última)
          navigation.navigate('Discussion', { mode: 'local' });
        }
      }, 200);
      return;
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
              progress={roundPistas.length / (roleAssignment?.players.length || 1)} 
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
            // MODO ONLINE: No es el turno del jugador
            <Card style={styles.inputCard} mode="elevated">
              <Card.Content style={styles.inputCardContent}>
                <Text variant="titleMedium" style={styles.inputLabel}>
                  Esperando turno
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
                  outlineColor={roundColors?.border || theme.colors.border}
                  activeOutlineColor={roundColors?.accent || theme.colors.primary}
                  theme={{ colors: { text: theme.colors.text } }}
                />
                <View style={styles.charCount}>
                  <Text variant="bodySmall" style={styles.charCountText}>
                    {pistaText.length} / 20
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={handleAddPista}
                  disabled={!pistaText.trim()}
                  style={styles.sendButton}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="send"
                  buttonColor={roundColors?.accent || theme.colors.primary}
                  textColor={theme.colors.textLight}
                >
                  Enviar Pista
                </Button>
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
