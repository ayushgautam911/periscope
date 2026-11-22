"""Write pipeline output to JSON (same schema as MyNeta pipeline)."""

from __future__ import annotations

import json
from pathlib import Path

from .models import EciCandidate


def to_affidavit_dict(c: EciCandidate) -> dict:
    """Convert to the flat JSON schema used in affidavits.*.json."""
    d: dict = {
        "name": c.name,
        "constituency": c.constituency.upper(),
        "party": c.party,
    }
    if c.age is not None:
        try:
            d["age"] = int(c.age)
        except (ValueError, TypeError):
            d["age"] = c.age
    if c.education:
        d["education"] = c.education
    if c.criminal_cases is not None:
        d["criminal_cases"] = c.criminal_cases
    if c.serious_criminal_cases is not None:
        d["serious_criminal_cases"] = c.serious_criminal_cases
    if c.cases:
        d["cases"] = c.cases
    if c.total_assets is not None:
        d["total_assets"] = c.total_assets
    if c.total_liabilities is not None:
        d["total_liabilities"] = c.total_liabilities
    if c.movable_assets is not None:
        d["movable_assets"] = c.movable_assets
    if c.immovable_assets is not None:
        d["immovable_assets"] = c.immovable_assets
    if c.is_winner:
        d["is_winner"] = True
    # Provenance
    d["source"] = "affidavit.eci.gov.in"
    d["profile_url"] = c.profile_url
    if c.affidavit_pdf_url:
        d["affidavit_pdf_url"] = c.affidavit_pdf_url
    return d


def write_json(candidates: list[EciCandidate], out_path: Path) -> None:
    records = [to_affidavit_dict(c) for c in candidates]
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(records, indent=2, ensure_ascii=False))
    print(f"Wrote {len(records)} candidates to {out_path}")
