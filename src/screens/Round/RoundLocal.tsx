/**
 * Pantalla de Ronda - MODO LOCAL
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, Card, Chip, ProgressBar } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundLocalScreen: React.FC<Props> = ({ navigation }) => {
  // Usar SOLO el contexto local
  const localGame = useGame();
  
  const gameState = localGame.gameState;
  const roleAssignment = localGame.roleAssignment;
  const pistas = localGame.pistas || [];
  const currentPlayer = localGame.getCurrentPlayer();
  const getRoundPistas = (round: number) => localGame.getRoundPistas(round) || [];
  const allPlayersGavePista = (round: number) => localGame.allPlayersGavePista(round) || false;
  const canFinishRound = () => localGame.canFinishRound() || false;

  const [pistaText, setPistaText] = useState('');
  const [currentRound, setCurrentRound] = useState<number>(1);

  const currentPlayerInfo = currentPlayer ? localGame.getPlayerInfo(currentPlayer.id) : null;
  const roundPistas = gameState ? getRoundPistas(gameState.currentRound) : [];

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    return getRoundColorScheme(gameState.currentRound, gameState.maxRounds);
  }, [gameState?.currentRound, gameState?.maxRounds]);

  // Verificar si el jugador actual ya dio pista en esta ronda
  const playerAlreadyGavePista = useMemo(() => {
    if (!gameState || !currentPlayer) return false;
    return roundPistas.some(p => p.playerId === currentPlayer.id);
  }, [gameState, currentPlayer, roundPistas]);

  // Reiniciar cuando cambia la ronda
  useEffect(() => {
    if (gameState && gameState.currentRound !== currentRound) {
      setCurrentRound(gameState.currentRound);
      setPistaText('');
    }
  }, [gameState, currentRound]);

  // Avanzar automáticamente al siguiente jugador si el actual ya dio pista
  useEffect(() => {
    if (gameState && currentPlayer && playerAlreadyGavePista) {
      const timeoutId = setTimeout(() => {
        localGame.nextTurn();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [gameState, currentPlayer, playerAlreadyGavePista, localGame]);

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo cargar el estado del juego. Vuelve al lobby.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Lobby')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="arrow-left"
          >
            Volver al Lobby
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  /**
   * Maneja el envío de una pista en modo local
   */
  const handleAddPista = () => {
    if (!pistaText.trim() || !currentPlayer || !gameState || !roleAssignment) return;

    // Verificar que el jugador no haya dado ya una pista en esta ronda
    if (playerAlreadyGavePista) {
      console.warn(`⚠️ El jugador ${currentPlayer.name} ya dio una pista en la ronda ${gameState.currentRound}`);
      return;
    }

    // Agregar pista y avanzar turno
    localGame.addPista(pistaText, currentPlayer.id);
    localGame.nextTurn();
    
    // Limpiar el campo de texto
    setPistaText('');

    // Si todos dieron pista, avanzar automáticamente
    const roundPistasAfter = getRoundPistas(gameState.currentRound);
    const playersWhoGavePista = new Set(roundPistasAfter.map((p) => p.playerId));
    const allGavePista = roleAssignment.players.every((p: Player) => playersWhoGavePista.has(p.id));
    
    if (allGavePista) {
      // Si es la última ronda configurada, ir directo a votación
      if (gameState.maxRounds !== null && gameState.currentRound === gameState.maxRounds) {
        localGame.finishRound();
        navigation.navigate('Voting', { mode: 'local' });
      } else {
        // Ir a Discussion después de cada ronda (excepto la última)
        navigation.navigate('Discussion', { mode: 'local' });
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
              Turno de {currentPlayer?.name || 'Cargando...'}
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
          {playerAlreadyGavePista ? (
            // El jugador ya dio pista - mostrar mensaje de espera
            <Card style={styles.waitingCard} mode="outlined">
              <Card.Content style={styles.waitingContent}>
                <Text variant="displaySmall" style={styles.waitingEmoji}>
                  ⏳
                </Text>
                <Text variant="bodyLarge" style={styles.waitingText}>
                  Ya diste tu pista en esta ronda. Esperando a los demás jugadores...
                </Text>
                <Text variant="bodyMedium" style={styles.waitingSubtext}>
                  El juego avanzará automáticamente cuando todos den su pista
                </Text>
              </Card.Content>
            </Card>
          ) : (
            // El jugador puede dar pista
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
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.textLight}
                  >
                    Enviar Pista
                  </Button>
                </Card.Content>
              </Card>
            )
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
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
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

