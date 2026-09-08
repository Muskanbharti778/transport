import {useQuery} from '@tanstack/react-query';
import {citiesApi} from '../cities.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export function useCitiesQuery(params = {}) {
  return useQuery({
    queryKey: ['cities', params],
    queryFn: () => citiesApi.getCities(params),
    staleTime: REFERENCE_STALE_TIME,
  });
}
