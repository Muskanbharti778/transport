import {useMutation, useQueryClient} from '@tanstack/react-query';
import {chargesApi} from '../charges.api';
import {CHARGES_QUERY_KEY} from './useChargesQuery';

export function useCreateChargeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chargename => chargesApi.createCharge(chargename),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: CHARGES_QUERY_KEY});
    },
  });
}