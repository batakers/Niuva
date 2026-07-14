"""Email notifications via Resend with graceful in-app fallback."""
import os
import asyncio
import logging

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _wrap(title: str, body_html: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0B10;padding:32px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#13151F;border:1px solid #2B2F42;border-radius:8px;overflow:hidden;">
          <tr><td style="background:#4A72A0;padding:20px 28px;">
            <span style="color:#FFFFFF;font-size:20px;font-weight:700;letter-spacing:1px;">NIUVA</span>
            <span style="color:#FFFFFF;font-size:12px;"> &nbsp;Inovasi Utama</span>
          </td></tr>
          <tr><td style="padding:28px;">
            <h1 style="color:#F8FAFC;font-size:20px;margin:0 0 16px;">{title}</h1>
            <div style="color:#94A3B8;font-size:14px;line-height:1.6;">{body_html}</div>
          </td></tr>
          <tr><td style="padding:18px 28px;border-top:1px solid #2B2F42;color:#64748B;font-size:12px;">
            PT Niuva Inovasi Utama — Bandung, Indonesia
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


async def send_email(to_email: str, subject: str, title: str, body_html: str, db=None, user_id: str = None):
    """Send email via Resend; always store an in-app notification as fallback."""
    html = _wrap(title, body_html)
    if db is not None:
        import uuid
        from datetime import datetime, timezone
        await db.notifications.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "to_email": to_email,
            "subject": subject,
            "title": title,
            "body_html": body_html,
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    if not RESEND_API_KEY:
        logger.info(f"[EMAIL-MOCK] To {to_email} | {subject}")
        return {"status": "mock", "to": to_email}

    params = {"from": SENDER_EMAIL, "to": [to_email], "subject": subject, "html": html}
    try:
        result = await asyncio.to_thread(resend.Emails.send, params)
        return {"status": "sent", "id": result.get("id")}
    except Exception as e:
        logger.error(f"Resend failed: {e}")
        return {"status": "error", "error": str(e)}
