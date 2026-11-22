"""Command-line entrypoint: state -> flat JSON of candidate affidavit data."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .client import PoliteClient
from .phases import RunOptions, run_pipeline
from .resolve import list_state_elections, resolve
from .writer import write_json

PIPELINE_DIR = Path(__file__).resolve().parent.parent


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="myneta_pipeline",
        description="Scrape MyNeta candidate affidavit data for a state into a flat JSON file.",
    )
    p.add_argument("--state", help="State name, e.g. 'Goa', 'Uttar Pradesh'.")
    p.add_argument("--year", type=int, help="Election year (default: latest available).")
    p.add_argument("--house", default="assembly", choices=["assembly", "loksabha"])
    p.add_argument("--election", help="MyNeta slug override, e.g. 'goa2022' (skips resolution).")
    p.add_argument("--out", type=Path, help="Output JSON path (default: output/<slug>.json).")
    p.add_argument("--delay", type=float, default=1.2, help="Seconds between live requests.")
    p.add_argument("--summary-only", action="store_true", help="Skip per-candidate detail pages.")
    p.add_argument("--limit", type=int, help="Only process the first N candidates (testing).")
    p.add_argument("--no-cache", action="store_true", help="Disable the on-disk response cache.")
    p.add_argument("--list", action="store_true", help="List elections for --state and exit.")
    p.add_argument(
        "--discover",
        action="store_true",
        help="Auto-mode watcher: list new & upcoming elections across all states, then exit.",
    )
    return p


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)

    client = PoliteClient(
        delay=args.delay,
        cache_dir=PIPELINE_DIR / ".cache",
        use_cache=not args.no_cache,
    )

    if args.discover:
        from datetime import date

        from .discover import run_discover

        run_discover(client, PIPELINE_DIR / "output", date.today().year, log)
        return 0

    if args.list:
        if not args.state:
            log("--list requires --state")
            return 2
        for e in list_state_elections(client, args.state, args.house):
            print(f"{e.year}\t{e.slug}\t{e.url}")
        return 0

    if args.election:
        from .models import Election

        year = args.year or 0
        election = Election(args.election, args.state or args.election, year, args.house)
    elif args.state:
        election = resolve(client, args.state, args.year, args.house)
    else:
        log("Provide --state NAME (or --election SLUG). See --help.")
        return 2

    log(f"[Phase 0] Resolve election: {election.slug} ({election.state} {election.year}, {election.house})")
    candidates = run_pipeline(
        client,
        election,
        RunOptions(summary_only=args.summary_only, limit=args.limit),
        log,
    )

    out = args.out or (PIPELINE_DIR / "output" / f"{election.slug}.json")
    log(f"[Phase 5/5] Load -> {out}")
    write_json(out, election, candidates)
    log(
        f"Wrote {len(candidates)} candidates to {out}  "
        f"(live requests: {client.live_requests}, cache hits: {client.cache_hits})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
