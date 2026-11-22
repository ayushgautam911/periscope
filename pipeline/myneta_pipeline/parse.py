"""HTML -> structured fields. Tolerant by design: MyNeta markup is inconsistent
across elections, so we parse defensively and return None when unsure rather
than guess.
"""

from __future__ import annotations

import re

from bs4 import BeautifulSoup

from .models import Candidate
from .serious import classify_case

# Education categories MyNeta uses, longest first so "Graduate Professional"
# matches before "Graduate".
EDU_CATEGORIES = [
    "Graduate Professional",
    "Post Graduate",
    "Doctorate",
    "Graduate",
    "12th Pass",
    "10th Pass",
    "8th Pass",
    "5th Pass",
    "Literate",
    "Illiterate",
    "Others",
]

_CANDIDATE_ID = re.compile(r"candidate_id=(\d+)")
# A section token like "376", "506", "304B" (ignoring any "(ii)" sub-clause).
_SECTION_TOKEN = re.compile(r"\b(\d{2,4}[A-Z]?)\b")


def clean(text: str | None) -> str | None:
    if text is None:
        return None
    out = re.sub(r"\s+", " ", text).strip()
    return out or None


def parse_rupees(text: str | None) -> int | None:
    """'Rs 9,40,00,000 ~ 9 Crore+' -> 94000000 ; 'Nil' -> 0 ; unknown -> None."""
    if not text:
        return None
    m = re.search(r"Rs[\s.]*([\d,]+)", text)
    if m:
        digits = m.group(1).replace(",", "")
        return int(digits) if digits.isdigit() else None
    if re.search(r"\bnil\b|\bnone\b|^0$", text.strip(), re.I):
        return 0
    return None


def parse_int(text: str | None) -> int | None:
    if not text:
        return None
    m = re.search(r"\d+", text)
    return int(m.group(0)) if m else 0


def _match_education(text: str | None) -> str | None:
    if not text:
        return None
    for cat in EDU_CATEGORIES:
        if cat.lower() in text.lower():
            return cat
    return None


def parse_listing(html: str, base_url: str) -> list[Candidate]:
    """Parse a candidate-listing table (e.g. 'candidates_analyzed') into records."""
    soup = BeautifulSoup(html, "html.parser")
    first = soup.find("a", href=_CANDIDATE_ID)
    if not first:
        return []
    table = first.find_parent("table")
    if table is None:
        return []

    rows = table.find_all("tr")
    headers = [clean(c.get_text(" ")) or "" for c in rows[0].find_all(["th", "td"])]

    def col(*keys: str) -> int | None:
        for i, h in enumerate(headers):
            low = h.lower()
            if any(k in low for k in keys):
                return i
        return None

    ci_const = col("constituency")
    ci_party = col("party")
    ci_crim = col("criminal")
    ci_edu = col("education")
    ci_assets = col("total assets", "assets")
    ci_liab = col("liabilities")

    candidates: list[Candidate] = []
    for tr in rows[1:]:
        link = tr.find("a", href=_CANDIDATE_ID)
        if not link:
            continue
        cid = int(_CANDIDATE_ID.search(link["href"]).group(1))
        cells = tr.find_all("td")

        def cell(idx: int | None) -> str | None:
            if idx is None or idx >= len(cells):
                return None
            return clean(cells[idx].get_text(" "))

        candidates.append(
            Candidate(
                myneta_id=cid,
                name=clean(link.get_text()) or f"candidate-{cid}",
                constituency=cell(ci_const),
                party=cell(ci_party),
                criminal_cases=parse_int(cell(ci_crim)),
                education=_match_education(cell(ci_edu)) or cell(ci_edu),
                total_assets=parse_rupees(cell(ci_assets)),
                total_liabilities=parse_rupees(cell(ci_liab)),
                source_url=f"{base_url}candidate.php?candidate_id={cid}",
            )
        )
    return candidates


def parse_candidate_ids(html: str) -> set[int]:
    """All candidate ids linked anywhere on a page (winners/serious listings)."""
    return {int(m) for m in _CANDIDATE_ID.findall(html)}


_PAGE_NUM = re.compile(r"[?&]page=(\d+)")


def parse_last_page(html: str) -> int:
    """Highest page number referenced by the pager (the 'Last' link), or 1."""
    nums = [int(n) for n in _PAGE_NUM.findall(html)]
    return max(nums) if nums else 1


def _yes_no(text: str | None) -> bool | None:
    if not text:
        return None
    low = text.lower()
    if low.startswith("yes"):
        return True
    if low.startswith("no"):
        return False
    return None


