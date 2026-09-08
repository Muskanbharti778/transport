import {useMutation, useQueryClient} from '@tanstack/react-query';
import {suppliersApi} from '../suppliers.api';
import {SUPPLIERS_QUERY_KEY} from './useSuppliersQuery';

export function useAddSupplierMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: payload => suppliersApi.createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: SUPPLIERS_QUERY_KEY});
    },
  });
}
