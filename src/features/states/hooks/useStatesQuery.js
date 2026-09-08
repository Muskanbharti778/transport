import {useQuery} from '@tanstack/react-query';
import {statesApi} from '../states.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export function useStatesQuery(params = {}) {
  return useQuery({
    queryKey: ['states', params],
    queryFn: () => statesApi.getStates(params),
    staleTime: REFERENCE_STALE_TIME,
  });
}
