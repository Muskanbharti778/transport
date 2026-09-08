import {useQuery} from '@tanstack/react-query';
import {suppliersApi} from '../suppliers.api';
import {REFERENCE_STALE_TIME} from '../../../services/api/queryClient';

export const SUPPLIERS_QUERY_KEY = ['suppliers'];

export function useSuppliersQuery() {
  return useQuery({
    queryKey: SUPPLIERS_QUERY_KEY,
    queryFn: suppliersApi.getSuppliers,
    staleTime: REFERENCE_STALE_TIME,
  });
}
