"""Shared Admin/Customer password-recovery module.

The three public methods are the approved recovery interface. Persistence,
transactions, origin selection, password policy, delivery, clock, and secure
randomness are injected internal seams so handlers only translate safe results.
"""

from __future__ import annotations

import hashlib
import ipaddress
import secrets
import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Awaitable, Callable, Mapping, Protocol, TypeGuard, TypeVar
from urllib.parse import quote, urlsplit

from permissions import canonical_roles

RESET_TOKEN_TTL = timedelta(minutes=30)
GENERIC_PASSWORD_RESET_REQUEST = {
    "ok": True,
    "message": "Jika email terdaftar, instruksi reset password telah dikirim.",
}
INVALID_RESET_CODE = "password_reset_invalid"


class PublicSiteOriginError(ValueError):
    pass


@dataclass(frozen=True)
class PublicSiteOrigin:
    value: str

    @classmethod
    def parse(cls, value: str, *, local_mode: bool = False) -> "PublicSiteOrigin":
        if not isinstance(value, str) or not value:
            raise PublicSiteOriginError("public_site_origin_invalid")
        parsed = urlsplit(value)
        if (
            not parsed.scheme
            or not parsed.netloc
            or parsed.username is not None
            or parsed.password is not None
            or parsed.query
            or parsed.fragment
            or parsed.path not in ("", "/")
        ):
            raise PublicSiteOriginError("public_site_origin_invalid")
        try:
            hostname = parsed.hostname
            parsed.port
        except ValueError as error:
            raise PublicSiteOriginError("public_site_origin_invalid") from error
        if not hostname:
            raise PublicSiteOriginError("public_site_origin_invalid")

        if parsed.scheme == "https":
            pass
        elif parsed.scheme == "http" and local_mode and _is_local_host(hostname):
            pass
        else:
            raise PublicSiteOriginError("public_site_origin_invalid")

        return cls(value=value.rstrip("/"))

    def password_reset_url(self, raw_token: str) -> str:
        return f"{self.value}/reset-password?token={quote(raw_token, safe='')}"


@dataclass(frozen=True)
class PasswordResetValidation:
    valid: bool
    code: str | None = None


@dataclass(frozen=True)
class PasswordResetCompletion:
    ok: bool
    code: str | None = None
    message: str | None = None


class PasswordModule(Protocol):
    def hash_new_password(self, candidate: str, context_terms=()) -> str: ...


class RecoveryDelivery(Protocol):
    async def send_password_reset(
        self,
        *,
        email: str,
        reset_url: str,
        expires_at: datetime,
    ) -> object: ...

    async def send_password_changed(self, *, email: str) -> object: ...


class RecoveryStore(Protocol):
    async def find_user_by_email(self, email: str, *, session=None) -> dict | None: ...

    async def find_user_by_id(self, user_id: str, *, session=None) -> dict | None: ...

    async def issue_successor(
        self,
        user_id: str,
        token_document: dict,
        *,
        session,
    ) -> None: ...

    async def find_live_token(
        self,
        token_hash: str,
        now: datetime,
        *,
        session=None,
    ) -> dict | None: ...

    async def invalidate_undelivered(
        self,
        token_id: str,
        invalidated_at: datetime,
        *,
        session,
    ) -> None: ...

    async def complete_password_reset(
        self,
        *,
        token_id: str,
        user_id: str,
        password_hash: str,
        completed_at: datetime,
        session,
    ) -> bool: ...


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


EligibilityPolicy = Callable[[Mapping[str, object]], bool]
Clock = Callable[[], datetime]
TokenFactory = Callable[[], str]


