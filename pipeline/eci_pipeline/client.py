"""Polite HTTP client for affidavit.eci.gov.in.

NOTE: This client requires an India-based IP address.
The ECI portal uses Akamai WAF which blocks all non-India IPs with HTTP 403.
Deploy this pipeline on AWS ap-south-1 (Mumbai) or any India-region VPS.

Politeness settings:
- 1.5s delay between requests (ECI portal is slower than MyNeta)
- 3 retries with exponential backoff
- No concurrent requests
"""

from __future__ import annotations

import hashlib
import time
from pathlib import Path

import requests

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/120.0.0.0 Safari/537.36"
)


class EciClient:
    def __init__(
        self,
        delay: float = 1.5,
        cache_dir: Path | None = None,
        use_cache: bool = True,
        timeout: float = 45.0,
        max_retries: int = 3,
    ) -> None:
        self.delay = delay
        self.timeout = timeout
        self.max_retries = max_retries
        self.use_cache = use_cache
        self.cache_dir = cache_dir
        if cache_dir:
            cache_dir.mkdir(parents=True, exist_ok=True)
        self._session = requests.Session()
        self._session.headers.update({
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-IN,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
        })
        self._last_fetch = 0.0
        self.live_requests = 0
        self.cache_hits = 0

    def _cache_path(self, url: str) -> Path | None:
        if not (self.use_cache and self.cache_dir):
            return None
        key = hashlib.sha1(url.encode()).hexdigest()
        return self.cache_dir / f"{key}.html"

    def get(self, url: str, cache: bool | None = None) -> str:
        use_cache = self.use_cache if cache is None else cache
        cache_path = self._cache_path(url) if use_cache else None
        if cache_path and cache_path.exists():
            self.cache_hits += 1
            return cache_path.read_text(encoding="utf-8", errors="replace")

        last_err: Exception | None = None
        for attempt in range(1, self.max_retries + 1):
            self._throttle()
            try:
                resp = self._session.get(url, timeout=self.timeout)
                self.live_requests += 1
                if resp.status_code == 200:
                    text = resp.text
                    if cache_path:
                        cache_path.write_text(text, encoding="utf-8")
                    return text
                if resp.status_code == 403:
                    raise RuntimeError(
                        "HTTP 403 — likely blocked by Akamai WAF. "
                        "This pipeline must run from an India-based IP address."
                    )
                last_err = RuntimeError(f"HTTP {resp.status_code} for {url}")
            except requests.RequestException as e:
                last_err = e
            time.sleep(self.delay * attempt)
        raise RuntimeError(f"Failed to fetch {url}: {last_err}")

    def get_binary(self, url: str, out_path: Path) -> None:
        """Download a binary file (PDF) to disk."""
        self._throttle()
        resp = self._session.get(url, timeout=self.timeout, stream=True)
        self.live_requests += 1
        if resp.status_code != 200:
            raise RuntimeError(f"HTTP {resp.status_code} downloading {url}")
        out_path.parent.mkdir(parents=True, exist_ok=True)
        with open(out_path, "wb") as f:
            for chunk in resp.iter_content(chunk_size=8192):
                f.write(chunk)

    def _throttle(self) -> None:
        elapsed = time.monotonic() - self._last_fetch
        if elapsed < self.delay:
            time.sleep(self.delay - elapsed)
        self._last_fetch = time.monotonic()
