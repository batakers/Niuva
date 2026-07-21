import asyncio

import httpx

from database_capabilities import (
    DatabaseCapabilities,
    TransactionCapabilityReason,
)
from tests.test_identity_foundation import server


CHECKED_AT = "2026-07-17T09:00:00+00:00"


async def get(path, capabilities):
    previous = server.app.state.database_capabilities
    transport = httpx.ASGITransport(app=server.app)
    try:
        server.app.state.database_capabilities = capabilities
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            return await api.get(path)
    finally:
        server.app.state.database_capabilities = previous


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


def test_readiness_reports_transaction_capability_when_available():
    response = asyncio.run(get("/api/health/ready", available_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "ready",
        "transaction_mutations": "ready",
        "capabilities": {
            "transactions": {
                "available": True,
                "reason": "available",
                "checked_at": CHECKED_AT,
            }
        },
    }


def test_readiness_is_degraded_without_disabling_public_liveness():
    response = asyncio.run(get("/api/health/ready", unavailable_capabilities()))
    assert response.status_code == 200
    assert response.json() == {
        "status": "degraded",
        "transaction_mutations": "unavailable",
        "capabilities": {
            "transactions": {
                "available": False,
                "reason": "replica_set_required",
                "checked_at": CHECKED_AT,
            }
        },
    }
    serialized = response.text.lower()
    for forbidden in ("mongodb://", "replicaset=", "password", "secret"):
        assert forbidden not in serialized
