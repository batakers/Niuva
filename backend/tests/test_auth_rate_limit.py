from __future__ import annotations

import asyncio
import sys
from pathlib import Path

import pytest
from fastapi import HTTPException

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from auth_rate_limit import LoginRateLimiter, PublicRateLimiter  # noqa: E402


class AtomicCollection:
    """Small async collection double with one-document atomic updates."""

    def __init__(self):
        self.items = {}
        self.calls = 0
        self._lock = asyncio.Lock()

    async def find_one_and_update(
        self,
        query,
        update,
        *,
        upsert=False,
        return_document=False,
        **_options,
    ):
        self.calls += 1
        await asyncio.sleep(0)
        async with self._lock:
            key = query["_id"]
            item = self.items.get(key)
            before = dict(item) if item is not None else None
            if item is None:
                if not upsert:
                    return None
                item = {"_id": key, **update.get("$setOnInsert", {})}
                self.items[key] = item
            for field, amount in update.get("$inc", {}).items():
                item[field] = item.get(field, 0) + amount
            return dict(item) if return_document else before

    async def find_one(self, *_args, **_kwargs):
        raise AssertionError(
            "limiter consumption must use one atomic operation"
        )

    async def update_one(self, *_args, **_kwargs):
        raise AssertionError(
            "limiter consumption must use one atomic operation"
        )


def test_public_limiter_allows_only_the_atomic_budget_under_concurrency():
    collection = AtomicCollection()
    limiter = PublicRateLimiter(collection=collection, secret="test-secret")

    async def scenario():
        return await asyncio.gather(
            *(
                limiter.consume(
                    scope="inquiry",
                    identifier="Sensitive@example.com",
                    limit=5,
                    window_seconds=600,
                )
                for _attempt in range(6)
            ),
            return_exceptions=True,
        )

    results = asyncio.run(scenario())
    successful = [
        result for result in results if not isinstance(result, Exception)
    ]
    limited = [
        result for result in results if isinstance(result, HTTPException)
    ]

    assert len(successful) == 5
    assert len(limited) == 1
    assert limited[0].status_code == 429
    assert int(limited[0].headers["Retry-After"]) >= 1
    assert collection.calls == 6
    assert "Sensitive@example.com" not in repr(collection.items)


def test_login_failure_recording_uses_atomic_post_update_count():
    collection = AtomicCollection()
    limiter = LoginRateLimiter(collection=collection, secret="test-secret")

    async def scenario():
        for _attempt in range(4):
            await limiter.record_failure(
                account="Sensitive@example.com",
                peer_ip="203.0.113.10",
            )
        with pytest.raises(HTTPException) as captured:
            await limiter.record_failure(
                account="Sensitive@example.com",
                peer_ip="203.0.113.10",
            )
        return captured.value

    error = asyncio.run(scenario())

    assert error.status_code == 429
    assert int(error.headers["Retry-After"]) >= 1
    assert collection.calls == 10
    assert "Sensitive@example.com" not in repr(collection.items)
    assert "203.0.113.10" not in repr(collection.items)
