"""Server-side authentication sessions for NIUVA.

Access credentials are short-lived JWTs carried only in HttpOnly cookies.
Refresh credentials are opaque, single-use values whose hashes are stored in
MongoDB.  The raw refresh credential is never persisted.
"""

from __future__ import annotations

import hashlib
import hmac
import os
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from fastapi import HTTPException, Request, Response
from permissions import ROLE_POLICY_VERSION

AUTH_POLICY_VERSION = "2026-07-27-secure-cookie-v1"
ACCESS_TTL = timedelta(minutes=15)
REFRESH_TTL = timedelta(days=7)
ACCESS_COOKIE = "niuva_access"
REFRESH_COOKIE = "niuva_refresh"
CSRF_COOKIE = "niuva_csrf"
CSRF_HEADER = "X-CSRF-Token"


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _constant_equals(left: str, right: str) -> bool:
    return hmac.compare_digest(left.encode("utf-8"), right.encode("utf-8"))


def _cookie_secure() -> bool:
    configured = os.environ.get("AUTH_COOKIE_SECURE")
    if configured is not None:
        return configured.strip().lower() == "true"
    return os.environ.get("APP_ENV", "production").strip().lower() not in {
        "development",
        "demo",
        "test",
    }


def validate_cookie_configuration() -> None:
    environment = os.environ.get("APP_ENV", "production").strip().lower()
    if environment not in {"development", "demo", "test"} and not _cookie_secure():
        raise RuntimeError(
            "AUTH_COOKIE_SECURE must be true outside development, demo, or test"
        )
    if os.environ.get("AUTH_COOKIE_DOMAIN", "").strip():
        raise RuntimeError(
            "AUTH_COOKIE_DOMAIN must be empty; customer cookies are host-only"
        )


def _cookie_domain() -> str | None:
    return None


def _set_cookie(
    response: Response,
    *,
    key: str,
    value: str,
    max_age: int,
    httponly: bool,
    path: str = "/",
) -> None:
    response.set_cookie(
        key=key,
        value=value,
        max_age=max_age,
        expires=max_age,
        secure=_cookie_secure(),
        httponly=httponly,
        samesite="lax",
        domain=_cookie_domain(),
        path=path,
    )


def clear_auth_cookies(response: Response) -> None:
    domain = _cookie_domain()
    response.delete_cookie(
        ACCESS_COOKIE,
        path="/",
        domain=domain,
        secure=_cookie_secure(),
        httponly=True,
        samesite="lax",
    )
    response.delete_cookie(
        REFRESH_COOKIE,
        path="/api/auth",
        domain=domain,
        secure=_cookie_secure(),
        httponly=True,
        samesite="lax",
    )
    response.delete_cookie(
        CSRF_COOKIE,
        path="/",
        domain=domain,
        secure=_cookie_secure(),
        httponly=False,
        samesite="lax",
    )


