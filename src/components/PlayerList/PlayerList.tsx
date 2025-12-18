import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Avatar, Text, IconButton } from 'react-native-paper';
import { theme } from '../../theme';
import { Player } from '../../types';

interface PlayerListProps {
  players: Player[];
  onRemove?: (id: string) => void;
}

interface PlayerItemProps {
  player: Player;
  onRemove?: (id: string) => void;
}

const PlayerItem: React.FC<PlayerItemProps> = ({ player, onRemove }) => {
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
    <Card style={styles.playerCard} mode="elevated">
      <Card.Content style={styles.cardContent}>
        <Avatar.Text
          size={40}
          label={initials}
          style={styles.avatar}
        />
        <View style={styles.playerInfo}>
          <Text variant="titleMedium" style={styles.playerName}>
            {player.name}
          </Text>
        </View>
        {onRemove && (
          <IconButton
            icon="close"
            size={20}
            iconColor={theme.colors.error}
            style={styles.removeButton}
            onPress={() => onRemove(player.id)}
          />
        )}
      </Card.Content>
    </Card>
  );
};

export const PlayerList: React.FC<PlayerListProps> = ({ players, onRemove }) => {
  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No hay jugadores añadidos
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          Añade al menos 3 jugadores para comenzar
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.countText}>
          Jugadores ({players.length})
        </Text>
        <Text variant="bodySmall" style={styles.statusText}>
          {players.length < 3
            ? `Necesitas ${3 - players.length} más para comenzar`
            : 'Listo para comenzar'}
        </Text>
      </View>
      
      <View style={styles.listContent}>
        {players.map((player) => (
          <PlayerItem key={player.id} player={player} onRemove={onRemove} />
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
  header: {
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  countText: {
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
    fontSize: 16,
    color: theme.colors.text,
  },
  statusText: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  listContent: {
    gap: theme.spacing.xs,
  },
  playerCard: {
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
  },
  avatar: {
    backgroundColor: theme.colors.primary, // Verde para avatares
    marginRight: theme.spacing.sm,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 16,
  },
  removeButton: {
    margin: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing['3xl'],
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

