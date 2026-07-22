import { join } from 'path';
import { mkdirSync, writeFileSync } from 'fs';
import { parseCSV } from './csv';
import { categorise } from './categorise';
import { loadCompanyInputs } from './config';
import { buildStatements } from './statements/build';
import { formatStatements } from './statements/report';
import { buildXbrl } from './xbrl/build';
import { validateXbrl } from './xbrl/validate';
import { log } from './log';

const company = loadCompanyInputs();
const csvPath = join('transaction_history', String(company.fiscalYear), 'transaction-history.csv');

const transactions = parseCSV(csvPath);
const categorised = categorise(transactions);
const statements = buildStatements(categorised, company);

log('app.log', `Loaded ${transactions.length} transactions from ${csvPath}`);
log('statements.log', '\n' + formatStatements(statements));

// Generate + validate the et-gaap XBRL instance for filing.
const xbrl = buildXbrl(statements);
const validation = validateXbrl(xbrl);

mkdirSync('output', { recursive: true });
const outPath = join('output', `aastaaruanne-${company.fiscalYear}.xbrl`);
writeFileSync(outPath, xbrl, 'utf8');

log('xbrl.log', `Wrote ${outPath} — ${validation.factCount} facts, ` +
  `contexts [${validation.contexts.join(', ')}], units [${validation.units.join(', ')}], ` +
  `balance ${validation.assets.toFixed(2)} = ${validation.liabilitiesAndEquity.toFixed(2)} ` +
  `(${validation.balances ? 'ties out' : 'DOES NOT TIE OUT'})`);

if (validation.errors.length > 0) {
  log('xbrl.log', `Validation FAILED: ${validation.errors.join('; ')}`);
  throw new Error(`XBRL validation failed: ${validation.errors.join('; ')}`);
}
log('xbrl.log', 'Validation passed.');
