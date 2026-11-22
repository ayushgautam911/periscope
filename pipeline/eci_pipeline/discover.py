"""Discover available elections from the ECI portal.

Elections are identified by season codes like "13-AC-GENERAL-3-23".
The elections.json file (from kaarana/AffidavitManagement) maps seasons
to individual election codes.

The ECI listing endpoint is:
    GET /CandidateCustomFilter?electionType={type}&election={no}&page=1

If page 1 returns candidates, the election is active and has data.
"""

from __future__ import annotations

import json
from pathlib import Path

from .models import ElectionRef

# Bundled snapshot of ECI election codes (accurate as of 2022-06).
# Source: https://github.com/kaarana/AffidavitManagement/blob/main/elections.json
# Update periodically or scrape dynamically from the portal.
ELECTIONS_JSON = Path(__file__).parent / "elections.json"


def load_elections(path: Path | None = None) -> list[ElectionRef]:
    """Load known elections from elections.json."""
    p = path or ELECTIONS_JSON
    if not p.exists():
        raise FileNotFoundError(
            f"elections.json not found at {p}. "
            "Download from https://github.com/kaarana/AffidavitManagement"
        )
    data = json.loads(p.read_text())
    refs: list[ElectionRef] = []
    for season in data:
        for code in season["elections"]:
            refs.append(
                ElectionRef.from_code(
                    code=code,
                    season=season["season"],
                    season_name=season["name"],
                )
            )
    return refs


def elections_for_season(season: str, path: Path | None = None) -> list[ElectionRef]:
    return [e for e in load_elections(path) if e.season == season]


def find_election(code: str, path: Path | None = None) -> ElectionRef | None:
    for e in load_elections(path):
        if e.code == code:
            return e
    return None
