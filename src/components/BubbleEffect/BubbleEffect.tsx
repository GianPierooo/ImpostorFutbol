/**
 * Componente de efecto de partículas/celebración profesional
 * para cuando se agrega un nuevo jugador
 */
import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BubbleEffectProps {
  visible: boolean;
  position?: { x: number; y: number };
  onComplete?: () => void;
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

const PARTICLE_COUNT = 24;
const COLORS = [
  theme.colors.primary,
  theme.colors.accent,
  '#10B981', // Verde esmeralda
  '#3B82F6', // Azul
  '#F59E0B', // Ámbar
  '#EF4444', // Rojo
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa
];

// Generar partículas con propiedades aleatorias
const generateParticles = (): Particle[] => {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    angle: (360 / PARTICLE_COUNT) * i + Math.random() * 15 - 7.5, // Distribución uniforme con variación
    distance: 100 + Math.random() * 80, // Distancia variable
    size: i % 3 === 0 ? 8 + Math.random() * 4 : 5 + Math.random() * 3, // Algunas partículas más grandes
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    delay: Math.random() * 100, // Delay aleatorio para efecto más natural
    duration: 800 + Math.random() * 400, // Duración variable
  }));
};

const ParticleComponent: React.FC<{
  particle: Particle;
  onComplete: () => void;
}> = ({ particle, onComplete }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Validar que los valores de la partícula sean válidos antes de calcular
    const safeAngle = typeof particle.angle === 'number' && !isNaN(particle.angle) && isFinite(particle.angle)
      ? particle.angle
      : 0;
    const safeDistance = typeof particle.distance === 'number' && !isNaN(particle.distance) && isFinite(particle.distance) && particle.distance > 0
      ? particle.distance
      : 100;
    
    // Calcular posición final basada en ángulo y distancia
    const radians = (safeAngle * Math.PI) / 180;
    const finalX = Math.cos(radians) * safeDistance;
    const finalY = Math.sin(radians) * safeDistance;
    
    // Validar que los cálculos sean válidos
    if (isNaN(finalX) || isNaN(finalY) || !isFinite(finalX) || !isFinite(finalY)) {
      console.warn(`⚠️ BubbleEffect: Valores inválidos calculados para partícula ${particle.id}`);
      return;
    }

    // Animación de salida con física realista
    translateX.value = withDelay(
      particle.delay,
      withSpring(finalX, {
        damping: 12,
        stiffness: 100,
        mass: 0.8,
      })
    );

    translateY.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(finalY, {
          damping: 12,
          stiffness: 100,
          mass: 0.8,
        }),
        // Efecto de gravedad: caída adicional
        withTiming(finalY + 20, {
          duration: 200,
          easing: Easing.out(Easing.quad),
        })
      )
    );

    // Escala: aparece rápido y desaparece suavemente
    scale.value = withDelay(
      particle.delay,
      withSequence(
        withSpring(1.2, {
          damping: 8,
          stiffness: 200,
        }),
        withSpring(1, {
          damping: 10,
          stiffness: 100,
        }),
        withTiming(0.7, {
          duration: particle.duration * 0.5,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(0, {
          duration: particle.duration * 0.5,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    // Opacidad: fade in y fade out suave
    opacity.value = withDelay(
      particle.delay,
      withSequence(
        withTiming(1, {
          duration: 150,
          easing: Easing.out(Easing.ease),
        }),
        withTiming(1, {
          duration: particle.duration * 0.5,
        }),
        withTiming(0, {
          duration: particle.duration * 0.5,
          easing: Easing.in(Easing.ease),
        })
      )
    );

    // Rotación suave
    rotation.value = withDelay(
      particle.delay,
      withTiming(360 + (Math.random() > 0.5 ? 180 : -180), {
        duration: particle.duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Llamar al callback cuando termine (solo la última partícula)
    if (particle.id === PARTICLE_COUNT - 1) {
      const timer = setTimeout(() => {
        onComplete();
      }, particle.delay + particle.duration);

      return () => clearTimeout(timer);
    }
  }, [particle, onComplete]);

  const animatedStyle = useAnimatedStyle(() => {
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

export const BubbleEffect: React.FC<BubbleEffectProps> = ({ visible, position, onComplete }) => {
  const particles = useMemo(() => generateParticles(), [visible]);
  
  // Validar y usar posición proporcionada o centro de pantalla por defecto
  // IMPORTANTE: Validar que las coordenadas sean números válidos para evitar errores de renderizado
  const isValidPosition = position && 
    typeof position.x === 'number' && 
    !isNaN(position.x) && 
    isFinite(position.x) &&
    typeof position.y === 'number' && 
    !isNaN(position.y) && 
    isFinite(position.y);
  
  const effectX = isValidPosition ? position.x : SCREEN_WIDTH / 2;
  const effectY = isValidPosition ? position.y : SCREEN_HEIGHT * 0.3;

  if (!visible) {
    return null;
  }

  return (
    <View 
      style={[
        styles.container,
        {
          left: effectX,
          top: effectY,
        }
      ]} 
      pointerEvents="none"
    >
      {particles.map((particle) => (
        <ParticleComponent
          key={particle.id}
          particle={particle}
          onComplete={particle.id === PARTICLE_COUNT - 1 ? (onComplete || (() => {})) : () => {}}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 4,
  },
});
