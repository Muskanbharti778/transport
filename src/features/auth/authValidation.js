import {z} from 'zod';

export const loginSchema = z.object({
  emailOrMobile: z
    .string()
    .trim()
    .min(1, 'Email or mobile is required')
    .refine(
      value => {
        const isEmail = /.+@.+\..+/.test(value);
        const isMobile = /^[0-9]{10}$/.test(value);
        return isEmail || isMobile;
      },
      'Enter a valid email or 10-digit mobile number',
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  username: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  mobile: z.string().trim().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});