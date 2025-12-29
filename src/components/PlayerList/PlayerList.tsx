import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Card, Avatar, Text, IconButton } from 'react-native-paper';
import { theme } from '../../theme';
import { Player } from '../../types';
import { getPlayerColor, getInitials } from '../../utils';

interface PlayerListProps {
  players: Player[];
  onRemove?: (id: string) => void;
  onPlayerLayout?: (playerId: string, x: number, y: number) => void;
  newPlayerId?: string;
}

interface PlayerItemProps {
  player: Player;
  onRemove?: (id: string) => void;
  onLayout?: (x: number, y: number) => void;
  isNew?: boolean;
}

const PlayerItem: React.FC<PlayerItemProps> = ({ player, onRemove, onLayout, isNew }) => {
  const cardRef = React.useRef<View>(null);
  const hasMeasuredRef = React.useRef(false);
  const measureTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const initials = getInitials(player.name);
  const playerColor = getPlayerColor(player.id);

  // Función para medir la posición (solo una vez)
  const measurePosition = React.useCallback(() => {
    if (isNew && onLayout && cardRef.current && !hasMeasuredRef.current) {
      hasMeasuredRef.current = true;
      
      // Limpiar timeout anterior si existe
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      
      // Reducir delay a 50ms para respuesta más rápida
      measureTimeoutRef.current = setTimeout(() => {
        if (cardRef.current) {
          cardRef.current.measure((x, y, width, height, pageX, pageY) => {
            // Validar que los valores sean números válidos antes de usarlos
            // Si alguno es NaN o undefined, no llamar onLayout
            if (
              typeof pageX === 'number' && 
              !isNaN(pageX) && 
              typeof pageY === 'number' && 
              !isNaN(pageY) &&
              typeof height === 'number' && 
              !isNaN(height) &&
              height > 0
            ) {
              // Calcular el centro del avatar
              const centerX = pageX + 40; // Avatar está a ~40px del inicio
              const centerY = pageY + height / 2;
              
              // Validar que los valores calculados también sean válidos
              if (!isNaN(centerX) && !isNaN(centerY) && isFinite(centerX) && isFinite(centerY)) {
                onLayout(centerX, centerY);
              }
            }
          });
        }
      }, 50);
    }
  }, [isNew, onLayout]);

  // Obtener posición cuando el componente se monta o cuando es nuevo
  React.useEffect(() => {
    if (isNew && !hasMeasuredRef.current) {
      measurePosition();
    }
    
    // Cleanup
    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
      }
      if (!isNew) {
        hasMeasuredRef.current = false;
      }
    };
  }, [isNew, measurePosition]);

  const handleLayout = React.useCallback(() => {
    // Solo medir si es nuevo y no se ha medido aún
    if (isNew && !hasMeasuredRef.current) {
      measurePosition();
    }
  }, [isNew, measurePosition]);

  return (
    <Animated.View entering={FadeInDown.delay(100)}>
      <View ref={cardRef} collapsable={false} onLayout={handleLayout}>
        <Card style={styles.playerCard} mode="elevated">
          <Card.Content style={styles.cardContent}>
            <Avatar.Text
              size={40}
              label={initials}
              style={[styles.avatar, { backgroundColor: playerColor }]}
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
      </View>
    </Animated.View>
  );
};

export const PlayerList: React.FC<PlayerListProps> = ({ players, onRemove, onPlayerLayout, newPlayerId }) => {
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
          <PlayerItem 
            key={player.id} 
            player={player} 
            onRemove={onRemove}
            isNew={player.id === newPlayerId}
            onLayout={(x, y) => {
              if (onPlayerLayout && player.id === newPlayerId) {
                onPlayerLayout(player.id, x, y);
              }
            }}
          />
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

