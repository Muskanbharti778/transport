import {useQuery} from '@tanstack/react-query';
import {partiesApi} from '../parties.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export function usePartiesQuery() {
  return useQuery({
    queryKey: ['parties'],
    queryFn: partiesApi.getParties,
    staleTime: REFERENCE_STALE_TIME,
  });
}