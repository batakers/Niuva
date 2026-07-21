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
            "status": "active",
            "access_state": "approved",
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


def headers(role="super_admin"):
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


async def run_variant_and_option_identity_are_stable():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        _category, product = await create_publishable_product(api)
        aggregate = await api.get(f"/api/admin/products/{product['id']}", headers=headers())
        variant = aggregate.json()["variants"][0]
        renamed_variant = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [{**variant, "id": variant["id"], "sku": "SIGN-AZURE", "name": "Azure"}]},
            headers=headers(),
        )
        assert renamed_variant.status_code == 200
        after_variant = await api.get(f"/api/admin/products/{product['id']}", headers=headers())
        matching_variants = [item for item in after_variant.json()["variants"] if item["id"] == variant["id"]]
        assert len(matching_variants) == 1
        assert matching_variants[0]["sku"] == "SIGN-AZURE"

        created_options = await api.put(
            f"/api/admin/products/{product['id']}/options",
            json={"options": [{"code": "finish", "label": "Finish", "type": "select", "allowed_values": ["matte", "glossy"], "required": True}]},
            headers=headers(),
        )
        assert created_options.status_code == 200
        option = created_options.json()[0]
        renamed_option = await api.put(
            f"/api/admin/products/{product['id']}/options",
            json={"options": [{**option, "id": option["id"], "code": "surface_finish", "label": "Surface finish"}]},
            headers=headers(),
        )
        assert renamed_option.status_code == 200
        after_option = await api.get(f"/api/admin/products/{product['id']}", headers=headers())
        matching_options = [item for item in after_option.json()["options"] if item["id"] == option["id"]]
        assert len(matching_options) == 1
        assert matching_options[0]["code"] == "surface_finish"


def test_variant_and_option_renames_preserve_child_identity():
    asyncio.run(run_variant_and_option_identity_are_stable())


async def run_variant_conflicts_are_preflighted_before_writes():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        category, product = await create_publishable_product(api)
        original = (await api.get(f"/api/admin/products/{product['id']}", headers=headers())).json()["variants"][0]
        other_product = await api.post(
            "/api/admin/products",
            json={
                "category_id": category["id"], "name": "Other Sign", "slug": "other-sign",
                "short_description": "Other custom sign", "description": "Other printed sign",
                "media": [{"storage_path": "catalog/other.webp", "alt": "Other sign"}],
                "pricing_mode": "fixed", "price_from": 60000, "currency": "IDR",
                "pricing_rule_reference": None, "retail_cta_enabled": True,
                "b2b_cta_enabled": True, "stock_visibility": "status_only",
            },
            headers=headers(),
        )
        assert other_product.status_code == 201
        other_variant = await api.put(
            f"/api/admin/products/{other_product.json()['id']}/variants",
            json={"variants": [{
                "sku": "OTHER-BLACK", "name": "Black", "fixed_price": 60000,
                "currency": "IDR", "production_type": "ready_stock",
                "inventory_tracking_enabled": True, "reorder_point": "1", "status": "active",
            }]},
            headers=headers(),
        )
        assert other_variant.status_code == 200
        conflicted = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [
                {**original, "id": original["id"], "sku": "SIGN-RENAMED"},
                {"sku": "OTHER-BLACK", "name": "Conflicting", "fixed_price": 60000,
                 "currency": "IDR", "production_type": "ready_stock",
                 "inventory_tracking_enabled": True, "reorder_point": "1", "status": "active"},
            ]},
            headers=headers(),
        )
        assert conflicted.status_code == 409
        own_variants = (await api.get(f"/api/admin/products/{product['id']}", headers=headers())).json()["variants"]
        matching = [item for item in own_variants if item["id"] == original["id"]]
        assert len(matching) == 1
        assert matching[0]["sku"] == "SIGN-BLUE"


def test_variant_conflicts_do_not_partially_replace_children():
    asyncio.run(run_variant_conflicts_are_preflighted_before_writes())


async def run_resolved_child_ids_must_remain_unique():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        _category, product = await create_publishable_product(api)
        aggregate = (await api.get(f"/api/admin/products/{product['id']}", headers=headers())).json()
        variant = aggregate["variants"][0]
        variant_conflict = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [
                {**variant, "id": variant["id"], "sku": "SIGN-RENAMED"},
                {"sku": "SIGN-BLUE", "name": "Reused old SKU", "fixed_price": 50000,
                 "currency": "IDR", "production_type": "ready_stock",
                 "inventory_tracking_enabled": True, "reorder_point": "2", "status": "active"},
            ]},
            headers=headers(),
        )
        assert variant_conflict.status_code == 409
        assert variant_conflict.json()["detail"]["code"] == "child_identity_conflict"
        unchanged_variants = (await api.get(f"/api/admin/products/{product['id']}", headers=headers())).json()["variants"]
        assert [(item["id"], item["sku"]) for item in unchanged_variants] == [(variant["id"], "SIGN-BLUE")]

        created_options = await api.put(
            f"/api/admin/products/{product['id']}/options",
            json={"options": [{
                "code": "finish", "label": "Finish", "type": "select",
                "allowed_values": ["matte", "glossy"], "required": True,
            }]},
            headers=headers(),
        )
        assert created_options.status_code == 200
        option = created_options.json()[0]
        option_conflict = await api.put(
            f"/api/admin/products/{product['id']}/options",
            json={"options": [
                {**option, "id": option["id"], "code": "surface_finish"},
                {"code": "finish", "label": "Reused old code", "type": "text", "required": False},
            ]},
            headers=headers(),
        )
        assert option_conflict.status_code == 409
        assert option_conflict.json()["detail"]["code"] == "child_identity_conflict"
        unchanged_options = (await api.get(f"/api/admin/products/{product['id']}", headers=headers())).json()["options"]
        assert [(item["id"], item["code"]) for item in unchanged_options] == [(option["id"], "finish")]


