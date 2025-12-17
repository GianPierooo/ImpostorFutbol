import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer, Typography, Button, PlayerList } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';
import { roomsAPI, gamesAPI, socketService } from '../../services';
import { GameConfig } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'OnlineRoom'>;

export const OnlineRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { code, playerId, playerName } = route.params;
  const [roomState, setRoomState] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [config, setConfig] = useState<GameConfig>({ rounds: 3 });

  // Cargar estado inicial
  useEffect(() => {
    loadRoomState();
    connectSocket();
    
    return () => {
      socketService.leaveRoom(code, playerId);
    };
  }, []);

  const loadRoomState = async () => {
    try {
      const result = await roomsAPI.get(code);
      if (result.success && result.data) {
        setRoomState(result.data);
        setPlayers(result.data.players || []);
        setIsHost(result.data.room?.hostId === playerId);
        if (result.data.room?.config) {
          setConfig(result.data.room.config);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo cargar la sala');
    }
  };

  const connectSocket = () => {
    socketService.connect();
    socketService.joinRoom(code, playerId);

    // Escuchar eventos
    socketService.on('room_updated', (data: any) => {
      if (data.roomState) {
        setRoomState(data.roomState);
        setPlayers(data.roomState.players || []);
      }
    });

    socketService.on('player_joined', (data: any) => {
      loadRoomState();
    });

    socketService.on('player_left', (data: any) => {
      loadRoomState();
    });

    socketService.on('game_state_changed', (data: any) => {
      // El juego comenzó, navegar a RoleAssignment
      navigation.replace('RoleAssignment', {
        players: data.roleAssignment?.players || [],
        config: config,
      });
    });

    socketService.on('error', (data: any) => {
      Alert.alert('Error', data.message || 'Ocurrió un error');
    });
  };

  const handleStartGame = async () => {
    if (!isHost) {
      Alert.alert('Error', 'Solo el host puede iniciar el juego');
      return;
    }

    if (players.length < 3) {
      Alert.alert('Error', 'Se necesitan al menos 3 jugadores para iniciar');
      return;
    }

    setLoading(true);
    try {
      const result = await gamesAPI.start(code, playerId);
      if (result.success) {
        // El WebSocket notificará el cambio y navegará automáticamente
        socketService.startGame(code, playerId);
      } else {
        Alert.alert('Error', result.error || 'No se pudo iniciar el juego');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar el juego');
    } finally {
      setLoading(false);
    }
  };

  const handleLeave = async () => {
    Alert.alert(
      'Salir de la sala',
      '¿Estás seguro de que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await roomsAPI.leave(code, playerId);
              socketService.leaveRoom(code, playerId);
              navigation.goBack();
            } catch (error: any) {
              Alert.alert('Error', 'Error al salir de la sala');
            }
          },
        },
      ]
    );
  };

  const canStart = isHost && players.length >= 3 && roomState?.room?.status === 'lobby';

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            🎮 Sala Online
          </Typography>
          <View style={styles.codeContainer}>
            <Typography variant="caption" color={theme.colors.textSecondary} style={styles.codeLabel}>
              Código de la sala:
            </Typography>
            <Typography variant="h1" color={theme.colors.accent} style={styles.code}>
              {code}
            </Typography>
          </View>
          {isHost && (
            <Typography variant="caption" color={theme.colors.accent} style={styles.hostBadge}>
              👑 Eres el host
            </Typography>
          )}
        </View>

        {/* Lista de jugadores */}
        <View style={styles.playersSection}>
          <PlayerList
            players={players.map(p => ({ id: p.id, name: p.name }))}
            onRemove={() => {}} // No se puede eliminar en modo online
          />
          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.playerCount}>
            {players.length} / 10 jugadores
          </Typography>
        </View>

        {/* Información */}
        <View style={styles.infoSection}>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.infoText}>
            {players.length < 3
              ? `Esperando más jugadores... (${3 - players.length} más necesario${players.length === 2 ? '' : 's'})`
              : 'Listo para comenzar'}
          </Typography>
        </View>

        {/* Botón iniciar (solo host) */}
        {isHost && (
          <View style={styles.actions}>
            <Button
              title="🚀 Iniciar Partida"
              variant="accent"
              onPress={handleStartGame}
              disabled={!canStart || loading}
              loading={loading}
              style={styles.startButton}
            />
          </View>
        )}

        {/* Botón salir */}
        <View style={styles.footer}>
          <Button
            title="Salir de la Sala"
            variant="secondary"
            onPress={handleLeave}
            disabled={loading}
            style={styles.leaveButton}
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
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  codeLabel: {
    marginBottom: theme.spacing.xs,
  },
  code: {
    fontSize: 48,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 8,
    ...theme.shadows.medium,
  },
  hostBadge: {
    marginTop: theme.spacing.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  playersSection: {
    flex: 1,
    minHeight: 200,
    marginBottom: theme.spacing.lg,
  },
  playerCount: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  infoSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  startButton: {
    width: '100%',
  },
  footer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  leaveButton: {
    width: '100%',
  },
});

