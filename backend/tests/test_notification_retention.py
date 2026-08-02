"""Synthetic safety evidence for canonical notification retention cleanup."""

import asyncio
import json
import types
from datetime import datetime, timedelta, timezone

import pytest
from notification_domain import (
    NOTIFICATION_OUTBOX_SCHEMA_VERSION,
    NOTIFICATION_RETENTION,
    NOTIFICATION_SCHEMA_VERSION,
    deduplication_key,
)
from notification_retention import (
    TERMINAL_OUTBOX_RETENTION,
    cleanup_notification_retention,
)

NOW = datetime(2026, 8, 2, 12, 0, tzinfo=timezone.utc)


class Cursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, specification):
        for key, direction in reversed(specification):
            self.items.sort(key=lambda item: item.get(key), reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class Collection:
    def __init__(self, items=()):
        self.items = [dict(item) for item in items]
        self.reads = 0
        self.deletes = 0
        self.sessions = []
        self.before_delete = None

    @staticmethod
    def _matches(item, query):
        for key, value in query.items():
            actual = item.get(key)
            if isinstance(value, dict):
                if "$in" in value and actual not in value["$in"]:
                    return False
                if "$lte" in value and (actual is None or actual > value["$lte"]):
                    return False
            elif actual != value:
                return False
        return True

    def find(self, query, **options):
        self.reads += 1
        self.sessions.append(options.get("session"))
        return Cursor([item for item in self.items if self._matches(item, query)])

    async def count_documents(self, query, **options):
        self.reads += 1
        self.sessions.append(options.get("session"))
        return sum(1 for item in self.items if self._matches(item, query))

    async def delete_one(self, query, **options):
        self.deletes += 1
        self.sessions.append(options.get("session"))
        if self.before_delete is not None:
            callback = self.before_delete
            self.before_delete = None
            callback(self.items)
        for index, item in enumerate(self.items):
            if self._matches(item, query):
                self.items.pop(index)
                return types.SimpleNamespace(deleted_count=1)
        return types.SimpleNamespace(deleted_count=0)


class Database:
    def __init__(self, *, notifications=(), outbox=()):
        self.notifications = Collection(notifications)
        self.notification_outbox = Collection(outbox)


class TransactionGuard:
    def __init__(self):
        self.session = object()
        self.calls = []

    async def run(self, callback, *, operation_name, retry_safe):
        self.calls.append({"operation_name": operation_name, "retry_safe": retry_safe})
        return await callback(self.session)


def canonical_notification(identifier="notification-1", **overrides):
    created_at = NOW - NOTIFICATION_RETENTION - timedelta(days=1)
    reference_type = None
    reference_id = None
    value = {
        "_id": f"mongo-{identifier}",
        "schema_version": NOTIFICATION_SCHEMA_VERSION,
        "id": identifier,
        "user_id": "user-1",
        "event": "admin.message",
        "title": "Notification title",
        "body": "Notification body",
        "reference_type": reference_type,
        "reference_id": reference_id,
        "deduplication_key": deduplication_key(
            user_id="user-1",
            event="admin.message",
            reference_type=reference_type,
            reference_id=reference_id,
        ),
        "read_at": None,
        "occurrence_count": 1,
        "created_at": created_at,
        "last_seen_at": created_at,
        "updated_at": created_at,
        "expires_at": created_at + NOTIFICATION_RETENTION,
    }
    value.update(overrides)
    return value


def terminal_outbox(identifier="outbox-1", **overrides):
    updated_at = NOW - TERMINAL_OUTBOX_RETENTION - timedelta(days=1)
    value = {
        "_id": f"mongo-{identifier}",
        "schema_version": NOTIFICATION_OUTBOX_SCHEMA_VERSION,
        "id": identifier,
        "notification_id": "notification-1",
        "channel": "email",
        "recipient": "private-recipient@niuva.test",
        "payload": {"body_html": "private-message"},
        "status": "delivered",
        "attempts": 1,
        "last_error": None,
        "next_attempt_at": None,
        "lease_owner": None,
        "lease_token": None,
        "lease_until": None,
        "delivery_key": f"notification-delivery:{identifier}",
        "created_at": updated_at - timedelta(days=1),
        "updated_at": updated_at,
    }
    value.update(overrides)
    return value


def run_cleanup(database, **overrides):
    parameters = {
        "target_label": "isolated-retention-fixture",
        "target_scope": "isolated",
        "current_time": NOW,
        **overrides,
    }
    return asyncio.run(cleanup_notification_retention(database, **parameters))


def apply_cleanup(database, **overrides):
    transaction_guard = overrides.pop("transaction_guard", TransactionGuard())
    return run_cleanup(
        database,
        apply=True,
        cleanup_confirmed=True,
        restore_tested_backup_confirmed=True,
        owner_approved=True,
        transaction_guard=transaction_guard,
        **overrides,
    )


def test_dry_run_is_default_aggregate_only_and_does_not_delete():
    database = Database(notifications=[canonical_notification()])

    report = run_cleanup(database)

    assert report["dry_run"] is True
    assert report["disposition"] == "ready_for_review"
    assert report["policy"] == {
        "notification_retention_days": 180,
        "terminal_outbox_retention_days": 30,
    }
    assert report["notifications"] == {
        "selected": 1,
        "eligible": 1,
        "invalid_excluded": 0,
        "linked_excluded": 0,
        "delete_conflicts": 0,
        "deleted": 0,
        "truncated": False,
    }
    assert len(database.notifications.items) == 1
    assert database.notifications.deletes == 0
    rendered = json.dumps(report)
    assert "notification-1" not in rendered
    assert "user-1" not in rendered
    assert "Notification body" not in rendered


def test_apply_deletes_old_terminal_outbox_before_linked_notification():
    database = Database(
        notifications=[canonical_notification()],
        outbox=[terminal_outbox()],
    )

    report = apply_cleanup(database)

    assert report["disposition"] == "applied"
    assert report["terminal_outbox"]["deleted"] == 1
    assert report["notifications"]["deleted"] == 1
    assert report["notifications"]["linked_excluded"] == 0
    assert database.notification_outbox.items == []
    assert database.notifications.items == []


def test_remaining_outbox_link_blocks_notification_deletion():
    recent = terminal_outbox(updated_at=NOW - timedelta(days=29))
    database = Database(
        notifications=[canonical_notification()],
        outbox=[recent],
    )

    report = apply_cleanup(database)

    assert report["disposition"] == "applied_with_exclusions"
    assert report["terminal_outbox"]["selected"] == 0
    assert report["notifications"]["linked_excluded"] == 1
    assert report["notifications"]["deleted"] == 0
    assert len(database.notifications.items) == 1
    assert len(database.notification_outbox.items) == 1


def test_versionless_legacy_and_future_records_are_not_candidates():
    historical_notification = canonical_notification()
    historical_notification.pop("schema_version")
    future_notification = canonical_notification(
        "future-notification", schema_version=2
    )
    historical_outbox = terminal_outbox()
    historical_outbox.pop("schema_version")
    future_outbox = terminal_outbox("future-outbox", schema_version=2)
    database = Database(
        notifications=[historical_notification, future_notification],
        outbox=[historical_outbox, future_outbox],
    )

    report = apply_cleanup(database)

    assert report["notifications"]["selected"] == 0
    assert report["terminal_outbox"]["selected"] == 0
    assert database.notifications.deletes == 0
    assert database.notification_outbox.deletes == 0
    assert len(database.notifications.items) == 2
    assert len(database.notification_outbox.items) == 2


def test_boolean_schema_marker_is_not_treated_as_canonical():
    database = Database(outbox=[terminal_outbox(schema_version=True)])

    report = apply_cleanup(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["terminal_outbox"]["invalid_excluded"] == 1
    assert database.notification_outbox.deletes == 0


def test_malformed_marked_candidate_stops_all_mutation():
    malformed = terminal_outbox()
    malformed.pop("payload")
    database = Database(
        notifications=[canonical_notification()],
        outbox=[malformed],
    )

    report = apply_cleanup(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["terminal_outbox"]["invalid_excluded"] == 1
    assert database.notification_outbox.deletes == 0
    assert database.notifications.deletes == 0
    assert len(database.notifications.items) == 1


@pytest.mark.parametrize(
    "overrides",
    (
        {"channel": "sms"},
        {"payload": {"provider_payload": "unsafe"}},
        {"payload": {"subject": 123}},
        {"last_error": "temporary_failure"},
    ),
)
def test_schema_v1_outbox_with_invalid_delivery_content_stops_all_mutation(
    overrides,
):
    database = Database(
        notifications=[canonical_notification()],
        outbox=[terminal_outbox(**overrides)],
    )

    report = apply_cleanup(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["terminal_outbox"]["invalid_excluded"] == 1
    assert database.notification_outbox.deletes == 0
    assert database.notifications.deletes == 0
    assert len(database.notification_outbox.items) == 1
    assert len(database.notifications.items) == 1


def test_reader_compatible_extra_url_field_is_not_cleanup_canonical():
    marked_but_ambiguous = canonical_notification(url="https://unsafe.example.test")
    database = Database(notifications=[marked_but_ambiguous])

    report = apply_cleanup(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["notifications"]["invalid_excluded"] == 1
    assert database.notifications.deletes == 0


def test_nonterminal_outbox_is_never_selected_or_deleted():
    pending = terminal_outbox(
        status="pending",
        attempts=0,
        next_attempt_at=NOW - timedelta(days=40),
    )
    processing = terminal_outbox(
        "outbox-2",
        status="processing",
        attempts=1,
        lease_owner="worker-a",
        lease_token="lease-a",
        lease_until=NOW - timedelta(days=40),
    )
    database = Database(outbox=[pending, processing])

    report = apply_cleanup(database)

    assert report["terminal_outbox"]["selected"] == 0
    assert database.notification_outbox.deletes == 0
    assert len(database.notification_outbox.items) == 2


def test_exact_retention_boundaries_are_eligible():
    created_at = NOW - NOTIFICATION_RETENTION
    notification = canonical_notification(
        created_at=created_at,
        last_seen_at=created_at,
        updated_at=created_at,
        expires_at=NOW,
    )
    outbox = terminal_outbox(
        created_at=NOW - TERMINAL_OUTBOX_RETENTION - timedelta(days=1),
        updated_at=NOW - TERMINAL_OUTBOX_RETENTION,
    )
    database = Database(notifications=[notification], outbox=[outbox])

    report = run_cleanup(database)

    assert report["notifications"]["eligible"] == 1
    assert report["terminal_outbox"]["eligible"] == 1


def test_outbox_report_never_exposes_delivery_metadata():
    outbox = terminal_outbox()
    database = Database(outbox=[outbox])

    report = run_cleanup(database)

    rendered = json.dumps(report)
    assert report["terminal_outbox"]["eligible"] == 1
    assert outbox["id"] not in rendered
    assert outbox["notification_id"] not in rendered
    assert outbox["recipient"] not in rendered
    assert outbox["payload"]["body_html"] not in rendered
    assert outbox["delivery_key"] not in rendered


@pytest.mark.parametrize(
    "missing_confirmation, expected_message",
    [
        ("cleanup_confirmed", "explicit cleanup confirmation"),
        ("restore_tested_backup_confirmed", "restore-tested backup confirmation"),
        ("owner_approved", "cleanup owner approval"),
    ],
)
def test_apply_requires_every_confirmation_before_database_access(
    missing_confirmation, expected_message
):
    database = Database(notifications=[canonical_notification()])
    confirmations = {
        "cleanup_confirmed": True,
        "restore_tested_backup_confirmed": True,
        "owner_approved": True,
    }
    confirmations[missing_confirmation] = False

    with pytest.raises(ValueError, match=expected_message):
        run_cleanup(database, apply=True, **confirmations)

    assert database.notifications.reads == 0
    assert database.notification_outbox.reads == 0
    assert database.notifications.deletes == 0


def test_apply_requires_transaction_guard_before_database_access():
    database = Database(notifications=[canonical_notification()])

    with pytest.raises(ValueError, match="transaction-capable guard"):
        run_cleanup(
            database,
            apply=True,
            cleanup_confirmed=True,
            restore_tested_backup_confirmed=True,
            owner_approved=True,
        )

    assert database.notifications.reads == 0
    assert database.notification_outbox.reads == 0
    assert database.notifications.deletes == 0


def test_apply_uses_one_transaction_session_for_all_reads_and_writes():
    database = Database(
        notifications=[canonical_notification()],
        outbox=[terminal_outbox()],
    )
    guard = TransactionGuard()

    report = apply_cleanup(database, transaction_guard=guard)

    assert report["disposition"] == "applied"
    assert guard.calls == [
        {"operation_name": "notification_retention_cleanup", "retry_safe": True}
    ]
    assert set(database.notifications.sessions) == {guard.session}
    assert set(database.notification_outbox.sessions) == {guard.session}


def test_shared_or_unsafe_target_is_blocked_without_database_access():
    database = Database(notifications=[canonical_notification()])

    report = asyncio.run(
        cleanup_notification_retention(
            database,
            target_label="shared-production",
            target_scope="shared",
            current_time=NOW,
        )
    )

    assert report["disposition"] == "blocked_unsafe_target"
    assert database.notifications.reads == 0
    assert database.notification_outbox.reads == 0
    with pytest.raises(ValueError, match="isolated named target"):
        asyncio.run(
            cleanup_notification_retention(
                database,
                target_label="shared-production",
                target_scope="shared",
                apply=True,
                cleanup_confirmed=True,
                restore_tested_backup_confirmed=True,
                owner_approved=True,
                current_time=NOW,
            )
        )
    assert database.notifications.reads == 0


def test_compare_and_delete_conflict_is_reported_without_deleting_changed_record():
    notification = canonical_notification()
    database = Database(notifications=[notification])

    def change_expiry(items):
        items[0]["expires_at"] = items[0]["expires_at"] + timedelta(seconds=1)

    database.notifications.before_delete = change_expiry

    report = apply_cleanup(database)

    assert report["disposition"] == "applied_with_conflicts"
    assert report["notifications"]["delete_conflicts"] == 1
    assert report["notifications"]["deleted"] == 0
    assert len(database.notifications.items) == 1


def test_batch_is_bounded_and_reports_truncation():
    database = Database(
        notifications=[
            canonical_notification("notification-1"),
            canonical_notification("notification-2"),
        ]
    )

    report = run_cleanup(database, batch_size=1)

    assert report["disposition"] == "partial_batch"
    assert report["notifications"]["selected"] == 1
    assert report["notifications"]["truncated"] is True
    assert database.notifications.deletes == 0


def test_invalid_time_and_batch_fail_before_database_access():
    database = Database()

    with pytest.raises(ValueError, match="timezone-aware"):
        run_cleanup(database, current_time=datetime(2026, 8, 2, 12, 0))
    with pytest.raises(ValueError, match="batch_size must be an integer"):
        run_cleanup(database, batch_size=True)
    with pytest.raises(ValueError, match="between 1 and 1000"):
        run_cleanup(database, batch_size=1001)

    assert database.notifications.reads == 0
    assert database.notification_outbox.reads == 0
