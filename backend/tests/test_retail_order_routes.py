"""The retail order HTTP surface.

/admin/retail-orders is its own surface, separate from the legacy
/admin/orders compatibility surface. These tests hold the permission scoping,
the refusal of client-supplied prices, and the suspended actions answering
with a reason rather than a 404.
"""

import asyncio

import httpx
import pytest
from fastapi import APIRouter, FastAPI, Header, HTTPException

from permissions import has_permission
from retail_routes import build_retail_router
from tests.test_b2b_quote_conversion import EnabledGuard
from tests.test_retail_order_aggregate import (
    CUSTOMER,
    PRODUCT,
    VARIANT,
    RetailDatabase,
)


def permission_dependency(permission):
    async def dependency(x_role: str = Header(default="retail_customer")):
        actor = {
            "id": f"actor-{x_role}",
            "email": f"{x_role}@niuva.test",
            "roles": [x_role],
            "status": "active",
            "access_state": "approved",
        }
        if not has_permission(actor, permission):
            raise HTTPException(status_code=403, detail="Permission denied")
        return actor

    return dependency


async def build_app():
    db = RetailDatabase()
    await db.products.insert_one(dict(PRODUCT))
    await db.product_variants.insert_one(dict(VARIANT))
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(
        build_retail_router(
            get_db=lambda: db,
            get_transaction_guard=lambda: EnabledGuard(),
            require_permission=permission_dependency,
        )
    )
    app.include_router(api)
    return app, db


def client(app):
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://testserver"
    )


CREATE_BODY = {
    "operation_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3301",
    "customer": CUSTOMER,
    "items": [{"variant_id": "var-1", "quantity": 2}],
    "fulfilment_method": "ship",
    "notes": "Kirim ke kantor",
}


def test_retail_orders_are_permission_scoped():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            forbidden = await api.get(
                "/api/admin/retail-orders", headers={"X-Role": "warehouse"}
            )
            assert forbidden.status_code == 403

            allowed = await api.get(
                "/api/admin/retail-orders", headers={"X-Role": "order_admin"}
            )
            assert allowed.status_code == 200

    asyncio.run(scenario())


def test_creating_and_reading_a_retail_order():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            created = await api.post(
                "/api/admin/retail-orders",
                headers={"X-Role": "order_admin"},
                json=CREATE_BODY,
            )
            assert created.status_code == 201
            order = created.json()
            assert order["status"] == "created"
            assert order["total_minor"] == 300000
            assert order["order_number"].startswith("NIV-R-")

            fetched = await api.get(
                f"/api/admin/retail-orders/{order['id']}",
                headers={"X-Role": "order_admin"},
            )
            assert fetched.status_code == 200
            assert fetched.json()["id"] == order["id"]

    asyncio.run(scenario())


def test_a_caller_cannot_name_its_own_price():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            rejected = await api.post(
                "/api/admin/retail-orders",
                headers={"X-Role": "order_admin"},
                json={
                    **CREATE_BODY,
                    "items": [
                        {
                            "variant_id": "var-1",
                            "quantity": 2,
                            "unit_price_minor": 1,
                        }
                    ],
                },
            )
            # extra="forbid" on the item payload: price is never submitted.
            assert rejected.status_code == 422

    asyncio.run(scenario())


def test_the_transition_surface_walks_the_canonical_graph():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            created = await api.post(
                "/api/admin/retail-orders",
                headers={"X-Role": "order_admin"},
                json=CREATE_BODY,
            )
            order = created.json()

            skipped = await api.post(
                f"/api/admin/retail-orders/{order['id']}/transitions",
                headers={"X-Role": "order_admin"},
                json={
                    "target_status": "paid",
                    "expected_version": order["version"],
                    "operation_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3302",
                    "reason": "Lompat tagihan",
                },
            )
            assert skipped.status_code == 409
            assert skipped.json()["detail"]["code"] == "retail_transition_invalid"

            billed = await api.post(
                f"/api/admin/retail-orders/{order['id']}/transitions",
                headers={"X-Role": "order_admin"},
                json={
                    "target_status": "awaiting_payment",
                    "expected_version": order["version"],
                    "operation_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3303",
                    "reason": "Tagihan dikirim",
                },
            )
            assert billed.status_code == 200
            assert billed.json()["status"] == "awaiting_payment"

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("action", "code"),
    [
        ("cancel", "retail_cancellation_suspended"),
        ("refund", "retail_refund_suspended"),
        ("return", "retail_return_suspended"),
    ],
)
def test_suspended_actions_are_refused_with_a_reason(action, code):
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            created = await api.post(
                "/api/admin/retail-orders",
                headers={"X-Role": "order_admin"},
                json=CREATE_BODY,
            )
            order = created.json()

            refused = await api.post(
                f"/api/admin/retail-orders/{order['id']}/{action}",
                headers={"X-Role": "order_admin"},
            )
            # A 409 with a named code, not a 404 that reads like a gap.
            assert refused.status_code == 409
            assert refused.json()["detail"]["code"] == code

    asyncio.run(scenario())


def test_the_legacy_surface_is_not_reachable_through_the_retail_router():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            missing = await api.get(
                "/api/admin/orders", headers={"X-Role": "order_admin"}
            )
            assert missing.status_code == 404

    asyncio.run(scenario())
