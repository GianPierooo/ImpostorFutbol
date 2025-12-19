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
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { Button, Text, Divider, IconButton, Portal, Dialog } from 'react-native-paper';
import { ScreenContainer, AnimatedButton, AppLogo } from '../../components';
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

  const scrollViewRef = React.useRef<ScrollView>(null);

  // Animaciones profesionales del balón
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0);
  const shadowIntensity = useSharedValue(0);
  const rotation = useSharedValue(0);
  
  // Animaciones sutiles para el fondo
  const backgroundBreath = useSharedValue(0);
  const subtleGlow = useSharedValue(0);
  

  React.useEffect(() => {
    // Pulso suave y elegante del balón - más visible
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 2000, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.in(Easing.ease) })
      ),
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


  const [showInfo, setShowInfo] = React.useState(false);

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

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header con logo y título */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.header}
        >
          {/* Contenedor del icono mejorado - Reducido */}
          <View style={styles.iconWrapper}>
            {/* Glow exterior profesional con animación mejorada */}
            <Animated.View style={[styles.iconGlow, iconAnimatedStyle]} />
            
            {/* Contenedor principal con animaciones profesionales */}
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle, iconContainerAnimatedStyle]}>
              <AppLogo 
                style={styles.logoImage}
                animatedStyle={iconAnimatedStyle}
                size={100}
              />
            </Animated.View>
          </View>

          {/* Títulos con mejor espaciado y contraste mejorado */}
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
          
          {/* Tagline mejorado */}
          <Animated.Text
            entering={FadeInDown.delay(800).springify()}
            style={styles.tagline}
          >
            EL JUEGO DE DEDUCCIÓN FUTBOLERA
          </Animated.Text>
        </Animated.View>

        {/* Botón de información en esquina */}
        <Animated.View
          entering={FadeIn.delay(1000)}
          style={styles.infoButtonContainer}
        >
          <IconButton
            icon="information-outline"
            size={24}
            iconColor={theme.colors.textSecondary}
            onPress={() => setShowInfo(true)}
            style={styles.infoButton}
          />
        </Animated.View>

        {/* Botones de acción */}
        <Animated.View
          entering={FadeIn.delay(1200)}
          style={styles.actions}
        >
          <View style={styles.startButtonWrapper}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.startButtonGradient}
            >
              <AnimatedButton
                mode="contained"
                onPress={handleStartGame}
                style={styles.startButton}
                contentStyle={styles.buttonContent}
                labelStyle={styles.buttonLabel}
                icon="whistle-outline"
                buttonColor="transparent"
                textColor={theme.colors.textLight}
              >
                Iniciar Partida Local
              </AnimatedButton>
            </LinearGradient>
          </View>
          <AnimatedButton
            mode="outlined"
            onPress={() => navigation.navigate('OnlineLobby')}
            style={styles.onlineButton}
            contentStyle={styles.buttonContent}
            labelStyle={[styles.buttonLabel, styles.onlineButtonLabel]}
            icon="web"
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

      {/* Dialog de información */}
      <Portal>
        <Dialog 
          visible={showInfo} 
          onDismiss={() => setShowInfo(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>
            ¿Quién es el <Text style={styles.impostorText}>impostor</Text>?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge" style={styles.dialogText}>
              Da pistas sobre jugadores y equipos de fútbol. El <Text style={styles.impostorText}>impostor</Text> no conoce la palabra secreta. 
              Descúbrelo antes de que sea demasiado tarde.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowInfo(false)} textColor={theme.colors.primary}>
              Entendido
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
    minHeight: height,
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
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary + '20',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 50,
    shadowOpacity: 0.8,
    elevation: 20,
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    overflow: 'visible',
    backgroundColor: 'transparent',
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
  logoImage: {
    width: 100,
    height: 100,
  },
  title: {
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
    fontWeight: '900',
    fontSize: 32,
    letterSpacing: 1,
  },
  titleImpostor: {
    color: theme.colors.impostor,
    // Borde blanco sutil para mejor contraste
    textShadowColor: '#FFFFFF40',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    // Glow adicional
    shadowColor: theme.colors.impostor + '80',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 20,
  },
  impostorText: {
    color: theme.colors.impostor,
    fontWeight: '800',
  },
  titleAccent: {
    textAlign: 'center',
    color: theme.colors.primary,
    fontWeight: '900',
    fontSize: 34,
    letterSpacing: 1.5,
    // Borde blanco sutil para mejor contraste
    textShadowColor: '#FFFFFF40',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
    // Glow adicional
    shadowColor: theme.colors.primary + '80',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 20,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2, // Tracking más amplio
    marginTop: theme.spacing.xs,
    textTransform: 'uppercase', // Small caps effect
  },
  infoButtonContainer: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    zIndex: 10,
  },
  infoButton: {
    backgroundColor: theme.colors.surface + 'CC',
    margin: 0,
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
    lineHeight: 20,
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  actions: {
    width: '100%',
    maxWidth: 360,
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    alignSelf: 'center',
  },
  startButtonWrapper: {
    width: '100%',
    borderRadius: 18,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    shadowOpacity: 0.6,
    elevation: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  startButton: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 0,
    elevation: 0,
  },
  onlineButton: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
    // Texto más brillante para mejor contraste
  },
  buttonContent: {
    paddingVertical: theme.spacing.sm,
    minHeight: 50,
  },
  buttonLabel: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  onlineButtonLabel: {
    color: theme.colors.primary,
    fontWeight: '800',
    // Texto más brillante
    opacity: 1,
  },
  dialog: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
  },
  dialogTitle: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  dialogText: {
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    width: '100%',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
  divider: {
    marginBottom: theme.spacing.md,
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
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
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
});

