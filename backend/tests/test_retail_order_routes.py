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
from permissions import ROLE_POLICY_VERSION, has_permission
from retail_routes import build_retail_router
from retail_service import RetailOrderService

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
            "role_policy_version": ROLE_POLICY_VERSION,
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


def test_retail_order_creation_is_explicitly_inactive():
    async def scenario():
        app, _db = await build_app()
        async with client(app) as api:
            created = await api.post(
                "/api/admin/retail-orders",
                headers={"X-Role": "order_admin"},
                json=CREATE_BODY,
            )
            assert created.status_code == 503
            assert created.json()["detail"]["code"] == "retail_transaction_inactive"

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


def test_the_transition_surface_is_explicitly_read_only():
    async def scenario():
        app, db = await build_app()
        order = await RetailOrderService(
            db=db,
            transaction_guard=EnabledGuard(),
        ).create_order(
            operation_id="historical-order-fixture",
            customer=dict(CUSTOMER),
            items=[{"variant_id": "var-1", "quantity": 2}],
            fulfilment_method="ship",
            notes="Historical fixture",
            actor={"id": "fixture-admin"},
        )
        async with client(app) as api:
            blocked = await api.post(
                f"/api/admin/retail-orders/{order['id']}/transitions",
                headers={"X-Role": "order_admin"},
                json={
                    "target_status": "awaiting_payment",
                    "expected_version": order["version"],
                    "operation_id": "3f2504e0-4f89-11d3-9a0c-0305e82c3302",
                    "reason": "Tagihan dikirim",
                },
            )
            assert blocked.status_code == 503
            assert blocked.json()["detail"]["code"] == "retail_transaction_inactive"

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
            refused = await api.post(
                f"/api/admin/retail-orders/historical-order/{action}",
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


def test_list_contract_uses_stable_cursor_and_preserves_query_filters():
    async def scenario():
        app, db = await build_app()
        service = RetailOrderService(db=db, transaction_guard=EnabledGuard())
        for index in range(3):
            order = await service.create_order(
                operation_id=f"historical-order-{index}",
                customer={**CUSTOMER, "name": f"Customer {index}"},
                items=[{"variant_id": "var-1", "quantity": 1}],
                fulfilment_method="ship",
                notes="Operations note",
                actor={"id": "fixture-admin"},
            )
            db.retail_orders.items[-1]["updated_at"] = (
                f"2026-08-20T10:0{index}:00+00:00"
            )
            db.retail_orders.items[-1]["order_number"] = f"NIV-R-2608-000{index}"

        async with client(app) as api:
            first = await api.get(
                "/api/admin/retail-orders?limit=2&search=Customer",
                headers={"X-Role": "order_admin"},
            )
            assert first.status_code == 200
            first_payload = first.json()
            assert len(first_payload["items"]) == 2
            assert first_payload["next_cursor"]
            assert all("notes" not in item for item in first_payload["items"])
            assert first_payload["items"][0]["customer"]["phone"] == CUSTOMER["phone"]

            second = await api.get(
                "/api/admin/retail-orders",
                params={
                    "limit": 2,
                    "search": "Customer",
                    "cursor": first_payload["next_cursor"],
                },
                headers={"X-Role": "order_admin"},
            )
            assert second.status_code == 200
            second_payload = second.json()
            assert len(second_payload["items"]) == 1
            assert {
                item["id"] for item in first_payload["items"]
            }.isdisjoint({item["id"] for item in second_payload["items"]})
            assert second_payload["next_cursor"] is None

            mismatch = await api.get(
                "/api/admin/retail-orders",
                params={
                    "limit": 2,
                    "search": "Other",
                    "cursor": first_payload["next_cursor"],
                },
                headers={"X-Role": "order_admin"},
            )
            assert mismatch.status_code == 422
            assert mismatch.json()["detail"]["code"] == "retail_cursor_invalid"

            invalid_status = await api.get(
                "/api/admin/retail-orders?status=not-a-retail-status",
                headers={"X-Role": "order_admin"},
            )
            assert invalid_status.status_code == 422
            assert invalid_status.json()["detail"]["code"] == "retail_status_invalid"

            invalid_cursor = await api.get(
                "/api/admin/retail-orders?cursor=not-a-cursor",
                headers={"X-Role": "order_admin"},
            )
            assert invalid_cursor.status_code == 422
            assert invalid_cursor.json()["detail"]["code"] == "retail_cursor_invalid"

    asyncio.run(scenario())


def test_detail_projection_redacts_unknown_and_role_sensitive_fields():
    async def scenario():
        app, db = await build_app()
        order = await RetailOrderService(
            db=db,
            transaction_guard=EnabledGuard(),
        ).create_order(
            operation_id="historical-order-redaction",
            customer=dict(CUSTOMER),
            items=[{"variant_id": "var-1", "quantity": 1}],
            fulfilment_method="ship",
            notes="Internal operations note",
            actor={"id": "fixture-admin"},
        )
        stored = db.retail_orders.items[0]
        stored.update(
            {
                "creation_operation_id": "must-not-leak",
                "actor_user_id": "must-not-leak",
                "provider_payload": {"secret": "must-not-leak"},
                "internal_margin_minor": 999,
                "unknown_field": "must-not-leak",
                "raw_storage_path": "s3://private/raw",
            }
        )

        async with client(app) as api:
            operations = await api.get(
                f"/api/admin/retail-orders/{order['id']}",
                headers={"X-Role": "order_admin"},
            )
            assert operations.status_code == 200
            operations_payload = operations.json()
            assert operations_payload["notes"] == "Internal operations note"
            assert operations_payload["customer"]["phone"] == CUSTOMER["phone"]
            assert "creation_operation_id" not in operations_payload
            assert "provider_payload" not in operations_payload
            assert "unknown_field" not in operations_payload
            assert "actor_user_id" not in str(operations_payload)

            finance = await api.get(
                f"/api/admin/retail-orders/{order['id']}",
                headers={"X-Role": "finance"},
            )
            assert finance.status_code == 200
            finance_payload = finance.json()
            assert finance_payload["customer"]["email"] == CUSTOMER["email"]
            assert "phone" not in finance_payload["customer"]
            assert "notes" not in finance_payload

            manager = await api.get(
                f"/api/admin/retail-orders/{order['id']}",
                headers={"X-Role": "manager_approver"},
            )
            assert manager.status_code == 200
            manager_payload = manager.json()
            assert manager_payload["customer"] == {"name": CUSTOMER["name"]}
            assert "notes" not in manager_payload

    asyncio.run(scenario())
