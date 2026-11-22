"""ECI pipeline CLI.

Usage:
    python -m eci_pipeline --election 13-AC-GENERAL-3-23 --state Goa
    python -m eci_pipeline --election 13-AC-GENERAL-3-23   # all states in election
    python -m eci_pipeline --list-elections                 # show all known elections

NOTE: Requires India-based IP. The ECI portal blocks non-India IPs with HTTP 403.
      Deploy on AWS ap-south-1 (Mumbai) or any India VPS.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

OUT_DIR = Path(__file__).parent.parent / "output"
CACHE_DIR = Path(__file__).parent.parent / ".cache" / "eci"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Scrape ECI affidavit portal (affidavit.eci.gov.in). India IP required."
    )
    parser.add_argument("--election", help="Election code, e.g. 13-AC-GENERAL-3-23")
    parser.add_argument("--state", help="Filter by state name (optional)")
    parser.add_argument("--list-elections", action="store_true", help="List known elections")
    parser.add_argument("--no-cache", action="store_true", help="Bypass HTTP cache")
    parser.add_argument("--pdf-dir", default=None, help="Directory to download PDFs into")
    args = parser.parse_args()

    from .discover import load_elections, find_election
    from .client import EciClient
    from .scrape import scrape_listing, enrich_profiles
    from .writer import write_json

    if args.list_elections:
        for e in load_elections():
            print(f"  {e.code:30}  {e.season_name}")
        return

    if not args.election:
        parser.print_help()
        sys.exit(1)

    election = find_election(args.election)
    if not election:
        print(f"Unknown election code: {args.election}")
        print("Run with --list-elections to see valid codes.")
        sys.exit(1)

    print(f"Election: {election.code}  ({election.season_name})")

    client = EciClient(
        cache_dir=CACHE_DIR,
        use_cache=not args.no_cache,
    )

    print("Phase 1: listing all candidates...")
    try:
        candidates = scrape_listing(client, election, log=print)
    except RuntimeError as e:
        print(f"\nFATAL: {e}", file=sys.stderr)
        if "403" in str(e):
            print(
                "\nThe ECI portal blocked this request. "
                "This pipeline requires a server in India (AWS Mumbai, etc.).",
                file=sys.stderr,
            )
        sys.exit(1)

    if args.state:
        candidates = [c for c in candidates if args.state.lower() in c.state.lower()]
        print(f"Filtered to {len(candidates)} candidates in {args.state}")

    accepted = [c for c in candidates if c.status == "Accepted"]
    print(f"Total: {len(candidates)}, accepted: {len(accepted)}")

    print("\nPhase 2: enriching profiles (age, gender, PDF URL)...")
    enrich_profiles(client, candidates, accepted_only=True, log=print)

    # Optional: download PDFs
    if args.pdf_dir:
        pdf_dir = Path(args.pdf_dir)
        print(f"\nPhase 3: downloading PDFs to {pdf_dir}...")
        for c in accepted:
            if not c.affidavit_pdf_url:
                continue
            safe_name = c.name.replace(" ", "_").replace("/", "_")
            out = pdf_dir / election.code / f"{safe_name}.pdf"
            if out.exists():
                continue
            try:
                client.get_binary(c.affidavit_pdf_url, out)
                print(f"  Downloaded: {out.name}")
            except RuntimeError as e:
                print(f"  ! {c.name}: {e}")

    # Write output
    slug = election.code.replace("-", "_")
    state_suffix = f"_{args.state.lower().replace(' ', '_')}" if args.state else ""
    out_path = OUT_DIR / f"eci_{slug}{state_suffix}.json"
    write_json(accepted, out_path)

    print(f"\nLive requests: {client.live_requests}, cache hits: {client.cache_hits}")


if __name__ == "__main__":
    main()
