import { z } from 'zod';

const emailSchema = z.string().email();
const userIdSchema = z
  .string()
  .min(6)
  .regex(/^[A-Za-z0-9_-]+$/);

export const loginSchema = z.object({
  adminId: z
    .string()
    .trim()
    .min(1, 'adminIdRequired')
    .refine((value) => {
      const normalized = value.trim();
      return emailSchema.safeParse(normalized).success
        || userIdSchema.safeParse(normalized).success;
    }, 'adminIdInvalid'),
  password:   z.string().min(1, 'passwordRequired').min(6, 'loginPasswordMin'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
