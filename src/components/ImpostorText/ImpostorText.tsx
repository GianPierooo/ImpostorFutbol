/**
 * Componente que resalta la palabra "impostor" en rojo fuerte
 */
import React from 'react';
import { Text, TextProps } from 'react-native-paper';
import { theme } from '../../theme';

interface ImpostorTextProps extends TextProps {
  children: string;
}

export const ImpostorText: React.FC<ImpostorTextProps> = ({ children, ...props }) => {
  // Dividir el texto y resaltar "impostor"
  const parts = children.split(/(impostor|Impostor|IMPOSTOR)/gi);
  
  return (
    <Text {...props}>
      {parts.map((part, index) => {
        const isImpostor = /impostor/gi.test(part);
        return (
          <Text
            key={index}
            style={isImpostor ? { color: theme.colors.impostor, fontWeight: '700' } : {}}
          >
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

