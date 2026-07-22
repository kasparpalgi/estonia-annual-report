1. Set up properly the AI agents for this project: any skills maybe? plugins? commands? instructions to any files? Think properly and set up also keeping in mind to not waste tokens.
2. If implementing the plan is one-shot then build too otherwise create following 002, 003 todo files with model/effort in top like instructed and we'll build with next session. Or build already some and still create folloup todo tasks.

Read README.md and see files in /transaction_history/2025 - the goal is to get the 2025 annual report submitted.

First decide stack. Maybe Node.js and TypeScript I picked not good and must use somethign else?

---

## Plan & actions (session log)

This is a **setup + planning** task. Building the full CSV→statements→XBRL
pipeline against a 3,439-concept taxonomy is not one-shot, so I set up the agent
config here and split the build into follow-up todos 002/003/004.

1. **Stack decision** — keep **Node.js + TypeScript + Vitest**. `fallow`
   (TS/JS-only) is already a committed dependency, XBRL is XML with strong Node
   libraries, and the domain is small. No reason to switch languages. Recorded in
   `AGENTS.md`.
2. **AI agent setup** (token-conscious):
   - Wrote real project context into `AGENTS.md` (was the placeholder `todo`).
   - Added `CLAUDE.md` that imports `@AGENTS.md` — one source of truth, no
     duplication, works for Claude Code and other harnesses.
   - Kept the existing `/todo` command; added **no** speculative skills.
   - Did **not** wire `fallow-mcp` as an always-on MCP server (saves agent
     context; the `fallow` CLI is already used in the `/todo` gate).
   - Documented the on-point **AR/TI/FI `artifi-ee-annual-report` plugin** as a
     human-decision recommendation rather than auto-installing it.
3. **Follow-up todos created** — 002 (scaffold + categorise), 003 (build
   statements), 004 (generate/validate XBRL), each with a model/effort header.
4. **Surfaced real blockers** for actual filing (company registry code, address,
   fiscal year; full-year data — only July present; micro vs small report
   scheme). These block 003/004, not this setup task; captured in `AGENTS.md` and
   `003`.

No source code was written this session, so tests / `fallow` / `npm run dev` do
not apply (per the `/todo` NB).

## Results

**Summary**
- Confirmed and documented the stack (Node.js + TypeScript + Vitest).
- Set up agent config: real `AGENTS.md`, `CLAUDE.md` importing it, no wasted MCP/skills.
- Split the build into three sized, model-tagged follow-up todos (002/003/004).
- Documented the recommended AR/TI/FI annual-report plugin and the open questions
  that block real filing.

**Files changed**
- Created: `CLAUDE.md`, `doc/todo/002-scaffold-and-categorise.md`,
  `doc/todo/003-build-statements.md`, `doc/todo/004-generate-xbrl.md`.
- Modified: `AGENTS.md` (placeholder → real content), this file.

**Verification**
- Stack decision recorded — done.
- Agent config single-source-of-truth — done.
- Follow-up todos have model/effort headers and one-session scope — done.
- Tests/fallow/dev — N/A (no code changed).

**Deviations** — None.

**Human todo**
- Decide whether to install the AR/TI/FI `artifi-ee-annual-report` plugin as a
  filing-workflow reference.
- Before task 003, provide: company registry code, legal address, fiscal year;
  confirm whether 2025 is the first year + any opening balances; and the report
  scheme (mikroettevõtja vs väikeettevõtja). Also add the remaining 2025
  transactions (only July is in the CSV so far).