"""Bounded, provider-neutral observability for Commerce Transaction 1A.

This module emits only redacted JSON Lines to local process streams. It does
not create a public metrics endpoint, select an exporter, or persist telemetry
as domain/audit/security data.
"""

from __future__ import annotations

import json
import math
import sys
import threading
import time
from collections import deque
from datetime import datetime, timedelta, timezone
from typing import Callable, Mapping
from uuid import UUID

SCHEMA_VERSION = 1
MAX_RECORD_BYTES = 50 * 1024
MAX_OUTPUT_BYTES_PER_DAY = 25 * 1024 * 1024
OUTPUT_WINDOW_SECONDS = 24 * 60 * 60
MAX_BUFFER_RECORDS = 256
MAX_BUFFER_BYTES = 1024 * 1024
MAX_HISTOGRAM_COMBINATIONS = 1_000
MAX_NON_HISTOGRAM_ENTRIES = 6_000
MAX_TOTAL_ENTRIES = 20_000
MAX_CONTROL_ENTRIES = 1
DEGRADED_SIGNAL_INTERVAL_SECONDS = 60
TELEMETRY_WRITE_BUDGET_SECONDS = 0.050
ALERT_DEDUP_WINDOW_SECONDS = 15 * 60
MAX_ALERT_SUMMARIES = 1_024
HISTOGRAM_BUCKETS_MS = (
    10,
    50,
    100,
    250,
    500,
    1000,
    2000,
    5000,
    10000,
    15000,
    30000,
    60000,
)

