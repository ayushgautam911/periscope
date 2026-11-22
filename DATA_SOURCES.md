# India election data — sources & access

Reference for where Periscope's data can come from, what each source actually
contains, how to access it programmatically, and the licensing/ToS situation.
Compiled June 2026.

## TL;DR

- The **candidate-comparison fields voters most want** — pending **criminal cases**
  and **declared assets/liabilities** — live in candidate **election affidavits
  (Form 26)**. There is **no clean public bulk API** for them.
- **Official, openly-licensed data** (ECI / data.gov.in) covers **results and
  statistics**, not affidavit details.
- So: build the structured backbone (constituencies, candidates, parties, results)
  from open sources, and treat affidavit fields as a separate, harder ingestion.

## 1. Election Commission of India (ECI) — official

| Site                                                                 | What's there                                                                     | Access                                                                |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [eci.gov.in](https://www.eci.gov.in/)                                | Main portal, notifications, statistical reports                                  | HTML / PDF                                                            |
| [Affidavit Portal](https://affidavit.eci.gov.in/)                    | Candidate **Form 26 affidavits**: criminal cases, assets, liabilities, education | Per-candidate web view + **downloadable PDF**; no documented bulk API |
| **ECINet / "Know Your Candidate" (KYC)** module + KYC-ECI mobile app | Same affidavit disclosures, voter-friendly                                       | App / web; per-candidate                                              |
| [results.eci.gov.in](https://results.eci.gov.in/)                    | Live + historical **results** (Form 20)                                          | HTML tables                                                           |
| [encore.eci.gov.in](https://encore.eci.gov.in/)                      | Candidate nomination/scrutiny backend (ENCORE)                                   | Mostly internal                                                       |

**Key point:** ECI _is_ the authoritative source for criminal/asset data, but it's
exposed per-candidate (web + Form 26 PDFs), so using it at scale means a scraping
/ PDF-parsing ETL. The data originates as public-domain public documents.

## 2. data.gov.in (Open Government Data Platform) — official, open licence

- Catalogs: [Lok Sabha](https://www.data.gov.in/catalog/election-lok-sabha-house-people),
  [Vidhan Sabha](https://www.data.gov.in/catalog/election-vidhan-sabhas-state-legislative-assemblies),
  [2024 statistical reports](https://www.data.gov.in/catalog/general-election-lok-sabha-2024-statistical-reports-data).
- **Real REST API**: register for an API key, then request resources as
  `json | csv | xml` with `offset`, `limit`, `filters`. See [data.gov.in/apis](https://www.data.gov.in/apis).
- **Licence: Government Open Data License – India (GODL)** — commercial reuse allowed.
- **Contains:** electors, turnout, vote share, winners, constituency results.
  **Does NOT contain:** criminal cases or assets.

## 3. Lok Dhaba — TCPD / Ashoka University (academic, open)

- [lokdhaba.ashoka.edu.in](https://lokdhaba.ashoka.edu.in/) — cleaned, structured
  Lok Sabha + Vidhan Sabha results **1962→present**, with candidate **person-IDs**
  for career tracking. Party metadata: [github.com/tcpd/ppi](https://github.com/tcpd/ppi).
- Downloadable (CSV); free and open, attribution/citation expected.
- Best source for historical, consistent results. No affidavit fields.

## 4. ADR / MyNeta (civil society)

- [myneta.info](https://www.myneta.info/) — the most usable **structured** affidavit
  data (criminal, financial, education), compiled by ADR from ECI affidavits.
- **Terms of Use discourage redistribution**; scraped mirrors have been taken down
  for this reason. ADR provides an **API to media houses on request** (contact ADR).
- Use only via that legitimate route — do not scrape/redistribute.

## 5. Other

- [IndiaVotes](https://www.indiavotes.com/) — searchable results database.
- [datameet/india-election-data](https://github.com/datameet/india-election-data) —
  community mapping of public datasets.
- Kaggle dumps (varying quality/freshness).

## What Periscope uses today

The current Goa dataset (`src/data/goa/`) is **real election results** (2022
Assembly winners/runners-up + 2024 Lok Sabha, sourced from Wikipedia summaries of
the above). Affidavit fields are intentionally left **undefined** (shown as "—")
rather than fabricated. The `CandidateRepository` interface (`src/data/repository.ts`)
is the single swap-point: a future ECI-affidavit or ADR-API-backed implementation
drops in there with no UI changes.
