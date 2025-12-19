/**
 * Componente del logo de la app
 * 
 * IMPORTANTE: Coloca tu imagen en: assets/images/logo-ball-hat.png
 */
import React, { useState } from 'react';
import { Image } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedEmoji } from '../AnimatedEmoji';

interface AppLogoProps {
  style?: any;
  animatedStyle?: any;
  size?: number;
}

const AnimatedImage = Animated.createAnimatedComponent(Image);

// Require estático - la imagen debe estar en assets/images/logo-ball-hat.png
const logoSource = require('../../../assets/images/logo-ball-hat.png');

export const AppLogo: React.FC<AppLogoProps> = ({ 
  style, 
  animatedStyle, 
  size = 100 
}) => {
  const [hasError, setHasError] = useState(false);

  // Si hay error al cargar, usar emoji como fallback
  if (hasError) {
    return (
      <AnimatedEmoji 
        emoji="⚽" 
        animation="pulse" 
        size={size * 0.6} 
        duration={4000} 
      />
    );
  }

  return (
    <AnimatedImage
      source={logoSource}
      style={[style, { width: size, height: size }, animatedStyle]}
      resizeMode="contain"
      onError={() => setHasError(true)}
    />
  );
};

