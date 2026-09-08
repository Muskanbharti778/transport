import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {StyleSheet, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../features/dashboard/screens/HomeScreen';
import TripsListScreen from '../features/trips/screens/TripsListScreen';
import AddScreen from '../features/quickActions/screens/AddScreen';
import KhataScreen from '../features/khata/screens/KhataScreen';
import AccountScreen from '../features/account/screens/AccountScreen';
import {routes} from './routeNames';
import {colors, radius, spacing, typography} from '../theme';
import {quickActionSheetController} from '../features/quickActions/quickActionSheetController';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
        tabBarIcon: tabIcons[route.name],
      })}>
      <Tab.Screen name={routes.home} component={HomeScreen} />
      <Tab.Screen name={routes.trips} component={TripsListScreen} />
      <Tab.Screen
        name={routes.add}
        component={AddScreen}
        listeners={{
          tabPress: event => {
            // "Add" is never a real screen — it opens the Quick Action
            // sheet as an overlay and stays on the current tab.
            event.preventDefault();
            quickActionSheetController.open();
          },
        }}
      />
      <Tab.Screen name={routes.khata} component={KhataScreen} />
      <Tab.Screen name={routes.account} component={AccountScreen} />
    </Tab.Navigator>
  );
}

const tabIcons = {
  [routes.home]: ({focused, color}) => (
    <TabGlyph iconName={focused ? 'home' : 'home-outline'} color={color} focused={focused} />
  ),
  [routes.trips]: ({focused, color}) => (
    <TabGlyph
      iconName={focused ? 'truck' : 'truck-outline'}
      color={color}
      focused={focused}
    />
  ),
  [routes.add]: () => <TabGlyph iconName="plus" prominent />,
  [routes.khata]: ({focused, color}) => (
    <TabGlyph
      iconName={focused ? 'book-open-page-variant' : 'book-open-page-variant-outline'}
      color={color}
      focused={focused}
    />
  ),
  [routes.account]: ({focused, color}) => (
    <TabGlyph
      iconName={focused ? 'account' : 'account-outline'}
      color={color}
      focused={focused}
    />
  ),
};

function TabGlyph({iconName, color, focused, prominent}) {
  return (
    <View
      style={[
        styles.glyph,
        prominent && styles.prominentGlyph,
        focused && !prominent && styles.focusedGlyph,
      ]}>
      <Icon
        name={iconName}
        size={prominent ? 24 : 22}
        color={prominent ? colors.surface : color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    minHeight: 68,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  glyph: {
    width: 28,
    height: 28,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusedGlyph: {
    backgroundColor: colors.primarySoft,
  },
  prominentGlyph: {
    width: 42,
    height: 42,
    backgroundColor: colors.primary,
    marginTop: -spacing.lg,
  },
});