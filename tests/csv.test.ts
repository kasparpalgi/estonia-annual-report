import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { parseCSV } from '../src/csv';

const TEMPLATE = join('doc', 'Template of statement - transaction-history.csv');

describe('parseCSV', () => {
  it('parses both rows from template', () => {
    const rows = parseCSV(TEMPLATE);
    expect(rows).toHaveLength(2);
  });

  it('parses IN row correctly', () => {
    const [row] = parseCSV(TEMPLATE);
    expect(row.direction).toBe('IN');
    expect(row.amount).toBeCloseTo(1893.23);
    expect(row.net).toBeCloseTo(1526.80);
    expect(row.vat).toBeCloseTo(366.43);
    expect(row.currency).toBe('EUR');
    expect(row.reference).toBe('Eg. Invoice 1');
  });

  it('parses OUT row correctly', () => {
    const rows = parseCSV(TEMPLATE);
    const row = rows[1];
    expect(row.direction).toBe('OUT');
    expect(row.net).toBeCloseTo(1717.75);
    expect(row.vat).toBeCloseTo(412.26);
    expect(row.reference).toBe('');
  });

  it('parses date correctly', () => {
    const [row] = parseCSV(TEMPLATE);
    expect(row.createdOn).toBeInstanceOf(Date);
    expect(row.createdOn.getFullYear()).toBe(2025);
    expect(row.createdOn.getMonth()).toBe(6); // July = 6 (0-indexed)
  });
});
