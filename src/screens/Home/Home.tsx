import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Button, Text } from 'react-native-paper';
import { ScreenContainer } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

type Props = NativeStackScreenProps<NavigationParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartGame = () => {
    navigation.navigate('Lobby');
  };

  // Animación de pulso para el icono
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: pulse.value }],
    };
  });

  // Eliminamos la animación de glow problemática para evitar errores de worklet

  return (
    <ScreenContainer>
      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Text style={styles.emoji}>⚽</Text>
          </Animated.View>
          <Animated.Text
            entering={FadeInDown.delay(400).springify()}
            style={[styles.title, styles.titleImpostor]}
          >
            Impostor
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(600).springify()}
            style={styles.titleAccent}
          >
            Fútbol
          </Animated.Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(800).springify()}
          style={styles.description}
        >
          <Text variant="titleMedium" style={styles.subtitle}>
            🎮 El juego del <Text style={styles.impostorText}>impostor</Text> futbolero
          </Text>
          <Text variant="bodyLarge" style={styles.descriptionText}>
            Descubre quién es el <Text style={styles.impostorText}>impostor</Text> mientras das pistas sobre jugadores y equipos de fútbol
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1000)}
          style={styles.actions}
        >
          <Button
            mode="contained"
            onPress={handleStartGame}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="play"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.textLight}
          >
            Iniciar Partida
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('OnlineLobby')}
            style={styles.onlineButton}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, styles.onlineButtonLabel]}
            icon="earth"
            textColor={theme.colors.primary}
            borderColor={theme.colors.primary}
          >
            Modo Online
          </Button>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: theme.spacing.lg,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    shadowOpacity: 0.6,
    elevation: 10,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontWeight: '800',
  },
  titleImpostor: {
    color: theme.colors.impostor, // Rojo fuerte para "Impostor"
    textShadowColor: theme.colors.impostor,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  impostorText: {
    color: theme.colors.impostor, // Rojo fuerte
    fontWeight: '700',
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.primary, // Índigo para "Fútbol" - combina mejor
    fontWeight: '800',
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  description: {
    marginBottom: theme.spacing['3xl'],
    alignItems: 'center',
    maxWidth: 320,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  actions: {
    width: '100%',
    maxWidth: 300,
    gap: theme.spacing.md,
  },
  startButton: {
    width: '100%',
  },
  onlineButton: {
    width: '100%',
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  onlineButtonLabel: {
    color: theme.colors.primary,
  },
});

