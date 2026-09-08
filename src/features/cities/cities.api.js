import {apiClient} from '../../services/api/client';
import {mockFetchCities} from './cities.mock';

export function mapCityFromBackend(item) {
  if (!item) return null;
  return {
    id: String(item.cityid || item.id),
    name: item.cityname || item.name || '',
    stateName: item.statename || item.stateName || '',
  };
}

export const citiesApi = {
  getCities: async params => {
    try {
      const response = await apiClient.get('/cities', {params});
      const list = response.data?.data || response.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapCityFromBackend);
      }
    } catch {
      // Fallback to mock data if backend endpoint is unavailable
    }
    return mockFetchCities();
  },
};
