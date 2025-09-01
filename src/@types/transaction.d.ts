export type Transaction = {
  id: string;
  accountId: string;
  value: number;
  type: 'DEPOSIT' | 'WITHDRAW' | 'TRANSFER';
  from?: string;
  to?: string;
  createdAt: number;
};

