import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';
import TrucksListScreen from '../src/features/trucks/screens/TrucksListScreen';
import {mockTrucks} from '../src/features/trucks/trucks.mock';

jest.mock('../src/features/trucks/hooks/useTrucksQuery', () => ({
  useTrucksQuery: () => ({
    data: [
      {
        id: 'TRK-100',
        vehicleNumber: 'KA 12 DS 3747',
        ownership: 'own',
        ownerName: 'Rahul',
        status: 'on_trip',
      },
      {
        id: 'TRK-105',
        vehicleNumber: 'GF 56 FG 4555',
        ownership: 'market',
        ownerName: 'AAdarshGiri',
        status: 'available',
      },
    ],
    isLoading: false,
    refetch: jest.fn(),
  }),
}));

const queryClient = new QueryClient();

function Wrapper({children}) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>{children}</NavigationContainer>
    </QueryClientProvider>
  );
}

describe('Trucks Module - Trucks List & Ownership Display', () => {
  it('contains own and market mock trucks with ownership defined', () => {
    const ownTruck = mockTrucks.find(t => t.ownership === 'own');
    const marketTruck = mockTrucks.find(t => t.ownership === 'market');
    expect(ownTruck).toBeDefined();
    expect(marketTruck).toBeDefined();
  });

  it('renders TrucksListScreen cleanly', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Wrapper>
          <TrucksListScreen />
        </Wrapper>,
      );
    });
    expect(tree).toBeDefined();
  });
});
