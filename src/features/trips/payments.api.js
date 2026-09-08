import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {mockAddPayment} from './payments.mock';

export const paymentsApi = {
  addPayment: async (tripId, payload) => {
    const body = {
      tripid: tripId,
      cid: payload.cid,
      amount: payload.amount,
      paymentdate: payload.paymentdate,
      paymentmode: payload.paymentmode || 'cash',
      remark: payload.remark || '',
    };
    const response = await apiClient.post('/paymententries', body);
    return response.data?.data || response.data;
  },

  getPayments: async tripId => {
    const response = await apiClient.get(`/paymententries?tripid=${tripId}`);
    return response.data?.data || response.data;
  },
};

// Fallback: when no backend session exists, use mock.
export async function addPaymentFallback(tripId, payload) {
  const session = await authStorage.getSession();
  if (session?.accessToken) {
    return paymentsApi.addPayment(tripId, payload);
  }
  return mockAddPayment(tripId, payload);
}

export async function getPaymentsFallback(tripId) {
  const session = await authStorage.getSession();
  if (session?.accessToken) {
    return paymentsApi.getPayments(tripId);
  }
  return [];
}
