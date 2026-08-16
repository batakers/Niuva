import ast
import asyncio
import inspect
import json
import pathlib
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from typing import Any

import notification_schema_report as report_module
import pytest
from notification_schema_report import (
    ReportTargetError,
    RepresentativeEvidenceApproval,
    build_notification_schema_report,
    build_parser,
    build_representative_fingerprint,
    execute_report_command,
    inspect_report_target,
    load_representative_evidence_manifest,
    verify_report_target,
)

NOW = datetime(2026, 7, 29, tzinfo=timezone.utc)
TARGET_LABEL = "isolated-fixture-20260729"
TARGET_DATABASE = "niuva_notification_fixture"
SNAPSHOT_FINGERPRINT = "a" * 64


class Cursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]
        self.yielded = 0

    def limit(self, value):
        self.items = self.items[:value]
        return self

    def __aiter__(self):
        self.index = 0
        return self

    async def __anext__(self):
        if self.index >= len(self.items):
            raise StopAsyncIteration
        item = dict(self.items[self.index])
        self.index += 1
        self.yielded += 1
        return item

    async def to_list(self, length):
        raise AssertionError("report collection reads must stream")


class ReadOnlyCollection:
    def __init__(self, items=()):
        self.items = [dict(item) for item in items]
        self.reads = 0
        self.last_cursor = None

    def find(self, _query, _projection=None):
        self.reads += 1
        self.last_cursor = Cursor(self.items)
        return self.last_cursor

    async def find_one(self, query, _projection=None):
        self.reads += 1
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                return dict(item)
        return None


class ReportDatabase:
    def __init__(
        self,
        *,
        notifications=(),
        outbox=(),
        logs=(),
        inquiries=(),
        name=TARGET_DATABASE,
        roles=None,
    ):
        self.notifications = ReadOnlyCollection(notifications)
        self.notification_outbox = ReadOnlyCollection(outbox)
        self.admin_notification_log = ReadOnlyCollection(logs)
        self.notification_report_evidence_manifest = ReadOnlyCollection(
            [
                {
                    "dataset_id": "synthetic-dataset",
                    "snapshot_id": "synthetic-snapshot",
                    "manifest_id": "synthetic-manifest",
                    "snapshot_fingerprint": SNAPSHOT_FINGERPRINT,
                }
            ]
        )
        self.inquiries = ReadOnlyCollection(inquiries)
        self.b2b_quotes = ReadOnlyCollection()
        self.b2b_projects = ReadOnlyCollection()
        self.work_orders = ReadOnlyCollection()
        self.retail_orders = ReadOnlyCollection()
        self.restock_alerts = ReadOnlyCollection()
        self.materials = ReadOnlyCollection()
        self.product_variants = ReadOnlyCollection()
        self.name = name
        self.client = SimpleNamespace(
            nodes={("127.0.0.1", 27029)},
            options=SimpleNamespace(replica_set_name="rs-report"),
        )
        self.roles = [{"role": "read", "db": name}] if roles is None else list(roles)
        self.commands = 0

    async def command(self, command):
        assert command == {"connectionStatus": 1}
        self.commands += 1
        return {"authInfo": {"authenticatedUserRoles": list(self.roles)}}


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
        "schema_version": 1,
        "read_at": None,
        "occurrence_count": 1,
        "created_at": "2026-07-28T00:00:00+00:00",
        "last_seen_at": "2026-07-28T00:00:00+00:00",
        "updated_at": "2026-07-28T00:00:00+00:00",
        "expires_at": (
            datetime(2026, 7, 28, tzinfo=timezone.utc) + timedelta(days=180)
        ).isoformat(),
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
        "last_error": None,
        "next_attempt_at": None,
        "lease_owner": None,
        "lease_token": None,
        "lease_until": None,
        "created_at": NOW,
        "updated_at": NOW,
    }
    value.update(overrides)
    return value


def run_report(database, **overrides):
    async def scenario():
        inspected = await inspect_report_target(
            database,
            target_label=TARGET_LABEL,
            expected_database_name=TARGET_DATABASE,
        )
        approval = synthetic_approval(inspected)
        target = await verify_report_target(
            database,
            target_label=TARGET_LABEL,
            expected_database_name=TARGET_DATABASE,
            approval=approval,
            now=NOW,
        )
        return await build_notification_schema_report(
            database, target=target, now=NOW, **overrides
        )

    return asyncio.run(scenario())


def synthetic_approval(inspected, **overrides):
    values = {
        "dataset_id": "synthetic-dataset",
        "snapshot_id": "synthetic-snapshot",
        "manifest_id": "synthetic-manifest",
        "read_only_credential_reference": "fixture-read-role-ref",
        "custody_owner": "fixture-owner",
        "reviewer": "fixture-reviewer",
        "execution_window_start": NOW - timedelta(hours=1),
        "execution_window_end": NOW + timedelta(hours=1),
        "evidence_location": "synthetic-only",
        "retention_policy": "aggregate-evidence-30d",
    }
    values.update(overrides)
    values.setdefault(
        "expected_fingerprint",
        build_representative_fingerprint(
            inspected.topology_fingerprint,
            dataset_id=values["dataset_id"],
            snapshot_id=values["snapshot_id"],
            manifest_id=values["manifest_id"],
            snapshot_fingerprint=SNAPSHOT_FINGERPRINT,
        ),
    )
    return RepresentativeEvidenceApproval(**values)


