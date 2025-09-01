import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUser } from '~/services/queries/user';
import { useAccounts } from '~/services/queries/accounts';
import { useUIStore, useAuthStore } from '~/store/app.store';
import { useTranslation } from 'react-i18next';
import { signOut as fbSignOut } from '~/services/firebase';
import { useTheme } from 'styled-components/native';

export default function HomeScreen() {
  const themeObj = useTheme();
  const { data, isLoading } = useUser();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const signOutStore = useAuthStore((s) => s.signOut);
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: themeObj.colors.background }}>
      <Text style={{ color: themeObj.colors.text }}>{t('home.title')}</Text>
      <Text style={{ color: themeObj.colors.muted }}>Theme: {theme}</Text>
      {isLoading ? (
        <Text style={{ color: themeObj.colors.muted }}>{t('common.loading')}</Text>
      ) : (
        <>
          <Text style={{ color: themeObj.colors.text }}>{t('home.welcome')}, {data?.name}</Text>
          <Text style={{ color: themeObj.colors.muted }}>{data?.email}</Text>
        </>
      )}
      {loadingAccounts ? (
        <Text style={{ color: themeObj.colors.muted }}>{t('common.loading')}</Text>
      ) : (
        <>
          <Text style={{ color: themeObj.colors.text, marginTop: 12 }}>
            Accounts: {accounts.length}
          </Text>
          <Text style={{ color: themeObj.colors.text }}>
            Total balance: {accounts.reduce((sum, a) => sum + Number(a.balance || 0), 0)}
          </Text>
        </>
      )}
      <Button title={t('home.toggleTheme')} onPress={toggleTheme} />
      <Button
        title={t('auth.signOut')}
        onPress={async () => {
          await fbSignOut();
          signOutStore();
        }}
      />
    </View>
  );
}
