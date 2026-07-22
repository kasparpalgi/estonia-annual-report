# Estonia annual report

Bank transaction history of Estonian limited company (OÜ) → Estonian taxman annual report XBRL (Äriregistri aastaaruanne).

* Categorise [transactions](transaction_history/2025/transaction-history.csv)
* Prepares the balance sheet koostab (bilanss) and income statement (kasumiaruanne)
* Generates [et-GAAP XBRL taxonomy](et-gaap-cor_2026-01-01.xsd) file

## Install

1. Create `/transaction_history` folder and eg. `2026` in it. See the format how to provide the [statement data CSV](doc/transaction-history.csv). It must be in CSV format but you can first use the [spreadsheet](doc/transaction-history.ods) and then export CSV from there.
    - If you have in different format the bank statements then create just new `doc/todo/005-updated-csv-statement-format.md` write your prompt
    - Run in Claude Code or your favourite agent `/todo 005`
2. Rename `.env.example` to `.env` and add your actual data there
3. Run `npm i` or whatever pnpm, yarn, etc. you use