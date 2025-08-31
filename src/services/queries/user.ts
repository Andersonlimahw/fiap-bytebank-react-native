import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '~/services/api';
import type { User } from '~/@types/user';

const keys = {
  all: ['users'] as const,
  detail: (id: string) => [...keys.all, id] as const,
};

async function fetchUser(): Promise<User> {
  // Mocked example; replace with real call
  // const { data } = await api.get<User>('/me');
  // return data;
  return Promise.resolve({ id: '1', name: 'ByteBank User', email: 'user@bytebank.com' });
}

export function useUser() {
  return useQuery({ queryKey: keys.all, queryFn: fetchUser });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      // const { data } = await api.patch<User>('/me', payload);
      // return data;
      return { id: '1', name: payload.name || 'ByteBank User', email: payload.email || 'user@bytebank.com' } as User;
    },
    onSuccess: (data) => {
      qc.setQueryData(keys.all, data);
    },
  });
}

