const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Mirrors a subset of State rows so the
// picker has data when the backend is unreachable.
let mockStates = [
  {id: '1', name: 'Karnataka'},
  {id: '2', name: 'Telangana'},
  {id: '3', name: 'Maharashtra'},
  {id: '4', name: 'Delhi (NCT)'},
  {id: '5', name: 'Tamil Nadu'},
  {id: '6', name: 'Gujarat'},
  {id: '7', name: 'West Bengal'},
  {id: '8', name: 'Rajasthan'},
  {id: '9', name: 'Madhya Pradesh'},
];

export const mockFetchStates = async () => {
  await delay(400);
  return [...mockStates];
};
