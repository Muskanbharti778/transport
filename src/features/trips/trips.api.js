import {apiClient} from '../../services/api/client';
import {authStorage} from '../../services/storage/authStorage';
import {
  mockFetchTrips,
  mockFetchTripById,
  mockCreateTrip,
  mockUpdateTripStatus,
  mockAddAdvance,
  mockAddCharge,
  mockAddDriverBalance,
  mockAddExpense,
} from './trips.mock';
import {chargesApi} from './charges.api';
import {advancesApi} from './advances.api';

export function mapTripFromBackend(item) {
  if (!item) return null;
  const freightAmount = Number(item.freightamt ?? item.freightAmount ?? 0);
  // Prefer server-side totals when the backend row carries them; otherwise sum
  // the entry lists attached by getTripById so a bare trip row still derives
  // the amounts the way the backend computes them.
  const advances = item.advances || [];
  const charges = item.charges || [];
  const advanceAmount =
    item.advanceamount != null
      ? Number(item.advanceamount)
      : advances.length
        ? advances.reduce((acc, a) => acc + (Number(a.amount) || 0), 0)
        : Number(item.advanceAmount ?? 0);
  const chargesAmount =
    item.chargesamount != null
      ? Number(item.chargesamount)
      : item.totaladd != null
        ? Number(item.totaladd)
        : charges.length
          ? charges.reduce(
              (acc, c) =>
                acc +
                (Number(c.amount) || 0) * (c.billAdjustment === 'reduce' ? -1 : 1),
              0,
            )
          : Number(item.chargesAmount ?? 0);
  const paymentsAmount = Number(item.paymentsamount ?? item.paymentsAmount ?? 0);
  // The backend calculates the trip balance and returns it (pending_balance /
  // pendingbalance). When it isn't provided, derive it from the totals so the
  // app never relies on a single baked-in value.
  const backendBalance =
    item.pendingbalance != null
      ? Number(item.pendingbalance)
      : item.pending_balance != null
        ? Number(item.pending_balance)
        : null;
  const pendingBalance =
    backendBalance != null
      ? backendBalance
      : Math.max(0, freightAmount + chargesAmount - advanceAmount - paymentsAmount);
  return {
    id: String(item.tripid || item.id || item.tripno),
    tripno: item.tripno || item.id,
    partyId: item.partyid == null ? null : String(item.partyid),
    truckId: item.truckid == null ? null : String(item.truckid),
    driverId: item.driverid == null ? null : String(item.driverid),
    supplierId: item.supplierid == null ? null : String(item.supplierid),
    partyName: item.partyname || item.partyName || '',
    referenceNo: item.referenceno || item.referenceNo || null,
    truckNumber: item.trucknumber || item.truckNumber || 'Commercial Truck',
    driverName: item.drivername || item.driverName || 'Driver',
    originId: item.originid == null ? null : String(item.originid),
    destinationId: item.destinationid == null ? null : String(item.destinationid),
    origin: item.origin_name || item.origin || '',
    destination: item.destination_name || item.destination || '',
    tripDate: item.tripdate || item.tripDate || new Date().toLocaleDateString('en-GB'),
    billingType: item.partybillingtype || item.billingType || 'Fixed',
    freightAmount,
    advanceAmount,
    chargesAmount,
    paymentsAmount,
    pendingBalance,
    material: item.material || '',
    status: mapTripStatusFromBackend(item.tripstatus || item.status),
    notes: item.remark || item.notes || '',
    endKm: item.endkm ?? item.endKm ?? '',
    startKm: item.startkm ?? item.startKm ?? '',
    endDate: toDisplayDate(item.enddate || item.endDate),
    podReceivedDate: toDisplayDate(item.podrecdate || item.podReceivedDate),
    podSubmittedDate: toDisplayDate(item.podsubmitdate || item.podSubmittedDate),
    podUpload: item.podupload || item.podUpload || null,
    statusTimeline: buildStatusTimeline(item, mapTripStatusFromBackend(item.tripstatus || item.status)),
    expenses: item.expenses || [],
    advances: item.advances || [],
    charges: item.charges || [],
  };
}

