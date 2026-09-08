const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Mirrors ChargeController (chargename, status). Starts with the common
// transport-domain presets so the picker is usable offline; additions made in
// this session are kept in-memory only.
let mockCharges = [
  'Loading',
  'Unloading',
  'Loading/Unloading',
  'Demurrage',
  'Detention',
  'Toll',
  'Octroi',
  'Weightment',
].map((name, i) => ({cid: `$C-${i + 1}`, chargename: name, status: 1}));

export const mockFetchCharges = async () => {
  await delay(300);
  return [...mockCharges];
};

export const mockCreateCharge = async chargename => {
  await delay(300);
  const name = String(chargename || '').trim();
  if (!name) throw new Error('Charge name is required');
  if (mockCharges.some(c => c.chargename.toLowerCase() === name.toLowerCase())) {
    throw new Error('Charge name already exists');
  }
  const newCharge = {cid: `$C-${Date.now()}`, chargename: name, status: 1};
  mockCharges = [...mockCharges, newCharge];
  return newCharge;
};
