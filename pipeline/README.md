# Pipeline

Two scrapers — MyNeta (prototyping only) and ECI direct (production-ready, India IP required).

---

## ECI pipeline (direct government source, no ToS concerns)

Targets `affidavit.eci.gov.in` — the Election Commission's own affidavit portal.
Covers all elections since 2019 (eSuvidha era). No third-party intermediary.

**⚠️ India IP required.** The ECI portal uses Akamai WAF which blocks all non-India IPs
with HTTP 403. Deploy on AWS `ap-south-1` (Mumbai) or any India-region VPS.

```bash
# On an India-based server:
cd pipeline
source .venv/bin/activate
python -m eci_pipeline --list-elections           # show all known elections
python -m eci_pipeline --election 13-AC-GENERAL-3-23 --state Goa   # Goa 2022 assembly
python -m eci_pipeline --election 8-AC-GENERAL-3-12 --state Delhi  # Delhi 2020 assembly
python -m eci_pipeline --election 13-AC-GENERAL-3-23 --pdf-dir output/pdfs  # also download PDFs
```

### ECI pipeline phases

1. **List** — `CandidateCustomFilter?electionType={type}&election={no}&page=N`
   Returns: name, party, status, state, constituency, profile URL
2. **Profile** — visit each candidate's `show-profile/...` page
   Returns: age, gender, address, nomination date, `pdfUrl` (base64 → suvidha.eci.gov.in PDF URL)
3. **PDF download** (optional) — fetch from `suvidha.eci.gov.in/uploads/acaffidavit/...`
   Returns: Form 26 PDF (machine-readable text in eSuvidha era)
4. **PDF parse** (TODO) — `parse_pdf.py` stubs are ready; criminal case + asset regex parsers
   need to be written and validated against real PDFs

### ECI election codes

Election codes are in `eci_pipeline/elections.json` (sourced from the
kaarana/AffidavitManagement open-source project). Update this file when
new election seasons are announced. Key codes:

| Code | Season | Covers |
|------|--------|--------|
| `13-AC-GENERAL-3-23` | 13 (Jan–Mar 2022) | Goa, Manipur, Punjab, UP, Uttarakhand assembly |
| `8-AC-GENERAL-3-12` | 8 (Feb 2020) | Delhi assembly |
| `1-PC-GENERAL-1-1` | 1 (May 2019) | Lok Sabha 2019 |

---

## MyNeta pipeline

Scrapes candidate affidavit data (criminal cases, assets, education, age) from myneta.info for any Indian state and writes a flat JSON file.

**ToS note:** ADR discourages automated collection and redistribution. Use for local prototyping only. For public or commercial use, get written permission from ADR (adr@adrindia.org).

## Setup

```bash
cd pipeline
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # requests>=2.31, beautifulsoup4>=4.12
```

## The 4 phases

1. **Discover** — scrape the candidate listing pages; produces id, name, constituency, party, criminal count, education, assets, liabilities for every candidate
2. **Flag** — cross-reference winners and serious-crime listings from MyNeta; marks `is_winner` and `has_serious_cases` per candidate
3. **Extract** — fetch each candidate's detail page; adds age, profession, movable/immovable assets, per-case IPC sections
4. **Classify** — reconcile serious-case counts; MyNeta's serious flag is authoritative for presence, per-case classifier only counts among flagged candidates

Phase 0 (resolve election slug) and phase 5 (write JSON) are handled by the CLI wrapper.

## Output format

```json
{
  "meta": { "state": "Goa", "election_slug": "goa2022", "year": 2022,
            "house": "assembly", "candidate_count": 267,
            "scraped_at": "2026-...", "source_url": "https://www.myneta.info/goa2022/" },
  "candidates": [{
    "myneta_id": 157, "name": "Pramod Sawant", "constituency": "SANQUELIM",
    "party": "BJP", "age": 48, "education": "Post Graduate",
    "criminal_cases": 0, "serious_criminal_cases": 0,
    "total_assets": 94000000, "total_liabilities": 1501407,
    "movable_assets": 50000000, "immovable_assets": 44000000,
    "is_winner": true,
    "cases": []
  }]
}
```

