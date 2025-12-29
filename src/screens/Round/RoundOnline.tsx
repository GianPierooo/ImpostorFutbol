/**
 * Pantalla de Ronda - MODO ONLINE
 * 
 * IMPORTANTE: Este archivo SOLO maneja el modo online.
 * No tiene ninguna dependencia del modo offline.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput, Card, Chip, ProgressBar } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useOnlineGame } from '../../contexts';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundOnlineScreen: React.FC<Props> = ({ navigation, route }) => {
  // Usar SOLO el contexto online
  const onlineGame = useOnlineGame();
  
  // Navegación automática online
  useOnlineNavigation();
  
  const gameState = onlineGame.gameState;
  const roleAssignment = onlineGame.roleAssignment;
  const pistas = onlineGame.pistas || [];
  const getRoundPistas = (round: number) => onlineGame.pistas.filter(p => p.round === round) || [];
  const currentPlayer = onlineGame.getCurrentPlayer();

  const [pistaText, setPistaText] = useState('');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [loadingState, setLoadingState] = useState(false);

  const roundPistas = gameState ? getRoundPistas(gameState.currentRound) : [];

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    return getRoundColorScheme(gameState.currentRound, gameState.maxRounds);
  }, [gameState?.currentRound, gameState?.maxRounds]);


  /**
   * Verifica si es el turno del jugador actual
   */
  const isMyTurn = useMemo(() => {
    if (!gameState || !onlineGame.playerId || !roleAssignment) return false;
    
    const currentPlayers = roleAssignment.players;
    
    if (gameState.currentPlayerIndex >= currentPlayers.length || gameState.currentPlayerIndex < 0) {
      console.warn(`⚠️ currentPlayerIndex (${gameState.currentPlayerIndex}) fuera de rango (0-${currentPlayers.length - 1})`);
      return false;
    }
    
    const currentPlayerFromState = currentPlayers[gameState.currentPlayerIndex];
    if (!currentPlayerFromState) {
      return false;
    }
    
    return currentPlayerFromState.id === onlineGame.playerId;
  }, [gameState, onlineGame.playerId, roleAssignment]);

  /**
   * Obtener el jugador que está escribiendo actualmente
   */
  const playerWriting = useMemo(() => {
    if (!roleAssignment || !gameState) return null;
    
    const currentPlayers = roleAssignment.players;
    
    if (gameState.currentPlayerIndex >= currentPlayers.length || gameState.currentPlayerIndex < 0) {
      console.warn(`⚠️ currentPlayerIndex (${gameState.currentPlayerIndex}) fuera de rango (0-${currentPlayers.length - 1})`);
      return null;
    }
    
    return currentPlayers[gameState.currentPlayerIndex];
  }, [roleAssignment, gameState]);

  // Reiniciar cuando cambia la ronda
  useEffect(() => {
    if (gameState && gameState.currentRound !== currentRound) {
      setCurrentRound(gameState.currentRound);
      setPistaText('');
    }
  }, [gameState, currentRound]);

  // Intentar cargar el estado si no está disponible
  useEffect(() => {
    if (onlineGame?.roomCode && onlineGame?.loadGameState && (!gameState || !roleAssignment) && !loadingState) {
      setLoadingState(true);
      const loadState = async () => {
        try {
          await onlineGame.loadGameState();
        } catch (error) {
          console.error('Error loading game state in Round:', error);
        } finally {
          setLoadingState(false);
        }
      };
      loadState();
    }
  }, [onlineGame?.roomCode, onlineGame?.loadGameState, gameState, roleAssignment, loadingState]);

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

  const currentPlayerInfo = currentPlayer ? onlineGame.getPlayerInfo(currentPlayer.id) : null;

  /**
   * Maneja el envío de una pista en modo online
   */
  const handleAddPista = async () => {
    if (!pistaText.trim() || !currentPlayer || !gameState || !roleAssignment) return;

    // Verificar que es el turno del jugador
    if (!isMyTurn) {
      console.warn('⚠️ Intento de enviar pista fuera de turno - bloqueado en frontend');
      return;
    }

    try {
      // El backend valida el turno y actualiza currentPlayerIndex
      await onlineGame.addPista(pistaText);
      // El WebSocket actualizará el estado automáticamente
      
      // Limpiar el campo de texto después de enviar
      setPistaText('');
    } catch (error: any) {
      console.error('Error adding pista:', error);
      
      // No mostrar error al usuario si es rate limiting (429) - es temporal
      if (error.response?.status === 429) {
        console.warn('⚠️ Rate limit alcanzado al enviar pista - reintentando más tarde');
        return;
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
          {!isMyTurn ? (
            // No es el turno del jugador - mostrar mensaje de espera
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
            // Es el turno del jugador
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
                    editable={isMyTurn}
                  />
                  <View style={styles.charCount}>
                    <Text variant="bodySmall" style={styles.charCountText}>
                      {pistaText.length} / 20
                    </Text>
                  </View>
                  <Button
                    mode="contained"
                    onPress={handleAddPista}
                    disabled={!pistaText.trim() || !isMyTurn}
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