class AuthRecovery:
    def __init__(
        self,
        *,
        store: RecoveryStore,
        transaction_guard: TransactionGuard,
        passwords: PasswordModule,
        delivery: RecoveryDelivery,
        public_site_origin: PublicSiteOrigin | None,
        eligibility: EligibilityPolicy,
        clock: Clock,
        token_factory: TokenFactory,
    ):
        self.store = store
        self.transaction_guard = transaction_guard
        self.passwords = passwords
        self.delivery = delivery
        self.public_site_origin = public_site_origin
        self.eligibility = eligibility
        self.clock = clock
        self.token_factory = token_factory

    async def request_password_reset(
        self,
        normalized_email: str,
        request_context: Mapping[str, object],
    ) -> dict[str, object]:
        del request_context  # Deliberately excluded from token and delivery data.
        generic = dict(GENERIC_PASSWORD_RESET_REQUEST)
        if self.public_site_origin is None:
            return generic

        try:
            user = await self.store.find_user_by_email(normalized_email.casefold())
        except Exception:
            return generic
        if not user or not self.eligibility(user):
            return generic

        raw_token = self.token_factory()
        if not isinstance(raw_token, str) or len(raw_token.encode("utf-8")) < 43:
            return generic
        now = _aware_utc(self.clock())
        token_document = {
            "id": str(uuid.uuid4()),
            "user_id": user["id"],
            "token_hash": _hash_token(raw_token),
            "active": True,
            "created_at": now,
            "expires_at": now + RESET_TOKEN_TTL,
            "used_at": None,
        }

        async def issue(session):
            current = await self.store.find_user_by_id(user["id"], session=session)
            if not current or not self.eligibility(current):
                return False
            await self.store.issue_successor(
                user["id"], token_document, session=session
            )
            return True

        try:
            issued = await self.transaction_guard.run(
                issue,
                operation_name="auth.password_recovery.issue",
            )
        except Exception:
            return generic
        if not issued:
            return generic

        try:
            await self.delivery.send_password_reset(
                email=user["email"],
                reset_url=self.public_site_origin.password_reset_url(raw_token),
                expires_at=token_document["expires_at"],
            )
        except Exception:

            async def invalidate(session):
                await self.store.invalidate_undelivered(
                    token_document["id"],
                    _aware_utc(self.clock()),
                    session=session,
                )

            try:
                await self.transaction_guard.run(
                    invalidate,
                    operation_name="auth.password_recovery.invalidate_undelivered",
                )
            except Exception:
                pass
        return generic

    async def validate_password_reset(
        self,
        raw_token: object,
    ) -> PasswordResetValidation:
        if not _valid_raw_token_shape(raw_token):
            return _invalid_validation()
        record = await self.store.find_live_token(
            _hash_token(raw_token),
            _aware_utc(self.clock()),
        )
        if not record:
            return _invalid_validation()
        user = await self.store.find_user_by_id(record["user_id"])
        if not user or not self.eligibility(user):
            return _invalid_validation()
        return PasswordResetValidation(valid=True)

    async def complete_password_reset(
        self,
        raw_token: object,
        new_password: str,
    ) -> PasswordResetCompletion:
        if not _valid_raw_token_shape(raw_token):
            return _invalid_completion()
        token_hash = _hash_token(raw_token)

        async def complete(session):
            now = _aware_utc(self.clock())
            record = await self.store.find_live_token(
                token_hash,
                now,
                session=session,
            )
            if not record:
                return _invalid_completion(), None
            user = await self.store.find_user_by_id(record["user_id"], session=session)
            if not user or not self.eligibility(user):
                return _invalid_completion(), None
            context_terms = tuple(
                value
                for value in (user.get("email"), user.get("name"))
                if isinstance(value, str) and value
            )
            password_hash = self.passwords.hash_new_password(
                new_password,
                context_terms=context_terms,
            )
            changed = await self.store.complete_password_reset(
                token_id=record["id"],
                user_id=user["id"],
                password_hash=password_hash,
                completed_at=now,
                session=session,
            )
            if not changed:
                return _invalid_completion(), None
            return (
                PasswordResetCompletion(
                    ok=True,
                    message=(
                        "Password berhasil diubah. Silakan login dengan password baru."
                    ),
                ),
                user["email"],
            )

        result, notification_email = await self.transaction_guard.run(
            complete,
            operation_name="auth.password_recovery.complete",
            retry_safe=True,
        )
        if result.ok and notification_email:
            try:
                await self.delivery.send_password_changed(email=notification_email)
            except Exception:
                pass
        return result


