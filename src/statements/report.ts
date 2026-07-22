import type { Statements } from './model';

const row = (label: string, n: number): string =>
  `  ${label.padEnd(46)}${n.toFixed(2).padStart(12)}`;

/** Render both statements as human-readable text (Estonian labels, EUR). */
export function formatStatements(s: Statements): string {
  const { company: c, income: i, balance: b } = s;
  const lines = [
    `${c.name} (${c.registryCode}) — majandusaasta ${c.fiscalYear}`,
    '',
    'KASUMIARUANNE (eurodes)',
    row('Müügitulu', i.revenue),
    row('Kaubad, toore, materjal ja teenused', i.goodsMaterialsServices),
    row('Ärikasum (kahjum)', i.operatingProfit),
    row('Kasum (kahjum) enne tulumaksustamist', i.profitBeforeTax),
    row('Aruandeaasta kasum (kahjum)', i.profitForYear),
    '',
    'BILANSS (eurodes)',
    '  Varad',
    row('  Raha', b.cash),
    row('  Nõuded ja ettemaksed', b.receivables),
    row('  Kokku käibevarad', b.totalCurrentAssets),
    row('Kokku varad', b.totalAssets),
    '  Kohustised ja omakapital',
    row('  Laenukohustised', b.loanLiabilities),
    ...(b.taxPayable ? [row('  Maksuvõlad', b.taxPayable)] : []),
    row('  Kokku kohustised', b.totalLiabilities),
    row('  Osakapital nimiväärtuses', b.shareCapital),
    row('  Sissemaksmata osakapital', b.unpaidCapital),
    row('  Eelmiste perioodide jaotamata kasum (kahjum)', b.retainedEarnings),
    row('  Aruandeaasta kasum (kahjum)', b.profitForYear),
    row('  Kokku omakapital', b.totalEquity),
    row('Kokku kohustised ja omakapital', b.totalLiabilitiesAndEquity),
  ];
  return lines.join('\n');
}
