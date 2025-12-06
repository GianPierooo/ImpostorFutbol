import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  ScreenContainer,
  Typography,
  Button,
  PlayerInput,
  PlayerList,
  GameConfig as GameConfigComponent,
} from '../../components';
import { useLobby } from '../../hooks';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, GameConfig } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Lobby'>;

const DEFAULT_CONFIG: GameConfig = {
  rounds: 2,
  timePerRound: null, // Sin tiempo límite por defecto
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

  const existingNames = players.map(p => p.name);

  const handleAddPlayer = (name: string) => {
    addPlayer(name);
  };

  const handleStartGame = () => {
    if (!canStart) {
      return;
    }

    // Iniciar el juego en el contexto
    startGame(players, config);

    // Navegar a la pantalla de asignación de roles
    navigation.navigate('RoleAssignment', {
      players,
      config,
    });
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Typography variant="h2" style={styles.title}>
          Lobby
        </Typography>

        {/* Input para añadir jugadores */}
        <View style={styles.inputSection}>
          <PlayerInput
            onAdd={handleAddPlayer}
            existingNames={existingNames}
          />
          {isFull && (
            <Typography variant="caption" color={theme.colors.warning} style={styles.warningText}>
              Has alcanzado el máximo de jugadores
            </Typography>
          )}
        </View>

        {/* Lista de jugadores */}
        <View style={styles.playersSection}>
          <PlayerList players={players} onRemove={removePlayer} />
        </View>

        {/* Configuración de partida */}
        {playerCount > 0 && (
          <View style={styles.configSection}>
            <GameConfigComponent config={config} onChange={setConfig} />
          </View>
        )}

        {/* Botón de iniciar */}
        <View style={styles.actions}>
          <Button
            title="Iniciar Partida"
            variant="accent"
            onPress={handleStartGame}
            disabled={!canStart}
            style={styles.startButton}
          />
          {!canStart && playerCount > 0 && (
            <Typography variant="caption" color={theme.colors.textSecondary} style={styles.helpText}>
              Necesitas al menos 3 jugadores para comenzar
            </Typography>
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
    paddingBottom: theme.spacing.xl,
  },
  title: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  playersSection: {
    flex: 1,
    minHeight: 200,
    marginBottom: theme.spacing.lg,
  },
  configSection: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  actions: {
    width: '100%',
    marginTop: theme.spacing.md,
  },
  startButton: {
    width: '100%',
  },
  helpText: {
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
