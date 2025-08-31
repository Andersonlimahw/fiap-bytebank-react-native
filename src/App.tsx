import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '~/routes/AppRoutes';
import '~/services/i18n';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

