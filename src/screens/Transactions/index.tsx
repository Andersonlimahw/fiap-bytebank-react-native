import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { Transaction } from '~/@types/transaction';
import { useTransactions, useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '~/services/queries/transactions';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TransactionFormSchema, transactionSchema } from '~/utils/schemas/transaction';

type RouteParams = { accountId: string; accountName?: string };

export default function TransactionsScreen() {
  const { t } = useTranslation();
  const route = useRoute();
  const { accountId, accountName } = (route.params || {}) as RouteParams;

  const { data = [], isLoading, refetch } = useTransactions(accountId);
  const createM = useCreateTransaction(accountId);
  const updateM = useUpdateTransaction(accountId);
  const deleteM = useDeleteTransaction(accountId);

  const { setValue: setField, handleSubmit, reset, watch, formState } = useForm<TransactionFormSchema>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { value: '0', type: 'DEPOSIT', from: '', to: '' },
  });
  const value = watch('value');
  const type = watch('type');
  const from = watch('from');
  const to = watch('to');
  const [editing, setEditing] = useState<Transaction | null>(null);

  const canSubmit = useMemo(() => !isNaN(Number(value)) && Number(value) > 0 && type.length > 0, [value, type]);

  const onSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (editing) {
        await updateM.mutateAsync({ id: editing.id, value: Number(value), type, from, to });
        setEditing(null);
      } else {
        await createM.mutateAsync({ value: Number(value), type, from, to } as any);
      }
      reset({ value: '0', type: 'DEPOSIT', from: '', to: '' });
      refetch();
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to save');
    }
  };

  const onEdit = (item: Transaction) => {
    setEditing(item);
    setField('value', String(item.value), { shouldValidate: true });
    setField('type', item.type, { shouldValidate: true });
    setField('from', item.from ?? '', { shouldValidate: true });
    setField('to', item.to ?? '', { shouldValidate: true });
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
        {t('transactions.title')} {accountName ? `- ${accountName}` : ''}
      </Text>

      {/* Simple form */}
      <View style={{ marginBottom: 12 }}>
        <TextInput
          placeholder={t('transactions.valuePlaceholder')}
          value={value}
          onChangeText={(v) => setField('value', v, { shouldValidate: true })}
          keyboardType="numeric"
          style={{ borderWidth: 1, borderColor: formState.errors.value ? '#b00020' : '#ccc', padding: 8, borderRadius: 6 }}
        />
        {!!formState.errors.value && <Text style={{ color: '#b00020', marginTop: 4 }}>{formState.errors.value.message as string}</Text>}
        <View style={{ height: 8 }} />
        <TextInput
          placeholder={t('transactions.typePlaceholder')}
          value={type}
          onChangeText={(txt) => setField('type', ((txt || 'DEPOSIT').toUpperCase() as any), { shouldValidate: true })}
          autoCapitalize="characters"
          style={{ borderWidth: 1, borderColor: formState.errors.type ? '#b00020' : '#ccc', padding: 8, borderRadius: 6 }}
        />
        <View style={{ height: 8 }} />
        <TextInput
          placeholder={t('transactions.fromPlaceholder')}
          value={from}
          onChangeText={(v) => setField('from', v, { shouldValidate: true })}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
        />
        <View style={{ height: 8 }} />
        <TextInput
          placeholder={t('transactions.toPlaceholder')}
          value={to}
          onChangeText={(v) => setField('to', v, { shouldValidate: true })}
          style={{ borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
        />
        <View style={{ height: 8 }} />
        <Button title={editing ? t('transactions.update') : t('transactions.add')} onPress={handleSubmit(onSubmit)} disabled={!canSubmit} />
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
              <Text style={{ fontWeight: '600' }}>{item.type} • {item.value}</Text>
              {!!item.from && <Text>{t('transactions.from')}: {item.from}</Text>}
              {!!item.to && <Text>{t('transactions.to')}: {item.to}</Text>}
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                <View style={{ marginRight: 8 }}>
                  <Button title={t('common.edit')} onPress={() => onEdit(item)} />
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
