import React, { useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';
import { soundService, SoundType } from '../services';

// Screens
import { HomeScreen } from '../screens/Home';
import { LobbyScreen } from '../screens/Lobby';
import { OnlineLobbyScreen } from '../screens/OnlineLobby';
import { OnlineRoomScreen } from '../screens/OnlineRoom';
import { RoleAssignmentScreen } from '../screens/RoleAssignment';
import { RoundScreen } from '../screens/Round';
import { DiscussionScreen } from '../screens/Discussion';
import { VotingScreen } from '../screens/Voting';
import { ResultsScreen } from '../screens/Results';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<NavigationParamList>();

export const AppNavigator: React.FC = () => {
  const navigationRef = useRef<NavigationContainerRef<NavigationParamList>>(null);

  // Agregar sonido a las transiciones de navegación
  useEffect(() => {
    const unsubscribe = navigationRef.current?.addListener('state', () => {
      // Reproducir sonido de transición cuando cambia la pantalla
      soundService.play(SoundType.TRANSITION);
    });

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Pantallas fullscreen para mejor UX
          contentStyle: {
            backgroundColor: theme.colors.background, // #111827 - Fondo gris oscuro elegante
          },
          animation: 'slide_from_right', // Transiciones suaves
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="OnlineLobby" component={OnlineLobbyScreen} />
        <Stack.Screen name="OnlineRoom" component={OnlineRoomScreen} />
        <Stack.Screen name="RoleAssignment" component={RoleAssignmentScreen} />
        <Stack.Screen name="Round" component={RoundScreen} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} />
        <Stack.Screen name="Voting" component={VotingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

