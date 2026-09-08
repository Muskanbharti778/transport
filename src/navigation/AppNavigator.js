import React, {useRef} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import PartiesListScreen from '../features/parties/screens/PartiesListScreen';
import AddPartyScreen from '../features/parties/screens/AddPartyScreen';
import SelectStateScreen from '../features/parties/screens/SelectStateScreen';
import DriversListScreen from '../features/drivers/screens/DriversListScreen';
import AddDriverScreen from '../features/drivers/screens/AddDriverScreen';
import SuppliersListScreen from '../features/suppliers/screens/SuppliersListScreen';
import AddSupplierScreen from '../features/suppliers/screens/AddSupplierScreen';
import TrucksListScreen from '../features/trucks/screens/TrucksListScreen';
import AddTruckScreen from '../features/trucks/screens/AddTruckScreen';
import TripsListScreen from '../features/trips/screens/TripsListScreen';
import AddTripScreen from '../features/trips/screens/AddTripScreen';
import TripDetailsScreen from '../features/trips/screens/TripDetailsScreen';
import TripProgressScreen from '../features/trips/screens/TripProgressScreen';
import QuickActionSheet from '../features/quickActions/components/QuickActionSheet';
import {quickActionSheetController} from '../features/quickActions/quickActionSheetController';
import {routes} from './routeNames';
import {colors} from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const sheetRef = useRef(null);

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: {backgroundColor: colors.background},
          headerTitleStyle: {color: colors.text},
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name={routes.mainTabs}
          component={MainTabNavigator}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={routes.partiesList}
          component={PartiesListScreen}
          options={{title: 'Parties'}}
        />
        <Stack.Screen
          name={routes.tripsList}
          component={TripsListScreen}
          options={{title: 'Trips'}}
        />
        <Stack.Screen
          name={routes.addTrip}
          component={AddTripScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={routes.tripDetails}
          component={TripDetailsScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={routes.tripProgress}
          component={TripProgressScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name={routes.addParty}
          component={AddPartyScreen}
          options={{title: 'Add Party'}}
        />
        <Stack.Screen
          name={routes.selectState}
          component={SelectStateScreen}
          options={{headerShown: false, presentation: 'modal'}}
        />
        <Stack.Screen
          name={routes.driversList}
          component={DriversListScreen}
          options={{title: 'Drivers'}}
        />
        <Stack.Screen
          name={routes.addDriver}
          component={AddDriverScreen}
          options={{title: 'Add Driver'}}
        />
        <Stack.Screen
          name={routes.suppliersList}
          component={SuppliersListScreen}
          options={{title: 'Suppliers'}}
        />
        <Stack.Screen
          name={routes.addSupplier}
          component={AddSupplierScreen}
          options={{title: 'Add Supplier'}}
        />
        <Stack.Screen
          name={routes.trucksList}
          component={TrucksListScreen}
          options={{title: 'Trucks'}}
        />
        <Stack.Screen
          name={routes.addTruck}
          component={AddTruckScreen}
          options={{title: 'Add Truck'}}
        />
      </Stack.Navigator>

      <QuickActionSheet
        ref={ref => {
          sheetRef.current = ref;
          quickActionSheetController.register(ref);
        }}
      />
    </>
  );
}