def parse_criminal_cases(soup: BeautifulSoup) -> list[dict]:
    """The candidate's actual criminal cases from the detail page 'cases' table(s).

    Each row is one case. We capture the full record — IPC sections, other acts
    (e.g. POCSO / IT Act), court, FIR & case numbers, whether charges are framed
    and when — so the dashboard can show exactly which cases exist, not just a
    count. `serious` is per-case (IPC-based); the candidate-level serious flag is
    ADR's authoritative one (see phases.py).
    """
    cases: list[dict] = []
    for table in soup.find_all(id="cases"):
        rows = table.find_all("tr")
        if not rows:
            continue
        headers = [(clean(c.get_text(" ")) or "").lower() for c in rows[0].find_all(["th", "td"])]

        def col(*keys: str, exclude: tuple[str, ...] = ()) -> int | None:
            for i, h in enumerate(headers):
                if any(k in h for k in keys) and not any(x in h for x in exclude):
                    return i
            return None

        ipc_idx = col("ipc")
        if ipc_idx is None:
            continue
        other_idx = col("other")
        court_idx = col("court")
        fir_idx = col("fir")
        caseno_idx = col("case no", "case number")
        framed_idx = col("charges framed", exclude=("date",))
        date_idx = col("date")
        punishment_idx = col("punishment")
        convicted = any("punishment" in h or "convicted" in h for h in headers)

        for tr in rows[1:]:
            cells = tr.find_all(["td", "th"])

            def cell(idx: int | None) -> str | None:
                if idx is None or idx >= len(cells):
                    return None
                return clean(cells[idx].get_text(" "))

            sections = _SECTION_TOKEN.findall(cell(ipc_idx) or "")
            other_acts = cell(other_idx)
            if not sections and not other_acts:
                continue  # "No Cases" / empty row

            cases.append(
                {
                    "sections": sections,
                    "other_acts": other_acts,
                    "court": cell(court_idx),
                    "fir_no": cell(fir_idx),
                    "case_no": cell(caseno_idx),
                    "charges_framed": _yes_no(cell(framed_idx)),
                    "charges_framed_date": cell(date_idx),
                    "status": "convicted" if convicted else "pending",
                    "punishment": cell(punishment_idx) if convicted else None,
                    "serious": classify_case(sections),
                }
            )
    return cases


def enrich_from_detail(candidate: Candidate, html: str) -> None:
    """Enrich a candidate from its detail page (mutates in place)."""
    soup = BeautifulSoup(html, "html.parser")
    text = clean(soup.get_text(" ")) or ""

    m = re.search(r"\bAge\s*:?\s*(\d{1,3})\b", text)
    if m:
        candidate.age = int(m.group(1))

    m = re.search(r"Self Profession\s*:?\s*(.+?)\s*(?:Spouse Profession|Education|$)", text)
    if m:
        prof = clean(m.group(1))
        if prof and not re.fullmatch(r"(not given|nil|-+)", prof, re.I):
            candidate.profession = prof

    m = re.search(r"Category\s*:?\s*(.+?)(?:\s{2,}|$)", text)
    edu = _match_education(m.group(1) if m else None) or _match_education(text)
    if edu:
        candidate.education = edu

    # Fill asset/liability totals from the detail summary if the listing missed them.
    if candidate.total_assets is None:
        m = re.search(r"\bAssets\s*:?\s*Rs[\s.]*([\d,]+)", text)
        if m:
            candidate.total_assets = int(m.group(1).replace(",", ""))
    if candidate.total_liabilities is None:
        m = re.search(r"\bLiabilities\s*:?\s*Rs[\s.]*([\d,]+)", text)
        if m:
            candidate.total_liabilities = int(m.group(1).replace(",", ""))

    candidate.movable_assets = _asset_table_total(soup, "movable_assets")
    candidate.immovable_assets = _asset_table_total(soup, "immovable_assets")

    cases = parse_criminal_cases(soup)
    if cases:
        candidate.cases = cases
        candidate.ipc_sections = sorted({s for c in cases for s in c["sections"]})
        candidate.serious_criminal_cases = sum(1 for c in cases if c["serious"])


def _asset_table_total(soup: BeautifulSoup, table_id: str) -> int | None:
    table = soup.find("table", id=table_id)
    if table is None:
        return None
    amounts = re.findall(r"Rs[\s.]*([\d,]+)", table.get_text(" "))
    if not amounts:
        return None
    digits = amounts[-1].replace(",", "")
    return int(digits) if digits.isdigit() else None
