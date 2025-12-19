/**
 * Componente para animar emojis e íconos de texto
 */
import React, { useEffect } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface AnimatedEmojiProps extends TextProps {
  emoji: string;
  animation?: 'pulse' | 'bounce' | 'rotate' | 'shake' | 'glow' | 'none';
  duration?: number;
  delay?: number;
  size?: number;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export const AnimatedEmoji: React.FC<AnimatedEmojiProps> = ({
  emoji,
  animation = 'pulse',
  duration = 3000, // Duración más larga para animaciones más suaves
  delay = 0,
  size = 48,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Validar que duration y delay sean números válidos
  const safeDuration = typeof duration === 'number' && !isNaN(duration) && isFinite(duration) && duration > 0 
    ? duration 
    : 3000;
  const safeDelay = typeof delay === 'number' && !isNaN(delay) && isFinite(delay) && delay >= 0 
    ? delay 
    : 0;
  const safeSize = typeof size === 'number' && !isNaN(size) && isFinite(size) && size > 0 
    ? size 
    : 48;

  useEffect(() => {
    if (animation === 'none') return;

    const startDelay = setTimeout(() => {
      switch (animation) {
        case 'pulse':
          scale.value = withRepeat(
            withSequence(
              withTiming(1.08, { duration: safeDuration / 2, easing: Easing.out(Easing.ease) }),
              withTiming(1, { duration: safeDuration / 2, easing: Easing.in(Easing.ease) })
            ),
            -1,
            true
          );
          break;

        case 'bounce':
          scale.value = withRepeat(
            withSequence(
              withSpring(1.1, { damping: 8, stiffness: 80 }),
              withSpring(1, { damping: 8, stiffness: 80 })
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
              withTiming(-4, { duration: 100, easing: Easing.out(Easing.ease) }),
              withTiming(4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
              withTiming(-4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
              withTiming(4, { duration: 100, easing: Easing.inOut(Easing.ease) }),
              withTiming(0, { duration: 100, easing: Easing.in(Easing.ease) })
            ),
            -1,
            false
          );
          break;

        case 'glow':
          opacity.value = withRepeat(
            withSequence(
              withTiming(0.75, { duration: safeDuration / 2, easing: Easing.out(Easing.ease) }),
              withTiming(1, { duration: safeDuration / 2, easing: Easing.in(Easing.ease) })
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
    <AnimatedText
      {...props}
      style={[styles.emoji, { fontSize: safeSize }, style, animatedStyle]}
    >
      {emoji}
    </AnimatedText>
  );
};

const styles = StyleSheet.create({
  emoji: {
    textAlign: 'center',
  },
});

