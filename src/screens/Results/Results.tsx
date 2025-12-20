/**
 * Wrapper de Results que redirige a la pantalla correcta según el modo
 * 
 * IMPORTANTE: Este archivo solo actúa como router.
 * Toda la lógica está separada en ResultsLocal.tsx y ResultsOnline.tsx
 */

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { ResultsLocalScreen } from './ResultsLocal';
import { ResultsOnlineScreen } from './ResultsOnline';

type Props = NativeStackScreenProps<NavigationParamList, 'Results'>;

export const ResultsScreen: React.FC<Props> = ({ navigation, route }) => {
  const routeParams = route.params || {};
  const modeFromRoute = routeParams.mode || 'local';
  
  // Redirigir a la pantalla correcta según el modo
  if (modeFromRoute === 'online') {
    return <ResultsOnlineScreen navigation={navigation as any} route={route as any} />;
  } else {
    return <ResultsLocalScreen navigation={navigation as any} route={route as any} />;
  }
};
