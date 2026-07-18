import asyncio

import pytest
from pymongo.errors import ConnectionFailure, OperationFailure

from database_capabilities import DatabaseCapabilities
from transaction_execution import (
    RetryMode,
    TransactionCommitOutcomeUnknownError,
    TransactionExecutor,
    TransactionUnavailableError,
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
    def __init__(self, session=None, start_error=None):
        self.session = session or FakeSession()
        self.start_error = start_error
        self.start_calls = 0

    async def start_session(self):
        self.start_calls += 1
        if self.start_error:
            raise self.start_error
        return self.session


def capabilities(available=True):
    return DatabaseCapabilities(transactions=available)


def transient_error(label, message="safe classification"):
    return OperationFailure(
        message,
        details={"errorLabels": [label]},
    )


def test_unavailable_capability_fails_closed_before_callback():
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(FakeClient(), lambda: capabilities(False))

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1

        with pytest.raises(TransactionUnavailableError) as caught:
            await executor.execute(callback, operation_name="catalog.publish")
        assert caught.value.code == "transaction_unavailable"

    asyncio.run(run())
    assert callback_calls == 0


def test_success_commits_once_and_closes_session():
    session = FakeSession()

    async def run():
        executor = TransactionExecutor(FakeClient(session), lambda: capabilities())

        async def callback(received_session):
            assert received_session is session
            assert received_session.in_transaction is True
            return "committed"

        return await executor.execute(callback, operation_name="inventory.apply")

    assert asyncio.run(run()) == "committed"
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        1,
        0,
        1,
    )


def test_domain_exception_aborts_and_is_not_retried():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(FakeClient(session), lambda: capabilities())

        async def callback(_session):
            nonlocal calls
            calls += 1
            raise ValueError("domain conflict")

        with pytest.raises(ValueError, match="domain conflict"):
            await executor.execute(
                callback,
                operation_name="inventory.apply",
                retry_mode=RetryMode.DRIVER_TRANSIENT,
            )

    asyncio.run(run())
    assert calls == 1
    assert session.aborts == 1
    assert session.ends == 1


def test_transient_callback_is_not_retried_by_default():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(FakeClient(session), lambda: capabilities())

        async def callback(_session):
            nonlocal calls
            calls += 1
            raise transient_error("TransientTransactionError")

        with pytest.raises(OperationFailure):
            await executor.execute(callback, operation_name="order.create")

    asyncio.run(run())
    assert calls == 1
    assert session.starts == 1


def test_explicit_retry_safe_callback_retries_transient_transaction():
    session = FakeSession()
    calls = 0

    async def run():
        nonlocal calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_transaction_attempts=2,
        )

        async def callback(_session):
            nonlocal calls
            calls += 1
            if calls == 1:
                raise transient_error("TransientTransactionError")
            return "retried-safely"

        return await executor.execute(
            callback,
            operation_name="inventory.idempotent_apply",
            retry_mode=RetryMode.DRIVER_TRANSIENT,
        )

    assert asyncio.run(run()) == "retried-safely"
    assert calls == 2
    assert session.starts == 2
    assert session.aborts == 1
    assert session.commits == 1
    assert session.ends == 1


def test_unknown_commit_result_retries_commit_not_callback():
    session = FakeSession([transient_error("UnknownTransactionCommitResult")])
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_commit_attempts=2,
        )

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return "committed"

        return await executor.execute(callback, operation_name="catalog.publish")

    assert asyncio.run(run()) == "committed"
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert session.in_transaction is False


def test_exhausted_unknown_commit_result_does_not_rerun_or_abort():
    session = FakeSession(
        [
            transient_error(
                "UnknownTransactionCommitResult",
                message="mongodb://user:secret@db.internal",
            )
            for _attempt in range(2)
        ]
    )
    callback_calls = 0

    async def run():
        nonlocal callback_calls
        executor = TransactionExecutor(
            FakeClient(session),
            lambda: capabilities(),
            max_commit_attempts=2,
        )

        async def callback(_session):
            nonlocal callback_calls
            callback_calls += 1
            return {"customer": "must-not-be-carried"}

        with pytest.raises(TransactionCommitOutcomeUnknownError) as caught:
            await executor.execute(callback, operation_name="catalog.publish")
        return caught.value

    error = asyncio.run(run())
    assert callback_calls == 1
    assert (session.starts, session.commits, session.aborts, session.ends) == (
        1,
        2,
        0,
        1,
    )
    assert error.code == "transaction_commit_outcome_unknown"
    assert error.reconciliation_required is True
    assert error.attempts == 2
    assert str(error) == "Commit outcome is unknown; reconciliation is required."
    assert error.__cause__ is None
    for forbidden in ("secret", "db.internal", "must-not-be-carried"):
        assert forbidden not in str(error)


def test_connection_failure_is_normalized_without_secret_detail():
    error = ConnectionFailure("mongodb://user:secret@db.internal")

    async def run():
        executor = TransactionExecutor(
            FakeClient(start_error=error), lambda: capabilities()
        )
        with pytest.raises(TransactionUnavailableError) as caught:
            await executor.execute(
                lambda _session: None,
                operation_name="catalog.publish",
            )
        assert "secret" not in str(caught.value)
        assert "db.internal" not in str(caught.value)

    asyncio.run(run())
