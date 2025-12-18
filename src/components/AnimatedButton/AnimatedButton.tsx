/**
 * Botón animado con efectos interactivos mejorados
 */
import React, { useState } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { Button, ButtonProps } from 'react-native-paper';

interface AnimatedButtonProps extends ButtonProps {
  animation?: 'pulse' | 'bounce' | 'glow' | 'none';
  delay?: number;
  style?: ViewStyle;
}

const AnimatedButtonComponent = Animated.createAnimatedComponent(Button);

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  animation = 'pulse',
  delay = 0,
  style,
  onPress,
  ...props
}) => {
  const scale = useSharedValue(1);
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    setIsPressed(true);
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    setIsPressed(false);
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = (e: any) => {
    // Efecto de bounce al presionar
    scale.value = withSequence(
      withSpring(0.9, { damping: 10, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    
    if (onPress) {
      onPress(e);
    }
  };

  return (
    <Animated.View
      entering={FadeIn.delay(delay)}
      style={animatedStyle}
    >
      <Button
        {...props}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={style}
      />
    </Animated.View>
  );
};
