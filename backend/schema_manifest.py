"""Canonical MongoDB index manifest and required schema version."""

from typing import Any

from catalog_inventory_indexes import INDEX_DECLARATIONS as CATALOG_INDEX_DECLARATIONS

MIGRATION_007_VERSION = "007_security_publication_schema"
AUTH_RECOVERY_MIGRATION_VERSION = "008_auth_recovery_safety"
ADMIN_SESSION_MIGRATION_VERSION = "009_admin_session_safety"
AUTH_SECURITY_EVENT_MIGRATION_VERSION = "010_auth_security_events"
REQUIRED_SCHEMA_VERSIONS = (
    MIGRATION_007_VERSION,
    AUTH_RECOVERY_MIGRATION_VERSION,
    ADMIN_SESSION_MIGRATION_VERSION,
)
REQUIRED_SCHEMA_VERSION = REQUIRED_SCHEMA_VERSIONS[-1]

CORE_INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    {
        "collection": "users",
        "keys": "email",
        "options": {"name": "uq_user_email", "unique": True},
    },
    {
        "collection": "users",
        "keys": "id",
        "options": {"name": "uq_user_id", "unique": True},
    },
    {
        "collection": "users",
        "keys": [("roles", 1), ("status", 1)],
        "options": {"name": "ix_user_roles_status"},
    },
    {
        "collection": "auth_sessions",
        "keys": "id",
        "options": {"name": "uq_auth_session_id", "unique": True},
    },
    {
        "collection": "auth_sessions",
        "keys": [("family_id", 1), ("status", 1)],
        "options": {"name": "ix_auth_session_family_status"},
    },
    {
        "collection": "auth_sessions",
        "keys": [("user_id", 1), ("status", 1)],
        "options": {"name": "ix_auth_session_user_status"},
    },
    {
        "collection": "auth_sessions",
        "keys": "expires_at",
        "options": {"name": "ttl_auth_session_expiry", "expireAfterSeconds": 0},
    },
    {
        "collection": "login_rate_limits",
        "keys": "expires_at",
        "options": {"name": "ttl_login_rate_limit", "expireAfterSeconds": 0},
    },
    {
        "collection": "public_rate_limits",
        "keys": "expires_at",
        "options": {"name": "ttl_public_rate_limit", "expireAfterSeconds": 0},
    },
    {
        "collection": "password_reset_tokens",
        "keys": "token_hash",
        "options": {"name": "uq_password_reset_hash", "unique": True},
    },
    {
        "collection": "password_reset_tokens",
        "keys": "expires_at",
        "options": {"name": "ttl_password_reset_expiry", "expireAfterSeconds": 0},
    },
    {
        "collection": "staff_invitations",
        "keys": "token_hash",
        "options": {"name": "uq_staff_invitation_hash", "unique": True},
    },
    {
        "collection": "staff_invitations",
        "keys": "email",
        "options": {
            "name": "uq_pending_staff_invitation_email",
            "unique": True,
            "partialFilterExpression": {"status": "pending"},
        },
    },
    {
        "collection": "audit_events",
        "keys": "id",
        "options": {"name": "uq_audit_event_id", "unique": True},
    },
    {
        "collection": "audit_events",
        "keys": "created_at",
        "options": {"name": "ix_audit_created"},
    },
    {
        "collection": "audit_events",
        "keys": "actor_user_id",
        "options": {"name": "ix_audit_actor"},
    },
    {
        "collection": "audit_events",
        "keys": [("target_type", 1), ("target_id", 1)],
        "options": {"name": "ix_audit_target"},
    },
    {
        "collection": "settings",
        "keys": "key",
        "options": {"name": "uq_settings_key", "unique": True},
    },
    {
        "collection": "counters",
        "keys": "key",
        "options": {"name": "uq_counter_key", "unique": True},
    },
    {
        "collection": "orders",
        "keys": "id",
        "options": {"name": "uq_order_id", "unique": True},
    },
    {
        "collection": "orders",
        "keys": "order_number",
        "options": {
            "name": "uq_order_number",
            "unique": True,
            "partialFilterExpression": {"order_number": {"$type": "string"}},
        },
    },
    {
        "collection": "inquiries",
        "keys": "id",
        "options": {"name": "uq_inquiry_id", "unique": True},
    },
    {
        "collection": "inquiries",
        "keys": [("status", 1), ("updated_at", -1)],
        "options": {"name": "ix_inquiry_status_updated"},
    },
    {
        "collection": "b2b_quotes",
        "keys": "id",
        "options": {"name": "uq_quote_id", "unique": True},
    },
    {
        "collection": "b2b_quotes",
        "keys": "inquiry_id",
        "options": {"name": "uq_quote_inquiry", "unique": True},
    },
    {
        "collection": "b2b_quote_versions",
        "keys": "id",
        "options": {"name": "uq_quote_version_id", "unique": True},
    },
    {
        "collection": "b2b_quote_versions",
        "keys": [("quote_id", 1), ("revision", 1)],
        "options": {"name": "uq_quote_revision", "unique": True},
    },
    {
        "collection": "b2b_projects",
        "keys": "id",
        "options": {"name": "uq_project_id", "unique": True},
    },
    {
        "collection": "b2b_projects",
        "keys": "quote_id",
        "options": {"name": "uq_project_quote", "unique": True},
    },
    {
        "collection": "b2b_projects",
        "keys": [("status", 1), ("updated_at", -1)],
        "options": {"name": "ix_project_status_updated"},
    },
    {
        "collection": "work_orders",
        "keys": "id",
        "options": {"name": "uq_work_order_id", "unique": True},
    },
    {
        "collection": "work_orders",
        "keys": [("project_id", 1), ("updated_at", -1)],
        "options": {"name": "ix_work_order_project_updated"},
    },
    {
        "collection": "work_orders",
        "keys": [("status", 1), ("updated_at", -1)],
        "options": {"name": "ix_work_order_status_updated"},
    },
    {
        "collection": "portfolio",
        "keys": "id",
        "options": {"name": "uq_portfolio_id", "unique": True},
    },
    {
        "collection": "portfolio",
        "keys": [("status", 1), ("display_order", 1)],
        "options": {"name": "ix_portfolio_status_order"},
    },
    {
        "collection": "portfolio",
        "keys": "source_project_id",
        "options": {
            "name": "uq_portfolio_source_project",
            "unique": True,
            "partialFilterExpression": {"source_project_id": {"$type": "string"}},
        },
    },
    {
        "collection": "portfolio_revisions",
        "keys": "id",
        "options": {"name": "uq_portfolio_revision_id", "unique": True},
    },
    {
        "collection": "portfolio_revisions",
        "keys": [("portfolio_id", 1), ("revision", 1)],
        "options": {"name": "uq_portfolio_revision", "unique": True},
    },
    {
        "collection": "portfolio_publications",
        "keys": "id",
        "options": {"name": "uq_portfolio_publication_id", "unique": True},
    },
    {
        "collection": "portfolio_publications",
        "keys": [("portfolio_id", 1), ("activates_at", -1)],
        "options": {"name": "ix_portfolio_publication_activation"},
    },
    {
        "collection": "portfolio_publications",
        "keys": [("retired_at", 1), ("activates_at", 1), ("snapshot.display_order", 1)],
        "options": {"name": "ix_portfolio_public"},
    },
    {
        "collection": "content_blocks",
        "keys": [("content_type", 1), ("slug", 1)],
        "options": {"name": "uq_content_type_slug", "unique": True},
    },
    {
        "collection": "content_block_versions",
        "keys": "id",
        "options": {"name": "uq_content_version_id", "unique": True},
    },
    {
        "collection": "content_block_versions",
        "keys": [("content_block_id", 1), ("version", 1)],
        "options": {"name": "uq_content_block_version", "unique": True},
    },
    {
        "collection": "content_publications",
        "keys": "id",
        "options": {"name": "uq_content_publication_id", "unique": True},
    },
    {
        "collection": "content_publications",
        "keys": "source_version_id",
        "options": {"name": "uq_content_publication_source", "unique": True},
    },
    {
        "collection": "content_publications",
        "keys": [("content_block_id", 1), ("activates_at", -1)],
        "options": {"name": "ix_content_publication_activation"},
    },
    {
        "collection": "file_objects",
        "keys": "id",
        "options": {"name": "uq_file_object_id", "unique": True},
    },
    {
        "collection": "file_objects",
        "keys": "storage_path",
        "options": {"name": "uq_file_storage_path", "unique": True},
    },
    {
        "collection": "file_objects",
        "keys": [("owner_id", 1), ("state", 1)],
        "options": {"name": "ix_file_owner_state"},
    },
    {
        "collection": "notifications",
        "keys": "id",
        "options": {"name": "uq_notification_id", "unique": True},
    },
    {
        "collection": "notifications",
        "keys": "deduplication_key",
        "options": {
            "name": "uq_notification_deduplication",
            "unique": True,
            "partialFilterExpression": {"deduplication_key": {"$exists": True}},
        },
    },
    {
        "collection": "notifications",
        "keys": [("user_id", 1), ("read_at", 1)],
        "options": {"name": "ix_notification_user_read"},
    },
    {
        "collection": "notifications",
        "keys": [("user_id", 1), ("created_at", -1)],
        "options": {"name": "ix_notification_user_created"},
    },
    {
        "collection": "notification_outbox",
        "keys": "id",
        "options": {"name": "uq_notification_outbox_id", "unique": True},
    },
    {
        "collection": "notification_outbox",
        "keys": [("status", 1), ("next_attempt_at", 1), ("lease_until", 1)],
        "options": {"name": "ix_outbox_status_attempt"},
    },
    {
        "collection": "notification_outbox",
        "keys": "delivery_key",
        "options": {
            "name": "uq_outbox_delivery_key",
            "unique": True,
            "partialFilterExpression": {"delivery_key": {"$type": "string"}},
        },
    },
    {
        "collection": "retail_orders",
        "keys": "id",
        "options": {"name": "uq_retail_order_id", "unique": True},
    },
    {
        "collection": "retail_orders",
        "keys": "order_number",
        "options": {"name": "uq_retail_order_number", "unique": True},
    },
    {
        "collection": "retail_orders",
        "keys": "creation_operation_id",
        "options": {"name": "uq_retail_creation_operation", "unique": True},
    },
    {
        "collection": "retail_orders",
        "keys": [("status", 1), ("updated_at", -1)],
        "options": {"name": "ix_retail_status_updated"},
    },
    {
        "collection": "work_order_shortages",
        "keys": "id",
        "options": {"name": "uq_shortage_id", "unique": True},
    },
    {
        "collection": "work_order_shortages",
        "keys": [("status", 1), ("updated_at", -1)],
        "options": {"name": "ix_shortage_status_updated"},
    },
    {
        "collection": "work_order_shortages",
        "keys": "work_order_id",
        "options": {"name": "ix_shortage_work_order"},
    },
    {
        "collection": "inventory_adjustment_requests",
        "keys": "id",
        "options": {"name": "uq_inventory_adjustment_request_id", "unique": True},
    },
    {
        "collection": "inventory_adjustment_requests",
        "keys": "request_operation_id",
        "options": {
            "name": "uq_inventory_adjustment_request_operation",
            "unique": True,
        },
    },
    {
        "collection": "inventory_adjustment_requests",
        "keys": [("status", 1), ("created_at", -1)],
        "options": {"name": "ix_inventory_adjustment_request_status"},
    },
)

INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    CORE_INDEX_DECLARATIONS + CATALOG_INDEX_DECLARATIONS
)

# Migration 008 replaces Migration 007's reset-token indexes. The original
# declarations remain immutable evidence for Migration 007, while readiness
# validates only the post-008 state.
RETIRED_INDEX_NAMES = frozenset(
    {
        "uq_password_reset_hash",
        "ttl_password_reset_expiry",
    }
)

AUTH_RECOVERY_INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    {
        "collection": "password_reset_tokens",
        "keys": "token_hash",
        "options": {
            "name": "unique_password_reset_token_hash",
            "unique": True,
        },
    },
    {
        "collection": "password_reset_tokens",
        "keys": "user_id",
        "options": {
            "name": "one_active_password_reset_token_per_user",
            "unique": True,
            "partialFilterExpression": {"active": True},
        },
    },
)

ADMIN_SESSION_INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    {
        "collection": "admin_sessions",
        "keys": "access_hash",
        "options": {
            "name": "unique_admin_session_access_secret_hash",
            "unique": True,
        },
    },
    {
        "collection": "admin_sessions",
        "keys": "session_hash",
        "options": {
            "name": "unique_admin_session_session_secret_hash",
            "unique": True,
        },
    },
    {
        "collection": "admin_sessions",
        "keys": [
            ("user_id", 1),
            ("revoked_at", 1),
            ("access_expires_at", 1),
        ],
        "options": {"name": "admin_session_user_active_expiry"},
    },
    {
        "collection": "admin_sessions",
        "keys": "rotated_session_hashes",
        "options": {"name": "admin_session_rotated_secret_lookup"},
    },
    {
        "collection": "admin_sessions",
        "keys": "revoked_at",
        "options": {"name": "admin_session_revoked_retention"},
    },
    {
        "collection": "admin_sessions",
        "keys": "idle_expires_at",
        "options": {"name": "admin_session_idle_retention"},
    },
    {
        "collection": "admin_sessions",
        "keys": "absolute_expires_at",
        "options": {"name": "admin_session_absolute_retention"},
    },
)

