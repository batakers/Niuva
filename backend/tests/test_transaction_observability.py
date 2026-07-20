import asyncio
import logging

import pytest
from pymongo.errors import OperationFailure

from database_capabilities import DatabaseCapabilities
from transaction_execution import (
    TransactionCommitOutcomeUnknownError,
    TransactionExecutor,
    TransactionUnavailableError,
)
from transaction_observability import (
    ALLOWED_EVENTS,
    TransactionLogSink,
    safe_correlation_id,
)


VALID_CORRELATION_ID = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
UNTRUSTED_REQUEST_VALUES = {
    "authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.private.signature",
    "cookie": "session=sk_live_private",
    "query": "request-123",
    "request_body": "customer-body-private",
    "provider_payload": "api_key_live_private",
}
INVALID_CORRELATION_IDS = (
    "eyJhbGciOiJIUzI1NiJ9.private.signature",
    "sk_live_private",
    "Bearer eyJhbGciOiJIUzI1NiJ9.private.signature",
    "mongodb://user:secret@db.internal",
    "request-123",
    "x" * 129,
    "customer-body-private",
)


class FakeSession:
    def __init__(self, commit_errors=None):
        self.commit_errors = list(commit_errors or [])
        self.in_transaction = False
        self.starts = 0
        self.commits = 0
        self.aborts = 0
        self.ends = 0

    def start_transaction(self):
        self.starts += 1
        self.in_transaction = True

    async def commit_transaction(self):
        self.commits += 1
        if self.commit_errors:
            raise self.commit_errors.pop(0)
        self.in_transaction = False

    async def abort_transaction(self):
        self.aborts += 1
        self.in_transaction = False

    async def end_session(self):
        self.ends += 1


class FakeClient:
    def __init__(self, session=None):
        self.session = session or FakeSession()

    async def start_session(self):
        return self.session


def test_log_sink_keeps_only_allowlisted_safe_fields(caplog):
    logger = logging.getLogger("niuva.transaction.test")
    sink = TransactionLogSink(logger)

    with caplog.at_level(logging.INFO, logger=logger.name):
        sink(
            "transaction_commit",
            {
                "operation_name": "mongodb://user:secret@db.internal",
                "outcome": "committed",
                "attempt": 1,
                "retry_mode": "never",
                "correlation_id": "unsafe token value",
                "connection_string": "mongodb://user:secret@db.internal",
                "customer_payload": {"email": "private@example.com"},
            },
        )

    record = caplog.records[-1]
    assert record.getMessage() == "mongodb_transaction"
    assert record.transaction == {
        "event": "transaction_commit",
        "operation_name": "redacted",
        "outcome": "committed",
        "attempt": 1,
        "retry_mode": "never",
        "correlation_id": None,
        "error_class": None,
    }
    assert "secret" not in str(record.transaction)
    assert "private@example.com" not in str(record.transaction)


def test_safe_correlation_id_retains_canonical_uuid():
    assert safe_correlation_id(VALID_CORRELATION_ID) == VALID_CORRELATION_ID


def test_safe_correlation_id_canonicalizes_uppercase_uuid():
    assert safe_correlation_id(VALID_CORRELATION_ID.upper()) == VALID_CORRELATION_ID


def test_untrusted_request_values_are_never_sourced_as_correlation_ids():
    values = (*INVALID_CORRELATION_IDS, *UNTRUSTED_REQUEST_VALUES.values())
    assert all(safe_correlation_id(value) is None for value in values)


