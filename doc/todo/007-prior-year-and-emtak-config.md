# 007 — Store EMTAK code + prior-year revenue in config

**Model/effort:** Haiku 4.5 / low — simple config + env additions, no logic change.

## Context

After the 2025 submission, two pieces of data had to be looked up or remembered manually each year:

1. **EMTAK code** — needed for the "SISESTA MÜÜGITULU JAOTUS" step in the portal.
   For Innovate Invest OÜ it is **70201** (Äritegevuse ja muu juhtimisalane nõustamine).
   Currently not stored anywhere in the project.

2. **Prior-year revenue** — needed when manually filling "Note: Net sales" in the portal
   (the 2024 column). We removed `PRIOR_YEAR_REVENUE` from config because the XBRL
   second-period restriction made the XBRL element useless. But the value is still needed
   as a human reference during portal form entry.

## Task

1. Add `EMTAK_CODE` to `.env.example` and document it (value: `70201`).
2. Add `PRIOR_YEAR_REVENUE` back to `.env.example` as a **comment-only reference**
   (not read by the app — just so the value is recorded for the human doing the portal
   steps next year). Add a note explaining it is for manual portal entry only.
3. Update `AGENTS.md` with both values under the Configuration section.
4. No code changes to `src/` — these are documentation/config-only additions.

## Verification

- `.env.example` contains both keys with correct comments
- `AGENTS.md` mentions EMTAK code 70201 and where prior-year revenue is used
- `npx tsc --noEmit` still clean (no src changes)
- `npx vitest run` still passes
