"""Low-level fetch helpers (one concern each). Orchestration lives in phases.py."""

from __future__ import annotations

from typing import Callable

from .client import PoliteClient
from .models import Candidate
from .parse import parse_candidate_ids, parse_last_page, parse_listing

Logger = Callable[[str], None]


def _listing_url(base: str, page: int = 1) -> str:
    url = f"{base}index.php?action=summary&subAction=candidates_analyzed&sort=candidate"
    return url if page == 1 else f"{url}&page={page}"


def _has_candidate_links(html: str) -> bool:
    """A real listing/summary page links at least one candidate. The rate-limit
    page returns HTTP 200 with no candidate links — this rejects it."""
    return bool(parse_candidate_ids(html))


def _listing_page(client: PoliteClient, base: str, page: int) -> list[Candidate]:
    """One listing page; the client retries/cools-down on rate-limit pages."""
    try:
        html = client.get(_listing_url(base, page), valid=_has_candidate_links)
    except RuntimeError:
        return []
    return parse_listing(html, base)


def scrape_listing(
    client: PoliteClient, base: str, log: Logger, max_pages: int = 2000
) -> list[Candidate]:
    """Every candidate from the 'candidates analyzed' listing.

    We read the LAST page number from the pager and fetch pages 1..last
    deterministically (with per-page retries), rather than guessing when to
    stop — MyNeta intermittently serves a link-less page, which previously
    tripped an early exit and silently truncated big states.
    """
    first_html = client.get(_listing_url(base, 1), valid=_has_candidate_links)
    last_page = min(parse_last_page(first_html), max_pages)
    log(f"  listing has {last_page} page(s)")

    by_id: dict[int, Candidate] = {}
    for c in parse_listing(first_html, base):
        by_id.setdefault(c.myneta_id, c)

    for page in range(2, last_page + 1):
        rows = _listing_page(client, base, page)
        if not rows:
            log(f"  ! page {page}/{last_page} returned no candidates after retries")
        for c in rows:
            by_id.setdefault(c.myneta_id, c)
        if page % 10 == 0 or page == last_page:
            log(f"  page {page}/{last_page}: total {len(by_id)}")
    return list(by_id.values())


def _summary_ids(client: PoliteClient, url: str) -> set[int]:
    """Candidate ids from a summary listing (winners / serious). The client
    retries+cools-down on the rate-limit variant; a genuinely empty listing
    returns an empty set after the retries are exhausted."""
    try:
        return parse_candidate_ids(client.get(url, valid=_has_candidate_links))
    except RuntimeError:
        return set()


def scrape_winner_ids(client: PoliteClient, base: str) -> set[int]:
    return _summary_ids(client, f"{base}index.php?action=show_winners&sort=default")


def scrape_serious_ids(client: PoliteClient, base: str) -> set[int]:
    """Candidates ADR flags as having >=1 serious criminal case (authoritative)."""
    return _summary_ids(
        client,
        f"{base}index.php?action=summary&subAction=serious_crime&sort=candidate",
    )
