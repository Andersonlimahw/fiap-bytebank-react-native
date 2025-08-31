import React from 'react';
import { View, Text, Button } from 'react-native';
import { useUser } from '~/services/queries/user';
import { useUIStore, useAuthStore } from '~/store/app.store';
import { useTranslation } from 'react-i18next';

export default function HomeScreen() {
  const { data, isLoading } = useUser();
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const signOut = useAuthStore((s) => s.signOut);
  const { t } = useTranslation();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>{t('home.title')}</Text>
      <Text>Theme: {theme}</Text>
      {isLoading ? (
        <Text>{t('common.loading')}</Text>
      ) : (
        <>
          <Text>{t('home.welcome')}, {data?.name}</Text>
          <Text>{data?.email}</Text>
        </>
      )}
      <Button title={t('home.toggleTheme')} onPress={toggleTheme} />
      <Button title={t('auth.signOut')} onPress={signOut} />
    </View>
  );
}

