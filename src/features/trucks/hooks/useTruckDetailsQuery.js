import {useQuery} from '@tanstack/react-query';
import {trucksApi} from '../trucks.api';

export function useTruckDetailsQuery(truckId) {
  return useQuery({
    queryKey: ['truck', truckId],
    queryFn: () => trucksApi.getTruckById(truckId),
    enabled: Boolean(truckId),
  });
}
