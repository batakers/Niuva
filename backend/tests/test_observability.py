"""Negative and bounded-contract tests for local observability."""

import json
import itertools
import threading
import time
import types
from datetime import datetime, timezone

import observability as observability_module
from observability import (
    HISTOGRAM_BUCKETS_MS,
    MAX_BUFFER_RECORDS,
    MAX_TOTAL_ENTRIES,
    MetricCapacityRegistry,
    JsonLineEmitter,
    MetricPort,
    Observability,
    build_event,
    route_template_for_request,
    safe_request_id,
)


VALID_REQUEST_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"


def test_event_envelope_is_closed_and_redacts_untrusted_values():
    record, rejected = build_event(
        "http_request",
        fields={
            "request_id": VALID_REQUEST_ID,
            "route_template": "/api/admin/retail-orders/{order_id}",
            "method": "GET",
            "status_class": "2xx",
            "duration_ms": 12,
            "authorization": "Bearer private-token",
            "customer_payload": {"email": "private@example.test"},
            "provider_payload": "secret-provider-response",
        },
    )

    assert rejected == 3
    assert record["schema_version"] == 1
    assert record["fields"]["request_id"] == VALID_REQUEST_ID
    assert "authorization" not in record["fields"]
    assert "customer_payload" not in record["fields"]
    assert "private-token" not in str(record)
    assert "private@example.test" not in str(record)
    assert "secret-provider-response" not in str(record)


def test_request_ids_and_route_templates_fail_closed():
    assert safe_request_id(VALID_REQUEST_ID) == VALID_REQUEST_ID
    assert safe_request_id("request-123") is None

    safe_request = types.SimpleNamespace(
        scope={"route": types.SimpleNamespace(path="/api/health/ready")}
    )
    unsafe_request = types.SimpleNamespace(
        scope={"route": types.SimpleNamespace(path="/api/orders/{customer_id}/private")}
    )
    assert route_template_for_request(safe_request) == "/api/health/ready"
    assert route_template_for_request(unsafe_request) == "unmatched"


def test_jsonl_emission_is_provider_neutral_and_one_record_per_line():
    output = types.SimpleNamespace(value="")

    class Stream:
        def write(self, value):
            output.value += value

        def flush(self):
            return None

    emitter = JsonLineEmitter(stream=Stream(), error_stream=Stream())
    assert emitter.emit(
        "http_request",
        fields={"route_template": "/api/health", "method": "GET", "status_class": "2xx"},
    ) is True

    lines = output.value.splitlines()
    assert len(lines) == 1
    parsed = json.loads(lines[0])
    assert parsed["event"] == "http_request"
    assert parsed["fields"]["route_template"] == "/api/health"
    assert "http://" not in lines[0]


def test_emitter_bounds_failures_and_reserves_redacted_degraded_signal():
    class FailingStream:
        def write(self, _value):
            raise OSError("private stream failure")

        def flush(self):
            return None

    error_output = []

    class ErrorStream:
        def write(self, value):
            error_output.append(value)

        def flush(self):
            return None

    emitter = JsonLineEmitter(
        stream=FailingStream(),
        error_stream=ErrorStream(),
        monotonic=itertools.count().__next__,
    )
    for _index in range(MAX_BUFFER_RECORDS + 3):
        emitter.emit("http_request", fields={"method": "GET"})

    assert len(emitter.buffer) <= MAX_BUFFER_RECORDS
    assert emitter.dropped_records > 0
    assert error_output
    assert all("private stream failure" not in value for value in error_output)
    degraded = [json.loads(value) for value in error_output]
    assert degraded[0]["event"] == "telemetry_pipeline_degraded"
    assert "reason" in degraded[0]["fields"]


def test_metric_port_maps_unknown_labels_and_enforces_capacity_shape():
    metrics = MetricPort()
    assert metrics.increment(
        "http_requests",
        {"method": "TRACE", "route_template": "/not-registered", "status_class": "7xx"},
    ) is True
    snapshot = metrics.snapshot()
    labels = next(iter(snapshot["counters"]))[1]
    assert dict(labels) == {
        "method": "unknown",
        "route_template": "unmatched",
        "status_class": "unknown",
    }
    assert metrics.observe(
        "http_duration",
        {"method": "GET", "route_template": "/api/health"},
        42,
    ) is True
    assert len(HISTOGRAM_BUCKETS_MS) == 12
    assert metrics.entry_count <= MAX_TOTAL_ENTRIES


