/**
 * Botón animado con efectos neón futuristas
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import { Button, ButtonProps } from 'react-native-paper';
import { theme } from '../../theme';

interface AnimatedButtonProps extends ButtonProps {
  neon?: boolean;
  glow?: boolean;
  delay?: number;
}

const AnimatedButtonComponent = Animated.createAnimatedComponent(Button);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  neon = true,
  glow = true,
  delay = 0,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View
      entering={FadeIn.delay(delay)}
      style={animatedStyle}
    >
      <Button
        {...props}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          style,
          neon && styles.neonButton,
          glow && styles.glowButton,
        ]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  neonButton: {
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  glowButton: {
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 20,
    elevation: 10,
  },
});

