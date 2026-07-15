import asyncio

import httpx
from fastapi import APIRouter, FastAPI, Header, HTTPException

from inventory_routes import build_inventory_router
from inventory_service import InventoryError


class StubInventoryService:
    def __init__(self):
        self.operations = {}
        self.calls = []

    async def list_balances(self, **filters):
        self.calls.append(("list_balances", filters))
        return [{"subject_type": "material", "subject_id": "mat-1", "on_hand": "10"}]

    async def get_balance(self, subject_type, subject_id):
        self.calls.append(("get_balance", subject_type, subject_id))
        return {"subject_type": subject_type, "subject_id": subject_id, "on_hand": "10"}

    async def list_movements(self, **filters):
        self.calls.append(("list_movements", filters))
        return []

    async def list_reservations(self, **filters):
        self.calls.append(("list_reservations", filters))
        return [{
            "id": "reservation-1", "subject_type": "material",
            "subject_id": "mat-1", "quantity": "2", "status": "active",
        }]

    async def apply_operation(self, *, actor, payload):
        self.calls.append(("apply_operation", actor, payload))
        if payload["operation_id"] == "00000000-0000-0000-0000-000000000503":
            raise InventoryError(503, "transaction_unavailable", "Transactions unavailable")
        existing = self.operations.get(payload["operation_id"])
        if existing and existing != payload:
            raise InventoryError(409, "operation_id_conflict", "Operation ID conflict")
        replayed = existing is not None
        self.operations[payload["operation_id"]] = dict(payload)
        return {
            "movement": {"operation_id": payload["operation_id"]},
            "balance": {"on_hand": "10"},
            "replayed": replayed,
        }

    async def create_reservation(self, *, actor, payload):
        self.calls.append(("create_reservation", actor, payload))
        return {"reservation": {"id": "reservation-1", "status": "active"}}

    async def transition_reservation(self, **kwargs):
        self.calls.append(("transition_reservation", kwargs))
        return {"reservation": {"id": kwargs["reservation_id"], "status": kwargs["action"]}}

    async def list_alerts(self, **filters):
        self.calls.append(("list_alerts", filters))
        return [{"id": "alert-1", "status": "active"}]

    async def resolve_alert(self, **kwargs):
        self.calls.append(("resolve_alert", kwargs))
        return {"id": kwargs["alert_id"], "status": "resolved"}


def require_permission(permission):
    async def dependency(
        x_permissions: str = Header(default=""),
        x_actor_id: str = Header(default="staff-1"),
    ):
        permissions = {value.strip() for value in x_permissions.split(",") if value.strip()}
        if permission not in permissions:
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
        return {
            "id": x_actor_id,
            "email": "staff@test",
            "roles": ["staff"],
            "permissions": permissions,
        }

    return dependency


def has_permission(actor, permission):
    return permission in actor.get("permissions", set())


def build_context():
    service = StubInventoryService()
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(
        build_inventory_router(
            get_service=lambda: service,
            require_permission=require_permission,
            has_permission=has_permission,
        )
    )
    app.include_router(api)
    return app, service


def headers(*permissions):
    return {"x-permissions": ",".join(permissions)}


def movement(operation_id, movement_type="receive", **overrides):
    value = {
        "operation_id": operation_id,
        "subject_type": "material",
        "subject_id": "mat-1",
        "movement_type": movement_type,
        "quantity": "2.5",
        "reference_type": "manual_receipt",
        "reference_id": "receipt-1",
        "reason": "Recorded by warehouse staff",
    }
    value.update(overrides)
    return value


async def run_permission_and_operation_routes():
    app, service = build_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        read = await api.get(
            "/api/admin/inventory/balances?subject_type=material&limit=20",
            headers=headers("inventory.read"),
        )
        assert read.status_code == 200
        assert read.json()[0]["on_hand"] == "10"

        estimator_write = await api.post(
            "/api/admin/inventory/movements",
            json=movement("11111111-1111-1111-1111-111111111111"),
            headers=headers("inventory.read"),
        )
        assert estimator_write.status_code == 403

        applied = await api.post(
            "/api/admin/inventory/movements",
            json=movement("11111111-1111-1111-1111-111111111111"),
            headers=headers("inventory.write"),
        )
        replayed = await api.post(
            "/api/admin/inventory/movements",
            json=movement("11111111-1111-1111-1111-111111111111"),
            headers=headers("inventory.write"),
        )
        assert applied.status_code == 200
        assert replayed.status_code == 200
        assert replayed.json()["replayed"] is True

        conflict = await api.post(
            "/api/admin/inventory/movements",
            json=movement(
                "11111111-1111-1111-1111-111111111111",
                quantity="3",
            ),
            headers=headers("inventory.write"),
        )
        assert conflict.status_code == 409
        assert conflict.json()["detail"]["code"] == "operation_id_conflict"

        warehouse_damage = await api.post(
            "/api/admin/inventory/movements",
            json=movement("22222222-2222-2222-2222-222222222222", "damage"),
            headers=headers("inventory.write"),
        )
        assert warehouse_damage.status_code == 403

        manager_adjustment = await api.post(
            "/api/admin/inventory/movements",
            json=movement(
                "33333333-3333-3333-3333-333333333333",
                "adjustment",
                quantity=None,
                on_hand_delta="-1.25",
            ),
            headers=headers("inventory.write", "inventory.adjust"),
        )
        assert manager_adjustment.status_code == 200
        call_payload = [call for call in service.calls if call[0] == "apply_operation"][-1][2]
        assert call_payload["on_hand_delta"] == "-1.25"

        unavailable = await api.post(
            "/api/admin/inventory/movements",
            json=movement("00000000-0000-0000-0000-000000000503"),
            headers=headers("inventory.write"),
        )
        assert unavailable.status_code == 503
        assert unavailable.json()["detail"]["code"] == "transaction_unavailable"


