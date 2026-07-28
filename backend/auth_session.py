"""Mongo-backed opaque Admin sessions behind one framework-neutral seam."""

from __future__ import annotations

import base64
import hashlib
import hmac
import re
import secrets
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from typing import Awaitable, Callable, Mapping, Protocol, TypeVar

ACCESS_TTL = timedelta(minutes=15)
DEFAULT_IDLE_TTL = timedelta(minutes=30)
DEFAULT_ABSOLUTE_TTL = timedelta(hours=8)
REMEMBER_IDLE_TTL = timedelta(hours=8)
REMEMBER_ABSOLUTE_TTL = timedelta(days=7)

ACCESS_COOKIE_NAME = "__Host-niuva-admin-access"
SESSION_COOKIE_NAME = "__Host-niuva-admin-session"
COOKIE_COMMON = {
    "secure": True,
    "httponly": True,
    "samesite": "strict",
    "path": "/",
}

SESSION_EXPIRED_CODE = "admin_session_expired"
REQUEST_VERIFICATION_FAILED_CODE = "request_verification_failed"
_SAFE_REASON = re.compile(r"^[a-z0-9][a-z0-9_-]{0,63}$")


class AdminSessionError(Exception):
    code = SESSION_EXPIRED_CODE


class SessionExpiredError(AdminSessionError):
    pass


class SessionReplayError(SessionExpiredError):
    """Internal typed signal; its public code intentionally remains generic."""


class RequestVerificationError(AdminSessionError):
    code = REQUEST_VERIFICATION_FAILED_CODE


class SessionInputError(ValueError):
    pass


@dataclass(frozen=True)
class SessionGrant:
    session_id: str
    user_id: str
    access_secret: str = field(repr=False)
    session_secret: str = field(repr=False)
    csrf_token: str = field(repr=False)
    access_expires_at: datetime
    idle_expires_at: datetime
    absolute_expires_at: datetime
    remember_me: bool


@dataclass(frozen=True)
class AuthenticatedSession:
    session_id: str
    user_id: str
    token_version: int
    remember_me: bool
    access_expires_at: datetime
    idle_expires_at: datetime
    absolute_expires_at: datetime
    _csrf_digest: str = field(repr=False, compare=False)


class SessionStore(Protocol):
    async def create(self, document: dict, *, session) -> None: ...

    async def find_by_access_hash(
        self, access_hash: str, *, session=None
    ) -> dict | None: ...

    async def find_by_session_hash(
        self, session_hash: str, *, session=None
    ) -> dict | None: ...

    async def touch(
        self,
        session_id: str,
        access_hash: str,
        *,
        last_seen_at: datetime,
        idle_expires_at: datetime,
    ) -> bool: ...

    async def rotate(
        self,
        session_id: str,
        expected_session_hash: str,
        replacement: Mapping[str, object],
        *,
        session,
    ) -> bool: ...

    async def revoke_family(
        self, session_id: str, reason: str, revoked_at: datetime, *, session
    ) -> bool: ...

    async def revoke_user(
        self, user_id: str, reason: str, revoked_at: datetime, *, session
    ) -> int: ...


T = TypeVar("T")


class TransactionGuard(Protocol):
    async def run(
        self,
        callback: Callable[[object], Awaitable[T]],
        *,
        operation_name: str,
        retry_safe: bool = False,
        correlation_id: str | None = None,
    ) -> T: ...


Clock = Callable[[], datetime]
TokenFactory = Callable[[], bytes]
UserVersionProvider = Callable[[str, object | None], Awaitable[int | None]]


