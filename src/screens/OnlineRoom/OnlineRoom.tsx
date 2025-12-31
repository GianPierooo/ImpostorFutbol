import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Button, Text, Chip, Portal, Dialog, Snackbar, IconButton } from 'react-native-paper';
import Clipboard from '@react-native-clipboard/clipboard';
import { ScreenContainer, PlayerList, BubbleEffect } from '../../components';
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
  const [showBubble, setShowBubble] = useState(false);
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | undefined>();
  const [newPlayerId, setNewPlayerId] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const prevPlayerCountRef = useRef(players.length);
  const prevPlayersRef = useRef<typeof players>([]);
  const effectTriggeredRef = useRef<string | null>(null);

  // Detectar cuando se agrega un nuevo jugador (solo una vez por jugador)
  useEffect(() => {
    if (players.length > prevPlayerCountRef.current) {
      // Encontrar el nuevo jugador
      const newPlayer = players.find(p => !prevPlayersRef.current.some(pp => pp.id === p.id));
      if (newPlayer && effectTriggeredRef.current !== newPlayer.id) {
        // Resetear estado del efecto
        setShowBubble(false);
        setBubblePosition(undefined);
        effectTriggeredRef.current = newPlayer.id;
        setNewPlayerId(newPlayer.id);
      }
    }
    prevPlayerCountRef.current = players.length;
    prevPlayersRef.current = players;
  }, [players]);

  /**
   * Maneja el layout de un jugador para mostrar el efecto de burbuja
   * 
   * IMPORTANTE: Valida que las coordenadas sean números válidos antes de usarlas
   * para evitar errores de renderizado con valores NaN
   * 
   * @param {string} playerId - ID del jugador
   * @param {number} x - Coordenada X (debe ser un número válido)
   * @param {number} y - Coordenada Y (debe ser un número válido)
   */
  const handlePlayerLayout = React.useCallback((playerId: string, x: number, y: number) => {
    // Validar que las coordenadas sean números válidos
    if (
      typeof x !== 'number' || 
      isNaN(x) || 
      !isFinite(x) ||
      typeof y !== 'number' || 
      isNaN(y) || 
      !isFinite(y)
    ) {
      console.warn(`⚠️ handlePlayerLayout recibió coordenadas inválidas para jugador ${playerId}: x=${x}, y=${y}`);
      return;
    }
    
    // Solo activar si es el jugador nuevo y el efecto no está ya visible
    if (playerId === newPlayerId && !showBubble && effectTriggeredRef.current === playerId) {
      setBubblePosition({ x, y });
      setShowBubble(true);
    }
  }, [newPlayerId, showBubble]);

  // Ref para evitar llamadas duplicadas a leaveRoom durante cleanup
  const isLeavingRef = useRef(false);

  /**
   * Unirse a la sala cuando se monta el componente
   * 
   * IMPORTANTE: Este efecto solo debe ejecutarse una vez cuando el componente se monta.
   * Las dependencias son code, playerId, playerName que vienen de route.params
   * y no deberían cambiar durante la vida del componente.
   * 
   * Cleanup: Cuando el componente se desmonta, salir de la sala automáticamente.
   * IMPORTANTE: Solo hacer cleanup si no estamos ya saliendo (evitar duplicados).
   */
  useEffect(() => {
    const join = async () => {
      try {
        await joinRoom(code, playerId, playerName);
        isLeavingRef.current = false; // Resetear flag después de unirse exitosamente
      } catch (error: any) {
        // Error manejado por el contexto
        console.error('Error joining room:', error);
        navigation.goBack();
      }
    };
    join();

    return () => {
      // Cleanup: salir de la sala cuando el componente se desmonta
      // Solo si no estamos ya en proceso de salir (evitar duplicados)
      if (!isLeavingRef.current) {
        isLeavingRef.current = true;
        leaveRoom().catch((error) => {
          // Ignorar errores durante cleanup - el componente ya se está desmontando
          console.warn('Error durante cleanup de OnlineRoom:', error);
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar - las dependencias vienen de route.params que no cambian

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
    // Prevenir llamadas duplicadas
    if (isLeavingRef.current) {
      return;
    }

    try {
      isLeavingRef.current = true; // Marcar que estamos saliendo
      await leaveRoom();
      // Navegar después de salir exitosamente
      navigation.goBack();
    } catch (error: any) {
      // Si hay error, permitir intentar salir de nuevo
      isLeavingRef.current = false;
      console.error('Error leaving room:', error);
    }
  };

  const canStart = isHost && players.length >= 3 && roomState?.room?.status === 'lobby';

  const handleCopyCode = useCallback(() => {
    Clipboard.setString(code);
    setSnackbarVisible(true);
  }, [code]);

  return (
    <ScreenContainer>
      <BubbleEffect 
        visible={showBubble} 
        position={bubblePosition}
        onComplete={() => {
          setShowBubble(false);
          setBubblePosition(undefined);
          // Limpiar después de un pequeño delay para evitar re-triggers
          setTimeout(() => {
            setNewPlayerId(undefined);
            effectTriggeredRef.current = null;
          }, 100);
        }} 
      />
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
            <View style={styles.codeRow}>
              <Text variant="displaySmall" style={styles.code}>
                {code}
              </Text>
              <IconButton
                icon="content-copy"
                size={24}
                iconColor={theme.colors.primary}
                onPress={handleCopyCode}
                style={styles.copyButton}
              />
            </View>
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
            onPlayerLayout={handlePlayerLayout}
            newPlayerId={newPlayerId}
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={2000}
        style={styles.snackbar}
      >
        Código copiado al portapapeles
      </Snackbar>
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
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },
  code: {
    fontWeight: '700',
    letterSpacing: 8,
    color: theme.colors.accent,
  },
  copyButton: {
    margin: 0,
    backgroundColor: theme.colors.surface,
  },
  snackbar: {
    backgroundColor: theme.colors.surface,
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

