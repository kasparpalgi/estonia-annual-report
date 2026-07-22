import { readFileSync } from 'fs';
import type { BalanceSheet, IncomeStatement } from '../statements/model';

// Maps each statement line to its et-gaap concept. A `null` value marks a line
// that the taxonomy has no element for (a display-only subtotal) — it is not
// emitted as an XBRL fact. Using `Record<keyof …>` means adding a field to the
// model without a mapping is a compile error: no line is ever silently dropped.

/** Income-statement lines are `duration` facts. */
export const INCOME_CONCEPTS: Record<keyof IncomeStatement, string | null> = {
  revenue: 'Revenue',
  goodsMaterialsServices: 'OtherOperatingExpense',
  operatingProfit: 'TotalProfitLoss',
  profitBeforeTax: 'TotalProfitLossBeforeTax',
  profitForYear: 'TotalAnnualPeriodProfitLoss',
};

/** Balance-sheet lines are `instant` facts. */
export const BALANCE_CONCEPTS: Record<keyof BalanceSheet, string | null> = {
  cash: 'CashAndCashEquivalents',
  receivables: 'ShortTermReceivablesAndPrepayments',
  totalCurrentAssets: 'CurrentAssets',
  totalAssets: 'Assets',
  loanLiabilities: 'CurrentLoans',
  taxPayable: 'TaxPayables',
  totalCurrentLiabilities: 'CurrentLiabilities',
  totalLiabilities: 'Liabilities',
  shareCapital: 'IssuedCapital',
  unpaidCapital: 'UnpaidCapital',
  retainedEarnings: 'RetainedEarningsLoss',
  profitForYear: 'AnnualPeriodProfitLoss',
  totalEquity: 'Equity',
  totalLiabilitiesAndEquity: 'LiabilitiesAndEquity',
};

/** All concept names the instance will use (excludes skipped display subtotals). */
export function mappedConcepts(): string[] {
  return [...Object.values(INCOME_CONCEPTS), ...Object.values(BALANCE_CONCEPTS)].filter(
    (c): c is string => c !== null,
  );
}

/** Read every element name declared in the taxonomy schema. */
function taxonomyElements(xsdPath: string): Set<string> {
  const xsd = readFileSync(xsdPath, 'utf8');
  const names = xsd.match(/<xsd:element name="([A-Za-z0-9]+)"/g) ?? [];
  return new Set(names.map((m) => m.replace(/<xsd:element name="|"/g, '')));
}

/**
 * Fail loudly if any mapped concept is missing from the taxonomy — guards the
 * mapping against taxonomy changes or typos before we emit an instance.
 */
export function assertConceptsExist(xsdPath = 'et-gaap-cor_2026-01-01.xsd'): void {
  const elements = taxonomyElements(xsdPath);
  const missing = mappedConcepts().filter((c) => !elements.has(c));
  if (missing.length > 0) {
    throw new Error(`Concepts not found in taxonomy ${xsdPath}: ${missing.join(', ')}`);
  }
}