class MongoRecoveryStore:
    """Motor-compatible production persistence adapter for AuthRecovery."""

    def __init__(self, database):
        self.database = database

    async def find_user_by_email(self, email: str, *, session=None) -> dict | None:
        return await self.database.users.find_one(
            {"email": email},
            {"_id": 0},
            session=session,
        )

    async def find_user_by_id(self, user_id: str, *, session=None) -> dict | None:
        return await self.database.users.find_one(
            {"id": user_id},
            {"_id": 0},
            session=session,
        )

    async def issue_successor(
        self,
        user_id: str,
        token_document: dict,
        *,
        session,
    ) -> None:
        await self.database.password_reset_tokens.update_many(
            {"user_id": user_id, "active": True},
            {
                "$set": {
                    "active": False,
                    "invalidated_at": token_document["created_at"],
                    "invalidation_reason": "superseded",
                }
            },
            session=session,
        )
        await self.database.password_reset_tokens.insert_one(
            token_document,
            session=session,
        )

    async def find_live_token(
        self,
        token_hash: str,
        now: datetime,
        *,
        session=None,
    ) -> dict | None:
        return await self.database.password_reset_tokens.find_one(
            {
                "token_hash": token_hash,
                "active": True,
                "expires_at": {"$gt": now},
            },
            {"_id": 0},
            session=session,
        )

    async def invalidate_undelivered(
        self,
        token_id: str,
        invalidated_at: datetime,
        *,
        session,
    ) -> None:
        await self.database.password_reset_tokens.update_one(
            {"id": token_id, "active": True},
            {
                "$set": {
                    "active": False,
                    "invalidated_at": invalidated_at,
                    "invalidation_reason": "delivery_failed",
                }
            },
            session=session,
        )

    async def complete_password_reset(
        self,
        *,
        token_id: str,
        user_id: str,
        password_hash: str,
        completed_at: datetime,
        session,
    ) -> bool:
        claim = await self.database.password_reset_tokens.update_one(
            {"id": token_id, "user_id": user_id, "active": True},
            {
                "$set": {
                    "active": False,
                    "used_at": completed_at,
                    "invalidation_reason": "consumed",
                }
            },
            session=session,
        )
        if claim.modified_count != 1:
            return False
        user_update = await self.database.users.update_one(
            {"id": user_id},
            {
                "$set": {"password_hash": password_hash},
                "$inc": {"token_version": 1},
            },
            session=session,
        )
        if user_update.matched_count != 1:
            raise RuntimeError("password_reset_user_missing")
        await self.database.password_reset_tokens.update_many(
            {"user_id": user_id, "active": True},
            {
                "$set": {
                    "active": False,
                    "invalidated_at": completed_at,
                    "invalidation_reason": "password_reset",
                }
            },
            session=session,
        )
        return True


def default_recovery_eligibility(user: Mapping[str, object]) -> bool:
    if user.get("disabled") is True:
        return False
    return bool(canonical_roles(dict(user)))


def build_recovery_module(
    *,
    store: RecoveryStore,
    transaction_guard: TransactionGuard,
    passwords: PasswordModule,
    delivery: RecoveryDelivery,
    public_site_origin: PublicSiteOrigin | None,
    eligibility: EligibilityPolicy = default_recovery_eligibility,
    clock: Clock = lambda: datetime.now(timezone.utc),
    token_factory: TokenFactory = lambda: secrets.token_urlsafe(32),
) -> AuthRecovery:
    return AuthRecovery(
        store=store,
        transaction_guard=transaction_guard,
        passwords=passwords,
        delivery=delivery,
        public_site_origin=public_site_origin,
        eligibility=eligibility,
        clock=clock,
        token_factory=token_factory,
    )


def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _valid_raw_token_shape(raw_token: object) -> TypeGuard[str]:
    return isinstance(raw_token, str) and 1 <= len(raw_token) <= 1024


def _invalid_validation() -> PasswordResetValidation:
    return PasswordResetValidation(valid=False, code=INVALID_RESET_CODE)


def _invalid_completion() -> PasswordResetCompletion:
    return PasswordResetCompletion(ok=False, code=INVALID_RESET_CODE)


def _aware_utc(value: datetime) -> datetime:
    if value.tzinfo is None or value.utcoffset() is None:
        raise ValueError("recovery_clock_must_be_timezone_aware")
    return value.astimezone(timezone.utc)


def _is_local_host(hostname: str) -> bool:
    if hostname.casefold() == "localhost":
        return True
    try:
        return ipaddress.ip_address(hostname).is_loopback
    except ValueError:
        return False
