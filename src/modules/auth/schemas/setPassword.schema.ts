import { z } from 'zod';

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8,          'passwordMin')
      .regex(/[A-Z]/,  'passwordUppercase')
      .regex(/[a-z]/,  'passwordLowercase')
      .regex(/[0-9]/,  'passwordNumber'),
    confirmPassword: z.string().min(1, 'confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsMismatch',
    path:    ['confirmPassword'],
  });

export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>;
