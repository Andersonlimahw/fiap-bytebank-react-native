import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '~/screens/Home';
import SettingsScreen from '~/screens/Settings';
import AccountsScreen from '~/screens/Accounts';
import TransactionsScreen from '~/screens/Transactions';
import SignInScreen from '~/screens/Auth/SignIn';
import { useAuthStore, useUIStore } from '~/store/app.store';
import OnboardingScreen from '~/screens/Onboarding';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabRoutes() {
  return (
    <Tabs.Navigator>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Accounts" component={AccountsScreen} />
      <Tabs.Screen name="Settings" component={SettingsScreen} />
    </Tabs.Navigator>
  );
}

export default function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasOnboarded = useUIStore((s) => s.hasOnboarded);
  return (
    <Stack.Navigator>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="App" component={TabRoutes} options={{ headerShown: false }} />
          <Stack.Screen name="AccountTransactions" component={TransactionsScreen} options={{ title: 'Transactions' }} />
        </>
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      ) : (
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
