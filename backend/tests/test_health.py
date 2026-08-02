import asyncio

import httpx
from database_capabilities import DatabaseCapabilities, TransactionCapabilityReason
from readiness_health import ReadinessDependencies, unavailable_schema_status

from tests.test_identity_foundation import server

CHECKED_AT = "2026-07-17T09:00:00+00:00"


def ready_schema_status():
    return {
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
        "inspection_complete": True,
        "ready": True,
    }


async def get(path, capabilities, *, dependencies=None, cached_capabilities=None):
    previous = server.app.state.database_capabilities
    previous_schema = server.app.state.schema_status
    previous_db = server.db
    previous_coordinator = server.app.state.readiness_probe_coordinator

    class HealthDatabase:
        async def command(self, name):
            assert name == "ping"
            return {"ok": 1}

    fresh = dependencies or ReadinessDependencies(
        database_available=True,
        capabilities=capabilities,
        schema_status=ready_schema_status(),
    )

    class Coordinator:
        async def probe(self):
            return fresh

    transport = httpx.ASGITransport(app=server.app)
    try:
        server.db = HealthDatabase()
        server.app.state.database_capabilities = (
            capabilities
            if path == "/api/health"
            else (cached_capabilities or unavailable_capabilities())
        )
        server.app.state.schema_status = unavailable_schema_status()
        server.app.state.readiness_probe_coordinator = Coordinator()
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            return await api.get(path)
    finally:
        server.app.state.database_capabilities = previous
        server.app.state.schema_status = previous_schema
        server.db = previous_db
        server.app.state.readiness_probe_coordinator = previous_coordinator


def available_capabilities():
    return DatabaseCapabilities(
        transactions=True,
        transaction_reason=TransactionCapabilityReason.AVAILABLE,
        checked_at=CHECKED_AT,
    )


def unavailable_capabilities():
    return DatabaseCapabilities(
        transactions=False,
        transaction_reason=TransactionCapabilityReason.REPLICA_SET_REQUIRED,
        checked_at=CHECKED_AT,
    )


def test_legacy_health_projection_remains_backward_compatible():
    response = asyncio.run(get("/api/health", available_capabilities()))
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "transactions": True}


def test_liveness_does_not_depend_on_transaction_capability():
    response = asyncio.run(get("/api/health/live", unavailable_capabilities()))
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_liveness_never_invokes_dependency_probe():
    async def scenario():
        previous_coordinator = server.app.state.readiness_probe_coordinator

        class ForbiddenCoordinator:
            async def probe(self):
                raise AssertionError("liveness must not probe dependencies")

        server.app.state.readiness_probe_coordinator = ForbiddenCoordinator()
        transport = httpx.ASGITransport(app=server.app)
        try:
            async with httpx.AsyncClient(
                transport=transport, base_url="http://testserver"
            ) as api:
                return await api.get("/api/health/live")
        finally:
            server.app.state.readiness_probe_coordinator = previous_coordinator

    response = asyncio.run(scenario())
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_enabled_auth_security_events_fail_readiness_without_key_and_migration(
    monkeypatch,
):
    previous_service = server.app.state.auth_security_event_service
    previous_status = server.app.state.auth_security_event_status
    monkeypatch.setenv("AUTH_SECURITY_EVENTS_ENABLED", "true")
    monkeypatch.delenv("AUTH_EVENT_HMAC_KEY", raising=False)
    server.app.state.auth_security_event_service = None
    try:
        response = asyncio.run(get("/api/health/ready", available_capabilities()))
        assert response.status_code == 503
        capability = response.json()["capabilities"]["authentication_security_events"]
        assert capability == {
            "status": "unavailable",
            "required": True,
            "migration_010": False,
        }
    finally:
        server.app.state.auth_security_event_service = previous_service
        server.app.state.auth_security_event_status = previous_status


