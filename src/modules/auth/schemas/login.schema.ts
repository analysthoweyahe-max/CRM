import { z } from 'zod';

/** Unified login — email + password. */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'emailRequired')
    .email('emailInvalid'),
  password: z
    .string()
    .min(1, 'passwordRequired'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
