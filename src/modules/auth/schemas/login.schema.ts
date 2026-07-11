import { z } from 'zod';

/** Unified login — admin_id + password only (no email). */
export const loginSchema = z.object({
  adminId: z
    .string()
    .trim()
    .min(1, 'adminIdRequired'),
  password: z
    .string()
    .min(1, 'passwordRequired'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
