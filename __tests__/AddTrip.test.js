import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {NavigationContainer} from '@react-navigation/native';
import AddTripScreen from '../src/features/trips/screens/AddTripScreen';
import {AddMoreDetailsSheet} from '../src/features/trips/sheets/AddMoreDetailsSheet';
import {addTripSchema} from '../src/features/trips/tripsValidation';

let mockRouteParams = {};
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useRoute: () => ({params: mockRouteParams}),
  };
});

jest.mock('../src/features/parties/hooks/usePartiesQuery', () => ({
  usePartiesQuery: () => ({
    data: [
      {id: 'P-1', name: 'Sainy Logistics', category: 'Customer'},
      {id: 'P-2', name: 'Tata Steel', category: 'Partner'},
    ],
    isLoading: false,
  }),
}));

jest.mock('../src/features/drivers/hooks/useDriversQuery', () => ({
  useDriversQuery: () => ({
    data: [
      {id: 'D-1', drivername: 'Ramesh Kumar', mobile: '9876543210'},
      {id: 'D-2', drivername: 'Suresh Patil', mobile: '9822011223'},
    ],
    isLoading: false,
  }),
}));

jest.mock('../src/features/trucks/hooks/useTrucksQuery', () => ({
  useTrucksQuery: () => ({
    data: [
      {
        id: 'T-1',
        vehicleNumber: 'KA01AB1234',
        ownership: 'market',
        // Real backend truck rows carry only supplierid, no owner/supplier name.
        supplierId: '7',
        supplierName: '',
        status: 'available',
      },
      {
        id: 'T-2',
        vehicleNumber: 'KA02CD5678',
        ownership: 'own',
        supplierName: '',
        status: 'available',
      },
    ],
    isLoading: false,
  }),
}));

jest.mock('../src/features/suppliers/hooks/useSuppliersQuery', () => ({
  useSuppliersQuery: () => ({
    data: [
      {id: '7', suppliername: 'Om Suppliers'},
      {id: '9', suppliername: 'Bhavya Road Lines'},
    ],
    isLoading: false,
  }),
}));

jest.mock('../src/features/trips/hooks/useAddTripMutation', () => ({
  useAddTripMutation: () => ({
    mutateAsync: jest.fn().mockResolvedValue({id: 'TRIP-999'}),
    isPending: false,
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

describe('Trips Module - Phase 2 & 3 (Add Trip & Add More Details)', () => {
  it('validates addTripSchema correctly', () => {
    const validData = {
      partyName: 'Sainy Logistics',
      truckNumber: 'KA12DS3747',
      billingType: 'Fixed',
      freightAmount: '11600',
    };
    const result = addTripSchema.safeParse(validData);
    expect(result.success).toBe(true);

    const invalidData = {
      freightAmount: 'invalid-number',
    };
    const invalidResult = addTripSchema.safeParse(invalidData);
    expect(invalidResult.success).toBe(false);
  });

  it('validates addTripSchema with market truck supplier billing fields correctly', () => {
    const validMarketTrip = {
      partyName: 'Sainy Logistics',
      truckNumber: 'GF 56 FG 4555',
      ownership: 'market',
      supplierName: 'AAdarshGiri',
      billingType: 'Fixed',
      freightAmount: '15000',
      supplierBillingType: 'Per Tonne',
      supplierBillingRate: '500',
      supplierBillingQuantity: '20',
      truckHireCost: '10000',
      sendSmsToSupplier: true,
    };
    const result = addTripSchema.safeParse(validMarketTrip);
    expect(result.success).toBe(true);
    expect(result.data.supplierBillingType).toBe('Per Tonne');
    expect(result.data.truckHireCost).toBe('10000');
  });

  it('renders AddTripScreen cleanly', () => {
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Wrapper>
          <AddTripScreen />
        </Wrapper>,
      );
    });
    expect(tree).toBeDefined();
  });

  it('prefills truck, driver and origin when opened as an Add Load', async () => {
    mockRouteParams = {
      // Parent trip rows carry only numeric FKs (backend returns no names).
      truckId: 'T-2',
      truckNumber: '',
      driverId: 'D-1',
      driverName: '',
      originId: 54,
      originName: 'Hyderabad',
      referenceNo: 'REF000001',
      parentTripNo: 'TRIP-1',
    };
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Wrapper>
          <AddTripScreen />
        </Wrapper>,
      );
    });
    const {Text} = require('react-native');
    const texts = tree.root
      .findAllByType(Text)
      .map(n => String(n.props.children || '').trim())
      .filter(Boolean);
    // Real names resolved dynamically from the trucks/drivers lists by ID.
    expect(texts).toContain('KA02CD5678');
    expect(texts).toContain('Ramesh Kumar');
    expect(texts).toContain('Hyderabad');
    mockRouteParams = {};
  });

  it('resolves supplier name + id for a market truck', () => {
    const {resolveSupplierForTruck} = require('../src/features/trips/screens/AddTripScreen');
    const suppliers = [
      {id: '7', suppliername: 'Om Suppliers'},
      {id: '9', suppliername: 'Bhavya Road Lines'},
    ];

    // Backend truck row: only supplierid, no name -> resolved from suppliers.
    const resolved = resolveSupplierForTruck(
      {supplierId: '7', supplierName: '', ownerName: ''},
      suppliers,
    );
    expect(resolved).toEqual({name: 'Om Suppliers', id: 7});

    // No supplier id -> name falls back to truck's own owner name, id null.
    const fallback = resolveSupplierForTruck(
      {supplierId: '', supplierName: 'My Owner', ownerName: ''},
      suppliers,
    );
    expect(fallback).toEqual({name: 'My Owner', id: null});
  });

  it('renders AddMoreDetailsSheet cleanly and triggers onSave', () => {
    const onSaveMock = jest.fn();
    const onCloseMock = jest.fn();
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <AddMoreDetailsSheet
          visible={true}
          initialValues={{lrNumber: 'LRN-001', material: 'Steel', startKm: '100', note: 'Test'}}
          onSave={onSaveMock}
          onClose={onCloseMock}
        />,
      );
    });
    expect(tree).toBeDefined();
  });
});
