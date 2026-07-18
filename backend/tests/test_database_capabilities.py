import asyncio
from datetime import datetime, timezone

from pymongo.errors import ServerSelectionTimeoutError

from database_capabilities import (
    DatabaseCapabilities,
    TransactionCapabilityReason,
    probe_database_capabilities,
    probe_transaction_capability,
    supports_transactions,
)


FIXED_TIME = datetime(2026, 7, 17, 9, 0, tzinfo=timezone.utc)


class FakeSession:
    def __init__(self, *, cleanup_fails=False):
        self.started = False
        self.committed = False
        self.aborted = False
        self.ended = False
        self.cleanup_fails = cleanup_fails

    def start_transaction(self):
        self.started = True

    async def commit_transaction(self):
        self.committed = True

    async def abort_transaction(self):
        self.aborted = True

    async def end_session(self):
        self.ended = True
        if self.cleanup_fails:
            raise ServerSelectionTimeoutError(
                "mongodb://user:cleanup-secret@private.invalid"
            )


class FakeDatabase:
    def __init__(self, session, *, fail=False):
        self.session = session
        self.fail = fail
        self.commands = []

    async def command(self, name, collection, **kwargs):
        self.commands.append((name, collection, kwargs))
        assert name == "find"
        assert collection == "__transaction_capability_probe__"
        assert kwargs["filter"] == {"_id": "__read_only_probe__"}
        assert kwargs["limit"] == 1
        assert kwargs["session"] is self.session
        if self.fail:
            raise ServerSelectionTimeoutError("mongodb://user:secret@private.invalid")
        return {"cursor": {"firstBatch": []}}


class FakeAdmin:
    def __init__(self, hello=None, error=None):
        self.hello = hello
        self.error = error

    async def command(self, name):
        assert name == "hello"
        if self.error:
            raise self.error
        return self.hello


class FakeClient:
    def __init__(self, hello, *, transaction_fails=False, cleanup_fails=False):
        self.admin = FakeAdmin(hello)
        self.session = FakeSession(cleanup_fails=cleanup_fails)
        self.database = FakeDatabase(self.session, fail=transaction_fails)
        self.requested_database = None

    async def start_session(self):
        return self.session

    def __getitem__(self, name):
        self.requested_database = name
        return self.database


def test_transaction_support_requires_replica_set_and_sessions():
    assert supports_transactions(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    assert not supports_transactions({"logicalSessionTimeoutMinutes": 30})
    assert not supports_transactions({"setName": "rs0"})


def test_probe_proves_read_only_session_and_transaction_capability():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )

    assert result == DatabaseCapabilities(
        transactions=True,
        transaction_reason=TransactionCapabilityReason.AVAILABLE,
        checked_at="2026-07-17T09:00:00+00:00",
    )
    assert result.transaction_diagnostic() == {
        "available": True,
        "reason": "available",
        "checked_at": "2026-07-17T09:00:00+00:00",
    }
    assert client.requested_database == "niuva"
    assert client.session.started is True
    assert client.session.committed is True
    assert client.session.aborted is False
    assert client.session.ended is True
    assert len(client.database.commands) == 1


def test_probe_rejects_standalone_without_starting_callback_capability():
    client = FakeClient({"logicalSessionTimeoutMinutes": 30})
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.REPLICA_SET_REQUIRED
    assert client.session.started is False


def test_probe_rejects_replica_set_without_logical_sessions():
    client = FakeClient({"setName": "rs0"})
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.SESSIONS_REQUIRED
    assert client.session.started is False


def test_probe_aborts_and_returns_safe_reason_when_transaction_read_fails():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30},
        transaction_fails=True,
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.PROBE_FAILED
    assert client.session.aborted is True
    assert client.session.ended is True
    assert "secret" not in str(result.transaction_diagnostic())


def test_probe_returns_safe_reason_when_successful_probe_cleanup_fails():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30},
        cleanup_fails=True,
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.PROBE_FAILED
    assert result.transaction_diagnostic() == {
        "available": False,
        "reason": "probe_failed",
        "checked_at": "2026-07-17T09:00:00+00:00",
    }
    assert "cleanup-secret" not in str(result.transaction_diagnostic())
    assert client.session.ended is True


def test_probe_preserves_read_failure_when_cleanup_also_fails():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30},
        transaction_fails=True,
        cleanup_fails=True,
    )
    result = asyncio.run(
        probe_database_capabilities(client, "niuva", clock=lambda: FIXED_TIME)
    )
    assert result.transactions is False
    assert result.transaction_reason is TransactionCapabilityReason.PROBE_FAILED
    assert "cleanup-secret" not in str(result.transaction_diagnostic())
    assert client.session.aborted is True
    assert client.session.ended is True

def test_legacy_boolean_probe_remains_compatible_until_startup_migrates():
    client = FakeClient(
        {"setName": "rs0", "logicalSessionTimeoutMinutes": 30}
    )
    assert asyncio.run(probe_transaction_capability(client)) is True
