import asyncio
from datetime import datetime, timezone

from database_capabilities import DatabaseCapabilities, TransactionCapabilityReason
from readiness_health import (
    ReadinessProbeCoordinator,
    probe_readiness_dependencies,
    public_schema_status,
    public_transaction_status,
)

NOW = datetime(2026, 8, 2, 12, 0, tzinfo=timezone.utc)


class Database:
    def __init__(self, *, error=None):
        self.error = error
        self.pings = 0

    async def command(self, name):
        assert name == "ping"
        self.pings += 1
        if self.error:
            raise self.error
        return {"ok": 1}


def ready_schema(**overrides):
    value = {
        "required_version": "009_admin_session_safety",
        "required_versions": [
            "007_security_publication_schema",
            "008_auth_recovery_safety",
            "009_admin_session_safety",
        ],
        "migrations": {
            "007_security_publication_schema": True,
            "008_auth_recovery_safety": True,
            "009_admin_session_safety": True,
        },
        "applied": True,
        "indexes_ready": True,
        "missing_index_count": 0,
        "retired_index_count": 0,
        "ready": True,
    }
    value.update(overrides)
    return value


def test_probe_refreshes_ping_transaction_and_schema_every_time():
    async def scenario():
        database = Database()
        calls = {"capability": 0, "schema": 0}

        async def capability_probe(_client, database_name, *, clock):
            assert database_name == "niuva-test"
            calls["capability"] += 1
            return DatabaseCapabilities(
                transactions=True,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=clock().isoformat(),
            )

        async def schema_probe(candidate):
            assert candidate is database
            calls["schema"] += 1
            return ready_schema()

        first = await probe_readiness_dependencies(
            object(),
            database,
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )
        second = await probe_readiness_dependencies(
            object(),
            database,
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )
        return database, calls, first, second

    database, calls, first, second = asyncio.run(scenario())
    assert database.pings == 2
    assert calls == {"capability": 2, "schema": 2}
    assert first.database_available is second.database_available is True
    assert first.capabilities.transactions is True
    assert first.schema_status["ready"] is True


def test_failed_ping_stops_downstream_probes_without_exposing_exception():
    secret = "mongodb://private-user:private-secret@database"

    async def scenario():
        database = Database(error=RuntimeError(secret))

        async def forbidden(*_args, **_kwargs):
            raise AssertionError("downstream probe must not run")

        result = await probe_readiness_dependencies(
            object(),
            database,
            "niuva-test",
            capability_probe=forbidden,
            schema_probe=forbidden,
            clock=lambda: NOW,
        )
        return result

    result = asyncio.run(scenario())
    assert result.database_available is False
    assert (
        result.capabilities.transaction_reason
        is TransactionCapabilityReason.PROBE_FAILED
    )
    assert result.schema_status["ready"] is False
    assert secret not in str(result)


def test_probe_exceptions_fail_closed_independently():
    async def scenario():
        database = Database()

        async def capability_probe(*_args, **_kwargs):
            raise RuntimeError("private capability failure")

        async def schema_probe(*_args, **_kwargs):
            raise RuntimeError("private schema failure")

        return await probe_readiness_dependencies(
            object(),
            database,
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )

    result = asyncio.run(scenario())
    assert result.database_available is True
    assert result.capabilities.transactions is False
    assert (
        result.capabilities.transaction_reason
        is TransactionCapabilityReason.PROBE_FAILED
    )
    assert result.schema_status["ready"] is False
    assert "private" not in str(result)


def test_compatibility_probe_closes_tasks_left_after_total_timeout():
    async def scenario():
        transaction_cancelled = asyncio.Event()
        schema_cancelled = asyncio.Event()

        async def slow_capability_probe(*_args, **_kwargs):
            try:
                await asyncio.sleep(10)
            finally:
                transaction_cancelled.set()

        async def slow_schema_probe(*_args, **_kwargs):
            try:
                await asyncio.sleep(10)
            finally:
                schema_cancelled.set()

        result = await probe_readiness_dependencies(
            object(),
            Database(),
            "niuva-test",
            capability_probe=slow_capability_probe,
            schema_probe=slow_schema_probe,
            transaction_timeout=10,
            schema_timeout=10,
            # Give both child probes time to start before exercising total cleanup.
            total_timeout=0.1,
            clock=lambda: NOW,
        )
        return result, transaction_cancelled.is_set(), schema_cancelled.is_set()

    result, transaction_cancelled, schema_cancelled = asyncio.run(scenario())
    assert result.database_available is False
    assert transaction_cancelled is True
    assert schema_cancelled is True