class AdminSessionModule:
    def __init__(
        self,
        *,
        store: SessionStore,
        transaction_guard: TransactionGuard,
        csrf_key: bytes,
        user_version_provider: UserVersionProvider | None = None,
        clock: Clock = lambda: datetime.now(timezone.utc),
        token_factory: TokenFactory = lambda: secrets.token_bytes(32),
    ):
        if not isinstance(csrf_key, bytes) or len(csrf_key) < 32:
            raise SessionInputError("csrf_key_must_be_at_least_256_bits")
        self.store = store
        self.transaction_guard = transaction_guard
        self.csrf_key = csrf_key
        self.user_version_provider = user_version_provider
        self.clock = clock
        self.token_factory = token_factory

    async def create_admin_session(
        self,
        user: Mapping[str, object],
        remember_me: bool,
        request_context: Mapping[str, object],
    ) -> SessionGrant:
        del request_context  # Raw request metadata is deliberately not persisted.
        user_id, token_version = _user_identity(user)
        now = _aware_utc(self.clock())
        absolute_expires_at = now + _absolute_ttl(remember_me)
        access_secret, session_secret, csrf_token = self._new_material()
        document = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "token_version": token_version,
            "access_hash": _hash_secret(access_secret),
            "session_hash": _hash_secret(session_secret),
            "rotated_session_hashes": [],
            "csrf_digest": self._csrf_digest(csrf_token),
            "remember_me": bool(remember_me),
            "issued_at": now,
            "last_seen_at": now,
            "access_expires_at": now + ACCESS_TTL,
            "idle_expires_at": min(now + _idle_ttl(remember_me), absolute_expires_at),
            "absolute_expires_at": absolute_expires_at,
            "rotated_at": None,
            "revoked_at": None,
            "revocation_reason": None,
        }

        async def create(session):
            await self.store.create(document, session=session)

        await self.transaction_guard.run(
            create, operation_name="auth.admin_session.create"
        )
        return _grant(document, access_secret, session_secret, csrf_token)

    async def authenticate_admin_session(
        self, request_context: Mapping[str, object]
    ) -> AuthenticatedSession:
        raw_secret = _context_secret(request_context, "access_secret")
        record = await self.store.find_by_access_hash(_hash_secret(raw_secret))
        now = _aware_utc(self.clock())
        if not record or _is_expired(record, now):
            raise SessionExpiredError()
        await self._check_current_version(record, request_context)
        result = _authenticated(record)
        if "csrf_token" in request_context:
            self.verify_csrf(result, request_context["csrf_token"])
        idle_expires_at = min(
            now + _idle_ttl(bool(record["remember_me"])),
            _record_time(record, "absolute_expires_at"),
        )
        touched = await self.store.touch(
            record["id"],
            record["access_hash"],
            last_seen_at=now,
            idle_expires_at=idle_expires_at,
        )
        if not touched:
            raise SessionExpiredError()
        record["last_seen_at"] = now
        record["idle_expires_at"] = idle_expires_at
        return _authenticated(record)

    async def rotate_admin_session(
        self,
        session: AuthenticatedSession | Mapping[str, object] | None,
        request_context: Mapping[str, object],
    ) -> SessionGrant:
        del session  # The rotating secret, not caller-held state, is authoritative.
        raw_secret = _context_secret(request_context, "session_secret")
        presented_hash = _hash_secret(raw_secret)
        access_secret, session_secret, csrf_token = self._new_material()

        async def rotate(tx_session):
            now = _aware_utc(self.clock())
            record = await self.store.find_by_session_hash(
                presented_hash, session=tx_session
            )
            if not record:
                return "expired", None
            if presented_hash in record.get("rotated_session_hashes", ()):
                await self.store.revoke_family(
                    record["id"],
                    "session_secret_replay",
                    now,
                    session=tx_session,
                )
                return "replay", record
            if _is_session_expired(record, now):
                await self.store.revoke_family(
                    record["id"], "expired", now, session=tx_session
                )
                return "expired", None
            try:
                await self._check_current_version(
                    record, request_context, session=tx_session
                )
            except SessionExpiredError:
                await self.store.revoke_family(
                    record["id"], "token_version_changed", now, session=tx_session
                )
                return "expired", None
            replacement = {
                "access_hash": _hash_secret(access_secret),
                "session_hash": _hash_secret(session_secret),
                "csrf_digest": self._csrf_digest(csrf_token),
                "last_seen_at": now,
                "access_expires_at": min(
                    now + ACCESS_TTL,
                    _record_time(record, "absolute_expires_at"),
                ),
                "idle_expires_at": min(
                    now + _idle_ttl(bool(record["remember_me"])),
                    _record_time(record, "absolute_expires_at"),
                ),
                "rotated_at": now,
            }
            changed = await self.store.rotate(
                record["id"], presented_hash, replacement, session=tx_session
            )
            if not changed:
                raise SessionExpiredError()
            record.update(replacement)
            return "rotated", record

        outcome, record = await self.transaction_guard.run(
            rotate,
            operation_name="auth.admin_session.rotate",
            retry_safe=True,
        )
        if outcome == "replay":
            await self.revoke_admin_session(record["id"], "session_secret_replay")
            raise SessionReplayError()
        if outcome != "rotated" or record is None:
            raise SessionExpiredError()
        return _grant(record, access_secret, session_secret, csrf_token)

    async def revoke_admin_session(
        self,
        session: AuthenticatedSession | Mapping[str, object] | str,
        reason: str,
    ) -> bool:
        session_id = _session_id(session)
        safe_reason = _reason(reason)

        async def revoke(tx_session):
            return await self.store.revoke_family(
                session_id,
                safe_reason,
                _aware_utc(self.clock()),
                session=tx_session,
            )

        return await self.transaction_guard.run(
            revoke, operation_name="auth.admin_session.revoke"
        )

    async def revoke_user_sessions(self, user_id: str, reason: str) -> int:
        if not isinstance(user_id, str) or not user_id:
            raise SessionInputError("user_id_required")
        safe_reason = _reason(reason)

        async def revoke(tx_session):
            return await self.store.revoke_user(
                user_id,
                safe_reason,
                _aware_utc(self.clock()),
                session=tx_session,
            )

        return await self.transaction_guard.run(
            revoke, operation_name="auth.admin_session.revoke_user"
        )

    async def revoke_user_sessions_in_transaction(
        self, user_id: str, reason: str, *, session
    ) -> int:
        if not isinstance(user_id, str) or not user_id:
            raise SessionInputError("user_id_required")
        return await self.store.revoke_user(
            user_id,
            _reason(reason),
            _aware_utc(self.clock()),
            session=session,
        )

    def verify_csrf(self, session: AuthenticatedSession, candidate: object) -> None:
        candidate_digest = (
            self._csrf_digest(candidate)
            if isinstance(candidate, str) and 1 <= len(candidate) <= 1024
            else "0" * 64
        )
        if not hmac.compare_digest(session._csrf_digest, candidate_digest):
            raise RequestVerificationError()

    def _new_material(self) -> tuple[str, str, str]:
        return tuple(_encode_token(self.token_factory()) for _ in range(3))  # type: ignore[return-value]

    def _csrf_digest(self, token: str) -> str:
        return hmac.new(
            self.csrf_key, token.encode("utf-8"), hashlib.sha256
        ).hexdigest()

    async def _check_current_version(
        self,
        record: Mapping[str, object],
        context: Mapping[str, object],
        *,
        session=None,
    ) -> None:
        if self.user_version_provider is not None:
            user_id = record.get("user_id")
            if not isinstance(user_id, str) or not user_id:
                raise SessionExpiredError()
            current = await self.user_version_provider(user_id, session)
            if current != record["token_version"]:
                raise SessionExpiredError()
            return
        _check_token_version(record, context)


