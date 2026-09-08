import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tripsApi} from '../trips.api';

export function useAddTripMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload => tripsApi.createTrip(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['trips']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}

