const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Seed list is empty until real
// trips are created against the backend.
let mockTrips = [];

export const mockFetchTrips = async () => {
  await delay(350);
  return [...mockTrips];
};

export const mockFetchTripById = async id => {
  await delay(250);
  const trip = mockTrips.find(t => t.id === id);
  if (!trip) throw new Error(`Trip with ID ${id} not found.`);
  return {...trip};
};

export const mockCreateTrip = async tripData => {
  await delay(400);
  const freight = Number(tripData.freightAmount) || 0;
  const newTrip = {
    id: `TRIP-${Math.floor(1000 + Math.random() * 9000)}`,
    referenceNo: tripData.referenceNo || null,
    partyName: tripData.partyName || 'Party Name',
    truckNumber: tripData.truckNumber ? tripData.truckNumber.toUpperCase() : 'KA 01 AA 0000',
    driverName: tripData.driverName || 'Unassigned',
    driverPhone: tripData.driverPhone || null,
    origin: tripData.origin || 'Origin',
    destination: tripData.destination || 'Destination',
    tripDate: tripData.tripStartDate || tripData.tripDate || '25 Aug 2026',
    billingType: tripData.billingType || 'Fixed',
    freightAmount: freight,
    supplierBillingType: tripData.supplierBillingType || 'Fixed',
    supplierBillingRate: Number(tripData.supplierBillingRate) || 0,
    supplierBillingQuantity: Number(tripData.supplierBillingQuantity) || 0,
    truckHireCost: Number(tripData.truckHireCost) || Number(tripData.supplierBillingAmount) || 0,
    advanceAmount: Number(tripData.advanceAmount) || 0,
    chargesAmount: 0,
    paymentsAmount: 0,
    pendingBalance: freight - (Number(tripData.advanceAmount) || 0),
    lrNumber: tripData.lrNumber || `LRN-${Math.floor(100 + Math.random() * 900)}`,
    material: tripData.material || '',
    startKm: tripData.startKm || '',
    status: 'Started',
    notes: tripData.note || tripData.notes || '',
    statusTimeline: [
      {status: 'Started', date: tripData.tripStartDate || '25 Aug 2026', completed: true, podUrl: null},
      {status: 'Completed', date: null, completed: false, podUrl: null},
      {status: 'POD Received', date: null, completed: false, podUrl: null},
      {status: 'POD Submitted', date: null, completed: false, podUrl: null},
      {status: 'Settled', date: null, completed: false, podUrl: null},
    ],
    expenses: [],
    charges: [],
    advances: tripData.advanceAmount ? [{
      id: `ADV-${Date.now()}`,
      amount: Number(tripData.advanceAmount),
      paymentMode: tripData.paymentMode || 'Cash',
      date: tripData.tripStartDate || '25 Aug 2026',
      receivedByDriver: Boolean(tripData.receivedByDriver),
    }] : [],
    driverBalance: 0,
  };

  mockTrips = [newTrip, ...mockTrips];
  return newTrip;
};

export const mockUpdateTripStatus = async ({id, status, date, endKm, photoBase64, podUrl, amount, paymentMode}) => {
  await delay(350);
  const index = mockTrips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');

  const trip = mockTrips[index];
  const order = ['Started', 'Completed', 'POD Received', 'POD Submitted', 'Settled'];
  const targetIdx = order.indexOf(status);

  const updatedTimeline = trip.statusTimeline.map((item, idx) => {
    if (idx <= targetIdx) {
      const attachPod = item.status === 'POD Received' && (podUrl || photoBase64);
      return {
        ...item,
        completed: true,
        date: item.date || date || '25 Aug 2026',
        podUrl: attachPod ? (podUrl || photoBase64) : item.podUrl,
      };
    }
    return item;
  });

  const updatedTrip = {
    ...trip,
    status,
    statusTimeline: updatedTimeline,
    ...(status === 'Completed'
      ? {
          endKm: endKm != null && endKm !== '' ? endKm : trip.endKm,
          endDate: date || trip.endDate,
        }
      : {}),
    ...(status === 'POD Received'
      ? {
          podReceivedDate: date || trip.podReceivedDate,
          podUpload: photoBase64 || trip.podUpload,
        }
      : {}),
    ...(status === 'POD Submitted'
      ? {
          podSubmittedDate: date || trip.podSubmittedDate,
        }
      : {}),
    ...(status === 'Settled'
      ? {
          settledDate: date || trip.settledDate || trip.statusTimeline?.find(t => t.status === 'Settled')?.date,
          settlementAmount: amount != null && amount !== '' ? amount : trip.settlementAmount,
          paymentMode: paymentMode || trip.paymentMode,
        }
      : {}),
  };

  mockTrips[index] = updatedTrip;
  return updatedTrip;
};