def test_report_is_aggregate_only_and_ready_for_valid_modern_records():
    database = ReportDatabase(
        notifications=[modern_notification(event="admin.message.log-1")],
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
    assert report["report_version"] == 3
    assert report["report_time"] == NOW.isoformat()
    assert report["target"] == {
        "label": TARGET_LABEL,
        "database": TARGET_DATABASE,
        "fingerprint": report["target"]["fingerprint"],
        "approval_fingerprint": report["target"]["approval_fingerprint"],
        "read_only_role_verified": True,
    }
    assert len(report["target"]["fingerprint"]) == 64
    assert report["collections"]["notifications"]["shape_counts"] == {
        "modern_candidate": 1
    }
    assert (
        len(report["collections"]["notifications"]["field_presence_signature_counts"])
        == 1
    )
    assert (
        len(report["collections"]["notifications"]["field_type_signature_counts"]) == 1
    )
    assert report["issues"] == {}
    rendered = json.dumps(report)
    assert "customer@example.test" not in rendered
    assert "notification-1" not in rendered
    assert "Inquiry dibuat" not in rendered
    assert "fixture-read-role-ref" not in rendered
    assert "aggregate-evidence-30d" not in rendered


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
    database = ReportDatabase(
        notifications=[legacy, {**legacy, "id": "mixed-1", "event": "x"}]
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["legacy_notification_shape"] == 1
    assert report["issues"]["mixed_or_unknown_notification_shape"] == 1


def test_canonical_notification_with_legacy_contact_field_is_mixed_and_blocked():
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification(to_email="private@example.test")],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"]["mixed_or_unknown_notification_shape"] == 1
    assert "private@example.test" not in json.dumps(report)


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
        notifications=[
            modern_notification(reset_token=secret_value),
            modern_notification(id="must-not-be-read"),
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["prohibited_security_field"] == 1
    assert secret_value not in json.dumps(report)
    assert report["collections"]["notifications"]["scanned_before_stop"] == 1
    assert database.notifications.last_cursor.yielded == 1
    assert database.notification_outbox.reads == 0
    assert database.admin_notification_log.reads == 0


def test_report_stops_on_invalid_required_notification_types():
    database = ReportDatabase(
        notifications=[
            modern_notification(
                user_id=None,
                event=None,
                title=None,
                body=None,
                occurrence_count=0,
            )
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["invalid_notification_user_id"] == 1
    assert report["issues"]["invalid_notification_event"] == 1
    assert report["issues"]["invalid_notification_title"] == 1
    assert report["issues"]["invalid_notification_body"] == 1
    assert report["issues"]["invalid_notification_occurrence_count"] == 1


def test_report_stops_when_canonical_notification_fields_are_absent():
    notification = modern_notification()
    for field in ("schema_version", "reference_type", "reference_id", "expires_at"):
        notification.pop(field)
    database = ReportDatabase(notifications=[notification])

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["unknown_notification_schema_version"] == 1
    assert report["issues"]["missing_notification_reference_type"] == 1
    assert report["issues"]["missing_notification_reference_id"] == 1
    assert report["issues"]["missing_notification_expires_at"] == 1


def test_report_stops_on_invalid_outbox_state_attempt_and_lease_combination():
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[valid_outbox(status={"invalid": "shape"}, attempts=-9)],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["unknown_outbox_state"] == 1


def test_report_stops_when_outbox_runtime_fields_are_absent():
    outbox = valid_outbox()
    for field in (
        "last_error",
        "next_attempt_at",
        "lease_owner",
        "lease_token",
        "lease_until",
    ):
        outbox.pop(field)
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[outbox],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["collections"]["notification_outbox"]["shape_counts"] == {
        "missing_runtime_fields": 1
    }
    assert report["issues"]["missing_outbox_runtime_fields"] == 1
    assert report["issues"]["invalid_delivery_state"] == 1


def test_report_stops_on_admin_payload_or_contact_and_does_not_echo_values():
    private_message = "must-not-appear-admin-message"
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 1,
                "sent_by": "admin-1",
                "created_at": NOW,
                "user_id": "user-1",
                "subject": "Private subject",
                "message": private_message,
            }
        ]
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"] == {"admin_log_privacy_boundary": 1}
    assert private_message not in json.dumps(report)


def test_report_counts_unlinked_metadata_only_admin_log():
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 1,
                "sent_by": "admin-1",
                "created_at": NOW,
            }
        ]
    )

    report = run_report(database)

    assert report["issues"]["unlinked_admin_log"] == 1
    assert "admin_log_notification_count_mismatch" not in report["issues"]


