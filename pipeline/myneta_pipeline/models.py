"""Typed records produced by the pipeline."""

from __future__ import annotations

from dataclasses import dataclass, asdict, field


@dataclass(frozen=True)
class Election:
    """A MyNeta election namespace, e.g. slug 'goa2022'."""

    slug: str
    state: str
    year: int
    house: str  # "assembly" | "loksabha"

    @property
    def url(self) -> str:
        return f"https://www.myneta.info/{self.slug}/"


@dataclass
class Candidate:
    """One candidate's affidavit-derived record. None = not captured."""

    myneta_id: int
    name: str
    constituency: str | None = None
    party: str | None = None

    criminal_cases: int | None = None
    serious_criminal_cases: int | None = None
    has_serious_cases: bool = False
    ipc_sections: list[str] = field(default_factory=list)
    cases: list[dict] = field(default_factory=list)  # [{"sections": [...], "serious": bool}]

    education: str | None = None
    age: int | None = None
    profession: str | None = None

    total_assets: int | None = None
    total_liabilities: int | None = None
    movable_assets: int | None = None
    immovable_assets: int | None = None

    is_winner: bool = False
    source_url: str | None = None

    def to_dict(self) -> dict:
        return asdict(self)
