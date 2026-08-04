"""Atomic, privacy-preserving login failure limiter backed by MongoDB."""

from __future__ import annotations

import hashlib
import hmac
import logging
from datetime import datetime, timezone

from fastapi import HTTPException
from pymongo import ReturnDocument

WINDOW_SECONDS = 15 * 60
ACCOUNT_FAILURE_LIMIT = 5
PEER_FAILURE_LIMIT = 20
GENERIC_LIMIT_MESSAGE = "Terlalu banyak percobaan login. Coba lagi nanti."
logger = logging.getLogger("niuva.auth_rate_limit")


async def _increment_counter(
    collection,
    *,
    key: str,
    scope: str,
    bucket: int,
    now: datetime,
    expires_at: datetime,
) -> dict:
    """Increment and return a limiter document as one MongoDB operation."""
    return await collection.find_one_and_update(
        {"_id": key},
        {
            "$inc": {"count": 1},
            "$setOnInsert": {
                "scope": scope,
                "window": bucket,
                "created_at": now,
                "expires_at": expires_at,
            },
        },
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )


class LoginRateLimiter:
    def __init__(self, *, collection, secret: str):
        self.collection = collection
        self.secret = secret.encode("utf-8")

    def _digest(self, value: str) -> str:
        return hmac.new(
            self.secret,
            value.casefold().strip().encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    @staticmethod
    def _window(now: datetime) -> tuple[int, datetime]:
        bucket = int(now.timestamp()) // WINDOW_SECONDS
        expires_at = datetime.fromtimestamp(
            (bucket + 1) * WINDOW_SECONDS,
            tz=timezone.utc,
        )
        return bucket, expires_at

    def _key(self, scope: str, value: str, bucket: int) -> str:
        return f"{scope}:{self._digest(value)}:{bucket}"

    @staticmethod
    def _retry_after(expires_at: datetime, now: datetime) -> int:
        return max(1, int((expires_at - now).total_seconds()))

    @staticmethod
    def _raise_limited(retry_after: int) -> None:
        logger.warning(
            "auth_rate_limit_blocked",
            extra={
                "auth_rate_limit": {
                    "event": "blocked",
                    "retry_after_seconds": retry_after,
                }
            },
        )
        raise HTTPException(
            status_code=429,
            detail=GENERIC_LIMIT_MESSAGE,
            headers={"Retry-After": str(retry_after)},
        )

    async def enforce(self, *, account: str, peer_ip: str) -> None:
        now = datetime.now(timezone.utc)
        bucket, expires_at = self._window(now)
        checks = (
            (self._key("account", account, bucket), ACCOUNT_FAILURE_LIMIT),
            (self._key("peer", peer_ip, bucket), PEER_FAILURE_LIMIT),
        )
        for key, limit in checks:
            record = await self.collection.find_one({"_id": key}, {"count": 1})
            if record and int(record.get("count", 0)) >= limit:
                self._raise_limited(self._retry_after(expires_at, now))

    async def record_failure(self, *, account: str, peer_ip: str) -> None:
        now = datetime.now(timezone.utc)
        bucket, expires_at = self._window(now)
        limits = (
            (
                self._key("account", account, bucket),
                "account",
                ACCOUNT_FAILURE_LIMIT,
            ),
            (self._key("peer", peer_ip, bucket), "peer", PEER_FAILURE_LIMIT),
        )
        exhausted = False
        for key, scope, limit in limits:
            record = await _increment_counter(
                self.collection,
                key=key,
                scope=scope,
                bucket=bucket,
                now=now,
                expires_at=expires_at,
            )
            exhausted = exhausted or bool(
                record and int(record.get("count", 0)) >= limit
            )
        if exhausted:
            self._raise_limited(self._retry_after(expires_at, now))

    async def clear_account(self, *, account: str) -> None:
        now = datetime.now(timezone.utc)
        bucket, _expires_at = self._window(now)
        await self.collection.delete_one(
            {"_id": self._key("account", account, bucket)}
        )


class PublicRateLimiter:
    """Bounded-window limiter for anonymous and administrative public edges."""

    def __init__(self, *, collection, secret: str):
        self.collection = collection
        self.secret = secret.encode("utf-8")

    def _digest(self, value: str) -> str:
        return hmac.new(
            self.secret,
            value.casefold().strip().encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    async def consume(
        self,
        *,
        scope: str,
        identifier: str,
        limit: int,
        window_seconds: int,
        detail: str = "Terlalu banyak permintaan. Coba lagi sesaat.",
    ) -> None:
        now = datetime.now(timezone.utc)
        bucket = int(now.timestamp()) // window_seconds
        expires_at = datetime.fromtimestamp(
            (bucket + 1) * window_seconds,
            tz=timezone.utc,
        )
        key = f"{scope}:{self._digest(identifier)}:{bucket}"
        record = await _increment_counter(
            self.collection,
            key=key,
            scope=scope,
            bucket=bucket,
            now=now,
            expires_at=expires_at,
        )
        if record and int(record.get("count", 0)) > limit:
            retry_after = max(1, int((expires_at - now).total_seconds()))
            logger.warning(
                "public_rate_limit_blocked",
                extra={
                    "public_rate_limit": {
                        "event": "blocked",
                        "scope": scope,
                        "retry_after_seconds": retry_after,
                    }
                },
            )
            raise HTTPException(
                status_code=429,
                detail=detail,
                headers={"Retry-After": str(retry_after)},
            )
