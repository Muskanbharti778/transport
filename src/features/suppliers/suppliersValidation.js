import {z} from 'zod';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// Matches the party convention: only `suppliername` is effectively required
// by the backend, the rest are optional but validated when present.
export const addSupplierSchema = z.object({
  suppliername: z.string().trim().min(2, 'Supplier name must be at least 2 characters'),
  mobile: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || /^[0-9]{10}$/.test(val), 'Enter a valid 10-digit mobile number'),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine(val => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), 'Enter a valid email address'),
  address: z.string().trim().optional().or(z.literal('')),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || PINCODE_REGEX.test(val), 'Enter a valid 6-digit pincode'),
  gstNumber: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine(val => !val || GST_REGEX.test(val), 'Enter a valid 15-character GST number'),
  panNumber: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine(val => !val || PAN_REGEX.test(val), 'Enter a valid 10-character PAN number'),
  contactperson: z.string().trim().optional().or(z.literal('')),
  openingBalance: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^-?\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
});
