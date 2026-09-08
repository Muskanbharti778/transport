import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AddChargeSheet} from '../src/features/trips/sheets/AddChargeSheet';

jest.mock('axios', () => ({
  create: jest.fn(() => {
    const apiClient = {get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn()};
    apiClient.interceptors = {request: {use: jest.fn()}, response: {use: jest.fn()}};
    return apiClient;
  }),
}));

const queryClient = new QueryClient({defaultOptions: {queries: {retry: false}}});

function Wrapper({children}) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('Trips Module - Add Charge', () => {
  it('renders AddChargeSheet with party/supplier, add/reduce, type, amount, date, note', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    let tree;
    ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <Wrapper>
          <AddChargeSheet
            visible
            onSave={onSave}
            onClose={onClose}
            isMarketTruck
            partyName="Sainy Logistics"
            supplierName="Om Suppliers"
            partyId={42}
            supplierId={7}
          />
        </Wrapper>,
      );
    });
    const {Text} = require('react-native');
    const texts = tree.root
      .findAllByType(Text)
      .map(n => String(n.props.children || '').trim())
      .filter(Boolean);
    expect(texts).toContain('Party Charge');
    expect(texts).toContain('Supplier Charge');
    expect(texts).toContain('Add to Bill');
    expect(texts).toContain('Reduce from Bill');
    expect(texts).toContain('Charge Type');
    expect(texts).toContain('Charge Date');
    expect(texts).toContain('Sainy Logistics');
    expect(texts).toContain('Om Suppliers');
  });

  it('posts to /chargeentries matching ChargeEntryController@store', async () => {
    const {apiClient} = require('../src/services/api/client');
    const {authStorage} = require('../src/services/storage/authStorage');
    const {tripsApi} = require('../src/features/trips/trips.api');

    await authStorage.setSession({accessToken: 'tok', userid: '1'});
    apiClient.post.mockResolvedValueOnce({data: {data: {chargeid: 9}}});

    await tripsApi.addCharge('7', {
      cid: 42,
      amount: 1200,
      date: '25 Aug 2026',
      chargeType: 'Loading',
      billAdjustment: 'add',
      note: 'hi',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/chargeentries', {
      tripid: '7',
      cid: 42,
      amount: 1200,
      chargedate: '2026-08-25',
      chargetype: 'Loading',
      billadjustment: 'add',
      remark: 'hi',
    });
  });
});
