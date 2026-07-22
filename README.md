# Estonia annual report

Bank transaction history of Estonian limited company (OÜ) → Estonian taxman annual report XBRL (Äriregistri aastaaruanne).

* Categorise [transactions](transaction_history/2025/transaction-history.csv)
* Prepares the balance sheet koostab (bilanss) and income statement (kasumiaruanne)
* Generates [et-GAAP XBRL taxonomy](et-gaap-cor_2026-01-01.xsd) file

## Install

1. Create `/transaction_history` folder and eg. `2026` in it. See the format how to provide the [statement data CSV] 
2. Rename `.env.example` to `.env` and add your actual data there
3. Run `npm i` or whatever pnpm, yarn, etc. you use