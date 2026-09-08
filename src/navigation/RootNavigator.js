import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import BusinessSetupScreen from '../features/auth/screens/BusinessSetupScreen';
import {routes} from './routeNames';
import {navigationRef} from './navigationRef';
import {useAuthStore} from '../store/authStore';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isBootstrapping = useAuthStore(state => state.isBootstrapping);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isOnboarded = useAuthStore(state => state.isOnboarded);
  const restoreSession = useAuthStore(state => state.restoreSession);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (isBootstrapping) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isAuthenticated ? (
          <Stack.Screen name={routes.auth} component={AuthNavigator} />
        ) : !isOnboarded ? (
          <Stack.Screen name={routes.businessSetup} component={BusinessSetupScreen} />
        ) : (
          <Stack.Screen name={routes.app} component={AppNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});