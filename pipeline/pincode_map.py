"""Generate pincode -> assembly-constituency maps for every wired state.

Joins two open geodata sets by polygon overlap:
  * Pincode boundary polygons (geodata/india_pincodes.*) — 19,928 polygons,
    one per pincode, with pincode/state/district attributes.
  * Assembly-constituency polygons (geodata/India_AC.*, DataMeet digitisation
    of the ECI delimitation maps). Blank STATUS rows are the current (2008)
    boundaries; "Pre delimitation" rows belong to states where delimitation was
    deferred, i.e. they are ALSO the current boundaries for those states.

For each pincode polygon we compute the fraction of its area falling in each
AC and keep the result only when the evidence is clean:

  * ACs covering >= MIN_FRACTION of the pincode's area, at most MAX_OPTIONS
    of them (a pincode fragmented across more seats than that is noise),
  * each AC matched by name (exact slug, hyphen-collapsed, or cautious fuzzy)
    to a seat that actually exists in the app's data for that state.

Output: src/data/<stateId>/pincodes.json  { "560035": ["c1", "c2"], ... }
(dominant AC first) plus src/data/pincode-index.json mapping 3-digit pincode
prefixes to state ids so the app knows which chunk to lazy-load.

Usage:  python pincode_map.py            (from pipeline/, venv active)
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import shapefile
from shapely.geometry import Point, shape
from shapely.prepared import prep
from shapely.strtree import STRtree

PIPELINE_DIR = Path(__file__).parent
GEODATA = PIPELINE_DIR / "geodata"
APP_DATA = PIPELINE_DIR.parent / "src" / "data"

# The shapefile's single "ANDHRA PRADESH" entry is the pre-2014 undivided
# state — it has no separate Telangana. Split by district: these 10 became
# Telangana at bifurcation, everything else in "ANDHRA PRADESH" stays AP.
TELANGANA_DISTRICTS = {
    "ADILABAD", "HYDERABAD", "KARIMNAGAR", "KHAMMAM", "MAHBUBNAGAR",
    "MEDAK", "NALGONDA", "NIZAMABAD", "RANGAREDDI", "WARANGAL",
}

# Shapefile ST_NAME -> app stateId. Covers every Indian state in the
# shapefile, wired or not: a state with no src/data/<dir> yet is skipped
# automatically, and starts emitting the moment its affidavit JSON lands —
# no edits here needed. (UTTARKHAND / ORISSA are the shapefile's own names;
# ANDHRA PRADESH is pre-bifurcation and includes today's Telangana — see
# TELANGANA_DISTRICTS above for how those records get re-routed.)
STATE_IDS = {
    "ANDHRA PRADESH": "andhra-pradesh",
    "ARUNACHAL PRADESH": "arunachal-pradesh",
    "ASSAM": "assam",
    "BIHAR": "bihar",
    "CHHATTISGARH": "chhattisgarh",
    "DELHI": "delhi",
    "GOA": "goa",
    "GUJARAT": "gujarat",
    "HARYANA": "haryana",
    "HIMACHAL PRADESH": "himachal-pradesh",
    "JAMMU & KASHMIR": "jammu-kashmir",
    "JHARKHAND": "jharkhand",
    "KARNATAKA": "karnataka",
    "KERALA": "kerala",
    "MADHYA PRADESH": "madhya-pradesh",
    "MAHARASHTRA": "maharashtra",
    "MANIPUR": "manipur",
    "MEGHALAYA": "meghalaya",
    "MIZORAM": "mizoram",
    "NAGALAND": "nagaland",
    "ORISSA": "odisha",
    "PUDUCHERRY": "puducherry",
    "PUNJAB": "punjab",
    "RAJASTHAN": "rajasthan",
    "SIKKIM": "sikkim",
    "TAMIL NADU": "tamil-nadu",
    "TRIPURA": "tripura",
    "UTTAR PRADESH": "uttar-pradesh",
    "UTTARKHAND": "uttarakhand",
    "WEST BENGAL": "west-bengal",
}

MAX_OPTIONS = 3  # a pincode mapping to more ACs than this is noise, skip it
MIN_FRACTION = 0.15  # ignore ACs covering less than this share of a pincode

# stateId -> directory name under src/data, for the handful that don't match
# the id verbatim. Keep in sync with the identical STATE_DIRS in
# src/data/pincode.ts — both need to agree on where each state's JSON lives.
STATE_DIRS = {
    "arunachal-pradesh": "arunachal",
    "himachal-pradesh": "himachal",
    "uttar-pradesh": "up",
    "tamil-nadu": "tamilnadu",
    "west-bengal": "westbengal",
    "madhya-pradesh": "madhyapradesh",
    "andhra-pradesh": "andhrapradesh",
    "jammu-kashmir": "jammukashmir",
}


def ensure_geodata() -> None:
    """Download + assemble the two shapefiles on first run (idempotent).

    Nothing here needs a human: wiring a new state is just
    `python pincode_map.py` after the state's affidavit JSON lands in
    src/data. Requires `7zz` (brew install sevenzip) once, because the
    pincode shapefile ships as a multi-part zip that macOS unzip mangles.
    """
    import shutil
    import subprocess
    import urllib.request

    GEODATA.mkdir(exist_ok=True)

    def fetch(url: str, dest: Path) -> None:
        if dest.exists() and dest.stat().st_size > 0:
            return
        print(f"  downloading {dest.name}")
        with urllib.request.urlopen(url) as r, open(dest, "wb") as f:
            shutil.copyfileobj(r, f)

    # ECI assembly-constituency boundaries (DataMeet digitisation).
    for ext in ("shp", "dbf", "shx", "prj"):
        fetch(
            f"https://github.com/datameet/maps/raw/master/assembly-constituencies/India_AC.{ext}",
            GEODATA / f"India_AC.{ext}",
        )

    # National pincode boundary polygons (multi-part zip).
    if not (GEODATA / "india_pincodes.shp").exists():
        base = "https://raw.githubusercontent.com/justinelliotmeyers/INDIA_PINCODES/master"
        parts = [f"india_pincodes.shp.z0{i}" for i in range(1, 6)]
        parts += ["india_pincodes.shp.zip", "india_pincodes.dbf.zip",
                  "india_pincodes.shx.zip", "india_pincodes.prj.zip"]
        for p in parts:
            fetch(f"{base}/{p}", GEODATA / p)
        if not shutil.which("7zz"):
            raise SystemExit(
                "7zz not found — run `brew install sevenzip` once "
                "(macOS unzip corrupts this multi-part archive)."
            )
        for archive in ("india_pincodes.shp.zip", "india_pincodes.dbf.zip",
                        "india_pincodes.shx.zip", "india_pincodes.prj.zip"):
            subprocess.run(
                ["7zz", "x", "-y", archive],
                cwd=GEODATA, check=True, capture_output=True,
            )


def slug(name: str) -> str:
    """Mirror of scrapedState.ts slug(): the app's constituency ids."""
    return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", name.lower()))


