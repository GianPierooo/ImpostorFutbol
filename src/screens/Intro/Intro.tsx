/**
 * Pantalla de Introducción con Animación Profesional del Logo
 * Animación elegante de 1.5 segundos usando react-native-animatable
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { AppLogo } from '../../components';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { theme } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ANIMATION_DURATION = 1500; // 1.5 segundos

type Props = NativeStackScreenProps<NavigationParamList, 'Intro'>;

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const hasNavigatedRef = useRef(false);
  const glowRef = useRef<any>(null);
  const logoRef = useRef<any>(null);

  useEffect(() => {
    // Iniciar fade out antes de navegar
    const fadeOutTimer = setTimeout(() => {
      if (logoRef.current) {
        logoRef.current.fadeOut(300);
      }
      if (glowRef.current) {
        glowRef.current.fadeOut(300);
      }
    }, ANIMATION_DURATION - 300);

    const navigateTimer = setTimeout(() => {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigation.replace('Home');
      }
    }, ANIMATION_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Glow de fondo animado */}
      <Animatable.View
        ref={glowRef}
        animation="pulse"
        iterationCount="infinite"
        duration={2000}
        easing="ease-in-out"
        style={styles.glowContainer}
      >
        <View style={styles.glowCircle} />
        <View style={[styles.glowCircle, styles.glowCircleInner]} />
      </Animatable.View>

      {/* Logo con animación profesional */}
      <Animatable.View
        ref={logoRef}
        animation={{
          from: {
            opacity: 0,
            scale: 0.3,
            rotate: '-180deg',
          },
          to: {
            opacity: 1,
            scale: 1,
            rotate: '0deg',
          },
        }}
        duration={600}
        easing="ease-out-back"
        delay={0}
        style={styles.logoContainer}
      >
        <Animatable.View
          animation={{
            from: { scale: 1 },
            to: { scale: 1.15 },
          }}
          duration={400}
          delay={600}
          iterationCount={2}
          direction="alternate"
          easing="ease-in-out"
        >
          <AppLogo size={140} />
        </Animatable.View>
      </Animatable.View>

      {/* Partículas decorativas animadas */}
      <Animatable.View
        animation="bounceIn"
        duration={800}
        delay={400}
        style={[styles.particle, styles.particle1]}
      >
        <View style={styles.particleDot} />
      </Animatable.View>
      <Animatable.View
        animation="bounceIn"
        duration={800}
        delay={600}
        style={[styles.particle, styles.particle2]}
      >
        <View style={styles.particleDot} />
      </Animatable.View>
      <Animatable.View
        animation="bounceIn"
        duration={800}
        delay={800}
        style={[styles.particle, styles.particle3]}
      >
        <View style={styles.particleDot} />
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glowContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowCircle: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: theme.colors.primary,
    opacity: 0.25,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 80,
    shadowOpacity: 1,
    elevation: 20,
  },
  glowCircleInner: {
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.4,
    shadowRadius: 60,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  particle: {
    position: 'absolute',
    zIndex: 5,
  },
  particleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    shadowOpacity: 0.8,
  },
  particle1: {
    top: '25%',
    left: '20%',
  },
  particle2: {
    top: '30%',
    right: '25%',
  },
  particle3: {
    bottom: '30%',
    left: '30%',
  },
});
