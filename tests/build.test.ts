import { describe, it, expect } from 'vitest';
import { buildStatements, assertBalanced } from '../src/statements/build';
import type { BalanceSheet, CompanyInputs } from '../src/statements/model';
import type { CategorisedTransaction } from '../src/categorise';
import type { Transaction } from '../src/csv';

// Opening balances from the filed 31.12.2024 bilanss (aruanne_2024.pdf).
const company: CompanyInputs = {
  name: 'Innovate Invest OÜ',
  registryCode: '14504365',
  legalAddress: 'Tihemetsa',
  fiscalYear: 2025,
  reportScheme: 'mikroettevõtja',
  opening: { cash: 3422, receivables: 2500, shareCapital: 2500, unpaidCapital: -2500, retainedEarnings: 5922 },
};

const tx = (over: Partial<Transaction>): Transaction => ({
  direction: 'IN', createdOn: new Date('2025-07-02'), sourceName: '', amount: 0,
  currency: 'EUR', net: 0, vat: 0, targetName: '', reference: '', ...over,
});

const cat = (t: Transaction): CategorisedTransaction => ({
  transaction: t,
  category: t.direction === 'IN' ? 'revenue' : 'expense',
});

// The real FY2025 rows: one revenue invoice, one expense paid by the owner.
const revenueTx = tx({ direction: 'IN', sourceName: 'DBG MANAGEMENT OU', targetName: 'Innovate Invest OÜ', amount: 1893.23, net: 1526.8, vat: 366.43 });
const ownerPaidExpense = tx({ direction: 'OUT', sourceName: 'Kaspar Lemmo Palgi', amount: 2130.01, net: 1717.75, vat: 412.26 });
const fixture = [revenueTx, ownerPaidExpense].map(cat);

describe('buildStatements', () => {
  const s = buildStatements(fixture, company);

  it('produces the income statement (loss for the year)', () => {
    expect(s.income.revenue).toBeCloseTo(1526.8);
    expect(s.income.goodsMaterialsServices).toBeCloseTo(-1717.75);
    expect(s.income.profitForYear).toBeCloseTo(-190.95);
  });

  it('treats an owner-paid expense as a loan, not a cash outflow', () => {
    expect(s.balance.cash).toBeCloseTo(5315.23); // 3422 + 1893.23, no OUT from company
    expect(s.balance.loanLiabilities).toBeCloseTo(2130.01);
  });

  it('folds the net VAT receivable into receivables', () => {
    expect(s.balance.receivables).toBeCloseTo(2545.83); // 2500 + (412.26 - 366.43)
    expect(s.balance.taxPayable).toBe(0);
  });

  it('balances to the cent', () => {
    expect(s.balance.totalAssets).toBeCloseTo(7861.06);
    expect(s.balance.totalAssets).toBe(s.balance.totalLiabilitiesAndEquity);
  });

  it('reduces cash when the company itself pays the expense', () => {
    const companyPaid = [revenueTx, tx({ ...ownerPaidExpense, sourceName: 'Innovate Invest OÜ' })].map(cat);
    const s2 = buildStatements(companyPaid, company);
    expect(s2.balance.cash).toBeCloseTo(3185.22); // 3422 + 1893.23 - 2130.01
    expect(s2.balance.loanLiabilities).toBe(0);
    expect(s2.balance.totalAssets).toBe(s2.balance.totalLiabilitiesAndEquity);
  });
});

describe('assertBalanced', () => {
  it('throws when assets do not equal liabilities + equity', () => {
    const broken = { totalAssets: 100, totalLiabilitiesAndEquity: 90 } as BalanceSheet;
    expect(() => assertBalanced(broken)).toThrow(/does not balance/);
  });
});
