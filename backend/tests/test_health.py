import asyncio

import httpx

from database_capabilities import DatabaseCapabilities
from tests.test_identity_foundation import server


async def run_health_capability_projection():
    previous = server.app.state.database_capabilities
    transport = httpx.ASGITransport(app=server.app)
    try:
        server.app.state.database_capabilities = DatabaseCapabilities(transactions=True)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            response = await api.get("/api/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok", "transactions": True}
        assert "mongo" not in response.text.lower()
    finally:
        server.app.state.database_capabilities = previous


def test_health_exposes_transaction_capability_without_connection_details():
    asyncio.run(run_health_capability_projection())
