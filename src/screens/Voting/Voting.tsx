import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Card, Avatar, Text, Button } from 'react-native-paper';
import { ScreenContainer } from '../../components';
import { useGame } from '../../game';
import { useGameMode } from '../../hooks/useGameMode';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Voting'>;

interface PlayerVoteItemProps {
  player: Player;
  onVote: (playerId: string) => void;
  isSelected: boolean;
  voteCount: number;
  canVote: boolean;
}

const PlayerVoteItem: React.FC<PlayerVoteItemProps> = ({
  player,
  onVote,
  isSelected,
  voteCount,
  canVote,
}) => {
  // Generar avatar con iniciales
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(player.name);

  // Usar un delay fijo en lugar de Math.random() para evitar problemas con worklets
  const delay = (player.name.charCodeAt(0) % 200);
  
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
    >
      <Card
        style={[
          styles.playerCard,
          isSelected && styles.playerCardSelected,
          !canVote && styles.playerCardDisabled,
        ]}
        onPress={() => canVote && onVote(player.id)}
        disabled={!canVote}
        mode={isSelected ? "elevated" : "outlined"}
      >
        <Card.Content style={styles.cardContent}>
          <Avatar.Text
            size={56}
            label={initials}
            style={[
              styles.avatar,
              isSelected && styles.avatarSelected,
            ]}
          />
          <View style={styles.playerDetails}>
            <Text variant="titleMedium" style={styles.playerName}>
              {player.name}
            </Text>
            {voteCount > 0 && (
              <Text variant="bodySmall" style={styles.voteCount}>
                {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
              </Text>
            )}
          </View>
          {isSelected && (
            <View style={styles.selectedBadge}>
              <Text variant="titleLarge" style={styles.checkmark}>
                ✓
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
};

export const VotingScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mode, isOnline, onlineGame, localGame } = useGameMode();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  // Usar el contexto apropiado según el modo
  const gameState = isOnline ? onlineGame?.gameState : localGame?.gameState;
  const roleAssignment = isOnline ? onlineGame?.roleAssignment : localGame?.roleAssignment;
  const votes = isOnline ? onlineGame?.votes || [] : localGame?.votes || [];
  const currentVoterIndex = isOnline ? onlineGame?.gameState?.currentVoterIndex : localGame?.currentVoterIndex;
  const getVotingResults = isOnline
    ? () => onlineGame?.getVotingResults() || null
    : () => localGame?.getVotingResults() || null;
  const hasVoted = isOnline
    ? (playerId: string) => {
        if (!onlineGame) return false;
        return onlineGame.votes.some(v => v.voterId === playerId);
      }
    : (playerId: string) => localGame?.hasVoted(playerId) || false;
  const getCurrentVoter = isOnline
    ? () => {
        if (!onlineGame || !roleAssignment || currentVoterIndex === undefined) return null;
        return roleAssignment.players[currentVoterIndex] || null;
      }
    : () => localGame?.getCurrentVoter() || null;
  const allVotesComplete = isOnline
    ? () => {
        if (!onlineGame || !roleAssignment) return false;
        return roleAssignment.players.every(p => onlineGame.votes.some(v => v.voterId === p.id));
      }
    : () => localGame?.allVotesComplete() || false;

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [viewingVoterId, setViewingVoterId] = useState<string | null>(null);

  const currentVoter = getCurrentVoter();
  const votingResults = getVotingResults();

  // MODO ONLINE: Verificar si es el turno del jugador actual
  const isMyTurn = isOnline && onlineGame 
    ? (() => {
        if (!gameState || !onlineGame.playerId || !roleAssignment) return false;
        const currentVoterFromState = roleAssignment.players[gameState.currentVoterIndex];
        return currentVoterFromState?.id === onlineGame.playerId;
      })()
    : true; // En modo local siempre es el turno del votante actual

  // Inicializar el votante actual
  useEffect(() => {
    if (currentVoter && !viewingVoterId) {
      setViewingVoterId(currentVoter.id);
      // Si ya votó, mostrar su voto seleccionado
      const existingVote = votes.find((v) => v.voterId === currentVoter.id);
      if (existingVote) {
        setSelectedTarget(existingVote.targetId);
      }
    }
  }, [currentVoter, viewingVoterId, votes]);

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo cargar el estado del juego. Vuelve al inicio.
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.button}
            contentStyle={styles.buttonContent}
            icon="home"
          >
            Volver al Inicio
          </Button>
        </View>
      </ScreenContainer>
    );
  }

  // Obtener jugadores disponibles para votar (excluyendo al votante actual)
  const availablePlayers = roleAssignment.players.filter(
    (p) => p.id !== (currentVoter?.id || '')
  );

  const handleVote = async (targetId: string) => {
    if (!currentVoter) return;

    setSelectedTarget(targetId);
    
    // Agregar voto según el modo
    if (isOnline && onlineGame) {
      // En modo online, el voto se envía inmediatamente y el backend avanza automáticamente
      try {
        await onlineGame.addVote(targetId);
        // Limpiar selección después de votar
        setSelectedTarget(null);
      } catch (error: any) {
        // Si hay error, mantener la selección para que el usuario pueda intentar de nuevo
        console.error('Error al votar:', error);
      }
    } else if (localGame) {
      localGame.addVote(currentVoter.id, targetId);
    }
  };

  const handleNextVoter = async () => {
    // Solo avanzar si hay un voto seleccionado
    if (!selectedTarget) {
      return; // No permitir avanzar sin votar
    }

    if (allVotesComplete()) {
      // Todos votaron, ir a resultados
      // En modo online, el backend ya cambió automáticamente la fase a results
      // La navegación se manejará automáticamente con useOnlineNavigation
      if (isOnline) {
        // No necesitamos hacer nada, el backend ya cambió la fase
        // useOnlineNavigation navegará automáticamente cuando detecte el cambio
      } else if (localGame) {
        localGame.finishVoting();
        navigation.navigate('Results', { mode, roomCode: route.params?.roomCode });
      }
    } else {
      // En modo online, el avance es automático después de votar
      // En modo local, avanzar al siguiente votante manualmente
      if (!isOnline && localGame) {
        localGame.nextVoter();
        setSelectedTarget(null);
        setViewingVoterId(null);
      }
    }
  };

  const currentVoteCount = votingResults?.voteCounts || {};
  const allComplete = allVotesComplete();

  // Calcular esquema de colores según la ronda (usar la última ronda completada)
  const roundColors = useMemo(() => {
    if (!gameState) return null;
    // En votación, usar la última ronda completada
    const lastRound = gameState.currentRound > 0 ? gameState.currentRound : 1;
    return getRoundColorScheme(lastRound, gameState.maxRounds);
  }, [gameState?.currentRound, gameState?.maxRounds]);

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
            <Text variant="displaySmall" style={styles.emoji}>
              🗳️
            </Text>
          </Animated.View>
          <Text variant="headlineMedium" style={styles.title}>
            Votación
          </Text>
          {currentVoter ? (
            <Text variant="titleMedium" style={styles.subtitle}>
              {allComplete ? 'Todos han votado' : `${currentVoter.name} está votando`}
            </Text>
          ) : (
            <Text variant="bodyLarge" style={styles.subtitle}>
              Cargando...
            </Text>
          )}
        </Animated.View>

        {/* Información de votación */}
        {!allComplete && currentVoter && (
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={[
              styles.infoSection,
              roundColors && {
                borderColor: roundColors.accent,
                backgroundColor: roundColors.surface,
              },
            ]}
          >
            <Text variant="bodyLarge" style={styles.infoText}>
              🎯 ¿Quién crees que es el <Text style={styles.impostorText}>impostor</Text>?
            </Text>
            <Text variant="bodySmall" style={styles.helpText}>
              Selecciona un jugador. No puedes votar por ti mismo.
            </Text>
          </Animated.View>
        )}

        {/* Lista de jugadores para votar */}
        {!allComplete && currentVoter && (
          <>
            {isOnline && !isMyTurn ? (
              // MODO ONLINE: No es el turno del jugador
              <Animated.View
                entering={FadeInUp.delay(600).springify()}
                style={styles.waitingSection}
              >
                <Card style={styles.waitingCard} mode="outlined">
                  <Card.Content style={styles.waitingContent}>
                    <Text variant="displaySmall" style={styles.waitingEmoji}>
                      ⏳
                    </Text>
                    <Text variant="bodyLarge" style={styles.waitingText}>
                      {currentVoter?.name} está votando...
                    </Text>
                    <Text variant="bodyMedium" style={styles.waitingSubtext}>
                      Espera tu turno para votar
                    </Text>
                  </Card.Content>
                </Card>
              </Animated.View>
            ) : (
              // Es el turno del jugador (modo local o online cuando es su turno)
              <View style={styles.playersSection}>
                {availablePlayers.map((player) => (
                  <PlayerVoteItem
                    key={player.id}
                    player={player}
                    onVote={handleVote}
                    isSelected={selectedTarget === player.id}
                    voteCount={currentVoteCount[player.id] || 0}
                    canVote={isMyTurn || !isOnline}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Resumen de votos (si todos votaron) */}
        {allComplete && votingResults && (
          <Animated.View
            entering={FadeInUp.delay(800).springify()}
            style={styles.resultsSection}
          >
            <Text variant="headlineSmall" style={styles.resultsTitle}>
              Resultados de la Votación
            </Text>
            <View style={styles.votesList}>
              {roleAssignment.players.map((player, index) => {
                const count = votingResults.voteCounts[player.id] || 0;
                const isMostVoted = votingResults.mostVoted === player.id;
                
                return (
                  <Animated.View
                    key={player.id}
                    entering={FadeInDown.delay(1000 + index * 100).springify()}
                  >
                    <Card
                      style={[
                        styles.voteResultCard,
                        isMostVoted && styles.voteResultCardHighlighted,
                      ]}
                      mode={isMostVoted ? "elevated" : "outlined"}
                    >
                      <Card.Content style={styles.voteResultContent}>
                        <Text variant="titleMedium" style={styles.voteResultName}>
                          {player.name}
                        </Text>
                        <Text
                          variant="headlineSmall"
                          style={[
                            styles.voteCount,
                            isMostVoted && styles.voteCountHighlighted,
                          ]}
                        >
                          {count} {count === 1 ? 'voto' : 'votos'}
                        </Text>
                        {isMostVoted && (
                          <Text variant="bodySmall" style={styles.mostVotedText}>
                            Más votado
                          </Text>
                        )}
                      </Card.Content>
                    </Card>
                  </Animated.View>
                );
              })}
            </View>
            {votingResults.isTie && (
              <Text variant="bodyMedium" style={styles.tieText}>
                ¡Empate! Hay múltiples jugadores con la misma cantidad de votos.
              </Text>
            )}
          </Animated.View>
        )}

        {/* Botones de acción */}
        <Animated.View
          entering={FadeInUp.delay(1200).springify()}
          style={styles.actions}
        >
          {!allComplete && currentVoter && (
            <>
              {selectedTarget ? (
                <Button
                  mode="contained"
                  onPress={handleNextVoter}
                  disabled={isOnline && !isMyTurn}
                  style={[
                    styles.actionButton,
                    roundColors && {
                      backgroundColor: roundColors.accent,
                    },
                  ]}
                  contentStyle={styles.buttonContent}
                  labelStyle={styles.buttonLabel}
                  icon="check"
                >
                  Confirmar Voto
                </Button>
              ) : (
                <View style={styles.requiredVoteContainer}>
                  <Text variant="bodyMedium" style={styles.requiredVoteText}>
                    ⚠️ Debes seleccionar un jugador para continuar
                  </Text>
                </View>
              )}
            </>
          )}
          {allComplete && (
            <Button
              mode="contained"
              onPress={async () => {
                // En modo online, el backend ya cambió automáticamente la fase a results
                // La navegación se manejará automáticamente con useOnlineNavigation
                // Solo necesitamos navegar manualmente en modo local
                if (isOnline) {
                  // No hacer nada, useOnlineNavigation navegará automáticamente
                  // cuando detecte que gameState.phase === 'results'
                } else if (localGame) {
                  localGame.finishVoting();
                  navigation.navigate('Results', { mode, roomCode: route.params?.roomCode });
                }
              }}
              style={[
                styles.actionButton,
                roundColors && {
                  backgroundColor: roundColors.accent,
                },
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              icon="trophy"
            >
              Ver Resultados Finales
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
  infoSection: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    ...theme.shadows.medium,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  helpText: {
    textAlign: 'center',
  },
  playersSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  playerCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.medium,
  },
  playerCardDisabled: {
    opacity: 0.5,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  avatarSelected: {
    backgroundColor: theme.colors.accent,
  },
  avatarText: {
    fontWeight: theme.typography.weights.bold,
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  selectedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  resultsTitle: {
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  votesList: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  voteResultCard: {
    marginBottom: theme.spacing.sm,
  },
  voteResultCardHighlighted: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent + '20',
  },
  voteResultContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  voteResultName: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  voteCount: {
    color: theme.colors.textSecondary,
  },
  voteCountHighlighted: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  mostVotedText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  tieText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  requiredVoteText: {
    textAlign: 'center',
    fontWeight: '600',
    color: theme.colors.warning,
  },
  buttonLabel: {
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
  requiredVoteContainer: {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.warningLight + '20',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: theme.colors.warningLight + '60',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  requiredVoteText: {
    textAlign: 'center',
    fontWeight: theme.typography.weights.semibold,
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  waitingSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  waitingCard: {
    backgroundColor: theme.colors.surface + '80',
    borderColor: theme.colors.border,
  },
  waitingContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  waitingEmoji: {
    marginBottom: theme.spacing.md,
    fontSize: 48,
  },
  waitingText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: '600',
  },
  waitingSubtext: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});
