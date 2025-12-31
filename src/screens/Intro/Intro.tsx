/**
 * Pantalla de Introducción con Video
 * Se reproduce automáticamente al abrir la aplicación
 */

import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Video, { OnLoadData, OnEndData } from 'react-native-video';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { theme } from '../../theme';

type Props = NativeStackScreenProps<NavigationParamList, 'Intro'>;

export const IntroScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<Video>(null);

  const handleLoad = (data: OnLoadData) => {
    setLoading(false);
  };

  const handleEnd = (data: OnEndData) => {
    // Navegar a Home después de que termine el video
    navigation.replace('Home');
  };

  const handleError = (error: any) => {
    console.error('Error loading video:', error);
    // Si hay un error, navegar directamente a Home
    setLoading(false);
    navigation.replace('Home');
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require('../../../assets/videos/SGS-INTRO.mp4')}
        style={styles.video}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
});

