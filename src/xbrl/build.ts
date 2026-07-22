import type { Statements } from '../statements/model';
import { INCOME_CONCEPTS, BALANCE_CONCEPTS, assertConceptsExist } from './concepts';

// Identifiers the register resolves against the et-gaap taxonomy. The schemaRef
// points at the core schema file; the register may require its hosted entry-point
// URL instead (see doc/todo/004 human todo).
const ENTITY_SCHEME = 'http://ariregister.rik.ee';
const SCHEMA_REF = 'et-gaap-cor_2026-01-01.xsd';
const NS = {
  xbrli: 'http://www.xbrl.org/2003/instance',
  link: 'http://www.xbrl.org/2003/linkbase',
  xlink: 'http://www.w3.org/1999/xlink',
  iso4217: 'http://www.xbrl.org/2003/iso4217',
  'et-gaap': 'http://xbrl.eesti.ee/taxonomy/et-gaap_2026-01-01/',
};

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const money = (concept: string, ctx: string, n: number): string =>
  `  <et-gaap:${concept} contextRef="${ctx}" unitRef="EUR" decimals="2">${n.toFixed(2)}</et-gaap:${concept}>`;

const text = (concept: string, ctx: string, v: string): string =>
  `  <et-gaap:${concept} contextRef="${ctx}">${esc(v)}</et-gaap:${concept}>`;

/** Emit a monetary fact per mapped line (skips display-only subtotals). */
function facts(
  values: Record<string, number>,
  concepts: Record<string, string | null>,
  ctx: string,
): string[] {
  return Object.entries(concepts)
    .filter(([, concept]) => concept !== null)
    .map(([field, concept]) => money(concept as string, ctx, values[field]));
}

/** Build the et-gaap XBRL instance document for the statements. */
export function buildXbrl(s: Statements): string {
  assertConceptsExist();
  const { company: c, income, balance } = s;
  const y = c.fiscalYear;
  const I = 'I-end';
  const D = 'D-year';
  const id = `    <xbrli:entity><xbrli:identifier scheme="${ENTITY_SCHEME}">${esc(c.registryCode)}</xbrli:identifier></xbrli:entity>`;
  const xmlns = Object.entries(NS)
    .map(([p, u]) => `  xmlns:${p}="${u}"`)
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<xbrli:xbrl\n${xmlns}>`,
    `  <link:schemaRef xlink:type="simple" xlink:href="${SCHEMA_REF}"/>`,
    `  <xbrli:context id="${I}">`,
    id,
    `    <xbrli:period><xbrli:instant>${y}-12-31</xbrli:instant></xbrli:period>`,
    '  </xbrli:context>',
    `  <xbrli:context id="${D}">`,
    id,
    `    <xbrli:period><xbrli:startDate>${y}-01-01</xbrli:startDate><xbrli:endDate>${y}-12-31</xbrli:endDate></xbrli:period>`,
    '  </xbrli:context>',
    '  <xbrli:unit id="EUR"><xbrli:measure>iso4217:EUR</xbrli:measure></xbrli:unit>',
    text('CompanyName', I, c.name),
    text('RegistryCode', I, c.registryCode),
    text('LegalAddress', I, c.legalAddress),
    ...facts(income as unknown as Record<string, number>, INCOME_CONCEPTS, D),
    ...facts(balance as unknown as Record<string, number>, BALANCE_CONCEPTS, I),
    '</xbrli:xbrl>',
    '',
  ].join('\n');
}