def test_resolved_variant_and_option_ids_cannot_be_reused_in_one_replacement():
    asyncio.run(run_resolved_child_ids_must_remain_unique())


async def run_operations_catalog_field_boundary():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        category = await api.post("/api/admin/categories", json={"name": "Operations Drafts", "slug": "operations-drafts"}, headers=headers("operations"))
        assert category.status_code == 201
        forbidden_product = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Operations Product", "short_description": "Draft copy", "description": "Draft description", "media": [{"storage_path": "catalog/draft.webp", "alt": "Draft"}], "pricing_mode": "fixed", "price_from": 50000, "currency": "IDR", "pricing_rule_reference": "rule-private"}, headers=headers("operations"))
        assert forbidden_product.status_code == 403
        assert forbidden_product.json()["detail"]["code"] == "catalog_field_forbidden"
        assert forbidden_product.json()["detail"]["field"] == "pricing_mode"
        draft = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Operations Draft", "short_description": "Draft copy", "description": "Draft description", "media": [{"storage_path": "catalog/draft.webp", "alt": "Draft"}]}, headers=headers("operations"))
        assert draft.status_code == 201, draft.text
        priced = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Owner Priced Product", "short_description": "Original", "description": "Original description", "pricing_mode": "fixed", "price_from": 75000, "currency": "IDR"}, headers=headers("super_admin"))
        assert priced.status_code == 201
        operations_update = await api.put(f"/api/admin/products/{priced.json()['id']}", json={"category_id": category.json()["id"], "name": "Owner Priced Product", "short_description": "Operations edit", "description": "Updated description"}, headers=headers("operations"))
        assert operations_update.status_code == 200, operations_update.text
        assert operations_update.json()["pricing_mode"] == "fixed"
        assert operations_update.json()["price_from"] == 75000
        forbidden_variant = await api.put(f"/api/admin/products/{draft.json()['id']}/variants", json={"variants": [{"sku": "OPS-DRAFT", "name": "Draft", "fixed_price": 50000, "currency": "IDR", "production_type": "made_to_order"}]}, headers=headers("operations"))
        assert forbidden_variant.status_code == 403
        assert forbidden_variant.json()["detail"]["code"] == "catalog_field_forbidden"
        assert (await api.post(f"/api/admin/products/{draft.json()['id']}/publish", json={"reason": "Operations cannot publish"}, headers=headers("operations"))).status_code == 403
        assert (await api.post(f"/api/admin/products/{draft.json()['id']}/archive", json={"reason": "Operations cannot archive"}, headers=headers("operations"))).status_code == 403


def test_operations_can_edit_catalog_drafts_without_pricing_or_publish_authority():
    asyncio.run(run_operations_catalog_field_boundary())


async def run_operations_catalog_lifecycle_and_variant_boundaries():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        owner = headers("super_admin")
        operations = headers("operations")
        archived_create = await api.post("/api/admin/categories", json={"name": "Archived attempt", "status": "archived"}, headers=operations)
        assert archived_create.status_code == 403
        category = await api.post("/api/admin/categories", json={"name": "Lifecycle Category"}, headers=owner)
        assert category.status_code == 201
        category_id = category.json()["id"]
        status_change = await api.put(f"/api/admin/categories/{category_id}", json={"name": "Lifecycle Category", "status": "archived"}, headers=operations)
        assert status_change.status_code == 403
        descriptive = await api.put(f"/api/admin/categories/{category_id}", json={"name": "Lifecycle Category Edited", "description": "Operations description"}, headers=operations)
        assert descriptive.status_code == 200
        assert descriptive.json()["status"] == "active"
        archived = await api.post(f"/api/admin/categories/{category_id}/archive", json={"reason": "Owner archive"}, headers=owner)
        assert archived.status_code == 200
        blocked_archived_update = await api.put(f"/api/admin/categories/{category_id}", json={"name": "Must not edit archived"}, headers=operations)
        assert blocked_archived_update.status_code == 403
        product = await api.post("/api/admin/products", json={"category_id": category_id, "name": "Archived Workflow Product", "pricing_mode": "fixed", "price_from": 50000, "currency": "IDR"}, headers=owner)
        assert product.status_code == 201
        product_id = product.json()["id"]
        await _db.products.update_one({"id": product_id}, {"$set": {"workflow_status": "archived"}})
        product_update = await api.put(f"/api/admin/products/{product_id}", json={"category_id": category_id, "name": "Archived Workflow Product", "short_description": "Owner update"}, headers=owner)
        assert product_update.status_code == 200
        assert product_update.json()["workflow_status"] == "archived"
        variant = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"sku": "ARCHIVED-VARIANT", "name": "Original", "fixed_price": 50000, "currency": "IDR", "production_type": "made_to_order"}]}, headers=owner)
        assert variant.status_code == 200
        variant_update = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"id": variant.json()[0]["id"], "sku": "ARCHIVED-VARIANT", "name": "Operations rename", "production_type": "made_to_order"}]}, headers=operations)
        assert variant_update.status_code == 200
        assert variant_update.json()[0]["fixed_price"] == 50000
        assert variant_update.json()[0]["currency"] == "IDR"


def test_operations_catalog_lifecycle_and_variant_boundaries():
    asyncio.run(run_operations_catalog_lifecycle_and_variant_boundaries())