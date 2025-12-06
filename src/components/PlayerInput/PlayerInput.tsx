import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography, Button } from '../index';
import { theme } from '../../theme';

interface PlayerInputProps {
  onAdd: (name: string) => void;
  existingNames: string[];
}

export const PlayerInput: React.FC<PlayerInputProps> = ({
  onAdd,
  existingNames,
}) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateName = (playerName: string): string | null => {
    const trimmedName = playerName.trim();

    if (!trimmedName) {
      return 'El nombre no puede estar vacío';
    }

    if (trimmedName.length > 20) {
      return 'El nombre no puede tener más de 20 caracteres';
    }

    if (existingNames.some(n => n.toLowerCase() === trimmedName.toLowerCase())) {
      return 'Este nombre ya está en uso';
    }

    return null;
  };

  const handleAdd = () => {
    const validationError = validateName(name);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    onAdd(name.trim());
    setName('');
  };

  const handleChangeText = (text: string) => {
    setName(text);
    // Limpiar error cuando el usuario empieza a escribir
    if (error) {
      setError(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          placeholder="Nombre del jugador"
          placeholderTextColor={theme.colors.textSecondary}
          value={name}
          onChangeText={handleChangeText}
          onSubmitEditing={handleAdd}
          maxLength={20}
          autoCapitalize="words"
          autoCorrect={false}
        />
        <Button
          title="Añadir"
          variant="accent"
          onPress={handleAdd}
          style={styles.addButton}
        />
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Typography variant="caption" color={theme.colors.error}>
            {error}
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  addButton: {
    minWidth: 100,
    paddingHorizontal: theme.spacing.lg,
  },
  errorContainer: {
    marginTop: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
});

