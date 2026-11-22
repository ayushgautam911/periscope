"""Polite HTTP client: single-threaded, throttled, retrying, with a disk cache.

Politeness is a first-class goal here (see README ToS note): we never fan out
concurrent requests, we sleep between live fetches, and we cache every response
so re-runs cost the server nothing.
"""

from __future__ import annotations

import hashlib
import time
from pathlib import Path
from typing import Callable

import requests

# A predicate that decides whether a fetched body is the page we wanted (vs a
# rate-limit / error page that still returns HTTP 200).
Validator = Callable[[str], bool]

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) periscope-research/0.1"
)


class PoliteClient:
    def __init__(
        self,
        delay: float = 1.2,
        cache_dir: Path | None = None,
        use_cache: bool = True,
        timeout: float = 30.0,
        max_retries: int = 3,
        block_cooldown: float = 90.0,
    ) -> None:
        self.delay = delay
        self.timeout = timeout
        self.max_retries = max_retries
        # MyNeta soft-blocks bursts; access restores after ~90s of silence.
        self.block_cooldown = block_cooldown
        self.use_cache = use_cache
        self.cache_dir = cache_dir
        if cache_dir:
            cache_dir.mkdir(parents=True, exist_ok=True)
        self._session = requests.Session()
        self._session.headers.update({"User-Agent": USER_AGENT})
        self._last_fetch = 0.0
        self.live_requests = 0
        self.cache_hits = 0

    def _cache_path(self, url: str) -> Path | None:
        if not (self.use_cache and self.cache_dir):
            return None
        key = hashlib.sha1(url.encode("utf-8")).hexdigest()
        return self.cache_dir / f"{key}.html"

    def get(
        self, url: str, cache: bool | None = None, valid: Validator | None = None
    ) -> str:
        """Fetch `url`. If `valid` is given, a 200 response whose body fails it is
        treated as a rate-limit page: it is never cached, and we cool down before
        retrying. Cached bodies that fail `valid` are ignored and refetched, so a
        poisoned cache self-heals."""
        use_cache = self.use_cache if cache is None else cache
        cache_path = self._cache_path(url) if use_cache else None
        if cache_path and cache_path.exists():
            cached = cache_path.read_text(encoding="utf-8", errors="replace")
            if valid is None or valid(cached):
                self.cache_hits += 1
                return cached  # otherwise: stale/blocked cache, refetch below

        last_err: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            self._throttle()
            try:
                resp = self._session.get(url, timeout=self.timeout)
                self.live_requests += 1
                if resp.status_code == 200:
                    html = resp.text
                    if valid is None or valid(html):
                        if cache_path:
                            cache_path.write_text(html, encoding="utf-8")
                        return html
                    # 200 but not the page we wanted -> rate-limited; cool down.
                    last_err = RuntimeError(f"rate-limited body for {url}")
                    if attempt < self.max_retries:
                        time.sleep(self.block_cooldown)
                    continue
                last_err = RuntimeError(f"HTTP {resp.status_code} for {url}")
            except requests.RequestException as exc:  # network hiccup
                last_err = exc
            time.sleep(self.delay * attempt)  # back off
        raise RuntimeError(f"Failed to fetch {url}: {last_err}")

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_fetch
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self._last_fetch = time.monotonic()
