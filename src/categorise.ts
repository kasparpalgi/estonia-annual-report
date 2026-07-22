import type { Transaction } from './csv';

export type Category = 'revenue' | 'expense';

export interface CategorisedTransaction {
  transaction: Transaction;
  category: Category;
}

export function categorise(transactions: Transaction[]): CategorisedTransaction[] {
  return transactions.map(t => ({
    transaction: t,
    category: t.direction === 'IN' ? 'revenue' : 'expense',
  }));
}
