import {useQuery} from '@tanstack/react-query';
import {driversApi} from '../drivers.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export function useDriversQuery() {
  return useQuery({
    queryKey: ['drivers'],
    queryFn: driversApi.getDrivers,
    staleTime: REFERENCE_STALE_TIME,
  });
}
