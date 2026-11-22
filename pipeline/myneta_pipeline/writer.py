"""Write the flat JSON output file."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from .models import Candidate, Election


def write_json(path: Path, election: Election, candidates: list[Candidate]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "meta": {
            "state": election.state,
            "election_slug": election.slug,
            "year": election.year,
            "house": election.house,
            "candidate_count": len(candidates),
            "scraped_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source": "ADR / myneta.info",
            "source_url": election.url,
            "note": (
                "Affidavit data compiled by ADR from ECI Form 26 filings. "
                "Local research copy; not for redistribution without ADR consent."
            ),
        },
        "candidates": [c.to_dict() for c in candidates],
    }
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
