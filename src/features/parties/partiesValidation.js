import {z} from 'zod';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

// The backend PartyController@store requires partyname + mobile (its
// validator rejects the request with 422 otherwise), so those two are
// mandatory; every remaining field is optional but still format-checked
// when a value is present.
export const addPartySchema = z.object({
  name: z.string().trim().min(1, 'Party Name is required'),
  companyName: z.string().trim().optional().or(z.literal('')),
  gstNumber: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || GST_REGEX.test(val), 'Enter a valid 15-character GST number'),
  panNumber: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || PAN_REGEX.test(val), 'Enter a valid 10-character PAN number'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Mobile Number is required')
    .regex(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number'),
  addressLine1: z.string().trim().optional().or(z.literal('')),
  addressLine2: z.string().trim().optional().or(z.literal('')),
  state: z.string().trim().optional().or(z.literal('')),
  pincode: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || PINCODE_REGEX.test(val), 'Enter a valid 6-digit pincode'),
  openingBalance: z
    .string()
    .trim()
    .optional()
    .refine(val => !val || /^\d+(\.\d{1,2})?$/.test(val), 'Enter a valid amount'),
});