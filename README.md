# Estonia annual report

Bank transaction history of Estonian limited company (OÜ) → Estonian taxman annual report XBRL (Äriregistri aastaaruanne).

* Categorise [transactions](transaction_history/2025/transaction-history.csv)
* Prepares the balance sheet koostab (bilanss) and income statement (kasumiaruanne)
* Generates XBRL file

## Resources

* [et-GAAP XBRL taxonomy](et-gaap-cor_2026-01-01.xsd)
* [AR\TI/FI Claude plugin](https://ar-ti-fi.com/plugins/artifi-ee-annual-report) - Annual report preparation workflow covering all requirements for filing at ariregister.rik.ee - [GitHub repo](https://github.com/ar-ti-fi/plugins/tree/main/artifi-ee-annual-report)

## TODO

* Initialise Claude code and set up best skills, MCP, plugins AGENTS.md, commands (think also not to waste too much tokens)
* Decide the stack (NodeJS, TypeScript or something else better? what tests (unit? e2e?) and what to use?)
* Written build plan possibly in multiple sessions