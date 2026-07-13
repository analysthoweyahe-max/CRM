import { z } from 'zod';

/** Unified login — accepts either an email address or a user ID, + password. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'emailRequired'),
  password: z
    .string()
    .min(1, 'passwordRequired'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
