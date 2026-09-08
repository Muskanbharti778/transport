import {useQuery} from '@tanstack/react-query';
import {tripsApi} from '../trips.api';

export function useTripsQuery() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.getTrips,
  });
}