class MongoSessionStore:
    """Motor/PyMongo-compatible adapter for the dedicated admin_sessions collection."""

    def __init__(self, database):
        self.collection = database.admin_sessions

    async def create(self, document: dict, *, session) -> None:
        await self.collection.insert_one(document, session=session)

    async def find_by_access_hash(self, access_hash: str, *, session=None):
        return await self.collection.find_one(
            {"access_hash": access_hash}, {"_id": 0}, session=session
        )

    async def find_by_session_hash(self, session_hash: str, *, session=None):
        return await self.collection.find_one(
            {
                "$or": [
                    {"session_hash": session_hash},
                    {"rotated_session_hashes": session_hash},
                ]
            },
            {"_id": 0},
            session=session,
        )

    async def touch(
        self,
        session_id: str,
        access_hash: str,
        *,
        last_seen_at: datetime,
        idle_expires_at: datetime,
    ) -> bool:
        result = await self.collection.update_one(
            {"id": session_id, "access_hash": access_hash, "revoked_at": None},
            {
                "$set": {
                    "last_seen_at": last_seen_at,
                    "idle_expires_at": idle_expires_at,
                }
            },
        )
        return result.matched_count == 1

    async def rotate(
        self,
        session_id: str,
        expected_session_hash: str,
        replacement: Mapping[str, object],
        *,
        session,
    ) -> bool:
        result = await self.collection.update_one(
            {
                "id": session_id,
                "session_hash": expected_session_hash,
                "revoked_at": None,
            },
            {
                "$set": dict(replacement),
                "$push": {"rotated_session_hashes": expected_session_hash},
            },
            session=session,
        )
        return result.modified_count == 1

    async def revoke_family(
        self, session_id: str, reason: str, revoked_at: datetime, *, session
    ) -> bool:
        result = await self.collection.update_one(
            {"id": session_id, "revoked_at": None},
            {"$set": {"revoked_at": revoked_at, "revocation_reason": reason}},
            session=session,
        )
        return result.modified_count == 1

    async def revoke_user(
        self, user_id: str, reason: str, revoked_at: datetime, *, session
    ) -> int:
        result = await self.collection.update_many(
            {"user_id": user_id, "revoked_at": None},
            {"$set": {"revoked_at": revoked_at, "revocation_reason": reason}},
            session=session,
        )
        return result.modified_count


