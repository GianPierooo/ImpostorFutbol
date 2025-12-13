import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Typography, Button, PistaHistory } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Discussion'>;

export const DiscussionScreen: React.FC<Props> = ({ navigation }) => {
  const {
    gameState,
    roleAssignment,
    pistas,
    getRoundPistas,
    finishRound,
  } = useGame();

  if (!gameState) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Typography variant="h2" style={styles.title}>
            Error
          </Typography>
          <Typography variant="body" color={theme.colors.error}>
            No se pudo cargar el estado del juego.
          </Typography>
          <Button
            title="Volver"
            variant="accent"
            onPress={() => navigation.goBack()}
            style={styles.button}
          />
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

  // Calcular esquema de colores según la ronda (usar roundToShow para el color)
  const roundColors = useMemo(() => {
    return getRoundColorScheme(roundToShow, gameState.maxRounds);
  }, [roundToShow, gameState.maxRounds]);

  const handleContinue = () => {
    // Si es la última ronda, ir a votación
    if (isLastRound) {
      // Llamar finishRound para cambiar la fase a voting
      finishRound();
      navigation.navigate('Voting');
    } else if (canFinish && gameState.maxRounds === null) {
      // Modo sin límite y pueden finalizar (3+ rondas), ir a votación
      finishRound();
      navigation.navigate('Voting');
    } else {
      // Avanzar a la siguiente ronda
      const hasMoreRounds = gameState.maxRounds === null || roundToShow < gameState.maxRounds;
      if (hasMoreRounds) {
        // Actualizar el estado para la siguiente ronda
        finishRound();
        // Navegar a la siguiente ronda
        setTimeout(() => {
          navigation.navigate('Round');
        }, 100);
      }
    }
  };

  const handleNextRound = () => {
    // Solo disponible en modo sin límite
    if (gameState.maxRounds === null) {
      const hasMoreRounds = true; // Sin límite siempre tiene más rondas
      if (hasMoreRounds) {
        finishRound();
        setTimeout(() => {
          navigation.navigate('Round');
        }, 100);
      }
    }
  };

  return (
    <ScreenContainer backgroundColor={roundColors.background}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Typography variant="h1" style={styles.emoji}>
              💬
            </Typography>
          </View>
          <Typography variant="h1" style={styles.title}>
            Tiempo de Discusión
          </Typography>
          <Typography variant="h3" color={theme.colors.textSecondary} style={styles.subtitle}>
            Ronda {roundToShow} Finalizada
          </Typography>
        </View>

        {/* Información */}
        <View style={[
          styles.infoSection,
          {
            borderColor: roundColors.accent,
            backgroundColor: roundColors.surface,
          },
        ]}>
          <Typography variant="bodyLarge" color={theme.colors.text} style={styles.infoText}>
            💭 Discutan las pistas dadas y analicen quién podría ser el impostor.
          </Typography>
          {isLastRound && (
            <Typography variant="body" color={theme.colors.warning} style={styles.warningText}>
              Esta fue la última ronda. Después de la discusión, procederán a votar.
            </Typography>
          )}
          {canFinish && !isLastRound && (
            <Typography variant="body" color={theme.colors.textSecondary} style={styles.helpText}>
              Pueden finalizar después de esta ronda{gameState.maxRounds ? ` o continuar hasta la ronda ${gameState.maxRounds}` : ' o continuar sin límite'}.
            </Typography>
          )}
        </View>

        {/* Historial de pistas de la ronda */}
        <View style={styles.historySection}>
          <PistaHistory pistas={pistas} currentRound={roundToShow} />
        </View>

        {/* Botones de acción */}
        <View style={styles.actions}>
          <Button
            title={isLastRound ? "Ir a Votación" : canFinish ? "Finalizar y Votar" : "Siguiente Ronda"}
            variant="accent"
            onPress={handleContinue}
            style={[
              styles.continueButton,
              {
                backgroundColor: roundColors.accent,
              },
            ]}
          />
          {canFinish && !isLastRound && gameState.maxRounds === null && (
            <Button
              title="Continuar a Siguiente Ronda"
              variant="secondary"
              onPress={handleNextRound}
              style={styles.nextRoundButton}
            />
          )}
        </View>
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
  iconContainer: {
    marginBottom: theme.spacing.lg,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  emoji: {
    fontSize: 48,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    ...theme.shadows.medium,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  warningText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontWeight: theme.typography.weights.semibold,
  },
  helpText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  historySection: {
    flex: 1,
    minHeight: 200,
    marginBottom: theme.spacing.xl,
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  continueButton: {
    width: '100%',
  },
  nextRoundButton: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
});

