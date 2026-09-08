import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {mockFetchCharges, mockCreateCharge} from './charges.mock';

export function mapChargeFromBackend(item) {
  if (!item) return null;
  return {
    id: item.cid == null ? String(item.id ?? '') : String(item.cid),
    chargename: item.chargename || '',
    status: item.status == null ? 1 : Number(item.status),
  };
}

export const chargesApi = {
  async getCharges() {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/charges');
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapChargeFromBackend);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchCharges();
    }
  },

  async getChargeEntries(tripId) {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/chargeentries', {params: {tripid: tripId}});
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(entry => ({
          id: String(entry.chargeid ?? entry.id ?? ''),
          amount: Number(entry.amount) || 0,
          billAdjustment: entry.billadjustment || 'add',
          chargeType: entry.chargetype || '',
          date: entry.chargedate || '',
          note: entry.remark || '',
          cid: entry.cid != null ? Number(entry.cid) : null,
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  async createCharge(chargename) {
    const session = await authStorage.getSession();
    const body = {chargename: String(chargename || '')};
    try {
      const response = await apiClient.post('/charges', body);
      return (
        mapChargeFromBackend(response.data?.data || response.data) || {
          id: '',
          chargename: body.chargename,
          status: 1,
        }
      );
    } catch (error) {
      // 409 = duplicate name — surface the backend message.
      throw error;
    } finally {
      void session;
    }
  },
};