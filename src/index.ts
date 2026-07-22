import { join } from 'path';
import { parseCSV } from './csv';
import { categorise } from './categorise';
import { loadCompanyInputs } from './config';
import { buildStatements } from './statements/build';
import { formatStatements } from './statements/report';
import { log } from './log';

const company = loadCompanyInputs();
const csvPath = join('transaction_history', String(company.fiscalYear), 'transaction-history.csv');

const transactions = parseCSV(csvPath);
const categorised = categorise(transactions);
const statements = buildStatements(categorised, company);

log('app.log', `Loaded ${transactions.length} transactions from ${csvPath}`);
log('statements.log', '\n' + formatStatements(statements));
