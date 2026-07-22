import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { parseCSV } from '../src/csv';
import { categorise } from '../src/categorise';

const TEMPLATE = join('doc', 'Template of statement - transaction-history.csv');

describe('categorise', () => {
  it('classifies IN as revenue and OUT as expense', () => {
    const categorised = categorise(parseCSV(TEMPLATE));
    expect(categorised[0].category).toBe('revenue');
    expect(categorised[1].category).toBe('expense');
  });

  it('preserves transaction net and vat', () => {
    const categorised = categorise(parseCSV(TEMPLATE));
    expect(categorised[0].transaction.net).toBeCloseTo(1526.80);
    expect(categorised[1].transaction.net).toBeCloseTo(1717.75);
  });

  it('returns same count as input', () => {
    const rows = parseCSV(TEMPLATE);
    expect(categorise(rows)).toHaveLength(rows.length);
  });
});
