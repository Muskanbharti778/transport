import {QueryClient} from '@tanstack/react-query';

// Master/reference data (parties, trucks, drivers) changes rarely and can be
// large. Cache it longer so screens like AddTrip don't re-GET full tables on
// every open — the cache is shared, so one fetch serves all screens.
export const REFERENCE_STALE_TIME = 5 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