def test_readiness_reports_transaction_capability_when_available(monkeypatch):
    monkeypatch.setenv("TRANSACTION_MUTATIONS_ENABLED", "false")
    response = asyncio.run(get("/api/health/ready", available_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "database": "ready",
        "transaction_mutations": "ready",
        "schema": {
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
            "inspection_complete": True,
            "ready": True,
        },
        "capabilities": {
            "transactions": {
                "available": True,
                "reason": "available",
                "checked_at": CHECKED_AT,
                "required": False,
            },
            "production_upload": {"status": "inactive", "required": False},
            "payment": {"status": "inactive", "required": False},
            "organization_portal": {"status": "inactive", "required": False},
            "notification_worker": {
                "status": "ready",
                "required": False,
                "enabled": False,
                "heartbeat_fresh": False,
            },
            "email_delivery": {
                "status": "inactive",
                "required": False,
            },
            "authentication_security_events": {
                "status": "ready",
                "required": False,
                "migration_010": False,
            },
        },
    }


def test_optional_transaction_capability_does_not_disable_readiness(monkeypatch):
    monkeypatch.setenv("TRANSACTION_MUTATIONS_ENABLED", "false")
    response = asyncio.run(get("/api/health/ready", unavailable_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "database": "ready",
        "transaction_mutations": "unavailable",
        "schema": {
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
            "inspection_complete": True,
            "ready": True,
        },
        "capabilities": {
            "transactions": {
                "available": False,
                "reason": "replica_set_required",
                "checked_at": CHECKED_AT,
                "required": False,
            },
            "production_upload": {"status": "inactive", "required": False},
            "payment": {"status": "inactive", "required": False},
            "organization_portal": {"status": "inactive", "required": False},
            "notification_worker": {
                "status": "ready",
                "required": False,
                "enabled": False,
                "heartbeat_fresh": False,
            },
            "email_delivery": {
                "status": "inactive",
                "required": False,
            },
            "authentication_security_events": {
                "status": "ready",
                "required": False,
                "migration_010": False,
            },
        },
    }
    serialized = response.text.lower()
    for forbidden in ("mongodb://", "replicaset=", "password", "secret"):
        assert forbidden not in serialized


def test_database_ping_failure_is_not_ready_and_remains_secret_safe():
    dependencies = ReadinessDependencies(
        database_available=False,
        capabilities=DatabaseCapabilities(
            transactions=False,
            transaction_reason=TransactionCapabilityReason.PROBE_FAILED,
            checked_at=CHECKED_AT,
        ),
        schema_status=unavailable_schema_status(),
    )

    response = asyncio.run(
        get("/api/health/ready", available_capabilities(), dependencies=dependencies)
    )

    assert response.status_code == 503
    assert response.json()["database"] == "unavailable"
    assert response.json()["transaction_mutations"] == "unavailable"
    assert response.json()["schema"]["ready"] is False
    assert "mongodb://private:secret@host" not in response.text


def test_fresh_schema_failure_overrides_cached_ready_state():
    dependencies = ReadinessDependencies(
        database_available=True,
        capabilities=available_capabilities(),
        schema_status=unavailable_schema_status(),
    )

    response = asyncio.run(
        get("/api/health/ready", available_capabilities(), dependencies=dependencies)
    )

    assert response.status_code == 503
    assert response.json()["database"] == "ready"
    assert response.json()["transaction_mutations"] == "ready"
    assert response.json()["schema"]["ready"] is False


def test_required_fresh_transaction_failure_overrides_cached_available_state(
    monkeypatch,
):
    monkeypatch.setenv("TRANSACTION_MUTATIONS_ENABLED", "true")
    dependencies = ReadinessDependencies(
        database_available=True,
        capabilities=unavailable_capabilities(),
        schema_status=ready_schema_status(),
    )

    response = asyncio.run(
        get(
            "/api/health/ready",
            available_capabilities(),
            dependencies=dependencies,
            cached_capabilities=available_capabilities(),
        )
    )

    assert response.status_code == 503
    assert response.json()["database"] == "ready"
    assert response.json()["transaction_mutations"] == "unavailable"


class WorkerTask:
    def __init__(self, *, done=False):
        self._done = done

    def done(self):
        return self._done


def test_required_worker_needs_live_task_and_fresh_nonfuture_heartbeat(monkeypatch):
    previous_status = server.app.state.notification_worker_status
    previous_task = server.app.state.notification_worker_task
    monkeypatch.setenv("NOTIFICATION_WORKER_REQUIRED", "true")
    try:
        server.app.state.notification_worker_status = {
            "enabled": True,
            "running": True,
            "last_heartbeat_at": server.datetime.now(server.timezone.utc)
            + server.timedelta(seconds=60),
            "last_result": None,
        }
        server.app.state.notification_worker_task = WorkerTask()
        future = asyncio.run(get("/api/health/ready", available_capabilities()))
        assert future.status_code == 503
        assert future.json()["capabilities"]["notification_worker"] == {
            "status": "unavailable",
            "required": True,
            "enabled": True,
            "heartbeat_fresh": False,
        }

        server.app.state.notification_worker_status["last_heartbeat_at"] = (
            server.datetime.now(server.timezone.utc)
        )
        server.app.state.notification_worker_task = WorkerTask(done=True)
        completed = asyncio.run(get("/api/health/ready", available_capabilities()))
        assert completed.status_code == 503

        unavailable_states = (
            ({"enabled": False, "running": True}, WorkerTask()),
            ({"enabled": True, "running": False}, WorkerTask()),
            (
                {
                    "enabled": True,
                    "running": True,
                    "last_heartbeat_at": server.datetime.now(server.timezone.utc)
                    - server.timedelta(seconds=31),
                },
                WorkerTask(),
            ),
            ({"enabled": True, "running": True}, None),
        )
        for status, task in unavailable_states:
            status.setdefault(
                "last_heartbeat_at", server.datetime.now(server.timezone.utc)
            )
            server.app.state.notification_worker_status = status
            server.app.state.notification_worker_task = task
            unavailable = asyncio.run(
                get("/api/health/ready", available_capabilities())
            )
            assert unavailable.status_code == 503

        server.app.state.notification_worker_status = {
            "enabled": True,
            "running": True,
            "last_heartbeat_at": server.datetime.now(server.timezone.utc),
        }
        server.app.state.notification_worker_task = WorkerTask(done=False)
        ready = asyncio.run(get("/api/health/ready", available_capabilities()))
        assert ready.status_code == 200
        assert ready.json()["capabilities"]["notification_worker"]["status"] == "ready"
    finally:
        server.app.state.notification_worker_status = previous_status
        server.app.state.notification_worker_task = previous_task


def test_required_worker_heartbeat_advances_during_slow_batch(monkeypatch):
    previous_status = server.app.state.notification_worker_status
    previous_task = server.app.state.notification_worker_task
    started = asyncio.Event()
    release = asyncio.Event()

    class SlowWorker:
        def __init__(self, **_kwargs):
            pass

        async def run_once(self, *, limit):
            assert limit == 50
            started.set()
            await release.wait()
            return {"claimed": 0, "delivered": 0, "failed": 0}

    async def scenario():
        monkeypatch.setenv("NOTIFICATION_WORKER_REQUIRED", "true")
        monkeypatch.setattr(
            server,
            "NOTIFICATION_WORKER_HEARTBEAT_INTERVAL_SECONDS",
            0.01,
        )
        monkeypatch.setattr(server, "NotificationDeliveryWorker", SlowWorker)
        server.app.state.notification_worker_status = {
            "enabled": True,
            "running": False,
            "last_heartbeat_at": None,
            "last_result": None,
        }
        task = asyncio.create_task(server.notification_outbox_loop())
        server.app.state.notification_worker_task = task
        try:
            await started.wait()
            first = server.app.state.notification_worker_status["last_heartbeat_at"]
            await asyncio.sleep(0.03)
            second = server.app.state.notification_worker_status["last_heartbeat_at"]
            response = await get("/api/health/ready", available_capabilities())
            return first, second, response
        finally:
            task.cancel()
            await asyncio.gather(task, return_exceptions=True)

    try:
        first, second, response = asyncio.run(scenario())
        assert second > first
        assert response.status_code == 200
        assert response.json()["capabilities"]["notification_worker"]["status"] == (
            "ready"
        )
    finally:
        server.app.state.notification_worker_status = previous_status
        server.app.state.notification_worker_task = previous_task


def test_required_email_capability_is_configuration_only_and_secret_safe(monkeypatch):
    monkeypatch.setenv("EMAIL_DELIVERY_REQUIRED", "true")
    monkeypatch.setattr(server.emailer, "RESEND_API_KEY", "   ")

    missing = asyncio.run(get("/api/health/ready", available_capabilities()))

    assert missing.status_code == 503
    assert missing.json()["capabilities"]["email_delivery"] == {
        "status": "unavailable",
        "required": True,
    }
    monkeypatch.setattr(server.emailer, "RESEND_API_KEY", "private-provider-key")
    configured = asyncio.run(get("/api/health/ready", available_capabilities()))
    assert configured.status_code == 200
    assert configured.json()["capabilities"]["email_delivery"] == {
        "status": "ready",
        "required": True,
    }
    assert "private-provider-key" not in configured.text