def test_metric_port_can_flush_bounded_aggregate_jsonl_records():
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

        def flush(self):
            return None

    observability = Observability(
        emitter=JsonLineEmitter(stream=Stream(), error_stream=Stream())
    )
    observability.metrics.increment(
        "http_requests",
        {"method": "GET", "route_template": "/api/health", "status_class": "2xx"},
    )
    observability.metrics.observe(
        "http_duration",
        {"method": "GET", "route_template": "/api/health"},
        12,
    )

    assert observability.flush_metrics() == len(output)
    records = [json.loads(value) for value in output]
    assert all(record["event"] == "metric" for record in records)
    assert all("labels" in record["fields"] for record in records)


def test_optional_transaction_telemetry_emits_safe_alert_without_changing_result():
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

        def flush(self):
            return None

    observability = Observability(
        emitter=JsonLineEmitter(stream=Stream(), error_stream=Stream())
    )
    observability.record_transaction(
        "transaction_commit_unknown",
        {
            "operation_name": "mongodb://user:secret@db.internal",
            "outcome": "unknown",
            "attempt": 2,
            "retry_mode": "never",
            "correlation_id": "customer-private-id",
            "duration_ms": 12,
        },
    )

    text = "".join(output)
    assert "mongodb://" not in text
    assert "secret" not in text
    assert "customer-private-id" not in text
    events = [json.loads(value)["event"] for value in output]
    assert "transaction_lifecycle" in events
    assert "operational_alert" in events


def test_event_schema_rejects_fields_from_another_event_family():
    record, rejected = observability_module.build_event(
        "http_request",
        fields={
            "method": "GET",
            "route_template": "/api/health",
            "alert_family": "transaction_commit_unknown",
        },
    )

    assert rejected == 1
    assert "alert_family" not in record["fields"]


def test_metric_port_rejects_nonfinite_histogram_values():
    metrics = MetricPort()

    assert metrics.observe(
        "http_duration",
        {"method": "GET", "route_template": "/api/health"},
        float("nan"),
    ) is False
    assert metrics.snapshot()["histograms"] == {}


def test_emitter_enforces_daily_output_budget(monkeypatch):
    monkeypatch.setattr(observability_module, "MAX_OUTPUT_BYTES_PER_DAY", 250)
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

        def flush(self):
            return None

    emitter = JsonLineEmitter(stream=Stream(), error_stream=Stream())
    assert emitter.emit(
        "http_request",
        fields={"route_template": "/api/health", "method": "GET"},
    ) is True
    assert emitter.emit(
        "http_request",
        fields={"route_template": "/api/health", "method": "GET"},
    ) is False
    assert emitter.output_bytes <= 250


def test_emitter_returns_within_write_budget_for_a_slow_stream():
    started = threading.Event()
    release = threading.Event()

    class SlowStream:
        def write(self, _value):
            started.set()
            release.wait(timeout=1)

        def flush(self):
            return None

    emitter = JsonLineEmitter(stream=SlowStream(), error_stream=SlowStream())
    started_at = time.monotonic()
    try:
        assert emitter.emit(
            "http_request",
            fields={"route_template": "/api/health", "method": "GET"},
        ) is False
        assert time.monotonic() - started_at < 0.2
        assert started.wait(timeout=1)
        assert emitter.write_in_flight is True
    finally:
        release.set()
        deadline = time.monotonic() + 1
        while emitter.write_in_flight and time.monotonic() < deadline:
            time.sleep(0.001)
    assert emitter.write_in_flight is False


def test_metric_cardinality_registry_is_shared_by_multiple_metric_ports(monkeypatch):
    registry = MetricCapacityRegistry()
    monkeypatch.setattr(observability_module, "PROCESS_METRIC_CAPACITY", registry)
    first = MetricPort()
    second = MetricPort()
    labels = {
        "method": "GET",
        "route_template": "/api/health",
        "status_class": "2xx",
    }

    assert first.increment("http_requests", labels) is True
    assert second.increment("http_requests", labels) is True
    assert first.entry_count == second.entry_count
    assert registry.entry_count == first.entry_count


def test_metric_records_use_approved_units():
    metrics = MetricPort()
    metrics.increment(
        "dependency_operations",
        {
            "dependency_class": "mongodb",
            "operation_class": "unknown",
            "safe_outcome": "success",
        },
    )
    metrics.set_gauge(
        "worker_oldest_due_age",
        {"worker_class": "notification_delivery"},
        7,
    )

    records = metrics.records()
    units = {record["metric_name"]: record["unit"] for record in records}
    assert units["dependency_operations"] == "operations"
    assert units["worker_oldest_due_age"] == "seconds"


