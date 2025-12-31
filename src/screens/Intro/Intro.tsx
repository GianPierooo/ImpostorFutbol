/**
 * Pantalla de Introducción con Video
 * Se reproduce automáticamente al abrir la aplicación
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Video, { OnLoadData, OnEndData } from 'react-native-video';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { theme } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type Props = NativeStackScreenProps<NavigationParamList, 'Intro'>;

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleLoad = (data: OnLoadData) => {
    setLoading(false);
  };

  const handleEnd = (data: OnEndData) => {
    // Prevenir múltiples llamadas
    if (hasEnded) return;
    setHasEnded(true);
    
    // Usar setTimeout para asegurar que la navegación ocurra después de que el evento se procese
    // Esto previene crashes relacionados con la navegación durante el ciclo de renderizado
    setTimeout(() => {
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (error) {
        console.error('Error navigating to Home:', error);
        // Fallback a navigate si reset falla
        navigation.navigate('Home');
      }
    }, 100);
  };

  const handleError = (error: any) => {
    console.error('Error loading video:', error);
    // Si hay un error, navegar directamente a Home
    setLoading(false);
    if (!hasEnded) {
      setHasEnded(true);
      setTimeout(() => {
        try {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        } catch (navError) {
          console.error('Error navigating to Home:', navError);
          navigation.navigate('Home');
        }
      }, 100);
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../../../assets/videos/SGS-INTRO.mp4')}
        style={[styles.video, { width: screenWidth, height: screenHeight }]}
        resizeMode="cover"
        onLoad={handleLoad}
        onEnd={handleEnd}
        onError={handleError}
        paused={false}
        repeat={false}
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
        ignoreSilentSwitch="ignore"
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: screenWidth,
    height: screenHeight,
    overflow: 'hidden',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: screenWidth,
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