def test_invalid_correlation_ids_are_none_in_every_lifecycle_event(caplog):
    logger = logging.getLogger("niuva.transaction.correlation.security")
    sink = TransactionLogSink(logger)
    values = (*INVALID_CORRELATION_IDS, *UNTRUSTED_REQUEST_VALUES.values())

    with caplog.at_level(logging.INFO, logger=logger.name):
        for event in ALLOWED_EVENTS:
            for value in values:
                sink(
                    event,
                    {
                        "operation_name": "inventory.reserve",
                        "outcome": "unknown",
                        "attempt": 2,
                        "retry_mode": "never",
                        "correlation_id": value,
                        "error_class": "commit_outcome_unknown",
                    },
                )
                assert caplog.records[-1].transaction["event"] == event
                assert caplog.records[-1].transaction["correlation_id"] is None

    serialized = str([record.transaction for record in caplog.records])
    for forbidden in (
        "eyJhbGci",
        "sk_live",
        "Bearer ",
        "mongodb://",
        "request-123",
        "customer-body-private",
        "api_key_live_private",
    ):
        assert forbidden not in serialized


def test_executor_emits_start_and_commit_without_payload():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=True),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        async def callback(_session):
            return {"customer_payload": "must-not-be-logged"}

        return await executor.execute(
            callback,
            operation_name="inventory.reserve",
            correlation_id=VALID_CORRELATION_ID,
        )

    assert asyncio.run(run()) == {"customer_payload": "must-not-be-logged"}
    assert [event for event, _fields in events] == [
        "transaction_start",
        "transaction_commit",
    ]
    assert all("customer_payload" not in fields for _event, fields in events)
    assert all(
        fields["correlation_id"] == VALID_CORRELATION_ID for _event, fields in events
    )


def test_executor_emits_abort_with_safe_error_class():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=True),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        async def callback(_session):
            raise ValueError("customer=private token=secret")

        with pytest.raises(ValueError):
            await executor.execute(
                callback,
                operation_name="catalog.publish",
            )

    asyncio.run(run())
    assert events[-1][0] == "transaction_abort"
    assert events[-1][1]["error_class"] == "application_error"
    assert "private" not in str(events)
    assert "secret" not in str(events)


def test_capability_rejection_emits_no_topology_detail():
    events = []
    executor = TransactionExecutor(
        FakeClient(),
        lambda: DatabaseCapabilities(transactions=False),
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        with pytest.raises(TransactionUnavailableError):
            await executor.execute(
                lambda _session: None,
                operation_name="inventory.reserve",
            )

    asyncio.run(run())
    assert events == [
        (
            "transaction_rejected",
            {
                "operation_name": "inventory.reserve",
                "outcome": "unavailable",
                "attempt": 0,
                "retry_mode": "never",
                "correlation_id": None,
                "error_class": "transaction_unavailable",
            },
        )
    ]


def test_executor_emits_commit_unknown_without_abort_or_driver_detail():
    commit_errors = [
        OperationFailure(
            "mongodb://user:secret@db.internal",
            details={"errorLabels": ["UnknownTransactionCommitResult"]},
        )
        for _attempt in range(2)
    ]
    session = FakeSession(commit_errors)
    events = []
    callback_calls = 0
    executor = TransactionExecutor(
        FakeClient(session),
        lambda: DatabaseCapabilities(transactions=True),
        max_commit_attempts=2,
        event_sink=lambda event, fields: events.append((event, fields)),
    )

    async def run():
        nonlocal callback_calls

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return {"customer": "must-not-be-logged"}

        with pytest.raises(TransactionCommitOutcomeUnknownError):
            await executor.execute(
                callback,
                operation_name="catalog.publish",
            )

    asyncio.run(run())
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert [event for event, _fields in events] == [
        "transaction_start",
        "transaction_commit_unknown",
    ]
    assert events[-1][1] == {
        "operation_name": "catalog.publish",
        "outcome": "unknown",
        "attempt": 2,
        "retry_mode": "never",
        "correlation_id": None,
        "error_class": "commit_outcome_unknown",
    }
    assert "transaction_abort" not in [event for event, _fields in events]
    assert "aborted" not in str(events)
    assert "secret" not in str(events)
    assert "db.internal" not in str(events)
    assert "must-not-be-logged" not in str(events)
