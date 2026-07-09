import { z } from 'zod';

export const employeeResetPasswordSchema = z
  .object({
    password: z.string().min(6, 'passwordMin6'),
    confirmPassword: z.string().min(1, 'confirmRequired'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'passwordsMismatch',
    path:    ['confirmPassword'],
  });

export type EmployeeResetPasswordFormValues = z.infer<typeof employeeResetPasswordSchema>;
