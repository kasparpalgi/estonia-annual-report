# Estonia annual report

Bank transaction history of Estonian limited company (OÜ) → Estonian taxman annual report XBRL (Äriregistri aastaaruanne).

* Categorise [transactions](transaction_history/2025/transaction-history.csv)
* Prepares the balance sheet koostab (bilanss) and income statement (kasumiaruanne)
* Generates [et-GAAP XBRL taxonomy](et-gaap-cor_2026-01-01.xsd) file

## Install

1. Create `/transaction_history` folder and eg. `2026` in it. See the format how to provide the [statement data CSV](doc/transaction-history.csv). It must be in CSV format but you can first use the [spreadsheet](doc/transaction-history.ods) and then export CSV from there.
    - If you have in different format the bank statements then create just new `doc/todo/006-updated-csv-statement-format.md` write your prompt
    - Run in Claude Code or your favourite agent `/todo 006`
2. Rename `.env.example` to `.env` and add your actual data there
3. Run `npm i` or whatever pnpm, yarn, etc. you use

## Run

`npm run dev` categorises the transactions, prints both statements, and writes the
validated XBRL instance to `output/aastaaruanne-<year>.xbrl` (gitignored — it holds
real financials). `npm test` runs the suite.

## Submitting to the registry (ariregister.rik.ee)

After `npm run dev` generates the XBRL file, complete these steps in the portal:

### 1. Upload XBRL
Upload `output/aastaaruanne-<year>.xbrl` under "Lae üles XBRL-fail". The financial
statement numbers are pre-filled automatically.

### 2. Select reporting forms
Under "Aruandlusvormide valik" make sure these are selected:
- Statement of financial position (detailed)
- Income statement (scheme 1)
- Note: Accounting policies for a micro undertaking
- **Note: Net sales** ← required, easy to miss
- Note: Labor expense
- Note: Related parties

### 3. Fill in Note: Net sales
Open the Note: Net sales form. The XBRL pre-fills "Net sales by operating activities"
(activity name + current year amount). You must fill in manually:
- **Net sales by geographical location → Net sales in European Union**: enter current
  year revenue and prior year revenue (country: Estonia)
- **Total net sales in European Union** and **Total net sales**: same amounts
- **Net sales by operating activities → prior year column**: enter prior year revenue
- All "Total net sales" rows must match across both sections or the form will error

### 4. Fill in field-of-activity breakdown (SISESTA MÜÜGITULU JAOTUS)
On the **main report overview page**, scroll down and click
**"SISESTA MÜÜGITULU JAOTUS"**. This is separate from Note: Net sales.
- EMTAK 2025 code for management/business consulting: **70201**
  (Äritegevuse ja muu juhtimisalane nõustamine)
- Amount: total net revenue for the year
- Must cover ≥ 90% of total sales revenue

### 5. Tegevusaruanne (management report)
Skip it — voluntary for micro-entities (mikroettevõtja) since 17.01.2025, unless net
assets fall below the legal minimum (ÄS § 176). Net assets well above threshold → not required.

### 6. Sign and submit
Click **"Suuna aruanne allkirjastamisele"** and proceed through signing.