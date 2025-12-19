import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, ProgressBar, Chip } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji, AnimatedButton, FlipCard } from '../../components';
import { useGame } from '../../game';
import { useOnlineGame } from '../../contexts';
import { useGameMode } from '../../hooks/useGameMode';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode, isOnline, onlineGame, localGame } = useGameMode();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  // Para modo ONLINE: cada jugador ve solo su propio rol
  const [myRoleInfo, setMyRoleInfo] = useState<any | null>(null);
  const [showRole, setShowRole] = useState(false);
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false);
  const [allPlayersSeen, setAllPlayersSeen] = useState(false);
  const [rolesSeenStatus, setRolesSeenStatus] = useState({ playersWhoSeen: 0, totalPlayers: 0 });

  // Para modo LOCAL: usar la lógica original
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
  const players = roleAssignment?.players || [];
  const currentPlayer = players[currentPlayerIndex];

  // MODO ONLINE: Cargar el rol del jugador actual
  useEffect(() => {
    if (isOnline && onlineGame?.playerId && onlineGame?.roomCode && !myRoleInfo) {
      const loadMyRole = async () => {
        try {
          const roleInfo = await onlineGame.getPlayerRole(onlineGame.playerId!);
          if (roleInfo) {
            setMyRoleInfo(roleInfo);
          }
        } catch (error) {
          console.error('Error loading my role:', error);
        }
      };
      loadMyRole();
    }
  }, [isOnline, onlineGame?.playerId, onlineGame?.roomCode, myRoleInfo]);

  // MODO ONLINE: Verificar periódicamente si todos han visto su rol
  useEffect(() => {
    if (isOnline && onlineGame?.roomCode && hasMarkedSeen) {
      const checkAllSeen = async () => {
        try {
          const status = await onlineGame.getAllRolesSeen();
          setRolesSeenStatus({
            playersWhoSeen: status.playersWhoSeen,
            totalPlayers: status.totalPlayers,
          });
          setAllPlayersSeen(status.allSeen);
        } catch (error) {
          console.error('Error checking all roles seen:', error);
        }
      };

      checkAllSeen();
      // Aumentar intervalo a 5 segundos para evitar rate limiting
      const interval = setInterval(checkAllSeen, 5000); // Verificar cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [isOnline, onlineGame?.roomCode, hasMarkedSeen]);

  // MODO LOCAL: Verificar si todos los jugadores han visto su rol
  useEffect(() => {
    if (!isOnline && players.length > 0 && currentPlayerIndex >= players.length) {
      setAllPlayersSeen(true);
    }
  }, [currentPlayerIndex, players.length, isOnline]);

  const handleShowRole = async () => {
    if (isOnline && onlineGame) {
      // En modo online, marcar que este jugador vio su rol
      setShowRole(true);
      try {
        const result = await onlineGame.markRoleSeen();
        setHasMarkedSeen(true);
        if (result.allSeen) {
          setAllPlayersSeen(true);
        }
      } catch (error) {
        console.error('Error marking role seen:', error);
      }
    } else {
      // Modo local
      setShowRole(true);
    }
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
  if (!roleAssignment && !isOnline) {
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

  // MODO ONLINE: Mostrar confirmación cuando todos han visto su rol
  if (isOnline && allPlayersSeen) {
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
              {onlineGame?.isHost && (
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
              )}
              {!onlineGame?.isHost && (
                <Text variant="bodyMedium" style={styles.waitingText}>
                  Esperando a que el host continúe...
                </Text>
              )}
            </Card.Content>
          </Card>
        </View>
      </ScreenContainer>
    );
  }

  // MODO ONLINE: Mostrar solo el rol del jugador actual
  if (isOnline && onlineGame) {
    const playerInfo = myRoleInfo;
    
    if (!showRole) {
      return (
        <ScreenContainer>
          <View style={styles.content}>
            <Card style={styles.revealCard} mode="elevated">
              <Card.Content style={styles.revealContent}>
                <Text variant="displayMedium" style={styles.emoji}>
                  👀
                </Text>
                <Text variant="titleMedium" style={styles.infoText}>
                  Presiona el botón para ver tu rol
                </Text>
                <Button
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
                </Button>
              </Card.Content>
            </Card>
          </View>
        </ScreenContainer>
      );
    }

    // Mostrar el rol del jugador
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text variant="headlineMedium" style={styles.playerName}>
              {onlineGame.playerName}
            </Text>
            {hasMarkedSeen && (
              <Chip icon="check" style={styles.seenChip}>
                Has visto tu rol
              </Chip>
            )}
            {hasMarkedSeen && (
              <Text variant="bodySmall" style={styles.progressText}>
                {rolesSeenStatus.playersWhoSeen} / {rolesSeenStatus.totalPlayers} jugadores han visto su rol
              </Text>
            )}
          </View>

          <View style={styles.roleSection}>
            {playerInfo?.isImpostor ? (
              <Card style={styles.impostorCard} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="displayMedium" style={styles.emoji}>
                    🎭
                  </Text>
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
                  <Text variant="displayMedium" style={styles.emoji}>
                    ⚽
                  </Text>
                  <Text variant="titleMedium" style={styles.labelText}>
                    La palabra secreta es:
                  </Text>
                  <Chip 
                    icon="lightbulb" 
                    style={[styles.roleChip, styles.normalChip]}
                    textStyle={styles.roleChipText}
                  >
                    {playerInfo?.secretWord}
                  </Chip>
                  <Text variant="bodyLarge" style={styles.instructionText}>
                    Da pistas sobre esta palabra sin decirla directamente. Encuentra al impostor.
                  </Text>
                </Card.Content>
              </Card>
            )}
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // MODO LOCAL: Lógica original (mostrar roles uno por uno)
  const playerInfo = currentPlayer ? getPlayerInfo(currentPlayer.id) : null;
  const progress = (currentPlayerIndex + 1) / players.length;

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
  seenChip: {
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.success + '20',
  },
  progressText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
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
    backgroundColor: theme.colors.impostor,
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
  waitingText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
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
