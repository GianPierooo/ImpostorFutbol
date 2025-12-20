/**
 * Wrapper de Voting que redirige a la pantalla correcta según el modo
 * 
 * IMPORTANTE: Este archivo solo actúa como router.
 * Toda la lógica está separada en VotingLocal.tsx y VotingOnline.tsx
 */

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { VotingLocalScreen } from './VotingLocal';
import { VotingOnlineScreen } from './VotingOnline';

type Props = NativeStackScreenProps<NavigationParamList, 'Voting'>;

export const VotingScreen: React.FC<Props> = ({ navigation, route }) => {
  const routeParams = route.params || {};
  const modeFromRoute = routeParams.mode || 'local';
  
  // Redirigir a la pantalla correcta según el modo
  if (modeFromRoute === 'online') {
    return <VotingOnlineScreen navigation={navigation as any} route={route as any} />;
  } else {
    return <VotingLocalScreen navigation={navigation as any} route={route as any} />;
  }
};
