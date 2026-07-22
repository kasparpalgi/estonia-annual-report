import { describe, it, expect } from 'vitest';
import { buildXbrl } from '../src/xbrl/build';
import { validateXbrl } from '../src/xbrl/validate';
import { assertConceptsExist, mappedConcepts } from '../src/xbrl/concepts';
import { buildStatements } from '../src/statements/build';
import type { CompanyInputs } from '../src/statements/model';
import type { CategorisedTransaction } from '../src/categorise';
import type { Transaction } from '../src/csv';

const company: CompanyInputs = {
  name: 'Innovate Invest OÜ',
  registryCode: '14504365',
  legalAddress: 'Pärnu maakond, Saarde vald, Tihemetsa alevik, Asuvere tee 7',
  fiscalYear: 2025,
  reportScheme: 'mikroettevõtja',
  activityName: 'Konsultatsiooniteenused',
  priorYearRevenue: 7750,
  opening: { cash: 3422, receivables: 2500, shareCapital: 2500, unpaidCapital: -2500, retainedEarnings: 5922 },
};

const tx = (over: Partial<Transaction>): Transaction => ({
  direction: 'IN', createdOn: new Date('2025-07-02'), sourceName: '', amount: 0,
  currency: 'EUR', net: 0, vat: 0, targetName: '', reference: '', ...over,
});
const cat = (t: Transaction): CategorisedTransaction => ({
  transaction: t, category: t.direction === 'IN' ? 'revenue' : 'expense',
});
const fixture = [
  tx({ direction: 'IN', sourceName: 'DBG MANAGEMENT OU', targetName: 'Innovate Invest OÜ', amount: 1893.23, net: 1526.8, vat: 366.43 }),
  tx({ direction: 'OUT', sourceName: 'Kaspar Lemmo Palgi', amount: 2130.01, net: 1717.75, vat: 412.26 }),
].map(cat);

const statements = buildStatements(fixture, company);
const xml = buildXbrl(statements);

describe('concept mapping', () => {
  it('every mapped concept exists in the taxonomy', () => {
    expect(() => assertConceptsExist()).not.toThrow();
    expect(mappedConcepts().length).toBeGreaterThan(10);
  });
  it('fails loudly against a taxonomy that lacks the concepts', () => {
    // A file with no matching <xsd:element> lines → all concepts missing.
    expect(() => assertConceptsExist('package.json')).toThrow(/not found in taxonomy/);
  });
});

describe('buildXbrl', () => {
  it('is well-formed and carries schemaRef, contexts, units', () => {
    const v = validateXbrl(xml);
    expect(v.wellFormed).toBe(true);
    expect(v.hasSchemaRef).toBe(true);
    expect(v.contexts).toEqual(expect.arrayContaining(['I-end', 'D-year', 'D-prior']));
    expect(v.units).toContain('EUR');
    expect(v.errors).toEqual([]);
  });

  it('ties out the balance sheet inside the instance', () => {
    const v = validateXbrl(xml);
    expect(v.assets).toBe(7861);
    expect(v.balances).toBe(true);
  });

  it('tags the key facts with the right values and contexts', () => {
    expect(xml).toContain('<et-gaap:Revenue contextRef="D-year" unitRef="EUR" decimals="0">1527</et-gaap:Revenue>');
    expect(xml).toContain('<et-gaap:CurrentLoans contextRef="I-end" unitRef="EUR" decimals="0">2130</et-gaap:CurrentLoans>');
    expect(xml).toContain('<et-gaap:TotalAnnualPeriodProfitLoss contextRef="D-year" unitRef="EUR" decimals="0">-191</et-gaap:TotalAnnualPeriodProfitLoss>');
  });

  it('populates general info and escapes the entity identifier', () => {
    expect(xml).toContain('<et-gaap:CompanyName contextRef="I-end">Innovate Invest OÜ</et-gaap:CompanyName>');
    expect(xml).toContain('scheme="http://xbrl.eesti.ee/estonian_commercial_register">14504365</xbrli:identifier>');
    expect(xml).toContain('<et-gaap:LegalAddress contextRef="I-end">');
  });

  it('omits "Ärikasum" — the taxonomy has no element for it', () => {
    expect(xml).not.toContain('operatingProfit');
  });

  it('emits net-sales-by-activity tuple with current and prior year values', () => {
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesTuple>');
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesName contextRef="D-year">Konsultatsiooniteenused</et-gaap:NetSalesByOperatingActivitiesName>');
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesValue contextRef="D-year" unitRef="EUR" decimals="0">1527</et-gaap:NetSalesByOperatingActivitiesValue>');
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesValue contextRef="D-prior" unitRef="EUR" decimals="0">7750</et-gaap:NetSalesByOperatingActivitiesValue>');
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesTotal contextRef="D-year" unitRef="EUR" decimals="0">1527</et-gaap:NetSalesByOperatingActivitiesTotal>');
    expect(xml).toContain('<et-gaap:NetSalesByOperatingActivitiesTotal contextRef="D-prior" unitRef="EUR" decimals="0">7750</et-gaap:NetSalesByOperatingActivitiesTotal>');
  });
});