def test_zero_recipient_metadata_log_is_not_falsely_unlinked():
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 0,
                "sent_by": "admin-1",
                "created_at": NOW,
            }
        ]
    )

    report = run_report(database)

    assert report["disposition"] == "ready_for_review"
    assert "unlinked_admin_log" not in report["issues"]


def test_admin_security_field_keeps_distinct_privacy_issue_category():
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 0,
                "sent_by": "admin-1",
                "created_at": NOW,
                "reset_token": "must-not-appear",
            }
        ]
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"] == {"prohibited_security_field": 1}
    assert "must-not-appear" not in json.dumps(report)


def test_nested_admin_contact_is_a_privacy_stop():
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 1,
                "sent_by": "admin-1",
                "created_at": NOW,
                "selector": {"email": "private@example.test"},
            }
        ]
    )

    report = run_report(database)

    assert report["issues"] == {"admin_log_privacy_boundary": 1}
    assert "private@example.test" not in json.dumps(report)


def test_compound_admin_contact_variant_is_a_privacy_stop():
    database = ReportDatabase(
        logs=[
            {
                "id": "log-1",
                "recipient_count": 1,
                "sent_by": "admin-1",
                "created_at": NOW,
                "selector": {"recipientEmail": "private@example.test"},
            }
        ]
    )

    report = run_report(database)

    assert report["issues"] == {"admin_log_privacy_boundary": 1}
    assert "private@example.test" not in json.dumps(report)


def test_admin_link_count_must_match_aggregate_recipient_count():
    database = ReportDatabase(
        notifications=[modern_notification(event="admin.message.log-1")],
        logs=[
            {
                "id": "log-1",
                "recipient_count": 2,
                "sent_by": "admin-1",
                "created_at": NOW,
            }
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["issues"]["admin_log_notification_count_mismatch"] == 1


@pytest.mark.parametrize("schema_version", [None, "", True, 0, 1.0, "1", 2, 999])
def test_only_exact_integer_schema_version_one_is_supported(schema_version):
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification(schema_version=schema_version)],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"]["unknown_notification_schema_version"] == 1
    assert "invalid_notification_schema_version" not in report["issues"]


@pytest.mark.parametrize(
    ("field_name", "expected"),
    [
        ("customerID", "customer_id"),
        ("HTTPToken", "http_token"),
        ("apiURL", "api_url"),
        ("APIKey", "api_key"),
        ("already_snake", "already_snake"),
        ("future-metadata", "future_metadata"),
    ],
)
def test_field_name_normalization_handles_acronym_and_separator_boundaries(
    field_name, expected
):
    assert report_module._normalize_field_name(field_name) == expected


@pytest.mark.parametrize(
    "field_name",
    [
        "APIKey",
        "apiKey",
        "ApiKey",
        "apikey",
        "api_key",
        "api-key",
        "API_KEY",
        "Api_Key",
        "api key",
    ],
)
def test_api_key_variants_trigger_immediate_privacy_stop(field_name, capsys):
    secret = "SYNTHETIC_SECRET_MUST_NOT_APPEAR"
    database = ReportDatabase(
        notifications=[
            modern_notification(**{field_name: secret}),
            modern_notification(id="must-not-be-read", deduplication_key="later"),
        ],
        outbox=[valid_outbox()],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)
    captured = capsys.readouterr()

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"] == {"prohibited_security_field": 1}
    assert database.notifications.last_cursor.yielded == 1
    assert database.notification_outbox.reads == 0
    assert secret not in json.dumps(report)
    assert secret not in captured.out
    assert secret not in captured.err


@pytest.mark.parametrize(
    "field_name",
    [
        "AccessToken",
        "refresh-token",
        "AUTHORIZATION",
        "passwordHash",
        "PrivateKey",
        "sessionToken",
        "cookie",
        "credential",
        "clientSecret",
        "secret",
    ],
)
def test_other_policy_security_field_variants_are_privacy_stops(field_name):
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification(**{field_name: "private-value"})],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"] == {"prohibited_security_field": 1}
    assert "private-value" not in json.dumps(report)


@pytest.mark.parametrize("field_name", ["resetToken", " reset--token ", "RESET_token"])
@pytest.mark.parametrize("field_value", [None, "", "private-value"])
def test_privacy_field_normalization_stops_on_presence(field_name, field_value):
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification(**{field_name: field_value})],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"] == {"prohibited_security_field": 1}
    assert "private-value" not in json.dumps(report)


def test_compound_nested_privacy_field_is_a_stop_condition():
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification()],
            outbox=[valid_outbox(payload={"passwordResetToken": "private-value"})],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"] == {"prohibited_security_field": 1}
    assert "private-value" not in json.dumps(report)


