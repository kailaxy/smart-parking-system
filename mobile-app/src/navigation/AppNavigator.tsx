import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import CampusMapScreen from '../screens/CampusMapScreen';
import ParkingAreaScreen from '../screens/ParkingAreaScreen';
import SlotDetailScreen from '../screens/SlotDetailScreen';

export type AppStackParamList = {
  CampusMap: undefined;
  ParkingArea: {
    areaId: string;
    areaName: string;
  };
  SlotDetail: {
    areaId: string;
    slotId: string;
  };
};

const Stack = createStackNavigator<AppStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="CampusMap"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#07101d',
            shadowColor: 'transparent',
            elevation: 0,
          },
          headerTintColor: '#e2e8f0',
          headerTitleStyle: {
            fontWeight: '700',
          },
          cardStyle: {
            backgroundColor: '#07101d',
          },
        }}
      >
        <Stack.Screen name="CampusMap" component={CampusMapScreen} options={{ title: 'Smart Parking' }} />
        <Stack.Screen name="ParkingArea" component={ParkingAreaScreen} options={{ title: 'Parking Area' }} />
        <Stack.Screen name="SlotDetail" component={SlotDetailScreen} options={{ title: 'Slot Detail' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
