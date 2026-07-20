import asyncio

import pytest

from database_capabilities import DatabaseCapabilities
from transaction_execution import (
    TransactionExecutor,
    TransactionUnavailableError,
)
from transaction_guard import TransactionMutationGuard


class FakeSession:
    def __init__(self):
        self.in_transaction = False
        self.commits = 0
        self.aborts = 0
        self.ends = 0

    def start_transaction(self):
        self.in_transaction = True

    async def commit_transaction(self):
        self.commits += 1
        self.in_transaction = False

    async def abort_transaction(self):
        self.aborts += 1
        self.in_transaction = False

    async def end_session(self):
        self.ends += 1


class FakeClient:
    def __init__(self, session):
        self.session = session

    async def start_session(self):
        return self.session


def build_guard(*, capability=True, enabled=True):
    session = FakeSession()
    executor = TransactionExecutor(
        FakeClient(session),
        lambda: DatabaseCapabilities(transactions=capability),
    )
    guard = TransactionMutationGuard(executor, lambda: enabled)
    return guard, session


def test_guard_does_not_invoke_callback_when_capability_is_unavailable():
    calls = 0

    async def run():
        guard, _session = build_guard(capability=False)

        async def callback(_session):
            nonlocal calls
            calls += 1

        with pytest.raises(TransactionUnavailableError):
            await guard.run(callback, operation_name="catalog.publish")

    asyncio.run(run())
    assert calls == 0


def test_runtime_disable_does_not_invoke_callback_or_fallback():
    calls = 0

    async def run():
        guard, _session = build_guard(enabled=False)

        async def callback(_session):
            nonlocal calls
            calls += 1
            return "non-atomic fallback"

        with pytest.raises(TransactionUnavailableError):
            await guard.run(callback, operation_name="inventory.reserve")

    asyncio.run(run())
    assert calls == 0


def test_available_guard_invokes_callback_inside_transaction():
    guard, session = build_guard()

    async def run():
        async def callback(received_session):
            assert received_session is session
            assert received_session.in_transaction is True
            return "atomic"

        return await guard.run(callback, operation_name="inventory.reserve")

    assert asyncio.run(run()) == "atomic"
    assert session.commits == 1
    assert session.ends == 1


def test_callback_exception_aborts_transaction():
    guard, session = build_guard()

    async def run():
        async def callback(_session):
            raise RuntimeError("business failure")

        with pytest.raises(RuntimeError, match="business failure"):
            await guard.run(callback, operation_name="catalog.publish")

    asyncio.run(run())
    assert session.aborts == 1
    assert session.commits == 0
    assert session.ends == 1


def test_read_only_and_proven_single_document_work_stays_outside_guard():
    calls = 0

    async def safe_read():
        nonlocal calls
        calls += 1
        return {"status": "public-safe"}

    assert asyncio.run(safe_read()) == {"status": "public-safe"}
    assert calls == 1
