"""Slim the src/data JSON copies for shipping.

Drops fields the app never reads (myneta id, candidate-level ipc_sections,
has_serious_cases, per-case charges_framed_date) and omits null/empty values
entirely — the app's adapter treats a missing key the same as null. Run after
copying fresh pipeline output into src/data/.

    python slim_app_json.py ../src/data/*/affidavits.*.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

DROP_CANDIDATE_KEYS = {"id", "myneta_id", "ipc_sections", "has_serious_cases", "source_url"}
DROP_CASE_KEYS = {"charges_framed_date"}


def slim(path: Path) -> None:
    data = json.loads(path.read_text())
    before = path.stat().st_size
    for c in data["candidates"]:
        for k in list(c):
            if k in DROP_CANDIDATE_KEYS or c[k] is None or c[k] == []:
                del c[k]
        for case in c.get("cases") or []:
            for k in list(case):
                if k in DROP_CASE_KEYS or case[k] is None:
                    del case[k]
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
    after = path.stat().st_size
    print(f"{path.name}: {before / 1e6:.2f} MB -> {after / 1e6:.2f} MB")


if __name__ == "__main__":
    for arg in sys.argv[1:]:
        slim(Path(arg))
