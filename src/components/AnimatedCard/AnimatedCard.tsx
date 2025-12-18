/**
 * Card animada con efectos neón y entrada suave
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
} from 'react-native-reanimated';
import { Card, CardProps } from 'react-native-paper';
import { theme } from '../../theme';

interface AnimatedCardProps extends CardProps {
  delay?: number;
  neon?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  delay = 0,
  neon = false,
  style,
  children,
  ...props
}) => {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
    >
      <Card
        {...props}
        style={[
          style,
          neon && styles.neonCard,
        ]}
        mode="elevated"
      >
        {children}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  neonCard: {
    borderWidth: 1,
    borderColor: theme.colors.borderNeon,
    backgroundColor: theme.colors.surface,
    shadowColor: theme.colors.borderNeon,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    shadowOpacity: 0.3,
  },
});
