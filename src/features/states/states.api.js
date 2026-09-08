import {apiClient} from '../../services/api/client';
import {mockFetchStates} from './states.mock';

export function mapStateFromBackend(item) {
  if (!item) return null;
  return {
    id: String(item.stateid || item.id),
    name: item.statename || item.stateName || '',
  };
}

export const statesApi = {
  getStates: async params => {
    try {
      const response = await apiClient.get('/states', {params});
      const list = response.data?.data || response.data;
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapStateFromBackend);
      }
    } catch {
      // Fallback to mock data if backend endpoint is unavailable
    }
    return mockFetchStates();
  },
};
