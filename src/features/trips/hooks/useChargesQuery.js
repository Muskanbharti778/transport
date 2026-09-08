import {useQuery} from '@tanstack/react-query';
import {chargesApi} from '../charges.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export const CHARGES_QUERY_KEY = ['charges'];

export function useChargesQuery() {
  return useQuery({
    queryKey: CHARGES_QUERY_KEY,
    queryFn: chargesApi.getCharges,
    staleTime: REFERENCE_STALE_TIME,
  });
}