import uuid
from collections.abc import Mapping
from datetime import datetime, timezone
from typing import Any

from permissions import ROLE_POLICY_VERSION

SENSITIVE_KEYS = frozenset(
    {
        "password",
        "password_hash",
        "token",
        "token_hash",
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
            if key != "_id" and key.lower() not in SENSITIVE_KEYS
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
    audit_reason = reason.strip() if isinstance(reason, str) else None
    if audit_reason is not None and not 3 <= len(audit_reason) <= 500:
        raise AuditValidationError("Audit reason must be 3-500 characters")
    event = {
        "id": str(uuid.uuid4()),
        "actor_user_id": actor.get("id"),
        "actor_email": actor.get("email"),
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "before": _redact(before) if before is not None else None,
        "after": _redact(after) if after is not None else None,
        "reason": audit_reason,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    insert_options = {"session": session} if session is not None else {}
    await db.audit_events.insert_one(event, **insert_options)
    event.pop("_id", None)
    return event


_IDENTITY_GOVERNANCE_ACTIONS = frozenset(
    {
        "identity.staff_invited",
        "identity.staff_invitation_accepted",
        "identity.staff_roles_updated",
        "identity.staff_deactivated",
        "identity.staff_reactivated",
        "identity.customer_disabled",
        "identity.customer_active",
        "identity.granular_role_migrated",
        "identity.granular_role_migration_rolled_back",
    }
)

_IDENTITY_GOVERNANCE_REASON_CODES = {
    ("identity.staff_invited", "staff_invitation"): "staff_invitation_created",
    ("identity.staff_invitation_accepted", "user"): "staff_invitation_accepted",
    ("identity.staff_roles_updated", "user"): "staff_roles_updated",
    ("identity.staff_deactivated", "user"): "staff_access_deactivated",
    ("identity.staff_reactivated", "user"): "staff_access_reactivated",
    ("identity.customer_disabled", "user"): "customer_access_disabled",
    ("identity.customer_active", "user"): "customer_access_reactivated",
    ("identity.granular_role_migrated", "user"): "policy_migration_v1",
    (
        "identity.granular_role_migration_rolled_back",
        "user",
    ): "policy_migration_v1",
}


async def append_identity_governance_event(
    db,
    *,
    actor: Mapping[str, Any],
    action: str,
    target_type: str,
    target_id: str,
    before: Mapping[str, Any] | None,
    after: Mapping[str, Any] | None,
    reason: str,
    session=None,
) -> dict:
    """Adapt legacy identity-governance producers to the strict audit contract.

    ``reason`` remains a validated request input for existing API and migration
    callers, but it is deliberately not persisted. The resulting event is
    written through ``append_identity_audit_event`` so all identity-governance
    paths share the same envelope and projection validation.
    """
    if action not in _IDENTITY_GOVERNANCE_ACTIONS:
        raise AuditValidationError("Unsupported identity governance action")
    if (action, target_type) not in _IDENTITY_GOVERNANCE_REASON_CODES:
        raise AuditValidationError("Unsupported identity governance target")
    reason = reason.strip() if isinstance(reason, str) else ""
    if len(reason) < 3 or len(reason) > 500:
        raise AuditValidationError(
            "Identity governance reason must be 3-500 characters"
        )
    return await append_identity_audit_event(
        db,
        actor_user_id=actor.get("id"),
        action=action,
        target_type=target_type,
        target_id=target_id,
        previous=_identity_governance_projection(
            before, target_type=target_type, action=action
        ),
        result=_identity_governance_projection(
            after, target_type=target_type, action=action
        ),
        reason_code=_IDENTITY_GOVERNANCE_REASON_CODES[(action, target_type)],
        policy_version=ROLE_POLICY_VERSION,
        session=session,
    )


class AuditValidationError(ValueError):
    """Raised when a restricted audit event does not meet its safe contract."""


_USER_ACCESS_REASON_CODES = frozenset(
    {
        "role_review_approved",
        "role_access_removed",
        "emergency_override",
    }
)

_EVENT_REASON_CODES = {
    ("user.access_updated", "user"): _USER_ACCESS_REASON_CODES,
    ("identity.policy_migrated", "user"): "policy_migration_v1",
    ("identity.bootstrap_owner_assigned", "user"): "policy_migration_v1",
    ("identity.policy_migration_rolled_back", "user"): "policy_migration_v1",
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
    **_IDENTITY_GOVERNANCE_REASON_CODES,
}

_PROJECTION_FIELDS = {
    "user": ("roles", "access_state", "status"),
    "staff_invitation": ("roles", "status"),
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
        "content_editor",
        "catalog_manager",
        "warehouse",
        "order_admin",
        "sales_estimator",
        "designer_engineer",
        "production",
        "quality_control",
        "finance",
        "manager_approver",
        "super_admin",
        "retail_customer",
        "organization_customer",
    }
)
_ACCESS_STATES = frozenset({"approved", "access_review_required"})
_USER_STATUSES = frozenset({"active", "disabled"})
_ORGANIZATION_STATUSES = frozenset({"active", "inactive"})
_STAFF_INVITATION_STATUSES = frozenset({"pending", "accepted"})
_MEMBERSHIP_ROLES = frozenset({"owner", "project_pic", "approver", "finance", "viewer"})


def _identity_governance_projection(
    snapshot: Mapping[str, Any] | None,
    *,
    target_type: str,
    action: str,
) -> dict[str, Any] | None:
    """Project legacy identity records into the strict event shape."""
    if snapshot is None:
        return None
    if not isinstance(snapshot, Mapping):
        raise AuditValidationError("Identity governance projection must be a mapping")
    try:
        fields = _PROJECTION_FIELDS[target_type]
    except KeyError as exc:
        raise AuditValidationError("Unsupported identity governance target") from exc
    projection = {field: snapshot[field] for field in fields if field in snapshot}
    if "roles" in projection:
        roles = projection["roles"]
        if not isinstance(roles, (list, tuple)) or any(
            role not in _CANONICAL_ROLES for role in roles
        ):
            if action in {
                "identity.granular_role_migrated",
                "identity.granular_role_migration_rolled_back",
            }:
                # Migration 006 can encounter legacy aggregate markers.
                # Preserve only the safe fact that no canonical role
                # projection is present; never copy a legacy role label into
                # the strict event.
                projection["roles"] = []
            else:
                raise AuditValidationError("Audit roles must be canonical")
        else:
            projection["roles"] = list(roles)
    return projection


def _validate_audit_identifier(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise AuditValidationError(f"Audit {label} must be a non-empty scalar string")
    return value


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

    try:
        fields = _PROJECTION_FIELDS[target_type]
    except KeyError as exc:
        raise AuditValidationError("Unsupported audit target type") from exc
    unknown = set(snapshot) - set(fields)
    if unknown:
        raise AuditValidationError(
            f"Unsupported audit projection fields: {', '.join(sorted(map(str, unknown)))}"
        )

    projection = {field: snapshot[field] for field in fields if field in snapshot}
    for identifier, label in (
        ("organization_id", "organization ID"),
        ("membership_id", "membership ID"),
    ):
        if identifier in projection:
            projection[identifier] = _validate_audit_identifier(
                projection[identifier], label
            )
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
        if target_type == "user":
            allowed_statuses = _USER_STATUSES
        elif target_type == "staff_invitation":
            allowed_statuses = _STAFF_INVITATION_STATUSES
        else:
            allowed_statuses = _ORGANIZATION_STATUSES
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
    reason_code_allowed = (
        reason_code in expected_reason_code
        if isinstance(expected_reason_code, frozenset)
        else reason_code == expected_reason_code
    )
    if not reason_code_allowed:
        raise AuditValidationError("Unsupported audit reason code")
    actor_user_id = _validate_audit_identifier(actor_user_id, "actor user ID")
    target_id = _validate_audit_identifier(target_id, "target ID")
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
