---
description: Open and execute a task from /doc/todo/ folder by number
argument-hint: <task-number>
---

Execute task `$ARGUMENTS` from `/doc/todo/` by number.

1. Read `CLAUDE.md` and `AGENTS.md` if you haven't already & the todo file with the given sequence number (e.g. `001`, `002`, etc.) from `/doc/todo/`.
2. Check for open questions or blockers — stop and ask if any exist.
3. Confirm the plan is actionable (no placeholder text remaining).
4. Leave the top part of the todo file as-is and log your plan & actions below in the same file.
5. Execute the task (unless the task file says it is only for planning — then points 5+ do not apply & create the following new files in `doc/todo` folder +1, +2, +3 numbers from current `$ARGUMENTS` todo item and in the top of each file define depending on the file complexity the model to be used and effort eg. Opus 4.8 medium, Sonnet 4.6 high, or so easy that Chinese GLM 5.3, DeepSeek V3 Pro, Haiku 4.5 can do it. Each todo file of size of most reasonable amount for one session.).
6. After completion update the task file:
   - Check off verification items and add a `## Results` section.
   - **Summary** — bulleted list of completed work
   - **Files changed** — created / modified / deleted
   - **Verification** — status of each check
   - **Deviations** — any changes from the plan, or "None"
   - **Human todo** - if absolutely neccessary for human to do anything (what exactly and how to do) or keep in mind anything (shortly)
7. Cover with appropriate unit and/or E2E tests what you have done (unless it doesn't make sense). Think senior: critical things only; do not write pointless tests.
8. Run tests and make sure **all** tests pass (not only the ones affected by this session).
9. `npx fallow audit --format json` from the repo root and fix any issues it surfaces before finalising.
10. Update documentation if needed. Commit and push to main. 
11. Run `npm run dev` and see from logs if all works as expected. Do it if it makes sense - otherwise I do it.

NB! Don't be stupid and do not run tests and fallow when it makes absolutely no sense! Eg. you do documentation, change button color etc. Running tests and fallow when you made changes that makes now sense to run them.