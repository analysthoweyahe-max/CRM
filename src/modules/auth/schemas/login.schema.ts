import { z } from 'zod';

const emailSchema = z.string().email();
const adminIdSchema = z
  .string()
  .min(6)
  .regex(/^[A-Za-z0-9_-]+$/);

export const loginSchema = z.object({
  employeeId: z
    .string()
    .trim()
    .min(1, 'employeeIdRequired')
    .refine((value) => {
      const normalized = value.trim();
      return emailSchema.safeParse(normalized).success || adminIdSchema.safeParse(normalized).success;
    }, 'employeeIdInvalid'),
  password:   z.string().trim().min(1, 'passwordRequired').min(6, 'loginPasswordMin'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
