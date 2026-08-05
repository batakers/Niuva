import logging
import math
from collections.abc import Set
from typing import Any, TypeVar, cast
from uuid import UUID

from observability import ALLOWED_OPERATION_CLASSES
ALLOWED_EVENTS = {
    "transaction_rejected",
    "transaction_start",
    "transaction_commit",
    "transaction_commit_unknown",
    "transaction_abort",
    "transaction_retry",
}
ALLOWED_OUTCOMES = {
    "unavailable",
    "started",
    "committed",
    "unknown",
    "aborted",
    "retrying",
}
ALLOWED_ERROR_CLASSES = {
    None,
    "transaction_unavailable",
    "commit_outcome_unknown",
    "database_error",
    "application_error",
}
ALLOWED_RETRY_MODES = {"never", "driver_transient"}
EnumValue = TypeVar("EnumValue")


def safe_operation_name(value: object, *, fallback: str = "redacted") -> str:
    return value if isinstance(value, str) and value in ALLOWED_OPERATION_CLASSES else fallback


def safe_enum(
    value: object,
    allowed: Set[EnumValue],
    *,
    fallback: EnumValue,
) -> EnumValue:
    try:
        return cast(EnumValue, value) if value in allowed else fallback
    except TypeError:
        return fallback


def safe_correlation_id(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        canonical = str(UUID(value))
        return canonical if value.lower() == canonical else None
    except (ValueError, AttributeError, TypeError):
        return None


class TransactionLogSink:
    def __init__(self, logger: logging.Logger, telemetry=None):
        self.logger = logger
        self.telemetry = telemetry

    def __call__(self, event: str, fields: dict[str, object]) -> None:
        safe_event = safe_enum(
            event,
            ALLOWED_EVENTS,
            fallback="transaction_abort",
        )
        correlation_id = safe_correlation_id(fields.get("correlation_id"))
        transaction = {
            "event": safe_event,
            "operation_name": safe_operation_name(
                fields.get("operation_name"), fallback="redacted"
            ),
            "outcome": safe_enum(
                fields.get("outcome"), ALLOWED_OUTCOMES, fallback="aborted"
            ),
            "attempt": min(
                int(cast(Any, fields.get("attempt", 0))),
                1_000_000,
            )
            if isinstance(fields.get("attempt", 0), int)
            and not isinstance(fields.get("attempt", 0), bool)
            and fields.get("attempt", 0) >= 0
            else 0,
            "retry_mode": safe_enum(
                fields.get("retry_mode"), ALLOWED_RETRY_MODES, fallback="never"
            ),
            "correlation_id": correlation_id,
            "error_class": safe_enum(
                fields.get("error_class"),
                ALLOWED_ERROR_CLASSES,
                fallback="database_error",
            ),
        }
        duration_ms = fields.get("duration_ms")
        if (
            isinstance(duration_ms, (int, float))
            and not isinstance(duration_ms, bool)
            and math.isfinite(float(duration_ms))
            and duration_ms >= 0
        ):
            transaction["duration_ms"] = min(int(duration_ms), 60000)
        self.logger.info(
            "mongodb_transaction",
            extra={"transaction": transaction},
        )
        if self.telemetry is not None:
            try:
                self.telemetry.record_transaction(safe_event, transaction)
            except Exception:
                # Telemetry is optional and must never alter transaction
                # success or failure semantics.
                self.logger.warning("transaction_telemetry_degraded")
