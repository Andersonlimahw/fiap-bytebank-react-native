import React from 'react';
import { View, Text, Button } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'styled-components/native';
import { useUIStore, useAuthStore } from '~/store/app.store';
import { signOut as fbSignOut } from '~/services/firebase';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const language = useUIStore((s) => s.language);
  const setLanguage = useUIStore((s) => s.setLanguage);
  const signOutStore = useAuthStore((s) => s.signOut);
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: 22, fontWeight: '700', marginBottom: 16 }}>
        {t('settings.title')}
      </Text>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text, marginBottom: 8 }}>Theme</Text>
        <Button title="Toggle theme" onPress={toggleTheme} />
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: theme.colors.text, marginBottom: 8 }}>Language</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 8 }}>
            <Button title={language === 'pt' ? 'Português ✓' : 'Português'} onPress={() => setLanguage('pt')} />
          </View>
          <Button title={language === 'en' ? 'English ✓' : 'English'} onPress={() => setLanguage('en')} />
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <Button
          title={t('auth.signOut')}
          color={theme.colors.danger}
          onPress={async () => {
            await fbSignOut();
            signOutStore();
          }}
        />
      </View>
    </View>
  );
}
