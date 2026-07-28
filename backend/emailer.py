"""Email delivery with a token-safe password-recovery adapter."""

from __future__ import annotations

import asyncio
import html
import logging
import os
import uuid
from datetime import datetime, timezone
from typing import Any, Awaitable, Callable

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _wrap(title: str, body_html: str) -> str:
    return (
        '<table width="100%" cellpadding="0" cellspacing="0" '
        'style="background:#0A0B10;padding:32px 0;'
        'font-family:Arial,Helvetica,sans-serif;">'
        '<tr><td align="center">'
        '<table width="560" cellpadding="0" cellspacing="0" '
        'style="background:#13151F;border:1px solid #2B2F42;'
        'border-radius:8px;overflow:hidden;">'
        '<tr><td style="background:#4A72A0;padding:20px 28px;">'
        '<span style="color:#FFFFFF;font-size:20px;font-weight:700;'
        'letter-spacing:1px;">NIUVA</span>'
        '<span style="color:#FFFFFF;font-size:12px;">'
        " &nbsp;Inovasi Utama</span></td></tr>"
        '<tr><td style="padding:28px;">'
        f'<h1 style="color:#F8FAFC;font-size:20px;margin:0 0 16px;">{title}</h1>'
        f'<div style="color:#94A3B8;font-size:14px;line-height:1.6;">'
        f"{body_html}</div></td></tr>"
        '<tr><td style="padding:18px 28px;border-top:1px solid #2B2F42;'
        'color:#64748B;font-size:12px;">'
        "PT Niuva Inovasi Utama — Bandung, Indonesia</td></tr>"
        "</table></td></tr></table>"
    )


async def _send_provider_email(
    *,
    to_email: str,
    subject: str,
    title: str,
    body_html: str,
    idempotency_key: str | None = None,
) -> dict:
    """Send without persisting payloads or exposing raw provider errors."""

    if not RESEND_API_KEY:
        return {"status": "mock", "to": to_email}

    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": _wrap(title, body_html),
        **(
            {"headers": {"Idempotency-Key": idempotency_key}}
            if idempotency_key
            else {}
        ),
    }
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "id": result.get("id")}
    except Exception:
        logger.error("Email provider delivery failed")
        return {"status": "error"}


async def send_email(
    to_email: str,
    subject: str,
    title: str,
    body_html: str,
    db=None,
    user_id: str | None = None,
    idempotency_key: str | None = None,
):
    """Send a general notification and persist its non-secret in-app copy."""

    if db is not None:
        await db.notifications.insert_one(
            {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "to_email": to_email,
                "subject": subject,
                "title": title,
                "body_html": body_html,
                "read": False,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
    return await _send_provider_email(
        to_email=to_email,
        subject=subject,
        title=title,
        body_html=body_html,
        idempotency_key=idempotency_key,
    )


class PasswordRecoveryDeliveryError(RuntimeError):
    """Stable internal error without provider payload or token data."""


ProviderSender = Callable[..., Awaitable[dict]]
DatabaseProvider = Callable[[], Any | None]


class PasswordRecoveryDelivery:
    """Dedicated recovery adapter that never persists a reset URL."""

    def __init__(
        self,
        *,
        get_database: DatabaseProvider = lambda: None,
        provider_sender: ProviderSender = _send_provider_email,
    ):
        self.get_database = get_database
        self.provider_sender = provider_sender

    async def send_password_reset(
        self,
        *,
        email: str,
        reset_url: str,
        expires_at: datetime,
    ) -> None:
        expiry_minutes = max(
            0,
            round((expires_at - datetime.now(timezone.utc)).total_seconds() / 60),
        )
        safe_url = html.escape(reset_url, quote=True)
        result = await self.provider_sender(
            to_email=email,
            subject="Reset Password — NIUVA",
            title="Permintaan reset password",
            body_html=(
                "<p>Kami menerima permintaan untuk mereset password akun Anda.</p>"
                f"<p>Link ini berlaku selama {expiry_minutes} menit: "
                f'<a href="{safe_url}">{safe_url}</a></p>'
                "<p>Jika Anda tidak meminta ini, abaikan email ini.</p>"
            ),
        )
        if result.get("status") == "error":
            raise PasswordRecoveryDeliveryError("password_recovery_delivery_failed")

    async def send_password_changed(self, *, email: str) -> None:
        database = self.get_database()
        user_id = None
        if database is not None:
            user = await database.users.find_one(
                {"email": email},
                {"_id": 0, "id": 1},
            )
            user_id = user.get("id") if user else None
        result = await send_email(
            email,
            "Password NIUVA berhasil diubah",
            "Password berhasil diubah",
            (
                "<p>Password akun Anda berhasil diubah.</p>"
                "<p>Jika Anda tidak melakukan perubahan ini, hubungi "
                "administrator melalui kanal resmi.</p>"
            ),
            db=database,
            user_id=user_id,
        )
        if result.get("status") == "error":
            raise PasswordRecoveryDeliveryError("password_changed_delivery_failed")
