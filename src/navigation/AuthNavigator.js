import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from '../features/auth/screens/SplashScreen';
import WelcomeScreen from '../features/auth/screens/WelcomeScreen';
import AuthScreen from '../features/auth/screens/AuthScreen';
import {routes} from './routeNames';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName={routes.splash}
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {backgroundColor: colors.background},
        headerTitleStyle: {color: colors.text},
        contentStyle: {backgroundColor: colors.background},
      }}>
      <Stack.Screen name={routes.splash} component={SplashScreen} options={{headerShown: false}} />
      <Stack.Screen name={routes.welcome} component={WelcomeScreen} options={{headerShown: false}} />
      <Stack.Screen name={routes.authForm} component={AuthScreen} options={{headerShown: false}} />
    </Stack.Navigator>
  );
}