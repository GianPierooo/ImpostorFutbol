/**
 * Pantalla de Resultados - MODO LOCAL
 * 
 * IMPORTANTE: Esta pantalla SOLO maneja el modo local.
 * No tiene ninguna dependencia del modo online.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Text, Button, Card, Avatar } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji } from '../../components';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { getPlayerColor } from '../../utils';

type Props = NativeStackScreenProps<NavigationParamList, 'Results'>;

export const ResultsLocalScreen: React.FC<Props> = ({ navigation }) => {
  // Usar SOLO el contexto local
  const localGame = useGame();
  
  const gameState = localGame.gameState;
  const roleAssignment = localGame.roleAssignment;
  const votes = localGame.votes || [];
  const votingResults = localGame.getVotingResults();
  const gameWinner = localGame.getGameWinner();

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Text variant="headlineSmall" style={styles.title}>
            Error
          </Text>
          <Text variant="bodyLarge" style={styles.errorText}>
            No se pudo cargar los resultados. Vuelve al lobby.
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

  const impostor = roleAssignment.players.find((p) => p.id === roleAssignment.impostorId);
  const impostorName = impostor?.name || 'Desconocido';
  const secretWord = roleAssignment.secretWord;

  /**
   * Función para obtener iniciales - MODO LOCAL
   * Implementación específica para modo local
   */
  const getInitialsLocal = (name: string): string => {
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

  const handleNewGame = () => {
    localGame.resetGame();
    navigation.navigate('Home');
  };

  const handlePlayAgain = () => {
    localGame.resetGame();
    navigation.navigate('Lobby');
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
            <AnimatedEmoji emoji="🏆" animation="pulse" size={48} duration={3500} />
          </Animated.View>
          <Text variant="headlineMedium" style={styles.title}>
            Resultados
          </Text>
        </Animated.View>

        {/* Ganador */}
        {gameWinner && (
          <Animated.View
            entering={FadeInUp.delay(600).springify()}
            style={styles.winnerSection}
          >
            {gameWinner.winner === 'group' ? (
              <Card style={[styles.winnerCard, styles.winnerCardGroup]} mode="elevated">
                <Card.Content style={styles.winnerContent}>
                  <Text variant="headlineSmall" style={[styles.winnerTitle, styles.winnerTitleSuccess]}>
                    ¡Ganan los Jugadores!
                  </Text>
                  <Text variant="bodyLarge" style={styles.winnerSubtitle}>
                    Descubrieron al <Text style={styles.impostorText}>impostor</Text> correctamente
                  </Text>
                </Card.Content>
              </Card>
            ) : (
              <Card style={[styles.winnerCard, styles.winnerCardImpostor]} mode="elevated">
                <Card.Content style={styles.winnerContent}>
                  <Text variant="headlineSmall" style={[styles.winnerTitle, styles.winnerTitleError]}>
                    ¡Gana el <Text style={styles.impostorText}>Impostor</Text>!
                  </Text>
                  <Text variant="bodyLarge" style={styles.winnerSubtitle}>
                    El <Text style={styles.impostorText}>impostor</Text> logró engañar a todos
                  </Text>
                </Card.Content>
              </Card>
            )}
          </Animated.View>
        )}

        {/* Información del Impostor */}
        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.infoSection}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            El <Text style={styles.impostorText}>Impostor</Text> era:
          </Text>
          <Card style={styles.impostorCard} mode="elevated">
            <Card.Content style={styles.impostorCardContent}>
              <Avatar.Text
                size={80}
                label={getInitialsLocal(impostorName)}
                style={[
                  styles.impostorAvatar,
                  impostor && { backgroundColor: getPlayerColor(impostor.id) }
                ]}
              />
              <Text variant="headlineSmall" style={[styles.impostorName, styles.impostorNameText]}>
                {impostorName}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Palabra Secreta */}
        <Animated.View
          entering={FadeInUp.delay(1000).springify()}
          style={styles.infoSection}
        >
          <Text variant="titleLarge" style={styles.sectionTitle}>
            La Palabra Secreta era:
          </Text>
          <Card style={styles.secretWordCard} mode="elevated">
            <Card.Content style={styles.secretWordContent}>
              <Text variant="displaySmall" style={styles.secretWordText}>
                {secretWord}
              </Text>
            </Card.Content>
          </Card>
        </Animated.View>

        {/* Resultados de Votación */}
        {votingResults && (
          <Animated.View
            entering={FadeInUp.delay(1200).springify()}
            style={styles.infoSection}
          >
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Resultados de la Votación
            </Text>
            <View style={styles.votesList}>
              {roleAssignment.players.map((player, index) => {
                const voteCount = votingResults.voteCounts[player.id] || 0;
                const isMostVoted = votingResults.mostVoted === player.id;
                const isImpostor = player.id === roleAssignment.impostorId;

                return (
                  <Animated.View
                    key={player.id}
                    entering={FadeInDown.delay(1400 + index * 100).springify()}
                  >
                    <Card
                      style={[
                        styles.voteResultCard,
                        isMostVoted && styles.voteResultCardHighlighted,
                        isImpostor && styles.voteResultCardImpostor,
                      ]}
                      mode={isMostVoted ? "elevated" : "outlined"}
                    >
                      <Card.Content style={styles.voteResultContent}>
                        <View style={styles.voteResultInfoContainer}>
                          <Avatar.Text
                            size={56}
                            label={getInitialsLocal(player.name)}
                            style={[
                              styles.resultAvatar,
                              { backgroundColor: getPlayerColor(player.id) },
                              isImpostor && styles.resultAvatarImpostor
                            ]}
                          />
                          <View style={styles.resultPlayerDetails}>
                            <Text variant="titleMedium" style={styles.voteResultName}>
                              {player.name}
                            </Text>
                            {isImpostor && (
                              <Text variant="bodySmall" style={styles.impostorBadgeText}>
                                IMPOSTOR
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.voteCountContainer}>
                          <Text
                            variant="headlineSmall"
                            style={[
                              styles.voteCount,
                              isMostVoted && styles.voteCountHighlighted,
                            ]}
                          >
                            {voteCount}
                          </Text>
                          {isMostVoted && (
                            <Text variant="bodySmall" style={styles.mostVotedLabel}>
                              Más votado
                            </Text>
                          )}
                        </View>
                      </Card.Content>
                    </Card>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Detalle de Votos */}
        {votes.length > 0 && (
          <Animated.View
            entering={FadeInUp.delay(1600).springify()}
            style={styles.infoSection}
          >
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Detalle de Votos
            </Text>
            <View style={styles.votesDetailList}>
              {votes.map((vote, index) => {
                const voter = roleAssignment.players.find((p) => p.id === vote.voterId);
                const target = roleAssignment.players.find((p) => p.id === vote.targetId);
                const isTargetImpostor = vote.targetId === roleAssignment.impostorId;

                return (
                  <Animated.View
                    key={`${vote.voterId}-${vote.targetId}`}
                    entering={FadeInDown.delay(1800 + index * 50).springify()}
                  >
                    <Card style={styles.voteDetailCard} mode="outlined">
                      <Card.Content>
                        <Text variant="bodyMedium" style={styles.voteDetailText}>
                          <Text style={styles.voteDetailName}>{vote.voterName}</Text>
                          {' votó por '}
                          <Text
                            style={[
                              styles.voteDetailName,
                              isTargetImpostor ? styles.voteDetailImpostor : styles.voteDetailTarget,
                            ]}
                          >
                            {vote.targetName}
                          </Text>
                          {isTargetImpostor && (
                            <Text style={styles.impostorText}>
                              {' (Impostor)'}
                            </Text>
                          )}
                        </Text>
                      </Card.Content>
                    </Card>
                  </Animated.View>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Botones de Acción */}
        <Animated.View
          entering={FadeInUp.delay(2000).springify()}
          style={styles.actions}
        >
          <Button
            mode="contained"
            onPress={handlePlayAgain}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="replay"
            buttonColor={theme.colors.accent}
          >
            Jugar Otra Vez
          </Button>
          <Button
            mode="outlined"
            onPress={handleNewGame}
            style={styles.actionButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="home"
          >
            Nueva Partida
          </Button>
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.large,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  winnerSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  winnerCard: {
    borderRadius: 24,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    ...theme.shadows.large,
  },
  winnerCardGroup: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.success,
  },
  winnerCardImpostor: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.error,
  },
  winnerTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  winnerSubtitle: {
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  impostorCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.error,
    ...theme.shadows.large,
  },
  impostorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  impostorInitials: {
    fontWeight: theme.typography.weights.bold,
  },
  impostorName: {
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  secretWordCard: {
    marginTop: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  secretWordContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  secretWordText: {
    textAlign: 'center',
    color: theme.colors.accent,
    fontWeight: '700',
  },
  winnerContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  winnerTitleSuccess: {
    color: theme.colors.success,
  },
  winnerTitleError: {
    color: theme.colors.impostor,
  },
  votesList: {
    width: '100%',
  },
  voteResultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  voteResultCardHighlighted: {
    borderColor: theme.colors.accent,
    borderWidth: 3,
  },
  voteResultCardImpostor: {
    borderColor: theme.colors.error,
    borderWidth: 3,
  },
  voteResultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  voteResultInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  resultAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.small,
  },
  resultAvatarImpostor: {
    backgroundColor: theme.colors.error,
  },
  resultPlayerDetails: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteResultName: {
    fontWeight: theme.typography.weights.semibold,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  impostorBadgeText: {
    color: theme.colors.error,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  voteCountContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  voteCount: {
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  voteCountHighlighted: {
    color: theme.colors.accent,
    fontWeight: '700',
  },
  mostVotedLabel: {
    marginTop: theme.spacing.xs,
    color: theme.colors.accent,
    fontWeight: theme.typography.weights.semibold,
    fontSize: 12,
  },
  votesDetailList: {
    width: '100%',
  },
  voteDetailCard: {
    marginBottom: theme.spacing.sm,
  },
  voteDetailText: {
    textAlign: 'center',
    color: theme.colors.text,
  },
  voteDetailName: {
    fontWeight: '600',
  },
  voteDetailTarget: {
    color: theme.colors.accent,
  },
  voteDetailImpostor: {
    color: theme.colors.impostor,
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
  actions: {
    width: '100%',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  button: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  impostorCardContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  impostorNameText: {
    color: theme.colors.text,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '700',
  },
});

