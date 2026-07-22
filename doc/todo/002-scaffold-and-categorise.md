# 002 — Scaffold the project & categorise transactions

> **Model/effort:** Sonnet 4.6 high (or Opus 4.8 medium). Mechanical scaffolding +
> straightforward parsing/categorisation logic. No deep accounting judgement yet.

## Goal

Stand up the TypeScript project and turn the raw CSV into a typed, categorised
list of transactions in memory. This is the foundation for 003 (statements) and
004 (XBRL). Stop before building any financial statements.

## Scope

1. **Tooling** → verify: `npm run build`, `npm test`, `npm run dev` all run.
   - `tsconfig.json` (strict), `vitest.config.ts`, `npm` scripts (`build`,
     `dev`, `test`), Vitest as devDependency. Keep `type` sane for the toolchain.
   - `src/` + `tests/` folders. Minimal logging helper writing to `logs/`.
2. **CSV loading** (`src/csv.ts`) → verify: unit test parses the template CSV.
   - Parse `doc/Template of statement - transaction-history.csv` columns (see
     AGENTS.md schema). Trim, parse dates and the numeric `Without VAT` / `VAT 24%`
     / amount fields (handle `.` decimals). Return typed `Transaction[]`.
   - Point the loader at `transaction_history/<year>/transaction-history.csv` at
     runtime, but tests must use the anonymised `doc/` template (real data is
     gitignored — never rely on it in committed tests).
3. **Categorisation** (`src/categorise.ts`) → verify: unit tests on both rows.
   - Classify each `Transaction` into a small enum of report-relevant buckets
     needed downstream: at minimum `revenue` (IN) vs `expense` (OUT), keeping the
     net vs VAT split. Keep it a pure function; no statement logic here.
   - Do **not** over-engineer categories — only what 003 will consume. Add more
     buckets only when 003 proves it needs them.
4. **CLI entry** (`src/index.ts`) → verify: `npm run dev` logs loaded +
   categorised counts and totals to console and `logs/`.

## Out of scope (later tasks)

- Balance sheet / income statement construction → 003.
- XBRL generation → 004.
- Company metadata, opening balances, report scheme → gather before 003.

## Verification checklist

- [ ] `npm run build` compiles with no TS errors.
- [ ] `npm test` — all unit tests pass (csv parse + categorise).
- [ ] `npm run dev` prints sane counts/totals for the template CSV.
- [ ] `npx fallow audit --format json` clean (no new findings).
- [ ] Files stay small (≤~100 lines), pure functions, UTF-8.
