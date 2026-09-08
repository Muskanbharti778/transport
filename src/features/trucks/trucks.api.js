import {mockTrucks, mockVehicleTypes} from './trucks.mock';
import {authStorage} from '../../services/storage/authStorage';
import {apiClient} from '../../services/api/client';

let inMemoryTrucks = [...mockTrucks];

export function mapTruckFromBackend(item) {
  if (!item) return null;
  return {
    id: String(item.truckid || item.vehicle_id || item.id),
    vehicleNumber: item.trucknumber || item.vehicle_no || item.registration_number || item.vehicleNumber,
    vehicleTypeId: String(item.trucktype || item.vehicle_type_id || '1'),
    vehicleTypeName: item.trucktype || item.vehicle_type_name || 'Commercial Truck',
    ownership: item.ownership || (item.owner_id ? 'own' : 'own'),
    ownerName: item.ownerName || item.owner_name || 'Vehicle Owner',
    ownerPhone: item.ownerPhone || item.owner_phone || '',
    supplierName: item.supplierName || item.ownerName || item.owner_name || '',
    supplierPhone: item.supplierPhone || item.ownerPhone || item.owner_phone || '',
    supplierId: item.supplierid == null ? '' : String(item.supplierid),
    driverId: item.driverId ? String(item.driverId) : (item.driver_id ? String(item.driver_id) : ''),
    driverName: item.driverName || item.driver_name || 'Unassigned',
    driverPhone: item.driver_phone || '',
    status: item.status == 1 ? 'available' : 'maintenance',
    activeTrip: item.activeTrip || null,
    documents: item.documents || [],
    recentTrips: item.recentTrips || [],
    maintenanceHistory: item.maintenanceHistory || [],
    performance: item.performance || {
      totalTrips: 0,
      totalRevenue: 0,
      dieselExpenses: 0,
      maintenanceExpenses: 0,
      netProfit: 0,
    },
  };
}

export const trucksApi = {
  async getTrucks(params = {}) {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get('/trucks', {params});
      const data = response.data?.data || response.data;
      if (Array.isArray(data)) {
        return data.map(mapTruckFromBackend);
      }
      return [];
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      return inMemoryTrucks;
    }
  },

  async getTruckById(truckId) {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.get(`/trucks/${truckId}`);
      const raw = response.data?.data || response.data;
      if (raw) {
        return mapTruckFromBackend(raw);
      }
      return null;
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
      const truck = inMemoryTrucks.find(t => t.id === truckId || t.vehicleNumber === truckId);
      if (!truck) {
        throw new Error(`Truck with ID ${truckId} not found`);
      }
      return truck;
    }
  },

  async createTruck(payload) {
    const session = await authStorage.getSession();
    try {
      const body = {
        trucknumber: payload.vehicleNumber ? payload.vehicleNumber.trim().toUpperCase() : payload.trucknumber,
        trucktype: payload.vehicleTypeName || payload.vehicleType || payload.trucktype || '10 Wheeler (24 Ton)',
        ownership: payload.ownership || 'own',
        supplierid: payload.supplierid || payload.supplierId || null,
      };
      const response = await apiClient.post('/trucks', body);
      const created = response.data?.data || response.data;
      if (created && (created.truckid || created.id || created.trucknumber)) {
        const mapped = mapTruckFromBackend(created);
        inMemoryTrucks = [mapped, ...inMemoryTrucks];
        return mapped;
      }
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
    }

    const vehicleTypeObj =
      mockVehicleTypes.find(vt => vt.id === payload.vehicleType || vt.name === payload.vehicleType) ||
      mockVehicleTypes[0];

    const newTruck = {
      id: `TRK-${Date.now().toString().slice(-4)}`,
      vehicleNumber: payload.vehicleNumber.trim().toUpperCase(),
      vehicleTypeId: vehicleTypeObj.id,
      vehicleTypeName: vehicleTypeObj.name,
      ownership: payload.ownership || 'own',
      ownerName: payload.ownerName || 'My Transport Fleet',
      ownerPhone: payload.ownerPhone || '',
      driverId: payload.driverName ? `DRV-${Date.now().toString().slice(-2)}` : '',
      driverName: payload.driverName || 'Unassigned',
      driverPhone: payload.driverPhone || '',
      status: 'available',
      activeTrip: null,
      specs: {
        chassisNumber: payload.chassisNumber || 'MAT624128N2E00000',
        engineNumber: payload.engineNumber || '497TC92CY000000',
        modelYear: new Date().getFullYear().toString(),
        fuelType: 'Diesel',
        odometerKm: '0 km',
      },
      documents: [
        {
          id: `doc-${Date.now()}-1`,
          title: 'Insurance Policy',
          type: 'insurance',
          number: 'POL-NEW-01',
          expiryDate: payload.insuranceExpiry || '2027-01-01',
          daysLeft: 120,
          status: 'valid',
        },
        {
          id: `doc-${Date.now()}-2`,
          title: 'Fitness Certificate',
          type: 'fitness',
          number: 'FIT-NEW-01',
          expiryDate: payload.fitnessExpiry || '2027-01-01',
          daysLeft: 120,
          status: 'valid',
        },
        {
          id: `doc-${Date.now()}-3`,
          title: 'National Permit',
          type: 'permit',
          number: 'NP-NEW-01',
          expiryDate: payload.permitExpiry || '2027-01-01',
          daysLeft: 120,
          status: 'valid',
        },
        {
          id: `doc-${Date.now()}-4`,
          title: 'PUC / Pollution',
          type: 'puc',
          number: 'PUC-NEW-01',
          expiryDate: payload.pucExpiry || '2026-12-01',
          daysLeft: 90,
          status: 'valid',
        },
      ],
      recentTrips: [],
      maintenanceHistory: [],
      performance: {
        totalTrips: 0,
        totalRevenue: 0,
        dieselExpenses: 0,
        maintenanceExpenses: 0,
        netProfit: 0,
      },
    };

    inMemoryTrucks = [newTruck, ...inMemoryTrucks];
    return newTruck;
  },

  async addMaintenance(truckId, payload) {
    const session = await authStorage.getSession();
    try {
      const response = await apiClient.post(`/trucks/${truckId}/maintenance`, payload);
      if (response.data) {
        return response.data?.data || response.data;
      }
    } catch (error) {
      if (session?.accessToken) {
        throw error;
      }
    }

    const truck = inMemoryTrucks.find(t => t.id === truckId);
    if (!truck) {
      throw new Error(`Truck ${truckId} not found`);
    }

    const newRecord = {
      id: `maint-${Date.now()}`,
      category: payload.category,
      serviceName: payload.serviceName,
      workshop: payload.workshopName || 'Workshop',
      date: payload.serviceDate || new Date().toLocaleDateString('en-GB'),
      odometerKm: payload.odometerKm ? `${payload.odometerKm} km` : 'N/A',
      cost: Number(payload.amount) || 0,
      notes: payload.notes || '',
    };

    truck.maintenanceHistory = [newRecord, ...(truck.maintenanceHistory || [])];
    truck.performance.maintenanceExpenses += newRecord.cost;
    truck.performance.netProfit -= newRecord.cost;

    return newRecord;
  },

  async getVehicleTypes() {
    return mockVehicleTypes;
  },
};