// The backend stores trip status as lowercase snake_case (started/completed/
// pod_received/pod_submitted/settled), while the app UI uses title-case display
// values (Started/Completed/POD Received/POD Submitted/Settled). These two
// helpers translate between the two so status shows and updates correctly.
const BACKEND_TO_DISPLAY_STATUS = {
  started: 'Started',
  completed: 'Completed',
  pod_received: 'POD Received',
  pod_submitted: 'POD Submitted',
  settled: 'Settled',
};

const DISPLAY_TO_BACKEND_STATUS = {
  Started: 'started',
  Completed: 'completed',
  'POD Received': 'pod_received',
  'POD Submitted': 'pod_submitted',
  Settled: 'settled',
};

function mapTripStatusFromBackend(status) {
  if (!status) return 'Started';
  const display = BACKEND_TO_DISPLAY_STATUS[String(status).toLowerCase()];
  return display || String(status);
}

function mapTripStatusToBackend(status) {
  if (!status) return 'started';
  return DISPLAY_TO_BACKEND_STATUS[status] || String(status).toLowerCase();
}

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function toIsoDate(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  const m = String(value).match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
  if (m) {
    const d = new Date(Date.UTC(Number(m[3]), SHORT_MONTHS.indexOf(m[2]), Number(m[1])));
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  }
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return String(value);
}

