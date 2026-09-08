import {apiClient} from '../../services/api/client';

// Fetches the advance entries for one trip. The backend AdvanceEntryController@index
// filters by tripid + advancetype, and a missing advancetype returns an empty
// set, so the party-tab statement requests the 'party' type.
export const advancesApi = {
  async getAdvanceEntries(tripId, advancetype = 'party') {
    try {
      const response = await apiClient.get('/advanceentries', {
        params: {tripid: tripId, advancetype},
      });
      const data = response.data?.data || response.data;
      if (!Array.isArray(data)) {
        return [];
      }
      return data.map(entry => ({
        id: String(entry.advanceid ?? entry.id ?? entry.advancename ?? ''),
        amount: Number(entry.amount) || 0,
        paymentMode: entry.paymentmode || 'Cash',
        date: entry.advdate || '',
        receivedByDriver: entry.receivedbydriver ? true : false,
        note: entry.remark || '',
        type: entry.advancetype || 'party',
      }));
    } catch {
      return [];
    }
  },
};