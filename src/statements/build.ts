import type { Transaction } from '../csv';
import type { CategorisedTransaction } from '../categorise';
import type { BalanceSheet, CompanyInputs, Statements } from './model';

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

const sum = (rows: Transaction[], pick: (t: Transaction) => number): number =>
  round2(rows.reduce((s, t) => s + pick(t), 0));

/**
 * Build the income statement + balance sheet from categorised transactions and
 * the company's opening balances. Pure function; throws if the sheet cannot
 * balance (a guard against future regressions — valid inputs always balance).
 */
export function buildStatements(
  txns: CategorisedTransaction[],
  company: CompanyInputs,
): Statements {
  const revenue = txns.filter((c) => c.category === 'revenue').map((c) => c.transaction);
  const expense = txns.filter((c) => c.category === 'expense').map((c) => c.transaction);

  // An OUT is a company cash outflow only when the company itself is the payer.
  // When the owner settles an invoice from a personal account, it funds the
  // company via a shareholder loan (liability) and does not reduce company cash.
  const ownerPaid = (t: Transaction) => t.sourceName !== company.name;
  const companyPaidOut = sum(expense.filter((t) => !ownerPaid(t)), (t) => t.amount);
  const ownerPaidOut = sum(expense.filter(ownerPaid), (t) => t.amount);

  const revenueNet = sum(revenue, (t) => t.net);
  const expenseNet = sum(expense, (t) => t.net);
  const profitForYear = round2(revenueNet - expenseNet);

  // Net VAT with the tax authority: reclaimable input VAT − collected output VAT.
  const netVat = round2(sum(expense, (t) => t.vat) - sum(revenue, (t) => t.vat));
  const vatReceivable = netVat > 0 ? netVat : 0;
  const taxPayable = netVat < 0 ? -netVat : 0;

  const o = company.opening;
  const cash = round2(o.cash + sum(revenue, (t) => t.amount) - companyPaidOut);
  const receivables = round2(o.receivables + vatReceivable);
  const totalCurrentAssets = round2(cash + receivables);
  const totalLiabilities = round2(ownerPaidOut + taxPayable);
  const totalEquity = round2(
    o.shareCapital + o.unpaidCapital + o.retainedEarnings + profitForYear,
  );

  const balance: BalanceSheet = {
    cash,
    receivables,
    totalCurrentAssets,
    totalAssets: totalCurrentAssets,
    loanLiabilities: ownerPaidOut,
    taxPayable,
    totalCurrentLiabilities: totalLiabilities,
    totalLiabilities,
    shareCapital: o.shareCapital,
    unpaidCapital: o.unpaidCapital,
    retainedEarnings: o.retainedEarnings,
    profitForYear,
    totalEquity,
    totalLiabilitiesAndEquity: round2(totalLiabilities + totalEquity),
  };
  assertBalanced(balance);

  return {
    company,
    income: {
      revenue: revenueNet,
      goodsMaterialsServices: round2(-expenseNet),
      operatingProfit: profitForYear,
      profitBeforeTax: profitForYear,
      profitForYear,
    },
    balance,
  };
}

/** Assets must equal liabilities + equity to the cent. */
export function assertBalanced(b: BalanceSheet): void {
  const diff = Math.abs(b.totalAssets - b.totalLiabilitiesAndEquity);
  if (diff > 0.005) {
    throw new Error(
      `Balance sheet does not balance: assets ${b.totalAssets} vs ` +
        `liabilities+equity ${b.totalLiabilitiesAndEquity} (diff ${round2(diff)})`,
    );
  }
}
