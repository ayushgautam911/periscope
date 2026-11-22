"""Typed records for the ECI pipeline."""

from __future__ import annotations
from dataclasses import dataclass, field


@dataclass
class ElectionRef:
    """One ECI election within a season (from elections.json)."""
    season: str       # "13"
    season_name: str  # "Election-Jan-March-2022"
    code: str         # "13-AC-GENERAL-3-23"  (season-constType-category-electionType-electionNo)
    election_type: str   # "3"  (1=PC_GEN, 2=PC_BYE, 3=AC_GEN, 4=AC_BYE)
    election_no: str     # "23" (unique election number within ECI)

    @classmethod
    def from_code(cls, code: str, season: str, season_name: str) -> "ElectionRef":
        parts = code.split("-")  # e.g. ['13','AC','GENERAL','3','23']
        return cls(
            season=season,
            season_name=season_name,
            code=code,
            election_type=parts[3],
            election_no=parts[4],
        )


@dataclass
class EciCandidate:
    """One candidate as scraped from the ECI portal listing + profile pages."""
    name: str
    party: str
    status: str                # "Accepted" | "Rejected" | other
    state: str
    constituency: str
    profile_url: str           # full https://affidavit.eci.gov.in/show-profile/... URL
    election_code: str         # e.g. "13-AC-GENERAL-3-23"

    # Populated by profile scrape
    age: str | None = None
    gender: str | None = None
    father_husband_name: str | None = None
    address: str | None = None
    nomination_file_date: str | None = None
    affidavit_upload_date: str | None = None
    affidavit_pdf_url: str | None = None   # suvidha.eci.gov.in URL

    # Populated by PDF parse
    criminal_cases: int | None = None
    serious_criminal_cases: int | None = None
    cases: list[dict] = field(default_factory=list)
    education: str | None = None
    total_assets: int | None = None
    total_liabilities: int | None = None
    movable_assets: int | None = None
    immovable_assets: int | None = None

    is_winner: bool = False
