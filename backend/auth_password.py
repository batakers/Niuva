"""Backend-owned password policy and hash compatibility module.

The public interface deliberately keeps callers unaware of hash formats,
blocklist storage, and Argon2 parameters. New writes fail closed unless both
the offline policy input and the staged write gate are available.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Protocol

import bcrypt
from argon2 import PasswordHasher, Type
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

MIN_PASSWORD_CODE_POINTS = 15
MAX_PASSWORD_CODE_POINTS = 128
MAX_PASSWORD_UTF8_BYTES = 512

ARGON2_MEMORY_COST_KIB = 19_456
ARGON2_TIME_COST = 2
ARGON2_PARALLELISM = 1
ARGON2_HASH_LENGTH = 32
ARGON2_SALT_LENGTH = 16

_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2y$")
_ARGON2_PREFIX = "$argon2id$"
_DUMMY_BCRYPT_HASH = "$2b$12$XkHg95jvl7fV2g.2rkFkx.kcZpo2c1C790fDECpag42ZG5NPcLCH2"


class PasswordPolicyError(ValueError):
    """Safe, stable rejection from the password-creation policy."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


class PasswordPolicyUnavailableError(PasswordPolicyError):
    """The required offline blocklist cannot be evaluated."""


class PasswordWriteDisabledError(RuntimeError):
    """New Argon2 writes are disabled by the staged rollout gate."""

    def __init__(self, code: str = "password_writes_disabled"):
        super().__init__(code)
        self.code = code


@dataclass(frozen=True)
class PasswordVerification:
    valid: bool
    algorithm: str | None = None
    needs_rehash: bool = False


class PasswordBlocklist(Protocol):
    def contains(self, candidate: str) -> bool: ...


class FilePasswordBlocklist:
    """Offline, whole-value blocklist adapter.

    The file is deliberately loaded for each policy evaluation so a missing or
    unreadable operator-owned dataset cannot silently become an allow-all
    cache. Empty lines and lines starting with ``#`` are ignored.
    """

    def __init__(self, path: str | Path):
        self.path = Path(path)

    def contains(self, candidate: str) -> bool:
        try:
            with self.path.open("r", encoding="utf-8") as source:
                blocked = set()
                for line in source:
                    value = line.rstrip("\r\n")
                    if value and not value.lstrip().startswith("#"):
                        blocked.add(value.casefold())
        except (OSError, UnicodeError) as error:
            raise PasswordPolicyUnavailableError(
                "password_policy_unavailable"
            ) from error
        return candidate.casefold() in blocked


class UnavailablePasswordBlocklist:
    def contains(self, candidate: str) -> bool:
        raise PasswordPolicyUnavailableError("password_policy_unavailable")


class AuthPassword:
    """Deep password module used by creation, reset, bootstrap, and login."""

    def __init__(
        self,
        *,
        blocklist: PasswordBlocklist,
        argon2_writes_enabled: bool,
        argon2_hasher: PasswordHasher | None = None,
    ):
        self.blocklist = blocklist
        self.argon2_writes_enabled = argon2_writes_enabled
        self.argon2_hasher = argon2_hasher or _build_argon2_hasher()

    def public_policy(self) -> dict[str, int | bool]:
        return {
            "min_code_points": MIN_PASSWORD_CODE_POINTS,
            "max_code_points": MAX_PASSWORD_CODE_POINTS,
            "max_utf8_bytes": MAX_PASSWORD_UTF8_BYTES,
            "spaces_allowed": True,
            "unicode_allowed": True,
            "composition_required": False,
            "blocklist_checked": True,
        }

    def validate_new_password(
        self,
        candidate: str,
        context_terms: Iterable[str] = (),
    ) -> None:
        if not isinstance(candidate, str):
            raise PasswordPolicyError("password_invalid_type")
        if len(candidate) < MIN_PASSWORD_CODE_POINTS:
            raise PasswordPolicyError("password_too_short")
        if len(candidate) > MAX_PASSWORD_CODE_POINTS:
            raise PasswordPolicyError("password_too_long")
        if len(candidate.encode("utf-8")) > MAX_PASSWORD_UTF8_BYTES:
            raise PasswordPolicyError("password_too_long")

        folded_candidate = candidate.casefold()
        if any(
            isinstance(term, str) and term and folded_candidate == term.casefold()
            for term in context_terms
        ):
            raise PasswordPolicyError("password_context_match")
        if self.blocklist.contains(candidate):
            raise PasswordPolicyError("password_blocklisted")

    def hash_new_password(
        self,
        candidate: str,
        context_terms: Iterable[str] = (),
    ) -> str:
        self.validate_new_password(candidate, context_terms)
        if not self.argon2_writes_enabled:
            raise PasswordWriteDisabledError()
        return self.argon2_hasher.hash(candidate)

    def verify_password(
        self, candidate: object, stored_hash: object
    ) -> PasswordVerification:
        if not isinstance(candidate, str) or not isinstance(stored_hash, str):
            self._dummy_verify()
            return PasswordVerification(valid=False)
        if (
            len(candidate) > MAX_PASSWORD_CODE_POINTS
            or len(candidate.encode("utf-8")) > MAX_PASSWORD_UTF8_BYTES
        ):
            self._dummy_verify()
            return PasswordVerification(valid=False)

        if stored_hash.startswith(_ARGON2_PREFIX):
            try:
                self.argon2_hasher.verify(stored_hash, candidate)
            except (InvalidHashError, VerificationError, VerifyMismatchError):
                return PasswordVerification(valid=False, algorithm="argon2id")
            return PasswordVerification(
                valid=True,
                algorithm="argon2id",
                needs_rehash=self.argon2_hasher.check_needs_rehash(stored_hash),
            )

        if stored_hash.startswith(_BCRYPT_PREFIXES):
            try:
                bcrypt_valid = bcrypt.checkpw(
                    candidate.encode("utf-8"),
                    stored_hash.encode("ascii"),
                )
            except (ValueError, TypeError, UnicodeError):
                bcrypt_valid = False
            return PasswordVerification(
                valid=bcrypt_valid,
                algorithm="bcrypt",
                needs_rehash=bcrypt_valid,
            )

        self._dummy_verify()
        return PasswordVerification(valid=False)

    @staticmethod
    def _dummy_verify() -> None:
        try:
            bcrypt.checkpw(
                b"invalid password candidate", _DUMMY_BCRYPT_HASH.encode("ascii")
            )
        except ValueError:
            pass


def _build_argon2_hasher() -> PasswordHasher:
    return PasswordHasher(
        memory_cost=ARGON2_MEMORY_COST_KIB,
        time_cost=ARGON2_TIME_COST,
        parallelism=ARGON2_PARALLELISM,
        hash_len=ARGON2_HASH_LENGTH,
        salt_len=ARGON2_SALT_LENGTH,
        type=Type.ID,
    )


def build_password_module(
    *,
    blocklist_path: str | Path | None,
    argon2_writes_enabled: bool,
) -> AuthPassword:
    blocklist: PasswordBlocklist
    if blocklist_path is None:
        blocklist = UnavailablePasswordBlocklist()
    else:
        blocklist = FilePasswordBlocklist(blocklist_path)
    return AuthPassword(
        blocklist=blocklist,
        argon2_writes_enabled=argon2_writes_enabled,
    )
