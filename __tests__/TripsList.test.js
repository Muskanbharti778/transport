import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';
import TripsListScreen from '../src/features/trips/screens/TripsListScreen';
import {mockFetchTrips, mockCreateTrip} from '../src/features/trips/trips.mock';

jest.mock('../src/features/trips/hooks/useTripsQuery', () => ({
  useTripsQuery: () => ({
    data: [
      {
        id: 'TRIP-1001',
        partyName: 'Sainy Logistics',
        truckNumber: 'KA 12 DS 3747',
        driverName: 'Ramesh Kumar',
        origin: 'Bangalore',
        destination: 'Hyderabad',
        tripDate: '25 Aug 2026',
        freightAmount: 11600,
        pendingBalance: 11600,
        status: 'Started',
      },
    ],
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
    isRefetching: false,
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

describe('Trips Module - Phase 1', () => {
  it('fetches trips correctly (starts empty until a trip is created)', async () => {
    const trips = await mockFetchTrips();
    expect(Array.isArray(trips)).toBe(true);
    expect(trips.length).toBe(0);
  });

  it('creates new trip in mock dataset', async () => {
    const newTrip = await mockCreateTrip({
      partyName: 'Test Logistics',
      truckNumber: 'DL 01 AA 1234',
      origin: 'Delhi',
      destination: 'Mumbai',
      freightAmount: '25000',
    });
    expect(newTrip.partyName).toBe('Test Logistics');
    expect(newTrip.truckNumber).toBe('DL 01 AA 1234');
    expect(newTrip.freightAmount).toBe(25000);
  });

  it('renders TripsListScreen without errors', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Wrapper>
          <TripsListScreen />
        </Wrapper>,
      );
    });
    expect(tree).toBeDefined();
  });
});
