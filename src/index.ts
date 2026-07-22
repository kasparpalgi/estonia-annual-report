import 'dotenv/config';
import { join } from 'path';
import { parseCSV } from './csv';
import { categorise } from './categorise';
import { log } from './log';

const year = process.env.FISCAL_YEAR ?? '2025';
const csvPath = join('transaction_history', year, 'transaction-history.csv');

const transactions = parseCSV(csvPath);
const categorised = categorise(transactions);

const revenue = categorised.filter(c => c.category === 'revenue');
const expenses = categorised.filter(c => c.category === 'expense');
const totalNet = (items: typeof revenue) => items.reduce((s, c) => s + c.transaction.net, 0);

log('app.log', `Loaded ${transactions.length} transactions from ${csvPath}`);
log('app.log', `Revenue: ${revenue.length} rows, net ${totalNet(revenue).toFixed(2)} EUR`);
log('app.log', `Expenses: ${expenses.length} rows, net ${totalNet(expenses).toFixed(2)} EUR`);
