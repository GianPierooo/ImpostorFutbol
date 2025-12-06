import React from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { theme } from '../../theme';
import { Player } from '../../types';

interface PlayerListProps {
  players: Player[];
  onRemove: (id: string) => void;
}

interface PlayerItemProps {
  player: Player;
  onRemove: (id: string) => void;
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
    <View style={styles.playerCard}>
      <View style={styles.playerInfo}>
        <View style={styles.avatar}>
          <Typography variant="body" color={theme.colors.textLight} style={styles.avatarText}>
            {initials}
          </Typography>
        </View>
        <Typography variant="bodyLarge" style={styles.playerName}>
          {player.name}
        </Typography>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => onRemove(player.id)}
        activeOpacity={0.7}
      >
        <Typography variant="body" color={theme.colors.error}>
          Eliminar
        </Typography>
      </TouchableOpacity>
    </View>
  );
};

export const PlayerList: React.FC<PlayerListProps> = ({ players, onRemove }) => {
  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.emptyText}>
          No hay jugadores añadidos
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          Añade al menos 3 jugadores para comenzar
        </Typography>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Typography variant="h4" style={styles.countText}>
          Jugadores ({players.length})
        </Typography>
        <Typography variant="caption" color={theme.colors.textSecondary}>
          {players.length < 3
            ? `Necesitas ${3 - players.length} más para comenzar`
            : 'Listo para comenzar'}
        </Typography>
      </View>
      
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlayerItem player={item} onRemove={onRemove} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  countText: {
    marginBottom: theme.spacing.xs,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontWeight: theme.typography.weights.bold,
  },
  playerName: {
    flex: 1,
  },
  removeButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
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
  },
});

