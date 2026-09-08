import {z} from 'zod';

export const addTripSchema = z.object({
  partyName: z.string().trim().optional().or(z.literal('')),
  partyId: z.string().or(z.number()).nullish(),
  truckNumber: z.string().trim().optional().or(z.literal('')),
  truckId: z.string().or(z.number()).nullish(),
  ownership: z.string().optional().default('own'),
  supplierName: z.string().trim().optional().or(z.literal('')),
  supplierId: z.string().or(z.number()).nullish(),
  driverName: z.string().trim().optional().or(z.literal('')),
  driverId: z.string().or(z.number()).nullish(),
  driverPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
    .optional()
    .or(z.literal('')),
  origin: z.string().trim().optional().or(z.literal('')),
  originId: z.string().or(z.number()).nullish(),
  destination: z.string().trim().optional().or(z.literal('')),
  destinationId: z.string().or(z.number()).nullish(),
  billingType: z
    .enum([
      'Fixed',
      'Per Tonne',
      'Per KG',
      'Per Km',
      'Per Trip',
      'Per Day',
      'Per Hour',
      'Per Litre',
      'Per Bag',
      'Per Box',
    ])
    .default('Fixed'),
  billingRate: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid rate'),
  billingQuantity: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid quantity'),
  freightAmount: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
  supplierBillingType: z
    .enum([
      'Fixed',
      'Per Tonne',
      'Per KG',
      'Per Km',
      'Per Trip',
      'Per Day',
      'Per Hour',
      'Per Litre',
      'Per Bag',
      'Per Box',
    ])
    .default('Fixed'),
  supplierBillingRate: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid rate'),
  supplierBillingQuantity: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid quantity'),
  truckHireCost: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
  sendSmsToSupplier: z.boolean().default(false),
  tripStartDate: z.string().trim().optional().or(z.literal('')),
  lrNumber: z.string().trim().optional().or(z.literal('')),
  material: z.string().trim().optional().or(z.literal('')),
  startKm: z.string().trim().optional().or(z.literal('')),
  note: z.string().trim().optional().or(z.literal('')),
});

export const addAdvanceSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Advance amount is required')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
  paymentMode: z.enum(['Cash', 'Cheque', 'UPI', 'Bank Transfer']).default('Cash'),
  date: z.string().trim().optional().or(z.literal('')),
  receivedByDriver: z.boolean().default(false),
  note: z.string().trim().optional().or(z.literal('')),
});

export const addDriverBalanceSchema = z.object({
  amount: z
    .string()
    .trim()
    .min(1, 'Amount is required')
    .refine(val => /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
  reason: z.string().trim().min(1, 'Reason is required'),
  date: z.string().trim().optional().or(z.literal('')),
  note: z.string().trim().optional().or(z.literal('')),
});
