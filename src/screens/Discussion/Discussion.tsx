import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Button, Card } from 'react-native-paper';
import { ScreenContainer, PistaHistory } from '../../components';
import { useGame } from '../../game';
import { useGameMode } from '../../hooks/useGameMode';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Discussion'>;

export const DiscussionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode, isOnline, onlineGame, localGame } = useGameMode();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  // Usar el contexto apropiado según el modo
  const gameState = isOnline ? onlineGame?.gameState : localGame?.gameState;
  const roleAssignment = isOnline ? onlineGame?.roleAssignment : localGame?.roleAssignment;
  const pistas = isOnline ? onlineGame?.pistas || [] : localGame?.pistas || [];
  const getRoundPistas = isOnline
    ? (round: number) => onlineGame?.pistas.filter(p => p.round === round) || []
    : (round: number) => localGame?.getRoundPistas(round) || [];
  const finishRound = isOnline
    ? async () => {
        if (onlineGame) {
          await onlineGame.changePhase('voting');
        }
      }
    : () => {
        if (localGame) {
          localGame.finishRound();
        }
      };

  if (!gameState) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo cargar el estado del juego.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="arrow-left"
          >
            Volver
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  // Mostrar las pistas de la ronda que acaba de terminar
  // Cuando llegamos a Discussion, currentRound todavía es el de la ronda que acabamos de terminar
  // porque finishRound se llama después desde aquí
  const roundToShow = gameState.currentRound;
  const roundPistas = getRoundPistas(roundToShow);
  
  // Verificar si es la última ronda
  // Si currentRound es igual a maxRounds, entonces la ronda que acabamos de terminar era la última
  const isLastRound = gameState.maxRounds !== null && roundToShow >= gameState.maxRounds;
  const canFinish = roundToShow >= 3; // Mínimo 3 rondas


  const handleContinue = async () => {
    // Si es la última ronda, ir a votación
    if (isLastRound) {
      // Llamar finishRound para cambiar la fase a voting
      if (isOnline) {
        await finishRound();
      } else {
        finishRound();
      }
      navigation.navigate('Voting', { mode, roomCode: route.params?.roomCode });
    } else if (canFinish && gameState.maxRounds === null) {
      // Modo sin límite y pueden finalizar (3+ rondas), ir a votación
      if (isOnline) {
        await finishRound();
      } else {
        finishRound();
      }
      navigation.navigate('Voting', { mode, roomCode: route.params?.roomCode });
    } else {
      // Avanzar a la siguiente ronda
      const hasMoreRounds = gameState.maxRounds === null || roundToShow < gameState.maxRounds;
      if (hasMoreRounds) {
        // Actualizar el estado para la siguiente ronda
        if (isOnline && onlineGame) {
          await onlineGame.changePhase('round');
        } else {
          finishRound();
        }
        // Navegar a la siguiente ronda
        setTimeout(() => {
          navigation.navigate('Round', { mode, roomCode: route.params?.roomCode });
        }, 100);
      }
    }
  };

  const handleNextRound = async () => {
    // Solo disponible en modo sin límite
    if (gameState.maxRounds === null) {
      const hasMoreRounds = true; // Sin límite siempre tiene más rondas
      if (hasMoreRounds) {
        if (isOnline && onlineGame) {
          await onlineGame.changePhase('round');
        } else {
          finishRound();
        }
        setTimeout(() => {
          navigation.navigate('Round', { mode, roomCode: route.params?.roomCode });
        }, 100);
      }
    }
  };

  return (
    <ScreenContainer>
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
            <Text variant="displaySmall" style={styles.emoji}>
              💬
            </Text>
          </Animated.View>
          <Text variant="headlineMedium" style={styles.title}>
            Tiempo de Discusión
          </Text>
          <Text variant="titleLarge" style={styles.subtitle}>
            Ronda {roundToShow} Finalizada
          </Text>
        </Animated.View>

        {/* Información */}
        <Card style={styles.infoCard} mode="elevated">
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
            buttonColor={theme.colors.primary}
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

