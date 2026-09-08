import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {mockFetchDrivers, mockCreateDriver} from './drivers.mock';

export function mapDriverFromBackend(item) {
  if (!item) return null;
  const openingBalance = Number(item.opening_balance || item.openingBalance || 0);
  return {
    id: String(item.driverid || item.id),
    drivername: item.drivername || item.driverName || 'Driver',
    mobile: item.mobile || item.mobile_no || item.phone || '',
    opening_balance: openingBalance,
    balance_type: item.balance_type || item.balanceType || (openingBalance >= 0 ? 'has_to_pay' : 'has_to_get'),
    status: item.status == null ? 1 : Number(item.status),
    driverphoto: item.driverphoto || null,
  };
}

function firstErrorMessage(apiError) {
  const data = apiError?.response?.data || apiError?.data;
  if (apiError?.message) {
    return apiError.message;
  }
  if (data?.message) {
    return data.message;
  }
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    return Array.isArray(first) ? first[0] : String(first || '');
  }
  return '';
}

export const driversApi = {
  getDrivers: async () => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/drivers');
      const list = response.data?.data || response.data;
      if (Array.isArray(list)) {
        return list
          .map(mapDriverFromBackend)
          .filter(d => d && Number(d.status) === 1);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchDrivers();
    }
  },

  getDriverById: async id => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get(`/drivers/${id}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapDriverFromBackend(raw);
      }
      return null;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      const all = await mockFetchDrivers();
      return all.find(d => d.id === String(id)) || null;
    }
  },

  createDriver: async payload => {
    const session = await authStorage.getSession();
    let body;
    let config = {};

    if (payload.driverphoto) {
      const formData = new FormData();
      formData.append('drivername', payload.drivername);
      formData.append('mobile', payload.mobile);
      if (payload.opening_balance != null && payload.opening_balance !== '') {
        formData.append('opening_balance', String(payload.opening_balance));
      }
      formData.append('balance_type', payload.balance_type || 'has_to_pay');

      const photoUri = payload.driverphoto;
      const filename = photoUri.split('/').pop() || 'driver_photo.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('driverphoto', {
        uri: photoUri,
        name: filename,
        type,
      });

      body = formData;
      config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
    } else {
      body = {
        drivername: payload.drivername,
        mobile: payload.mobile,
        opening_balance: payload.opening_balance || 0,
        balance_type: payload.balance_type || 'has_to_pay',
      };
    }

    try {
      const response = await apiClient.post('/drivers', body, config);
      const raw = response.data?.data || response.data;
      if (raw && (raw.driverid || raw.id)) {
        return mapDriverFromBackend(raw);
      }
      if (response.data?.status === true) {
        return mapDriverFromBackend({...payload, id: `${Date.now()}`});
      }
      // 2xx/unknown envelope with status false — surface the message.
      throw new Error(firstErrorMessage({response: response}) || 'Driver could not be saved.');
    } catch (apiError) {
      if (apiError?.response || apiError?.status) {
        throw new Error(firstErrorMessage(apiError) || 'Driver could not be saved.');
      }
      if (session?.accessToken) {
        throw new Error('Unable to reach the server. Please check your connection.');
      }
      return mockCreateDriver({
        drivername: payload.drivername,
        mobile: payload.mobile,
        opening_balance: payload.opening_balance || 0,
        balance_type: payload.balance_type || 'has_to_pay',
      });
    }
  },
};