ALLOWED_LEVELS = frozenset({"debug", "info", "warning", "error", "critical"})
ALLOWED_EVENTS = frozenset(
    {
        "http_request",
        "dependency_operation",
        "readiness_signal",
        "worker_signal",
        "scheduler_run",
        "transaction_lifecycle",
        "operational_alert",
        "metric",
        "telemetry_pipeline_degraded",
        "schema_rejected",
    }
)
ALLOWED_METHODS = frozenset(
    {"GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "unknown"}
)
ALLOWED_STATUS_CLASSES = frozenset({"1xx", "2xx", "3xx", "4xx", "5xx", "unknown"})
ALLOWED_ENVIRONMENTS = frozenset(
    {"local", "test", "development", "sandbox", "staging", "production", "unknown"}
)
ALLOWED_OUTCOMES = frozenset(
    {
        "success",
        "started",
        "committed",
        "timeout",
        "unavailable",
        "rejected",
        "failed_safe",
        "cancelled",
        "commit_unknown",
        "aborted",
        "retrying",
        "dropped",
        "backpressure",
        "unknown",
    }
)
ALLOWED_ERROR_CLASSES = frozenset(
    {
        "none",
        "transaction_unavailable",
        "commit_outcome_unknown",
        "database_error",
        "application_error",
        "delivery_timeout",
        "lease_lost",
        "dependency_unavailable",
        "dependency_timeout",
        "schema_rejected",
        "unknown",
    }
)
ALLOWED_RETRY_MODES = frozenset({"never", "driver_transient", "bounded", "unknown"})
ALLOWED_DEPENDENCIES = frozenset({"mongodb", "email", "storage", "internal", "unknown"})
ALLOWED_OPERATION_CLASSES = frozenset(
    {
        "retail.create_order",
        "retail.transition_order",
        "inventory.create_reservation",
        "inventory.consume_reservation",
        "inventory.release_reservation",
        "inventory.expire_reservations",
        "inventory.reserve",
        "catalog.publish_product",
        "catalog.publish",
        "settings.profile_update",
        "notifications.queue_admin_message",
        "transaction.unavailable",
        "transaction.lifecycle",
        "unknown",
        "redacted",
        "other",
    }
)
ALLOWED_WORKER_CLASSES = frozenset({"notification_delivery", "scheduler", "unknown"})
ALLOWED_CHANNELS = frozenset({"in_app", "email", "unknown"})
ALLOWED_STATES = frozenset(
    {
        "pending",
        "processing",
        "delivered",
        "exhausted",
        "ready",
        "unavailable",
        "active",
        "released",
        "unknown",
    }
)
ALLOWED_JOB_NAMES = frozenset(
    {"reservation_expiry", "notification_retention", "unknown"}
)
ALLOWED_CAPABILITY_REASONS = frozenset(
    {"available", "transactions_disabled", "probe_failed", "unknown"}
)
ALLOWED_ALERT_FAMILIES = frozenset(
    {
        "api_error_rate",
        "api_latency",
        "dependency_unavailable",
        "dependency_timeout",
        "worker_backlog",
        "worker_exhausted",
        "worker_lease",
        "scheduled_job",
        "transaction_unavailable",
        "transaction_commit_unknown",
        "telemetry_pipeline_degraded",
        "unknown",
    }
)
ALLOWED_REASONS = frozenset(
    {
        "write_failure",
        "buffer_saturated",
        "drop_ratio",
        "retry_latch",
        "schema_rejected",
        "lease_lost",
        "unknown",
    }
)
ROUTE_TEMPLATES = frozenset(
    {
        "/api",
        "/api/health",
        "/api/health/live",
        "/api/health/ready",
        "/api/capabilities",
        "/api/orders",
        "/api/orders/{oid}",
        "/api/admin/retail-orders",
        "/api/admin/retail-orders/{order_id}",
        "/api/admin/retail-orders/{order_id}/transitions",
        "/api/admin/retail-orders/{order_id}/{suspended_action}",
        "/api/notifications",
        "/api/notifications/unread-count",
        "/api/notifications/{notification_id}/read",
        "/api/notifications/read-all",
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/refresh",
        "/api/auth/logout",
        "/api/admin/orders",
        "/api/admin/orders/{oid}/estimate",
        "/api/admin/orders/{oid}/verify-payment",
        "/api/admin/orders/{oid}/status",
        "/api/admin/customers",
        "/api/admin/customers/{customer_id}/deactivate",
        "/api/admin/customers/{customer_id}/reactivate",
        "/api/settings",
        "/api/admin/settings",
        "/api/files/{path:path}",
        "/api/media/{file_id}",
        "/api/file-objects/{file_id}",
        "unmatched",
    }
)
SYNTHETIC_ROUTE_TEMPLATES = frozenset({"/api/health/live", "/api/health/ready"})

METRIC_SPECS = {
    "http_requests": (
        "counter",
        frozenset({"method", "route_template", "status_class"}),
    ),
    "http_duration": ("histogram", frozenset({"method", "route_template"})),
    "dependency_operations": (
        "counter",
        frozenset({"dependency_class", "operation_class", "safe_outcome"}),
    ),
    "dependency_duration": (
        "histogram",
        frozenset({"dependency_class", "operation_class", "safe_outcome"}),
    ),
    "readiness_transitions": (
        "counter",
        frozenset({"dependency_class", "safe_state"}),
    ),
    "worker_claims_results": (
        "counter",
        frozenset({"worker_class", "channel", "safe_outcome"}),
    ),
    "worker_backlog": ("gauge", frozenset({"worker_class", "safe_state"})),
    "worker_oldest_due_age": ("gauge", frozenset({"worker_class"})),
    "worker_stale_leases": ("gauge", frozenset({"worker_class"})),
    "worker_exhausted": ("gauge", frozenset({"worker_class", "channel"})),
    "scheduled_runs": ("counter", frozenset({"job_name", "safe_outcome"})),
    "scheduled_duration": ("histogram", frozenset({"job_name", "safe_outcome"})),
    "transaction_lifecycle": (
        "counter",
        frozenset({"operation_class", "safe_outcome", "retry_mode"}),
    ),
    "transaction_duration": (
        "histogram",
        frozenset({"operation_class", "safe_outcome"}),
    ),
    "transaction_capability": ("gauge", frozenset({"safe_capability_reason"})),
}

METRIC_UNITS = {
    "http_requests": "requests",
    "http_duration": "milliseconds",
    "dependency_operations": "operations",
    "dependency_duration": "milliseconds",
    "readiness_transitions": "transitions",
    "worker_claims_results": "entries",
    "worker_backlog": "entries",
    "worker_oldest_due_age": "seconds",
    "worker_stale_leases": "entries",
    "worker_exhausted": "entries",
    "scheduled_runs": "runs",
    "scheduled_duration": "milliseconds",
    "transaction_lifecycle": "transactions",
    "transaction_duration": "milliseconds",
    "transaction_capability": "boolean",
}

LABEL_KEYS = frozenset(
    {
        "method",
        "route_template",
        "status_class",
        "dependency_class",
        "operation_class",
        "worker_class",
        "channel",
        "job_name",
        "safe_state",
        "safe_outcome",
        "retry_mode",
        "safe_capability_reason",
    }
)

EVENT_FIELD_ALLOWLIST = {
    "http_request": frozenset(
        {
            "request_id",
            "route_template",
            "method",
            "status_class",
            "duration_ms",
            "synthetic",
        }
    ),
    "dependency_operation": frozenset(
        {
            "dependency_class",
            "operation_class",
            "operation_name",
            "duration_ms",
            "safe_outcome",
            "outcome",
            "safe_error_class",
            "error_class",
            "retry_mode",
            "attempt",
            "attempt_count",
        }
    ),
    "readiness_signal": frozenset(
        {"dependency_class", "safe_state", "state", "duration_ms"}
    ),
    "worker_signal": frozenset(
        {
            "worker_class",
            "channel",
            "safe_state",
            "state",
            "safe_outcome",
            "outcome",
            "safe_error_class",
            "error_class",
            "lease_state",
            "count",
            "age_ms",
            "attempt",
            "attempt_count",
        }
    ),
    "scheduler_run": frozenset(
        {"job_name", "safe_outcome", "outcome", "duration_ms", "count"}
    ),
    "transaction_lifecycle": frozenset(
        {
            "request_id",
            "correlation_id",
            "operation_name",
            "duration_ms",
            "safe_outcome",
            "outcome",
            "safe_error_class",
            "error_class",
            "retry_mode",
            "attempt",
            "attempt_count",
        }
    ),
    "operational_alert": frozenset(
        {
            "alert_family",
            "operation_name",
            "safe_outcome",
            "outcome",
            "safe_error_class",
            "error_class",
            "count",
            "attempt_count",
            "first_timestamp",
            "last_timestamp",
        }
    ),
    "metric": frozenset(
        {
            "metric_name",
            "metric_type",
            "unit",
            "labels",
            "count",
            "bucket_ms",
            "bucket_count",
            "sum_ms",
        }
    ),
    "telemetry_pipeline_degraded": frozenset({"reason", "count"}),
    "schema_rejected": frozenset({"reason", "count"}),
}


def safe_request_id(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        return str(UUID(value))
    except (ValueError, AttributeError, TypeError):
        return None


def route_template_for_request(request) -> str:
    route = request.scope.get("route") if hasattr(request, "scope") else None
    template = getattr(route, "path", None)
    return template if template in ROUTE_TEMPLATES else "unmatched"


def status_class(status_code: object) -> str:
    if (
        isinstance(status_code, int)
        and not isinstance(status_code, bool)
        and 100 <= status_code <= 599
    ):
        return f"{status_code // 100}xx"
    return "unknown"


def _bounded_int(value: object, *, maximum: int = 60_000) -> int | None:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    if not math.isfinite(float(value)):
        return None
    number = int(value)
    if number < 0:
        return None
    return min(number, maximum)


def _safe_enum(
    value: object, allowed: frozenset[str], *, fallback: str = "unknown"
) -> str:
    return value if isinstance(value, str) and value in allowed else fallback


def _safe_timestamp(value: object) -> str:
    if isinstance(value, datetime) and value.tzinfo is not None:
        timestamp = value.astimezone(timezone.utc)
    else:
        timestamp = datetime.now(timezone.utc)
    return timestamp.isoformat(timespec="milliseconds").replace("+00:00", "Z")


def _bounded_timestamp(value: object) -> str | None:
    if isinstance(value, datetime) and value.tzinfo is not None:
        return _safe_timestamp(value)
    if not isinstance(value, str) or len(value) > 64:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is None:
        return None
    return _safe_timestamp(parsed)


def _safe_labels(labels: object) -> dict[str, str]:
    if not isinstance(labels, Mapping):
        return {}
    normalized: dict[str, str] = {}
    for key, value in labels.items():
        if key not in LABEL_KEYS:
            continue
        if key == "method":
            normalized[key] = _safe_enum(value, ALLOWED_METHODS)
        elif key == "route_template":
            normalized[key] = _safe_enum(value, ROUTE_TEMPLATES, fallback="unmatched")
        elif key == "status_class":
            normalized[key] = _safe_enum(value, ALLOWED_STATUS_CLASSES)
        elif key == "dependency_class":
            normalized[key] = _safe_enum(value, ALLOWED_DEPENDENCIES)
        elif key == "operation_class":
            normalized[key] = _safe_enum(
                value, ALLOWED_OPERATION_CLASSES, fallback="other"
            )
        elif key == "worker_class":
            normalized[key] = _safe_enum(value, ALLOWED_WORKER_CLASSES)
        elif key == "channel":
            normalized[key] = _safe_enum(value, ALLOWED_CHANNELS)
        elif key == "job_name":
            normalized[key] = _safe_enum(value, ALLOWED_JOB_NAMES)
        elif key == "safe_state":
            normalized[key] = _safe_enum(value, ALLOWED_STATES)
        elif key == "safe_outcome":
            normalized[key] = _safe_enum(value, ALLOWED_OUTCOMES)
        elif key == "retry_mode":
            normalized[key] = _safe_enum(value, ALLOWED_RETRY_MODES)
        elif key == "safe_capability_reason":
            normalized[key] = _safe_enum(value, ALLOWED_CAPABILITY_REASONS)
    return normalized


def _safe_fields(fields: object, *, event: str) -> tuple[dict[str, object], int]:
    if not isinstance(fields, Mapping):
        return {}, 1
    allowed_fields = EVENT_FIELD_ALLOWLIST.get(event, frozenset())
    result: dict[str, object] = {}
    rejected = 0
    for key, value in fields.items():
        if key not in allowed_fields:
            rejected += 1
            continue
        if key in {"request_id", "correlation_id"}:
            safe = safe_request_id(value)
            if safe is not None:
                result[key] = safe
            elif value is not None:
                rejected += 1
        elif key == "route_template":
            result[key] = _safe_enum(value, ROUTE_TEMPLATES, fallback="unmatched")
        elif key == "method":
            result[key] = _safe_enum(value, ALLOWED_METHODS)
        elif key == "status_class":
            result[key] = _safe_enum(value, ALLOWED_STATUS_CLASSES)
        elif key == "duration_ms" or key == "age_ms":
            safe = _bounded_int(value)
            if safe is None:
                rejected += 1
            else:
                result[key] = safe
        elif key in {"first_timestamp", "last_timestamp"}:
            safe = _bounded_timestamp(value)
            if safe is None:
                rejected += 1
            else:
                result[key] = safe
        elif key == "dependency_class":
            result[key] = _safe_enum(value, ALLOWED_DEPENDENCIES)
        elif key in {"operation_class", "operation_name"}:
            result[key] = _safe_enum(value, ALLOWED_OPERATION_CLASSES, fallback="other")
        elif key == "worker_class":
            result[key] = _safe_enum(value, ALLOWED_WORKER_CLASSES)
        elif key == "channel":
            result[key] = _safe_enum(value, ALLOWED_CHANNELS)
        elif key == "job_name":
            result[key] = _safe_enum(value, ALLOWED_JOB_NAMES)
        elif key in {"safe_state", "state", "lease_state"}:
            result[key] = _safe_enum(value, ALLOWED_STATES)
        elif key in {"safe_outcome", "outcome"}:
            result[key] = _safe_enum(value, ALLOWED_OUTCOMES)
        elif key in {"safe_error_class", "error_class"}:
            result[key] = (
                "none" if value is None else _safe_enum(value, ALLOWED_ERROR_CLASSES)
            )
        elif key == "retry_mode":
            result[key] = _safe_enum(value, ALLOWED_RETRY_MODES)
        elif key in {"attempt_count", "attempt", "count"}:
            safe = _bounded_int(value, maximum=1_000_000)
            if safe is None:
                rejected += 1
            else:
                result[key] = safe
        elif key in {"bucket_ms", "bucket_count", "sum_ms"}:
            safe = _bounded_int(value, maximum=1_000_000_000)
            if safe is None:
                rejected += 1
            else:
                result[key] = safe
        elif key == "metric_name":
            if value in METRIC_SPECS:
                result[key] = value
            else:
                result[key] = "unknown"
        elif key == "metric_type":
            result[key] = _safe_enum(
                value, frozenset({"counter", "gauge", "histogram"})
            )
        elif key == "unit":
            result[key] = _safe_enum(
                value,
                frozenset(
                    {
                        "entries",
                        "requests",
                        "runs",
                        "milliseconds",
                        "seconds",
                        "boolean",
                    }
                ),
            )
        elif key == "labels":
            result[key] = _safe_labels(value)
        elif key == "safe_capability_reason":
            result[key] = _safe_enum(value, ALLOWED_CAPABILITY_REASONS)
        elif key == "reason":
            result[key] = _safe_enum(value, ALLOWED_REASONS)
        elif key == "alert_family":
            result[key] = _safe_enum(value, ALLOWED_ALERT_FAMILIES)
        elif key == "synthetic":
            if isinstance(value, bool):
                result[key] = value
            else:
                rejected += 1
    return result, rejected


def build_event(
    event: str,
    *,
    level: str = "info",
    service: str = "niuva",
    environment: str = "sandbox",
    timestamp: object = None,
    fields: Mapping[str, object] | None = None,
) -> tuple[dict[str, object], int]:
    safe_event = _safe_enum(event, ALLOWED_EVENTS, fallback="schema_rejected")
    safe_level = _safe_enum(level, ALLOWED_LEVELS)
    safe_fields, rejected = _safe_fields(fields or {}, event=safe_event)
    safe_service = "niuva" if service != "niuva" else service
    safe_environment = _safe_enum(environment, ALLOWED_ENVIRONMENTS)
    record = {
        "schema_version": SCHEMA_VERSION,
        "timestamp": _safe_timestamp(timestamp),
        "level": safe_level,
        "service": safe_service,
        "environment": safe_environment,
        "event": safe_event,
        "fields": safe_fields,
    }
    return record, rejected + (1 if safe_event == "schema_rejected" else 0)


class JsonLineEmitter:
    """A bounded local JSONL sink with non-recursive degradation handling."""

    def __init__(
        self,
        *,
        stream=None,
        error_stream=None,
        service: str = "niuva",
        environment: str = "sandbox",
        monotonic: Callable[[], float] | None = None,
    ):
        self.stream = stream if stream is not None else sys.stdout
        self.error_stream = error_stream if error_stream is not None else sys.stderr
        self.service = service
        self.environment = environment
        self.monotonic = monotonic or time.monotonic
        self.buffer: deque[tuple[str, str]] = deque()
        self.buffer_bytes = 0
        self.accepted_records = 0
        self.dropped_records = 0
        self.write_failures = 0
        self.schema_rejections = 0
        self._consecutive_failures = 0
        self._recent_attempts: deque[tuple[float, bool]] = deque()
        self._last_degraded_at: float | None = None
        self.retry_latch = False
        self.output_bytes = 0
        self._output_window_started = self.monotonic()
        self._budget_exhausted = False
        self._write_lock = threading.RLock()
        self._write_in_flight = False

    def _trim_attempts(self, now: float) -> None:
        while self._recent_attempts and now - self._recent_attempts[0][0] > 300:
            self._recent_attempts.popleft()

    def _reserve_output_budget(self, line: str) -> bool:
        now = self.monotonic()
        line_bytes = len(line.encode("utf-8"))
        with self._write_lock:
            if now - self._output_window_started >= OUTPUT_WINDOW_SECONDS:
                self._output_window_started = now
                self.output_bytes = 0
                self._budget_exhausted = False
            if self.output_bytes + line_bytes > MAX_OUTPUT_BYTES_PER_DAY:
                self._budget_exhausted = True
                return False
            self.output_bytes += line_bytes
            return True

    def _write_raw(self, line: str, target, *, reserve_budget: bool = True) -> bool:
        """Write through one daemon writer and return within the write budget."""
        with self._write_lock:
            if self._write_in_flight:
                return False
            if reserve_budget and not self._reserve_output_budget(line):
                return False
            self._write_in_flight = True
            outcome = {"success": False}

        def write_once() -> None:
            try:
                target.write(line)
                flush = getattr(target, "flush", None)
                if callable(flush):
                    flush()
                outcome["success"] = True
            except Exception:
                outcome["success"] = False
            finally:
                with self._write_lock:
                    self._write_in_flight = False

        thread = threading.Thread(target=write_once, daemon=True)
        thread.start()
        thread.join(TELEMETRY_WRITE_BUDGET_SECONDS)
        return not thread.is_alive() and bool(outcome["success"])

    @property
    def write_in_flight(self) -> bool:
        with self._write_lock:
            return self._write_in_flight

    def _control_signal(self, *, reason: str, count: int) -> None:
        now = self.monotonic()
        if (
            self._last_degraded_at is not None
            and now - self._last_degraded_at < DEGRADED_SIGNAL_INTERVAL_SECONDS
        ):
            self.retry_latch = True
            return
        record, _rejected = build_event(
            "telemetry_pipeline_degraded",
            level="warning",
            service=self.service,
            environment=self.environment,
            fields={
                "reason": reason,
                "count": max(0, min(count, 1_000_000)),
            },
        )
        line = json.dumps(record, separators=(",", ":"), sort_keys=True) + "\n"
        if self._write_raw(line, self.error_stream):
            self._last_degraded_at = now
            self.retry_latch = False
        else:
            self.retry_latch = True

    def _maybe_degraded(self, *, reason: str) -> None:
        now = self.monotonic()
        self._trim_attempts(now)
        total = len(self._recent_attempts)
        dropped = sum(
            1 for _timestamp, was_dropped in self._recent_attempts if was_dropped
        )
        ratio_exceeded = total > 0 and dropped / total > 0.01
        if (
            self._consecutive_failures >= 3
            or self.buffer_bytes >= MAX_BUFFER_BYTES
            or ratio_exceeded
        ):
            self._control_signal(reason=reason, count=max(1, dropped))

    def _buffer_record(self, line: str, level: str) -> bool:
        line_bytes = len(line.encode("utf-8"))
        if line_bytes > MAX_RECORD_BYTES:
            self.dropped_records += 1
            return False
        if (
            len(self.buffer) >= MAX_BUFFER_RECORDS
            or self.buffer_bytes + line_bytes > MAX_BUFFER_BYTES
        ):
            # Evict the oldest lower-severity record before protecting a
            # warning/critical record; no sensitive fallback is attempted.
            if level in {"warning", "error", "critical"}:
                for index, (_line, buffered_level) in enumerate(self.buffer):
                    if buffered_level in {"debug", "info"}:
                        old_line, _old_level = self.buffer[index]
                        del self.buffer[index]
                        self.buffer_bytes -= len(old_line.encode("utf-8"))
                        break
            if (
                len(self.buffer) >= MAX_BUFFER_RECORDS
                or self.buffer_bytes + line_bytes > MAX_BUFFER_BYTES
            ):
                self.dropped_records += 1
                return False
        self.buffer.append((line, level))
        self.buffer_bytes += line_bytes
        return True

    def _flush_buffer(self) -> None:
        while self.buffer:
            line, _level = self.buffer[0]
            if not self._write_raw(line, self.stream, reserve_budget=False):
                return
            self.buffer.popleft()
            self.buffer_bytes -= len(line.encode("utf-8"))

    def emit(
        self,
        event: str,
        *,
        level: str = "info",
        fields: Mapping[str, object] | None = None,
        timestamp: object = None,
    ) -> bool:
        record, rejected = build_event(
            event,
            level=level,
            service=self.service,
            environment=self.environment,
            timestamp=timestamp,
            fields=fields,
        )
        self.schema_rejections += rejected
        line = json.dumps(record, separators=(",", ":"), sort_keys=True) + "\n"
        if len(line.encode("utf-8")) > MAX_RECORD_BYTES:
            self.dropped_records += 1
            self._recent_attempts.append((self.monotonic(), True))
            self._maybe_degraded(reason="buffer_saturated")
            return False

        self._flush_buffer()
        success = self._write_raw(line, self.stream)
        now = self.monotonic()
        self._recent_attempts.append((now, not success))
        if success:
            self.accepted_records += 1
            self._consecutive_failures = 0
            if self.retry_latch:
                self._control_signal(reason="retry_latch", count=1)
            return True

        self.write_failures += 1
        self._consecutive_failures += 1
        if not self.write_in_flight and self._budget_exhausted:
            self.dropped_records += 1
            self._recent_attempts[-1] = (now, True)
            self._maybe_degraded(reason="buffer_saturated")
            return False
        if self.write_in_flight:
            self.dropped_records += 1
            self._recent_attempts[-1] = (now, True)
            self._maybe_degraded(reason="write_failure")
            return False
        buffered = self._buffer_record(line, level)
        if not buffered:
            self._recent_attempts[-1] = (now, True)
        self._maybe_degraded(reason="write_failure" if buffered else "buffer_saturated")
        return False


class MetricCapacityRegistry:
    """Process-set cardinality accounting shared by application facades."""

    def __init__(self):
        self.histogram_keys: set[tuple[str, tuple[tuple[str, str], ...]]] = set()
        self.non_histogram_keys: set[tuple[str, tuple[tuple[str, str], ...]]] = set()

    @property
    def entry_count(self) -> int:
        return (
            14 * len(self.histogram_keys)
            + len(self.non_histogram_keys)
            + MAX_CONTROL_ENTRIES
        )

    def reserve(self, metric_type: str, key) -> bool:
        known = (
            self.histogram_keys
            if metric_type == "histogram"
            else self.non_histogram_keys
        )
        if key in known:
            return True
        if (
            metric_type == "histogram"
            and len(self.histogram_keys) >= MAX_HISTOGRAM_COMBINATIONS
        ):
            return False
        projected = self.entry_count + (14 if metric_type == "histogram" else 1)
        if projected > MAX_TOTAL_ENTRIES or (
            metric_type != "histogram"
            and len(self.non_histogram_keys) >= MAX_NON_HISTOGRAM_ENTRIES
        ):
            return False
        known.add(key)
        return True


PROCESS_METRIC_CAPACITY = MetricCapacityRegistry()


class MetricPort:
    """Finite internal metric registry; no endpoint or external exporter."""

    def __init__(self, *, capacity_registry: MetricCapacityRegistry | None = None):
        self.counters: dict[tuple[str, tuple[tuple[str, str], ...]], int] = {}
        self.gauges: dict[tuple[str, tuple[tuple[str, str], ...]], int] = {}
        self.histograms: dict[
            tuple[str, tuple[tuple[str, str], ...]], dict[str, object]
        ] = {}
        self.schema_rejections = 0
        self.capacity_rejections = 0
        self.capacity_registry = (
            capacity_registry
            if capacity_registry is not None
            else PROCESS_METRIC_CAPACITY
        )

    @property
    def entry_count(self) -> int:
        return self.capacity_registry.entry_count

    def _labels(
        self, metric_name: str, labels: Mapping[str, object] | None
    ) -> tuple[tuple[str, str], ...] | None:
        spec = METRIC_SPECS.get(metric_name)
        if spec is None:
            self.schema_rejections += 1
            return None
        expected = spec[1]
        normalized = _safe_labels(labels or {})
        if set(normalized) != set(expected):
            self.schema_rejections += 1
            normalized = {key: normalized.get(key, "unknown") for key in expected}
        if any(key not in LABEL_KEYS for key in (labels or {})):
            self.schema_rejections += 1
        return tuple(sorted(normalized.items()))

    def _reserve(self, metric_type: str, key) -> bool:
        if not self.capacity_registry.reserve(metric_type, key):
            self.capacity_rejections += 1
            return False
        return True

    def increment(
        self, metric_name: str, labels: Mapping[str, object], amount: int = 1
    ) -> bool:
        if isinstance(amount, bool) or not isinstance(amount, int) or amount < 0:
            self.schema_rejections += 1
            return False
        spec = METRIC_SPECS.get(metric_name)
        if spec is None or spec[0] != "counter":
            self.schema_rejections += 1
            return False
        safe_labels = self._labels(metric_name, labels)
        if safe_labels is None:
            return False
        key = (metric_name, safe_labels)
        if not self._reserve("counter", key):
            return False
        self.counters[key] = self.counters.get(key, 0) + min(amount, 1_000_000)
        return True

    def set_gauge(
        self, metric_name: str, labels: Mapping[str, object], value: int
    ) -> bool:
        if isinstance(value, bool) or not isinstance(value, int) or value < 0:
            self.schema_rejections += 1
            return False
        spec = METRIC_SPECS.get(metric_name)
        if spec is None or spec[0] != "gauge":
            self.schema_rejections += 1
            return False
        safe_labels = self._labels(metric_name, labels)
        if safe_labels is None:
            return False
        key = (metric_name, safe_labels)
        if not self._reserve("gauge", key):
            return False
        self.gauges[key] = min(value, 1_000_000)
        return True

    def observe(
        self, metric_name: str, labels: Mapping[str, object], value_ms: int
    ) -> bool:
        if (
            isinstance(value_ms, bool)
            or not isinstance(value_ms, (int, float))
            or not math.isfinite(float(value_ms))
            or value_ms < 0
        ):
            self.schema_rejections += 1
            return False
        spec = METRIC_SPECS.get(metric_name)
        if spec is None or spec[0] != "histogram":
            self.schema_rejections += 1
            return False
        safe_labels = self._labels(metric_name, labels)
        if safe_labels is None:
            return False
        key = (metric_name, safe_labels)
        if not self._reserve("histogram", key):
            return False
        histogram = self.histograms.setdefault(
            key,
            {"buckets": [0] * len(HISTOGRAM_BUCKETS_MS), "count": 0, "sum": 0},
        )
        bounded = min(int(value_ms), HISTOGRAM_BUCKETS_MS[-1])
        for index, bucket in enumerate(HISTOGRAM_BUCKETS_MS):
            if bounded <= bucket:
                histogram["buckets"][index] += 1
        histogram["count"] += 1
        histogram["sum"] += bounded
        return True

    def snapshot(self) -> dict[str, object]:
        return {
            "counters": dict(self.counters),
            "gauges": dict(self.gauges),
            "histograms": dict(self.histograms),
            "entry_count": self.entry_count,
            "schema_rejections": self.schema_rejections,
            "capacity_rejections": self.capacity_rejections,
        }

    def records(self) -> list[dict[str, object]]:
        """Return bounded JSONL-ready aggregate metric records."""
        records: list[dict[str, object]] = []
        for (name, labels), value in self.counters.items():
            records.append(
                {
                    "metric_name": name,
                    "metric_type": "counter",
                    "unit": METRIC_UNITS[name],
                    "labels": dict(labels),
                    "count": value,
                }
            )
        for (name, labels), value in self.gauges.items():
            records.append(
                {
                    "metric_name": name,
                    "metric_type": "gauge",
                    "unit": METRIC_UNITS[name],
                    "labels": dict(labels),
                    "count": value,
                }
            )
        for (name, labels), value in self.histograms.items():
            buckets = value["buckets"]
            for bucket, count in zip(HISTOGRAM_BUCKETS_MS, buckets):
                records.append(
                    {
                        "metric_name": name,
                        "metric_type": "histogram",
                        "unit": METRIC_UNITS[name],
                        "labels": dict(labels),
                        "bucket_ms": bucket,
                        "bucket_count": count,
                    }
                )
            records.append(
                {
                    "metric_name": name,
                    "metric_type": "histogram",
                    "unit": METRIC_UNITS[name],
                    "labels": dict(labels),
                    "count": value["count"],
                    "sum_ms": value["sum"],
                }
            )
        return records


class Observability:
    """Application-facing facade used by server, transactions, and workers."""

    def __init__(
        self,
        *,
        emitter: JsonLineEmitter | None = None,
        environment: str = "sandbox",
        clock: Callable[[], datetime] | None = None,
    ):
        self.emitter = emitter or JsonLineEmitter(environment=environment)
        self.metrics = MetricPort(capacity_registry=PROCESS_METRIC_CAPACITY)
        self.clock = clock or (lambda: datetime.now(timezone.utc))
        self._alert_summaries: dict[tuple[str, str, str, int], dict[str, object]] = {}
        self._http_samples: deque[tuple[datetime, bool, float | None]] = deque(
            maxlen=2_048
        )
        self._dependency_samples: deque[tuple[datetime, str, str]] = deque(maxlen=2_048)
        self._dependency_unavailable_since: dict[str, datetime] = {}
        self._worker_backlog_since: datetime | None = None
        self._worker_lease_losses: deque[datetime] = deque(maxlen=1_024)

    def _now(self) -> datetime:
        timestamp = self.clock()
        if not isinstance(timestamp, datetime) or timestamp.tzinfo is None:
            return datetime.now(timezone.utc)
        return timestamp.astimezone(timezone.utc)

    @staticmethod
    def _prune_timestamps(
        values: deque,
        *,
        cutoff: datetime,
    ) -> None:
        while values:
            first = values[0]
            timestamp = first[0] if isinstance(first, tuple) else first
            if timestamp >= cutoff:
                break
            values.popleft()

    def emit(
        self,
        event: str,
        *,
        level: str = "info",
        fields: Mapping[str, object] | None = None,
    ) -> bool:
        return self.emitter.emit(event, level=level, fields=fields)

    def record_http(
        self,
        *,
        request_id: object,
        route_template: str,
        method: str,
        status_code: int,
        duration_ms: int,
        synthetic: bool = False,
    ) -> None:
        status_value = status_class(status_code)
        excluded_from_customer_sli = bool(
            synthetic or route_template in SYNTHETIC_ROUTE_TEMPLATES
        )
        fields = {
            "request_id": request_id,
            "route_template": route_template,
            "method": method,
            "status_class": status_value,
            "duration_ms": duration_ms,
            "synthetic": excluded_from_customer_sli,
        }
        self.emit("http_request", fields=fields)
        labels = {
            "method": method,
            "route_template": route_template,
            "status_class": status_value,
        }
        self.metrics.increment("http_requests", labels)
        self.metrics.observe(
            "http_duration",
            {"method": method, "route_template": route_template},
            duration_ms,
        )
        if excluded_from_customer_sli:
            return
        now = self._now()
        duration_value = (
            float(duration_ms)
            if (
                isinstance(duration_ms, (int, float))
                and not isinstance(duration_ms, bool)
                and math.isfinite(float(duration_ms))
                and duration_ms >= 0
            )
            else None
        )
        self._http_samples.append((now, status_value == "5xx", duration_value))
        self._prune_timestamps(
            self._http_samples,
            cutoff=now - timedelta(minutes=15),
        )
        for window_seconds, error_threshold, latency_threshold, level in (
            (15 * 60, 0.01, 2_000, "warning"),
            (5 * 60, 0.05, 5_000, "critical"),
        ):
            window_cutoff = now - timedelta(seconds=window_seconds)
            samples = [
                sample for sample in self._http_samples if sample[0] >= window_cutoff
            ]
            if len(samples) < 20:
                continue
            errors = sum(1 for _at, is_error, _duration in samples if is_error)
            if errors / len(samples) >= error_threshold:
                self._record_operational_alert(
                    alert_family="api_error_rate",
                    safe_outcome="failed_safe",
                    level=level,
                )
            durations = [
                duration for _at, _is_error, duration in samples if duration is not None
            ]
            if len(durations) < 20:
                continue
            slow = sum(1 for duration in durations if duration >= latency_threshold)
            if slow / len(durations) >= error_threshold:
                self._record_operational_alert(
                    alert_family="api_latency",
                    safe_outcome="timeout",
                    level=level,
                )

    def record_transaction(self, event: str, fields: Mapping[str, object]) -> None:
        outcome = fields.get("outcome")
        safe_outcome = {
            "transaction_commit": "committed",
            "transaction_commit_unknown": "commit_unknown",
            "transaction_abort": "aborted",
            "transaction_retry": "retrying",
            "transaction_rejected": "unavailable",
            "transaction_start": "started",
        }.get(event, outcome)
        safe_fields = {key: value for key, value in fields.items() if key != "event"}
        safe_fields["safe_outcome"] = safe_outcome
        self.emit(
            "transaction_lifecycle",
            fields=safe_fields,
            level=(
                "critical"
                if event in {"transaction_commit_unknown", "transaction_rejected"}
                else "info"
            ),
        )
        labels = {
            "operation_class": fields.get("operation_name"),
            "safe_outcome": safe_outcome,
            "retry_mode": fields.get("retry_mode"),
        }
        self.metrics.increment("transaction_lifecycle", labels)
        duration_ms = fields.get("duration_ms")
        if isinstance(duration_ms, (int, float)) and not isinstance(duration_ms, bool):
            self.metrics.observe(
                "transaction_duration",
                {
                    "operation_class": fields.get("operation_name"),
                    "safe_outcome": safe_outcome,
                },
                duration_ms,
            )
        if event in {"transaction_commit_unknown", "transaction_rejected"}:
            self._record_operational_alert(
                alert_family=(
                    "transaction_commit_unknown"
                    if event == "transaction_commit_unknown"
                    else "transaction_unavailable"
                ),
                operation_name=fields.get("operation_name"),
                safe_outcome=safe_outcome,
                attempt_count=fields.get("attempt"),
            )

    def _record_operational_alert(
        self,
        *,
        alert_family: str,
        operation_name: object = None,
        safe_outcome: object = None,
        attempt_count: object = None,
        level: str = "critical",
        timestamp: datetime | None = None,
    ) -> None:
        timestamp = timestamp or self._now()
        safe_family = _safe_enum(alert_family, ALLOWED_ALERT_FAMILIES)
        safe_operation = _safe_enum(
            operation_name,
            ALLOWED_OPERATION_CLASSES,
            fallback="other",
        )
        safe_result = _safe_enum(safe_outcome, ALLOWED_OUTCOMES)
        environment = _safe_enum(
            getattr(self.emitter, "environment", "sandbox"),
            ALLOWED_ENVIRONMENTS,
        )
        bucket = int(timestamp.timestamp()) // ALERT_DEDUP_WINDOW_SECONDS
        key = (safe_family, safe_operation, environment, bucket)
        if key not in self._alert_summaries:
            if len(self._alert_summaries) >= MAX_ALERT_SUMMARIES:
                oldest = min(
                    self._alert_summaries,
                    key=lambda candidate: self._alert_summaries[candidate][
                        "last_timestamp"
                    ],
                )
                del self._alert_summaries[oldest]
            self._alert_summaries[key] = {
                "alert_family": safe_family,
                "operation_name": safe_operation,
                "safe_outcome": safe_result,
                "attempt_count": _bounded_int(attempt_count, maximum=1_000_000),
                "count": 0,
                "first_timestamp": timestamp,
                "last_timestamp": timestamp,
                "emitted_count": 0,
                "level": _safe_enum(level, ALLOWED_LEVELS),
            }
        summary = self._alert_summaries[key]
        summary["count"] = min(int(summary["count"]) + 1, 1_000_000)
        summary["last_timestamp"] = timestamp
        severity_rank = {"debug": 0, "info": 1, "warning": 2, "error": 3, "critical": 4}
        if severity_rank.get(_safe_enum(level, ALLOWED_LEVELS), 1) > severity_rank.get(
            str(summary.get("level")), 1
        ):
            summary["level"] = _safe_enum(level, ALLOWED_LEVELS)
        if summary["emitted_count"] == 0:
            self._emit_alert_summary(summary)

    def _emit_alert_summary(self, summary: Mapping[str, object]) -> bool:
        fields = {
            "alert_family": summary.get("alert_family"),
            "operation_name": summary.get("operation_name"),
            "safe_outcome": summary.get("safe_outcome"),
            "count": summary.get("count"),
            "first_timestamp": summary.get("first_timestamp"),
            "last_timestamp": summary.get("last_timestamp"),
        }
        attempt_count = summary.get("attempt_count")
        if attempt_count is not None:
            fields["attempt_count"] = attempt_count
        emitted = self.emit(
            "operational_alert",
            level=str(summary.get("level", "critical")),
            fields=fields,
        )
        if emitted:
            summary["emitted_count"] = summary.get("count", 0)
        return emitted

    def flush_alerts(self) -> int:
        emitted = 0
        for summary in self._alert_summaries.values():
            if int(summary.get("count", 0)) > int(summary.get("emitted_count", 0)):
                emitted += int(self._emit_alert_summary(summary))
        return emitted

    def record_dependency(
        self,
        *,
        dependency: str,
        operation: str,
        outcome: str,
        duration_ms: int,
    ) -> None:
        now = self._now()
        self.emit(
            "dependency_operation",
            fields={
                "dependency_class": dependency,
                "operation_class": operation,
                "safe_outcome": outcome,
                "duration_ms": duration_ms,
            },
        )
        labels = {
            "dependency_class": dependency,
            "operation_class": operation,
            "safe_outcome": outcome,
        }
        self.metrics.increment("dependency_operations", labels)
        self.metrics.observe("dependency_duration", labels, duration_ms)
        safe_dependency = _safe_enum(dependency, ALLOWED_DEPENDENCIES)
        safe_outcome = _safe_enum(outcome, ALLOWED_OUTCOMES)
        self._dependency_samples.append((now, safe_dependency, safe_outcome))
        self._prune_timestamps(
            self._dependency_samples,
            cutoff=now - timedelta(minutes=5),
        )
        if safe_outcome in {"unavailable", "failed_safe"}:
            self._dependency_unavailable_since.setdefault(safe_dependency, now)
            unavailable_since = self._dependency_unavailable_since[safe_dependency]
            if (now - unavailable_since).total_seconds() >= 60:
                self._record_operational_alert(
                    alert_family="dependency_unavailable",
                    safe_outcome="unavailable",
                    level="critical",
                    timestamp=now,
                )
        else:
            self._dependency_unavailable_since.pop(safe_dependency, None)

        dependency_samples = [
            sample
            for sample in self._dependency_samples
            if sample[1] == safe_dependency
        ]
        if len(dependency_samples) >= 20:
            failures = sum(
                1
                for _at, _dependency, sample_outcome in dependency_samples
                if sample_outcome in {"timeout", "unavailable", "failed_safe"}
            )
            timeouts = sum(
                1
                for _at, _dependency, sample_outcome in dependency_samples
                if sample_outcome == "timeout"
            )
            if timeouts >= 3 or failures / len(dependency_samples) >= 0.05:
                self._record_operational_alert(
                    alert_family=(
                        "dependency_timeout"
                        if timeouts >= 3
                        else "dependency_unavailable"
                    ),
                    safe_outcome=("timeout" if timeouts >= 3 else "unavailable"),
                    level="warning",
                    timestamp=now,
                )
        elif (
            safe_outcome == "timeout"
            and sum(
                1
                for _at, _dependency, sample_outcome in dependency_samples
                if sample_outcome == "timeout"
            )
            >= 3
        ):
            self._record_operational_alert(
                alert_family="dependency_timeout",
                safe_outcome="timeout",
                level="warning",
                timestamp=now,
            )

    def record_worker(
        self,
        *,
        result: Mapping[str, object] | None = None,
        snapshot: Mapping[str, object] | None = None,
        state: str = "active",
    ) -> None:
        values = result if isinstance(result, Mapping) else {}
        current = snapshot if isinstance(snapshot, Mapping) else {}
        for outcome, key in (("success", "delivered"), ("failed_safe", "failed")):
            count = values.get(key)
            if isinstance(count, int) and count > 0:
                self.metrics.increment(
                    "worker_claims_results",
                    {
                        "worker_class": "notification_delivery",
                        "channel": "email",
                        "safe_outcome": outcome,
                    },
                    min(count, 1_000_000),
                )
        exhausted = _bounded_int(values.get("exhausted"), maximum=1_000_000) or 0
        failed_count = _bounded_int(values.get("failed"), maximum=1_000_000) or 0
        if exhausted and not failed_count:
            self.metrics.increment(
                "worker_claims_results",
                {
                    "worker_class": "notification_delivery",
                    "channel": "email",
                    "safe_outcome": "failed_safe",
                },
                exhausted,
            )
        pending_due = _bounded_int(current.get("pending_due"), maximum=1_000_000) or 0
        processing = _bounded_int(current.get("processing"), maximum=1_000_000) or 0
        oldest_age = (
            _bounded_int(current.get("oldest_due_age_seconds"), maximum=1_000_000) or 0
        )
        stale_leases = _bounded_int(current.get("stale_leases"), maximum=1_000_000) or 0
        exhausted_total = _bounded_int(current.get("exhausted"), maximum=1_000_000) or 0
        if "pending_due" in current:
            self.metrics.set_gauge(
                "worker_backlog",
                {"worker_class": "notification_delivery", "safe_state": "pending"},
                pending_due,
            )
        if "processing" in current:
            self.metrics.set_gauge(
                "worker_backlog",
                {"worker_class": "notification_delivery", "safe_state": "processing"},
                processing,
            )
        if "oldest_due_age_seconds" in current:
            self.metrics.set_gauge(
                "worker_oldest_due_age",
                {"worker_class": "notification_delivery"},
                oldest_age,
            )
        if "stale_leases" in current:
            self.metrics.set_gauge(
                "worker_stale_leases",
                {"worker_class": "notification_delivery"},
                stale_leases,
            )
        if "exhausted" in current:
            self.metrics.set_gauge(
                "worker_exhausted",
                {"worker_class": "notification_delivery", "channel": "email"},
                exhausted_total,
            )
        now = self._now()
        if exhausted:
            self._record_operational_alert(
                alert_family="worker_exhausted",
                safe_outcome="failed_safe",
                timestamp=now,
            )
        lease_lost = _bounded_int(values.get("lease_lost"), maximum=1_000_000) or 0
        if lease_lost:
            for _index in range(min(lease_lost, 100)):
                self._worker_lease_losses.append(now)
        self._prune_timestamps(
            self._worker_lease_losses,
            cutoff=now - timedelta(minutes=5),
        )
        if lease_lost or stale_leases:
            self._record_operational_alert(
                alert_family="worker_lease",
                safe_outcome="failed_safe",
                level=(
                    "critical" if len(self._worker_lease_losses) >= 3 else "warning"
                ),
                timestamp=now,
            )
        if "oldest_due_age_seconds" in current and oldest_age >= 60:
            if self._worker_backlog_since is None:
                self._worker_backlog_since = now
            sustained_seconds = (now - self._worker_backlog_since).total_seconds()
            if oldest_age >= 300 and sustained_seconds >= 300:
                self._record_operational_alert(
                    alert_family="worker_backlog",
                    safe_outcome="timeout",
                    timestamp=now,
                )
            elif sustained_seconds >= 600:
                self._record_operational_alert(
                    alert_family="worker_backlog",
                    safe_outcome="retrying",
                    level="warning",
                    timestamp=now,
                )
        elif "oldest_due_age_seconds" in current:
            self._worker_backlog_since = None
        self.emit(
            "worker_signal",
            fields={
                "worker_class": "notification_delivery",
                "safe_state": state,
                "count": values.get("claimed", 0),
                "safe_error_class": (
                    "lease_lost" if values.get("lease_lost") else "none"
                ),
            },
        )

    def record_readiness(
        self, *, dependency: str, ready: bool, duration_ms: int = 0
    ) -> None:
        safe_state = "ready" if ready else "unavailable"
        self.emit(
            "readiness_signal",
            fields={
                "dependency_class": dependency,
                "safe_state": safe_state,
                "duration_ms": duration_ms,
            },
        )
        self.metrics.increment(
            "readiness_transitions",
            {"dependency_class": dependency, "safe_state": safe_state},
        )

    def record_scheduler(
        self, *, job_name: str, outcome: str, duration_ms: int = 0
    ) -> None:
        fields = {
            "job_name": job_name,
            "safe_outcome": outcome,
            "duration_ms": duration_ms,
        }
        self.emit("scheduler_run", fields=fields)
        self.metrics.increment(
            "scheduled_runs", {"job_name": job_name, "safe_outcome": outcome}
        )
        self.metrics.observe(
            "scheduled_duration",
            {"job_name": job_name, "safe_outcome": outcome},
            duration_ms,
        )
        if outcome in {"failed_safe", "timeout", "unavailable"}:
            self._record_operational_alert(
                alert_family="scheduled_job",
                safe_outcome=outcome,
            )

    def flush_metrics(self) -> int:
        emitted = self.flush_alerts()
        for record in self.metrics.records():
            if self.emit("metric", fields=record):
                emitted += 1
        return emitted
