import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { appleSignIn, emailPasswordSignIn, googleSignIn, isAppleSignInAvailable, isGoogleSignInAvailable } from '~/services/firebase';
import { useAuthStore } from '~/store/app.store';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SignInSchema, signInSchema } from '~/utils/schemas/auth';

export default function SignInScreen() {
  const { t } = useTranslation();
  const { control, handleSubmit, formState, setValue } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  });
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingApple, setLoadingApple] = useState(false);
  const signInStore = useAuthStore((s) => s.signIn);

  const onSignIn = async ({ email, password }: SignInSchema) => {
    try {
      setLoading(true);
      const user = await emailPasswordSignIn(email.trim(), password);
      signInStore(user.uid);
    } catch (e: any) {
      Alert.alert('Sign in error', e?.message || 'Unable to sign in');
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    try {
      setLoadingGoogle(true);
      const user = await googleSignIn();
      signInStore(user.uid);
    } catch (e: any) {
      Alert.alert('Google Sign-In', e?.message || 'Unable to sign in with Google');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const onApple = async () => {
    try {
      setLoadingApple(true);
      const user = await appleSignIn();
      signInStore(user.uid);
    } catch (e: any) {
      Alert.alert('Apple Sign-In', e?.message || 'Unable to sign in with Apple');
    } finally {
      setLoadingApple(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>{t('auth.title')}</Text>
      <TextInput
        placeholder={t('auth.email')}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={(v) => setValue('email', v, { shouldValidate: true })}
        style={{ borderWidth: 1, borderColor: formState.errors.email ? '#b00020' : '#ccc', padding: 10, borderRadius: 8, marginBottom: 6 }}
      />
      {!!formState.errors.email && (
        <Text style={{ color: '#b00020', marginBottom: 6 }}>{formState.errors.email.message}</Text>
      )}
      <TextInput
        placeholder={t('auth.password')}
        secureTextEntry
        onChangeText={(v) => setValue('password', v, { shouldValidate: true })}
        style={{ borderWidth: 1, borderColor: formState.errors.password ? '#b00020' : '#ccc', padding: 10, borderRadius: 8, marginBottom: 8 }}
      />
      {!!formState.errors.password && (
        <Text style={{ color: '#b00020', marginBottom: 8 }}>{formState.errors.password.message}</Text>
      )}
      <Button title={loading ? t('common.loading') : t('auth.signIn')} onPress={handleSubmit(onSignIn)} disabled={loading} />
      {/* Social providers */}
      {isGoogleSignInAvailable() && (
        <>
          <View style={{ height: 8 }} />
          <Button title={loadingGoogle ? t('common.loading') : t('auth.signInWithGoogle')} onPress={onGoogle} disabled={loadingGoogle} />
        </>
      )}
      {isAppleSignInAvailable() && (
        <>
          <View style={{ height: 8 }} />
          <Button title={loadingApple ? t('common.loading') : t('auth.signInWithApple')} onPress={onApple} disabled={loadingApple} />
        </>
      )}
    </View>
  );
}
