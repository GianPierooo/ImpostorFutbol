import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
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
    <Card style={styles.pistaCard} mode="elevated">
      <Card.Content>
        <View style={styles.pistaHeader}>
          <Text variant="titleMedium" style={styles.playerName}>
            {pista.playerName}
          </Text>
          <Chip 
            icon="clock" 
            style={styles.turnChip} 
            textStyle={styles.turnChipText}
            compact
          >
            Turno {pista.turn}
          </Chip>
        </View>
        <Text variant="bodyLarge" style={styles.pistaText}>
          {pista.text}
        </Text>
      </Card.Content>
    </Card>
  );
};

export const PistaHistory: React.FC<PistaHistoryProps> = ({ pistas, currentRound }) => {
  const roundPistas = pistas.filter((p) => p.round === currentRound);

  if (roundPistas.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          Aún no hay pistas en esta ronda
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Los jugadores comenzarán a dar pistas
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Historial de Pistas
      </Text>
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
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 20,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  pistaCard: {
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  pistaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  playerName: {
    fontWeight: '600',
    flex: 1,
    color: theme.colors.text,
    fontSize: 16,
  },
  turnChip: {
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
  },
  turnChipText: {
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  pistaText: {
    marginTop: theme.spacing.xs,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
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
    color: theme.colors.textSecondary,
  },
  emptySubtext: {
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
});

