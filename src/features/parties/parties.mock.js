const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Mirrors the shape shown in the
// Stitch "parties" design (name, id, category, balance, status).
let mockParties = [
  {id: 'P-98234', name: 'ABC Logistics', category: 'Transport Partner', balance: 150000, balanceType: 'receivable'},
  {id: 'P-44512', name: 'Global Traders', category: 'Goods Supplier', balance: 0, balanceType: 'paid'},
  {id: 'P-11209', name: 'Nexus Enterprises', category: 'Maintenance', balance: 45000, balanceType: 'pending'},
];

export const mockFetchParties = async () => {
  await delay(400);
  return [...mockParties];
};

export const mockCreateParty = async ({name, category, phoneNumber, openingBalance}) => {
  await delay(400);

  const newParty = {
    id: `P-${Math.floor(10000 + Math.random() * 89999)}`,
    name,
    category,
    phoneNumber: phoneNumber || null,
    balance: openingBalance ? Number(openingBalance) : 0,
    balanceType: openingBalance ? 'receivable' : 'paid',
  };

  mockParties = [newParty, ...mockParties];
  return newParty;
};