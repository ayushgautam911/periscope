"""The pipeline as explicit, ordered phases.

    DISCOVER  -> every candidate in the election (id, name, constituency,
                 party, criminal count, education, assets, liabilities)
    FLAG      -> cross-reference the winners and serious-crime listings
    EXTRACT   -> per-candidate detail page (age, profession, movable/immovable,
                 per-case IPC charges)
    CLASSIFY  -> finalize serious-case counts, reconciled against ADR's flag

Each phase mutates a shared `Context`. The runner logs `[Phase k/N]` so a run is
legible end-to-end. `load` (writing JSON) is the caller's final phase.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable

from .client import PoliteClient
from .models import Candidate, Election
from .parse import enrich_from_detail
from .scrape import scrape_listing, scrape_serious_ids, scrape_winner_ids

Logger = Callable[[str], None]


@dataclass
class RunOptions:
    summary_only: bool = False
    limit: int | None = None


@dataclass
class Context:
    client: PoliteClient
    election: Election
    options: RunOptions
    log: Logger
    candidates: list[Candidate] = field(default_factory=list)


def phase_discover(ctx: Context) -> None:
    cands = scrape_listing(ctx.client, ctx.election.url, ctx.log)
    cands.sort(key=lambda c: (c.constituency or "", c.name))
    if ctx.options.limit is not None:
        cands = cands[: ctx.options.limit]
    ctx.candidates = cands
    ctx.log(f"  discovered {len(cands)} candidates")


def phase_flag(ctx: Context) -> None:
    winners = scrape_winner_ids(ctx.client, ctx.election.url)
    serious = scrape_serious_ids(ctx.client, ctx.election.url)
    for c in ctx.candidates:
        c.is_winner = c.myneta_id in winners
        c.has_serious_cases = c.myneta_id in serious
    ctx.log(
        f"  winners={sum(c.is_winner for c in ctx.candidates)}  "
        f"serious-flagged={sum(c.has_serious_cases for c in ctx.candidates)}"
    )


def phase_extract(ctx: Context) -> None:
    if ctx.options.summary_only:
        ctx.log("  skipped (--summary-only)")
        return
    cands = ctx.candidates
    for i, c in enumerate(cands, 1):
        try:
            enrich_from_detail(c, ctx.client.get(c.source_url))
        except RuntimeError as exc:
            ctx.log(f"  ! detail failed for {c.name} ({c.myneta_id}): {exc}")
        if i % 25 == 0 or i == len(cands):
            ctx.log(f"  detail {i}/{len(cands)}")


def phase_classify(ctx: Context) -> None:
    """Make MyNeta's serious flag authoritative for presence; use the per-case
    classifier only to count among flagged candidates."""
    if ctx.options.summary_only:
        ctx.log("  skipped (no detail pages to classify)")
        return
    reconciled = 0
    for c in ctx.candidates:
        if not c.has_serious_cases:
            c.serious_criminal_cases = 0
        elif not c.serious_criminal_cases:
            c.serious_criminal_cases = 1  # flagged serious but classifier missed
            reconciled += 1
    total_serious = sum((c.serious_criminal_cases or 0) for c in ctx.candidates)
    ctx.log(f"  serious cases counted: {total_serious} (reconciled {reconciled})")


PHASES: list[tuple[str, Callable[[Context], None]]] = [
    ("Discover candidates", phase_discover),
    ("Flag winners & serious cases", phase_flag),
    ("Extract candidate detail", phase_extract),
    ("Classify serious cases", phase_classify),
]


def run_pipeline(
    client: PoliteClient,
    election: Election,
    options: RunOptions,
    log: Logger,
) -> list[Candidate]:
    ctx = Context(client=client, election=election, options=options, log=log)
    for i, (name, fn) in enumerate(PHASES, 1):
        log(f"[Phase {i}/{len(PHASES)}] {name}")
        fn(ctx)
    return ctx.candidates
