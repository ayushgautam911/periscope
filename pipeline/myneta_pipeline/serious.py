"""Classify a criminal case as 'serious' using ADR's published criteria.

ADR flags a case serious if it meets ANY of: max punishment >= 5 years;
non-bailable; electoral offence; loss to the exchequer; assault/murder/kidnap/
rape; RPA s.8 disqualifying offence; Prevention of Corruption Act; crime against
women. We approximate this with a curated set of IPC sections covering the
common serious heads. The result is a DERIVED count and is reconciled against
MyNeta's authoritative `serious_crime` list (see phases.py).
"""

from __future__ import annotations

import re

# Serious IPC sections (numeric head, ignoring letter suffixes) by category.
_SERIOUS_IPC: set[int] = {
    # Murder / culpable homicide / attempt / abetment of suicide
    302, 303, 304, 305, 306, 307, 308, 309, 326, 333, 335,
    # Crimes against women: rape, modesty, dowry death, cruelty, trafficking
    354, 366, 366, 370, 371, 372, 373, 375, 376, 377, 304, 498, 509, 312, 313, 314,
    # Kidnapping / abduction / wrongful confinement (grave)
    363, 364, 365, 366, 367, 368, 369, 346,
    # Dacoity / robbery / extortion (grave)
    382, 384, 386, 387, 388, 389, 392, 393, 394, 395, 396, 397, 398, 399, 400, 402,
    # Rioting with deadly weapons / unlawful assembly armed / grievous hurt
    148, 153, 232, 295, 296, 121, 122, 124, 125, 153,
    # Forgery / cheating (grave) / criminal breach of trust
    406, 409, 420, 467, 468, 471, 472, 474,
    # Public servant / corruption-adjacent, criminal conspiracy for grave offence
    409, 120,
}

# Section numbers that, despite appearing serious-ish, are commonly minor — we
# do NOT auto-flag these alone (e.g., 143 unlawful assembly, 147 rioting,
# 341/342 wrongful restraint/confinement, 323 simple hurt, 504/506 insult/threat,
# 188 disobedience, 353 assault on public servant). They can still be part of a
# case flagged serious by a co-charged grave section.
_DOWNGRADE: set[int] = {143, 147, 145, 149, 151, 188, 283, 290, 323, 341, 342,
                        353, 447, 448, 504, 506, 34}


def _section_number(section: str) -> int | None:
    m = re.match(r"\s*(\d{2,4})", section)
    return int(m.group(1)) if m else None


def is_serious_section(section: str) -> bool:
    num = _section_number(section)
    if num is None:
        return False
    if num in _DOWNGRADE:
        return False
    return num in _SERIOUS_IPC


def classify_case(sections: list[str]) -> bool:
    """A case is serious if any of its charged sections is serious."""
    return any(is_serious_section(s) for s in sections)
