import logging
import re
from collections.abc import Set
from typing import Any, TypeVar, cast
from uuid import UUID

SAFE_OPERATION_NAME = re.compile(r"^[A-Za-z0-9_.:-]{1,128}$")
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
    text = str(value)
    return text if SAFE_OPERATION_NAME.fullmatch(text) else fallback


def safe_enum(
    value: object,
    allowed: Set[EnumValue],
    *,
    fallback: EnumValue,
) -> EnumValue:
    return cast(EnumValue, value) if value in allowed else fallback


def safe_correlation_id(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        canonical = str(UUID(value))
        return canonical if value.lower() == canonical else None
    except (ValueError, AttributeError, TypeError):
        return None


class TransactionLogSink:
    def __init__(self, logger: logging.Logger):
        self.logger = logger

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
            "attempt": int(cast(Any, fields.get("attempt", 0))),
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
        self.logger.info(
            "mongodb_transaction",
            extra={"transaction": transaction},
        )
