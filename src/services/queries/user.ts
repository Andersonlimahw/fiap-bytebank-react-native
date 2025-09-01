import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '~/@types/user';
import { auth } from '~/services/firebase';
import { getOrCreateUserProfile, updateUserProfile as fbUpdateUser } from '~/services/firebase';

const keys = {
  all: ['users'] as const,
  detail: (id: string) => [...keys.all, id] as const,
};

async function fetchUser(): Promise<User> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Not authenticated');
  const fbUser = auth.currentUser;
  const profile = await getOrCreateUserProfile(uid, {
    name: fbUser?.displayName ?? undefined,
    email: fbUser?.email ?? undefined,
  });
  return profile as User;
}

export function useUser() {
  return useQuery({ queryKey: keys.all, queryFn: fetchUser });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User>) => {
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');
      await fbUpdateUser(uid, { name: payload.name, email: payload.email });
      const updated = await fetchUser();
      return updated;
    },
    onSuccess: (data) => {
      qc.setQueryData(keys.all, data);
    },
  });
}
