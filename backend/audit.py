import uuid
from datetime import datetime, timezone
from collections.abc import Mapping
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
        "supplier_reference",
        "tax_id",
        "legal_name",
        "payment",
        "payments",
        "payment_proof",
        "bank",
        "bank_account",
        "account_number",
        "price",
        "prices",
        "cost",
        "costs",
        "membership_profile",
        "reason",
        "credential",
        "credentials",
        "bank_details",
        "reason_text",
        "rationale",
        "justification",
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
        "reason": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_options = {"session": session} if session is not None else {}
    await db.audit_events.insert_one(event, **insert_options)
    event.pop("_id", None)
    return event


class AuditValidationError(ValueError):
    """Raised when a restricted audit event does not meet its safe contract."""


_EVENT_REASON_CODES = {
    ("user.access_updated", "user"): "user_access_updated",
    ("organization.created", "organization"): "organization_created",
    ("organization.updated", "organization"): "organization_updated",
    (
        "organization.member_added",
        "organization_membership",
    ): "organization_member_added",
    (
        "organization.member_reactivated",
        "organization_membership",
    ): "organization_member_reactivated",
    (
        "organization.member_updated",
        "organization_membership",
    ): "organization_member_updated",
    (
        "organization.member_archived",
        "organization_membership",
    ): "organization_member_archived",
}

_PROJECTION_FIELDS = {
    "user": ("roles", "access_state", "status"),
    "organization": ("organization_id", "status"),
    "organization_membership": (
        "organization_id",
        "membership_id",
        "member_role",
        "status",
    ),
}

_CANONICAL_ROLES = frozenset(
    {
        "super_admin",
        "operations",
        "commercial_finance",
        "retail_customer",
        "organization_customer",
    }
)
_ACCESS_STATES = frozenset({"approved", "access_review_required"})
_USER_STATUSES = frozenset({"active", "disabled"})
_ORGANIZATION_STATUSES = frozenset({"active", "inactive"})
_MEMBERSHIP_ROLES = frozenset({"owner", "project_pic", "approver", "finance", "viewer"})


def _validate_identity_projection(
    snapshot: Mapping[str, Any] | None,
    *,
    target_type: str,
    target_id: str,
) -> dict[str, Any] | None:
    if snapshot is None:
        return None
    if not isinstance(snapshot, Mapping):
        raise AuditValidationError("Audit projection must be a mapping")

    fields = _PROJECTION_FIELDS[target_type]
    unknown = set(snapshot) - set(fields)
    if unknown:
        raise AuditValidationError(
            f"Unsupported audit projection fields: {', '.join(sorted(map(str, unknown)))}"
        )

    projection = {field: snapshot[field] for field in fields if field in snapshot}
    if "roles" in projection:
        roles = projection["roles"]
        if not isinstance(roles, (list, tuple)) or any(
            role not in _CANONICAL_ROLES for role in roles
        ):
            raise AuditValidationError("Audit roles must be canonical")
        projection["roles"] = list(roles)
    if (
        "access_state" in projection
        and projection["access_state"] not in _ACCESS_STATES
    ):
        raise AuditValidationError("Unsupported access state")
    if "status" in projection:
        allowed_statuses = (
            _USER_STATUSES if target_type == "user" else _ORGANIZATION_STATUSES
        )
        if projection["status"] not in allowed_statuses:
            raise AuditValidationError("Unsupported audit lifecycle state")
    if (
        "member_role" in projection
        and projection["member_role"] not in _MEMBERSHIP_ROLES
    ):
        raise AuditValidationError("Unsupported membership role")
    if (
        target_type == "organization"
        and "organization_id" in projection
        and projection["organization_id"] != target_id
    ):
        raise AuditValidationError(
            "Organization audit projection target does not match"
        )
    if (
        target_type == "organization_membership"
        and "membership_id" in projection
        and projection["membership_id"] != target_id
    ):
        raise AuditValidationError("Membership audit projection target does not match")
    return projection


async def append_identity_audit_event(
    db,
    *,
    actor_user_id: str,
    action: str,
    target_type: str,
    target_id: str,
    previous: Mapping[str, Any] | None,
    result: Mapping[str, Any] | None,
    reason_code: str,
    policy_version: str,
    session=None,
) -> dict:
    """Persist a default-deny identity or organization audit event."""
    expected_reason_code = _EVENT_REASON_CODES.get((action, target_type))
    if expected_reason_code is None:
        raise AuditValidationError("Unsupported identity audit action or target")
    if reason_code != expected_reason_code:
        raise AuditValidationError("Unsupported audit reason code")
    if not isinstance(actor_user_id, str) or not actor_user_id:
        raise AuditValidationError("Audit actor user ID is required")
    if not isinstance(target_id, str) or not target_id:
        raise AuditValidationError("Audit target ID is required")
    if not isinstance(policy_version, str) or not policy_version:
        raise AuditValidationError("Audit policy version is required")

    event = {
        "id": str(uuid.uuid4()),
        "actor_user_id": actor_user_id,
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "previous": _validate_identity_projection(
            previous, target_type=target_type, target_id=target_id
        ),
        "result": _validate_identity_projection(
            result, target_type=target_type, target_id=target_id
        ),
        "reason_code": reason_code,
        "policy_version": policy_version,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_options = {"session": session} if session is not None else {}
    await db.audit_events.insert_one(event, **insert_options)
    event.pop("_id", None)
    return event
