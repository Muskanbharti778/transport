import {z} from 'zod';

export const addTruckSchema = z.object({
  vehicleNumber: z
    .string()
    .min(1, 'Vehicle number is required')
    .transform(val => val.toUpperCase().replace(/\s+/g, ' ')),
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  ownership: z.enum(['own', 'market']).default('own'),
  supplierId: z.string().optional().nullable(),
  ownerName: z.string().optional(),
  ownerPhone: z.string().optional(),
  driverName: z.string().optional(),
  driverPhone: z.string().optional(),
  capacityTons: z.string().optional(),
  chassisNumber: z.string().optional(),
  engineNumber: z.string().optional(),
  insuranceExpiry: z.string().optional(),
  fitnessExpiry: z.string().optional(),
  permitExpiry: z.string().optional(),
  pucExpiry: z.string().optional(),
  taxExpiry: z.string().optional(),
});

export const addMaintenanceSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  serviceName: z.string().min(1, 'Service description is required'),
  amount: z.string().min(1, 'Amount is required'),
  odometerKm: z.string().optional(),
  workshopName: z.string().optional(),
  serviceDate: z.string().min(1, 'Service date is required'),
  notes: z.string().optional(),
});
