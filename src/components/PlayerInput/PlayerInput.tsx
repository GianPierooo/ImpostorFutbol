import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
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
    if (error) {
      setError(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          mode="outlined"
          label="Nombre del jugador"
          value={name}
          onChangeText={handleChangeText}
          onSubmitEditing={handleAdd}
          maxLength={20}
          autoCapitalize="words"
          autoCorrect={false}
          error={!!error}
          style={styles.input}
          right={
            <TextInput.Icon
              icon="account-plus"
              onPress={handleAdd}
              disabled={!name.trim()}
            />
          }
        />
      </View>
      
      {error && (
        <HelperText type="error" visible={!!error} style={styles.helperText}>
          {error}
        </HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  helperText: {
    marginTop: theme.spacing.xs,
  },
});

