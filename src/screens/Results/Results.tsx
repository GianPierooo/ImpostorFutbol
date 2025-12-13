import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Results'>;

export const ResultsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    gameState,
    roleAssignment,
    votes,
    getVotingResults,
    getGameWinner,
    resetGame,
  } = useGame();

  const votingResults = getVotingResults();
  const gameWinner = getGameWinner();

  const handleNewGame = () => {
    resetGame();
    navigation.navigate('Home');
  };

  const handlePlayAgain = () => {
    resetGame();
    navigation.navigate('Lobby');
  };

  // Si no hay estado del juego, mostrar error
  if (!gameState || !roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Typography variant="h2" style={styles.title}>
            Error
          </Typography>
          <Typography variant="body" color={theme.colors.error}>
            No se pudo cargar los resultados. Vuelve al inicio.
          </Typography>
          <Button
            title="Volver al Inicio"
            variant="accent"
            onPress={handleNewGame}
            style={styles.button}
          />
        </View>
      </ScreenContainer>
    );
  }

  const impostor = roleAssignment.players.find((p) => p.id === roleAssignment.impostorId);
  const impostorName = impostor?.name || 'Desconocido';
  const secretWord = roleAssignment.secretWord;

  // Generar avatar con iniciales
  const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Typography variant="h1" style={styles.emoji}>
              🏆
            </Typography>
          </View>
          <Typography variant="h1" style={styles.title}>
            Resultados
          </Typography>
        </View>

        {/* Ganador */}
        {gameWinner && (
          <View style={styles.winnerSection}>
            {gameWinner.winner === 'group' ? (
              <View style={[styles.winnerCard, styles.winnerCardGroup]}>
                <Typography variant="h2" color={theme.colors.success} style={styles.winnerTitle}>
                  ¡Ganan los Jugadores!
                </Typography>
                <Typography variant="bodyLarge" color={theme.colors.text} style={styles.winnerSubtitle}>
                  Descubrieron al impostor correctamente
                </Typography>
              </View>
            ) : (
              <View style={[styles.winnerCard, styles.winnerCardImpostor]}>
                <Typography variant="h2" color={theme.colors.error} style={styles.winnerTitle}>
                  ¡Gana el Impostor!
                </Typography>
                <Typography variant="bodyLarge" color={theme.colors.text} style={styles.winnerSubtitle}>
                  El impostor logró engañar a todos
                </Typography>
              </View>
            )}
          </View>
        )}

        {/* Información del Impostor */}
        <View style={styles.infoSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            El Impostor era:
          </Typography>
          <View style={styles.impostorCard}>
            <View style={styles.impostorAvatar}>
              <Typography variant="h3" color={theme.colors.textLight} style={styles.impostorInitials}>
                {getInitials(impostorName)}
              </Typography>
            </View>
            <Typography variant="h2" color={theme.colors.error} style={styles.impostorName}>
              {impostorName}
            </Typography>
          </View>
        </View>

        {/* Palabra Secreta */}
        <View style={styles.infoSection}>
          <Typography variant="h3" style={styles.sectionTitle}>
            La Palabra Secreta era:
          </Typography>
          <View style={styles.secretWordCard}>
            <Typography variant="h1" color={theme.colors.accent} style={styles.secretWordText}>
              {secretWord}
            </Typography>
          </View>
        </View>

        {/* Resultados de Votación */}
        {votingResults && (
          <View style={styles.infoSection}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Resultados de la Votación
            </Typography>
            <View style={styles.votesList}>
              {roleAssignment.players.map((player) => {
                const voteCount = votingResults.voteCounts[player.id] || 0;
                const isMostVoted = votingResults.mostVoted === player.id;
                const isImpostor = player.id === roleAssignment.impostorId;

                return (
                  <View
                    key={player.id}
                    style={[
                      styles.voteResultCard,
                      isMostVoted && styles.voteResultCardHighlighted,
                      isImpostor && styles.voteResultCardImpostor,
                    ]}
                  >
                    <View style={styles.voteResultHeader}>
                      <View style={styles.voteResultInfo}>
                        <View style={[styles.smallAvatar, isImpostor && styles.smallAvatarImpostor]}>
                          <Typography variant="caption" color={theme.colors.textLight}>
                            {getInitials(player.name)}
                          </Typography>
                        </View>
                        <Typography variant="bodyLarge" style={styles.voteResultName}>
                          {player.name}
                        </Typography>
                        {isImpostor && (
                          <Typography variant="caption" color={theme.colors.error} style={styles.impostorBadge}>
                            IMPOSTOR
                          </Typography>
                        )}
                      </View>
                      <Typography
                        variant="h3"
                        color={isMostVoted ? theme.colors.accent : theme.colors.textSecondary}
                      >
                        {voteCount}
                      </Typography>
                    </View>
                    {isMostVoted && (
                      <Typography variant="caption" color={theme.colors.accent} style={styles.mostVotedLabel}>
                        Más votado
                      </Typography>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Detalle de Votos */}
        {votes.length > 0 && (
          <View style={styles.infoSection}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Detalle de Votos
            </Typography>
            <View style={styles.votesDetailList}>
              {votes.map((vote) => {
                const voter = roleAssignment.players.find((p) => p.id === vote.voterId);
                const target = roleAssignment.players.find((p) => p.id === vote.targetId);
                const isTargetImpostor = vote.targetId === roleAssignment.impostorId;

                return (
                  <View key={`${vote.voterId}-${vote.targetId}`} style={styles.voteDetailCard}>
                    <Typography variant="body" style={styles.voteDetailText}>
                      <Typography variant="body" style={styles.voteDetailName}>
                        {vote.voterName}
                      </Typography>
                      {' votó por '}
                      <Typography
                        variant="body"
                        color={isTargetImpostor ? theme.colors.error : theme.colors.accent}
                        style={styles.voteDetailName}
                      >
                        {vote.targetName}
                      </Typography>
                      {isTargetImpostor && (
                        <Typography variant="caption" color={theme.colors.error}>
                          {' (Impostor)'}
                        </Typography>
                      )}
                    </Typography>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Botones de Acción */}
        <View style={styles.actions}>
          <Button
            title="Jugar Otra Vez"
            variant="accent"
            onPress={handlePlayAgain}
            style={styles.actionButton}
          />
          <Button
            title="Nueva Partida"
            variant="secondary"
            onPress={handleNewGame}
            style={styles.actionButton}
          />
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
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.accent,
    ...theme.shadows.large,
  },
  secretWordText: {
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  votesList: {
    width: '100%',
  },
  voteResultCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  voteResultCardHighlighted: {
    borderColor: theme.colors.accent,
  },
  voteResultCardImpostor: {
    borderColor: theme.colors.error,
  },
  voteResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  voteResultInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  smallAvatarImpostor: {
    backgroundColor: theme.colors.error,
  },
  voteResultName: {
    flex: 1,
    fontWeight: theme.typography.weights.semibold,
  },
  impostorBadge: {
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.weights.bold,
  },
  mostVotedLabel: {
    marginTop: theme.spacing.xs,
    fontWeight: theme.typography.weights.semibold,
  },
  votesDetailList: {
    width: '100%',
  },
  voteDetailCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.small,
  },
  voteDetailText: {
    textAlign: 'center',
  },
  voteDetailName: {
    fontWeight: theme.typography.weights.semibold,
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
});
