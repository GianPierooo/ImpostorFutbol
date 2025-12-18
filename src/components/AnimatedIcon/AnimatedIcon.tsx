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

  useEffect(() => {
    if (animation === 'none') return;

    // Delay inicial
    const startDelay = setTimeout(() => {
      switch (animation) {
        case 'pulse':
          scale.value = withRepeat(
            withSequence(
              withTiming(1.2, { duration: duration / 2, easing: Easing.out(Easing.ease) }),
              withTiming(1, { duration: duration / 2, easing: Easing.in(Easing.ease) })
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
            withTiming(360, { duration, easing: Easing.linear }),
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
              withTiming(0.5, { duration: duration / 2 }),
              withTiming(1, { duration: duration / 2 })
            ),
            -1,
            true
          );
          break;
      }
    }, delay);

    return () => clearTimeout(startDelay);
  }, [animation, duration, delay]);

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
      <IconButton {...props} size={size} />
    </Animated.View>
  );
};