def strip_reservation(name: str) -> str:
    """'Anekal (SC)' / 'Gulbarga Rural(SC)' -> base seat name."""
    return re.sub(r"\s*\((?:SC|ST)\)\s*$", "", name, flags=re.I)


def match_ac_names(shp_names: set[str], app_ids: set[str]) -> dict[str, str]:
    """Map shapefile AC names to app constituency ids.

    Exact slug match first (after stripping reservation tags), then a
    hyphen-collapsed match ('Gandhi Nagar' == 'Gandhinagar'), then a cautious
    fuzzy pass for transliteration drift ('Bailhongal' ~ 'Bailahongal'):
    accepted only when the best candidate is unique by a clear margin, so two
    genuinely different neighbouring seats can't cross-match.
    """
    from difflib import SequenceMatcher

    collapsed_app = {aid.replace("-", ""): aid for aid in app_ids}
    out: dict[str, str] = {}
    for raw in shp_names:
        base = strip_reservation(raw)
        s = slug(base)
        if not s:
            continue
        if s in app_ids:
            out[raw] = s
            continue
        c = s.replace("-", "")
        if c in collapsed_app:
            out[raw] = collapsed_app[c]
            continue
        scored = sorted(
            ((SequenceMatcher(None, c, cand).ratio(), aid)
             for cand, aid in collapsed_app.items()),
            reverse=True,
        )
        if scored and scored[0][0] >= 0.78 and (
            len(scored) == 1 or scored[0][0] - scored[1][0] >= 0.05
        ):
            out[raw] = scored[0][1]
    return out


def app_constituency_ids(state_id: str) -> set[str]:
    """Constituency ids that actually exist in the app for a state."""
    state_dir = APP_DATA / STATE_DIRS.get(state_id, state_id)
    ids: set[str] = set()
    for f in state_dir.glob("affidavits.*.json"):
        data = json.loads(f.read_text())
        for c in data.get("candidates", []):
            if c.get("constituency"):
                ids.add(slug(c["constituency"]))
    # Goa's assembly seats come from curated data with the same slug scheme.
    if state_id == "goa" and not ids:
        pass
    return ids


