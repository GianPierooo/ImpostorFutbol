/**
 * Componente de ícono animado con múltiples efectos
 */
import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { IconButton, IconButtonProps } from 'react-native-paper';

interface AnimatedIconProps extends Omit<IconButtonProps, 'style'> {
  animation?: 'pulse' | 'bounce' | 'rotate' | 'shake' | 'glow' | 'none';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  size?: number;
}

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  animation = 'pulse',
  duration = 2000,
  delay = 0,
  style,
  size = 24,
  ...props
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Validar que duration y delay sean números válidos
  const safeDuration = typeof duration === 'number' && !isNaN(duration) && isFinite(duration) && duration > 0 
    ? duration 
    : 2000;
  const safeDelay = typeof delay === 'number' && !isNaN(delay) && isFinite(delay) && delay >= 0 
    ? delay 
    : 0;
  const safeSize = typeof size === 'number' && !isNaN(size) && isFinite(size) && size > 0 
    ? size 
    : 24;

  useEffect(() => {
    if (animation === 'none') return;

    // Delay inicial
    const startDelay = setTimeout(() => {
      switch (animation) {
        case 'pulse':
          scale.value = withRepeat(
            withSequence(
              withTiming(1.2, { duration: safeDuration / 2, easing: Easing.out(Easing.ease) }),
              withTiming(1, { duration: safeDuration / 2, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
          );
          break;

        case 'bounce':
          scale.value = withRepeat(
            withSequence(
              withSpring(1.3, { damping: 2, stiffness: 100 }),
              withSpring(1, { damping: 2, stiffness: 100 })
            ),
            -1,
            true
          );
          break;

        case 'rotate':
          rotation.value = withRepeat(
            withTiming(360, { duration: safeDuration, easing: Easing.linear }),
            -1,
            false
          );
          break;

        case 'shake':
          translateX.value = withRepeat(
            withSequence(
              withTiming(-5, { duration: 50 }),
              withTiming(5, { duration: 50 }),
              withTiming(-5, { duration: 50 }),
              withTiming(5, { duration: 50 }),
              withTiming(0, { duration: 50 })
            ),
            -1,
            false
          );
          break;

        case 'glow':
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.5, { duration: safeDuration / 2 }),
              withTiming(1, { duration: safeDuration / 2 })
            ),
            -1,
            true
          );
          break;
      }
    }, safeDelay);

    return () => clearTimeout(startDelay);
  }, [animation, safeDuration, safeDelay]);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const style: any = {
      transform: [{ scale: scale.value }],
    };

    if (animation === 'rotate') {
      style.transform.push({ rotate: `${rotation.value}deg` });
    }

    if (animation === 'shake') {
      style.transform.push({ translateX: translateX.value });
    }

    if (animation === 'glow') {
      style.opacity = opacity.value;
    }

    return style;
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      <IconButton {...props} size={safeSize} />
    </Animated.View>
  );
};