def test_nested_privacy_field_inside_exempt_outbox_lease_token_still_stops():
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[
            valid_outbox(
                lease_token={"passwordResetToken": "private-value"},
                status="processing",
                lease_owner="worker-1",
                lease_until=NOW,
                next_attempt_at=NOW,
            ),
            valid_outbox(id="must-not-be-read"),
        ],
        logs=[
            {
                "id": "must-not-be-read",
                "recipient_count": 0,
                "sent_by": "admin-1",
                "created_at": NOW,
            }
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["issues"] == {"prohibited_security_field": 1}
    assert report["collections"]["notification_outbox"]["scanned_before_stop"] == 1
    assert database.notification_outbox.last_cursor.yielded == 1
    assert database.admin_notification_log.reads == 0
    assert "private-value" not in json.dumps(report)


def test_unknown_fields_use_deterministic_aggregate_signature_without_values():
    first = modern_notification()
    first.update({"customNote": "private-a", "future_flag": 1})
    second = modern_notification()
    second.update({"future_flag": 99, "custom_note": "private-b"})

    first_report = run_report(ReportDatabase(notifications=[first]))
    second_report = run_report(ReportDatabase(notifications=[second]))
    first_counts = first_report["collections"]["notifications"][
        "unknown_field_signature_counts"
    ]
    second_counts = second_report["collections"]["notifications"][
        "unknown_field_signature_counts"
    ]

    assert first_report["issues"]["unknown_field_signature"] == 1
    assert first_counts == second_counts
    rendered = json.dumps(first_report)
    assert "custom_note" not in rendered
    assert "private-a" not in rendered


def test_unknown_nested_payload_parent_is_blocked_with_canonical_signature():
    secret = "SYNTHETIC_SECRET_MUST_NOT_APPEAR"
    first_payload = {
        "subject": "Known",
        "futureMetadata": {"customerNote": secret},
    }
    second_payload = {
        "future-metadata": {"differentChild": "different-value"},
        "subject": "Different known value",
    }
    first_report = run_report(
        ReportDatabase(
            notifications=[modern_notification()],
            outbox=[valid_outbox(payload=first_payload)],
            inquiries=[{"id": "inquiry-1"}],
        )
    )
    second_report = run_report(
        ReportDatabase(
            notifications=[modern_notification()],
            outbox=[valid_outbox(payload=second_payload)],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report_module._unknown_schema_paths(
        "notification_outbox", {"payload": first_payload}
    ) == ["payload.future_metadata"]
    assert first_report["disposition"] == "blocked_ambiguity"
    assert first_report["issues"]["unknown_field_signature"] == 1
    assert (
        first_report["collections"]["notification_outbox"][
            "unknown_field_signature_counts"
        ]
        == second_report["collections"]["notification_outbox"][
            "unknown_field_signature_counts"
        ]
    )
    rendered = json.dumps(first_report)
    assert secret not in rendered
    assert "customer_note" not in rendered


def test_multiple_nested_unknown_paths_are_sorted_deduplicated_and_value_free():
    payload = {
        "zFuture": [{"privateChild": "private-a"}, {"privateChild": "private-b"}],
        "aFuture": {"deeper": {"privateChild": "private-c"}},
    }
    document = {"payload": payload}

    assert report_module._unknown_schema_paths("notification_outbox", document) == [
        "payload.a_future",
        "payload.z_future",
    ]
    assert report_module._unknown_schema_paths(
        "notification_outbox",
        {"payload": {"futureMetadata": {}, "future-metadata": {}}},
    ) == ["payload.future_metadata"]


def test_known_payload_shape_and_empty_payload_remain_supported():
    for payload in (
        {},
        {"subject": "Subject"},
        {"subject": "Subject", "title": "Title", "body_html": "Body"},
    ):
        report = run_report(
            ReportDatabase(
                notifications=[modern_notification()],
                outbox=[valid_outbox(payload=payload)],
                inquiries=[{"id": "inquiry-1"}],
            )
        )
        assert report["disposition"] == "ready_for_review"


def test_known_payload_field_with_wrong_type_is_blocked_without_value_output():
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification()],
            outbox=[valid_outbox(payload={"subject": {"private": "value"}})],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"]["invalid_outbox_payload_field"] == 1
    assert report["disposition"] == "blocked_ambiguity"
    assert "value" not in json.dumps(report)


def test_pathological_nested_structure_stops_at_bounded_depth():
    nested: dict[str, Any] = {}
    cursor = nested
    for _index in range(report_module.MAX_NESTED_DEPTH + 2):
        cursor["safe_container"] = {}
        cursor = cursor["safe_container"]
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[valid_outbox(payload={"futureMetadata": nested})],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["issues"] == {"nested_structure_depth_exceeded": 1}
    assert report["disposition"] == "blocked_ambiguity"


def test_unknown_fields_block_outbox_and_admin_log_with_aggregate_only_counts():
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[valid_outbox(providerTrace="private-outbox")],
        logs=[
            {
                "id": "log-1",
                "recipient_count": 0,
                "sent_by": "admin-1",
                "created_at": NOW,
                "futureMetadata": "private-log",
            }
        ],
        inquiries=[{"id": "inquiry-1"}],
    )

    report = run_report(database)

    assert report["issues"]["unknown_field_signature"] == 2
    assert (
        len(
            report["collections"]["notification_outbox"][
                "unknown_field_signature_counts"
            ]
        )
        == 1
    )
    assert (
        len(
            report["collections"]["admin_notification_log"][
                "unknown_field_signature_counts"
            ]
        )
        == 1
    )
    rendered = json.dumps(report)
    assert "private-outbox" not in rendered
    assert "private-log" not in rendered


def test_malformed_known_admin_metadata_types_are_blocked():
    report = run_report(
        ReportDatabase(
            logs=[
                {
                    "id": "log-1",
                    "target": {"invalid": "shape"},
                    "segment": ["invalid"],
                    "recipient_count": 0,
                    "delivery_status": 7,
                    "sent_by": "admin-1",
                    "created_at": NOW,
                }
            ]
        )
    )

    assert report["issues"]["invalid_admin_log_target"] == 1
    assert report["issues"]["invalid_admin_log_segment"] == 1
    assert report["issues"]["invalid_admin_log_delivery_status"] == 1


def test_blocked_status_is_deterministic_regardless_of_record_order():
    valid = modern_notification()
    invalid = modern_notification(
        id="notification-2",
        deduplication_key="dedup-2",
        schema_version=2,
        futureField="private-value",
    )
    reports = []
    for records in ([valid, invalid], [invalid, valid]):
        reports.append(
            run_report(
                ReportDatabase(
                    notifications=records,
                    inquiries=[{"id": "inquiry-1"}],
                )
            )
        )

    for report in reports:
        assert report["disposition"] == "blocked_ambiguity"
        assert report["issues"]["mixed_or_unknown_notification_shape"] == 1
        assert report["issues"]["unknown_field_signature"] == 1
        assert report["issues"]["unknown_notification_schema_version"] == 1
        assert "private-value" not in json.dumps(report)
    assert reports[0]["issues"] == reports[1]["issues"]
    assert (
        reports[0]["collections"]["notifications"]["unknown_field_signature_counts"]
        == reports[1]["collections"]["notifications"]["unknown_field_signature_counts"]
    )


@pytest.mark.parametrize(
    "state_overrides",
    [
        {"status": "pending", "attempts": 0, "next_attempt_at": NOW},
        {
            "status": "processing",
            "attempts": 4,
            "next_attempt_at": NOW,
            "lease_owner": "worker-1",
            "lease_token": "lease-1",
            "lease_until": NOW + timedelta(minutes=1),
        },
        {"status": "delivered", "attempts": 1},
        {"status": "exhausted", "attempts": 5, "last_error": "RuntimeError"},
    ],
)
def test_each_writer_reachable_outbox_state_is_valid(state_overrides):
    database = ReportDatabase(
        notifications=[modern_notification()],
        outbox=[valid_outbox(**state_overrides)],
        inquiries=[{"id": "inquiry-1"}],
    )

    assert run_report(database)["disposition"] == "ready_for_review"


@pytest.mark.parametrize(
    ("overrides", "reason"),
    [
        (
            {
                "status": "processing",
                "attempts": 5,
                "next_attempt_at": NOW,
                "lease_owner": "worker-1",
                "lease_token": "lease-1",
                "lease_until": NOW,
            },
            "invalid_delivery_state",
        ),
        (
            {"status": "delivered", "last_error": {"raw": "private"}},
            "invalid_outbox_last_error",
        ),
        ({"channel": "sms"}, "unknown_outbox_channel"),
        ({"channel": {"invalid": "shape"}}, "invalid_outbox_channel"),
    ],
)
def test_invalid_outbox_type_and_state_combinations_fail_closed(overrides, reason):
    report = run_report(
        ReportDatabase(
            notifications=[modern_notification()],
            outbox=[valid_outbox(**overrides)],
            inquiries=[{"id": "inquiry-1"}],
        )
    )

    assert report["issues"][reason] == 1
    assert "private" not in json.dumps(report)


class TargetDatabase(ReportDatabase):
    def __init__(self, *, name="niuva_notification_isolated", roles=()):
        super().__init__(notifications=[modern_notification()], name=name, roles=roles)


def test_target_verification_requires_exact_database_scoped_read_role():
    database = TargetDatabase(
        roles=[{"role": "readWrite", "db": "niuva_notification_isolated"}]
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            inspect_report_target(
                database,
                target_label="isolated-notification-evidence",
                expected_database_name="niuva_notification_isolated",
            )
        )

    assert refused.value.code == "read_only_role_not_verified"
    assert database.notifications.reads == 0


@pytest.mark.parametrize(
    "target_label",
    [
        "shared-notification",
        "staging-notification",
        "notification-prod",
        "production-copy",
    ],
)
def test_target_verification_refuses_nonisolated_label_before_database_command(
    target_label,
):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            inspect_report_target(
                database,
                target_label=target_label,
                expected_database_name="niuva_notification_isolated",
            )
        )

    assert refused.value.code == "unsafe_target_label"
    assert database.commands == 0
    assert database.notifications.reads == 0


