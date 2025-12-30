/**
 * Pantalla de Asignación de Roles - MODO ONLINE
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo online.
 * No tiene ninguna dependencia del modo local.
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { Text, Button, Card, Chip } from 'react-native-paper';
import { ScreenContainer } from '../../components';
import { useOnlineGame } from '../../contexts';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { hapticService, HapticType } from '../../services/hapticService';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentOnlineScreen: React.FC<Props> = ({ navigation, route }) => {
  // Usar SOLO el contexto online
  const onlineGame = useOnlineGame();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  const [myRoleInfo, setMyRoleInfo] = useState<any | null>(null);
  const [showRole, setShowRole] = useState(false);
  const [hasMarkedSeen, setHasMarkedSeen] = useState(false);
  const [allPlayersSeen, setAllPlayersSeen] = useState(false);
  const [rolesSeenStatus, setRolesSeenStatus] = useState({ playersWhoSeen: 0, totalPlayers: 0 });
  
  // Animaciones dramáticas para la revelación
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  
  // Estilo animado (siempre definido, fuera de condicionales)
  // Usar un valor compartido para el color de la sombra para evitar problemas
  const shadowColorValue = useSharedValue(theme.colors.primary);
  
  useEffect(() => {
    if (myRoleInfo) {
      shadowColorValue.value = myRoleInfo.isImpostor ? theme.colors.impostor : theme.colors.primary;
    }
  }, [myRoleInfo]);
  
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

  // Cargar el rol del jugador actual
  useEffect(() => {
    if (onlineGame?.playerId && onlineGame?.roomCode && !myRoleInfo) {
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
  }, [onlineGame?.playerId, onlineGame?.roomCode, myRoleInfo]);

  // Verificar periódicamente si todos han visto su rol
  useEffect(() => {
    if (onlineGame?.roomCode && hasMarkedSeen) {
      const checkAllSeen = async () => {
        try {
          const status = await onlineGame.getAllRolesSeen();
          setRolesSeenStatus({
            playersWhoSeen: status.playersWhoSeen,
            totalPlayers: status.totalPlayers,
          });
          setAllPlayersSeen(status.allSeen);
        } catch (error: any) {
          if (error.response?.status !== 429) {
            console.error('Error checking all roles seen:', error);
          }
        }
      };

      checkAllSeen();
      const interval = setInterval(checkAllSeen, 6000);
      return () => clearInterval(interval);
    }
  }, [onlineGame?.roomCode, hasMarkedSeen]);

  const handleShowRole = async () => {
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
    
    try {
      const result = await onlineGame.markRoleSeen();
      setHasMarkedSeen(true);
      
      if (result.allSeen) {
        setAllPlayersSeen(true);
      }
    } catch (error) {
      console.error('Error marking role seen:', error);
    }
  };

  const handleContinue = async () => {
    await onlineGame.changePhase('round');
    // La navegación se manejará automáticamente con useOnlineNavigation
  };

  // Mostrar confirmación cuando todos han visto su rol
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

  const playerInfo = myRoleInfo;
  
  if (!showRole) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Card style={styles.revealCard} mode="elevated">
            <Card.Content style={styles.revealContent}>
              <Text variant="displayMedium" style={styles.emoji}>
                🎴
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
            <Animated.View style={[styles.dramaticContainer, animatedStyle]}>
              <Card style={[styles.impostorCard, styles.dramaticCard]} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="displayMedium" style={styles.emoji}>
                    👹
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
            </Animated.View>
          ) : (
            <Animated.View style={[styles.dramaticContainer, animatedStyle]}>
              <Card style={[styles.normalCard, styles.dramaticCard]} mode="elevated">
                <Card.Content style={styles.cardContent}>
                  <Text variant="displayMedium" style={styles.emoji}>
                    🔍
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
            </Animated.View>
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
  seenChip: {
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.success + '20',
  },
  progressText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700',
    color: theme.colors.text,
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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

