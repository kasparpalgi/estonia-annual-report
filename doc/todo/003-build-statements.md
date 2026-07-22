# 003 — Build the income statement & balance sheet model

> **Model/effort:** Opus 4.8 high. This is the accounting-judgement core — Estonian
> RTJ/GAAP micro/small-entity statement structure. Correctness matters most here.

## Inputs (resolved — read from `.env`, see AGENTS.md)

- `REGISTRY_CODE=14504365`, `LEGAL_ADDRESS`, `FISCAL_YEAR=2025`.
- `REPORT_SCHEME=mikroettevõtja` → abridged micro-entity layout; no management
  report (tegevusaruanne).
- `MONTHS_WITH_ZERO_BUSINESS_ACTIVITY=1,2,3,4,5,6,8,9,10,11,12` → activity in July
  only. 2025 is treated as the reporting year; no separate opening balances given,
  so opening equity/cash start at zero unless the company inputs say otherwise —
  confirm with the human if the numbers don't tie out.

Load `.env` (e.g. add `dotenv`) and validate these are present before building.

## Goal

From the categorised transactions (002) plus the confirmed company inputs, build
a typed, intermediate financial-statement model (plain objects — **not** XBRL
yet): the income statement (kasumiaruanne) and balance sheet (bilanss) that
balances (Assets = Equity + Liabilities).

## Scope

1. **Statement model** (`src/statements/model.ts`) → verify: typed shape with the
   line items the chosen scheme requires.
   - Income statement: revenue, expenses (by the categories from 002), profit/loss.
   - Balance sheet: assets (cash, receivables…), equity (issued capital, retained
     earnings, profit for the year), liabilities. Net VAT position handled correctly.
2. **Builder** (`src/statements/build.ts`) → verify: unit tests with a fixture
   transaction set produce expected line items and a balanced sheet.
   - Pure function: `(Transaction[], CompanyInputs) => Statements`. Keep the
     accounting rules readable and commented where non-obvious.
3. **Balance assertion** → verify: a test asserts Assets = Equity + Liabilities to
   the cent for the fixture; builder throws on imbalance.
4. **Report** → verify: `npm run dev` prints both statements to console + `logs/`.

## Out of scope

- XBRL/XML output and taxonomy mapping → 004.

## Verification checklist

- [x] Company inputs confirmed and recorded (`.env` `OPENING_*`/`COMPANY_NAME`,
      documented in AGENTS.md; opening balances sourced from `aruanne_2024.pdf`).
- [x] Unit tests: statement line items + balance equality pass.
- [x] `npm test` — full suite green (002 + 003): 13/13.
- [x] `npx fallow audit --format json` clean (verdict pass, 0 introduced findings).
- [x] Numbers reconcile with the source CSV totals; UTF-8 preserved.

## Plan & actions (session — Opus 4.8)

### Key findings that reshaped the task
- **Broken baseline:** commit `7dcb467` renamed the template to
  `doc/transaction-history.csv` but left the 002 tests pointing at the old
  `doc/Template of statement …csv`. All 7 tests fail. Fixed as part of 003.
- **Opening balances are NOT zero.** `transaction_history/aruanne_2024.pdf`
  (filed 31.12.2024) gives real opening balances for 2025:
  Raha 3 422, Nõuded ja ettemaksed 2 500, Osakapital 2 500, Sissemaksmata
  osakapital −2 500, Eelmiste per. jaotamata kasum 5 922 (= −914 + 6 836,
  the 2024 profit rolled forward). Company founded 2018 — not first year.
- **OUT expense is owner-paid (confirmed with human).** The €2 130,01 OUT has
  payer "Kaspar Lemmo Palgi" / note "paid from personal account" → funds the
  company via a **shareholder loan (Laenukohustised)**, does not reduce company
  cash. Cash stays positive.
- **VAT:** company is VAT-registered (files käibedeklaratsioon). Revenue/expense
  booked net; net VAT = input 412,26 − output 366,43 = **45,83 receivable**
  (matches KMD box 13), folded into Nõuded ja ettemaksed.

### Expected FY2025 result (fixture = real 2025 rows)
Kasum: 1 526,80 − 1 717,75 = −190,95. Bilanss balances at **7 861,06**.

### Steps
1. Fix 002 test template path → verify: 7 existing tests green.
2. `.env`: add `COMPANY_NAME` + `OPENING_*` keys (gitignored). `src/config.ts`
   loads + validates them → verify: throws on missing key.
3. `src/statements/model.ts` — typed micro-entity statement shapes matching the
   2024 filing's line structure.
4. `src/statements/build.ts` — pure `(CategorisedTransaction[], CompanyInputs) =>
   Statements`; owner-paid→loan rule; net-VAT placement; `assertBalanced` throws
   on imbalance → verify: fixture tests + balance-to-the-cent + throw test.
5. `src/statements/report.ts` + `src/index.ts` — print both statements to console
   + `logs/statements.log`.
6. `npm test` full green, `npx fallow audit` clean, `npm run dev` on real data.

### Judgment calls (flagged for human confirmation)
- Owner-paid detection via payer name ≠ company name.
- 2025 expense mapped to "Kaubad, toore, materjal ja teenused" (matches 2024).
- €2 500 receivable carried forward unchanged (no 2025 transaction affects it).

## Results

### Summary
- Loaded opening balances from the filed 2024 report and built the FY2025
  income statement + balance sheet as a typed, pre-XBRL model.
- Handled the owner-paid expense as a shareholder loan (Laenukohustised), the
  net VAT as a receivable (folded into Nõuded ja ettemaksed), and rolled the
  2024 result into opening retained earnings.
- Statements balance to the cent (Kokku varad = Kokku kohustised ja omakapital =
  **7 861,06**); builder throws on any imbalance.
- Fixed the 002 tests that broke when the template CSV was renamed.

### Files changed
- Created: `src/statements/model.ts`, `src/statements/build.ts`,
  `src/statements/report.ts`, `src/config.ts`, `tests/build.test.ts`.
- Modified: `src/index.ts` (wire config→build→report), `.env` (`COMPANY_NAME` +
  `OPENING_*`), `AGENTS.md` (document keys), `tests/csv.test.ts` +
  `tests/categorise.test.ts` (template path fix).

### Verification
- `npm run build` — pass (0 TS errors).
- `npm test` — 13/13 pass (csv 4, categorise 3, build 6).
- `npm run dev` — prints both statements; bilanss balances at 7 861,06; UTF-8 ok.
- `npx fallow audit` — verdict pass, 0 introduced findings (1 inherited: `fallow`
  in deps, pre-existing from 002).

### Deviations
- Opening balances are **not** zero (todo's tentative default). The human supplied
  `aruanne_2024.pdf`, so real 31.12.2024 balances are used.
- Recorded inputs in `.env` (gitignored) + AGENTS.md rather than `doc/company.md`,
  to keep real company financials out of the committed tree.

### Human todo
- Confirm the three judgment calls above (esp. the FY2025 expense line label —
  "Kaubad, toore, materjal ja teenused" was copied from the 2024 filing).
- For 004 (XBRL): the 2024 filing also carries a one-line *tegevusaruanne*,
  *müügitulu jaotus* (EMTAK 4778) and *kahjumi katmise ettepanek* — these are
  filing sections beyond the two core statements built here.
