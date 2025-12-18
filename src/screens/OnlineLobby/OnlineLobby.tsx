import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import Animated, { FadeInDown, FadeInUp, FadeIn } from 'react-native-reanimated';
import { Text, Button, TextInput, Card, Dialog, Portal } from 'react-native-paper';
import { ScreenContainer } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { roomsAPI, healthAPI } from '../../services';
import { generateId } from '../../utils/generateId';

type Props = NativeStackScreenProps<NavigationParamList, 'OnlineLobby'>;

export const OnlineLobbyScreen: React.FC<Props> = ({ navigation }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorDialog, setErrorDialog] = useState({ visible: false, title: '', message: '' });

  const showError = (title: string, message: string) => {
    setErrorDialog({ visible: true, title, message });
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      showError('Error', 'Por favor ingresa tu nombre');
      return;
    }

    setLoading(true);
    try {
      // Primero verificar que el servidor esté disponible
      try {
        const healthCheck = await healthAPI.check();
        // El health check básico devuelve { status: 'ok' }, no { success: true }
        if (!healthCheck || healthCheck.status !== 'ok') {
          throw new Error('El servidor no está respondiendo correctamente');
        }
      } catch (healthError: any) {
        console.error('Health check failed:', healthError);
        showError(
          'Servidor no disponible',
          'No se pudo conectar al servidor.\n\n' +
          'Posibles causas:\n' +
          '1. El backend no está corriendo en la VM\n' +
          '2. El servidor Redis no está disponible\n' +
          '3. Problemas de firewall o red\n\n' +
          'Verifica en la VM:\n' +
          '• pm2 status (backend debe estar corriendo)\n' +
          '• redis-cli ping (Redis debe responder PONG)\n' +
          '• curl http://163.192.223.30:3000/api/health'
        );
        setLoading(false);
        return;
      }

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
        showError('Error', result.error || 'No se pudo crear la sala');
      }
    } catch (error: any) {
      console.error('Error creating room:', error);
      
      // Mensaje de error más detallado
      let errorMessage = 'Error al crear la sala';
      
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        errorMessage = 'No se pudo conectar al servidor.\n\n' +
          'Verifica:\n' +
          '1. El backend está corriendo (pm2 status)\n' +
          '2. Redis está disponible (redis-cli ping)\n' +
          '3. El firewall permite conexiones al puerto 3000\n' +
          '4. Tienes conexión a internet\n\n' +
          'IP del servidor: 163.192.223.30:3000';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Tiempo de espera agotado.\n\n' +
          'El servidor no respondió a tiempo. Verifica que esté activo.';
      } else if (error.response) {
        errorMessage = error.response.data?.error || error.message;
      } else if (error.request) {
        errorMessage = 'El servidor no respondió.\n\n' +
          'Verifica que el backend esté corriendo en la VM.';
      } else {
        errorMessage = error.message || 'Error desconocido';
      }
      
      showError('Error de Red', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      showError('Error', 'Por favor ingresa tu nombre');
      return;
    }

    if (!roomCode.trim()) {
      showError('Error', 'Por favor ingresa el código de la sala');
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
        showError('Error', result.error || 'No se pudo unir a la sala');
      }
    } catch (error: any) {
      console.error('Error joining room:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al unirse a la sala';
      showError(
        'Error de Red',
        errorMessage + '\n\nVerifica que:\n1. El backend esté corriendo\n2. Tengas conexión a internet\n3. La IP del servidor sea correcta'
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
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <Text variant="headlineSmall" style={styles.title}>
            🌐 Modo Online
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            Crea o únete a una partida online
          </Text>
        </Animated.View>

        {/* Input de nombre */}
        <Animated.View
          entering={FadeInUp.delay(400).springify()}
          style={styles.section}
        >
          <Text variant="bodyMedium" style={styles.label}>
            Tu nombre:
          </Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            placeholder="Ingresa tu nombre"
            placeholderTextColor={theme.colors.textSecondary}
            value={playerName}
            onChangeText={setPlayerName}
            maxLength={20}
            autoCapitalize="words"
            editable={!loading}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            theme={{ colors: { text: theme.colors.text } }}
          />
        </Animated.View>

        {/* Crear sala - Sin título, solo botón */}
        <Animated.View
          entering={FadeInUp.delay(600).springify()}
          style={styles.section}
        >
          <Button
            mode="contained"
            onPress={handleCreateRoom}
            disabled={loading || !playerName.trim()}
            loading={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="gamepad-variant"
            buttonColor={theme.colors.primary}
          >
            Crear Nueva Partida
          </Button>
        </Animated.View>

        {/* Separador */}
        <Animated.View
          entering={FadeIn.delay(800)}
          style={styles.separator}
        >
          <View style={styles.separatorLine} />
          <Text variant="bodySmall" style={styles.separatorText}>
            O
          </Text>
          <View style={styles.separatorLine} />
        </Animated.View>

        {/* Unirse a sala */}
        <Animated.View
          entering={FadeInUp.delay(1000).springify()}
          style={styles.section}
        >
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Unirse a Partida
          </Text>
          <Text variant="bodyMedium" style={styles.label}>
            Código de la sala:
          </Text>
          <TextInput
            mode="outlined"
            style={styles.input}
            placeholder="ABC123"
            placeholderTextColor={theme.colors.textSecondary}
            value={roomCode}
            onChangeText={(text) => setRoomCode(text.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
            editable={!loading}
            outlineColor={theme.colors.border}
            activeOutlineColor={theme.colors.primary}
            theme={{ colors: { text: theme.colors.text } }}
          />
          <Button
            mode="outlined"
            onPress={handleJoinRoom}
            disabled={loading || !playerName.trim() || !roomCode.trim()}
            loading={loading}
            style={[styles.button, { borderColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="login"
            textColor={theme.colors.primary}
          >
            Unirse
          </Button>
        </Animated.View>

        {/* Botón volver - Debajo del código de sala */}
        <Animated.View
          entering={FadeInUp.delay(1200).springify()}
          style={styles.backButtonContainer}
        >
          <Button
            mode="text"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.backButton}
            contentStyle={styles.buttonContent}
            icon="arrow-left"
            textColor={theme.colors.textSecondary}
          >
            Volver
          </Button>
        </Animated.View>

        {/* Dialog de error */}
        <Portal>
          <Dialog 
            visible={errorDialog.visible} 
            onDismiss={() => setErrorDialog({ ...errorDialog, visible: false })}
            style={styles.dialog}
          >
            <Dialog.Title style={styles.dialogTitle}>{errorDialog.title}</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium" style={styles.dialogMessage}>
                {errorDialog.message}
              </Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button 
                onPress={() => setErrorDialog({ ...errorDialog, visible: false })}
                textColor={theme.colors.primary}
              >
                OK
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
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
    paddingBottom: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    fontWeight: '700',
    color: theme.colors.text,
    fontSize: 24,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  section: {
    width: '100%',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
    color: theme.colors.text,
    fontSize: 18,
  },
  label: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
  },
  input: {
    width: '100%',
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  button: {
    width: '100%',
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  buttonLabel: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  },
  separatorText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: 14,
  },
  backButtonContainer: {
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'center',
  },
  dialog: {
    backgroundColor: theme.colors.surface,
  },
  dialogTitle: {
    color: theme.colors.text,
  },
  dialogMessage: {
    color: theme.colors.textSecondary,
  },
});