def test_inventory_read_write_adjust_and_replay_permissions():
    asyncio.run(run_permission_and_operation_routes())


async def run_reservation_and_alert_routes():
    app, service = build_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        reservation = await api.post(
            "/api/admin/inventory/reservations",
            json={
                "operation_id": "44444444-4444-4444-4444-444444444444",
                "subject_type": "product_variant",
                "subject_id": "variant-1",
                "quantity": "2",
                "reference_type": "order",
                "reference_id": "order-1",
                "expires_at": "2026-07-16T00:00:00+00:00",
                "reason": "Reserved for paid retail order",
            },
            headers=headers("inventory.write"),
        )
        assert reservation.status_code == 201

        released = await api.post(
            "/api/admin/inventory/reservations/reservation-1/release",
            json={
                "operation_id": "55555555-5555-5555-5555-555555555555",
                "reason": "Order cancelled before production",
            },
            headers=headers("inventory.write"),
        )
        assert released.status_code == 200

        consumed = await api.post(
            "/api/admin/inventory/reservations/reservation-1/consume",
            json={
                "operation_id": "66666666-6666-6666-6666-666666666666",
                "reason": "Order shipped to customer",
            },
            headers=headers("inventory.write"),
        )
        assert consumed.status_code == 200

        alerts = await api.get(
            "/api/admin/inventory/restock-alerts?status=active&limit=10",
            headers=headers("restock_alerts.read"),
        )
        assert alerts.status_code == 200

        forbidden_resolve = await api.post(
            "/api/admin/inventory/restock-alerts/alert-1/resolve",
            json={"reason": "Stock received and verified"},
            headers=headers("restock_alerts.read"),
        )
        assert forbidden_resolve.status_code == 403

        resolved = await api.post(
            "/api/admin/inventory/restock-alerts/alert-1/resolve",
            json={"reason": "Stock received and verified"},
            headers=headers("restock_alerts.manage"),
        )
        assert resolved.status_code == 200
        assert resolved.json()["status"] == "resolved"

        customer = await api.get("/api/admin/inventory/balances")
        assert customer.status_code == 403


def test_reservation_and_restock_alert_routes():
    asyncio.run(run_reservation_and_alert_routes())


async def run_reservation_listing_and_generic_movement_guard():
    app, service = build_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        listed = await api.get(
            "/api/admin/inventory/reservations?subject_type=material&subject_id=mat-1&status=active&limit=20",
            headers=headers("inventory.read"),
        )
        assert listed.status_code == 200
        assert listed.json()[0]["id"] == "reservation-1"
        list_call = [call for call in service.calls if call[0] == "list_reservations"][-1]
        assert list_call[1] == {
            "subject_type": "material",
            "subject_id": "mat-1",
            "status": "active",
            "limit": 20,
        }

        generic_reserve = await api.post(
            "/api/admin/inventory/movements",
            json=movement(
                "77777777-7777-7777-7777-777777777777",
                movement_type="reserve",
            ),
            headers=headers("inventory.write"),
        )
        assert generic_reserve.status_code == 409
        assert generic_reserve.json()["detail"]["code"] == "reservation_endpoint_required"

        generic_release = await api.post(
            "/api/admin/inventory/movements",
            json=movement(
                "88888888-8888-8888-8888-888888888888",
                movement_type="release",
            ),
            headers=headers("inventory.write"),
        )
        assert generic_release.status_code == 409
        assert generic_release.json()["detail"]["code"] == "reservation_endpoint_required"
        guarded_calls = [
            call for call in service.calls
            if call[0] == "apply_operation"
            and call[2]["movement_type"] in {"reserve", "release"}
        ]
        assert guarded_calls == []


def test_reservations_can_be_listed_and_cannot_bypass_lifecycle_routes():
    asyncio.run(run_reservation_listing_and_generic_movement_guard())
