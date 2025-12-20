/**
 * Pantalla de Discusión - MODO LOCAL
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Button, Card } from 'react-native-paper';
import { ScreenContainer, PistaHistory, AnimatedEmoji } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Discussion'>;

export const DiscussionLocalScreen: React.FC<Props> = ({ navigation }) => {
  // Usar SOLO el contexto local
  const localGame = useGame();
  
  const gameState = localGame.gameState;
  const roleAssignment = localGame.roleAssignment;
  const pistas = localGame.pistas || [];
  const getRoundPistas = (round: number) => localGame.getRoundPistas(round) || [];

  // Si no hay estado del juego, mostrar error
  if (!gameState) {
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

  // Mostrar las pistas de la ronda que acaba de terminar
  const roundToShow = gameState.currentRound;
  const roundPistas = getRoundPistas(roundToShow);
  
  // Verificar si es la última ronda
  const isLastRound = gameState.maxRounds !== null && roundToShow >= gameState.maxRounds;
  const canFinish = roundToShow >= 3; // Mínimo 3 rondas

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    return getRoundColorScheme(roundToShow, gameState.maxRounds);
  }, [roundToShow, gameState?.maxRounds]);

  const handleContinue = () => {
    // Si es la última ronda, ir a votación
    if (isLastRound) {
      localGame.finishRound();
      navigation.navigate('Voting', { mode: 'local' });
    } else if (canFinish && gameState.maxRounds === null) {
      // Modo sin límite y pueden finalizar (3+ rondas), ir a votación
      localGame.finishRound();
      navigation.navigate('Voting', { mode: 'local' });
    } else {
      // Avanzar a la siguiente ronda
      const hasMoreRounds = gameState.maxRounds === null || roundToShow < gameState.maxRounds;
      if (hasMoreRounds) {
        localGame.finishRound();
        // Navegar a la siguiente ronda
        setTimeout(() => {
          navigation.navigate('Round', { mode: 'local' });
        }, 100);
      }
    }
  };

  const handleNextRound = () => {
    // Solo disponible en modo sin límite
    if (gameState.maxRounds === null) {
      localGame.finishRound();
      setTimeout(() => {
        navigation.navigate('Round', { mode: 'local' });
      }, 100);
    }
  };

  return (
    <ScreenContainer backgroundColor={roundColors?.background}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            style={styles.iconContainer}
          >
            <AnimatedEmoji emoji="💬" animation="pulse" size={40} duration={3500} />
          </Animated.View>
          <Text variant="headlineMedium" style={styles.title}>
            Tiempo de Discusión
          </Text>
          <Text variant="titleLarge" style={styles.subtitle}>
            Ronda {roundToShow} Finalizada
          </Text>
        </Animated.View>

        {/* Información */}
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
            <Text variant="bodyLarge" style={styles.infoText}>
              💭 Discutan las pistas dadas y analicen quién podría ser el <Text style={styles.impostorText}>impostor</Text>.
            </Text>
            {isLastRound && (
              <Text variant="bodyMedium" style={styles.warningText}>
                Esta fue la última ronda. Después de la discusión, procederán a votar.
              </Text>
            )}
            {canFinish && !isLastRound && (
              <Text variant="bodyMedium" style={styles.helpText}>
                Pueden finalizar después de esta ronda{gameState.maxRounds ? ` o continuar hasta la ronda ${gameState.maxRounds}` : ' o continuar sin límite'}.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Historial de pistas de la ronda */}
        <View style={styles.historySection}>
          <PistaHistory pistas={pistas} currentRound={roundToShow} />
        </View>

        {/* Botones de acción */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.actions}
        >
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.continueButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon={isLastRound ? "vote" : "arrow-right"}
            buttonColor={roundColors?.accent || theme.colors.primary}
            textColor={theme.colors.textLight}
          >
            {isLastRound ? "Ir a Votación" : canFinish ? "Finalizar y Votar" : "Siguiente Ronda"}
          </Button>
          {canFinish && !isLastRound && gameState.maxRounds === null && (
            <Button
              mode="outlined"
              onPress={handleNextRound}
              style={styles.nextRoundButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="arrow-forward"
              textColor={theme.colors.primary}
              borderColor={theme.colors.primary}
            >
              Continuar a Siguiente Ronda
            </Button>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    marginBottom: theme.spacing.md,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  infoCard: {
    width: '100%',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  infoCardContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '700',
  },
  warningText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.warning,
    fontSize: 14,
  },
  helpText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  buttonLabel: {
    fontWeight: '700',
  },
  historySection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  continueButton: {
    width: '100%',
    borderRadius: 12,
  },
  nextRoundButton: {
    width: '100%',
    borderRadius: 12,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
});

