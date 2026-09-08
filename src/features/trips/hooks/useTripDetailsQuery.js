import {useQuery} from '@tanstack/react-query';
import {tripsApi} from '../trips.api';

export function useTripDetailsQuery(tripId) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getTripById(tripId),
    enabled: Boolean(tripId),
  });
}

