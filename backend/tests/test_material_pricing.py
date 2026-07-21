import asyncio
from datetime import datetime, timezone
from types import SimpleNamespace

import httpx
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException

from material_pricing import resolve_effective_price
from material_routes import build_material_router
from permissions import has_permission


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, ""), reverse=direction < 0)
        return self

    async def to_list(self, limit):
        return [dict(item) for item in self.items[:limit]]


class FakeCollection:
    def __init__(self):
        self.items = []

    @staticmethod
    def matches(item, query):
        for key, expected in query.items():
            actual = item.get(key)
            if isinstance(expected, dict) and "$ne" in expected:
                if actual == expected["$ne"]:
                    return False
            elif actual != expected:
                return False
        return True

    @staticmethod
    def project(item, projection):
        value = dict(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    value.pop(key, None)
        return value

    async def find_one(self, query, projection=None):
        for item in self.items:
            if self.matches(item, query):
                return self.project(item, projection)
        return None

    def find(self, query, projection=None):
        return FakeCursor(
            self.project(item, projection)
            for item in self.items
            if self.matches(item, query)
        )

    async def insert_one(self, item, **_options):
        self.items.append(dict(item))
        return SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self.matches(item, query):
                item.update(update.get("$set", {}))
                return SimpleNamespace(matched_count=1, modified_count=1)
        return SimpleNamespace(matched_count=0, modified_count=0)


class FakeDatabase:
    def __init__(self):
        self.materials = FakeCollection()
        self.material_price_versions = FakeCollection()
        self.audit_events = FakeCollection()


def require_permission(permission):
    async def dependency(
        x_permissions: str = Header(default=""),
        x_actor_id: str = Header(default="staff-1"),
    ):
        permissions = {value.strip() for value in x_permissions.split(",") if value}
        if permission not in permissions:
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
        return {"id": x_actor_id, "email": "staff@niuva.test", "roles": ["staff"], "permissions": permissions}

    return dependency


def build_test_context():
    db = FakeDatabase()
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(
        build_material_router(
            get_db=lambda: db,
            require_permission=require_permission,
            has_permission=lambda actor, permission: permission in actor.get("permissions", set()),
        )
    )
    app.include_router(api)
    return app, db


def headers(*permissions):
    return {"x-permissions": ",".join(permissions), "x-actor-id": "staff-1"}


def test_effective_price_uses_latest_non_future_version():
    versions = [
        {"id": "p1", "amount": 100000, "effective_from": "2026-07-01T00:00:00+00:00"},
        {"id": "p2", "amount": 125000, "effective_from": "2026-08-01T00:00:00+00:00"},
    ]
    at = datetime(2026, 7, 14, tzinfo=timezone.utc)
    assert resolve_effective_price(versions, at=at)["id"] == "p1"


def test_effective_price_is_none_before_first_version():
    versions = [
        {"id": "p1", "amount": 100000, "effective_from": "2026-07-01T00:00:00+00:00"}
    ]
    at = datetime(2026, 6, 14, tzinfo=timezone.utc)
    assert resolve_effective_price(versions, at=at) is None


async def run_material_compatibility_and_pricing_flow():
    app, db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        created = await api.post(
            "/api/admin/materials",
            json={"name": "PLA Legacy", "description": "Existing flow", "color": "White", "active": True},
            headers=headers("materials.write"),
        )
        assert created.status_code == 200, created.text
        material = created.json()
        material_id = material["id"]
        assert material["setup_status"] == "needs_review"
        assert material["active"] is True
        assert material["sku"].startswith("MAT-")

        blocked = await api.post(
            f"/api/admin/materials/{material_id}/price-versions",
            json={
                "amount": 100000,
                "currency": "IDR",
                "price_unit": "kg",
                "effective_from": "2026-07-01T00:00:00+00:00",
                "reason": "Initial official price",
            },
            headers=headers("pricing.write"),
        )
        assert blocked.status_code == 409
        assert blocked.json()["detail"]["code"] == "material_setup_incomplete"

        completed = await api.put(
            f"/api/admin/materials/{material_id}",
            json={
                "sku": "pla-001",
                "name": "PLA Legacy",
                "base_unit": "kg",
                "supplier_reference": "SUPPLIER-PRIVATE",
                "setup_status": "ready",
                "status": "active",
            },
            headers=headers("materials.write", "supplier_reference.write"),
        )
        assert completed.status_code == 200, completed.text
        assert completed.json()["id"] == material_id
        assert completed.json()["sku"] == "PLA-001"

        for amount, effective_from, reason in (
            (100000, "2026-07-01T00:00:00+00:00", "Initial official price"),
            (125000, "2999-08-01T00:00:00+00:00", "Scheduled supplier increase"),
        ):
            appended = await api.post(
                f"/api/admin/materials/{material_id}/price-versions",
                json={
                    "amount": amount,
                    "currency": "IDR",
                    "price_unit": "kg",
                    "effective_from": effective_from,
                    "reason": reason,
                },
                headers=headers("pricing.write"),
            )
            assert appended.status_code == 201, appended.text

        history = await api.get(
            f"/api/admin/materials/{material_id}/price-versions",
            headers=headers("pricing.read"),
        )
        assert history.status_code == 200
        assert len(history.json()) == 2

        effective = await api.get(
            f"/api/admin/materials/{material_id}/effective-price",
            headers=headers("pricing.read"),
        )
        assert effective.status_code == 200
        assert effective.json()["current"]["amount"] == 100000
        assert effective.json()["next_scheduled"]["amount"] == 125000

        immutable_put = await api.put(
            f"/api/admin/materials/{material_id}/price-versions/{history.json()[0]['id']}",
            json={"amount": 1},
            headers=headers("pricing.write"),
        )
        immutable_delete = await api.delete(
            f"/api/admin/materials/{material_id}/price-versions/{history.json()[0]['id']}",
            headers=headers("pricing.write"),
        )
        assert immutable_put.status_code == 404
        assert immutable_delete.status_code == 404

        public = await api.get("/api/materials")
        assert public.status_code == 200
        public_material = next(item for item in public.json() if item["id"] == material_id)
        assert public_material["active"] is True
        assert "supplier_reference" not in public_material
        assert "price" not in public_material

        archived = await api.post(
            f"/api/admin/materials/{material_id}/archive",
            json={"reason": "Material discontinued"},
            headers=headers("materials.archive"),
        )
        assert archived.status_code == 200
        assert archived.json()["id"] == material_id
        assert archived.json()["status"] == "archived"
        assert archived.json()["active"] is False
        assert all(item["id"] != material_id for item in (await api.get("/api/materials")).json())

        assert {event["action"] for event in db.audit_events.items} >= {
            "material.created",
            "material.updated",
            "material.price_version_created",
            "material.archived",
        }


def test_material_compatibility_and_immutable_pricing_routes():
    asyncio.run(run_material_compatibility_and_pricing_flow())


async def run_validation_and_compatibility_aliases():
    app, _db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        invalid_ready = await api.post(
            "/api/admin/materials",
            json={"sku": "ABS-1", "name": "ABS", "setup_status": "ready"},
            headers=headers("materials.write"),
        )
        assert invalid_ready.status_code == 422

        naive_price_material = await api.post(
            "/api/admin/materials",
            json={
                "sku": "ABS-2",
                "name": "ABS Ready",
                "base_unit": "kg",
                "setup_status": "ready",
            },
            headers=headers("materials.write"),
        )
        material_id = naive_price_material.json()["id"]
        naive_price = await api.post(
            f"/api/admin/materials/{material_id}/price-versions",
            json={
                "amount": 90000,
                "currency": "IDR",
                "price_unit": "kg",
                "effective_from": "2026-07-01T00:00:00",
                "reason": "Naive timestamp rejected",
            },
            headers=headers("pricing.write"),
        )
        assert naive_price.status_code == 422

        unit_mismatch = await api.post(
            f"/api/admin/materials/{material_id}/price-versions",
            json={
                "amount": 90000,
                "currency": "IDR",
                "price_unit": "g",
                "effective_from": "2026-07-01T00:00:00+00:00",
                "reason": "Wrong unit rejected",
            },
            headers=headers("pricing.write"),
        )
        assert unit_mismatch.status_code == 400

        deprecated_delete = await api.delete(
            f"/api/admin/materials/{material_id}",
            headers=headers("materials.archive"),
        )
        assert deprecated_delete.status_code == 200
        assert deprecated_delete.headers["deprecation"] == "true"
        assert deprecated_delete.json()["id"] == material_id


def test_material_validation_and_delete_archive_alias():
    asyncio.run(run_validation_and_compatibility_aliases())


async def run_supplier_reference_boundary():
    app, db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        material = await api.post("/api/admin/materials", json={"name": "Private Supplier Material", "supplier_reference": "SUP-001"}, headers=headers("materials.write", "supplier_reference.write"))
        assert material.status_code == 200
        material_id = material.json()["id"]
        operations_list = await api.get("/api/admin/materials", headers=headers("materials.read"))
        assert operations_list.status_code == 200
        assert "supplier_reference" not in operations_list.json()[0]
        forbidden = await api.put(f"/api/admin/materials/{material_id}", json={"supplier_reference": "LEAK"}, headers=headers("materials.write"))
        assert forbidden.status_code == 403
        assert forbidden.json()["detail"]["code"] == "material_field_forbidden"
        assert db.materials.items[0]["supplier_reference"] == "SUP-001"
        commercial_list = await api.get("/api/admin/materials", headers=headers("materials.read", "supplier_reference.read"))
        assert commercial_list.status_code == 200
        assert commercial_list.json()[0]["supplier_reference"] == "SUP-001"


def test_supplier_reference_requires_explicit_read_and_write_capabilities():
    asyncio.run(run_supplier_reference_boundary())


def role_require_permission(permission):
    async def dependency(x_role: str = Header(default="operations")):
        actor = {"id": f"actor-{x_role}", "email": f"{x_role}@niuva.example.com", "roles": [x_role], "status": "active", "access_state": "approved"}
        if not has_permission(actor, permission):
            raise HTTPException(status_code=403, detail=f"Permission required: {permission}")
        return actor
    return dependency


def build_role_test_context():
    db = FakeDatabase()
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(build_material_router(get_db=lambda: db, require_permission=role_require_permission, has_permission=has_permission))
    app.include_router(api)
    return app, db


async def run_real_role_supplier_reference_boundaries():
    app, db = build_role_test_context()
    db.materials.items.append({"id": "material-private", "name": "Private Material", "description": "Original", "supplier_reference": "SUP-001", "status": "active", "active": True, "setup_status": "needs_review", "base_unit": None})
    db.materials.items.append({"id": "material-delete", "name": "Delete Material", "description": "Original", "supplier_reference": "SUP-DELETE", "status": "active", "active": True, "setup_status": "needs_review", "base_unit": None})
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        operations = {"X-Role": "operations"}
        commercial = {"X-Role": "commercial_finance"}
        created = await api.post("/api/admin/materials", json={"name": "Operations Material"}, headers=operations)
        assert created.status_code == 200
        assert "supplier_reference" not in created.json()
        operations_list = await api.get("/api/admin/materials", headers=operations)
        assert operations_list.status_code == 200
        assert all("supplier_reference" not in material for material in operations_list.json())
        updated = await api.put("/api/admin/materials/material-private", json={"description": "Operations update"}, headers=operations)
        assert updated.status_code == 200
        assert "supplier_reference" not in updated.json()
        archived = await api.post("/api/admin/materials/material-private/archive", json={"reason": "Archive this material"}, headers=operations)
        assert archived.status_code == 200
        assert "supplier_reference" not in archived.json()
        deprecated = await api.delete("/api/admin/materials/material-delete", headers=operations)
        assert deprecated.status_code == 200
        assert "supplier_reference" not in deprecated.json()
        assert (await api.get("/api/admin/materials", headers=commercial)).status_code == 403
        supplier = await api.get("/api/admin/materials/material-private/supplier-reference", headers=commercial)
        assert supplier.status_code == 200
        assert supplier.json() == {"id": "material-private", "supplier_reference": "SUP-001"}
        changed = await api.put("/api/admin/materials/material-private/supplier-reference", json={"supplier_reference": "SUP-002"}, headers=commercial)
        assert changed.status_code == 200
        assert changed.json() == {"id": "material-private", "supplier_reference": "SUP-002"}
        assert (await api.get("/api/admin/materials/material-private/supplier-reference", headers=operations)).status_code == 403
        assert (await api.put("/api/admin/materials/material-private/supplier-reference", json={"supplier_reference": "SUP-LEAK"}, headers=operations)).status_code == 403


def test_real_roles_keep_supplier_references_off_generic_material_responses():
    asyncio.run(run_real_role_supplier_reference_boundaries())