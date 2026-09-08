import {useMutation, useQueryClient} from '@tanstack/react-query';
import {driversApi} from '../drivers.api';

export function useAddDriverMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload => driversApi.createDriver(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['drivers']});
    },
  });
}
