import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Chip } from 'react-native-paper';
import {
  ScreenContainer,
  PlayerInput,
  PlayerList,
  BubbleEffect,
} from '../../components';
import { useLobby } from '../../hooks';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, GameConfig } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Lobby'>;

const DEFAULT_CONFIG: GameConfig = {
  rounds: 3, // Por defecto 3 rondas
};

export const LobbyScreen: React.FC<Props> = ({ navigation }) => {
  const {
    players,
    addPlayer,
    removePlayer,
    canStart,
    isFull,
    playerCount,
  } = useLobby();

  const { startGame } = useGame();
  const [config, setConfig] = useState<GameConfig>(DEFAULT_CONFIG);
  const [showBubble, setShowBubble] = useState(false);
  const [bubblePosition, setBubblePosition] = useState<{ x: number; y: number } | undefined>();
  const [newPlayerId, setNewPlayerId] = useState<string | undefined>();
  const prevPlayerCountRef = useRef(players.length);
  const prevPlayersRef = useRef<typeof players>([]);
  const effectTriggeredRef = useRef<string | null>(null);

  const existingNames = players.map(p => p.name);

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

  const handlePlayerLayout = React.useCallback((playerId: string, x: number, y: number) => {
    // Solo activar si es el jugador nuevo y el efecto no está ya visible
    if (playerId === newPlayerId && !showBubble && effectTriggeredRef.current === playerId) {
      setBubblePosition({ x, y });
      setShowBubble(true);
    }
  }, [newPlayerId, showBubble]);

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
  };

  const handleStartGame = () => {
    if (!canStart) {
      return;
    }

    // Iniciar el juego en el contexto
    startGame(players, config);

    // Usar setTimeout para asegurar que el estado se actualice antes de navegar
    // IMPORTANTE: Pasar explícitamente mode: 'local' para evitar confusión con modo online
    setTimeout(() => {
      navigation.navigate('RoleAssignment', {
        mode: 'local', // Modo local explícito
        players,
        config,
      });
    }, 0);
  };

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
        <View style={styles.headerContainer}>
          <Text variant="headlineMedium" style={styles.title}>
            Lobby
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Añade jugadores y configura la partida
          </Text>
        </View>

        {/* Input para añadir jugadores */}
        <View style={styles.inputSection}>
          <PlayerInput
            onAdd={handleAddPlayer}
            existingNames={existingNames}
          />
          {isFull && (
            <Text variant="bodySmall" style={styles.warningText}>
              Has alcanzado el máximo de jugadores
            </Text>
          )}
        </View>

        {/* Lista de jugadores */}
        {playerCount > 0 && (
          <View style={styles.playersSection}>
            <PlayerList 
              players={players} 
              onRemove={removePlayer}
              onPlayerLayout={handlePlayerLayout}
              newPlayerId={newPlayerId}
            />
          </View>
        )}

        {/* Configuración de partida */}
        {playerCount > 0 && (
          <Card style={styles.configCard} mode="elevated">
            <Card.Content style={styles.configContent}>
              <Text variant="titleMedium" style={styles.configTitle}>
                Configuración
              </Text>
              <Text variant="bodySmall" style={styles.configLabel}>
                Número de rondas
              </Text>
              <View style={styles.chipsContainer}>
                <Chip
                  selected={config.rounds === null}
                  onPress={() => setConfig({ ...config, rounds: null })}
                  style={styles.chip}
                  selectedColor={theme.colors.textLight}
                  mode={config.rounds === null ? 'flat' : 'outlined'}
                  buttonColor={config.rounds === null ? theme.colors.primary : undefined}
                >
                  Sin límite
                </Chip>
                {[3, 4, 5, 6].map((rounds) => (
                  <Chip
                    key={rounds}
                    selected={config.rounds === rounds}
                    onPress={() => setConfig({ ...config, rounds })}
                    style={styles.chip}
                    selectedColor={theme.colors.textLight}
                    mode={config.rounds === rounds ? 'flat' : 'outlined'}
                    buttonColor={config.rounds === rounds ? theme.colors.primary : undefined}
                  >
                    {rounds}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Botón de iniciar */}
        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleStartGame}
            disabled={!canStart}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="play"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.textLight}
          >
            Iniciar Partida
          </Button>
          {!canStart && playerCount > 0 && (
            <Text variant="bodySmall" style={styles.helpText}>
              Necesitas al menos 3 jugadores para comenzar
            </Text>
          )}
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
  },
  headerContainer: {
    width: '100%',
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 28,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  inputSection: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  warningText: {
    textAlign: 'center',
    marginTop: theme.spacing.xs,
    color: theme.colors.warning,
    fontSize: 12,
  },
  playersSection: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  configCard: {
    width: '100%',
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
  },
  configContent: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  configTitle: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  configLabel: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: theme.spacing.sm,
  },
  chipsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    marginHorizontal: theme.spacing.xs / 2,
  },
  actions: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helpText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
});
