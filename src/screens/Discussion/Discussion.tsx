/**
 * Wrapper de Discussion que redirige a la pantalla correcta según el modo
 * 
 * IMPORTANTE: Este archivo solo actúa como router.
 * Toda la lógica está separada en DiscussionLocal.tsx y DiscussionOnline.tsx
 */

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { DiscussionLocalScreen } from './DiscussionLocal';
import { DiscussionOnlineScreen } from './DiscussionOnline';

type Props = NativeStackScreenProps<NavigationParamList, 'Discussion'>;

export const DiscussionScreen: React.FC<Props> = ({ navigation, route }) => {
  const routeParams = route.params || {};
  const modeFromRoute = routeParams.mode || 'local';
  
  // Redirigir a la pantalla correcta según el modo
  if (modeFromRoute === 'online') {
    return <DiscussionOnlineScreen navigation={navigation as any} route={route as any} />;
  } else {
    return <DiscussionLocalScreen navigation={navigation as any} route={route as any} />;
  }
};
