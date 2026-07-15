import uuid
from datetime import datetime, timezone
from typing import Any

SENSITIVE_KEYS = frozenset(
    {
        "password",
        "password_hash",
        "token",
        "access_token",
        "refresh_token",
        "secret",
        "api_key",
        "internal_cost",
        "margin",
        "profit",
        "supplier",
        "supplier_id",
        "internal_note",
        "internal_notes",
    }
)


def _redact(value: Any) -> Any:
    if isinstance(value, dict):
        return {
            key: _redact(item)
            for key, item in value.items()
            if key.lower() not in SENSITIVE_KEYS
        }
    if isinstance(value, list):
        return [_redact(item) for item in value]
    return value


async def append_audit_event(
    db,
    *,
    actor: dict,
    action: str,
    target_type: str,
    target_id: str,
    before: dict | None = None,
    after: dict | None = None,
    reason: str | None = None,
    session=None,
) -> dict:
    event = {
        "id": str(uuid.uuid4()),
        "actor_user_id": actor.get("id"),
        "actor_email": actor.get("email"),
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "before": _redact(before) if before is not None else None,
        "after": _redact(after) if after is not None else None,
        "reason": reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_options = {"session": session} if session is not None else {}
    await db.audit_events.insert_one(event, **insert_options)
    event.pop("_id", None)
    return event
