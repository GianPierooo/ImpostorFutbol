import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartGame = () => {
    navigation.navigate('Lobby');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Typography variant="h1" style={styles.emoji}>
              ⚽
            </Typography>
          </View>
          <Typography variant="h1" style={styles.title}>
            Impostor
          </Typography>
          <Typography variant="h1" style={styles.titleAccent}>
            Fútbol
          </Typography>
        </View>

        <View style={styles.description}>
          <Typography variant="bodyLarge" color={theme.colors.textSecondary} style={styles.subtitle}>
            🎮 El juego del impostor futbolero
          </Typography>
          <Typography variant="body" color={theme.colors.textMuted} style={styles.descriptionText}>
            Descubre quién es el impostor mientras das pistas sobre jugadores y equipos de fútbol
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="🚀 Iniciar Partida"
            variant="accent"
            onPress={handleStartGame}
            style={styles.startButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontWeight: theme.typography.weights.bold,
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.accent,
    fontWeight: theme.typography.weights.bold,
    ...theme.shadows.small,
  },
  description: {
    marginBottom: theme.spacing['3xl'],
    alignItems: 'center',
    maxWidth: 300,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
    fontWeight: theme.typography.weights.semibold,
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
  startButton: {
    width: '100%',
  },
});

