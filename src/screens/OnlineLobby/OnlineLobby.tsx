import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { ScreenContainer, Typography, Button } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { roomsAPI } from '../../services';
import { generateId } from '../../utils/generateId';

type Props = NativeStackScreenProps<NavigationParamList, 'OnlineLobby'>;

export const OnlineLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    try {
      const playerId = generateId();
      const result = await roomsAPI.create({
        hostId: playerId,
        hostName: playerName.trim(),
        config: { rounds: 3 },
      });

      if (result.success && result.data) {
        navigation.navigate('OnlineRoom', {
          code: result.data.code,
          playerId,
          playerName: playerName.trim(),
        });
      } else {
        Alert.alert('Error', result.error || 'No se pudo crear la sala');
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al crear la sala';
      Alert.alert(
        'Error de Red',
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Verificar Conexión',
            onPress: () => {
              // Intentar health check
              roomsAPI.get('test').catch(() => {
                Alert.alert(
                  'Servidor no disponible',
                  'El servidor no está respondiendo. Verifica que:\n\n1. El backend esté corriendo\n2. Tengas conexión a internet\n3. La IP del servidor sea correcta'
                );
              });
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!roomCode.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de la sala');
      return;
    }

    setLoading(true);
    try {
      const playerId = generateId();
      const result = await roomsAPI.join(roomCode.trim().toUpperCase(), {
        playerId,
        playerName: playerName.trim(),
      });

      if (result.success && result.data) {
        navigation.navigate('OnlineRoom', {
          code: roomCode.trim().toUpperCase(),
          playerId,
          playerName: playerName.trim(),
        });
      } else {
        Alert.alert('Error', result.error || 'No se pudo unir a la sala');
      }
    } catch (error: any) {
      console.error('Error joining room:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al unirse a la sala';
      Alert.alert(
        'Error de Red',
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Verificar Conexión',
            onPress: () => {
              // Intentar health check
              roomsAPI.get('test').catch(() => {
                Alert.alert(
                  'Servidor no disponible',
                  'El servidor no está respondiendo. Verifica que:\n\n1. El backend esté corriendo\n2. Tengas conexión a internet\n3. La IP del servidor sea correcta'
                );
              });
            },
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Typography variant="h2" style={styles.title}>
            🌐 Modo Online
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
            Crea o únete a una partida online
          </Typography>
        </View>

        {/* Input de nombre */}
        <View style={styles.section}>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.label}>
            Tu nombre:
          </Typography>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nombre"
            placeholderTextColor={theme.colors.textSecondary}
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
            autoCapitalize="words"
            editable={!loading}
          />
        </View>

        {/* Crear sala */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Crear Partida
          </Typography>
          <Button
            title="🎮 Crear Nueva Partida"
            variant="accent"
            onPress={handleCreateRoom}
            disabled={loading || !playerName.trim()}
            loading={loading}
            style={styles.button}
          />
        </View>

        {/* Separador */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.separatorText}>
            O
          </Typography>
          <View style={styles.separatorLine} />
        </View>

        {/* Unirse a sala */}
        <View style={styles.section}>
          <Typography variant="h4" style={styles.sectionTitle}>
            Unirse a Partida
          </Typography>
          <Typography variant="body" color={theme.colors.textSecondary} style={styles.label}>
            Código de la sala:
          </Typography>
          <TextInput
            style={styles.input}
            placeholder="ABC123"
            placeholderTextColor={theme.colors.textSecondary}
            value={roomCode}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
            editable={!loading}
          />
          <Button
            title="🔗 Unirse"
            variant="secondary"
            onPress={handleJoinRoom}
            disabled={loading || !playerName.trim() || !roomCode.trim()}
            loading={loading}
            style={styles.button}
          />
        </View>

        {/* Botón volver */}
        <View style={styles.footer}>
          <Button
            title="← Volver"
            variant="secondary"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    textAlign: 'center',
  },
  section: {
    width: '100%',
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  label: {
    marginBottom: theme.spacing.sm,
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  button: {
    width: '100%',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  separatorText: {
    marginHorizontal: theme.spacing.md,
  },
  footer: {
    width: '100%',
    marginTop: theme.spacing.lg,
  },
  backButton: {
    width: '100%',
  },
});

