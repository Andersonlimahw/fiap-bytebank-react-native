import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email' }).min(3),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});
// Use simple explicit type to avoid relying on z.infer in limited environments
export type SignInSchema = { email: string; password: string };
