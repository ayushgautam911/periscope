"""Parse Form 26 affidavit PDFs (eSuvidha era, machine-readable text).

eSuvidha-generated Form 26 PDFs are text-based (not scanned images), so
pdfminer can extract the text directly. The form has fixed section structure
which this parser targets.

Form 26 section layout (ECI standardised template):
    Section 1:  Candidate and constituency details
    Section 2:  PAN, Aadhaar
    Section 3:  Criminal cases
        3A: Cases where cognizance has been taken (pending)
        3B: Cases where the candidate has been convicted
    Section 4:  Assets
        Movable: cash, bank, bonds/shares, NSS, LIC, personal loans, vehicles, jewellery, other
        Immovable: agricultural land, non-agricultural land, commercial buildings, residential
    Section 5:  Liabilities
    Section 6:  Education qualification
    Section 7:  Other disclosures (PAN, income tax)

TODO: implement full parser. Stubs below show the expected output shape.
"""

from __future__ import annotations

import re


def parse_form26(pdf_text: str) -> dict:
    """Parse extracted text from a Form 26 PDF.

    Returns a dict with keys matching EciCandidate fields:
        criminal_cases, serious_criminal_cases, cases,
        education, total_assets, total_liabilities,
        movable_assets, immovable_assets
    """
    result: dict = {
        "criminal_cases": None,
        "serious_criminal_cases": None,
        "cases": [],
        "education": None,
        "total_assets": None,
        "total_liabilities": None,
        "movable_assets": None,
        "immovable_assets": None,
    }

    # Section 3A — pending criminal cases
    result["cases"] = _parse_criminal_cases(pdf_text)
    result["criminal_cases"] = len(result["cases"])
    result["serious_criminal_cases"] = sum(
        1 for c in result["cases"] if c.get("serious")
    )

    # Section 4 — assets
    result["movable_assets"] = _parse_total_movable(pdf_text)
    result["immovable_assets"] = _parse_total_immovable(pdf_text)
    if result["movable_assets"] and result["immovable_assets"]:
        result["total_assets"] = result["movable_assets"] + result["immovable_assets"]

    # Section 5 — liabilities
    result["total_liabilities"] = _parse_total_liabilities(pdf_text)

    # Section 6 — education
    result["education"] = _parse_education(pdf_text)

    return result


# ── Section parsers (stubs — implement per-field regexes here) ─────────────────

_RUPEE_RE = re.compile(r"Rs\.?\s*([\d,]+)")


def _parse_rupees(text: str) -> int | None:
    m = _RUPEE_RE.search(text)
    if not m:
        return None
    try:
        return int(m.group(1).replace(",", ""))
    except ValueError:
        return None


def _parse_criminal_cases(pdf_text: str) -> list[dict]:
    """Extract individual criminal cases from Section 3.

    TODO: implement. The Form 26 lists cases in a table with columns:
    - Serial No
    - IPC sections / other acts
    - Whether case is serious per RPA 8(1)
    - Court name
    - FIR No.
    - Case No. / CNR No.
    - Date of cognizance
    - Date of framing charges
    - Pending status

    Returns list of dicts matching the `cases` field in EciCandidate.
    """
    # Placeholder — returns empty until the regex parser is written
    return []


def _parse_total_movable(pdf_text: str) -> int | None:
    """Extract gross total movable assets from Section 4(A)."""
    # Look for "Total Movable Assets" line
    m = re.search(
        r"(?:Total\s+)?(?:Value\s+of\s+)?Movable\s+Assets[^\n]*\n[^\n]*Rs\.?\s*([\d,]+)",
        pdf_text, re.IGNORECASE
    )
    if m:
        try:
            return int(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def _parse_total_immovable(pdf_text: str) -> int | None:
    """Extract total immovable assets from Section 4(B)."""
    m = re.search(
        r"(?:Total\s+)?(?:Value\s+of\s+)?Immovable\s+Assets[^\n]*\n[^\n]*Rs\.?\s*([\d,]+)",
        pdf_text, re.IGNORECASE
    )
    if m:
        try:
            return int(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def _parse_total_liabilities(pdf_text: str) -> int | None:
    """Extract grand total liabilities from Section 5."""
    m = re.search(
        r"(?:Grand\s+)?Total\s+(?:of\s+all\s+)?Liabilities[^\n]*\n[^\n]*Rs\.?\s*([\d,]+)",
        pdf_text, re.IGNORECASE
    )
    if m:
        try:
            return int(m.group(1).replace(",", ""))
        except ValueError:
            pass
    return None


def _parse_education(pdf_text: str) -> str | None:
    """Extract education qualification from Section 6."""
    m = re.search(
        r"(?:Educational\s+)?Qualification\s*[:\-]?\s*([^\n]+)",
        pdf_text, re.IGNORECASE
    )
    if m:
        return m.group(1).strip()
    return None


def extract_text(pdf_path: str) -> str:
    """Extract text from a Form 26 PDF using pdfminer.six."""
    try:
        from pdfminer.high_level import extract_text as _extract
        return _extract(pdf_path)
    except ImportError:
        raise ImportError(
            "pdfminer.six is required for PDF parsing. "
            "Install it: pip install pdfminer.six"
        )
