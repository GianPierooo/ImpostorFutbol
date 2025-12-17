import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer, Typography, Button, PlayerList } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { useOnlineGame } from '../../contexts';

type Props = NativeStackScreenProps<NavigationParamList, 'OnlineRoom'>;

export const OnlineRoomScreen: React.FC<Props> = ({ route, navigation }) => {
  const { code, playerId, playerName } = route.params;
  const {
    players,
    loading,
    isHost,
    roomState,
    startGame,
    leaveRoom,
    joinRoom,
  } = useOnlineGame();

  // Unirse a la sala cuando se monta
  useEffect(() => {
    const join = async () => {
      try {
        await joinRoom(code, playerId, playerName);
      } catch (error: any) {
        Alert.alert('Error', 'No se pudo unir a la sala');
        navigation.goBack();
      }
    };
    join();

    return () => {
      leaveRoom();
    };
  }, [code, playerId, playerName]);

  // Escuchar cuando el juego inicia
  useEffect(() => {
    if (roomState?.room?.status === 'roleAssignment') {
      navigation.replace('RoleAssignment', {
        players: players,
        config: roomState.room.config || { rounds: 3 },
      });
    }
  }, [roomState?.room?.status]);

  const handleStartGame = async () => {
    if (!isHost) {
      Alert.alert('Error', 'Solo el host puede iniciar el juego');
      return;
    }

    if (players.length < 3) {
      Alert.alert('Error', 'Se necesitan al menos 3 jugadores para iniciar');
      return;
    }

    try {
      await startGame();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar el juego');
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
              await leaveRoom();
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

