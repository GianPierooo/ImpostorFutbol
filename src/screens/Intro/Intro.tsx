/**
 * Pantalla de Introducción con Video
 * Se reproduce automáticamente al abrir la aplicación
 * 
 * CONFIGURACIÓN DE DIMENSIONES DEL VIDEO:
 * Si el video no se ve bien, ajusta las siguientes constantes manualmente:
 * - VIDEO_WIDTH: Ancho del video (puedes usar un número fijo o '100%')
 * - VIDEO_HEIGHT: Alto del video (puedes usar un número fijo o '100%')
 * - VIDEO_RESIZE_MODE: 'cover' (cubre toda la pantalla), 'contain' (ajusta sin recortar), 'stretch' (estira)
 */

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Video, { OnLoadData, OnEndData } from 'react-native-video';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { theme } from '../../theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// ============================================
// CONFIGURACIÓN MANUAL DE DIMENSIONES DEL VIDEO
// ============================================
// Ajusta estos valores si el video no se ve bien
// 
// Para VIDEO_WIDTH y VIDEO_HEIGHT puedes usar:
// - Un número fijo (ej: 1080, 1920) para dimensiones específicas en píxeles
// - screenWidth o screenHeight para usar las dimensiones de la pantalla
// - '100%' como string para que ocupe todo el ancho/alto (pero esto puede no funcionar bien con position absolute)
//
// Ejemplos:
// const VIDEO_WIDTH = 1920;  // Ancho fijo de 1920px
// const VIDEO_WIDTH = screenWidth;  // Ancho de la pantalla
// const VIDEO_WIDTH = screenWidth * 1.2;  // 20% más grande que la pantalla
//
// Para VIDEO_RESIZE_MODE:
// - 'cover': Cubre toda la pantalla, puede recortar partes del video
// - 'contain': Ajusta el video completo sin recortar, puede dejar espacios
// - 'stretch': Estira el video para llenar la pantalla, puede deformar
// ============================================
const VIDEO_WIDTH: number | string = screenWidth; // AJUSTA ESTE VALOR según necesites
const VIDEO_HEIGHT: number | string = screenHeight; // AJUSTA ESTE VALOR según necesites
const VIDEO_RESIZE_MODE: 'cover' | 'contain' | 'stretch' = 'cover'; // AJUSTA ESTE VALOR: 'cover', 'contain', o 'stretch'
// ============================================

type Props = NativeStackScreenProps<NavigationParamList, 'Intro'>;

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [hasEnded, setHasEnded] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const videoRef = useRef<Video>(null);

  const handleLoad = (data: OnLoadData) => {
    setLoading(false);
  };

  const handleEnd = (data: OnEndData) => {
    // Prevenir múltiples llamadas
    if (hasEnded || isNavigating) {
      console.log('Video end handler: ya se está navegando o ya terminó');
      return;
    }
    
    console.log('Video terminó, iniciando navegación...');
    setHasEnded(true);
    setIsNavigating(true);
    
    // Pausar el video primero para evitar problemas
    if (videoRef.current) {
      try {
        // @ts-ignore - react-native-video puede tener métodos adicionales
        videoRef.current.setNativeProps({ paused: true });
      } catch (e) {
        console.warn('No se pudo pausar el video:', e);
      }
    }
    
    // Esperar un momento para que el video se pause y luego navegar
    // Usar requestAnimationFrame para asegurar que la navegación ocurra en el siguiente frame
    requestAnimationFrame(() => {
      setTimeout(() => {
        try {
          console.log('Navegando a Home...');
          // Usar navigate en lugar de reset para evitar problemas con el stack
          navigation.navigate('Home');
        } catch (error) {
          console.error('Error navigating to Home:', error);
          // Si navigate falla, intentar con reset
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (resetError) {
            console.error('Error con reset también:', resetError);
            // Último recurso: usar goBack si es posible, o simplemente dejar que el usuario cierre la app
          }
        }
      }, 200);
    });
  };

  const handleError = (error: any) => {
    console.error('Error loading video:', error);
    // Si hay un error, navegar directamente a Home
    setLoading(false);
    if (!hasEnded && !isNavigating) {
      setHasEnded(true);
      setIsNavigating(true);
      setTimeout(() => {
        try {
          console.log('Navegando a Home por error...');
          navigation.navigate('Home');
        } catch (navError) {
          console.error('Error navigating to Home:', navError);
          try {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } catch (resetError) {
            console.error('Error con reset también:', resetError);
          }
        }
      }, 200);
    }
  };
  
  // Cleanup: si el componente se desmonta, asegurar que no haya navegaciones pendientes
  useEffect(() => {
    return () => {
      console.log('IntroScreen desmontándose...');
      setIsNavigating(false);
    };
  }, []);

  // Si estamos navegando, no renderizar el video para evitar problemas
  if (isNavigating) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../../../assets/videos/SGS-INTRO.mp4')}
        style={[
          styles.video, 
          { 
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT,
          }
        ]}
        resizeMode={VIDEO_RESIZE_MODE}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    // Las dimensiones se aplican dinámicamente desde VIDEO_WIDTH y VIDEO_HEIGHT
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