export const mockAddAdvance = async ({id, amount, paymentMode, date, receivedByDriver, note}) => {
  await delay(350);
  const index = mockTrips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');

  const trip = mockTrips[index];
  const advNum = Number(amount) || 0;
  const newAdv = {
    id: `ADV-${Date.now()}`,
    amount: advNum,
    paymentMode: paymentMode || 'Cash',
    date: date || '25 Aug 2026',
    receivedByDriver: Boolean(receivedByDriver),
    note: note || '',
  };

  const updatedAdvances = [...trip.advances, newAdv];
  const totalAdvance = updatedAdvances.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingBalance = Math.max(0, trip.freightAmount + trip.chargesAmount - totalAdvance - trip.paymentsAmount);

  const updatedTrip = {
    ...trip,
    advances: updatedAdvances,
    advanceAmount: totalAdvance,
    pendingBalance,
  };

  mockTrips[index] = updatedTrip;
  return updatedTrip;
};

export const mockAddCharge = async ({
  id,
  amount,
  billAdjustment,
  chargeType,
  date,
  note,
  cid,
}) => {
  await delay(350);
  const index = mockTrips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');

  const trip = mockTrips[index];
  const amt = Number(amount) || 0;
  const adj = billAdjustment === 'reduce' ? 'reduce' : 'add';
  const newCharge = {
    id: `CHG-${Date.now()}`,
    amount: amt,
    billAdjustment: adj,
    chargeType: chargeType || '',
    date: date || '25 Aug 2026',
    note: note || '',
    cid: cid != null ? cid : null,
  };

  const updatedCharges = [...(trip.charges || []), newCharge];
  const totalAdd = updatedCharges
    .filter(c => c.billAdjustment === 'add')
    .reduce((acc, c) => acc + c.amount, 0);
  const totalReduce = updatedCharges
    .filter(c => c.billAdjustment === 'reduce')
    .reduce((acc, c) => acc + c.amount, 0);
  const netCharges = totalAdd - totalReduce;
  const pendingBalance = Math.max(
    0,
    trip.freightAmount + netCharges - (trip.advanceAmount || 0) - (trip.paymentsAmount || 0),
  );

  const updatedTrip = {
    ...trip,
    charges: updatedCharges,
    chargesAmount: netCharges,
    pendingBalance,
  };

  mockTrips[index] = updatedTrip;
  return updatedTrip;
};

export const mockAddExpense = async ({id, type, amount, date, paymentMode, addToBill = false, note, photoUri}) => {
  await delay(350);
  const index = mockTrips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');

  const trip = mockTrips[index];
  const amt = Number(amount) || 0;
  const newExpense = {
    id: `EXP-${Date.now()}`,
    type: type || 'Expense',
    amount: amt,
    date: date || '25 Aug 2026',
    paymentMode: paymentMode || 'Cash',
    addToBill,
    note: note || '',
    photoUri: photoUri || null,
  };

  const updatedExpenses = [...(trip.expenses || []), newExpense];
  // Expenses flagged "Add to Party Bill" increase the party charges total,
  // so they also show up in the Party tab's Charges line items and feed the
  // pending balance.
  const billAdjust = addToBill ? amt : 0;
  const newChargesAmount = (Number(trip.chargesAmount) || 0) + billAdjust;
  const pendingBalance = Math.max(
    0,
    Number(trip.freightAmount) +
      newChargesAmount -
      (Number(trip.advanceAmount) || 0) -
      (Number(trip.paymentsAmount) || 0),
  );

  const updatedTrip = {
    ...trip,
    expenses: updatedExpenses,
    chargesAmount: newChargesAmount,
    pendingBalance,
  };

  mockTrips[index] = updatedTrip;
  return updatedTrip;
};

export const mockAddDriverBalance = async ({id, amount, reason, date, note}) => {
  await delay(350);
  const index = mockTrips.findIndex(t => t.id === id);
  if (index === -1) throw new Error('Trip not found');

  const trip = mockTrips[index];
  const amt = Number(amount) || 0;
  const updatedTrip = {
    ...trip,
    driverBalance: (trip.driverBalance || 0) + amt,
    driverTransactions: [
      ...(trip.driverTransactions || []),
      {id: `DT-${Date.now()}`, amount: amt, reason, date: date || '25 Aug 2026', note},
    ],
  };

  mockTrips[index] = updatedTrip;
  return updatedTrip;
};
