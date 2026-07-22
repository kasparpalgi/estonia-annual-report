# 003 — Build the income statement & balance sheet model

> **Model/effort:** Opus 4.8 high. This is the accounting-judgement core — Estonian
> RTJ/GAAP micro/small-entity statement structure. Correctness matters most here.

## Blocked until the human provides (see AGENTS.md open questions)

- Company registry code, legal address, fiscal year (period start/end).
- Whether 2025 is the first accounting year and any opening balances.
- Report scheme: **mikroettevõtja** vs **väikeettevõtja** (decides which
  abbreviated statement layout and which et-gaap concepts apply).

Do not guess these. Confirm them at the start of the session; if missing, stop
and ask.

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

- [ ] Company inputs confirmed and recorded (e.g. `doc/company.md` or a config).
- [ ] Unit tests: statement line items + balance equality pass.
- [ ] `npm test` — full suite green (002 + 003).
- [ ] `npx fallow audit --format json` clean.
- [ ] Numbers reconcile with the source CSV totals; UTF-8 preserved.
