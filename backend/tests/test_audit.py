import asyncio

import pytest

from audit import (
    AuditValidationError,
    append_audit_event,
    append_identity_audit_event,
)


class AuditCollection:
    def __init__(self):
        self.items = []
        self.insert_options = []

    async def insert_one(self, item, **options):
        self.items.append(dict(item))
        self.insert_options.append(dict(options))


class AuditDatabase:
    def __init__(self):
        self.audit_events = AuditCollection()


def test_audit_event_redacts_sensitive_fields():
    db = AuditDatabase()
    event = asyncio.run(
        append_audit_event(
            db,
            actor={"id": "staff-1", "email": "staff@example.com"},
            action="user.access_updated",
            target_type="user",
            target_id="user-2",
            before={
                "roles": ["retail_customer"],
                "password_hash": "hidden",
                "profile": {
                    "name": "Visible name",
                    "internal_notes": "hidden",
                },
            },
            after={
                "roles": ["warehouse"],
                "token": "hidden",
                "supplier": "hidden",
            },
            reason="Assigned warehouse duties",
        )
    )

    assert event["actor_user_id"] == "staff-1"
    assert event["before"] == {
        "roles": ["retail_customer"],
        "profile": {"name": "Visible name"},
    }
    assert event["after"] == {"roles": ["warehouse"]}
    assert db.audit_events.items == [event]
    assert db.audit_events.insert_options == [{}]


def test_audit_event_forwards_session_without_persisting_it():
    db = AuditDatabase()
    session = object()

    event = asyncio.run(
        append_audit_event(
            db,
            actor={"id": "staff-1", "email": "staff@example.com"},
            action="inventory.received",
            target_type="inventory_balance",
            target_id="material-1",
            session=session,
        )
    )

    assert db.audit_events.insert_options == [{"session": session}]
    assert "session" not in event
    assert "session" not in db.audit_events.items[0]


def test_generic_catalog_audit_event_redacts_expanded_sensitive_fields():
    db = AuditDatabase()

    event = asyncio.run(
        append_audit_event(
            db,
            actor={"id": "staff-1", "email": "staff@example.com"},
            action="catalog.product_updated",
            target_type="catalog_product",
            target_id="product-2",
            before={
                "name": "Visible product",
                "supplier_reference": "supplier-private",
                "payment": {"bank_account": "bank-private"},
                "credentials": {"api_key": "credential-private"},
                "bank_details": "bank-details-private",
                "rationale": "Free text must never be stored",
                "reason": "Free text must never be stored",
            },
            after={
                "name": "Updated product",
                "price": 100,
                "internal_cost": 50,
                "margin": 50,
                "profit": 50,
            },
            reason="Catalog update rationale",
        )
    )

    assert event["before"] == {"name": "Visible product"}
    assert event["after"] == {"name": "Updated product"}
    assert event["reason"] is None


def test_identity_audit_event_stores_only_allowlisted_access_projection_and_forwards_session():
    db = AuditDatabase()
    session = object()

    event = asyncio.run(
        append_identity_audit_event(
            db,
            actor_user_id="owner-1",
            action="user.access_updated",
            target_type="user",
            target_id="user-2",
            previous={
                "roles": ["retail_customer"],
                "access_state": "approved",
                "status": "active",
            },
            result={
                "roles": ["operations"],
                "access_state": "approved",
                "status": "active",
            },
            reason_code="role_review_approved",
            policy_version="2026-07-22-v1",
            session=session,
        )
    )

    assert set(event) == {
        "id",
        "actor_user_id",
        "action",
        "target_type",
        "target_id",
        "previous",
        "result",
        "reason_code",
        "policy_version",
        "created_at",
    }
    assert event["previous"] == {
        "roles": ["retail_customer"],
        "access_state": "approved",
        "status": "active",
    }
    assert event["result"] == {
        "roles": ["operations"],
        "access_state": "approved",
        "status": "active",
    }
    assert "actor_email" not in event
    assert "before" not in event and "after" not in event and "reason" not in event
    assert db.audit_events.items == [event]
    assert db.audit_events.insert_options == [{"session": session}]


@pytest.mark.parametrize(
    "reason_code",
    (
        "role_review_approved",
        "role_access_removed",
        "emergency_override",
    ),
)
def test_user_access_audit_accepts_only_public_reason_codes(reason_code):
    db = AuditDatabase()

    event = asyncio.run(
        append_identity_audit_event(
            db,
            actor_user_id="owner-1",
            action="user.access_updated",
            target_type="user",
            target_id="user-2",
            previous={"roles": ["retail_customer"]},
            result={"roles": ["operations"]},
            reason_code=reason_code,
            policy_version="2026-07-22-v1",
        )
    )

    assert event["reason_code"] == reason_code


