import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {mockFetchParties, mockCreateParty} from './parties.mock';

export function mapPartyFromBackend(item) {
  if (!item) return null;
  return {
    id: String(item.partyid || item.id),
    name: item.partyname || item.name || 'Party Name',
    category: item.companyname || item.category || 'Transport Partner',
    phoneNumber: item.mobile || item.phoneNumber || '',
    balance: Number(item.opening_balance || item.balance || 0),
    balanceType: Number(item.opening_balance) >= 0 ? 'receivable' : 'pending',
    companyName: item.companyname || '',
    gstNo: item.gstno || '',
    panNo: item.panno || '',
    address: item.addressline1 || '',
  };
}

export const partiesApi = {
  getParties: async () => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/parties');
      const list = response.data?.data || response.data;
      if (Array.isArray(list)) {
        return list.map(mapPartyFromBackend);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchParties();
    }
  },

  getPartyById: async id => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get(`/parties/${id}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapPartyFromBackend(raw);
      }
      return null;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      const all = await mockFetchParties();
      return all.find(p => p.id === String(id)) || all[0];
    }
  },

  createParty: async payload => {
    const session = await authStorage.getSession();
    const hasToken = Boolean(session?.accessToken);
    const body = {
      partyname: payload.name || payload.partyname,
      mobile: payload.phoneNumber || payload.mobile,
      // The form's opening balance is an empty string when left blank; fall
      // back to 0 so the backend always receives a numeric value.
      opening_balance: payload.openingBalance
        ? Number(payload.openingBalance)
        : Number(payload.balance) || 0,
      companyname: payload.companyName || payload.category || '',
      gstno: payload.gstNo || payload.gstno || '',
      panno: payload.panNo || payload.panno || '',
      addressline1: payload.address || '',
    };
    if (hasToken) {
      const response = await apiClient.post('/parties', body);
      const raw = response.data?.data || response.data;
      if (raw && (raw.partyid || raw.id)) {
        return mapPartyFromBackend(raw);
      }
      // Backend may not return the created party; refetch is the frontend's
      // job (see handleQuickAdd). Still signal success.
      return false;
    }
    return mockCreateParty(payload);
  },
};

