"""Scrape candidate listings and profile pages from affidavit.eci.gov.in.

Two-phase scrape:
1. List phase  — fetch all pages of CandidateCustomFilter for an election.
                  Yields: name, party, status, state, constituency, profile URL.
2. Profile phase — visit each candidate's show-profile page.
                   Extracts: age, gender, address, nomination date, pdfUrl.

Requires India IP. See client.py for the 403-guard.
"""

from __future__ import annotations

import base64
from typing import Callable

from bs4 import BeautifulSoup

from . import LISTING_URL
from .client import EciClient
from .models import EciCandidate, ElectionRef

Logger = Callable[[str], None]


# ── Listing ────────────────────────────────────────────────────────────────────

def _listing_url(election: ElectionRef, page: int) -> str:
    return LISTING_URL.format(
        election_type=election.election_type,
        election_no=election.election_no,
        page=page,
    )


def _parse_listing_page(html: str, election_code: str) -> list[EciCandidate]:
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table", id="data-tab")
    if not table:
        return []
    candidates: list[EciCandidate] = []
    for row in table.find_all("tr")[1:]:  # skip header
        try:
            name = row.find("h4").text.strip()
            link_tag = row.find("div", class_="img-bx").find("a")
            profile_url = link_tag["href"] if link_tag else ""
            details = row.find("div", class_="details-name").find_all("p")
            party = details[0].text.split("Party :")[-1].strip()
            status_font = details[1].find("font")
            status = status_font.text.strip() if status_font else details[1].text.strip()
            state = details[2].text.split("State :")[-1].strip()
            constituency = details[3].text.split("Constituency :")[-1].strip()
            candidates.append(EciCandidate(
                name=name,
                party=party,
                status=status,
                state=state,
                constituency=constituency,
                profile_url=profile_url,
                election_code=election_code,
            ))
        except (AttributeError, IndexError, KeyError):
            continue
    return candidates


def _last_page(html: str) -> int:
    soup = BeautifulSoup(html, "lxml")
    pagination = soup.find("ul", class_="pagination")
    if not pagination:
        return 1
    items = pagination.find_all("li")
    try:
        return int(items[-2].text.strip())
    except (ValueError, IndexError):
        return 1


def scrape_listing(
    client: EciClient, election: ElectionRef, log: Logger
) -> list[EciCandidate]:
    """All candidates for one election (accepted and rejected)."""
    first_html = client.get(_listing_url(election, 1))
    last = _last_page(first_html)
    log(f"  {election.code}: {last} page(s)")

    by_url: dict[str, EciCandidate] = {}
    for c in _parse_listing_page(first_html, election.code):
        by_url.setdefault(c.profile_url, c)

    for page in range(2, last + 1):
        html = client.get(_listing_url(election, page))
        for c in _parse_listing_page(html, election.code):
            by_url.setdefault(c.profile_url, c)
        if page % 5 == 0 or page == last:
            log(f"  page {page}/{last}: {len(by_url)} candidates so far")

    return list(by_url.values())


# ── Profile ────────────────────────────────────────────────────────────────────

def _parse_profile(html: str, candidate: EciCandidate) -> None:
    """Populate candidate fields from their show-profile page (mutates in place)."""
    soup = BeautifulSoup(html, "lxml")

    # PDF URL (base64-encoded in hidden input #pdfUrl)
    pdf_input = soup.find("input", id="pdfUrl")
    if pdf_input and pdf_input.get("value"):
        try:
            candidate.affidavit_pdf_url = base64.b64decode(
                pdf_input["value"]
            ).decode("utf-8")
        except Exception:
            candidate.affidavit_pdf_url = None

    # Upload date and download count
    aside = soup.find("div", class_="aside-af")
    if aside:
        spans = aside.find_all("span")
        if spans:
            candidate.affidavit_upload_date = spans[-1].text.strip()

    # Nomination file date
    party_div = soup.find("div", class_="col-md-5 col-sm-6 mt-5 party")
    if party_div:
        rows = party_div.find_all("div", class_="row")
        if len(rows) > 6:
            cols = rows[6].find_all("div", class_="col-sm-6")
            if len(cols) > 1:
                candidate.nomination_file_date = cols[1].text.strip()

    # Candidate bio (age, gender, address, father/husband name)
    form = soup.find("form", class_="form-horizontal")
    if not form:
        return
    groups = form.find_all("div", class_="form-group")
    def _val(group_idx: int) -> str | None:
        try:
            cols = groups[group_idx].find_all("div", class_="col-sm-6")
            return cols[0].text.strip() if cols else None
        except IndexError:
            return None

    candidate.father_husband_name = _val(0)
    candidate.address = _val(4)
    candidate.gender = _val(5)
    candidate.age = _val(6)


def enrich_profiles(
    client: EciClient,
    candidates: list[EciCandidate],
    accepted_only: bool = True,
    log: Logger = print,
) -> None:
    """Visit each candidate's show-profile page and enrich in place."""
    targets = [c for c in candidates if not accepted_only or c.status == "Accepted"]
    log(f"  Enriching {len(targets)} profiles...")
    for i, c in enumerate(targets, 1):
        if not c.profile_url:
            continue
        try:
            html = client.get(c.profile_url)
            _parse_profile(html, c)
        except RuntimeError as e:
            log(f"  ! profile failed for {c.name}: {e}")
        if i % 20 == 0:
            log(f"  {i}/{len(targets)} profiles done")
