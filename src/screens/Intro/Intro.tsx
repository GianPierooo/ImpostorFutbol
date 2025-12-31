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

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import Video from 'react-native-video';
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
  const hasNavigatedRef = useRef(false);
  const videoRef = useRef<any>(null);

  const navigateToHome = React.useCallback(() => {
    // Prevenir múltiples navegaciones
    if (hasNavigatedRef.current) {
      console.log('Ya se navegó, ignorando llamada duplicada');
      return;
    }
    
    hasNavigatedRef.current = true;
    console.log('Navegando a Home...');
    
    // Usar replace para reemplazar Intro con Home en el stack
    // Esto es mejor que navigate cuando Intro es la ruta inicial
    try {
      navigation.replace('Home');
    } catch (error) {
      console.error('Error con replace, intentando con reset:', error);
      try {
        // Si replace falla, usar reset como fallback
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      } catch (resetError) {
        console.error('Error con reset también, intentando navigate:', resetError);
        // Último recurso: navigate
        try {
          navigation.navigate('Home');
        } catch (navError) {
          console.error('Error con navigate también:', navError);
        }
      }
    }
  }, [navigation]);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleEnd = () => {
    console.log('Video terminó');
    // Navegar inmediatamente sin delays complejos
    navigateToHome();
  };

  const handleError = (error: any) => {
    console.error('Error loading video:', error);
    setLoading(false);
    // Si hay un error, navegar directamente a Home
    navigateToHome();
  };

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

