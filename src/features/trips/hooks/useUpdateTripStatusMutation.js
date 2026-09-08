import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tripsApi} from '../trips.api';

export function useUpdateTripStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, ...data}) => tripsApi.updateTripStatus(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({queryKey: ['trips']});
      queryClient.invalidateQueries({queryKey: ['trip', variables.id]});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}

