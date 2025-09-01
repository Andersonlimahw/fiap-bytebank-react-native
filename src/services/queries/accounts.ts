import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Account } from '~/@types/account';
import {
  createAccount as fbCreate,
  listAccounts as fbList,
  updateAccount as fbUpdate,
  deleteAccount as fbDelete,
} from '~/services/firebase';

const keys = {
  all: ['accounts'] as const,
  detail: (id: string) => [...keys.all, id] as const,
};

async function fetchAccounts(): Promise<Account[]> {
  const items = await fbList();
  return items as Account[];
}

export function useAccounts() {
  return useQuery({ queryKey: keys.all, queryFn: fetchAccounts });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Account, 'id'>) => {
      const id = await fbCreate(payload);
      return { id, ...payload } as Account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Account> & { id: string }) => {
      await fbUpdate(id, payload);
      return { id, ...(payload as Omit<Account, 'id'>) } as Account;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fbDelete(id);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}

