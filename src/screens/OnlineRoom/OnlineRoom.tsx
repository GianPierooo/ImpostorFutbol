import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text, Chip, Portal, Dialog } from 'react-native-paper';
import { ScreenContainer, PlayerList } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { useOnlineGame } from '../../contexts';
import { useOnlineNavigation } from '../../hooks/useOnlineNavigation';

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

  const [showLeaveDialog, setShowLeaveDialog] = React.useState(false);
  const [errorDialog, setErrorDialog] = React.useState({ visible: false, message: '' });

  // Unirse a la sala cuando se monta
  useEffect(() => {
    const join = async () => {
      try {
        await joinRoom(code, playerId, playerName);
      } catch (error: any) {
        // Error manejado por el contexto
        navigation.goBack();
      }
    };
    join();

    return () => {
      leaveRoom();
    };
  }, [code, playerId, playerName]);

  // Usar navegación automática online
  useOnlineNavigation();

  const handleStartGame = async () => {
    if (!isHost) {
      setErrorDialog({ visible: true, message: 'Solo el host puede iniciar la partida' });
      return;
    }
    
    if (players.length < 3) {
      setErrorDialog({ 
        visible: true, 
        message: `Se necesitan al menos 3 jugadores para iniciar. Actualmente hay ${players.length} jugador${players.length === 1 ? '' : 'es'}.` 
      });
      return;
    }

    if (roomState?.room?.status !== 'lobby') {
      setErrorDialog({ 
        visible: true, 
        message: `La sala no está en estado de lobby. Estado actual: ${roomState?.room?.status || 'desconocido'}` 
      });
      return;
    }

    try {
      await startGame();
    } catch (error: any) {
      console.error('Error starting game:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido al iniciar la partida';
      setErrorDialog({ 
        visible: true, 
        message: `No se pudo iniciar la partida:\n\n${errorMessage}` 
      });
    }
  };

  const handleLeave = async () => {
    try {
      await leaveRoom();
      navigation.goBack();
    } catch (error: any) {
      // Error manejado
    }
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
          <Text variant="headlineMedium" style={styles.title}>
            Sala Online
          </Text>
          <View style={styles.codeContainer}>
            <Text variant="bodySmall" style={styles.codeLabel}>
              Código de la sala
            </Text>
            <Text variant="displaySmall" style={styles.code}>
              {code}
            </Text>
          </View>
          {isHost && (
            <Chip icon="crown" style={styles.hostBadge} textStyle={styles.hostBadgeText}>
              Eres el host
            </Chip>
          )}
        </View>

        {/* Lista de jugadores */}
        <View style={styles.playersSection}>
          <PlayerList
            players={players.map(p => ({ id: p.id, name: p.name }))}
            onRemove={undefined}
          />
          <Text variant="bodySmall" style={styles.playerCount}>
            {players.length} / 10 jugadores
          </Text>
        </View>

        {/* Información */}
        <View style={styles.infoSection}>
          <Text variant="bodyMedium" style={styles.infoText}>
            {players.length < 3
              ? `Esperando más jugadores... (${3 - players.length} más necesario${players.length === 2 ? '' : 's'})`
              : 'Listo para comenzar'}
          </Text>
          {isHost && (
            <Text variant="bodySmall" style={[styles.infoText, { marginTop: theme.spacing.xs, fontSize: 12 }]}>
              Estado: {roomState?.room?.status || 'cargando...'} | 
              Jugadores: {players.length} | 
              Host: {isHost ? 'Sí' : 'No'}
            </Text>
          )}
        </View>

        {/* Botón iniciar (solo host) */}
        {isHost && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleStartGame}
              disabled={!canStart || loading}
              loading={loading}
              style={styles.startButton}
              contentStyle={styles.buttonContent}
              icon="play"
            >
              Iniciar Partida
            </Button>
            {!canStart && !loading && (
              <Text variant="bodySmall" style={[styles.infoText, { marginTop: theme.spacing.xs, textAlign: 'center' }]}>
                {!isHost 
                  ? 'Solo el host puede iniciar'
                  : players.length < 3
                  ? `Se necesitan al menos 3 jugadores (${players.length}/3)`
                  : roomState?.room?.status !== 'lobby'
                  ? `La sala no está lista (estado: ${roomState?.room?.status || 'desconocido'})`
                  : 'No se puede iniciar la partida'}
              </Text>
            )}
          </View>
        )}

        {/* Botón salir */}
        <View style={styles.footer}>
          <Button
            mode="outlined"
            onPress={() => setShowLeaveDialog(true)}
            disabled={loading}
            style={styles.leaveButton}
            contentStyle={styles.buttonContent}
            icon="exit-to-app"
          >
            Salir de la Sala
          </Button>
        </View>

        {/* Dialog de confirmación */}
        <Portal>
          <Dialog 
            visible={showLeaveDialog} 
            onDismiss={() => setShowLeaveDialog(false)}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>Salir de la sala</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogText}>
                ¿Estás seguro de que quieres salir?
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setShowLeaveDialog(false)}
                textColor={theme.colors.primary}
              >
                Cancelar
              </Button>
              <Button 
                onPress={() => {
                  setShowLeaveDialog(false);
                  handleLeave();
                }} 
                textColor={theme.colors.error}
              >
                Salir
              </Button>
            </Dialog.Actions>
          </Dialog>

          {/* Dialog de error */}
          <Dialog 
            visible={errorDialog.visible} 
            onDismiss={() => setErrorDialog({ ...errorDialog, visible: false })}
          >
            <Dialog.Title style={{ color: theme.colors.error }}>Error</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={{ color: theme.colors.text }}>
                {errorDialog.message}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setErrorDialog({ ...errorDialog, visible: false })}
                textColor={theme.colors.primary}
              >
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontWeight: '700',
  },
  codeContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  codeLabel: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.textSecondary,
  },
  code: {
    fontWeight: '700',
    letterSpacing: 8,
    color: theme.colors.accent,
  },
  hostBadge: {
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.accent + '20',
  },
  hostBadgeText: {
    color: theme.colors.accent,
    fontWeight: '600',
  },
  playersSection: {
    flex: 1,
    minHeight: 200,
    marginBottom: theme.spacing.lg,
  },
  playerCount: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  infoSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  infoText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
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
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogText: {
    color: theme.colors.textSecondary,
  },
});