def test_worker_observability_records_backlog_lease_and_exhaustion_gauges():
    observability = Observability(
        emitter=JsonLineEmitter(stream=types.SimpleNamespace(write=lambda _: None))
    )

    observability.record_worker(
        result={"claimed": 1, "delivered": 1, "failed": 0},
        snapshot={
            "pending_due": 2,
            "processing": 1,
            "oldest_due_age_seconds": 7,
            "stale_leases": 3,
            "exhausted": 4,
        },
    )

    gauges = observability.metrics.snapshot()["gauges"]
    assert any(key[0] == "worker_backlog" for key in gauges)
    assert any(key[0] == "worker_oldest_due_age" for key in gauges)
    assert any(key[0] == "worker_stale_leases" for key in gauges)
    assert any(key[0] == "worker_exhausted" for key in gauges)


def test_worker_observability_does_not_zero_gauges_when_snapshot_is_unavailable():
    observability = Observability(
        emitter=JsonLineEmitter(stream=types.SimpleNamespace(write=lambda _: None))
    )
    observability.record_worker(
        result={"claimed": 1},
        snapshot={"pending_due": 4, "processing": 2, "exhausted": 3},
    )
    before = observability.metrics.snapshot()["gauges"].copy()

    observability.record_worker(result={"claimed": 1}, snapshot={})

    assert observability.metrics.snapshot()["gauges"] == before


def test_transaction_alerts_are_deduplicated_and_flush_aggregate_state():
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

        def flush(self):
            return None

    now = datetime(2026, 8, 5, 10, 0, tzinfo=timezone.utc)
    observability = Observability(
        emitter=JsonLineEmitter(stream=Stream(), error_stream=Stream()),
        clock=lambda: now,
    )
    fields = {
        "operation_name": "inventory.reserve",
        "outcome": "unknown",
        "attempt": 2,
        "retry_mode": "never",
        "duration_ms": 12,
    }

    observability.record_transaction("transaction_commit_unknown", fields)
    observability.record_transaction("transaction_commit_unknown", fields)
    assert [
        json.loads(value)["event"] for value in output
    ].count("operational_alert") == 1

    observability.flush_alerts()
    alerts = [json.loads(value) for value in output if json.loads(value)["event"] == "operational_alert"]
    assert alerts[-1]["fields"]["count"] == 2
    assert alerts[-1]["fields"]["first_timestamp"]
    assert alerts[-1]["fields"]["last_timestamp"]


def test_alert_families_cover_api_dependency_worker_and_scheduler_signals():
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

    observability = Observability(
        emitter=JsonLineEmitter(stream=Stream(), error_stream=Stream())
    )

    for _index in range(20):
        observability.record_http(
            request_id=None,
            route_template="/api/orders",
            method="GET",
            status_code=500,
            duration_ms=1,
        )
    for _index in range(3):
        observability.record_dependency(
            dependency="mongodb",
            operation="unknown",
            outcome="timeout",
            duration_ms=1,
        )
    observability.record_scheduler(
        job_name="reservation_expiry",
        outcome="failed_safe",
        duration_ms=1,
    )
    observability.record_worker(
        result={"exhausted": 1, "lease_lost": 1},
        snapshot={"pending_due": 0, "processing": 0, "oldest_due_age_seconds": 0},
    )
    observability.flush_alerts()

    alerts = [
        json.loads(value)["fields"]
        for value in output
        if json.loads(value)["event"] == "operational_alert"
    ]
    families = {alert["alert_family"] for alert in alerts}
    assert {
        "api_error_rate",
        "dependency_timeout",
        "scheduled_job",
        "worker_exhausted",
        "worker_lease",
    } <= families
    assert any(
        alert["alert_family"] == "api_error_rate"
        and alert["count"] >= 2
        for alert in alerts
    )


def test_operational_alert_omits_missing_optional_attempt_count():
    output = []

    class Stream:
        def write(self, value):
            output.append(value)

    observability = Observability(
        emitter=JsonLineEmitter(stream=Stream(), error_stream=Stream())
    )

    for _index in range(20):
        observability.record_http(
            request_id=None,
            route_template="/api/orders",
            method="GET",
            status_code=500,
            duration_ms=1,
        )
    observability.flush_alerts()

    alerts = [
        json.loads(value)
        for value in output
        if json.loads(value)["event"] == "operational_alert"
    ]
    assert alerts
    assert all("attempt_count" not in record["fields"] for record in alerts)
    assert observability.emitter.schema_rejections == 0
    assert observability.metrics.snapshot()["schema_rejections"] == 0
