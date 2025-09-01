import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Transaction } from '~/@types/transaction';
import {
  createTransaction as fbCreate,
  listTransactions as fbList,
  updateTransaction as fbUpdate,
  deleteTransaction as fbDelete,
} from '~/services/firebase';

const keys = {
  all: ['transactions'] as const,
  byAccount: (accountId: string) => [...keys.all, 'account', accountId] as const,
};

async function fetchTransactions(accountId: string): Promise<Transaction[]> {
  const items = await fbList(accountId);
  return items as Transaction[];
}

export function useTransactions(accountId: string) {
  return useQuery({ queryKey: keys.byAccount(accountId), queryFn: () => fetchTransactions(accountId) });
}

export function useCreateTransaction(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Transaction, 'id' | 'accountId' | 'createdAt'>) => {
      const id = await fbCreate({ ...payload, accountId });
      return { id, accountId, createdAt: Date.now(), ...(payload as any) } as Transaction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.byAccount(accountId) });
    },
  });
}

export function useUpdateTransaction(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Transaction> & { id: string }) => {
      await fbUpdate(id, payload);
      return { id, ...(payload as Omit<Transaction, 'id'>) } as Transaction;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.byAccount(accountId) });
    },
  });
}

export function useDeleteTransaction(accountId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fbDelete(id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.byAccount(accountId) });
    },
  });
}