class AuthSessionService:
    def __init__(self, *, db, jwt_secret: str, jwt_algorithm: str):
        self.db = db
        self.jwt_secret = jwt_secret
        self.jwt_algorithm = jwt_algorithm

    def _encode_access(self, user: dict, session_id: str) -> str:
        now = utc_now()
        return jwt.encode(
            {
                "sub": user["id"],
                "sid": session_id,
                "jti": str(uuid.uuid4()),
                "type": "access",
                "auth_policy_version": AUTH_POLICY_VERSION,
                "token_version": user.get("token_version", 0),
                "iat": now,
                "exp": now + ACCESS_TTL,
            },
            self.jwt_secret,
            algorithm=self.jwt_algorithm,
        )

    def encode_test_access(self, user_id: str, token_version: int = 0) -> str:
        """Create a current-policy credential for isolated test fixtures only."""
        now = utc_now()
        return jwt.encode(
            {
                "sub": user_id,
                "sid": f"test:{uuid.uuid4()}",
                "jti": str(uuid.uuid4()),
                "type": "access",
                "auth_policy_version": AUTH_POLICY_VERSION,
                "token_version": token_version,
                "iat": now,
                "exp": now + ACCESS_TTL,
            },
            self.jwt_secret,
            algorithm=self.jwt_algorithm,
        )

    @staticmethod
    def _refresh_cookie_value(session_id: str, raw_token: str) -> str:
        return f"{session_id}.{raw_token}"

    @staticmethod
    def _parse_refresh_cookie(value: str | None) -> tuple[str, str]:
        if not value or "." not in value:
            raise HTTPException(status_code=401, detail="Session invalid")
        session_id, raw_token = value.split(".", 1)
        if not session_id or not raw_token:
            raise HTTPException(status_code=401, detail="Session invalid")
        return session_id, raw_token

    def _write_cookies(
        self,
        response: Response,
        *,
        access_token: str,
        session_id: str,
        refresh_token: str,
        csrf_token: str,
    ) -> None:
        _set_cookie(
            response,
            key=ACCESS_COOKIE,
            value=access_token,
            max_age=int(ACCESS_TTL.total_seconds()),
            httponly=True,
        )
        _set_cookie(
            response,
            key=REFRESH_COOKIE,
            value=self._refresh_cookie_value(session_id, refresh_token),
            max_age=int(REFRESH_TTL.total_seconds()),
            httponly=True,
            path="/api/auth",
        )
        _set_cookie(
            response,
            key=CSRF_COOKIE,
            value=csrf_token,
            max_age=int(REFRESH_TTL.total_seconds()),
            httponly=False,
        )

    async def issue(self, user: dict, response: Response) -> None:
        now = utc_now()
        session_id = str(uuid.uuid4())
        family_id = str(uuid.uuid4())
        refresh_token = secrets.token_urlsafe(48)
        csrf_token = secrets.token_urlsafe(32)
        session = {
            "id": session_id,
            "family_id": family_id,
            "user_id": user["id"],
            "refresh_hash": _sha256(refresh_token),
            "csrf_hash": _sha256(csrf_token),
            "auth_policy_version": AUTH_POLICY_VERSION,
            "token_version": user.get("token_version", 0),
            "status": "active",
            "created_at": now,
            "updated_at": now,
            "last_used_at": now,
            "expires_at": now + REFRESH_TTL,
            "revoked_at": None,
            "revoke_reason": None,
        }
        await self.db.auth_sessions.insert_one(session)
        self._write_cookies(
            response,
            access_token=self._encode_access(user, session_id),
            session_id=session_id,
            refresh_token=refresh_token,
            csrf_token=csrf_token,
        )

    def decode_access(self, token: str) -> dict[str, Any]:
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm],
                options={
                    "require": [
                        "sub",
                        "sid",
                        "jti",
                        "exp",
                        "iat",
                        "type",
                        "auth_policy_version",
                    ]
                },
            )
            if (
                payload.get("type") != "access"
                or payload.get("auth_policy_version") != AUTH_POLICY_VERSION
            ):
                raise jwt.InvalidTokenError("Unsupported authentication policy")
            return payload
        except jwt.ExpiredSignatureError as exc:
            raise HTTPException(status_code=401, detail="Session expired") from exc
        except jwt.InvalidTokenError as exc:
            raise HTTPException(status_code=401, detail="Session invalid") from exc

    def decode_access_for_logout(self, token: str | None) -> dict[str, Any] | None:
        """Verify identity while allowing expiry solely for session revocation."""
        if not token:
            return None
        try:
            payload = jwt.decode(
                token,
                self.jwt_secret,
                algorithms=[self.jwt_algorithm],
                options={
                    "require": [
                        "sub",
                        "sid",
                        "jti",
                        "exp",
                        "iat",
                        "type",
                        "auth_policy_version",
                    ],
                    "verify_exp": False,
                },
            )
            if (
                payload.get("type") != "access"
                or payload.get("auth_policy_version") != AUTH_POLICY_VERSION
            ):
                return None
            return payload
        except jwt.InvalidTokenError:
            return None

    @staticmethod
    def _not_expired(value: Any) -> bool:
        if isinstance(value, datetime):
            moment = value
        elif isinstance(value, str):
            try:
                moment = datetime.fromisoformat(value)
            except ValueError:
                return False
        else:
            return False
        if moment.tzinfo is None:
            moment = moment.replace(tzinfo=timezone.utc)
        return moment > utc_now()

    async def authenticate(
        self,
        token: str,
        *,
        allow_test_token: bool = False,
    ) -> dict:
        payload = self.decode_access(token)
        session_id = str(payload["sid"])
        if session_id.startswith("test:") and allow_test_token:
            session = {
                "user_id": payload["sub"],
                "token_version": payload.get("token_version", 0),
                "status": "active",
                "expires_at": utc_now() + ACCESS_TTL,
            }
        else:
            session = await self.db.auth_sessions.find_one(
                {
                    "id": session_id,
                    "user_id": payload["sub"],
                    "status": "active",
                    "auth_policy_version": AUTH_POLICY_VERSION,
                },
                {"_id": 0},
            )
        if not session or not self._not_expired(session.get("expires_at")):
            raise HTTPException(status_code=401, detail="Session invalid")

        user = await self.db.users.find_one(
            {"id": payload["sub"]},
            {"_id": 0, "password_hash": 0},
        )
        if not user:
            raise HTTPException(status_code=401, detail="Session invalid")
        if (
            user.get("status", "active") != "active"
            or user.get("access_state", "approved") == "access_review_required"
            or user.get("role_policy_version") != ROLE_POLICY_VERSION
            or payload.get("token_version", 0) != user.get("token_version", 0)
            or session.get("token_version", 0) != user.get("token_version", 0)
        ):
            raise HTTPException(status_code=401, detail="Session invalid")
        return user

    async def refresh(self, request: Request, response: Response) -> dict:
        session_id, raw_token = self._parse_refresh_cookie(
            request.cookies.get(REFRESH_COOKIE)
        )
        session = await self.db.auth_sessions.find_one(
            {"id": session_id},
            {"_id": 0},
        )
        supplied_hash = _sha256(raw_token)
        if not session:
            clear_auth_cookies(response)
            raise HTTPException(status_code=401, detail="Session invalid")
        if (
            session.get("status") != "active"
            or session.get("auth_policy_version") != AUTH_POLICY_VERSION
            or not self._not_expired(session.get("expires_at"))
        ):
            clear_auth_cookies(response)
            raise HTTPException(status_code=401, detail="Session invalid")
        if not _constant_equals(session.get("refresh_hash", ""), supplied_hash):
            await self.db.auth_sessions.update_many(
                {"family_id": session["family_id"], "status": "active"},
                {
                    "$set": {
                        "status": "revoked",
                        "revoked_at": utc_now(),
                        "revoke_reason": "refresh_replay",
                        "updated_at": utc_now(),
                    }
                },
            )
            clear_auth_cookies(response)
            raise HTTPException(status_code=401, detail="Session invalid")

        csrf_cookie = request.cookies.get(CSRF_COOKIE, "")
        csrf_header = request.headers.get(CSRF_HEADER, "")
        if (
            not csrf_cookie
            or not csrf_header
            or not _constant_equals(csrf_cookie, csrf_header)
            or not _constant_equals(
                session.get("csrf_hash", ""),
                _sha256(csrf_cookie),
            )
        ):
            raise HTTPException(status_code=403, detail="CSRF validation failed")

        user = await self.db.users.find_one(
            {"id": session["user_id"]},
            {"_id": 0},
        )
        if (
            not user
            or user.get("status", "active") != "active"
            or user.get("access_state", "approved") == "access_review_required"
            or user.get("role_policy_version") != ROLE_POLICY_VERSION
            or session.get("token_version", 0) != user.get("token_version", 0)
        ):
            await self.revoke_family(session["family_id"], reason="account_ineligible")
            clear_auth_cookies(response)
            raise HTTPException(status_code=401, detail="Session invalid")

        next_refresh = secrets.token_urlsafe(48)
        next_csrf = secrets.token_urlsafe(32)
        now = utc_now()
        result = await self.db.auth_sessions.update_one(
            {
                "id": session_id,
                "status": "active",
                "refresh_hash": supplied_hash,
            },
            {
                "$set": {
                    "refresh_hash": _sha256(next_refresh),
                    "csrf_hash": _sha256(next_csrf),
                    "last_used_at": now,
                    "updated_at": now,
                },
                "$inc": {"rotation": 1},
            },
        )
        if not getattr(result, "matched_count", 0):
            await self.revoke_family(session["family_id"], reason="refresh_replay")
            clear_auth_cookies(response)
            raise HTTPException(status_code=401, detail="Session invalid")

        self._write_cookies(
            response,
            access_token=self._encode_access(user, session_id),
            session_id=session_id,
            refresh_token=next_refresh,
            csrf_token=next_csrf,
        )
        return user

    async def revoke_family(self, family_id: str, *, reason: str) -> None:
        now = utc_now()
        await self.db.auth_sessions.update_many(
            {"family_id": family_id, "status": "active"},
            {
                "$set": {
                    "status": "revoked",
                    "revoked_at": now,
                    "revoke_reason": reason,
                    "updated_at": now,
                }
            },
        )

    async def logout(self, request: Request, response: Response) -> None:
        family_id = None
        value = request.cookies.get(REFRESH_COOKIE)
        if value:
            try:
                session_id, _raw = self._parse_refresh_cookie(value)
            except HTTPException:
                session_id = ""
            if session_id:
                session = await self.db.auth_sessions.find_one(
                    {"id": session_id},
                    {"_id": 0, "family_id": 1},
                )
                if session and session.get("family_id"):
                    family_id = session["family_id"]

        if family_id is None:
            payload = self.decode_access_for_logout(request.cookies.get(ACCESS_COOKIE))
            if payload and not str(payload["sid"]).startswith("test:"):
                session = await self.db.auth_sessions.find_one(
                    {
                        "id": str(payload["sid"]),
                        "user_id": str(payload["sub"]),
                        "auth_policy_version": AUTH_POLICY_VERSION,
                    },
                    {"_id": 0, "family_id": 1},
                )
                if session and session.get("family_id"):
                    family_id = session["family_id"]

        if family_id is not None:
            await self.revoke_family(
                family_id,
                reason="logout",
            )
        clear_auth_cookies(response)

    async def revoke_user_sessions(
        self, user_id: str, *, reason: str, session=None
    ) -> None:
        now = utc_now()
        options = {"session": session} if session is not None else {}
        await self.db.auth_sessions.update_many(
            {"user_id": user_id, "status": "active"},
            {
                "$set": {
                    "status": "revoked",
                    "revoked_at": now,
                    "revoke_reason": reason,
                    "updated_at": now,
                }
            },
            **options,
        )