function toDisplayDate(value) {
  if (!value) return null;
  const iso = toIsoDate(value);
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${Number(m[3])} ${SHORT_MONTHS[Number(m[2]) - 1]} ${m[1]}`;
}

const STATUS_ORDER = ['Started', 'Completed', 'POD Received', 'POD Submitted', 'Settled'];

function buildStatusTimeline(item, status) {
  const currentIdx = STATUS_ORDER.indexOf(status);
  const dates = {
    Started: toDisplayDate(item.tripdate || item.tripDate) || 'Today',
    Completed: toDisplayDate(item.enddate || item.endDate),
    'POD Received': toDisplayDate(item.podrecdate || item.podReceivedDate),
    'POD Submitted': toDisplayDate(item.podsubmitdate || item.podSubmittedDate),
    Settled: toDisplayDate(item.settle_date || item.settleDate || item.paydate),
  };
  const podUrls = {
    'POD Received': item.podupload || item.podUpload || null,
    'POD Submitted': item.podsubmitdoc || item.podSubmitDoc || null,
  };
  return STATUS_ORDER.map((label, idx) => ({
    status: label,
    date: dates[label] || null,
    completed: idx <= currentIdx,
    podUrl: podUrls[label] || null,
  }));
}

// Running totals derived from a trip's advance/charge entry lists. Used by the
// add-advance / add-charge mutation hooks to keep the trip-detail cache's
// advanceAmount / chargesAmount / pendingBalance in sync the moment an entry is
// saved, without waiting for a backend refetch.
function totalAdvanceFromEntries(advances = []) {
  return advances.reduce((acc, a) => acc + (Number(a.amount) || 0), 0);
}

function netChargeFromEntries(charges = []) {
  return charges.reduce((acc, c) => {
    const amt = Number(c.amount) || 0;
    return c.billAdjustment === 'reduce' ? acc - amt : acc + amt;
  }, 0);
}

// Recompute a trip's financial summary. When a backend returns summary totals
// but no entry lists (advances/charges empty), the existing totals are kept and
// only the just-added delta is applied so previously recorded amounts survive.
export function recomputeTripBalances(trip, {advanceDelta = 0, chargeDelta = 0} = {}) {
  if (!trip) return trip;
  const freight = Number(trip.freightAmount) || 0;
  const payments = Number(trip.paymentsAmount) || 0;
  const advances = trip.advances || [];
  const charges = trip.charges || [];
  const advanceAmount = advances.length
    ? totalAdvanceFromEntries(advances)
    : (Number(trip.advanceAmount) || 0) + advanceDelta;
  const chargesAmount = charges.length
    ? netChargeFromEntries(charges)
    : (Number(trip.chargesAmount) || 0) + chargeDelta;
  const pendingBalance = Math.max(0, freight + chargesAmount - advanceAmount - payments);
  return {...trip, advanceAmount, chargesAmount, pendingBalance};
}

export const tripsApi = {
  getTrips: async params => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/trips', {params});
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapTripFromBackend);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchTrips();
    }
  },

  getTripById: async id => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get(`/trips/${id}`);
      const raw = response.data?.data || response.data;
      if (!raw) {
        return null;
      }
      // The trip detail endpoint doesn't include the advance/charge entry
      // lists, so fetch them (and a per-trip totals shortage) separately and
      // attach them so the financial summary derives real stored amounts.
      const [advanceEntries, chargeEntries] = await Promise.all([
        advancesApi.getAdvanceEntries(id),
        chargesApi.getChargeEntries(id),
      ]);
      return mapTripFromBackend({
        ...raw,
        advances: advanceEntries,
        charges: chargeEntries,
      });
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockFetchTripById(id);
    }
  },

  createTrip: async data => {
    const session = await authStorage.getSession();
    const body = {
      // Backend expects integer foreign keys — send the IDs captured from the
      // parties/trucks/drivers list endpoints, falling back to null when the
      // entry was created locally (Quick Add) or left unassigned.
      tripdate: toIsoDate(data.tripStartDate || data.tripDate),
      truckid: data.truckId ? Number(data.truckId) : null,
      partyid: data.partyId ? Number(data.partyId) : null,
      supplierid: data.supplierId ? Number(data.supplierId) : null,
      driverid: data.driverId ? Number(data.driverId) : null,
      originid: data.originId ? Number(data.originId) : null,
      destinationid: data.destinationId ? Number(data.destinationId) : null,
      partybillingtype: data.billingType || 'Fixed',
      rate: Number(data.billingRate) || Number(data.freightRate) || 0,
      wt: Number(data.billingQuantity) || Number(data.weight) || 0,
      freightamt: Number(data.freightAmount) || 0,
      supplierbillingtype: data.supplierBillingType || 'Fixed',
      sup_rate: Number(data.supplierBillingRate) || 0,
      supwt: Number(data.supplierBillingQuantity) || 0,
      sup_freightamt: Number(data.truckHireCost) || Number(data.supplierBillingAmount) || 0,
      material: data.material || '',
      remark: data.note || data.notes || '',
      // Only follow-up loads created via "Add Load to this Trip" carry the
      // parent trip's reference number (TripController::store reuses a passed
      // referenceno instead of generating a fresh one). A standalone new trip
      // must not send the field at all — omit the key so the backend generates
      // its own reference.
      ...(data.referenceNo ? {referenceno: data.referenceNo} : {}),
    };
    try {
      const response = await apiClient.post('/trips', body);
      const created = response.data?.data || response.data;
      if (created && (created.tripid || created.id || created.tripno)) {
        return mapTripFromBackend(created);
      }
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
    }
    return mockCreateTrip(data);
  },

  updateTrip: async (id, data) => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.put(`/trips/${id}`, data);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return {id, ...data};
    }
  },

  updateTripStatus: async (id, data) => {
    const session = await authStorage.getSession();
    const body = {
      tripstatus: mapTripStatusToBackend(data.status),
    };
    // Status-specific fields the TripController persists on the trip row.
    // endkm is optional — send null when omitted so the backend clears it.
    if (data.status === 'Completed') {
      body.endkm = data.endKm != null && data.endKm !== '' ? Number(data.endKm) : null;
      body.enddate = toIsoDate(data.date);
    }
    if (data.status === 'POD Received') {
      body.podrecdate = toIsoDate(data.date);
      if (data.photoBase64) {
        body.podupload = data.photoBase64;
      }
    }
    if (data.status === 'POD Submitted') {
      body.podsubmitdate = toIsoDate(data.date);
    }
    if (data.status === 'Settled') {
      // Settling records a Trippayment on the backend (see TripController
      // updateStatus settled branch); amount is required, mode/date optional.
      body.amount = data.amount != null && data.amount !== '' ? Number(data.amount) : null;
      body.paymentmode = data.paymentMode || 'Cash';
      body.paymentdate = toIsoDate(data.date);
    }
    try {
      const response = await apiClient.patch(`/trips/${id}/status`, body);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockUpdateTripStatus({id, ...data});
    }
  },

  addAdvance: async (id, data) => {
    const session = await authStorage.getSession();
    const isSupplier = data.advancetype === 'supplier';
    // Matches AdvanceEntryController@store — party advances carry partyid,
    // supplier advances carry supplierid, and advancetype distinguishes them.
    const body = {
      tripid: id,
      amount: Number(data.amount) || 0,
      advancename: isSupplier ? 'Supplier advance' : 'Party advance',
      advdate: toIsoDate(data.date),
      receivedbydriver: data.receivedByDriver ? 1 : 0,
      driverid: data.driverId ? Number(data.driverId) : null,
      partyid: !isSupplier && data.partyId ? Number(data.partyId) : null,
      supplierid: isSupplier && data.supplierId ? Number(data.supplierId) : null,
      remark: data.note || '',
      advancetype: isSupplier ? 'supplier' : 'party',
    };
    try {
      const response = await apiClient.post('/advanceentries', body);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockAddAdvance({id, ...data});
    }
  },

  addExpense: async (id, data) => {
    const session = await authStorage.getSession();
    // Expenses flagged "Add to Party Bill" are persisted as charge entries via
    // the existing /chargeentries endpoint (there is no dedicated expense
    // endpoint on this backend), so they survive trip refetches and appear in
    // the Party tab's Charges list. Non-bill expenses have no backend table
    // yet and are kept local for the session.
    try {
      if (session?.accessToken && data.addToBill) {
        const response = await apiClient.post('/chargeentries', {
          tripid: id,
          amount: Number(data.amount) || 0,
          chargedate: toIsoDate(data.date),
          chargetype: data.type || '',
          billadjustment: 'add',
          cid: data.cid != null ? Number(data.cid) : null,
          remark: data.note || '',
        });
        return response.data?.data || response.data;
      }
      // No session token → dev/mock mode: record through the in-memory mock so
      // the expense stays visible for the session. Token mode with a non-bill
      // expense is local-only too; useAddExpenseMutation.onSuccess appends it
      // to the cached trip for display.
      if (!session?.accessToken) {
        return mockAddExpense({id, ...data});
      }
      return {id, ...data};
    } catch (error) {
      // Persistence unavailable (network/backend): keep the add local so the
      // trip stays usable; onSuccess already appends to the cached trip.
      return {id, ...data};
    }
  },

  addLoad: async (id, data) => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.post(`/trips/${id}/loads`, data);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return {id, ...data};
    }
  },

  addCharge: async (id, data) => {
    const session = await authStorage.getSession();
    // Matches ChargeEntryController@store — cid carries the charge type id
    // from the charges table; chargetype is 'party' or 'supplier'; billadjustment
    // is 'add' (to bill) or 'reduce' (from bill).
    const body = {
      tripid: id,
      cid: data.cid != null ? Number(data.cid) : null,
      amount: Number(data.amount) || 0,
      chargedate: toIsoDate(data.date),
      chargetype: data.chargeType || '',
      billadjustment: data.billAdjustment || 'add',
      remark: data.note || '',
    };
    try {
      const response = await apiClient.post('/chargeentries', body);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockAddCharge({id, ...data});
    }
  },

  addDriverBalance: async (id, data) => {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.post(`/trips/${id}/driver-balance`, data);
      return response.data?.data || response.data;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return mockAddDriverBalance({id, ...data});
    }
  },
};

