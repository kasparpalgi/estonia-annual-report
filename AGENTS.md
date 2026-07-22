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

## Recommended external tooling (human decision)

- **AR/TI/FI Claude plugin** `artifi-ee-annual-report` — an Estonian annual-report
  filing workflow for ariregister.rik.ee. Directly relevant; consider installing
  it as a reference. https://github.com/ar-ti-fi/plugins/tree/main/artifi-ee-annual-report
- `fallow-mcp` ships with the installed `fallow` dep. Not wired as an always-on
  MCP server (to save agent context); the CLI is used in the `/todo` gate instead.

## Open questions blocking real filing (needed before task 003)

- Company identity for XBRL general info: registry code, legal address, fiscal year.
- Full-year 2025 data — only July is present so far; opening balances?
- Report scheme: micro-entity (mikroettevõtja) vs small-entity (väikeettevõtja).