@pytest.mark.parametrize(
    "reason_code",
    ("user_access_updated", "policy_migration_v1"),
)
def test_user_access_audit_rejects_non_public_reason_code(reason_code):
    db = AuditDatabase()

    with pytest.raises(AuditValidationError, match="reason code"):
        asyncio.run(
            append_identity_audit_event(
                db,
                actor_user_id="owner-1",
                action="user.access_updated",
                target_type="user",
                target_id="user-2",
                previous={"roles": ["retail_customer"]},
                result={"roles": ["operations"]},
                reason_code=reason_code,
                policy_version="2026-07-22-v1",
            )
        )

    assert db.audit_events.items == []


@pytest.mark.parametrize(
    "action",
    [
        "identity.policy_migrated",
        "identity.bootstrap_owner_assigned",
        "identity.policy_migration_rolled_back",
    ],
)
def test_identity_policy_migration_actions_use_safe_user_projection(action):
    db = AuditDatabase()
    session = object()

    event = asyncio.run(
        append_identity_audit_event(
            db,
            actor_user_id="reviewed-bootstrap-owner",
            action=action,
            target_type="user",
            target_id="opaque-user-id",
            previous={
                "roles": [],
                "status": "active",
                "access_state": "access_review_required",
            },
            result={
                "roles": ["retail_customer"],
                "status": "active",
                "access_state": "approved",
            },
            reason_code="policy_migration_v1",
            policy_version="2026-07-22-v1",
            session=session,
        )
    )

    assert set(event) == {
        "id",
        "actor_user_id",
        "action",
        "target_type",
        "target_id",
        "previous",
        "result",
        "reason_code",
        "policy_version",
        "created_at",
    }
    assert db.audit_events.insert_options == [{"session": session}]


def test_organization_audit_event_rejects_raw_sensitive_snapshot_before_insert():
    db = AuditDatabase()
    unsafe_snapshot = {
        "organization_id": "organization-1",
        "membership_id": "membership-1",
        "member_role": "viewer",
        "status": "active",
        "supplier_reference": "supplier-private",
        "tax_id": "tax-private",
        "legal_name": "legal-private",
        "internal_notes": "internal-private",
        "password": "password-private",
        "password_hash": "hash-private",
        "token": "token-private",
        "secret": "secret-private",
        "payment": {"bank_account": "bank-private"},
        "price": 100,
        "internal_cost": 50,
        "margin": 50,
        "profit": 50,
        "membership_profile": {"email": "private@example.com"},
        "reason": "Free text must never be stored",
    }

    with pytest.raises(ValueError, match="Unsupported audit projection fields"):
        asyncio.run(
            append_identity_audit_event(
                db,
                actor_user_id="owner-1",
                action="organization.member_added",
                target_type="organization_membership",
                target_id="membership-1",
                previous=None,
                result=unsafe_snapshot,
                reason_code="organization_member_added",
                policy_version="2026-07-22-v1",
            )
        )

    assert db.audit_events.items == []


def test_organization_audit_event_uses_exact_allowlisted_shape():
    db = AuditDatabase()

    event = asyncio.run(
        append_identity_audit_event(
            db,
            actor_user_id="owner-1",
            action="organization.member_archived",
            target_type="organization_membership",
            target_id="membership-1",
            previous={
                "organization_id": "organization-1",
                "membership_id": "membership-1",
                "member_role": "approver",
                "status": "active",
            },
            result={
                "organization_id": "organization-1",
                "membership_id": "membership-1",
                "member_role": "approver",
                "status": "inactive",
            },
            reason_code="organization_member_archived",
            policy_version="2026-07-22-v1",
        )
    )

    assert set(event) == {
        "id",
        "actor_user_id",
        "action",
        "target_type",
        "target_id",
        "previous",
        "result",
        "reason_code",
        "policy_version",
        "created_at",
    }
    assert event["previous"] == {
        "organization_id": "organization-1",
        "membership_id": "membership-1",
        "member_role": "approver",
        "status": "active",
    }
    assert event["result"] == {
        "organization_id": "organization-1",
        "membership_id": "membership-1",
        "member_role": "approver",
        "status": "inactive",
    }
    assert "actor_email" not in event
    assert "before" not in event and "after" not in event and "reason" not in event


def test_organization_audit_event_rejects_nested_allowlisted_identifier_before_insert():
    db = AuditDatabase()

    with pytest.raises(AuditValidationError, match="organization ID"):
        asyncio.run(
            append_identity_audit_event(
                db,
                actor_user_id="owner-1",
                action="organization.member_added",
                target_type="organization_membership",
                target_id="membership-1",
                previous=None,
                result={
                    "organization_id": {"bank_account": "secret"},
                    "membership_id": "membership-1",
                    "member_role": "viewer",
                    "status": "active",
                },
                reason_code="organization_member_added",
                policy_version="2026-07-22-v1",
            )
        )

    assert db.audit_events.items == []
