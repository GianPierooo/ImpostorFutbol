/**
 * Pantalla de Ronda - MODO LOCAL
 * 
 * IMPORTANTE: Este archivo SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, Button, TextInput, Card, Chip, ProgressBar } from 'react-native-paper';
import { ScreenContainer } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundLocalScreen: React.FC<Props> = ({ navigation }) => {
  const { gameState, roleAssignment, addPista, nextTurn, currentPlayerIndex, pistas, getCurrentPlayer } = useGame();
  const [pistaText, setPistaText] = useState('');

  // IMPORTANTE: NO usar estado local para currentRound, usar directamente gameState.currentRound
  // Esto evita problemas de sincronización al navegar entre pantallas
  const currentRound = gameState?.currentRound || 1;

  // Obtener el jugador actual que debe dar la pista
  const currentPlayer = useMemo(() => {
    if (!roleAssignment) return null;
    
    // Usar getCurrentPlayer del contexto o currentPlayerIndex directamente
    const player = getCurrentPlayer();
    if (player) return player;
    
    // Fallback: usar currentPlayerIndex directamente
    if (currentPlayerIndex === undefined || currentPlayerIndex < 0 || currentPlayerIndex >= roleAssignment.players.length) {
      return null;
    }
    
    return roleAssignment.players[currentPlayerIndex];
  }, [roleAssignment, currentPlayerIndex, getCurrentPlayer]);

  // Verificar si es el turno del jugador actual (en modo local, siempre es su turno cuando corresponde)
  const isMyTurn = currentPlayer !== null;

  // Obtener información del jugador actual
  const playerInfo = useMemo(() => {
    if (!currentPlayer || !roleAssignment || !gameState) return null;
    
    const player = roleAssignment.players.find(p => p.id === currentPlayer.id);
    if (!player) return null;
    
    // IMPORTANTE: Verificar si el jugador ya dio su pista en esta ronda
    // Usar gameState.currentRound directamente para asegurar sincronización correcta
    const hasGivenPista = pistas.some(
      (p) => p.playerId === currentPlayer.id && p.round === gameState.currentRound
    );
    
    return {
      player,
      role: player.role,
      secretWord: player.role === 'impostor' ? null : roleAssignment.secretWord,
      isImpostor: player.role === 'impostor',
      hasGivenPista,
    };
  }, [currentPlayer, roleAssignment, pistas, gameState]);

  // Obtener el esquema de colores para la ronda actual
  const colorScheme = getRoundColorScheme(currentRound, gameState?.maxRounds || null);

  // Manejar el envío de pista
  const handleSubmitPista = () => {
    if (!pistaText.trim() || !currentPlayer || !gameState) return;
    
    console.log(`[RoundLocal] Jugador ${currentPlayer.name} enviando pista en ronda ${gameState.currentRound}`);
    
    // IMPORTANTE: addPista recibe (text, playerId) según el contexto
    addPista(pistaText.trim(), currentPlayer.id);
    setPistaText('');
    
    // Avanzar al siguiente turno automáticamente
    // El contexto manejará la navegación a la siguiente fase si es necesario
    nextTurn();
  };

  // Navegar automáticamente a la fase de discusión cuando todos han dado su pista
  useEffect(() => {
    if (gameState?.phase === 'discussion') {
      console.log('[RoundLocal] Fase cambió a discussion, navegando automáticamente');
      // Pequeño delay para asegurar que el estado se actualice completamente
      setTimeout(() => {
        navigation.navigate('Discussion', { mode: 'local' });
      }, 100);
    }
  }, [gameState?.phase, navigation]);

  if (!gameState || !roleAssignment || !currentPlayer) {
    return (
      <ScreenContainer>
        <View style={styles.container}>
          <Text variant="headlineSmall">Cargando...</Text>
        </View>
      </ScreenContainer>
    );
  }

  // Obtener información del jugador actual
  const hasGivenPista = playerInfo?.hasGivenPista || false;

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header con información de la ronda */}
          <View style={styles.header}>
            <Text variant="displaySmall" style={[styles.roundTitle, { color: colorScheme.accent }]}>
              Ronda {currentRound}
            </Text>
            <Text variant="titleMedium" style={styles.roundSubtitle}>
              de {gameState.maxRounds}
            </Text>
          </View>

          {/* Barra de progreso */}
          <ProgressBar
            progress={currentRound / gameState.maxRounds}
            color={colorScheme.accent}
            style={styles.progressBar}
          />

          {/* Información del jugador actual */}
          <Card style={[styles.playerCard, { backgroundColor: colorScheme.surface }]} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.playerName}>
                {currentPlayer.name}
              </Text>
              <Text variant="bodyMedium" style={styles.playerInfo}>
                Es tu turno de dar una pista
              </Text>
            </Card.Content>
          </Card>

          {/* Input de pista */}
          {hasGivenPista ? (
            <Card style={styles.alreadySubmittedCard} mode="outlined">
              <Card.Content>
                <Text variant="bodyLarge" style={styles.alreadySubmittedText}>
                  ✅ Ya enviaste tu pista en esta ronda
                </Text>
                <Text variant="bodyMedium" style={styles.waitingText}>
                  Esperando a que los demás jugadores den su pista...
                </Text>
              </Card.Content>
            </Card>
          ) : (
            <View style={styles.inputContainer}>
              <TextInput
                label="Tu pista"
                value={pistaText}
                onChangeText={setPistaText}
                placeholder="Escribe tu pista aquí..."
                mode="outlined"
                multiline
                numberOfLines={3}
                style={styles.input}
                maxLength={200}
                right={<TextInput.Affix text={`${pistaText.length}/200`} />}
              />
              <Button
                mode="contained"
                onPress={handleSubmitPista}
                disabled={!pistaText.trim() || pistaText.trim().length < 3}
                style={[styles.submitButton, { backgroundColor: colorScheme.accent }]}
                contentStyle={styles.submitButtonContent}
                icon="send"
              >
                Enviar Pista
              </Button>
            </View>
          )}

          {/* Lista de pistas de esta ronda */}
          {pistas && pistas.length > 0 && (
            <View style={styles.pistasContainer}>
              <Text variant="titleMedium" style={styles.pistasTitle}>
                Pistas de esta ronda:
              </Text>
              {pistas
                .filter((p) => p.round === currentRound)
                .map((pista, index: number) => {
                  const pistaPlayer = roleAssignment.players.find(p => p.id === pista.playerId);
                  return (
                    <Card key={pista.id || index} style={styles.pistaCard} mode="outlined">
                      <Card.Content>
                        <View style={styles.pistaHeader}>
                          <Text variant="labelLarge" style={styles.pistaPlayerName}>
                            {pistaPlayer?.name || pista.playerName || 'Desconocido'}
                          </Text>
                          <Chip
                            compact
                            style={styles.pistaRoundChip}
                            textStyle={styles.pistaRoundChipText}
                          >
                            Ronda {pista.round}
                          </Chip>
                        </View>
                        <Text variant="bodyLarge" style={styles.pistaText}>
                          {pista.text}
                        </Text>
                      </Card.Content>
                    </Card>
                  );
                })}
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
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  roundTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roundSubtitle: {
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 24,
  },
  playerCard: {
    marginBottom: 16,
  },
  playerName: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playerInfo: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  pistasContainer: {
    marginTop: 16,
  },
  pistasTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pistaCard: {
    marginBottom: 12,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pistaPlayerName: {
    fontWeight: 'bold',
    flex: 1,
  },
  pistaRoundChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  pistaRoundChipText: {
    fontSize: 12,
  },
  pistaText: {
    color: theme.colors.text,
  },
  alreadySubmittedCard: {
    marginBottom: 24,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.success,
    borderWidth: 2,
  },
  alreadySubmittedText: {
    textAlign: 'center',
    color: theme.colors.success,
    fontWeight: '600',
    marginBottom: 8,
  },
  waitingText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

