# 004 — Generate & validate the XBRL instance

> **Model/effort:** Opus 4.8 high. Most technical task — mapping the statement
> model to `et-gaap` concepts and emitting a schema-valid XBRL instance document.

## Goal

Turn the statement model (003) into an `et-gaap` XBRL instance document ready to
upload at ariregister.rik.ee, and validate it.

## Scope

1. **Concept mapping** (`src/xbrl/concepts.ts`) → verify: each statement line maps
   to a real element in `et-gaap-cor_2026-01-01.xsd` (e.g. `CashAndCashEquivalents`,
   `Assets`, `Equity`, `ProfitLoss`). Fail loudly on any unmapped line.
   - Respect each concept's `periodType` (`instant` for balance sheet, `duration`
     for income statement) and the chosen report scheme's presentation.
2. **Instance builder** (`src/xbrl/build.ts`) → verify: produces well-formed XBRL
   with correct namespaces, `schemaRef` to the taxonomy, `xbrli:context`
   (entity registry code + period) and `xbrli:unit` (EUR), and `decimals`/scale.
3. **General info** → verify: company name, registry code, address, period from the
   confirmed inputs (003) populate the general-information section.
4. **Validation** → verify: output parses as valid XML and passes schema/structural
   checks (well-formedness + required contexts/units + balance tie-out). Prefer a
   lightweight XML lib over pulling in a heavy XBRL processor unless needed.
5. **Output** (`src/index.ts`) → verify: writes `output/aastaaruanne-<year>.xbrl`
   and logs a validation summary to `logs/`.

## Out of scope

- Actual upload/submission to the register (human does this manually).

## Verification checklist

- [x] Every statement line resolves to a taxonomy concept; build fails otherwise.
- [x] Generated file is well-formed XML with valid contexts, units, and schemaRef.
- [x] Balance sheet ties out inside the instance.
- [x] `npm test` — full suite green (002 + 003 + 004): 20/20.
- [x] `npx fallow audit --format json` clean (verdict pass, 0 introduced findings).
- [x] Manual sanity: opened `output/aastaaruanne-2025.xbrl`; ties out 7861.06.

## Human todo after this task

- Upload `output/aastaaruanne-2025.xbrl` at ariregister.rik.ee and confirm the
  register's own validator accepts it before actual submission.
- **`schemaRef` href** is the bare taxonomy filename (`et-gaap-cor_2026-01-01.xsd`).
  If the register rejects it, change `SCHEMA_REF` in `src/xbrl/build.ts` to the
  register's hosted entry-point URL. Same for `ENTITY_SCHEME` (`http://ariregister.rik.ee`).
- The register auto-computes filing extras from the 2024 filing not modelled here:
  *tegevusaruanne* (micro-entity is exempt), *müügitulu jaotus* (EMTAK 4778), and
  *kahjumi katmise ettepanek*. Add these in the portal form if it asks.

## Plan & actions (session — Opus 4.8)

### Concept mapping (verified against `et-gaap-cor_2026-01-01.xsd`)
Every statement line maps to a real et-gaap element, confirmed by reading the
schema's equity/asset/liability/income sections:

| Statement line | et-gaap concept | period |
| --- | --- | --- |
| Müügitulu | `Revenue` | duration |
| Kaubad, toore, materjal ja teenused | `GoodsRawMaterialsAndServices` | duration |
| Kasum enne tulumaksustamist | `TotalProfitLossBeforeTax` | duration |
| Aruandeaasta kasum | `TotalProfitLoss` | duration |
| Raha | `CashAndCashEquivalents` | instant |
| Nõuded ja ettemaksed | `ShortTermReceivablesAndPrepayments` | instant |
| Kokku käibevarad / Kokku varad | `CurrentAssets` / `Assets` | instant |
| Laenukohustised | `CurrentLoans` | instant |
| Maksuvõlad | `TaxPayables` | instant |
| Kokku lühiajalised kohustised / Kokku kohustised | `CurrentLiabilities` / `Liabilities` | instant |
| Osakapital nimiväärtuses | `IssuedCapital` | instant |
| Sissemaksmata osakapital | `UnpaidCapital` | instant |
| Eelmiste per. jaotamata kasum | `RetainedEarningsLoss` | instant |
| Aruandeaasta kasum (bilanss) | `AnnualPeriodProfitLoss` | instant |
| Kokku omakapital | `Equity` | instant |
| Kokku kohustised ja omakapital | `LiabilitiesAndEquity` | instant |

### Judgment call
- **"Ärikasum (kahjum)" has no et-gaap element** — it is a presentation-only
  subtotal. For a micro-entity with no financial/tax items it equals
  profit-before-tax. It is intentionally not emitted as an XBRL fact (mapped to
  `null` in `concepts.ts`). Every other model field maps to a real concept; the
  `Record<keyof …>` type makes an unmapped field a compile error.

## Results

### Summary
- Built `src/xbrl/{concepts,build,validate}.ts`: a compile-safe concept map that
  fails loudly if a mapped concept is absent from the taxonomy, an instance
  builder emitting a well-formed et-gaap XBRL document, and a structural validator.
- `src/index.ts` now writes `output/aastaaruanne-2025.xbrl` (21 facts, EUR,
  `decimals="2"`) and logs a validation summary to `logs/xbrl.log`; it throws if
  validation fails.
- Instance ties out inside the document: Assets 7861.06 = Liabilities 2130.01 +
  Equity 5731.05. Instant context for the balance sheet, duration for the income
  statement, entity = registry code 14504365, unit EUR.

### Files changed
- Created: `src/xbrl/concepts.ts`, `src/xbrl/build.ts`, `src/xbrl/validate.ts`,
  `tests/xbrl.test.ts`.
- Modified: `src/index.ts` (build + validate + write XBRL), `.gitignore`
  (`/output`), `package.json` (`fast-xml-parser` dep), `AGENTS.md` (XBRL step +
  output note).

### Verification
- `npm run build` — pass (0 TS errors).
- `npm test` — 20/20 pass (csv 4, categorise 3, build 6, xbrl 7).
- `npm run dev` — writes the instance; validation passes; balance ties out.
- `npx fallow audit` — verdict pass, 0 introduced findings (1 inherited: `fallow`
  in deps, pre-existing).

### Deviations
- Added a lightweight dependency `fast-xml-parser` for well-formedness/structural
  validation (todo allowed "a lightweight XML lib"). No heavy XBRL processor.
- `output/` is gitignored — the instance carries real company financials.
