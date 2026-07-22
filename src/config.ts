import 'dotenv/config';
import type { CompanyInputs } from './statements/model';

function req(key: string): string {
  const v = process.env[key];
  if (v === undefined || v.trim() === '') {
    throw new Error(`Missing required env var: ${key}`);
  }
  return v.trim();
}

function num(key: string): number {
  const n = Number(req(key));
  if (Number.isNaN(n)) throw new Error(`Env var ${key} is not a number: ${process.env[key]}`);
  return n;
}

/** Load + validate the company inputs and opening balances from `.env`. */
export function loadCompanyInputs(): CompanyInputs {
  return {
    name: req('COMPANY_NAME'),
    registryCode: req('REGISTRY_CODE'),
    legalAddress: req('LEGAL_ADDRESS'),
    fiscalYear: num('FISCAL_YEAR'),
    reportScheme: req('REPORT_SCHEME'),
    opening: {
      cash: num('OPENING_CASH'),
      receivables: num('OPENING_RECEIVABLES'),
      shareCapital: num('OPENING_SHARE_CAPITAL'),
      unpaidCapital: num('OPENING_UNPAID_CAPITAL'),
      retainedEarnings: num('OPENING_RETAINED_EARNINGS'),
    },
  };
}
