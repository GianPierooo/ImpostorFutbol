/**
 * Pantalla de Votación - MODO LOCAL
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Card, Avatar, Text, Button } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useGame } from '../../game';
import { theme, getRoundColorScheme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';
import { getPlayerColor, getInitials } from '../../utils';
import { hapticService } from '../../services/hapticService';

type Props = NativeStackScreenProps<NavigationParamList, 'Voting'>;

interface PlayerVoteItemLocalProps {
  player: Player;
  onVote: (playerId: string) => void;
  isSelected: boolean;
  voteCount: number;
  canVote: boolean;
}

/**
 * Componente de item de votación para MODO LOCAL
 * Implementación específica para modo local sin dependencias online
 */
const PlayerVoteItemLocal: React.FC<PlayerVoteItemLocalProps> = ({
  player,
  onVote,
  isSelected,
  voteCount,
  canVote,
}) => {
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

export const VotingLocalScreen: React.FC<Props> = ({ navigation }) => {
  // Usar SOLO el contexto local
  const localGame = useGame();
  
  const gameState = localGame.gameState;
  const roleAssignment = localGame.roleAssignment;
  const votes = localGame.votes || [];
  const currentVoter = localGame.getCurrentVoter();
  const votingResults = localGame.getVotingResults();
  const allVotesComplete = () => localGame.allVotesComplete();

  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [viewingVoterId, setViewingVoterId] = useState<string | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Iniciar vibración de latidos cuando se entra a la pantalla de votación
  useEffect(() => {
    if (!allComplete && currentVoter) {
      // Iniciar patrón de latidos de corazón
      hapticService.startHeartbeat();
      
      // Mantener el patrón activo con intervalos
      heartbeatIntervalRef.current = setInterval(() => {
        hapticService.startHeartbeat();
      }, 700); // Cada 700ms (aproximadamente el ritmo de un corazón)
    }
    
    // Limpiar cuando se desmonte o cuando todos hayan votado
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      hapticService.stop();
    };
  }, [allComplete, currentVoter]);

  // Detener latidos cuando todos han votado
  useEffect(() => {
    if (allComplete) {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
      }
      hapticService.stop();
    }
  }, [allComplete]);

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

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
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

  // Obtener jugadores disponibles para votar (excluyendo al votante actual)
  const availablePlayers = roleAssignment.players.filter(
    (p) => p.id !== (currentVoter?.id || '')
  );

  const handleVote = (targetId: string) => {
    if (!currentVoter) return;
    setSelectedTarget(targetId);
    localGame.addVote(currentVoter.id, targetId);
  };

  const handleNextVoter = () => {
    if (!selectedTarget) return;

    if (allVotesComplete()) {
      localGame.finishVoting();
      navigation.navigate('Results', { mode: 'local' });
    } else {
      localGame.nextVoter();
      setSelectedTarget(null);
      setViewingVoterId(null);
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
          <View style={styles.playersSection}>
            {availablePlayers.map((player) => (
              <PlayerVoteItemLocal
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
          {!allComplete && currentVoter && (
            <>
              {selectedTarget ? (
                <Button
                  mode="contained"
                  onPress={handleNextVoter}
                  style={[
                    styles.actionButton,
                    roundColors && { backgroundColor: roundColors.accent },
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
              onPress={() => {
                localGame.finishVoting();
                navigation.navigate('Results', { mode: 'local' });
              }}
              style={[
                styles.actionButton,
                roundColors && { backgroundColor: roundColors.accent },
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
  button: { width: '100%', marginTop: theme.spacing.lg },
});

