const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Overlapping name/state pairs are
// deduped at the picker level; this fallback list mirrors backend city rows.
let mockCities = [
  {id: '1', name: 'Bangalore', stateName: 'Karnataka'},
  {id: '2', name: 'Hyderabad', stateName: 'Telangana'},
  {id: '3', name: 'Mumbai', stateName: 'Maharashtra'},
  {id: '4', name: 'Delhi NCR', stateName: 'Delhi (NCT)'},
  {id: '5', name: 'Pune', stateName: 'Maharashtra'},
  {id: '6', name: 'Chennai', stateName: 'Tamil Nadu'},
  {id: '7', name: 'Ahmedabad', stateName: 'Gujarat'},
  {id: '8', name: 'Kolkata', stateName: 'West Bengal'},
  {id: '9', name: 'Jaipur', stateName: 'Rajasthan'},
  {id: '10', name: 'Indore', stateName: 'Madhya Pradesh'},
];

export const mockFetchCities = async () => {
  await delay(400);
  return [...mockCities];
};
