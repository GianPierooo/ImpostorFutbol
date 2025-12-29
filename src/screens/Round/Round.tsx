/**
 * Router de Round que redirige a la pantalla correcta según el modo
 * 
 * ═══════════════════════════════════════════════════════════════
 * IMPORTANTE: Este archivo SOLO actúa como router.
 * Toda la lógica LOCAL está en RoundLocal.tsx
 * Toda la lógica ONLINE está en RoundOnline.tsx
 * ═══════════════════════════════════════════════════════════════
 */

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { RoundLocalScreen } from './RoundLocal';
import { RoundOnlineScreen } from './RoundOnline';

type Props = NativeStackScreenProps<NavigationParamList, 'Round'>;

export const RoundScreen: React.FC<Props> = ({ navigation, route }) => {
  const routeParams = route.params || {};
  const modeFromRoute = routeParams.mode || 'local';
  
  // Redirigir a la pantalla correcta según el modo
  if (modeFromRoute === 'online') {
    return <RoundOnlineScreen navigation={navigation as any} route={route as any} />;
  } else {
    return <RoundLocalScreen navigation={navigation as any} route={route as any} />;
  }
};