def main() -> int:
    print("[0/4] Ensure geodata is present")
    ensure_geodata()

    print("[1/4] Load constituency polygons")
    sf = shapefile.Reader(str(GEODATA / "India_AC.shp"))
    geoms, attrs = [], []
    for sr in sf.iterShapeRecords():
        st = sr.record["ST_NAME"]
        if st not in STATE_IDS:
            continue
        state_id = STATE_IDS[st]
        if st == "ANDHRA PRADESH" and sr.record["DIST_NAME"] in TELANGANA_DISTRICTS:
            state_id = "telangana"
        geoms.append(shape(sr.shape.__geo_interface__))
        attrs.append((state_id, sr.record["AC_NAME"]))
    tree = STRtree(geoms)
    prepared = [prep(g) for g in geoms]
    print(f"  {len(geoms)} polygons across {len(set(a[0] for a in attrs))} wired states")

    print("[2/4] Polygon-overlap join of pincode boundaries")
    from shapely import make_valid
    from shapely.geometry import shape as to_shape

    psf = shapefile.Reader(str(GEODATA / "india_pincodes.shp"))
    # pincode -> Counter of (state_id, ac_name) -> overlap area
    hits: dict[str, Counter] = defaultdict(Counter)
    pin_area: dict[str, float] = defaultdict(float)
    total = overlapped = 0
    for sr in psf.iterShapeRecords():
        pin = str(sr.record["pincode"]).strip()
        if not re.fullmatch(r"[1-9]\d{5}", pin):
            continue
        total += 1
        try:
            pg = to_shape(sr.shape.__geo_interface__)
            if not pg.is_valid:
                pg = make_valid(pg)
        except Exception:
            continue
        pin_area[pin] += pg.area
        found = False
        for idx in tree.query(pg):
            if not prepared[idx].intersects(pg):
                continue
            try:
                inter = geoms[idx].intersection(pg).area
            except Exception:
                inter = make_valid(geoms[idx]).intersection(pg).area
            if inter > 0:
                hits[pin][attrs[idx]] += inter
                found = True
        if found:
            overlapped += 1
        if total % 5000 == 0:
            print(f"  ...{total} pincode polygons processed")
    print(f"  {total} pincode polygons, {overlapped} overlap a wired-state AC")

    print("[3/4] Resolve to app constituency ids (conservative)")
    # Derive the state-id set from `attrs` (not STATE_IDS.values()) since a
    # single shapefile ST_NAME can now expand to two app states — see the
    # ANDHRA PRADESH / TELANGANA_DISTRICTS split above.
    known_ids = {sid: app_constituency_ids(sid) for sid in {a[0] for a in attrs}}
    # Per-state shapefile-AC-name -> app-id maps (exact + collapsed + fuzzy).
    shp_names_by_state: dict[str, set[str]] = defaultdict(set)
    for sid, ac in attrs:
        shp_names_by_state[sid].add(ac)
    name_map = {
        sid: match_ac_names(names, known_ids[sid])
        for sid, names in shp_names_by_state.items()
    }
    for sid in sorted(name_map):
        total_names = len(shp_names_by_state[sid])
        print(f"  {sid}: matched {len(name_map[sid])}/{total_names} AC names")

    per_state: dict[str, dict[str, list[str]]] = defaultdict(dict)
    stats = Counter()
    for pincode, counter in hits.items():
        area = pin_area[pincode]
        if area <= 0:
            continue
        # Majority state by overlap area; drop stray cross-border slivers.
        state_votes = Counter()
        for (sid, _ac), a in counter.items():
            state_votes[sid] += a
        state_id, state_a = state_votes.most_common(1)[0]
        if state_a < area * 0.5:  # pincode mostly outside wired states
            stats["skipped_no_state_majority"] += 1
            continue
        # Keep ACs covering a meaningful share of the pincode, matched to
        # seats the app actually has.
        nm = name_map[state_id]
        merged: Counter = Counter()
        for (sid, ac), a in counter.items():
            if sid == state_id and ac in nm:
                merged[nm[ac]] += a
        matched = [
            (cid, a) for cid, a in merged.items() if a >= area * MIN_FRACTION
        ]
        if not matched:
            stats["skipped_no_name_match"] += 1
            continue
        if len(matched) > MAX_OPTIONS:
            stats["skipped_too_ambiguous"] += 1
            continue
        matched.sort(key=lambda t: -t[1])
        per_state[state_id][pincode] = [cid for cid, _ in matched]
        stats["single" if len(matched) == 1 else "multi"] += 1

    print(f"  emitted: {stats['single']} single-AC + {stats['multi']} multi-AC pincodes")
    print(
        f"  skipped: {stats['skipped_no_name_match']} unmatched-name, "
        f"{stats['skipped_too_ambiguous']} too-ambiguous, "
        f"{stats['skipped_no_state_majority']} cross-border"
    )

    print("[4/4] Write per-state maps + prefix index")
    prefix_index: dict[str, set[str]] = defaultdict(set)
    for state_id, mapping in sorted(per_state.items()):
        out = APP_DATA / STATE_DIRS.get(state_id, state_id) / "pincodes.json"
        if not out.parent.exists():
            print(f"  ! {state_id}: app dir missing, skipped ({len(mapping)} pincodes)")
            continue
        out.write_text(
            json.dumps(dict(sorted(mapping.items())), separators=(",", ":"))
        )
        for pin in mapping:
            prefix_index[pin[:3]].add(state_id)
        print(f"  {state_id}: {len(mapping)} pincodes -> {out.relative_to(APP_DATA.parent.parent)}")

    index_out = APP_DATA / "pincode-index.json"
    index_out.write_text(
        json.dumps(
            {p: sorted(s) for p, s in sorted(prefix_index.items())},
            separators=(",", ":"),
        )
    )
    print(f"  prefix index: {len(prefix_index)} prefixes -> {index_out.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
