import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundScreen: React.FC<Props> = ({ navigation }) => {
  const handleFinishRound = () => {
    navigation.navigate('Voting');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Ronda de Pistas
        </Typography>

        <View style={styles.roundSection}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Aquí se mostrará la interfaz de la ronda
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Finalizar Ronda"
            variant="accent"
            onPress={handleFinishRound}
            style={styles.finishButton}
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
  roundSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
  },
  finishButton: {
    width: '100%',
  },
});

