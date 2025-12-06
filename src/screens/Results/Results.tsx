import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Results'>;

export const ResultsScreen: React.FC<Props> = ({ navigation }) => {
  const handleNewGame = () => {
    navigation.navigate('Home');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Resultados
        </Typography>

        <View style={styles.resultsSection}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Aquí se mostrarán los resultados de la partida
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Nueva Partida"
            variant="accent"
            onPress={handleNewGame}
            style={styles.newGameButton}
          />
        </View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  title: {
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  resultsSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
  },
  newGameButton: {
    width: '100%',
  },
});

