import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { theme } from '../../theme';
import { GameConfig as GameConfigType } from '../../types';

interface GameConfigProps {
  config: GameConfigType;
  onChange: (config: GameConfigType) => void;
  disabled?: boolean;
}

export const GameConfig: React.FC<GameConfigProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleRoundChange = (rounds: number | null) => {
    if (!disabled) {
      onChange({ ...config, rounds });
    }
  };

  return (
    <Card style={styles.container} mode="elevated">
      <Card.Content>
        <Text variant="titleLarge" style={styles.title}>
          Configuración
        </Text>

        <View style={styles.section}>
          <Text variant="bodyMedium" style={styles.label}>
            Número de rondas
          </Text>
          <View style={styles.optionsRow}>
            <Chip
              selected={config.rounds === null}
              onPress={() => handleRoundChange(null)}
              disabled={disabled}
              style={styles.chip}
              selectedColor={theme.colors.textLight}
            >
              Sin límite
            </Chip>
            {[3, 4, 5, 6].map((rounds) => (
              <Chip
                key={rounds}
                selected={config.rounds === rounds}
                onPress={() => handleRoundChange(rounds)}
                disabled={disabled}
                style={styles.chip}
                selectedColor={theme.colors.textLight}
              >
                {rounds}
              </Chip>
            ))}
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    marginTop: theme.spacing.sm,
  },
  label: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    margin: theme.spacing.xs,
  },
});

