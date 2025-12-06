import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '../Typography';
import { theme } from '../../theme';
import { GameConfig } from '../../types';

interface GameConfigProps {
  config: GameConfig;
  onChange: (config: GameConfig) => void;
  disabled?: boolean;
}

export const GameConfig: React.FC<GameConfigProps> = ({
  config,
  onChange,
  disabled = false,
}) => {
  const handleRoundChange = (rounds: number) => {
    onChange({ ...config, rounds });
  };

  const handleTimeChange = (time: number | null) => {
    onChange({ ...config, timePerRound: time });
  };

  return (
    <View style={styles.container}>
      <Typography variant="h4" style={styles.title}>
        Configuración
      </Typography>

      {/* Selector de Rondas */}
      <View style={styles.section}>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.label}>
          Número de rondas
        </Typography>
        <View style={styles.optionsRow}>
          {[1, 2, 3].map((rounds) => (
            <TouchableOpacity
              key={rounds}
              style={[
                styles.option,
                config.rounds === rounds && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && handleRoundChange(rounds)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Typography
                variant="bodyLarge"
                color={
                  config.rounds === rounds
                    ? theme.colors.textLight
                    : theme.colors.text
                }
                style={styles.optionText}
              >
                {rounds}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Selector de Tiempo (Opcional) */}
      <View style={styles.section}>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.label}>
          Tiempo por ronda (opcional)
        </Typography>
        <View style={styles.optionsRow}>
          <TouchableOpacity
            style={[
              styles.option,
              config.timePerRound === null && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => !disabled && handleTimeChange(null)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Typography
              variant="body"
              color={
                config.timePerRound === null
                  ? theme.colors.textLight
                  : theme.colors.text
              }
            >
              Sin límite
            </Typography>
          </TouchableOpacity>
          {[30, 60, 120].map((seconds) => (
            <TouchableOpacity
              key={seconds}
              style={[
                styles.option,
                config.timePerRound === seconds && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => !disabled && handleTimeChange(seconds)}
              disabled={disabled}
              activeOpacity={0.7}
            >
              <Typography
                variant="body"
                color={
                  config.timePerRound === seconds
                    ? theme.colors.textLight
                    : theme.colors.text
                }
              >
                {seconds}s
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    flexWrap: 'wrap',
  },
  option: {
    minWidth: 80,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontWeight: theme.typography.weights.semibold,
  },
});

