import {useMutation, useQueryClient} from '@tanstack/react-query';
import {partiesApi} from '../parties.api';

export function useAddPartyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload => partiesApi.createParty(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['parties']});
    },
  });
}