All rupee amounts are whole integers (INR). `cases[]` structure per entry:

```json
{ "sections": ["302", "506"], "other_acts": "Section 4 of POCSO Act",
  "court": "Sessions Court", "fir_no": "...", "case_no": "...",
  "charges_framed": true, "status": "pending", "punishment": null, "serious": true }
```

`status` is `"pending"` or `"convicted"`. Fields are `null` when not stated on the affidavit.

## Cache

`.cache/` holds SHA1-keyed HTML files. Rate-limited responses (200 with wrong body) are auto-detected and never cached. Re-runs are fast and make zero live requests.

## CLI flags

```bash
python -m myneta_pipeline --state Goa --year 2022 --out output/goa2022.json
python -m myneta_pipeline --state Goa --list               # list available elections
python -m myneta_pipeline --summary-only                   # skip detail pages (faster)
python -m myneta_pipeline --limit 10                       # first N candidates (testing)
python -m myneta_pipeline --no-cache                       # force live requests
python -m myneta_pipeline --delay 2.0                      # seconds between requests
python -m myneta_pipeline --discover                       # watcher mode (see below)
```

## Wayback mode (no rate limits, works from any country)

If an election is archived on web.archive.org, scrape the archive instead of the
live site — sidesteps MyNeta's rate limiting entirely:

```bash
python -m myneta_pipeline.wayback --election Bihar2025 --state Bihar --year 2025 \
    --out output/bihar2025.json
```

How it works: queries Wayback's CDX API for every archived `candidate.php` page
under the election slug, fetches each with the `id_` URL suffix (returns original
HTML, no archive toolbar), reuses the normal parsers. Winner + serious-crime flags
come from archived summary pages. Bihar2025 is fully archived (all 2,600
candidates, crawled Nov 2025). Check coverage for other elections first:

```bash
curl "http://web.archive.org/cdx/search/cdx?url=myneta.info/<slug>/candidate.php*&output=text&collapse=urlkey&filter=statuscode:200" | grep -cv print=true
```

## --discover (watcher mode)

Enumerates every election MyNeta exposes and diffs against `output/*.json` slugs. Prints:
- **NEW DATA AVAILABLE** — states where the latest election isn't in `output/` yet, with a ready-to-run scrape command
- **UPCOMING (predicted)** — next election forecast per state (~5yr assembly term); highlights states due now or within a year

Designed to run monthly (cron / GitHub Action).

## Pincode maps (`pincode_map.py`)

Generates `src/data/<state>/pincodes.json` (pincode → 1–3 constituency ids,
dominant first) for **every wired state at once**, plus the
`src/data/pincode-index.json` prefix index the app uses to pick a chunk.

```
python pincode_map.py
```

Fully turnkey — no manual steps, no per-state edits:
1. Downloads its own geodata on first run (ECI assembly-constituency polygons
   from DataMeet + the 19,928-polygon national pincode boundary shapefile) into
   `geodata/` (gitignored). Needs `brew install sevenzip` once — macOS `unzip`
   corrupts the multi-part pincode archive.
2. Joins pincode polygons against constituency polygons by **area overlap**:
   ACs covering ≥15% of a pincode are kept (max 3, dominant first). Do NOT
   swap this for point-based sources: GeoNames postal centroids give all of a
   city's pincodes one coarse shared point (all 106 Bengaluru pincodes landed
   in Devanahalli).
3. Matches shapefile AC names to app constituency ids: exact slug →
   hyphen-collapsed → fuzzy only when the best candidate wins by a clear
   margin. Unmatched names are dropped, never guessed.
4. Every Indian state is pre-registered — a state with no `src/data/` dir yet
   is skipped, and starts emitting automatically once its affidavit JSON is
   wired. **After wiring any new state, just re-run this script** and commit
   the new/changed `pincodes.json` files.
