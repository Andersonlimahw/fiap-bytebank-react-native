import { create } from 'zustand';

type Theme = 'light' | 'dark';

type AuthState = {
  isAuthenticated: boolean;
  userId?: string | null;
  signIn: (userId: string) => void;
  signOut: () => void;
};

type UIState = {
  theme: Theme;
  toggleTheme: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  userId: null,
  signIn: (userId: string) => set({ isAuthenticated: true, userId }),
  signOut: () => set({ isAuthenticated: false, userId: null }),
}));

export const useUIStore = create<UIState>((set, get) => ({
  theme: 'light',
  toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
}));

