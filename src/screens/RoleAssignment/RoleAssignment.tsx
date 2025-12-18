import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ProgressBar, Chip } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji, AnimatedButton, FlipCard } from '../../components';
import { useGame } from '../../game';
import { useOnlineGame } from '../../contexts';
import { useGameMode } from '../../hooks/useGameMode';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme } from '../../theme';
import { soundService, SoundType } from '../../services';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode, isOnline, onlineGame, localGame } = useGameMode();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  // Usar el contexto apropiado según el modo
  const roleAssignment = isOnline ? onlineGame?.roleAssignment : localGame?.roleAssignment;
  const getPlayerInfo = isOnline 
    ? (playerId: string) => onlineGame?.getPlayerInfo(playerId) || null
    : (playerId: string) => localGame?.getPlayerInfo(playerId) || null;
  const nextPhase = isOnline
    ? async () => {
        if (onlineGame) {
          await onlineGame.changePhase('round');
        }
      }
    : () => {
        if (localGame) {
          localGame.nextPhase();
        }
      };
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [allPlayersSeen, setAllPlayersSeen] = useState(false);

  // Usar players de roleAssignment en lugar de route.params para consistencia
  const players = roleAssignment?.players || [];
  const currentPlayer = players[currentPlayerIndex];
  const playerInfo = currentPlayer ? getPlayerInfo(currentPlayer.id) : null;

  // Verificar si todos los jugadores han visto su rol
  useEffect(() => {
    if (players.length > 0 && currentPlayerIndex >= players.length) {
      setAllPlayersSeen(true);
    }
  }, [currentPlayerIndex, players.length]);

  const handleShowRole = () => {
    // Reproducir sonido de revelación
    soundService.play(SoundType.REVEAL);
    // Reproducir sonido de flip después de un pequeño delay
    setTimeout(() => {
      soundService.play(SoundType.FLIP);
    }, 200);
    setShowRole(true);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowRole(false);
    } else {
      setAllPlayersSeen(true);
    }
  };

  const handleContinue = async () => {
    if (isOnline) {
      await nextPhase();
      // La navegación se manejará automáticamente con useOnlineNavigation
    } else {
      nextPhase();
      navigation.navigate('Round', { mode: 'local' });
    }
  };

  // Si no hay asignación de roles, mostrar mensaje de error
  if (!roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo asignar los roles. Vuelve al lobby.
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

  // Si todos los jugadores han visto su rol, mostrar botón de continuar
  if (allPlayersSeen) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Card style={styles.successCard} mode="elevated">
            <Card.Content style={styles.successContent}>
              <Text variant="displaySmall" style={styles.successEmoji}>
                ✅
              </Text>
              <Text variant="headlineSmall" style={styles.title}>
                ¡Todos han visto su rol!
              </Text>
              <Text variant="bodyLarge" style={styles.infoText}>
                Ahora pueden comenzar las rondas de pistas
              </Text>
          <Button
            mode="contained"
            onPress={handleContinue}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="arrow-right"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.textLight}
          >
            Continuar
          </Button>
            </Card.Content>
          </Card>
        </View>
      </ScreenContainer>
    );
  }

  // Mostrar rol del jugador actual
  const progress = (currentPlayerIndex + 1) / players.length;

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.playerName}>
            {currentPlayer?.name}
          </Text>
          <Chip icon="account" style={styles.progressChip}>
            Jugador {currentPlayerIndex + 1} de {players.length}
          </Chip>
          <ProgressBar progress={progress} color={theme.colors.accent} style={styles.progressBar} />
        </View>

        <View style={styles.roleSection}>
          <FlipCard
            flipped={showRole}
            style={styles.flipCardContainer}
            front={
              <Card style={styles.revealCard} mode="elevated">
                <Card.Content style={styles.revealContent}>
                  <AnimatedEmoji emoji="👀" animation="pulse" size={48} duration={3500} />
                  <Text variant="titleMedium" style={styles.infoText}>
                    Presiona el botón para ver tu rol
                  </Text>
                  <AnimatedButton
                    mode="contained"
                    onPress={handleShowRole}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    labelStyle={styles.buttonLabel}
                    icon="eye"
                    buttonColor={theme.colors.primary}
                    textColor={theme.colors.textLight}
                  >
                    Ver mi Rol
                  </AnimatedButton>
                </Card.Content>
              </Card>
            }
            back={
              playerInfo ? (
                playerInfo.isImpostor ? (
                  <Card style={styles.impostorCard} mode="elevated">
                    <Card.Content style={styles.cardContent}>
                      <AnimatedEmoji emoji="🎭" animation="pulse" size={48} duration={3500} />
                      <Text variant="headlineMedium" style={styles.roleText}>
                        Eres el
                      </Text>
                      <Chip 
                        icon="alert" 
                        style={[styles.roleChip, styles.impostorChip]}
                        textStyle={styles.roleChipText}
                        selectedColor={theme.colors.textLight}
                      >
                        IMPOSTOR
                      </Chip>
                      <Text variant="bodyLarge" style={styles.instructionText}>
                        No sabes la palabra secreta. Tu objetivo es descubrirla o hacer que los demás no la descubran.
                      </Text>
                    </Card.Content>
                  </Card>
                ) : (
                  <Card style={styles.normalCard} mode="elevated">
                    <Card.Content style={styles.cardContent}>
                      <AnimatedEmoji emoji="⚽" animation="pulse" size={48} duration={3500} />
                      <Text variant="titleMedium" style={styles.labelText}>
                        La palabra secreta es:
                      </Text>
                      <View style={styles.chipContainer}>
                        <Chip 
                          icon="lightbulb" 
                          style={[styles.roleChip, styles.normalChip]}
                          textStyle={styles.roleChipText}
                        >
                          {playerInfo.secretWord || 'Cargando...'}
                        </Chip>
                      </View>
                      <Text variant="bodyLarge" style={styles.instructionText}>
                        Da pistas sobre esta palabra sin decirla directamente. Encuentra al impostor.
                      </Text>
                    </Card.Content>
                  </Card>
                )
              ) : (
                <Card style={styles.revealCard} mode="elevated">
                  <Card.Content style={styles.revealContent}>
                    <Text variant="bodyLarge" style={styles.infoText}>
                      Cargando información del rol...
                    </Text>
                  </Card.Content>
                </Card>
              )
            }
          />

          {showRole && (
            <View style={styles.actions}>
              <AnimatedButton
                mode="contained"
                onPress={handleNextPlayer}
                style={styles.button}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon={currentPlayerIndex < players.length - 1 ? "arrow-right" : "check"}
                buttonColor={theme.colors.primary}
                textColor={theme.colors.textLight}
              >
                {currentPlayerIndex < players.length - 1 ? "Siguiente Jugador" : "Continuar"}
              </AnimatedButton>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  playerName: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 20,
    color: theme.colors.text,
  },
  progressChip: {
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    maxWidth: 300,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700',
    color: theme.colors.text,
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  flipCardContainer: {
    width: '100%',
    minHeight: 400,
    marginBottom: theme.spacing.xl,
  },
  revealCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  revealContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  emoji: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontSize: 48,
  },
  impostorCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: theme.colors.impostor,
    backgroundColor: theme.colors.surface,
  },
  normalCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  roleText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    fontWeight: '600',
    color: theme.colors.text,
  },
  roleChip: {
    marginVertical: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  impostorChip: {
    backgroundColor: theme.colors.impostor, // Rojo fuerte
    borderWidth: 2,
    borderColor: theme.colors.impostor,
  },
  normalChip: {
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  roleChipText: {
    color: theme.colors.textLight,
    fontSize: 18,
    fontWeight: '700',
  },
  labelText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontWeight: '600',
  },
  chipContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: theme.spacing.md,
  },
  instructionText: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    lineHeight: 22,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '700',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: theme.colors.text,
  },
  successCard: {
    width: '100%',
    maxWidth: 400,
    borderWidth: 3,
    borderColor: theme.colors.success,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  successEmoji: {
    marginBottom: theme.spacing.md,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
    marginTop: theme.spacing.xl,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
