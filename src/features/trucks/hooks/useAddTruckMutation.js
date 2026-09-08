import {useMutation, useQueryClient} from '@tanstack/react-query';
import {trucksApi} from '../trucks.api';
import {TRUCKS_QUERY_KEY} from './useTrucksQuery';

export function useAddTruckMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload => trucksApi.createTruck(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: TRUCKS_QUERY_KEY});
    },
  });
}
