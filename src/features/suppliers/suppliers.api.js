import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {mockFetchSuppliers, mockCreateSupplier} from './suppliers.mock';

export function mapSupplierFromBackend(item) {
  if (!item) return null;
  return {
    id: String(item.supplierid || item.id),
    suppliername: item.suppliername || item.name || 'Supplier',
    mobile: item.mobile || '',
    email: item.email || '',
    address: item.address || '',
    stateid: item.stateid == null ? '' : String(item.stateid),
    cityid: item.cityid == null ? '' : String(item.cityid),
    gstno: item.gstno || '',
    panno: item.panno || '',
    contactperson: item.contactperson || '',
    status: item.status == null ? 1 : Number(item.status),
  };
}

function firstErrorMessage(apiError) {
  const data = apiError?.response?.data || apiError?.data;
  if (data?.message) {
    return data.message;
  }
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    return Array.isArray(first) ? first[0] : String(first || '');
  }
  if (apiError?.message) {
    return apiError.message;
  }
  return '';
}

export const suppliersApi = {
  getSuppliers: async () => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/suppliers');
      const list = response.data?.data || response.data;
      if (Array.isArray(list)) {
        return list.map(mapSupplierFromBackend);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchSuppliers();
    }
  },

  getSupplierById: async id => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get(`/suppliers/${id}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapSupplierFromBackend(raw);
      }
      return null;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      const all = await mockFetchSuppliers();
      return all.find(s => s.id === String(id)) || null;
    }
  },

  createSupplier: async payload => {
    const session = await authStorage.getSession();
    const body = {
      suppliername: payload.suppliername,
      mobile: payload.mobile || '',
      email: payload.email || '',
      address: payload.address || '',
      stateid: payload.stateid || null,
      cityid: payload.cityid || null,
      gstno: payload.gstno || payload.gstNumber || '',
      panno: payload.panno || payload.panNumber || '',
      contactperson: payload.contactperson || '',
    };
    try {
      const response = await apiClient.post('/suppliers', body);
      const raw = response.data?.data || response.data;
      if (raw && (raw.supplierid || raw.id)) {
        return mapSupplierFromBackend(raw);
      }
      if (response.data?.status === true) {
        return mapSupplierFromBackend({...body, id: `${Date.now()}`});
      }
      throw new Error(firstErrorMessage({response}) || 'Supplier could not be saved.');
    } catch (apiError) {
      if (apiError?.response || apiError?.status) {
        throw new Error(firstErrorMessage(apiError) || 'Supplier could not be saved.');
      }
      if (session?.accessToken) {
        throw new Error('Unable to reach the server. Please check your connection.');
      }
      return mockCreateSupplier(body);
    }
  },
};
