const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Mirrors the shape shown in the
// DriverController (drivername, mobile, opening_balance, balance_type, status).
let mockDrivers = [
  {
    id: '1',
    drivername: 'Suresh Yadav',
    mobile: '9845012345',
    opening_balance: 5000,
    balance_type: 'has_to_pay',
    status: 1,
  },
  {
    id: '2',
    drivername: 'Ramesh Singh',
    mobile: '9731234567',
    opening_balance: 0,
    balance_type: 'has_to_pay',
    status: 1,
  },
  {
    id: '3',
    drivername: 'Mohan Reddy',
    mobile: '9440556677',
    opening_balance: -2000,
    balance_type: 'has_to_get',
    status: 1,
  },
];

export const mockFetchDrivers = async () => {
  await delay(400);
  return [...mockDrivers];
};

export const mockCreateDriver = async ({drivername, mobile, opening_balance, balance_type}) => {
  await delay(400);

  const newDriver = {
    id: `${Date.now()}`,
    drivername,
    mobile,
    opening_balance: opening_balance ? Number(opening_balance) : 0,
    balance_type: balance_type || 'has_to_pay',
    status: 1,
  };

  mockDrivers = [newDriver, ...mockDrivers];
  return newDriver;
};
