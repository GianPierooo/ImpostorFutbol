/**
 * Pantalla de Votación - MODO ONLINE
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo online.
 * No tiene ninguna dependencia del modo local.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card, Avatar, Text, Button } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useOnlineGame } from '../../contexts';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';
import { getPlayerColor } from '../../utils';

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
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ').filter(w => w.length > 0);
    if (words.length >= 2 && words[0].length > 0 && words[1].length > 0) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    const trimmedName = name.trim();
    if (trimmedName.length >= 2) {
      return trimmedName.substring(0, 2).toUpperCase();
    }
    return trimmedName.toUpperCase() || '??';
  };

  const initials = getInitials(player.name);
  const playerColor = getPlayerColor(player.id);
  const delay = (player.name.charCodeAt(0) % 200);
  
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
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
          <View style={styles.playerInfoContainer}>
            <Avatar.Text
              size={56}
              label={initials}
              style={[
                styles.avatar,
                { backgroundColor: playerColor },
                isSelected && styles.avatarSelected,
              ]}
            />
            <View style={styles.playerDetails}>
              <Text variant="titleMedium" style={styles.playerName}>
                {player.name}
              </Text>
              {voteCount > 0 && (
                <Text variant="bodySmall" style={styles.playerVoteCount}>
                  {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
                </Text>
              )}
            </View>
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

export const VotingOnlineScreen: React.FC<Props> = ({ navigation, route }) => {
  // Usar SOLO el contexto online
  const onlineGame = useOnlineGame();
  
  // Usar navegación automática online
  useOnlineNavigation();
  
  const gameState = onlineGame.gameState;
  const roleAssignment = onlineGame.roleAssignment;
  const votes = onlineGame.votes || [];
  const votingResults = onlineGame.getVotingResults();
  const roomCode = route.params?.roomCode || onlineGame.roomCode;

  // Obtener el votante actual
  const getCurrentVoter = () => {
    if (!onlineGame || !roleAssignment || gameState?.currentVoterIndex === undefined) return null;
    
    if (gameState.currentVoterIndex >= roleAssignment.players.length || gameState.currentVoterIndex < 0) {
      console.warn(`⚠️ currentVoterIndex (${gameState.currentVoterIndex}) fuera de rango (0-${roleAssignment.players.length - 1})`);
      return null;
    }
    
    return roleAssignment.players[gameState.currentVoterIndex] || null;
  };

  // Verificar si todos los jugadores han votado
  const allVotesComplete = () => {
    if (!onlineGame || !roleAssignment) return false;
    const currentPlayers = roleAssignment.players;
    return currentPlayers.every(p => onlineGame.votes.some(v => v.voterId === p.id));
  };

  // Verificar si es el turno del jugador actual
  const isMyTurn = (() => {
    if (!gameState || !onlineGame.playerId || !roleAssignment) return false;
    
    if (gameState.currentVoterIndex >= roleAssignment.players.length || gameState.currentVoterIndex < 0) {
      console.warn(`⚠️ currentVoterIndex (${gameState.currentVoterIndex}) fuera de rango (0-${roleAssignment.players.length - 1})`);
      return false;
    }
    
    const currentVoterFromState = roleAssignment.players[gameState.currentVoterIndex];
    if (!currentVoterFromState) return false;
    
    return currentVoterFromState.id === onlineGame.playerId;
  })();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [viewingVoterId, setViewingVoterId] = useState<string | null>(null);

  const currentVoter = getCurrentVoter();

  // Inicializar el votante actual
  useEffect(() => {
    if (currentVoter && !viewingVoterId) {
      setViewingVoterId(currentVoter.id);
      const existingVote = votes.find((v) => v.voterId === currentVoter.id);
      if (existingVote) {
        setSelectedTarget(existingVote.targetId);
      }
    }
  }, [currentVoter, viewingVoterId, votes]);

  // Intentar cargar el estado si no está disponible
  const [loadingState, setLoadingState] = useState(false);
  useEffect(() => {
    if (onlineGame?.roomCode && onlineGame?.loadGameState && (!gameState || !roleAssignment) && !loadingState) {
      setLoadingState(true);
      const loadState = async () => {
        try {
          await onlineGame.loadGameState();
        } catch (error) {
          console.error('Error loading game state in Voting:', error);
        } finally {
          setLoadingState(false);
        }
      };
      loadState();
    }
  }, [onlineGame?.roomCode, onlineGame?.loadGameState, gameState, roleAssignment, loadingState]);

  // Si no hay estado del juego después de intentar cargarlo, mostrar loading
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Cargando...
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            Cargando estado del juego...
          </Text>
          <ActivityIndicator size="large" style={{ marginTop: 20 }} />
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
    
    try {
      await onlineGame.addVote(targetId);
      setSelectedTarget(null);
    } catch (error: any) {
      console.error('Error al votar:', error);
    }
  };

  const currentVoteCount = votingResults?.voteCounts || {};
  const allComplete = allVotesComplete();

  // Calcular esquema de colores según la ronda
  const roundColors = useMemo(() => {
    if (!gameState) return null;
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
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
          <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.iconContainer}>
            <AnimatedEmoji emoji="🗳️" animation="pulse" size={48} duration={3500} />
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
              ¿Quién crees que es el <Text style={styles.impostorText}>impostor</Text>?
            </Text>
            <Text variant="bodySmall" style={styles.helpText}>
              Selecciona un jugador. No puedes votar por ti mismo.
            </Text>
          </Animated.View>
        )}

        {/* Lista de jugadores para votar */}
        {!allComplete && currentVoter && (
          <>
            {!isMyTurn ? (
              // No es el turno del jugador
              <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.waitingSection}>
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
              // Es el turno del jugador
              <View style={styles.playersSection}>
                {availablePlayers.map((player) => (
                  <PlayerVoteItem
                    key={player.id}
                    player={player}
                    onVote={handleVote}
                    isSelected={selectedTarget === player.id}
                    voteCount={currentVoteCount[player.id] || 0}
                    canVote={isMyTurn}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Resumen de votos (si todos votaron) */}
        {allComplete && votingResults && (
          <Animated.View entering={FadeInUp.delay(800).springify()} style={styles.resultsSection}>
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
        <Animated.View entering={FadeInUp.delay(1200).springify()} style={styles.actions}>
          {allComplete && (
            <Text variant="bodyMedium" style={styles.waitingText}>
              Esperando a que el host continúe...
            </Text>
          )}
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: theme.spacing.xl },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: { marginBottom: theme.spacing.xl, alignItems: 'center' },
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
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: { textAlign: 'center', color: theme.colors.textSecondary },
  infoSection: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.accent,
    ...theme.shadows.medium,
  },
  infoText: { textAlign: 'center', marginBottom: theme.spacing.xs },
  helpText: { textAlign: 'center' },
  playersSection: { width: '100%', marginBottom: theme.spacing.xl },
  playerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  playerCardSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
    borderWidth: 3,
    ...theme.shadows.medium,
  },
  playerCardDisabled: { opacity: 0.5 },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    position: 'relative',
  },
  playerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  avatarSelected: { backgroundColor: theme.colors.accent },
  playerDetails: { alignItems: 'center', justifyContent: 'center' },
  playerName: {
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  playerVoteCount: { color: theme.colors.textSecondary, textAlign: 'center' },
  selectedBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: theme.colors.textLight, fontWeight: 'bold' },
  resultsSection: { width: '100%', marginBottom: theme.spacing.xl },
  resultsTitle: { marginBottom: theme.spacing.lg, textAlign: 'center' },
  votesList: { width: '100%', marginBottom: theme.spacing.md },
  voteResultCard: { marginBottom: theme.spacing.sm },
  voteResultCardHighlighted: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent + '20',
  },
  voteResultContent: { alignItems: 'center', paddingVertical: theme.spacing.md },
  voteResultName: {
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  voteCount: { color: theme.colors.textSecondary },
  voteCountHighlighted: { color: theme.colors.accent, fontWeight: '700' },
  mostVotedText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  impostorText: { color: theme.colors.impostor, fontWeight: '700' },
  errorText: {
    textAlign: 'center',
    color: theme.colors.error,
    marginBottom: theme.spacing.xl,
  },
  buttonContent: { paddingVertical: theme.spacing.sm },
  tieText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    color: theme.colors.warning,
    fontWeight: '600',
  },
  buttonLabel: { fontWeight: '700' },
  actions: { width: '100%', gap: theme.spacing.md },
  actionButton: { width: '100%' },
  waitingSection: { width: '100%', marginBottom: theme.spacing.lg },
  waitingCard: {
    backgroundColor: theme.colors.surface + '80',
    borderColor: theme.colors.border,
  },
  waitingContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  waitingEmoji: { marginBottom: theme.spacing.md, fontSize: 48 },
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

