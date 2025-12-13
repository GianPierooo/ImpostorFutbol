import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationParamList } from '../types';

// Screens
import { HomeScreen } from '../screens/Home';
import { LobbyScreen } from '../screens/Lobby';
import { RoleAssignmentScreen } from '../screens/RoleAssignment';
import { RoundScreen } from '../screens/Round';
import { DiscussionScreen } from '../screens/Discussion';
import { VotingScreen } from '../screens/Voting';
import { ResultsScreen } from '../screens/Results';
import { theme } from '../theme';

const Stack = createNativeStackNavigator<NavigationParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false, // Pantallas fullscreen para mejor UX
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
          animation: 'slide_from_right', // Transiciones suaves
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="RoleAssignment" component={RoleAssignmentScreen} />
        <Stack.Screen name="Round" component={RoundScreen} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} />
        <Stack.Screen name="Voting" component={VotingScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

