import {useQuery} from '@tanstack/react-query';
import {mockFetchDashboard} from '../dashboard.mock';

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: mockFetchDashboard,
    refetchOnMount: 'always',
  });
}
