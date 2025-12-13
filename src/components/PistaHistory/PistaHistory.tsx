import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '../Typography';
import { theme } from '../../theme';
import { Pista } from '../../types';

interface PistaHistoryProps {
  pistas: Pista[];
  currentRound: number;
}

interface PistaItemProps {
  pista: Pista;
}

const PistaItem: React.FC<PistaItemProps> = ({ pista }) => {
  return (
    <View style={styles.pistaCard}>
      <View style={styles.pistaHeader}>
        <Typography variant="body" style={styles.playerName}>
          {pista.playerName}
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          Turno {pista.turn}
        </Typography>
      </View>
      <Typography variant="body" color={theme.colors.text} style={styles.pistaText}>
        {pista.text}
      </Typography>
    </View>
  );
};

export const PistaHistory: React.FC<PistaHistoryProps> = ({ pistas, currentRound }) => {
  const roundPistas = pistas.filter((p) => p.round === currentRound);

  if (roundPistas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.emptyText}>
          Aún no hay pistas en esta ronda
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          Los jugadores comenzarán a dar pistas
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Typography variant="h4" style={styles.title}>
        Historial de Pistas
      </Typography>
      <View style={styles.listContent}>
        {roundPistas.map((pista) => (
          <PistaItem key={pista.id} pista={pista} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  pistaCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    ...theme.shadows.small,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  playerName: {
    fontWeight: theme.typography.weights.semibold,
  },
  pistaText: {
    marginTop: theme.spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
  },
  emptyText: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
});

