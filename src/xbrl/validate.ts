import { XMLValidator, XMLParser } from 'fast-xml-parser';

export interface XbrlValidation {
  wellFormed: boolean;
  hasSchemaRef: boolean;
  contexts: string[];
  units: string[];
  factCount: number;
  assets: number;
  liabilitiesAndEquity: number;
  balances: boolean;
  errors: string[];
}

const num = (v: unknown): number => Number((v as { '#text'?: unknown })?.['#text'] ?? v);

/**
 * Structural validation of a generated instance: well-formedness, the required
 * schemaRef / contexts / EUR unit, and that the balance sheet ties out inside
 * the document (Assets = Liabilities + equity). Not a full XBRL calculation
 * audit — the register runs that; this catches the mistakes we can make.
 */
export function validateXbrl(xml: string): XbrlValidation {
  const errors: string[] = [];
  const valid = XMLValidator.validate(xml);
  const wellFormed = valid === true;
  if (!wellFormed) errors.push(`XML not well-formed: ${JSON.stringify(valid)}`);

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  const root = (wellFormed ? parser.parse(xml)['xbrli:xbrl'] : {}) ?? {};

  const asArray = <T>(v: T | T[] | undefined): T[] =>
    v === undefined ? [] : Array.isArray(v) ? v : [v];

  const contexts = asArray(root['xbrli:context']).map((c: any) => c['@_id']);
  const units = asArray(root['xbrli:unit']).map((u: any) => u['@_id']);
  const hasSchemaRef = Boolean(root['link:schemaRef']);

  const factCount = Object.keys(root).filter((k) => k.startsWith('et-gaap:')).length;
  const assets = num(root['et-gaap:Assets']);
  const liabilitiesAndEquity = num(root['et-gaap:LiabilitiesAndEquity']);
  const balances = Math.abs(assets - liabilitiesAndEquity) < 0.005;

  if (!hasSchemaRef) errors.push('missing link:schemaRef');
  if (!contexts.includes('I-end')) errors.push('missing instant context I-end');
  if (!contexts.includes('D-year')) errors.push('missing duration context D-year');
  if (!units.includes('EUR')) errors.push('missing EUR unit');
  if (!balances)
    errors.push(`balance sheet does not tie out: ${assets} vs ${liabilitiesAndEquity}`);

  return {
    wellFormed,
    hasSchemaRef,
    contexts,
    units,
    factCount,
    assets,
    liabilitiesAndEquity,
    balances,
    errors,
  };
}
