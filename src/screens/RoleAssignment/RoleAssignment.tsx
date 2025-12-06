import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { useGame } from '../../game';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList, Player } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const { players } = route.params;
  const { roleAssignment, getPlayerInfo, nextPhase } = useGame();
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [allPlayersSeen, setAllPlayersSeen] = useState(false);

  const currentPlayer = players[currentPlayerIndex];
  const playerInfo = currentPlayer ? getPlayerInfo(currentPlayer.id) : null;

  // Verificar si todos los jugadores han visto su rol
  useEffect(() => {
    if (currentPlayerIndex >= players.length) {
      setAllPlayersSeen(true);
    }
  }, [currentPlayerIndex, players.length]);

  const handleShowRole = () => {
    setShowRole(true);
  };

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
      setShowRole(false);
    } else {
      setAllPlayersSeen(true);
    }
  };

  const handleContinue = () => {
    nextPhase();
    navigation.navigate('Round');
  };

  // Si no hay asignación de roles, mostrar mensaje de error
  if (!roleAssignment) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Typography variant="h2" style={styles.title}>
            Error
          </Typography>
          <Typography variant="body" color={theme.colors.error}>
            No se pudo asignar los roles. Vuelve al lobby.
          </Typography>
          <Button
            title="Volver al Lobby"
            variant="accent"
            onPress={() => navigation.navigate('Lobby')}
            style={styles.button}
          />
        </View>
      </ScreenContainer>
    );
  }

  // Si todos los jugadores han visto su rol, mostrar botón de continuar
  if (allPlayersSeen) {
    return (
      <ScreenContainer>
        <View style={styles.content}>
          <Typography variant="h2" style={styles.title}>
            ¡Todos han visto su rol!
          </Typography>
          <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.infoText}>
            Ahora pueden comenzar las rondas de pistas
          </Typography>
          <View style={styles.actions}>
            <Button
              title="Continuar"
              variant="accent"
              onPress={handleContinue}
              style={styles.button}
            />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // Mostrar rol del jugador actual
  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Typography variant="h3" style={styles.title}>
          {currentPlayer?.name}
        </Typography>

        <Typography variant="caption" color={theme.colors.textSecondary} style={styles.subtitle}>
          Jugador {currentPlayerIndex + 1} de {players.length}
        </Typography>

        {!showRole ? (
          <View style={styles.roleSection}>
            <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.infoText}>
              Presiona el botón para ver tu rol
            </Typography>
            <Button
              title="Ver mi Rol"
              variant="accent"
              onPress={handleShowRole}
              style={styles.button}
            />
          </View>
        ) : (
          <View style={styles.roleSection}>
            {playerInfo?.isImpostor ? (
              <>
                <Typography variant="h1" color={theme.colors.error} style={styles.roleText}>
                  Eres el
                </Typography>
                <Typography variant="h1" color={theme.colors.error} style={styles.roleText}>
                  IMPOSTOR
                </Typography>
                <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.instructionText}>
                  No sabes la palabra secreta. Tu objetivo es descubrirla o hacer que los demás no la descubran.
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h4" color={theme.colors.textSecondary} style={styles.labelText}>
                  La palabra secreta es:
                </Typography>
                <Typography variant="h1" color={theme.colors.accent} style={styles.secretWordText}>
                  {playerInfo?.secretWord}
                </Typography>
                <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.instructionText}>
                  Da pistas sobre esta palabra sin decirla directamente. Encuentra al impostor.
                </Typography>
              </>
            )}

            <View style={styles.actions}>
              <Button
                title={currentPlayerIndex < players.length - 1 ? "Siguiente Jugador" : "Continuar"}
                variant="accent"
                onPress={handleNextPlayer}
                style={styles.button}
              />
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  roleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  roleText: {
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  labelText: {
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  secretWordText: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    fontWeight: theme.typography.weights.bold,
  },
  instructionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  infoText: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    width: '100%',
  },
});
