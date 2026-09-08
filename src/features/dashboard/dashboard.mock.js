import {tripsApi} from '../trips/trips.api';
import {trucksApi} from '../trucks/trucks.api';
import {partiesApi} from '../parties/parties.api';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

let mockDashboardState = {
  user: {name: 'Rajesh'},
  overview: {
    trucks: 0,
    parties: 0,
    pendingPods: 0,
  },
  fleetPerformance: {
    utilization: '78%',
    fuelEfficiency: '8.7 mpg',
    onTimeRate: '92%',
    idleTime: '1h 12m',
  },
  topDriver: {name: 'Lukas Weber', label: 'Top driver', rating: '9.7'},
  serviceAlert: {vehicleCount: 4, label: 'Needing service'},
};

// Statuses in which the POD has not been received yet => counts as pending.
const POD_PENDING_STATUSES = ['Started', 'Completed'];

export const mockFetchDashboard = async () => {
  await delay(200);
  let activeTrips = 0;
  let pendingPods = 0;
  let trucks = 0;
  let parties = 0;
  let receivables = 0;
  try {
    const trips = await tripsApi.getTrips({});
    activeTrips = trips.filter(t => t.status !== 'Settled').length;
    pendingPods = trips.filter(t => POD_PENDING_STATUSES.includes(t.status)).length;
    // Total Receivables is the sum of every trip's outstanding balance, so it
    // tracks advances/charges/payments live instead of a static trip-creation
    // counter.
    receivables = trips.reduce(
      (acc, trip) => acc + (Number(trip.pendingBalance) || 0),
      0,
    );
  } catch {
    activeTrips = 0;
    pendingPods = 0;
    receivables = 0;
  }
  try {
    const truckList = await trucksApi.getTrucks({});
    trucks = truckList ? truckList.length : 0;
  } catch {
    trucks = 0;
  }
  try {
    const partyList = await partiesApi.getParties();
    parties = partyList ? partyList.length : 0;
  } catch {
    parties = 0;
  }
  return {
    ...mockDashboardState,
    overview: {
      ...mockDashboardState.overview,
      receivables,
      activeTrips,
      pendingPods,
      trucks,
      parties,
    },
  };
};
