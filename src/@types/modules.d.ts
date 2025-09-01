// Minimal module shims to satisfy TypeScript in environments
// where runtime deps are not installed yet (CI/sandbox).
// These are intentionally loose and should be replaced by
// real type packages when available locally.

declare module 'react-native-gesture-handler';

declare module 'react-hook-form' {
  // Minimal generic to allow type arguments without TS2347
  export function useForm<TFieldValues = any>(args?: any): any;
}

declare module '@hookform/resolvers/zod' {
  export const zodResolver: any;
}

declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: any;
  export default AsyncStorage;
}

// Provide a basic typing so imports compile; runtime comes from actual package
declare module 'styled-components/native' {
  export interface DefaultTheme {
    colors: {
      background: string;
      text: string;
      muted: string;
      primary: string;
      border: string;
      card: string;
      danger: string;
    };
  }
  export function useTheme(): DefaultTheme;
  export const ThemeProvider: any;
}

declare module 'zod' {
  export const z: any;
}
