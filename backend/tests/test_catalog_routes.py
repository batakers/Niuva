import asyncio
import types

import httpx
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException

from catalog_routes import build_catalog_router
from permissions import has_permission


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, 0), reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class FakeCollection:
    def __init__(self):
        self.items = []

    @classmethod
    def matches(cls, item, query):
        for key, expected in query.items():
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$in" in expected and actual not in expected["$in"]:
                    return False
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                continue
            if actual != expected:
                return False
        return True

    @staticmethod
    def project(item, projection):
        result = dict(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None, **_options):
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
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self.matches(item, query):
                item.update(update.get("$set", {}))
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)


class FakeDatabase:
    COLLECTIONS = (
        "categories",
        "products",
        "product_variants",
        "configuration_options",
        "catalog_publications",
        "inventory_balances",
        "audit_events",
    )

    def __init__(self):
        for name in self.COLLECTIONS:
            setattr(self, name, FakeCollection())


class FakeTransaction:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeSession:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    def start_transaction(self):
        return FakeTransaction()


class FakeClient:
    async def start_session(self):
        return FakeSession()


def permission_dependency(permission):
    async def dependency(x_role: str = Header(default="retail_customer")):
        actor = {
            "id": f"actor-{x_role}",
            "email": f"{x_role}@niuva.test",
            "roles": [x_role],
        }
        if not has_permission(actor, permission):
            raise HTTPException(status_code=403, detail="Permission denied")
        return actor

    return dependency


def build_test_context():
    db = FakeDatabase()
    client = FakeClient()
    capabilities = types.SimpleNamespace(transactions=True)
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(
        build_catalog_router(
            get_db=lambda: db,
            get_client=lambda: client,
            get_capabilities=lambda: capabilities,
            require_permission=permission_dependency,
        )
    )
    app.include_router(api)
    return app, db, capabilities


def headers(role="catalog_manager"):
    return {"X-Role": role}


async def create_publishable_product(api):
    category = await api.post(
        "/api/admin/categories",
        json={
            "name": "Ready Stock",
            "slug": "ready-stock",
            "description": "Ready products",
            "sort_order": 1,
        },
        headers=headers(),
    )
    assert category.status_code == 201

    product = await api.post(
        "/api/admin/products",
        json={
            "category_id": category.json()["id"],
            "name": "Desk Sign",
            "slug": "desk-sign",
            "short_description": "Custom sign",
            "description": "Printed sign",
            "media": [
                {"storage_path": "catalog/sign.webp", "alt": "Desk sign"}
            ],
            "pricing_mode": "fixed",
            "price_from": 50000,
            "currency": "IDR",
            "pricing_rule_reference": None,
            "retail_cta_enabled": True,
            "b2b_cta_enabled": True,
            "stock_visibility": "status_only",
        },
        headers=headers(),
    )
    assert product.status_code == 201

    variants = await api.put(
        f"/api/admin/products/{product.json()['id']}/variants",
        json={
            "variants": [
                {
                    "sku": "SIGN-BLUE",
                    "name": "Blue",
                    "fixed_price": 50000,
                    "currency": "IDR",
                    "production_type": "ready_stock",
                    "inventory_tracking_enabled": True,
                    "reorder_point": "2",
                    "status": "active",
                }
            ]
        },
        headers=headers(),
    )
    assert variants.status_code == 200
    return category.json(), product.json()


async def run_publish_and_public_boundary():
    app, db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        _category, product = await create_publishable_product(api)
        published = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Initial catalog publication"},
            headers=headers(),
        )
        assert published.status_code == 200
        assert published.json()["revision"] == 1

        public = await api.get("/api/catalog/products/desk-sign")
        assert public.status_code == 200
        body = public.json()
        assert body["product"]["slug"] == "desk-sign"
        assert body["variants"][0]["stock_status"] == "out_of_stock"
        serialized = str(body)
        for internal in (
            "supplier_reference",
            "reorder_point",
            "published_by",
            "publish_reason",
            "actor_user_id",
        ):
            assert internal not in serialized
        assert db.audit_events.items[-1]["action"] == "catalog.product_published"


def test_catalog_publish_and_public_boundary():
    asyncio.run(run_publish_and_public_boundary())


async def run_permission_validation_and_conflicts():
    app, _db, capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        forbidden = await api.post(
            "/api/admin/categories",
            json={"name": "Forbidden", "slug": "forbidden"},
            headers=headers("warehouse"),
        )
        assert forbidden.status_code == 403

        category, product = await create_publishable_product(api)
        duplicate_category = await api.post(
            "/api/admin/categories",
            json={"name": "Duplicate", "slug": category["slug"]},
            headers=headers(),
        )
        assert duplicate_category.status_code == 409
        assert duplicate_category.json()["detail"]["code"] == "slug_conflict"

        invalid_product = await api.post(
            "/api/admin/products",
            json={
                "category_id": category["id"],
                "name": "Incomplete",
                "slug": "incomplete",
                "short_description": "",
                "description": "",
                "media": [],
                "pricing_mode": "fixed",
                "price_from": 0,
                "currency": "IDR",
                "retail_cta_enabled": True,
                "b2b_cta_enabled": False,
                "stock_visibility": "status_only",
            },
            headers=headers(),
        )
        invalid_publish = await api.post(
            f"/api/admin/products/{invalid_product.json()['id']}/publish",
            json={"reason": "Try invalid publication"},
            headers=headers(),
        )
        assert invalid_publish.status_code == 400
        assert invalid_publish.json()["detail"]["code"] == "catalog_invalid"
        assert invalid_publish.json()["detail"]["errors"]

        capabilities.transactions = False
        unavailable = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Database cannot transact"},
            headers=headers(),
        )
        assert unavailable.status_code == 503
        assert unavailable.json()["detail"]["code"] == "transaction_unavailable"


def test_catalog_permissions_validation_conflicts_and_transaction_gate():
    asyncio.run(run_permission_validation_and_conflicts())


async def run_draft_isolation_and_rollback():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        _category, product = await create_publishable_product(api)
        first = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Revision one"},
            headers=headers(),
        )
        assert first.status_code == 200

        changed = await api.put(
            f"/api/admin/products/{product['id']}",
            json={**product, "name": "Desk Sign Revised"},
            headers=headers(),
        )
        assert changed.status_code == 200
        public_before = await api.get("/api/catalog/products/desk-sign")
        assert public_before.json()["product"]["name"] == "Desk Sign"

        second = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Revision two"},
            headers=headers(),
        )
        assert second.json()["revision"] == 2
        assert (await api.get("/api/catalog/products/desk-sign")).json()["product"][
            "name"
        ] == "Desk Sign Revised"

        rollback = await api.post(
            f"/api/admin/products/{product['id']}/rollback",
            json={
                "publication_id": first.json()["id"],
                "reason": "Restore approved revision",
            },
            headers=headers(),
        )
        assert rollback.status_code == 200
        assert rollback.json()["revision"] == 3
        assert (await api.get("/api/catalog/products/desk-sign")).json()["product"][
            "name"
        ] == "Desk Sign"


def test_catalog_draft_isolation_and_rollback_as_new_revision():
    asyncio.run(run_draft_isolation_and_rollback())
