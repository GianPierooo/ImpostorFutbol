/**
 * Pantalla de Asignación de Roles - MODO LOCAL
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Text, Button, Card, ProgressBar, Chip } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji, AnimatedButton, FlipCard, Countdown } from '../../components';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { hapticService, HapticType } from '../../services/hapticService';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentLocalScreen: React.FC<Props> = ({ navigation }) => {
  // Usar SOLO el contexto local
  const localGame = useGame();
  
  const roleAssignment = localGame.roleAssignment;
  const getPlayerInfo = (playerId: string) => localGame.getPlayerInfo(playerId) || null;
  const nextPhase = () => {
    if (localGame) {
      localGame.nextPhase();
    }
  };

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [pendingPlayerIndex, setPendingPlayerIndex] = useState<number | null>(null);
  const [displayedPlayerIndex, setDisplayedPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [allPlayersSeen, setAllPlayersSeen] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const prevShowRoleRef = useRef(false);
  const countdownShownRef = useRef(false);
  
  // Mostrar conteo solo una vez al inicio
  useEffect(() => {
    if (!countdownShownRef.current && roleAssignment) {
      countdownShownRef.current = true;
      setShowCountdown(true);
    }
  }, [roleAssignment]);
  
  // Animaciones dramáticas para la revelación
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  
  const players = roleAssignment?.players || [];
  const currentPlayer = players[currentPlayerIndex];
  const displayedPlayer = players[displayedPlayerIndex];
  
  // Estilo animado (siempre definido, fuera de condicionales)
  // Usar un valor compartido para el color de la sombra para evitar problemas
  const shadowColorValue = useSharedValue(theme.colors.primary);
  
  useEffect(() => {
    if (playerInfo) {
      shadowColorValue.value = playerInfo.isImpostor ? theme.colors.impostor : theme.colors.primary;
    }
  }, [playerInfo]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value,
    shadowOpacity: glowIntensity.value,
    shadowRadius: glowIntensity.value * 20,
    shadowColor: shadowColorValue.value,
  }));
  
  // Resetear animaciones cuando showRole cambia a false
  useEffect(() => {
    if (!showRole) {
      scale.value = 1;
      opacity.value = 1;
      rotation.value = 0;
      glowIntensity.value = 0;
    }
  }, [showRole]);
  
  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      scale.value = 1;
      opacity.value = 1;
      rotation.value = 0;
      glowIntensity.value = 0;
    };
  }, []);

  // Verificar si todos los jugadores han visto su rol
  useEffect(() => {
    if (players.length > 0 && currentPlayerIndex >= players.length) {
      setAllPlayersSeen(true);
    }
  }, [currentPlayerIndex, players.length]);

  // Inicializar displayedPlayerIndex cuando se carga el componente
  useEffect(() => {
    if (displayedPlayerIndex === 0 && currentPlayerIndex === 0 && !isFlipping) {
      setDisplayedPlayerIndex(0);
    }
  }, []);

  const handleShowRole = () => {
    prevShowRoleRef.current = showRole;
    
    // Vibración dramática
    hapticService.play(HapticType.REVEAL);
    
    // Iniciar animación dramática
    scale.value = 0.5;
    opacity.value = 0;
    rotation.value = -10;
    glowIntensity.value = 0;
    
    // Secuencia de animación dramática (cámara lenta)
    scale.value = withSequence(
      withTiming(1.2, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 300, easing: Easing.inOut(Easing.cubic) })
    );
    
    opacity.value = withSequence(
      withDelay(100, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }))
    );
    
    rotation.value = withSequence(
      withTiming(5, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(0, { duration: 300, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Efecto de brillo/glow
    glowIntensity.value = withSequence(
      withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
      withDelay(200, withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.cubic) }))
    );
    
    setShowRole(true);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      const nextIndex = currentPlayerIndex + 1;
      prevShowRoleRef.current = showRole;
      setIsFlipping(true);
      setShowRole(false);
      setTimeout(() => {
        setDisplayedPlayerIndex(nextIndex);
        setCurrentPlayerIndex(nextIndex);
        setIsFlipping(false);
      }, 150);
    } else {
      setAllPlayersSeen(true);
    }
  };

  const handleFlipComplete = () => {
    if (isFlipping && !showRole) {
      setIsFlipping(false);
    }
    prevShowRoleRef.current = showRole;
  };

  const handleContinue = () => {
    // Asegurar que la fase cambie a 'round' antes de navegar
    nextPhase();
    // Usar setTimeout para asegurar que el estado se actualice antes de navegar
    setTimeout(() => {
      navigation.navigate('Round', { mode: 'local' });
    }, 100);
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

  const playerInfo = displayedPlayer ? getPlayerInfo(displayedPlayer.id) : null;
  const progress = players.length > 0 
    ? Math.min(1, Math.max(0, (currentPlayerIndex + 1) / players.length))
    : 0;

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
      {showCountdown && (
        <Countdown
          onComplete={() => setShowCountdown(false)}
          startNumber={3}
          duration={1000}
        />
      )}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.playerName}>
            {displayedPlayer?.name || currentPlayer?.name}
          </Text>
          <Chip icon="account" style={styles.progressChip}>
            Jugador {displayedPlayerIndex + 1} de {players.length}
          </Chip>
          <ProgressBar progress={progress} color={theme.colors.accent} style={styles.progressBar} />
        </View>

        <View style={styles.roleSection}>
          <FlipCard
            flipped={showRole}
            style={styles.flipCardContainer}
            onFlipComplete={handleFlipComplete}
            front={
              <Card style={styles.revealCard} mode="elevated">
                <Card.Content style={styles.revealContent}>
                  <AnimatedEmoji emoji="🎴" animation="pulse" size={48} duration={3500} />
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
                  <Animated.View style={[styles.dramaticContainer, animatedStyle]}>
                    <Card style={[styles.impostorCard, styles.dramaticCard]} mode="elevated">
                      <Card.Content style={styles.cardContent}>
                        <AnimatedEmoji emoji="👹" animation="pulse" size={48} duration={3500} />
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
                  </Animated.View>
                ) : (
                  <Animated.View style={[styles.dramaticContainer, animatedStyle]}>
                    <Card style={[styles.normalCard, styles.dramaticCard]} mode="elevated">
                      <Card.Content style={styles.cardContent}>
                        <AnimatedEmoji emoji="🔍" animation="pulse" size={48} duration={3500} />
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
                  </Animated.View>
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
    alignSelf: 'center',
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
    paddingHorizontal: theme.spacing.md,
  },
  instructionText: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    lineHeight: 22,
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
  dramaticContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dramaticCard: {
    shadowOffset: { width: 0, height: 0 },
    elevation: 20,
  },
});

