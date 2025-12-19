import React from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
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
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text, Divider } from 'react-native-paper';
import { ScreenContainer, AnimatedEmoji, AnimatedButton } from '../../components';
import { theme } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';

const { width, height } = Dimensions.get('window');
const APP_VERSION = '1.0.0';
const APP_NAME = 'Impostor Fútbol';

type Props = NativeStackScreenProps<NavigationParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleStartGame = () => {
    navigation.navigate('Lobby');
  };

  // Estado para controlar el mensaje flotante
  const [showScrollHint, setShowScrollHint] = React.useState(true);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Animaciones profesionales del balón
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);
  const shadowIntensity = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Animaciones sutiles para el fondo
  const backgroundBreath = useSharedValue(0);
  const subtleGlow = useSharedValue(0);
  
  // Animación para el mensaje flotante
  const scrollHintY = useSharedValue(0);
  const scrollHintOpacity = useSharedValue(1);

  React.useEffect(() => {
    // Pulso suave y elegante del balón
    pulse.value = withRepeat(
      withTiming(1.05, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Glow animado más suave y profesional
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Intensidad de sombra animada (más dinámica)
    shadowIntensity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Rotación muy sutil del contenedor (efecto 3D)
    rotation.value = withRepeat(
      withSequence(
        withTiming(2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-2, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Efecto de respiración muy sutil en el fondo
    backgroundBreath.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.95, { duration: 6000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow sutil y profesional
    subtleGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Animación del mensaje flotante (sube y baja)
    scrollHintY.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Ocultar el mensaje después de 5 segundos
    const hideScrollHint = () => {
      setShowScrollHint(false);
    };

    const timer = setTimeout(() => {
      scrollHintOpacity.value = withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(hideScrollHint)();
        }
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const glowOpacity = interpolate(glow.value, [0.5, 1], [0.5, 0.9]);
    const shadowRadius = interpolate(shadowIntensity.value, [0.6, 1], [30, 45]);
    return {
      transform: [
        { scale: pulse.value },
        { rotate: `${rotation.value}deg` },
      ],
      shadowOpacity: glowOpacity,
      shadowRadius: shadowRadius,
    };
  });

  const iconContainerAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      // El borde se mantiene estático, pero las sombras y el glow se animan
    };
  });

  // Estilos animados sutiles para el fondo
  const backgroundBreathStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(backgroundBreath.value, [0.95, 1], [0.02, 0.05]);
    return {
      opacity,
    };
  });

  const subtleGlowStyle = useAnimatedStyle(() => {
    'worklet';
    const opacity = interpolate(subtleGlow.value, [0.7, 1], [0.08, 0.15]);
    return {
      opacity,
    };
  });

  // Estilo animado para el mensaje flotante
  const scrollHintStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollHintY.value }],
    opacity: scrollHintOpacity.value,
  }));

  // Función para ocultar el mensaje (necesaria para runOnJS)
  const hideScrollHint = React.useCallback(() => {
    setShowScrollHint(false);
  }, []);

  // Manejar el scroll para ocultar el mensaje
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 50 && showScrollHint) {
      scrollHintOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          runOnJS(hideScrollHint)();
        }
      });
    }
  };

  return (
    <ScreenContainer>
      {/* Efecto de respiración muy sutil en el fondo */}
      <Animated.View style={[styles.subtleBackground, backgroundBreathStyle]} pointerEvents="none">
        <LinearGradient
          colors={[theme.colors.primary + '10', 'transparent', theme.colors.primary + '10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      
      {/* Glow sutil y profesional alrededor del contenido */}
      <Animated.View style={[styles.subtleGlowEffect, subtleGlowStyle]} pointerEvents="none">
        <LinearGradient
          colors={['transparent', theme.colors.primary + '08', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Mensaje flotante para indicar scroll */}
      {showScrollHint && (
        <Animated.View style={[styles.scrollHint, scrollHintStyle]} pointerEvents="none">
          <View style={styles.scrollHintContainer}>
            <Text style={styles.scrollHintText}>Desliza para jugar</Text>
            <Animated.View style={styles.scrollHintArrow}>
              <Text style={styles.scrollHintArrowIcon}>↓</Text>
            </Animated.View>
          </View>
        </Animated.View>
      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header con logo y título */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          {/* Contenedor del icono mejorado */}
          <View style={styles.iconWrapper}>
            {/* Glow exterior profesional con animación mejorada */}
            <Animated.View style={[styles.iconGlow, iconAnimatedStyle]} />
            
            {/* Contenedor principal con animaciones profesionales */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle, iconContainerAnimatedStyle]}>
              <LinearGradient
                colors={['#10B98150', '#16A34A40', '#10B98130']}
                style={styles.iconGradient}
              >
                <AnimatedEmoji emoji="⚽" animation="pulse" size={80} duration={4000} />
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Títulos con mejor espaciado */}
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
          
          {/* Tagline profesional */}
          <Animated.Text
            entering={FadeInDown.delay(800).springify()}
            style={styles.tagline}
          >
            El juego de deducción futbolera
          </Animated.Text>
        </Animated.View>

        {/* Descripción mejorada */}
        <Animated.View
          entering={FadeInUp.delay(1000).springify()}
          style={styles.description}
        >
          <View style={styles.descriptionCard}>
            <Text variant="titleMedium" style={styles.subtitle}>
              ¿Quién es el <Text style={styles.impostorText}>impostor</Text>?
            </Text>
            <Text variant="bodyLarge" style={styles.descriptionText}>
              Da pistas sobre jugadores y equipos de fútbol. El <Text style={styles.impostorText}>impostor</Text> no conoce la palabra secreta. 
              Descúbrelo antes de que sea demasiado tarde.
            </Text>
          </View>
        </Animated.View>

        {/* Botones de acción */}
        <Animated.View
          entering={FadeIn.delay(1200)}
          style={styles.actions}
        >
          <AnimatedButton
            mode="contained"
            onPress={handleStartGame}
            style={styles.startButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="play-circle"
            buttonColor={theme.colors.primary}
            textColor={theme.colors.textLight}
          >
            Iniciar Partida Local
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
            Jugar Online
          </AnimatedButton>
        </Animated.View>

        {/* Footer con información profesional */}
        <Animated.View
          entering={FadeIn.delay(1400)}
          style={styles.footer}
        >
          <Divider style={styles.divider} />
          
          <View style={styles.footerContent}>
            <View style={styles.footerRow}>
              <Text variant="bodySmall" style={styles.footerText}>
                Versión {APP_VERSION}
              </Text>
              <Text variant="bodySmall" style={styles.footerDot}>•</Text>
              <Text variant="bodySmall" style={styles.footerText}>
                {new Date().getFullYear()}
              </Text>
            </View>
            
            <Text variant="bodySmall" style={styles.footerAppName}>
              {APP_NAME}
            </Text>
            
            <Text variant="bodySmall" style={styles.footerCopyright}>
              © {new Date().getFullYear()} Todos los derechos reservados
            </Text>
            
            <View style={styles.footerFeatures}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text variant="bodySmall" style={styles.featureText}>Modo Local</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌐</Text>
                <Text variant="bodySmall" style={styles.featureText}>Modo Online</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>⚽</Text>
                <Text variant="bodySmall" style={styles.featureText}>Temática Fútbol</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing.xl,
    zIndex: 1,
  },
  // Efectos sutiles y profesionales
  subtleBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  subtleGlowEffect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  header: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    paddingTop: theme.spacing.lg,
  },
  iconWrapper: {
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.primary + '20',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 50,
    shadowOpacity: 0.8,
    elevation: 20,
    zIndex: 1,
  },
  iconContainer: {
    width: 170,
    height: 170,
    borderRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary + 'CC',
    overflow: 'hidden',
    backgroundColor: theme.colors.surface + '95',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 40,
    shadowOpacity: 0.85,
    elevation: 20,
    zIndex: 2,
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
    textShadowColor: theme.colors.impostor + '80',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 25,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '800',
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 44,
    letterSpacing: 1.5,
    textShadowColor: theme.colors.primary + '80',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 25,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  description: {
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  descriptionCard: {
    backgroundColor: theme.colors.surface + 'CC',
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    maxWidth: 380,
    width: '100%',
    ...theme.shadows.medium,
  },
  subtitleContainer: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 20,
    textAlign: 'center',
  },
  descriptionText: {
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
    alignSelf: 'center',
  },
  startButton: {
    width: '100%',
    borderRadius: 18,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    shadowOpacity: 0.5,
    elevation: 10,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
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
  footer: {
    width: '100%',
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  divider: {
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.border + '60',
  },
  footerContent: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  footerText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  footerDot: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  footerAppName: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  footerCopyright: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    flexWrap: 'wrap',
  },
  featureItem: {
    alignItems: 'center',
    gap: theme.spacing.xs,
    minWidth: 80,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    color: theme.colors.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },
  // Mensaje flotante de scroll
  scrollHint: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scrollHintContainer: {
    backgroundColor: theme.colors.surface + 'E6',
    borderRadius: 25,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    ...theme.shadows.medium,
  },
  scrollHintText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  scrollHintArrow: {
    marginLeft: theme.spacing.xs,
  },
  scrollHintArrowIcon: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
});

