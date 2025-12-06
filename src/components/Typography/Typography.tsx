import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { theme } from '../../theme';

type TypographyVariant = keyof typeof theme.typography.styles;

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = theme.colors.text,
  style,
  children,
  ...props
}) => {
  const variantStyle = theme.typography.styles[variant];

  return (
    <Text
      style={[
        styles.base,
        variantStyle,
        { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.families.regular,
  },
});

