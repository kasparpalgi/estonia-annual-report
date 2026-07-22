// Typed, intermediate financial-statement model for an Estonian micro-entity
// (mikroettevõtja). Line items mirror the company's filed 2024 report so the
// 004 XBRL step maps cleanly onto the et-gaap taxonomy. Amounts are EUR.

export interface OpeningBalances {
  cash: number; // Raha
  receivables: number; // Nõuded ja ettemaksed
  shareCapital: number; // Osakapital nimiväärtuses
  unpaidCapital: number; // Sissemaksmata osakapital (negative)
  retainedEarnings: number; // Eelmiste perioodide jaotamata kasum (kahjum)
}

export interface CompanyInputs {
  name: string;
  registryCode: string;
  legalAddress: string;
  fiscalYear: number;
  reportScheme: string;
  opening: OpeningBalances;
}

export interface IncomeStatement {
  revenue: number; // Müügitulu
  goodsMaterialsServices: number; // Kaubad, toore, materjal ja teenused (negative)
  operatingProfit: number; // Ärikasum (kahjum)
  profitBeforeTax: number; // Kasum (kahjum) enne tulumaksustamist
  profitForYear: number; // Aruandeaasta kasum (kahjum)
}

export interface BalanceSheet {
  // Varad
  cash: number; // Raha
  receivables: number; // Nõuded ja ettemaksed (incl. net VAT receivable)
  totalCurrentAssets: number; // Kokku käibevarad
  totalAssets: number; // Kokku varad
  // Kohustised
  loanLiabilities: number; // Laenukohustised (shareholder loan)
  taxPayable: number; // Maksuvõlad (net VAT payable, if any)
  totalCurrentLiabilities: number; // Kokku lühiajalised kohustised
  totalLiabilities: number; // Kokku kohustised
  // Omakapital
  shareCapital: number; // Osakapital nimiväärtuses
  unpaidCapital: number; // Sissemaksmata osakapital
  retainedEarnings: number; // Eelmiste perioodide jaotamata kasum (kahjum)
  profitForYear: number; // Aruandeaasta kasum (kahjum)
  totalEquity: number; // Kokku omakapital
  totalLiabilitiesAndEquity: number; // Kokku kohustised ja omakapital
}

export interface Statements {
  company: CompanyInputs;
  income: IncomeStatement;
  balance: BalanceSheet;
}
