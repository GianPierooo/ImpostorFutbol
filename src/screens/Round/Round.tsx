import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundScreen: React.FC<Props> = ({ navigation }) => {
  const {
    gameState,
    roleAssignment,
    pistas,
    currentTurn,
    currentPlayerIndex,
    addPista,
    nextTurn,
    finishRound,
    getPlayerInfo,
    getCurrentPlayer,
    getRoundPistas,
    allPlayersGavePista,
    canFinishRound,
  } = useGame();

  const [pistaText, setPistaText] = useState('');
  const [viewingPlayerId, setViewingPlayerId] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(1);

  const currentPlayer = getCurrentPlayer();
  const currentPlayerInfo = viewingPlayerId ? getPlayerInfo(viewingPlayerId) : (currentPlayer ? getPlayerInfo(currentPlayer.id) : null);
  const roundPistas = gameState ? getRoundPistas(gameState.currentRound) : [];

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
          <Typography variant="h2" style={styles.title}>
            Error
          </Typography>
          <Typography variant="body" color={theme.colors.error}>
            No se pudo cargar el estado del juego. Vuelve al inicio.
          </Typography>
          <Button
            title="Volver al Inicio"
            variant="accent"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
          />
        </View>
      </ScreenContainer>
    );
  }

  const handleAddPista = () => {
    if (!pistaText.trim() || !currentPlayer || !gameState || !roleAssignment) return;

    // Verificar si este es el último jugador que falta dar pista
    const roundPistasBefore = getRoundPistas(gameState.currentRound);
    const playersWhoGavePista = new Set(roundPistasBefore.map((p) => p.playerId));
    const missingPlayers = roleAssignment.players.filter((p) => !playersWhoGavePista.has(p.id));
    const isLastPlayer = missingPlayers.length === 1 && missingPlayers[0].id === currentPlayer.id;
    
    addPista(pistaText, currentPlayer.id);
    setPistaText('');
    
    // Si todos dieron pista, avanzar automáticamente
    if (isLastPlayer) {
      // Esperar un momento para que se actualice el estado
      setTimeout(() => {
        // Si es la última ronda configurada, ir directo a votación
        if (gameState.maxRounds !== null && gameState.currentRound === gameState.maxRounds) {
          finishRound();
          navigation.navigate('Voting');
        } else {
          // SIEMPRE ir a Discussion después de cada ronda (excepto la última)
          // No llamar finishRound aquí, se llamará desde Discussion cuando avancen
          navigation.navigate('Discussion');
        }
      }, 200);
      return;
    }
    
    nextTurn();
  };

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    return getRoundColorScheme(gameState.currentRound, gameState.maxRounds);
  }, [gameState?.currentRound, gameState?.maxRounds]);

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
            <Typography variant="h2" style={styles.title}>
              Ronda {gameState.currentRound} {gameState.maxRounds ? `de ${gameState.maxRounds}` : '(sin límite)'}
            </Typography>
            <Typography variant="body" color={theme.colors.textSecondary}>
              Turno - {currentPlayer?.name || 'Cargando...'}
            </Typography>
          </View>

          {/* Información del jugador actual - Anónimo */}
          {currentPlayerInfo && (
            <View style={styles.playerInfoSection}>
              <View style={[
                styles.normalCard,
                roundColors && {
                  borderColor: roundColors.accent,
                  backgroundColor: roundColors.surface,
                },
              ]}>
                <Typography variant="h3" color={roundColors?.accent || theme.colors.accent} style={styles.instructionText}>
                  🕵️ Busquemos al impostor
                </Typography>
                <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.instructionText}>
                  Da pistas sobre la palabra secreta sin decirla directamente. Observa las pistas de los demás para descubrir quién es el impostor.
                </Typography>
              </View>
            </View>
          )}

          {/* Input para pista */}
          {currentPlayer && (
            <View style={styles.inputSection}>
              <Typography variant="body" color={theme.colors.textSecondary} style={styles.inputLabel}>
                Tu pista:
              </Typography>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu pista aquí..."
                placeholderTextColor={theme.colors.textSecondary}
                value={pistaText}
                onChangeText={setPistaText}
                multiline
                maxLength={200}
                editable={true}
              />
              <Button
                title="Enviar Pista"
                variant="accent"
                onPress={handleAddPista}
                disabled={!pistaText.trim()}
                style={[
                  styles.sendButton,
                  roundColors && {
                    backgroundColor: roundColors.accent,
                  },
                ]}
              />
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
    paddingBottom: theme.spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  playerInfoSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  impostorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.error,
    alignItems: 'center',
  },
  normalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.spacing.xl,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  impostorText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  labelText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  secretWordText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontWeight: theme.typography.weights.bold,
  },
  instructionText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  inputSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  inputLabel: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    width: '100%',
    minHeight: 120,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
    textAlignVertical: 'top',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  sendButton: {
    width: '100%',
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
});
