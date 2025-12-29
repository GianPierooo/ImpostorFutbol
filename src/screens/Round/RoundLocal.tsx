/**
 * Pantalla de Ronda - MODO LOCAL
 * 
 * IMPORTANTE: Este archivo SOLO maneja el modo local.
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
  const { gameState, roleAssignment, addPista, nextTurn } = useGame();
  const [pistaText, setPistaText] = useState('');
  const [currentRound, setCurrentRound] = useState(1);

  // Actualizar la ronda actual cuando cambia el gameState
  useEffect(() => {
    if (gameState?.currentRound) {
      setCurrentRound(gameState.currentRound);
    }
  }, [gameState?.currentRound]);

  // Obtener el jugador actual que debe dar la pista
  const currentPlayer = useMemo(() => {
    if (!gameState || !roleAssignment) return null;
    
    const playerIndex = gameState.currentPlayerIndex;
    if (playerIndex === undefined || playerIndex < 0 || playerIndex >= roleAssignment.players.length) {
      return null;
    }
    
    return roleAssignment.players[playerIndex];
  }, [gameState, roleAssignment]);

  // Verificar si es el turno del jugador actual (en modo local, siempre es su turno cuando corresponde)
  const isMyTurn = currentPlayer !== null;

  // Obtener información del jugador actual
  const playerInfo = useMemo(() => {
    if (!currentPlayer || !roleAssignment) return null;
    
    const player = roleAssignment.players.find(p => p.id === currentPlayer.id);
    if (!player) return null;
    
    return {
      player,
      role: player.role,
      secretWord: roleAssignment.secretWord,
      isImpostor: player.role === 'impostor',
    };
  }, [currentPlayer, roleAssignment]);

  // Obtener el esquema de colores para la ronda actual
  const colorScheme = getRoundColorScheme(currentRound);

  // Manejar el envío de pista
  const handleSubmitPista = () => {
    if (!pistaText.trim() || !currentPlayer) return;
    
    addPista(currentPlayer.id, pistaText.trim());
    setPistaText('');
    
    // Avanzar al siguiente turno automáticamente
    // El contexto manejará la navegación a la siguiente fase si es necesario
    nextTurn();
  };

  // Navegar automáticamente a la fase de discusión cuando todos han dado su pista
  useEffect(() => {
    if (gameState?.phase === 'discussion') {
      navigation.navigate('Discussion', { mode: 'local' });
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
  const myRole = playerInfo?.role;
  const mySecretWord = playerInfo?.secretWord;
  const isImpostor = playerInfo?.isImpostor || false;

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
            <Text variant="displaySmall" style={[styles.roundTitle, { color: colorScheme.primary }]}>
              Ronda {currentRound}
            </Text>
            <Text variant="titleMedium" style={styles.roundSubtitle}>
              de {gameState.maxRounds}
            </Text>
          </View>

          {/* Barra de progreso */}
          <ProgressBar
            progress={currentRound / gameState.maxRounds}
            color={colorScheme.primary}
            style={styles.progressBar}
          />

          {/* Información del jugador actual */}
          <Card style={[styles.playerCard, { backgroundColor: colorScheme.background }]} mode="elevated">
            <Card.Content>
              <Text variant="titleLarge" style={styles.playerName}>
                {currentPlayer.name}
              </Text>
              <Text variant="bodyMedium" style={styles.playerInfo}>
                Es tu turno de dar una pista
              </Text>
            </Card.Content>
          </Card>

          {/* Información de la palabra secreta */}
          <Card style={styles.secretWordCard} mode="outlined">
            <Card.Content>
              <Text variant="labelLarge" style={styles.secretWordLabel}>
                Tu palabra secreta:
              </Text>
              <Text variant="headlineMedium" style={[styles.secretWord, { color: colorScheme.primary }]}>
                {mySecretWord || 'Cargando...'}
              </Text>
              {isImpostor && (
                <Chip
                  icon="alert"
                  style={[styles.impostorChip, { backgroundColor: colorScheme.error }]}
                  textStyle={styles.impostorChipText}
                >
                  Eres el impostor
                </Chip>
              )}
            </Card.Content>
          </Card>

          {/* Instrucciones */}
          <Card style={styles.instructionsCard} mode="outlined">
            <Card.Content>
              <Text variant="bodyMedium" style={styles.instructionsText}>
                {isImpostor
                  ? '💡 Como impostor, no sabes la palabra secreta. Da una pista que no te delate.'
                  : '💡 Da una pista relacionada con la palabra secreta, pero no la menciones directamente.'}
              </Text>
            </Card.Content>
          </Card>

          {/* Input de pista */}
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
              style={[styles.submitButton, { backgroundColor: colorScheme.primary }]}
              contentStyle={styles.submitButtonContent}
              icon="send"
            >
              Enviar Pista
            </Button>
          </View>

          {/* Lista de pistas de esta ronda */}
          {gameState.pistas && gameState.pistas.length > 0 && (
            <View style={styles.pistasContainer}>
              <Text variant="titleMedium" style={styles.pistasTitle}>
                Pistas de esta ronda:
              </Text>
              {gameState.pistas
                .filter((p: any) => p.round === currentRound)
                .map((pista: any, index: number) => {
                  const pistaPlayer = roleAssignment.players.find(p => p.id === pista.playerId);
                  return (
                    <Card key={index} style={styles.pistaCard} mode="outlined">
                      <Card.Content>
                        <View style={styles.pistaHeader}>
                          <Text variant="labelLarge" style={styles.pistaPlayerName}>
                            {pistaPlayer?.name || 'Desconocido'}
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
  secretWordCard: {
    marginBottom: 16,
  },
  secretWordLabel: {
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  secretWord: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  impostorChip: {
    alignSelf: 'center',
    marginTop: 8,
  },
  impostorChipText: {
    color: theme.colors.textLight,
    fontWeight: 'bold',
  },
  instructionsCard: {
    marginBottom: 24,
  },
  instructionsText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
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
});

