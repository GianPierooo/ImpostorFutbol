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
          <Typography variant="h1" style={styles.title}>
            Impostor
          </Typography>
          <Typography variant="h1" style={styles.titleAccent}>
            Fútbol
          </Typography>
        </View>

        <View style={styles.description}>
          <Typography variant="bodyLarge" color={theme.colors.textSecondary}>
            El juego del impostor futbolero
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Iniciar Partida"
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
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.accent,
  },
  description: {
    marginBottom: theme.spacing['3xl'],
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    maxWidth: 300,
  },
  startButton: {
    width: '100%',
  },
});

