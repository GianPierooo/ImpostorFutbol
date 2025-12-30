/**
 * Componente de conteo animado profesional (3, 2, 1)
 * Con partículas, efectos visuales y diseño acorde al tema de la app
 */
import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withSpring,
  withDelay,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Text } from 'react-native-paper';
import { theme } from '../../theme';
import { hapticService, HapticType } from '../../services/hapticService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface CountdownProps {
  onComplete: () => void;
  startNumber?: number;
  duration?: number;
}

interface Particle {
  id: number;
  angle: number;
  distance: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
}

const PARTICLE_COUNT = 16;
const COLORS = [
  theme.colors.primary, // Verde césped
  theme.colors.accent, // Rojo coral
  theme.colors.secondary, // Verde esmeralda
  '#3B82F6', // Azul
  '#F59E0B', // Ámbar
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
  '#10B981', // Verde esmeralda
];

// Generar partículas que explotan desde el centro
const generateParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + Math.random() * 20 - 10,
    distance: 120 + Math.random() * 60,
    size: i % 4 === 0 ? 10 + Math.random() * 6 : 6 + Math.random() * 4,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 50,
    duration: 600 + Math.random() * 300,
  }));
};

const ParticleComponent: React.FC<{
  particle: Particle;
  visible: boolean;
}> = ({ particle, visible }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!visible) {
      // Resetear cuando no es visible
      translateX.value = 0;
      translateY.value = 0;
      scale.value = 0;
      opacity.value = 0;
      rotation.value = 0;
      return;
    }

    // Calcular posición final
    const radians = (particle.angle * Math.PI) / 180;
    const finalX = Math.cos(radians) * particle.distance;
    const finalY = Math.sin(radians) * particle.distance;

    // Animación de explosión
    translateX.value = withDelay(
      particle.delay,
      withSpring(finalX, {
        damping: 10,
        stiffness: 120,
        mass: 0.8,
      })
    );

    translateY.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(finalY, {
          damping: 10,
          stiffness: 120,
          mass: 0.8,
        }),
        withTiming(finalY + 30, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        })
      )
    );

    // Escala y opacidad
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(1.3, {
          damping: 8,
          stiffness: 200,
        }),
        withSpring(1, {
          damping: 10,
          stiffness: 100,
        }),
        withTiming(0.5, {
          duration: particle.duration * 0.4,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: particle.duration * 0.6,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1, {
          duration: 100,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: particle.duration * 0.4,
        }),
        withTiming(0, {
          duration: particle.duration * 0.6,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    // Rotación
    rotation.value = withDelay(
      particle.delay,
      withTiming(360 + (Math.random() > 0.5 ? 180 : -180), {
        duration: particle.duration,
        easing: Easing.out(Easing.quad),
      })
    );
  }, [visible, particle]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotate: `${rotation.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: particle.size,
          height: particle.size,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const Countdown: React.FC<CountdownProps> = ({
  onComplete,
  startNumber = 3,
  duration = 1000,
}) => {
  const [currentNumber, setCurrentNumber] = useState(startNumber);
  const [isVisible, setIsVisible] = useState(true);
  const [showParticles, setShowParticles] = useState(false);

  // Partículas que se regeneran con cada número
  const particles = useMemo(() => generateParticles(), [currentNumber]);

  // Valores animados para el número
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const rotation = useSharedValue(0);
  const glowIntensity = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  // Inicializar animación al montar (solo para el primer número)
  useEffect(() => {
    // Asegurar que el número sea visible desde el inicio
    scale.value = 1;
    opacity.value = 1;
    
    // Pequeño delay para iniciar animación dramática
    const initTimer = setTimeout(() => {
      // Animación inicial dramática (empezar desde pequeño y crecer)
      scale.value = 0.5;
      opacity.value = 0.3;
      
      scale.value = withSequence(
        withSpring(1.4, {
          damping: 6,
          stiffness: 100,
        }),
        withSpring(1.0, {
          damping: 10,
          stiffness: 150,
        })
      );
      
      opacity.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.cubic),
      });
      
      rotation.value = withSequence(
        withTiming(180, {
          duration: 400,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0, {
          duration: 200,
          easing: Easing.inOut(Easing.cubic),
        })
      );
      
      glowIntensity.value = withSequence(
        withTiming(1, {
          duration: 200,
          easing: Easing.out(Easing.cubic),
        }),
        withTiming(0.6, {
          duration: 300,
          easing: Easing.inOut(Easing.cubic),
        }),
        withTiming(0.3, {
          duration: 200,
          easing: Easing.inOut(Easing.cubic),
        })
      );
      
      // Activar partículas
      setTimeout(() => {
        setShowParticles(true);
      }, 100);
      
      // Vibración inicial
      hapticService.play(HapticType.REVEAL);
    }, 100);
    
    return () => clearTimeout(initTimer);
  }, []); // Solo al montar

  // Estilo animado del número principal
  const numberAnimatedStyle = useAnimatedStyle(() => {
    'worklet';
    const currentScale = scale.value * pulseScale.value;
    const currentOpacity = opacity.value;
    return {
      transform: [
        { scale: currentScale > 0 ? currentScale : 1 }, // Si es 0, usar 1 como fallback
        { rotate: `${rotation.value}deg` },
      ],
      opacity: currentOpacity > 0 ? currentOpacity : 1, // Si es 0, usar 1 como fallback
    };
  });

  // Estilo del contenedor con glow
  const containerGlowStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      shadowOpacity: glowIntensity.value,
      shadowRadius: glowIntensity.value * 25,
      elevation: glowIntensity.value * 20,
    };
  });

  // Estilo del brillo interno
  const innerGlowStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: glowIntensity.value * 0.5,
    };
  });

  // Estilo del label
  const labelStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      opacity: opacity.value * 0.8,
    };
  });

  // Efecto de pulso continuo
  useEffect(() => {
    if (currentNumber > 0 && isVisible) {
      const pulseAnimation = withSequence(
        withTiming(1.05, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, {
          duration: 400,
          easing: Easing.inOut(Easing.ease),
        })
      );
      pulseScale.value = pulseAnimation;
      
      return () => {
        cancelAnimation(pulseScale);
      };
    }
  }, [currentNumber, isVisible]);

  useEffect(() => {
    if (currentNumber <= 0) {
      // Animación final dramática
      scale.value = withTiming(2, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
      glowIntensity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });

      // Vibración final
      hapticService.play(HapticType.SUCCESS);

      const finalTimer = setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 300);

      return () => clearTimeout(finalTimer);
    }

    // Resetear valores para animación de entrada
    scale.value = 0.3;
    opacity.value = 0;
    rotation.value = -180;
    glowIntensity.value = 0;
    setShowParticles(false);

    // Animación dramática de entrada (sin delay)
    scale.value = withSequence(
      withSpring(1.4, {
        damping: 6,
        stiffness: 100,
      }),
      withSpring(1.0, {
        damping: 10,
        stiffness: 150,
      })
    );

    opacity.value = withTiming(1, {
      duration: 250,
      easing: Easing.out(Easing.cubic),
    });

    // Rotación dramática
    rotation.value = withSequence(
      withTiming(180, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0, {
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // Efecto de brillo pulsante
    glowIntensity.value = withSequence(
      withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      }),
      withTiming(0.6, {
        duration: 300,
        easing: Easing.inOut(Easing.cubic),
      }),
      withTiming(0.3, {
        duration: 200,
        easing: Easing.inOut(Easing.cubic),
      })
    );

    // Activar partículas después de un pequeño delay
    setTimeout(() => {
      setShowParticles(true);
    }, 100);

    // Vibración en cada número
    hapticService.play(HapticType.REVEAL);

    // Cambiar al siguiente número
    const timer = setTimeout(() => {
      setCurrentNumber(currentNumber - 1);
    }, duration);

    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      cancelAnimation(rotation);
      cancelAnimation(glowIntensity);
      cancelAnimation(pulseScale);
      if (timer) clearTimeout(timer);
    };
  }, [currentNumber, duration, onComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Partículas de fondo */}
      <View style={styles.particlesContainer} pointerEvents="none">
        {particles.map((particle) => (
          <ParticleComponent
            key={`${currentNumber}-${particle.id}`}
            particle={particle}
            visible={showParticles && currentNumber > 0}
          />
        ))}
      </View>

      {/* Contenedor principal del número */}
      <Animated.View style={[styles.countdownContainer, numberAnimatedStyle]}>
        {/* Círculo de fondo con gradiente (dentro del contenedor para mejor centrado) */}
        <Animated.View
          style={[
            styles.circleBackground,
            containerGlowStyle,
            {
              shadowColor: theme.colors.primary,
            },
          ]}
        />
        {/* Anillo exterior animado */}
        <Animated.View
          style={[
            styles.outerRing,
            {
              borderColor: theme.colors.primary,
              shadowColor: theme.colors.primary,
            },
            containerGlowStyle,
          ]}
        />

        {/* Número principal */}
        <Animated.View style={styles.numberContainer}>
          <Text style={styles.number}>{currentNumber}</Text>
        </Animated.View>

        {/* Efecto de brillo interno */}
        <Animated.View
          style={[
            styles.innerGlow,
            {
              backgroundColor: theme.colors.primary + '20',
            },
            innerGlowStyle,
          ]}
        />
      </Animated.View>

      {/* Texto decorativo */}
      <Animated.View
        style={[
          styles.labelContainer,
          labelStyle,
        ]}
      >
        <Text style={styles.label}>¡Preparate!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // theme.colors.overlay
    zIndex: 1000,
  },
  particlesContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  circleBackground: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'transparent', // Eliminado el fondo gris
    shadowOffset: { width: 0, height: 0 },
    // Centrado dentro del contenedor padre
    top: -20, // (280 - 240) / 2 = 20
    left: -20, // (280 - 240) / 2 = 20
  },
  countdownContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    alignSelf: 'center', // Asegurar centrado
  },
  outerRing: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    borderWidth: 5,
    shadowOffset: { width: 0, height: 0 },
    alignSelf: 'center', // Asegurar centrado
    top: 0,
    left: 0,
  },
  numberContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  number: {
    fontSize: 140,
    fontWeight: '900',
    color: theme.colors.primary,
    textShadowColor: theme.colors.primary + '80',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
    letterSpacing: -5,
    // Asegurar que el número sea visible
    opacity: 1,
  },
  innerGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  labelContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  label: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