def test_public_projections_drop_unknown_or_malformed_diagnostics():
    schema = public_schema_status(
        ready_schema(
            secret="private-schema-secret",
            required_version="attacker-controlled",
            missing_index_count="mongodb://private",
        )
    )
    transaction = public_transaction_status(
        DatabaseCapabilities(
            transactions=False,
            transaction_reason=TransactionCapabilityReason.PROBE_FAILED,
            checked_at="private-connection-string",
        )
    )

    assert "secret" not in schema
    assert schema["required_version"] == "009_admin_session_safety"
    assert schema["missing_index_count"] is None
    assert schema["inspection_complete"] is False
    assert transaction == {
        "available": False,
        "reason": "probe_failed",
        "checked_at": None,
    }


def test_inconsistent_ready_and_transaction_claims_fail_closed():
    schema = public_schema_status(
        ready_schema(
            migrations={
                "007_security_publication_schema": True,
                "008_auth_recovery_safety": False,
                "009_admin_session_safety": True,
            },
            ready=True,
            indexes_ready=True,
        )
    )
    transaction = public_transaction_status(
        DatabaseCapabilities(
            transactions=True,
            transaction_reason=TransactionCapabilityReason.PROBE_FAILED,
            checked_at=NOW.isoformat(),
        )
    )

    assert schema["applied"] is False
    assert schema["indexes_ready"] is False
    assert schema["ready"] is False
    assert transaction == {
        "available": False,
        "reason": "probe_failed",
        "checked_at": NOW.isoformat(),
    }


def test_probe_normalizes_inconsistent_unavailable_transaction_claim():
    async def scenario():
        async def capability_probe(*_args, **_kwargs):
            return DatabaseCapabilities(
                transactions=False,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=NOW.isoformat(),
            )

        async def schema_probe(*_args, **_kwargs):
            return ready_schema()

        return await probe_readiness_dependencies(
            object(),
            Database(),
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )

    result = asyncio.run(scenario())
    assert result.capabilities.transactions is False
    assert (
        result.capabilities.transaction_reason
        is TransactionCapabilityReason.PROBE_FAILED
    )


def test_coordinator_reuses_bounded_snapshots_but_pings_every_request():
    async def scenario():
        database = Database()
        now = [100.0]
        calls = {"capability": 0, "schema": 0}

        async def capability_probe(*_args, **_kwargs):
            calls["capability"] += 1
            return DatabaseCapabilities(
                transactions=True,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=NOW.isoformat(),
            )

        async def schema_probe(*_args, **_kwargs):
            calls["schema"] += 1
            return ready_schema()

        coordinator = ReadinessProbeCoordinator(
            object(),
            database,
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
            monotonic=lambda: now[0],
        )
        first = await coordinator.probe()
        now[0] += 5
        second = await coordinator.probe()
        now[0] += 6
        third = await coordinator.probe()
        now[0] += 11
        stale = coordinator.current_transaction_capabilities()
        now[0] += 39
        fourth = await coordinator.probe()
        return database, calls, first, second, third, fourth, stale, coordinator

    database, calls, first, second, third, fourth, stale, coordinator = asyncio.run(
        scenario()
    )
    assert database.pings == 4
    assert calls == {"capability": 3, "schema": 2}
    assert first.capabilities.transactions is True
    assert second.capabilities.transactions is True
    assert third.capabilities.transactions is True
    assert fourth.capabilities.transactions is True
    assert stale.transactions is False
    assert coordinator.current_transaction_capabilities().transactions is True


def test_concurrent_requests_share_probe_work():
    async def scenario():
        database = Database()
        release = asyncio.Event()
        started = asyncio.Event()
        calls = {"capability": 0, "schema": 0}

        async def capability_probe(*_args, **_kwargs):
            calls["capability"] += 1
            started.set()
            await release.wait()
            return DatabaseCapabilities(
                transactions=True,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=NOW.isoformat(),
            )

        async def schema_probe(*_args, **_kwargs):
            calls["schema"] += 1
            await release.wait()
            return ready_schema()

        coordinator = ReadinessProbeCoordinator(
            object(),
            database,
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )
        first = asyncio.create_task(coordinator.probe())
        await started.wait()
        second = asyncio.create_task(coordinator.probe())
        await asyncio.sleep(0)
        release.set()
        return database, calls, await asyncio.gather(first, second)

    database, calls, results = asyncio.run(scenario())
    assert database.pings == 2
    assert calls == {"capability": 1, "schema": 1}
    assert all(result.capabilities.transactions for result in results)


