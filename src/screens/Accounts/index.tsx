import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAccounts, useCreateAccount, useUpdateAccount, useDeleteAccount } from '~/services/queries/accounts';
import type { Account } from '~/@types/account';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountFormSchema, accountSchema } from '~/utils/schemas/account';

export default function AccountsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data = [], isLoading, refetch } = useAccounts();
  const createM = useCreateAccount();
  const updateM = useUpdateAccount();
  const deleteM = useDeleteAccount();

  const { setValue, handleSubmit, formState, reset, watch } = useForm<AccountFormSchema>({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', balance: '0' },
  });
  const name = watch('name');
  const balance = watch('balance');
  const [editing, setEditing] = useState<Account | null>(null);

  const canSubmit = useMemo(() => name.trim().length > 0 && !isNaN(Number(balance)), [name, balance]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (editing) {
        await updateM.mutateAsync({ id: editing.id, name: name.trim(), balance: Number(balance) });
        setEditing(null);
      } else {
        await createM.mutateAsync({ name: name.trim(), balance: Number(balance) } as Omit<Account, 'id'>);
      }
      reset({ name: '', balance: '0' });
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    }
  };

  const onEdit = (item: Account) => {
    setEditing(item);
    setValue('name', item.name, { shouldValidate: true });
    setValue('balance', String(item.balance), { shouldValidate: true });
  };

  const onDelete = async (id: string) => {
    try {
      await deleteM.mutateAsync(id);
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to delete');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>{t('accounts.title')}</Text>
      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder={t('accounts.namePlaceholder')}
          value={name}
          onChangeText={(v) => setValue('name', v, { shouldValidate: true })}
          style={{ borderWidth: 1, borderColor: formState.errors.name ? '#b00020' : '#ccc', padding: 8, borderRadius: 6 }}
        />
        {!!formState.errors.name && <Text style={{ color: '#b00020', marginTop: 4 }}>{formState.errors.name.message as string}</Text>}
        <View style={{ height: 8 }} />
        <TextInput
          placeholder={t('accounts.balancePlaceholder')}
          value={balance}
          onChangeText={(v) => setValue('balance', v, { shouldValidate: true })}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: formState.errors.balance ? '#b00020' : '#ccc', padding: 8, borderRadius: 6 }}
        />
        {!!formState.errors.balance && <Text style={{ color: '#b00020', marginTop: 4 }}>{formState.errors.balance.message as string}</Text>}
        <View style={{ height: 8 }} />
        <Button title={editing ? t('accounts.update') : t('accounts.add')} onPress={handleSubmit(onSubmit)} disabled={!canSubmit} />
      </View>

      {isLoading ? (
        <Text>{t('common.loading')}</Text>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={{ padding: 12, borderWidth: 1, borderColor: '#eee', borderRadius: 8 }}>
              <Text style={{ fontWeight: '600' }}>{item.name}</Text>
              <Text>{t('accounts.balance')}: {item.balance}</Text>
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ marginRight: 8 }}>
                  <Button title={t('common.edit')} onPress={() => onEdit(item)} />
                </View>
                <View style={{ marginRight: 8 }}>
                  <Button
                    title={t('accounts.viewTransactions')}
                    onPress={() =>
                      // @ts-ignore stack param typing kept simple
                      navigation.navigate('AccountTransactions' as never, { accountId: item.id, accountName: item.name } as never)
                    }
                  />
                </View>
                <View>
                  <Button color="#b00020" title={t('common.delete')} onPress={() => onDelete(item.id)} />
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}
