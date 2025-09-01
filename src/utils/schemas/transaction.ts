import { z } from 'zod';

export const transactionSchema = z.object({
  value: z
    .string()
    .transform((v: string) => v.trim())
    .refine((v: string) => v.length > 0, { message: 'Amount is required' })
    .refine((v: string) => !isNaN(Number(v)) && Number(v) > 0, { message: 'Amount must be > 0' }),
  type: z.enum(['DEPOSIT', 'WITHDRAW', 'TRANSFER']),
  from: z.string().optional(),
  to: z.string().optional(),
});

export type TransactionFormSchema = {
  value: string;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  from?: string;
  to?: string;
};
