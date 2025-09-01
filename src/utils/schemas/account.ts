import { z } from 'zod';

export const accountSchema = z.object({
  name: z.string().min(2, { message: 'Name is required' }),
  balance: z
    .string()
    .transform((v: string) => v.trim())
    .refine((v: string) => v.length > 0, { message: 'Balance is required' })
    .refine((v: string) => !isNaN(Number(v)), { message: 'Balance must be a number' }),
});

export type AccountFormSchema = { name: string; balance: string };
