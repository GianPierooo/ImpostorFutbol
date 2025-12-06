import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Voting'>;

export const VotingScreen: React.FC<Props> = ({ navigation }) => {
  const handleFinishVoting = () => {
    navigation.navigate('Results');
  };

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Typography variant="h2" style={styles.title}>
          Votación
        </Typography>

        <View style={styles.votingSection}>
          <Typography variant="body" color={theme.colors.textSecondary}>
            Aquí se mostrará la interfaz de votación
          </Typography>
        </View>

        <View style={styles.actions}>
          <Button
            title="Ver Resultados"
            variant="accent"
            onPress={handleFinishVoting}
            style={styles.resultsButton}
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
  votingSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    width: '100%',
  },
  resultsButton: {
    width: '100%',
  },
});