# Migration 010 remains staged and is intentionally excluded from
# REQUIRED_SCHEMA_VERSIONS/INDEX_DECLARATIONS until isolated rehearsal and
# activation are separately approved.
AUTH_SECURITY_EVENT_INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    {
        "collection": "authentication_security_events",
        "keys": "id",
        "options": {
            "name": "unique_auth_security_event_id",
            "unique": True,
        },
    },
    {
        "collection": "authentication_security_events",
        "keys": [("event_type", 1), ("occurred_at", -1)],
        "options": {"name": "auth_security_event_type_time"},
    },
    {
        "collection": "authentication_security_events",
        "keys": [("subject_ref", 1), ("occurred_at", -1)],
        "options": {"name": "auth_security_event_subject_time"},
    },
    {
        "collection": "authentication_security_events",
        "keys": "expires_at",
        "options": {
            "name": "ttl_auth_security_event_expiry",
            "expireAfterSeconds": 0,
        },
    },
    {
        "collection": "authentication_security_alert_outbox",
        "keys": "fingerprint",
        "options": {
            "name": "unique_auth_security_alert_fingerprint",
            "unique": True,
        },
    },
    {
        "collection": "authentication_security_alert_outbox",
        "keys": [("status", 1), ("next_attempt_at", 1)],
        "options": {"name": "auth_security_alert_delivery_due"},
    },
)

READINESS_INDEX_DECLARATIONS: tuple[dict[str, Any], ...] = (
    tuple(
        declaration
        for declaration in INDEX_DECLARATIONS
        if declaration["options"]["name"] not in RETIRED_INDEX_NAMES
    )
    + AUTH_RECOVERY_INDEX_DECLARATIONS
    + ADMIN_SESSION_INDEX_DECLARATIONS
)
