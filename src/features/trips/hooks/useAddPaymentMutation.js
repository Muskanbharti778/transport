import {useMutation, useQueryClient} from '@tanstack/react-query';
import {addPaymentFallback} from '../payments.api';

export function useAddPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({tripId, payload}) => addPaymentFallback(tripId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['trips']});
      queryClient.invalidateQueries({queryKey: ['tripDetails']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}
