/**
 * Wrapper de RoleAssignment que redirige a la pantalla correcta según el modo
 * 
 * IMPORTANTE: Este archivo solo actúa como router.
 * Toda la lógica está separada en RoleAssignmentLocal.tsx y RoleAssignmentOnline.tsx
 */

import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NavigationParamList } from '../../types';
import { RoleAssignmentLocalScreen } from './RoleAssignmentLocal';
import { RoleAssignmentOnlineScreen } from './RoleAssignmentOnline';

type Props = NativeStackScreenProps<NavigationParamList, 'RoleAssignment'>;

export const RoleAssignmentScreen: React.FC<Props> = ({ navigation, route }) => {
  const routeParams = route.params || {};
  const modeFromRoute = routeParams.mode || 'local';
  
  // Redirigir a la pantalla correcta según el modo
  if (modeFromRoute === 'online') {
    return <RoleAssignmentOnlineScreen navigation={navigation as any} route={route as any} />;
  } else {
    return <RoleAssignmentLocalScreen navigation={navigation as any} route={route as any} />;
  }
};
