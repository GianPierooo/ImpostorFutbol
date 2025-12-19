/**
 * Componente de tarjeta con animación de flip (volteo) 3D
 * Profesional y bien elaborada
 */
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { theme } from '../../theme';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  flipped: boolean;
  duration?: number;
  style?: ViewStyle;
  onFlipComplete?: () => void;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  flipped,
  style,
  onFlipComplete,
}) => {
  const flipRotation = useSharedValue(0);

  useEffect(() => {
    if (flipped) {
      flipRotation.value = withSpring(180, {
        damping: 12,
        stiffness: 90,
        mass: 1.2,
      }, (finished) => {
        if (finished && onFlipComplete) {
          onFlipComplete();
        }
      });
    } else {
      flipRotation.value = withSpring(0, {
        damping: 12,
        stiffness: 90,
        mass: 1.2,
      });
    }
  }, [flipped, onFlipComplete]);

  // Estilo para el lado frontal
  const frontAnimatedStyle = useAnimatedStyle(() => {
    // Simular flip con scaleX (se comprime horizontalmente como un flip real)
    const scaleX = interpolate(
      flipRotation.value,
      [0, 90, 90, 180],
      [1, 0.01, 0.01, 1]
    );

    // Opacidad que se desvanece cuando pasa de 90 grados
    const opacity = interpolate(
      flipRotation.value,
      [0, 75, 105, 180],
      [1, 1, 0, 0]
    );

    // Rotación en el eje Z para efecto más dinámico y profesional
    const rotateZ = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [0, 8, 0]
    );

    // Elevación durante el flip para efecto 3D
    const translateY = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [0, -10, 0]
    );

    return {
      transform: [
        { scaleX },
        { rotateZ: `${rotateZ}deg` },
        { translateY },
      ],
      opacity,
    };
  });

  // Estilo para el lado trasero
  const backAnimatedStyle = useAnimatedStyle(() => {
    // Simular flip con scaleX (empieza comprimido y se expande)
    const scaleX = interpolate(
      flipRotation.value,
      [0, 90, 90, 180],
      [0.01, 0.01, 1, 1]
    );

    // Opacidad que aparece cuando pasa de 90 grados
    const opacity = interpolate(
      flipRotation.value,
      [0, 75, 105, 180],
      [0, 0, 1, 1]
    );

    // Rotación en el eje Z invertida para efecto más dinámico
    const rotateZ = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [0, -8, 0]
    );

    // Elevación durante el flip para efecto 3D
    const translateY = interpolate(
      flipRotation.value,
      [0, 90, 180],
      [0, -10, 0]
    );

    return {
      transform: [
        { scaleX },
        { rotateZ: `${rotateZ}deg` },
        { translateY },
      ],
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      {/* Lado frontal */}
      <Animated.View
        style={[
          styles.cardSide,
          frontAnimatedStyle,
        ]}
        pointerEvents={flipped ? 'none' : 'auto'}
      >
        {front}
      </Animated.View>

      {/* Lado trasero */}
      <Animated.View
        style={[
          styles.cardSide,
          backAnimatedStyle,
        ]}
        pointerEvents={flipped ? 'auto' : 'none'}
      >
        {back}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    minHeight: 300,
    position: 'relative',
  },
  cardSide: {
    position: 'absolute',
    width: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
});

