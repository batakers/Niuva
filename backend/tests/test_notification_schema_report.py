import asyncio
import json
from datetime import datetime, timezone

from notification_schema_report import build_notification_schema_report


NOW = datetime(2026, 7, 29, tzinfo=timezone.utc)


class Cursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class ReadOnlyCollection:
    def __init__(self, items=()):
        self.items = [dict(item) for item in items]
        self.reads = 0

    def find(self, _query, _projection=None):
        self.reads += 1
        return Cursor(self.items)

    async def find_one(self, query, _projection=None):
        self.reads += 1
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                return dict(item)
        return None


class ReportDatabase:
    def __init__(self, *, notifications=(), outbox=(), logs=(), inquiries=()):
        self.notifications = ReadOnlyCollection(notifications)
        self.notification_outbox = ReadOnlyCollection(outbox)
        self.admin_notification_log = ReadOnlyCollection(logs)
        self.inquiries = ReadOnlyCollection(inquiries)
        self.b2b_quotes = ReadOnlyCollection()
        self.b2b_projects = ReadOnlyCollection()
        self.work_orders = ReadOnlyCollection()
        self.retail_orders = ReadOnlyCollection()
        self.restock_alerts = ReadOnlyCollection()
        self.materials = ReadOnlyCollection()
        self.product_variants = ReadOnlyCollection()


def modern_notification(**overrides):
    value = {
        "id": "notification-1",
        "user_id": "user-1",
        "event": "inquiry.created",
        "title": "Inquiry dibuat",
        "body": "Ada inquiry baru.",
        "reference_type": "inquiry",
        "reference_id": "inquiry-1",
        "deduplication_key": "dedup-1",
        "read_at": None,
        "occurrence_count": 1,
        "created_at": "2026-07-28T00:00:00+00:00",
        "last_seen_at": "2026-07-28T00:00:00+00:00",
        "updated_at": "2026-07-28T00:00:00+00:00",
    }
    value.update(overrides)
    return value


def valid_outbox(**overrides):
    value = {
        "id": "outbox-1",
        "notification_id": "notification-1",
        "channel": "email",
        "recipient": "customer@example.test",
        "payload": {"subject": "Inquiry dibuat"},
        "status": "delivered",
        "attempts": 1,
        "delivery_key": "delivery-1",
        "created_at": NOW,
        "updated_at": NOW,
    }
    value.update(overrides)
    return value


def run_report(database, **overrides):
    return asyncio.run(
        build_notification_schema_report(
            database,
            target_label="isolated-fixture-20260729",
            target_scope="isolated",
            now=NOW,
            **overrides,
        )
    )


def test_report_is_aggregate_only_and_ready_for_valid_modern_records():
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[valid_outbox()],
        logs=[
            {
                "id": "log-1",
                "target": "user",
                "recipient_count": 1,
                "delivery_status": "queued",
                "sent_by": "admin-1",
                "created_at": "2026-07-28T00:00:00+00:00",
            }
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "ready_for_review"
    assert report["collections"]["notifications"]["shape_counts"] == {
        "modern_candidate": 1
    }
    assert report["issues"] == {}
    rendered = json.dumps(report)
    assert "customer@example.test" not in rendered
    assert "notification-1" not in rendered
    assert "Inquiry dibuat" not in rendered


def test_report_stops_on_legacy_or_mixed_notification_shape():
    legacy = {
        "id": "legacy-1",
        "user_id": "user-1",
        "to_email": "legacy@example.test",
        "subject": "Legacy",
        "title": "Legacy",
        "body_html": "<p>Legacy</p>",
        "read": False,
        "created_at": "2026-07-28T00:00:00+00:00",
    }
    database = ReportDatabase(notifications=[legacy, {**legacy, "id": "mixed-1", "event": "x"}])

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["legacy_notification_shape"] == 1
    assert report["issues"]["mixed_or_unknown_notification_shape"] == 1


def test_report_stops_on_duplicate_orphan_and_invalid_timestamp():
    first = modern_notification()
    second = modern_notification(id="notification-2")
    database = ReportDatabase(
        notifications=[first, second],
        outbox=[valid_outbox(id="outbox-2", notification_id="missing-notification")],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["duplicate_deduplication_key"] == 1
    assert report["issues"]["orphan_outbox"] == 1

    invalid_time = ReportDatabase(
        notifications=[modern_notification(created_at="not-a-timestamp")],
        inquiries=[{"id": "inquiry-1"}],
    )
    invalid_time_report = run_report(invalid_time)
    assert invalid_time_report["issues"]["invalid_notification_timestamp"] == 1


def test_report_stops_on_prohibited_security_field_without_echoing_its_value():
    secret_value = "must-not-appear-in-output"
    database = ReportDatabase(
        notifications=[modern_notification(reset_token=secret_value)],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["prohibited_security_field"] == 1
    assert secret_value not in json.dumps(report)


def test_report_blocks_non_isolated_target_without_reading_collections():
    database = ReportDatabase(notifications=[modern_notification()])

    report = asyncio.run(
        build_notification_schema_report(
            database,
            target_label="shared-test",
            target_scope="shared",
            now=NOW,
        )
    )

    assert report == {
        "report_version": 1,
        "target_label": "shared-test",
        "disposition": "blocked_ambiguity",
        "collections": {},
        "issues": {"unsafe_target": 1},
    }
    assert database.notifications.reads == 0
