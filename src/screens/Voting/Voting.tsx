import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
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

  return (
    <TouchableOpacity
      style={[
        styles.playerCard,
        isSelected && styles.playerCardSelected,
        !canVote && styles.playerCardDisabled,
      ]}
      onPress={() => canVote && onVote(player.id)}
      disabled={!canVote}
      activeOpacity={0.7}
    >
      <View style={styles.playerInfo}>
        <View style={[styles.avatar, isSelected && styles.avatarSelected]}>
          <Typography variant="body" color={theme.colors.textLight} style={styles.avatarText}>
            {initials}
          </Typography>
        </View>
        <View style={styles.playerDetails}>
          <Typography variant="bodyLarge" style={styles.playerName}>
            {player.name}
          </Typography>
          {voteCount > 0 && (
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {voteCount} {voteCount === 1 ? 'voto' : 'votos'}
            </Typography>
          )}
        </View>
      </View>
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Typography variant="caption" color={theme.colors.textLight}>
            ✓
          </Typography>
        </View>
      )}
    </TouchableOpacity>
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

  // Obtener jugadores disponibles para votar (excluyendo al votante actual)
  const availablePlayers = roleAssignment.players.filter(
    (p) => p.id !== (currentVoter?.id || '')
  );

  const handleVote = async (targetId: string) => {
    if (!currentVoter) return;

    setSelectedTarget(targetId);
    
    // Agregar voto según el modo
    if (isOnline && onlineGame) {
      await onlineGame.addVote(targetId);
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
      if (isOnline && onlineGame) {
        await onlineGame.changePhase('results');
      } else if (localGame) {
        localGame.finishVoting();
      }
      navigation.navigate('Results', { mode, roomCode: route.params?.roomCode });
    } else {
      // En modo online, el host controla la navegación
      // En modo local, avanzar al siguiente votante
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
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Typography variant="h1" style={styles.emoji}>
              🗳️
            </Typography>
          </View>
          <Typography variant="h2" style={styles.title}>
            Votación
          </Typography>
          {currentVoter ? (
            <Typography variant="bodyLarge" color={theme.colors.textSecondary}>
              {allComplete ? 'Todos han votado' : `${currentVoter.name} está votando`}
            </Typography>
          ) : (
            <Typography variant="body" color={theme.colors.textSecondary}>
              Cargando...
            </Typography>
          )}
        </View>

        {/* Información de votación */}
        {!allComplete && currentVoter && (
          <View style={[
            styles.infoSection,
            roundColors && {
              borderColor: roundColors.accent,
              backgroundColor: roundColors.surface,
            },
          ]}>
            <Typography variant="bodyLarge" color={theme.colors.text} style={styles.infoText}>
              🎯 ¿Quién crees que es el impostor?
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary} style={styles.helpText}>
              Selecciona un jugador. No puedes votar por ti mismo.
            </Typography>
          </View>
        )}

        {/* Lista de jugadores para votar */}
        {!allComplete && currentVoter && (
          <View style={styles.playersSection}>
            {availablePlayers.map((player) => (
              <PlayerVoteItem
                key={player.id}
                player={player}
                onVote={handleVote}
                isSelected={selectedTarget === player.id}
                voteCount={currentVoteCount[player.id] || 0}
                canVote={true}
              />
            ))}
          </View>
        )}

        {/* Resumen de votos (si todos votaron) */}
        {allComplete && votingResults && (
          <View style={styles.resultsSection}>
            <Typography variant="h3" style={styles.resultsTitle}>
              Resultados de la Votación
            </Typography>
            <View style={styles.votesList}>
              {roleAssignment.players.map((player) => {
                const count = votingResults.voteCounts[player.id] || 0;
                const isMostVoted = votingResults.mostVoted === player.id;
                
                return (
                  <View
                    key={player.id}
                    style={[
                      styles.voteResultCard,
                      isMostVoted && styles.voteResultCardHighlighted,
                    ]}
                  >
                    <Typography variant="bodyLarge" style={styles.voteResultName}>
                      {player.name}
                    </Typography>
                    <Typography
                      variant="h4"
                      color={isMostVoted ? theme.colors.accent : theme.colors.textSecondary}
                    >
                      {count} {count === 1 ? 'voto' : 'votos'}
                    </Typography>
                    {isMostVoted && (
                      <Typography variant="caption" color={theme.colors.accent}>
                        Más votado
                      </Typography>
                    )}
                  </View>
                );
              })}
            </View>
            {votingResults.isTie && (
              <Typography variant="body" color={theme.colors.warning} style={styles.tieText}>
                ¡Empate! Hay múltiples jugadores con la misma cantidad de votos.
              </Typography>
            )}
          </View>
        )}

        {/* Botones de acción */}
        <View style={styles.actions}>
          {!allComplete && currentVoter && (
            <>
              {selectedTarget ? (
                <Button
                  title="✅ Confirmar Voto"
                  variant="accent"
                  onPress={handleNextVoter}
                  style={[
                    styles.actionButton,
                    roundColors && {
                      backgroundColor: roundColors.accent,
                    },
                  ]}
                />
              ) : (
                <View style={styles.requiredVoteContainer}>
                  <Typography variant="body" color={theme.colors.warning} style={styles.requiredVoteText}>
                    ⚠️ Debes seleccionar un jugador para continuar
                  </Typography>
                </View>
              )}
            </>
          )}
          {allComplete && (
            <Button
              title="🏆 Ver Resultados Finales"
              variant="accent"
              onPress={async () => {
                if (isOnline && onlineGame) {
                  await onlineGame.changePhase('results');
                } else if (localGame) {
                  localGame.finishVoting();
                }
                navigation.navigate('Results', { mode, roomCode: route.params?.roomCode });
              }}
              style={[
                styles.actionButton,
                roundColors && {
                  backgroundColor: roundColors.accent,
                },
              ]}
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
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  voteResultCardHighlighted: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.surface,
  },
  voteResultName: {
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  tieText: {
    textAlign: 'center',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
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
});
