import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji, AnimatedButton } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<NavigationParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartGame = () => {
    navigation.navigate('Lobby');
  };

  // Animaciones mejoradas
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);
  const rotate = useSharedValue(0);

  React.useEffect(() => {
    // Pulso suave del icono
    pulse.value = withRepeat(
      withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Efecto de glow animado
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotación sutil del fondo
    rotate.value = withRepeat(
      withTiming(360, { duration: 20000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const glowOpacity = interpolate(glow.value, [0, 1], [0.4, 0.8]);
    return {
      transform: [{ scale: pulse.value }],
      shadowOpacity: glowOpacity,
    };
  });

  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ rotate: `${rotate.value}deg` }],
    };
  });

  return (
    <ScreenContainer>
      {/* Gradiente de fondo animado */}
      <Animated.View style={[styles.backgroundGradient, backgroundAnimatedStyle]} pointerEvents="none">
        <LinearGradient
          colors={['#22C55E15', '#3B82F610', '#8B5CF608', '#22C55E15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View style={styles.content}>
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          {/* Contenedor del icono con múltiples capas para efecto profesional */}
          <View style={styles.iconWrapper}>
            {/* Glow exterior */}
            <Animated.View style={[styles.iconGlow, iconAnimatedStyle]} />
            {/* Contenedor principal */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <LinearGradient
                colors={[theme.colors.primary + '30', theme.colors.primary + '10']}
                style={styles.iconGradient}
              >
                <AnimatedEmoji emoji="⚽" animation="pulse" size={72} duration={4000} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Títulos mejorados */}
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
          <View style={styles.subtitleContainer}>
            <Text variant="titleMedium" style={styles.subtitle}>
              🎮 El juego del <Text style={styles.impostorText}>impostor</Text> futbolero
            </Text>
          </View>
          <Text variant="bodyLarge" style={styles.descriptionText}>
            Descubre quién es el <Text style={styles.impostorText}>impostor</Text> mientras das pistas sobre jugadores y equipos de fútbol
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeIn.delay(1000)}
          style={styles.actions}
        >
          <AnimatedButton
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
          </AnimatedButton>
          <AnimatedButton
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
          </AnimatedButton>
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
    zIndex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.25,
    left: -width * 0.25,
    borderRadius: width * 0.75,
    opacity: 0.6,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: theme.colors.primary + '40',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 40,
    shadowOpacity: 0.8,
    elevation: 15,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 24,
    shadowOpacity: 0.7,
    elevation: 12,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontWeight: '900',
    fontSize: 42,
    letterSpacing: 1,
  },
  titleImpostor: {
    color: theme.colors.impostor,
    textShadowColor: theme.colors.impostor,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '800',
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 42,
    letterSpacing: 1,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 20,
  },
  description: {
    marginBottom: theme.spacing['3xl'],
    alignItems: 'center',
    maxWidth: 340,
    paddingHorizontal: theme.spacing.md,
  },
  subtitleContainer: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 18,
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 26,
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: theme.spacing.md,
  },
  startButton: {
    width: '100%',
    borderRadius: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 0.4,
    elevation: 8,
  },
  onlineButton: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
  },
  buttonContent: {
    paddingVertical: theme.spacing.md,
    minHeight: 56,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  onlineButtonLabel: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
});

