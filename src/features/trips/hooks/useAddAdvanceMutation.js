import {useMutation, useQueryClient} from '@tanstack/react-query';
import {recomputeTripBalances, tripsApi} from '../trips.api';

export function useAddAdvanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, ...data}) => tripsApi.addAdvance(id, data),
    onSuccess: (_, variables) => {
      const {id, ...data} = variables;
      const amt = Number(data.amount) || 0;
      const newAdvance = {
        id: `advance-${Date.now()}`,
        amount: amt,
        paymentMode: data.paymentMode || 'Cash',
        date: data.date || '',
        receivedByDriver: Boolean(data.receivedByDriver),
        note: data.note || '',
      };
      const applyAdvance = old => {
        if (!old) return old;
        const advances = [...(old.advances || []), newAdvance];
        return recomputeTripBalances({...old, advances}, {advanceDelta: amt});
      };
      // Optimistically append the advance and recompute the trip's summary so
      // Pending Balance drops by the advance amount the moment it is saved,
      // without waiting for the backend refetch.
      queryClient.setQueryData(['trip', id], applyAdvance);
      // The grouped Loads tab reads trips from the trips LIST cache, so apply
      // the same entry to the matching list item or it never appears there.
      queryClient.setQueryData(['trips'], oldList => {
        if (!Array.isArray(oldList)) return oldList;
        return oldList.map(trip =>
          String(trip.id) === String(id) ? applyAdvance(trip) : trip,
        );
      });
      // Mark the queries stale without an immediate refetch: a backend refetch
      // may still return rows without per-trip advance totals (the backend
      // computes them server-side), so the optimistic values stay on screen and
      // reconcile with the backend on the next real refetch.
      queryClient.invalidateQueries({queryKey: ['trips'], refetchType: 'none'});
      queryClient.invalidateQueries({queryKey: ['trip', id], refetchType: 'none'});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}