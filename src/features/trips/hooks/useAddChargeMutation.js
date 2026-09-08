import {useMutation, useQueryClient} from '@tanstack/react-query';
import {recomputeTripBalances, tripsApi} from '../trips.api';

export function useAddChargeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, ...data}) => tripsApi.addCharge(id, data),
    onSuccess: (_, variables) => {
      const {id, ...data} = variables;
      const amt = Number(data.amount) || 0;
      const isReduce = data.billAdjustment === 'reduce';
      const chargeDelta = isReduce ? -amt : amt;
      const newCharge = {
        id: `charge-${Date.now()}`,
        amount: amt,
        billAdjustment: isReduce ? 'reduce' : 'add',
        chargeType: data.chargeType || 'Charge',
        date: data.date || '',
        note: data.note || '',
        cid: data.cid != null ? data.cid : null,
      };
      const applyCharge = old => {
        if (!old) return old;
        const charges = [...(old.charges || []), newCharge];
        return recomputeTripBalances({...old, charges}, {chargeDelta});
      };
      // The trip-detail endpoint may not return a charges array, so append the
      // newly created charge to the cached trip to keep the Party tab Charges
      // line items in sync without depending on a refetch. Recompute the
      // summary so Pending Balance rises by the net charge amount immediately.
      queryClient.setQueryData(['trip', id], applyCharge);
      // The grouped Loads tab reads trips from the trips LIST cache, so apply
      // the same entry to the matching list item or it never appears there.
      queryClient.setQueryData(['trips'], oldList => {
        if (!Array.isArray(oldList)) return oldList;
        return oldList.map(trip =>
          String(trip.id) === String(id) ? applyCharge(trip) : trip,
        );
      });
      // Mark the list stale without an immediate refetch: a backend refetch may
      // still return rows without per-trip charge totals (the backend computes
      // them server-side), which would wipe the just-added charge from display.
      queryClient.invalidateQueries({queryKey: ['trips'], refetchType: 'none'});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}