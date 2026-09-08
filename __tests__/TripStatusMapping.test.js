import {mapTripFromBackend} from '../src/features/trips/trips.api';

jest.mock('axios', () => ({
  create: jest.fn(() => {
    const apiClient = {get: jest.fn(), post: jest.fn(), put: jest.fn(), patch: jest.fn()};
    apiClient.interceptors = {request: {use: jest.fn()}, response: {use: jest.fn()}};
    return apiClient;
  }),
}));

describe('trip status mapping', () => {
  it('maps backend lowercase statuses to UI title-case', () => {
    expect(mapTripFromBackend({tripstatus: 'started'}).status).toBe('Started');
    expect(mapTripFromBackend({tripstatus: 'completed'}).status).toBe('Completed');
    expect(mapTripFromBackend({tripstatus: 'pod_received'}).status).toBe('POD Received');
    expect(mapTripFromBackend({tripstatus: 'pod_submitted'}).status).toBe('POD Submitted');
    expect(mapTripFromBackend({tripstatus: 'settled'}).status).toBe('Settled');
  });

  it('defaults to Started when status is missing', () => {
    expect(mapTripFromBackend({}).status).toBe('Started');
  });

  it('keeps already title-case statuses unchanged', () => {
    expect(mapTripFromBackend({tripstatus: 'Started'}).status).toBe('Started');
  });
});