def test_verified_target_fingerprint_must_match_before_collection_reads():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    inspected = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    assert len(inspected.topology_fingerprint) == 64

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            verify_report_target(
                database,
                target_label="isolated-notification-evidence",
                expected_database_name="niuva_notification_isolated",
                approval=synthetic_approval(inspected, expected_fingerprint="0" * 64),
                now=NOW,
            )
        )

    assert refused.value.code == "target_fingerprint_mismatch"
    assert database.notifications.reads == 0


def test_approved_fingerprint_is_required_before_target_verification():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            verify_report_target(
                database,
                target_label="isolated-notification-evidence",
                expected_database_name="niuva_notification_isolated",
                approval=None,
            )
        )

    assert refused.value.code == "representative_evidence_approval_required"
    assert database.commands == 0
    assert database.notifications.reads == 0


def test_inspection_evidence_cannot_authorize_a_report_scan():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspected = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            build_notification_schema_report(database, target=inspected, now=NOW)
        )

    assert refused.value.code == "target_not_verified"
    assert database.notifications.reads == 0


def test_verified_target_is_rebound_to_the_database_immediately_before_scan():
    verified_database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspected = asyncio.run(
        inspect_report_target(
            verified_database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    target = asyncio.run(
        verify_report_target(
            verified_database,
            target_label=inspected.label,
            expected_database_name=inspected.database_name,
            approval=synthetic_approval(inspected),
            now=NOW,
        )
    )
    different_database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    different_database.client.nodes = {("10.99.0.7", 27017)}

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            build_notification_schema_report(different_database, target=target, now=NOW)
        )

    assert refused.value.code == "target_not_verified"
    assert different_database.notifications.reads == 0


def command_args(**overrides):
    values = {
        "database": "niuva_notification_isolated",
        "target_label": "isolated-notification-evidence",
        "confirm_isolated_target": "isolated-notification-evidence",
        "inspect_target": True,
        "evidence_manifest": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def write_manifest(tmp_path, topology_fingerprint, **overrides):
    manifest = {
        "dataset_id": "synthetic-dataset",
        "snapshot_id": "synthetic-snapshot",
        "manifest_id": "synthetic-manifest",
        "expected_fingerprint": build_representative_fingerprint(
            topology_fingerprint,
            dataset_id="synthetic-dataset",
            snapshot_id="synthetic-snapshot",
            manifest_id="synthetic-manifest",
            snapshot_fingerprint=SNAPSHOT_FINGERPRINT,
        ),
        "read_only_credential_reference": "fixture-read-role-ref",
        "custody_owner": "fixture-owner",
        "reviewer": "fixture-reviewer",
        "execution_window": {
            "starts_at": "2020-01-01T00:00:00+00:00",
            "ends_at": "2030-01-01T00:00:00+00:00",
        },
        "evidence_location": "synthetic-only",
        "retention_policy": "aggregate-evidence-30d",
    }
    manifest.update(overrides)
    path = tmp_path / "representative-evidence.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")
    return str(path)


def test_missing_evidence_manifest_blocks_before_database_verification():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    output, return_code = asyncio.run(
        execute_report_command(database, command_args(inspect_target=False))
    )

    assert return_code == 2
    assert output["issues"] == {"representative_evidence_approval_required": 1}
    assert database.commands == 0
    assert database.notifications.reads == 0


@pytest.mark.parametrize(
    "manifest",
    [
        {},
        {"dataset_id": "only-one-key"},
        {
            "dataset_id": "dataset",
            "snapshot_id": "snapshot",
            "manifest_id": "manifest",
            "expected_fingerprint": "not-a-fingerprint",
            "custody_owner": "owner",
            "reviewer": "reviewer",
            "execution_window": {"starts_at": "later", "ends_at": "earlier"},
            "evidence_location": "synthetic-only",
        },
        {
            "dataset_id": "dataset",
            "snapshot_id": "snapshot",
            "manifest_id": "manifest",
            "expected_fingerprint": "0" * 64,
            "custody_owner": "owner",
            "reviewer": "reviewer",
            "execution_window": {
                "starts_at": "2026-07-29T00:00:00",
                "ends_at": "2026-07-29T01:00:00",
            },
            "evidence_location": "synthetic-only",
        },
        {
            "dataset_id": "dataset",
            "snapshot_id": "snapshot",
            "manifest_id": "manifest",
            "expected_fingerprint": "0" * 64,
            "custody_owner": "same-person",
            "reviewer": " SAME-PERSON ",
            "execution_window": {
                "starts_at": "2026-07-29T00:00:00+00:00",
                "ends_at": "2026-07-29T01:00:00+00:00",
            },
            "evidence_location": "synthetic-only",
        },
    ],
)
def test_invalid_evidence_manifest_is_rejected(tmp_path, manifest):
    path = tmp_path / "invalid-manifest.json"
    path.write_text(json.dumps(manifest), encoding="utf-8")

    with pytest.raises(ReportTargetError) as refused:
        load_representative_evidence_manifest(str(path))

    assert refused.value.code == "representative_evidence_manifest_invalid"


@pytest.mark.parametrize(
    "missing_field",
    [
        "dataset_id",
        "snapshot_id",
        "manifest_id",
        "expected_fingerprint",
        "read_only_credential_reference",
        "custody_owner",
        "reviewer",
        "execution_window",
        "evidence_location",
        "retention_policy",
    ],
)
def test_every_representative_manifest_field_is_required(tmp_path, missing_field):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspection = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    path = write_manifest(tmp_path, inspection.topology_fingerprint)
    manifest = json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    manifest.pop(missing_field)
    pathlib.Path(path).write_text(json.dumps(manifest), encoding="utf-8")

    with pytest.raises(ReportTargetError) as refused:
        load_representative_evidence_manifest(path)

    assert refused.value.code == "representative_evidence_manifest_invalid"


@pytest.mark.parametrize(
    "field",
    [
        "dataset_id",
        "snapshot_id",
        "manifest_id",
        "read_only_credential_reference",
        "custody_owner",
        "reviewer",
        "evidence_location",
        "retention_policy",
    ],
)
def test_placeholder_representative_metadata_is_rejected(tmp_path, field):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspection = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    path = write_manifest(tmp_path, inspection.topology_fingerprint, **{field: "TBD"})

    with pytest.raises(ReportTargetError) as refused:
        load_representative_evidence_manifest(path)

    assert refused.value.code == "representative_evidence_manifest_invalid"


def test_inactive_execution_window_blocks_before_collection_reads():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspected = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    approval = synthetic_approval(
        inspected,
        execution_window_start=NOW - timedelta(days=2),
        execution_window_end=NOW - timedelta(days=1),
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            verify_report_target(
                database,
                target_label=inspected.label,
                expected_database_name=inspected.database_name,
                approval=approval,
                now=NOW,
            )
        )

    assert refused.value.code == "representative_execution_window_inactive"
    assert database.notifications.reads == 0


def test_snapshot_marker_must_match_manifest_before_report_reads():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspected = asyncio.run(
        inspect_report_target(
            database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    database.notification_report_evidence_manifest = ReadOnlyCollection(
        [
            {
                "dataset_id": "different-dataset",
                "snapshot_id": "synthetic-snapshot",
                "manifest_id": "synthetic-manifest",
                "snapshot_fingerprint": SNAPSHOT_FINGERPRINT,
            }
        ]
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            verify_report_target(
                database,
                target_label=inspected.label,
                expected_database_name=inspected.database_name,
                approval=synthetic_approval(inspected),
                now=NOW,
            )
        )

    assert refused.value.code == "representative_snapshot_identity_mismatch"
    assert database.notifications.reads == 0


def test_verified_target_cannot_be_reused_for_same_advertised_topology():
    first_database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspected = asyncio.run(
        inspect_report_target(
            first_database,
            target_label="isolated-notification-evidence",
            expected_database_name="niuva_notification_isolated",
        )
    )
    target = asyncio.run(
        verify_report_target(
            first_database,
            target_label=inspected.label,
            expected_database_name=inspected.database_name,
            approval=synthetic_approval(inspected),
            now=NOW,
        )
    )
    substituted_database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    with pytest.raises(ReportTargetError) as refused:
        asyncio.run(
            build_notification_schema_report(
                substituted_database, target=target, now=NOW
            )
        )

    assert refused.value.code == "target_not_verified"
    assert substituted_database.commands == 0
    assert substituted_database.notifications.reads == 0


def test_target_inspection_never_reads_report_collections():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    output, return_code = asyncio.run(execute_report_command(database, command_args()))

    assert return_code == 0
    assert output["disposition"] == "target_inspection_only"
    assert output["collections_read"] == 0
    assert database.notifications.reads == 0


def test_ready_report_returns_success_exit_code(tmp_path):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    database.inquiries = ReadOnlyCollection([{"id": "inquiry-1"}])
    inspection, inspection_code = asyncio.run(
        execute_report_command(database, command_args())
    )

    output, return_code = asyncio.run(
        execute_report_command(
            database,
            command_args(
                inspect_target=False,
                evidence_manifest=write_manifest(
                    tmp_path, inspection["target"]["topology_fingerprint"]
                ),
            ),
        )
    )

    assert inspection_code == 0
    assert return_code == 0
    assert output["disposition"] == "ready_for_review"


@pytest.mark.parametrize(
    ("notification_overrides", "expected_issue"),
    [
        ({"schema_version": 2}, "unknown_notification_schema_version"),
        ({"APIKey": "SYNTHETIC_SECRET_MUST_NOT_APPEAR"}, "prohibited_security_field"),
    ],
)
def test_blocked_schema_and_privacy_reports_return_exit_three(
    tmp_path, notification_overrides, expected_issue, capsys
):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    database.notifications = ReadOnlyCollection(
        [modern_notification(**notification_overrides)]
    )
    database.inquiries = ReadOnlyCollection([{"id": "inquiry-1"}])
    inspection, _inspection_code = asyncio.run(
        execute_report_command(database, command_args())
    )

    output, return_code = asyncio.run(
        execute_report_command(
            database,
            command_args(
                inspect_target=False,
                evidence_manifest=write_manifest(
                    tmp_path, inspection["target"]["topology_fingerprint"]
                ),
            ),
        )
    )
    captured = capsys.readouterr()

    assert return_code == 3
    assert output["disposition"] == "blocked_ambiguity"
    assert output["issues"][expected_issue] == 1
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in json.dumps(output)
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in captured.err


def test_missing_cli_configuration_returns_validation_exit_without_stderr(
    monkeypatch, capsys
):
    monkeypatch.delenv("NOTIFICATION_REPORT_MONGO_URL", raising=False)

    return_code = asyncio.run(report_module._main(command_args()))
    captured = capsys.readouterr()

    assert return_code == 2
    assert json.loads(captured.out)["issues"] == {"report_credential_unavailable": 1}
    assert captured.err == ""


def test_blocked_report_returns_nonzero_command_exit_code(tmp_path):
    legacy = {
        "id": "legacy-1",
        "user_id": "user-1",
        "to_email": "legacy@example.test",
        "subject": "Legacy",
        "title": "Legacy",
        "body_html": "<p>Legacy</p>",
        "read": False,
        "created_at": NOW,
    }
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    database.notifications = ReadOnlyCollection([legacy])
    inspection, inspection_code = asyncio.run(
        execute_report_command(database, command_args())
    )
    assert inspection_code == 0

    output, return_code = asyncio.run(
        execute_report_command(
            database,
            command_args(
                inspect_target=False,
                evidence_manifest=write_manifest(
                    tmp_path, inspection["target"]["topology_fingerprint"]
                ),
            ),
        )
    )

    assert output["disposition"] == "blocked_ambiguity"
    assert output["issues"] == {"legacy_notification_shape": 1}
    assert return_code == 3


def test_command_requires_exact_isolated_confirmation_before_verification():
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    output, return_code = asyncio.run(
        execute_report_command(
            database,
            command_args(confirm_isolated_target="different-isolated-target"),
        )
    )

    assert return_code == 2
    assert output["issues"] == {"isolated_target_confirmation_mismatch": 1}
    assert database.commands == 0
    assert database.notifications.reads == 0


def test_command_never_echoes_target_verification_exception(capsys):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )

    async def failed_command(_command):
        raise RuntimeError("SYNTHETIC_SECRET_MUST_NOT_APPEAR")

    database.command = failed_command
    output, return_code = asyncio.run(execute_report_command(database, command_args()))
    captured = capsys.readouterr()

    assert return_code == 4
    assert output["issues"] == {"target_verification_unavailable": 1}
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in json.dumps(output)
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in captured.err
    assert database.notifications.reads == 0


def test_command_never_echoes_report_execution_exception(tmp_path, capsys):
    database = TargetDatabase(
        roles=[{"role": "read", "db": "niuva_notification_isolated"}]
    )
    inspection, inspection_code = asyncio.run(
        execute_report_command(database, command_args())
    )
    assert inspection_code == 0

    class FailingCollection(ReadOnlyCollection):
        def find(self, _query, _projection=None):
            raise RuntimeError("SYNTHETIC_SECRET_MUST_NOT_APPEAR")

    database.notifications = FailingCollection()
    output, return_code = asyncio.run(
        execute_report_command(
            database,
            command_args(
                inspect_target=False,
                evidence_manifest=write_manifest(
                    tmp_path, inspection["target"]["topology_fingerprint"]
                ),
            ),
        )
    )
    captured = capsys.readouterr()

    assert return_code == 4
    assert output["issues"] == {"report_execution_unavailable": 1}
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in json.dumps(output)
    assert "SYNTHETIC_SECRET_MUST_NOT_APPEAR" not in captured.err


def test_command_has_no_mutating_mode():
    option_strings = {
        option for action in build_parser()._actions for option in action.option_strings
    }

    assert "--apply" not in option_strings
    assert "--repair" not in option_strings
    assert "--backfill" not in option_strings
    assert "--delete" not in option_strings


def test_report_module_has_no_database_mutation_call():
    forbidden_calls = {
        "bulk_write",
        "create_index",
        "delete_many",
        "delete_one",
        "drop",
        "drop_index",
        "find_one_and_delete",
        "find_one_and_replace",
        "find_one_and_update",
        "insert_many",
        "insert_one",
        "replace_one",
        "update_many",
        "update_one",
    }
    tree = ast.parse(inspect.getsource(report_module))
    called_attributes = {
        node.func.attr
        for node in ast.walk(tree)
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Attribute)
    }

    assert called_attributes.isdisjoint(forbidden_calls)
