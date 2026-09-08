import {useMutation, useQueryClient} from '@tanstack/react-query';
import {tripsApi} from '../trips.api';

export function useAddExpenseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({id, ...data}) => tripsApi.addExpense(id, data),
    onSuccess: (_, variables) => {
      const {id, ...data} = variables;
      // Append the new expense to the cached trip so the Profit tab list updates
      // immediately. When the expense is flagged "Add to Party Bill", also bump
      // chargesAmount so it shows in the Party tab's Charges total.
      queryClient.setQueryData(['trip', id], old => {
        if (!old) return old;
        const amount = Number(data.amount) || 0;
        const newExpense = {
          id: `expense-${Date.now()}`,
          type: data.type || 'Expense',
          amount,
          date: data.date || '',
          paymentMode: data.paymentMode || 'Cash',
          addToBill: Boolean(data.addToBill),
          note: data.note || '',
          photoUri: data.photoUri || null,
        };
        const updated = {...old, expenses: [...(old.expenses || []), newExpense]};
        if (data.addToBill) {
          const chargesAmount = (Number(old.chargesAmount) || 0) + amount;
          const pendingBalance = Math.max(
            0,
            (Number(old.freightAmount) || 0) +
              chargesAmount -
              (Number(old.advanceAmount) || 0) -
              (Number(old.paymentsAmount) || 0),
          );
          return {...updated, chargesAmount, pendingBalance};
        }
        return updated;
      });
      queryClient.invalidateQueries({queryKey: ['trips']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}
