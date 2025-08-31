import { z } from 'zod';

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
});

export type UserSchema = z.infer<typeof userSchema>;

