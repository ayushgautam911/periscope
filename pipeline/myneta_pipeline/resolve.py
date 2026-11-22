"""Resolve a human state name to a MyNeta election slug (e.g. Goa -> goa2022).

MyNeta lists a state's assembly elections at
`state_assembly.php?state=<State>`; we read the slugs from that page. A
slug-guessing fallback covers the case where parsing finds nothing.
"""

from __future__ import annotations

import re
from urllib.parse import quote

from bs4 import BeautifulSoup

from . import BASE_URL
from .client import PoliteClient
from .models import Election

_YEAR = re.compile(r"(?:19|20)\d{2}")
# First path segment of a MyNeta or root-relative URL: '/goa2022/index.php' -> goa2022
_SLUG_IN_HREF = re.compile(
    r"^(?:https?://(?:www\.)?myneta\.info)?/?([A-Za-z][A-Za-z0-9_]*)/"
)
_NON_ELECTION_SLUGS = {"state_assembly", "index", "www", "data", "img", "images"}


def _state_prefix(state: str) -> str:
    return re.sub(r"[^a-z]", "", state.lower())


def list_state_elections(client: PoliteClient, state: str, house: str = "assembly") -> list[Election]:
    """All assembly elections MyNeta lists for a state, newest first."""
    url = f"{BASE_URL}/state_assembly.php?state={quote(state)}"
    soup = BeautifulSoup(client.get(url), "html.parser")

    found: dict[str, int] = {}
    for a in soup.find_all("a", href=True):
        m = _SLUG_IN_HREF.search(a["href"])
        if not m:
            continue
        slug = m.group(1)
        if slug.lower() in _NON_ELECTION_SLUGS:
            continue
        ym = _YEAR.search(slug) or _YEAR.search(a.get_text() or "")
        if not ym:
            continue
        found.setdefault(slug, int(ym.group(0)))

    elections = [Election(slug, state, year, house) for slug, year in found.items()]
    prefix = _state_prefix(state)[:4]
    # Prefer slugs that actually start with the state name, then newest year.
    elections.sort(key=lambda e: (e.slug.lower().startswith(prefix), e.year), reverse=True)
    return elections


def resolve(
    client: PoliteClient,
    state: str,
    year: int | None = None,
    house: str = "assembly",
) -> Election:
    elections = list_state_elections(client, state, house)
    if year is not None:
        elections = [e for e in elections if e.year == year]
    if elections:
        return elections[0]

    # Fallback: guess the conventional slug and verify it resolves.
    if year is not None:
        guess = f"{_state_prefix(state)}{year}"
        try:
            client.get(f"{BASE_URL}/{guess}/")
            return Election(guess, state, year, house)
        except RuntimeError:
            pass

    raise SystemExit(
        f"Could not resolve a MyNeta election for state={state!r} year={year}. "
        f"Try --list to see what's available, or pass --election <slug> directly."
    )
