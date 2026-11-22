"""Scrape a MyNeta election from the Wayback Machine instead of the live site.

Some elections are fully archived on web.archive.org (e.g. Bihar2025: all 2,600
candidate detail pages were crawled in Nov 2025). Fetching from the archive
avoids MyNeta's aggressive rate limiting entirely and works from any country.

The `id_` timestamp suffix asks Wayback for the original page body with no
archive toolbar injected, so the normal MyNeta parsers work unchanged.

Usage:
    python -m myneta_pipeline.wayback --election Bihar2025 --state Bihar \
        --year 2025 --out output/bihar2025.json
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

from .client import PoliteClient
from .models import Candidate, Election
from .parse import clean, enrich_from_detail, parse_candidate_ids
from .writer import write_json

PIPELINE_DIR = Path(__file__).resolve().parent.parent
CDX_API = "http://web.archive.org/cdx/search/cdx"
_CANDIDATE_ID = re.compile(r"candidate_id=(\d+)")
_TITLE = re.compile(r"<title>(.*?)</title>", re.S | re.I)


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def wayback_url(timestamp: str, original: str) -> str:
    return f"https://web.archive.org/web/{timestamp}id_/{original}"


# A far-future timestamp: Wayback resolves it to the NEWEST capture of a URL.
# Older MyNeta captures (e.g. Kerala2021 from Dec 2021) predate the current
# "id=cases" table markup our parser needs and later data-entry of case detail,
# so we always replay the most recent snapshot.
NEWEST = "29991231000000"


def cdx_snapshots(client: PoliteClient, slug: str, path_glob: str) -> list[tuple[str, str]]:
    """(timestamp, original_url) for archived HTTP-200 pages under the slug.

    Collapsed to one row per URL to keep the CDX response small (the full,
    un-collapsed index is large enough that Wayback sometimes returns a corrupt
    gzip). The timestamp is only used to confirm a capture exists; fetches use
    the `NEWEST` sentinel so the replayed page is the latest capture.
    """
    url = (
        f"{CDX_API}?url=myneta.info/{slug}/{path_glob}"
        "&output=json&collapse=urlkey&filter=statuscode:200"
    )
    body = client.get(url, cache=False)
    rows = json.loads(body) if body.strip() else []
    return [(r[1], r[2]) for r in rows[1:]]  # row 0 is the header


def _split_head(head: str) -> tuple[str | None, str | None]:
    """'Name(Party)' -> (name, party) where party is the first trailing paren
    group (scanning "(" positions left to right) whose parentheses balance.
    Handles nicknames — 'Sawney(Sabby)(AAP)' -> ('Sawney(Sabby)', 'AAP') — and
    nested party names — 'Chand(Communist Party of India (Marxist)(CPI(M)))'
    -> ('Chand', 'Communist Party of India (Marxist)(CPI(M))')."""
    i = head.find("(")
    while i != -1:
        inner = head[i + 1 :].rstrip()
        if inner.endswith(")"):
            inner = inner[:-1]
            depth = 0
            for ch in inner:
                if ch == "(":
                    depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth < 0:
                        break
            if depth == 0 and inner:
                return clean(head[:i]), clean(inner)
        i = head.find("(", i + 1)
    return clean(head), None


def parse_header(
    html: str,
) -> tuple[str | None, str | None, str | None, str | None]:
    """(name, party, constituency, district) from the detail page <title>.

    District matters: some states have two constituencies with the same name
    in different districts (Bihar: Kalyanpur, Pipra) — the caller appends the
    district to disambiguate those.
    """
    m = _TITLE.search(html)
    if not m:
        return None, None, None, None
    title = clean(m.group(1)) or ""
    head, _, rest = title.partition(":Constituency-")
    if not rest:
        return None, None, None, None
    name, party = _split_head(head)
    seat = rest.split(" - ")[0]
    groups = re.findall(r"\(([^)]*)\)", seat)
    district = clean(groups[-1]) if groups else None
    base = clean(seat.split("(")[0]) or ""
    # A paren group right after the base name can be a real part of the seat's
    # identity, not just a reservation tag or the district — e.g. Maharashtra
    # splits several cities into "AURANGABAD (CENTRAL)", "AURANGABAD (WEST)",
    # "MALEGAON (CENTRAL)", "MALEGAON (OUTER)". Dropping it silently merges
    # genuinely distinct seats into one (they'd collapse to plain "AURANGABAD"
    # and both claim a winner). Keep it unless it's the district itself or a
    # reservation tag (SC/ST).
    qualifier = clean(groups[0]) if groups else None
    if (
        qualifier
        and qualifier != district
        and not re.fullmatch(r"SC|ST", qualifier, re.I)
    ):
        constituency = f"{base} {qualifier}"
    else:
        constituency = base
    # "BYE ELECTION" can appear after a reservation tag, e.g.
    # "BAGESHWAR (SC) : BYE ELECTION ON ..." — splitting on the first "("
    # would silently drop the marker and let a bye-election candidate leak
    # into the general-election roster. Re-attach it if the full seat text
    # has it but the truncated constituency string lost it.
    if "BYE ELECTION" in seat.upper() and constituency and "BYE" not in constituency.upper():
        constituency = f"{constituency} : BYE ELECTION"
    return name, party, constituency, district


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="myneta_pipeline.wayback", description=__doc__)
    ap.add_argument("--election", required=True, help="MyNeta slug, e.g. 'Bihar2025'.")
    ap.add_argument("--state", required=True)
    ap.add_argument("--year", type=int, required=True)
    ap.add_argument("--house", default="assembly", choices=["assembly", "loksabha"])
    ap.add_argument("--out", type=Path)
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--limit", type=int, help="Only process the first N candidates (testing).")
    args = ap.parse_args(argv)

    # Unlike MyNeta, Wayback doesn't soft-block: a bad snapshot never heals, so
    # skip it after seconds (not MyNeta's 90s heal-time cooldown).
    client = PoliteClient(
        delay=args.delay,
        cache_dir=PIPELINE_DIR / ".cache",
        max_retries=2,
        block_cooldown=3.0,
    )
    election = Election(args.election, args.state, args.year, args.house)

    log(f"[1/4] CDX: archived candidate pages for {args.election}")
    # One URL per candidate (query-param variants collapse to the same id).
    by_cid: dict[int, str] = {}
    for _ts, u in cdx_snapshots(client, args.election, "candidate.php*"):
        if "print=true" in u:
            continue
        m = _CANDIDATE_ID.search(u)
        if m:
            by_cid.setdefault(int(m.group(1)), u)
    snaps = list(by_cid.items())
    log(f"  {len(snaps)} candidate snapshots")
    if args.limit:
        snaps = snaps[: args.limit]

    log("[2/4] Winner + serious-crime flags from archived summary pages")
    winner_ids: set[int] = set()
    serious_ids: set[int] = set()
    for ts, u in cdx_snapshots(client, args.election, "index.php*"):
        try:
            if "show_winners" in u:
                winner_ids |= parse_candidate_ids(client.get(wayback_url(ts, u)))
            elif "serious_crime" in u and "winner" not in u:
                serious_ids |= parse_candidate_ids(client.get(wayback_url(ts, u)))
        except RuntimeError:
            continue  # a summary snapshot that won't load costs us flags, not data
    log(f"  winners={len(winner_ids)}  serious-flagged={len(serious_ids)}")

    log("[3/4] Fetch + parse candidate pages")
    candidates: list[Candidate] = []
    districts: list[str | None] = []
    failed = 0
    for i, (cid, u) in enumerate(snaps, 1):
        try:
            html = client.get(
                wayback_url(NEWEST, u), valid=lambda h: "Constituency" in h
            )
        except RuntimeError:
            failed += 1
            log(f"  ! failed candidate_id={cid}")
            continue
        name, party, constituency, district = parse_header(html)
        c = Candidate(
            myneta_id=cid,
            name=name or f"candidate-{cid}",
            constituency=constituency,
            party=party,
            source_url=u,
        )
        enrich_from_detail(c, html)
        c.criminal_cases = len(c.cases)
        if c.serious_criminal_cases is None:
            c.serious_criminal_cases = 0
        c.is_winner = cid in winner_ids
        c.has_serious_cases = cid in serious_ids or any(x["serious"] for x in c.cases)
        candidates.append(c)
        districts.append(district)
        if i % 100 == 0 or i == len(snaps):
            log(f"  {i}/{len(snaps)} parsed (failed: {failed})")

    # Same constituency name in two districts (e.g. Bihar's two Kalyanpurs):
    # append the district so the seats stay distinct.
    district_sets: dict[str, set[str]] = {}
    for c, d in zip(candidates, districts):
        if c.constituency and d:
            district_sets.setdefault(c.constituency, set()).add(d)
    renamed = 0
    for c, d in zip(candidates, districts):
        if c.constituency and d and len(district_sets.get(c.constituency, set())) > 1:
            c.constituency = f"{c.constituency} ({d})"
            renamed += 1
    if renamed:
        log(f"  disambiguated {renamed} candidates across duplicate seat names")

    candidates.sort(key=lambda c: (c.constituency or "", c.name))
    out = args.out or (PIPELINE_DIR / "output" / f"{args.election}.json")
    log(f"[4/4] Write -> {out}")
    write_json(out, election, candidates)
    log(
        f"Wrote {len(candidates)} candidates to {out}  "
        f"(live requests: {client.live_requests}, cache hits: {client.cache_hits})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
