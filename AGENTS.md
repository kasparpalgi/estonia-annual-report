# AGENTS.md

Canonical agent instructions for this repo. `CLAUDE.md` imports this file, so
every tool (Claude Code, and other harnesses that read `AGENTS.md`) shares one
source of truth. Keep it short — don't duplicate what's already in the code.

## What this project does

Turns an Estonian limited company's (OÜ) bank transaction history into the
official annual report (Äriregistri aastaaruanne) filed at ariregister.rik.ee.

Pipeline: **CSV transactions → categorise → balance sheet (bilanss) + income
statement (kasumiaruanne) → XBRL instance** validated against the `et-gaap`
taxonomy.

## Stack (decided — task 001)

- **Node.js + TypeScript** (`type: module` once we scaffold), CommonJS today.
- **Vitest** for unit + E2E tests.
- **fallow** for codebase health (`npx fallow audit --format json` gates changes).
- XBRL output is XML built against `et-gaap-cor_2026-01-01.xsd`.

Rationale: `fallow` (TS/JS-only) is already committed, XBRL is XML with strong
Node libraries, and the domain is small/simple. No reason to switch languages.

## Repo layout

- `transaction_history/<year>/transaction-history.csv` — **private, gitignored**.
  Real financial data. Never commit it or paste its contents into external calls.
- `doc/Template of statement*.csv|.ods` — anonymised CSV/spreadsheet templates.
- `doc/todo/NNN-*.md` — sequenced task files; run with `/todo NNN`.
- `et-gaap-cor_2026-01-01.xsd` — official taxonomy (3,439 concepts, English names,
  e.g. `CashAndCashEquivalents`, `Assets`, `Equity`, `ProfitLoss`).
- `logs/` — runtime logs (created by the app; see `/todo` logging rules).

## Transaction CSV schema

`Direction,Created on,Source name,Source amount (after fees),Source currency,Without VAT,VAT 24%,Target name,Reference`

- `Direction` — `IN` (revenue) or `OUT` (expense).
- `Without VAT` / `VAT 24%` — net and VAT split of `Source amount (after fees)`.
- On an `IN` row the company is the `Target name`; on `OUT` it is the payer.

## Workflow

- Tasks are driven by `/todo NNN` (see `.claude/commands/todo.md` for the full
  rules: simplicity first, ≤~100-line files, log to `logs/`, UTF-8 sources).
- Estonian text (ä, ö, ü, õ) appears in data and reports — keep files UTF-8.
- Commit + push to `main` on completion; skip tests/fallow only for pure docs.

## Configuration — `.env` (gitignored)

Report inputs live in `.env` (not committed; company data). Keys the build reads:

- `COMPANY_NAME` — legal name (`Innovate Invest OÜ`). Also identifies the company
  as the payer on `OUT` rows: an `OUT` whose payer isn't the company was paid by
  the owner personally → booked as a shareholder loan, not a company cash outflow.
- `REGISTRY_CODE` — company registry code (14504365).
- `LEGAL_ADDRESS` — legal address string.
- `FISCAL_YEAR` — reporting year (2025).
- `REPORT_SCHEME` — `mikroettevõtja` (micro-entity abridged report).
- `MONTHS_WITH_ZERO_BUSINESS_ACTIVITY` — comma list of months with no IN/OUT
  transactions (for 2025: `1,2,3,4,5,6,8,9,10,11,12` — only July had activity).
- `OPENING_*` — opening balances for `FISCAL_YEAR` (`OPENING_CASH`,
  `OPENING_RECEIVABLES`, `OPENING_SHARE_CAPITAL`, `OPENING_UNPAID_CAPITAL`,
  `OPENING_RETAINED_EARNINGS`), taken from the prior year's filed report
  (`transaction_history/aruanne_<year-1>.pdf`, bilanss at 31.12). Retained
  earnings already fold in the prior year's rolled-forward result. The company is
  **not** first-year (founded 2018), so these are non-zero.

2025 is a micro-entity with activity in July only (one IN invoice, one OUT
payment). A mikroettevõtja files an abridged balance sheet + income statement and
is exempt from the management report (tegevusaruanne) — keep the report minimal.

## External tooling decisions

- **AR/TI/FI plugin** `artifi-ee-annual-report` — **not installed** as a standing
  plugin. It's an interactive filing *workflow*, not a library our TS pipeline can
  call, and it adds per-session context cost for a deterministic code goal. Use its
  public repo as a reference during task 004 if a requirements question comes up.
  https://github.com/ar-ti-fi/plugins/tree/main/artifi-ee-annual-report
- `fallow-mcp` ships with the installed `fallow` dep. Not wired as an always-on
  MCP server (to save agent context); the CLI is used in the `/todo` gate instead.
