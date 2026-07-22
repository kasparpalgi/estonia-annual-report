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

- [ ] Every statement line resolves to a taxonomy concept; build fails otherwise.
- [ ] Generated file is well-formed XML with valid contexts, units, and schemaRef.
- [ ] Balance sheet ties out inside the instance.
- [ ] `npm test` — full suite green (002 + 003 + 004).
- [ ] `npx fallow audit --format json` clean.
- [ ] Manual sanity: open the file / dry-run against the register's validator.

## Human todo after this task

- Upload `output/aastaaruanne-<year>.xbrl` at ariregister.rik.ee and confirm the
  register's own validator accepts it before actual submission.
