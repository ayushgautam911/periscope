"""Discover available & upcoming elections — the auto-mode 'watcher'.

Designed to run on a schedule (e.g. monthly cron / GitHub Action). Two layers:

  TRIGGER  — enumerate every election MyNeta currently exposes and diff against
             what we've already ingested (output/*.json). A NEW latest-election
             slug for a state means its affidavit data just went live (MyNeta
             posts ~5-7 days before polling) → that's the signal to scrape it.

  FORECAST — from the most recent election year per state, predict the next one
             (assembly terms run ~5 years) → an "upcoming" calendar. The watcher
             can use this to escalate from monthly to daily checks as a state's
             window approaches.

Both layers rely only on MyNeta (no extra source), so the watcher is
self-contained. ECI press releases / Wikipedia "Next <State> election" pages can
later refine FORECAST with exact announced dates.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from urllib.parse import unquote

from bs4 import BeautifulSoup

from . import BASE_URL
from .client import PoliteClient
from .models import Election
from .resolve import list_state_elections

ASSEMBLY_TERM_YEARS = 5
_STATE_HREF = re.compile(r"state_assembly\.php\?state=([^&\"'#]+)")


def list_states(client: PoliteClient) -> list[str]:
    """State names MyNeta links from its homepage."""
    soup = BeautifulSoup(client.get(f"{BASE_URL}/"), "html.parser")
    states: list[str] = []
    for a in soup.find_all("a", href=True):
        m = _STATE_HREF.search(a["href"])
        if m:
            state = unquote(m.group(1)).strip()
            if state and state not in states:
                states.append(state)
    return states


def discover_all(client: PoliteClient, log) -> dict[str, list[Election]]:
    """Every assembly election MyNeta lists, grouped by state (newest first)."""
    elections: dict[str, list[Election]] = {}
    for state in list_states(client):
        elections[state] = list_state_elections(client, state)
        log(f"  {state}: {', '.join(e.slug for e in elections[state]) or '(none)'}")
    return elections


def ingested_slugs(out_dir: Path) -> set[str]:
    """Election slugs we've already scraped (from output/*.json)."""
    slugs: set[str] = set()
    for path in out_dir.glob("*.json"):
        try:
            slugs.add(json.loads(path.read_text())["meta"]["election_slug"])
        except (KeyError, ValueError):
            continue
    return slugs


def new_elections(
    elections: dict[str, list[Election]], ingested: set[str]
) -> list[Election]:
    """Latest election per state whose data we haven't ingested yet."""
    new: list[Election] = []
    for state_elections in elections.values():
        if state_elections and state_elections[0].slug not in ingested:
            new.append(state_elections[0])
    return sorted(new, key=lambda e: e.year, reverse=True)


def forecast(
    elections: dict[str, list[Election]], current_year: int
) -> list[tuple[str, int, int]]:
    """(state, latest_year, predicted_next_year), soonest first."""
    rows = [
        (state, e[0].year, e[0].year + ASSEMBLY_TERM_YEARS)
        for state, e in elections.items()
        if e
    ]
    return sorted(rows, key=lambda r: r[2])


def run_discover(client: PoliteClient, out_dir: Path, current_year: int, log) -> None:
    log("[discover] enumerating elections MyNeta exposes...")
    elections = discover_all(client, log)
    ingested = ingested_slugs(out_dir)

    print("\n=== NEW DATA AVAILABLE (scrape these) ===")
    new = new_elections(elections, ingested)
    if new:
        for e in new:
            print(f"  {e.state:18} {e.slug:16} ({e.year})   ->  python -m myneta_pipeline --election {e.slug} --state \"{e.state}\"")
    else:
        print("  (nothing new — all latest elections already ingested)")

    print("\n=== UPCOMING (predicted, ~5yr term) ===")
    for state, latest, nxt in forecast(elections, current_year):
        if nxt <= current_year + 1:
            status = "DUE NOW" if nxt <= current_year else f"~{nxt}"
            print(f"  {state:18} last {latest}  ->  next {status}")
