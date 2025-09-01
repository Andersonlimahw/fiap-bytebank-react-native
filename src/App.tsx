import React, { useEffect, useMemo } from 'react';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '~/routes/AppRoutes';
import i18n from '~/services/i18n';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '~/services/firebase';
import { useAuthStore } from '~/store/app.store';
import { ThemeProvider } from 'styled-components/native';
import { darkTheme, lightTheme } from '~/styles/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useUIStore } from '~/store/app.store';

const queryClient = new QueryClient();

export default function App() {
  const { signIn, signOut } = useAuthStore();
  const themeName = useUIStore((s) => s.theme);
  const language = useUIStore((s) => s.language);

  const theme = useMemo(() => (themeName === 'dark' ? darkTheme : lightTheme), [themeName]);
  const navTheme = useMemo(() => (themeName === 'dark' ? NavDarkTheme : NavLightTheme), [themeName]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) signIn(user.uid);
      else signOut();
    });
    return () => unsub();
  }, [signIn, signOut]);

  useEffect(() => {
    if (language && i18n.language !== language) {
      i18n.changeLanguage(language).catch(() => {
        // noop
      });
    }
  }, [language]);
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <NavigationContainer theme={navTheme}>
              <AppRoutes />
            </NavigationContainer>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