def test_background_refresh_can_force_transaction_before_snapshot_expiry():
    async def scenario():
        calls = {"capability": 0, "schema": 0}

        async def capability_probe(*_args, **_kwargs):
            calls["capability"] += 1
            return DatabaseCapabilities(
                transactions=True,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=NOW.isoformat(),
            )

        async def schema_probe(*_args, **_kwargs):
            calls["schema"] += 1
            return ready_schema()

        coordinator = ReadinessProbeCoordinator(
            object(),
            Database(),
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
        )
        await coordinator.probe()
        await coordinator.probe(refresh_transaction=True)
        return calls

    assert asyncio.run(scenario()) == {"capability": 2, "schema": 1}


def test_newer_ping_failure_cannot_be_overwritten_by_older_probe_success():
    class RaceDatabase:
        def __init__(self):
            self.calls = 0

        async def command(self, _name):
            self.calls += 1
            if self.calls == 2:
                raise RuntimeError("newer ping failed")
            return {"ok": 1}

    async def scenario():
        release = asyncio.Event()
        started = asyncio.Event()

        async def capability_probe(*_args, **_kwargs):
            started.set()
            await release.wait()
            return DatabaseCapabilities(
                transactions=True,
                transaction_reason=TransactionCapabilityReason.AVAILABLE,
                checked_at=NOW.isoformat(),
            )

        async def schema_probe(*_args, **_kwargs):
            return ready_schema()

        coordinator = ReadinessProbeCoordinator(
            object(),
            RaceDatabase(),
            "niuva-test",
            capability_probe=capability_probe,
            schema_probe=schema_probe,
            clock=lambda: NOW,
            transaction_max_age=0,
        )
        older = asyncio.create_task(coordinator.probe())
        await started.wait()
        newer = await coordinator.probe()
        release.set()
        older_result = await older
        return coordinator, older_result, newer

    coordinator, older, newer = asyncio.run(scenario())
    assert newer.database_available is False
    assert newer.capabilities.transactions is False
    assert older.capabilities.transactions is False
    assert coordinator.current_transaction_capabilities().transactions is False


def test_slow_probes_timeout_and_stale_transaction_snapshot_fails_closed():
    async def scenario():
        release = asyncio.Event()
        now = [100.0]

        async def slow_probe(*_args, **_kwargs):
            await release.wait()

        coordinator = ReadinessProbeCoordinator(
            object(),
            Database(),
            "niuva-test",
            capability_probe=slow_probe,
            schema_probe=slow_probe,
            clock=lambda: NOW,
            monotonic=lambda: now[0],
            transaction_timeout=0.01,
            schema_timeout=0.01,
            total_timeout=0.05,
        )
        result = await coordinator.probe()
        now[0] += 11
        stale = coordinator.current_transaction_capabilities()
        return result, stale

    result, stale = asyncio.run(scenario())
    assert result.database_available is True
    assert result.capabilities.transactions is False
    assert result.schema_status["inspection_complete"] is False
    assert stale.transactions is False


def test_slow_ping_times_out_without_starting_downstream_probes():
    class SlowDatabase:
        async def command(self, _name):
            await asyncio.Event().wait()

    async def scenario():
        calls = {"downstream": 0}

        async def forbidden(*_args, **_kwargs):
            calls["downstream"] += 1

        coordinator = ReadinessProbeCoordinator(
            object(),
            SlowDatabase(),
            "niuva-test",
            capability_probe=forbidden,
            schema_probe=forbidden,
            clock=lambda: NOW,
            ping_timeout=0.01,
            total_timeout=0.05,
        )
        return await coordinator.probe(), calls

    result, calls = asyncio.run(scenario())
    assert result.database_available is False
    assert result.capabilities.transactions is False
    assert result.schema_status["inspection_complete"] is False
    assert calls == {"downstream": 0}
