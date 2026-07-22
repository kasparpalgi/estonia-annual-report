import { readFileSync } from 'fs';

export interface Transaction {
  direction: 'IN' | 'OUT';
  createdOn: Date;
  sourceName: string;
  amount: number;
  currency: string;
  net: number;
  vat: number;
  targetName: string;
  reference: string;
}

export function parseCSV(filePath: string): Transaction[] {
  const lines = readFileSync(filePath, 'utf8').trim().split('\n');
  return lines.slice(1).map(parseLine);
}

function parseLine(line: string): Transaction {
  const cols = line.split(',');
  return {
    direction: cols[0].trim() as 'IN' | 'OUT',
    createdOn: new Date(cols[1].trim()),
    sourceName: cols[2].trim(),
    amount: parseFloat(cols[3].trim()),
    currency: cols[4].trim(),
    net: parseFloat(cols[5].trim()),
    vat: parseFloat(cols[6].trim()),
    targetName: cols[7].trim(),
    reference: (cols[8] ?? '').trim(),
  };
}