def access_cookie_options() -> dict[str, object]:
    return {**COOKIE_COMMON, "max_age": int(ACCESS_TTL.total_seconds())}


def session_cookie_options(remember_me: bool) -> dict[str, object]:
    options: dict[str, object] = dict(COOKIE_COMMON)
    if remember_me:
        options["max_age"] = int(REMEMBER_ABSOLUTE_TTL.total_seconds())
    return options


def clear_cookie_options() -> dict[str, object]:
    return dict(COOKIE_COMMON)


def _grant(record, access_secret, session_secret, csrf_token) -> SessionGrant:
    return SessionGrant(
        session_id=record["id"],
        user_id=record["user_id"],
        access_secret=access_secret,
        session_secret=session_secret,
        csrf_token=csrf_token,
        access_expires_at=_record_time(record, "access_expires_at"),
        idle_expires_at=_record_time(record, "idle_expires_at"),
        absolute_expires_at=_record_time(record, "absolute_expires_at"),
        remember_me=record["remember_me"],
    )


def _authenticated(record) -> AuthenticatedSession:
    return AuthenticatedSession(
        session_id=record["id"],
        user_id=record["user_id"],
        token_version=record["token_version"],
        remember_me=record["remember_me"],
        access_expires_at=_record_time(record, "access_expires_at"),
        idle_expires_at=_record_time(record, "idle_expires_at"),
        absolute_expires_at=_record_time(record, "absolute_expires_at"),
        _csrf_digest=record["csrf_digest"],
    )


def _encode_token(value: bytes) -> str:
    if not isinstance(value, bytes) or len(value) < 32:
        raise SessionInputError("token_factory_must_return_at_least_256_bits")
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _hash_secret(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _context_secret(context: Mapping[str, object], name: str) -> str:
    value = context.get(name)
    if not isinstance(value, str) or not 1 <= len(value) <= 1024:
        raise SessionExpiredError()
    return value


def _check_token_version(record, context: Mapping[str, object]) -> None:
    current = context.get("token_version")
    if not isinstance(current, int) or isinstance(current, bool):
        raise SessionExpiredError()
    if current != record["token_version"]:
        raise SessionExpiredError()


def _is_expired(record, now: datetime) -> bool:
    return bool(
        record.get("revoked_at") is not None
        or now >= _record_time(record, "access_expires_at")
        or _is_session_expired(record, now)
    )


def _is_session_expired(record, now: datetime) -> bool:
    return bool(
        record.get("revoked_at") is not None
        or now >= _record_time(record, "idle_expires_at")
        or now >= _record_time(record, "absolute_expires_at")
    )


def _user_identity(user: Mapping[str, object]) -> tuple[str, int]:
    user_id, token_version = user.get("id"), user.get("token_version", 0)
    if not isinstance(user_id, str) or not user_id:
        raise SessionInputError("user_id_required")
    if not isinstance(token_version, int) or isinstance(token_version, bool):
        raise SessionInputError("token_version_required")
    return user_id, token_version


def _record_time(record: Mapping[str, object], field_name: str) -> datetime:
    value = record.get(field_name)
    if not isinstance(value, datetime):
        raise SessionExpiredError()
    if value.tzinfo is None or value.utcoffset() is None:
        return value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc)


def _session_id(session) -> str:
    value = (
        session
        if isinstance(session, str)
        else (
            session.session_id
            if isinstance(session, AuthenticatedSession)
            else session.get("id")
        )
    )
    if not isinstance(value, str) or not value:
        raise SessionInputError("session_id_required")
    return value


def _reason(value: str) -> str:
    if not isinstance(value, str) or not _SAFE_REASON.fullmatch(value):
        raise SessionInputError("safe_revocation_reason_required")
    return value


def _idle_ttl(remember_me: bool) -> timedelta:
    return REMEMBER_IDLE_TTL if remember_me else DEFAULT_IDLE_TTL


def _absolute_ttl(remember_me: bool) -> timedelta:
    return REMEMBER_ABSOLUTE_TTL if remember_me else DEFAULT_ABSOLUTE_TTL


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise SessionInputError("session_clock_must_be_timezone_aware")
    return value.astimezone(timezone.utc)
