import { z } from 'zod';

export const loginSchema = z.object({
  employeeId: z.string().min(1, 'employeeIdRequired'),
  password:   z.string().min(1, 'passwordRequired'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
