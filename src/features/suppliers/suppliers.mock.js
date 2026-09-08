const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// In-memory only — resets on app reload. Mirrors the shape shown in the
// SupplierController (suppliername, mobile, email, address, stateid, cityid,
// gstno, panno, contactperson, status). Starts empty so the list only shows
// real backend rows (or suppliers added in this session); no dummy seeds.
let mockSuppliers = [];

export const mockFetchSuppliers = async () => {
  await delay(400);
  return [...mockSuppliers];
};

export const mockCreateSupplier = async ({
  suppliername,
  mobile,
  email,
  address,
  stateid,
  cityid,
  gstno,
  panno,
  contactperson,
}) => {
  await delay(400);

  const newSupplier = {
    id: `${Date.now()}`,
    suppliername,
    mobile: mobile || '',
    email: email || '',
    address: address || '',
    stateid: stateid || null,
    cityid: cityid || null,
    gstno: gstno || '',
    panno: panno || '',
    contactperson: contactperson || '',
    status: 1,
  };

  mockSuppliers = [newSupplier, ...mockSuppliers];
  return newSupplier;
};
