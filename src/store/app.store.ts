import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  hasOnboarded: boolean;
  completeOnboarding: () => void;
  language: 'pt' | 'en';
  setLanguage: (lng: 'pt' | 'en') => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userId: null,
      signIn: (userId: string) => set({ isAuthenticated: true, userId }),
      signOut: () => set({ isAuthenticated: false, userId: null }),
    }),
    {
      name: 'app-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ isAuthenticated: state.isAuthenticated, userId: state.userId }),
    }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      hasOnboarded: false,
      completeOnboarding: () => set({ hasOnboarded: true }),
      language: 'pt',
      setLanguage: (lng) => set({ language: lng }),
    }),
    {
      name: 'app-ui',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
