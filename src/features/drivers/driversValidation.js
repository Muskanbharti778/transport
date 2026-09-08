import {z} from 'zod';

export const addDriverSchema = z.object({
  drivername: z.string().trim().min(2, 'Driver name must be at least 2 characters'),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  opening_balance: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || /^-?\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
  balance_type: z.enum(['has_to_get', 'has_to_pay']).default('has_to_pay'),
});
