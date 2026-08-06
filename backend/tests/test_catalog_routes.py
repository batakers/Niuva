import asyncio
import types

import httpx
import pytest
from fastapi import APIRouter, Depends, FastAPI, Header, HTTPException
from pymongo.errors import DuplicateKeyError, PyMongoError

from catalog_routes import build_catalog_router
from catalog_service import CatalogError, CatalogService
from permissions import ROLE_POLICY_VERSION, has_permission
from transaction_api import transaction_unavailable_handler
from transaction_execution import TransactionExecutor, TransactionUnavailableError
from transaction_guard import TransactionMutationGuard


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction=None):
        declarations = key if isinstance(key, list) else [(key, direction)]
        for field, field_direction in reversed(declarations):
            self.items.sort(
                key=lambda item: item.get(field, 0),
                reverse=field_direction < 0,
            )
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
            if key == "$or":
                if not any(cls.matches(item, branch) for branch in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$in" in expected and actual not in expected["$in"]:
                    return False
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                if "$lt" in expected and not (
                    actual is not None and actual < expected["$lt"]
                ):
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

    def find(self, query, projection=None, **_options):
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
        "materials",
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
    """Mirrors the driver surface TransactionExecutor drives."""

    def __init__(self):
        self.in_transaction = False
        self.committed = 0
        self.aborted = 0
        self.ended = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    def start_transaction(self):
        self.in_transaction = True
        return FakeTransaction()

    async def commit_transaction(self):
        self.in_transaction = False
        self.committed += 1

    async def abort_transaction(self):
        self.in_transaction = False
        self.aborted += 1

    async def end_session(self):
        self.ended = True


class FakeClient:
    def __init__(self):
        self.sessions = []

    async def start_session(self):
        session = FakeSession()
        self.sessions.append(session)
        return session


class RecordingSink:
    def __init__(self):
        self.events = []

    def __call__(self, event, fields):
        self.events.append((event, fields["operation_name"]))


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


def build_test_context():
    db = FakeDatabase()
    client = FakeClient()
    capabilities = types.SimpleNamespace(transactions=True)
    sink = RecordingSink()
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: capabilities, event_sink=sink)
    )
    app = FastAPI()
    app.state.transaction_guard = guard
    app.state.transaction_events = sink.events
    app.add_exception_handler(
        TransactionUnavailableError, transaction_unavailable_handler
    )
    api = APIRouter(prefix="/api")
    api.include_router(
        build_catalog_router(
            get_db=lambda: db,
            get_client=lambda: client,
            get_capabilities=lambda: capabilities,
            get_guard=lambda: guard,
            require_permission=permission_dependency,
        )
    )
    app.include_router(api)
    return app, db, capabilities


def build_catalog_service():
    db = FakeDatabase()
    client = FakeClient()
    capabilities = types.SimpleNamespace(transactions=True)
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: capabilities)
    )
    return CatalogService(db, client, capabilities, guard), db


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
    candidate = await api.post(
        f"/api/admin/products/{product.json()['id']}/validate",
        json={"reason": "Submit reviewed publication candidate"},
        headers=headers(),
    )
    assert candidate.status_code == 200
    assert candidate.json()["workflow_status"] == "validated"
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

        # The mutation must reach MongoDB through the shared central boundary,
        # not through a session the service opened for itself.
        events = app.state.transaction_guard.executor.event_sink.events
        assert ("transaction_start", "catalog.publish_product") in events
        assert ("transaction_commit", "catalog.publish_product") in events

        public = await api.get("/api/catalog/products/desk-sign")
        assert public.status_code == 200
        body = public.json()
        assert body["product"]["slug"] == "desk-sign"
        assert body["variants"][0]["stock_status"] == "out_of_stock"
        assert body["cta_state"] == "discovery_only"
        listing = await api.get("/api/catalog/products?limit=24")
        assert listing.status_code == 200
        assert listing.json()["next_cursor"] is None
        assert listing.json()["items"][0]["product"]["slug"] == "desk-sign"
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


async def run_catalog_crud_uses_shared_transaction_boundary():
    app, db, capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        created = await api.post(
            "/api/admin/categories",
            json={"name": "Atomic", "slug": "atomic"},
            headers=headers(),
        )
        assert created.status_code == 201
        assert (
            "transaction_start",
            "catalog.create_category",
        ) in app.state.transaction_events
        assert (
            "transaction_commit",
            "catalog.create_category",
        ) in app.state.transaction_events

        capabilities.transactions = False
        rejected = await api.post(
            "/api/admin/categories",
            json={"name": "Rejected", "slug": "rejected"},
            headers=headers(),
        )
        assert rejected.status_code == 503
        assert rejected.json()["detail"]["code"] == "transaction_unavailable"
        assert not any(item["slug"] == "rejected" for item in db.categories.items)
        assert (
            "transaction_rejected",
            "catalog.create_category",
        ) in app.state.transaction_events


def test_catalog_crud_uses_shared_transaction_boundary_and_fails_closed():
    asyncio.run(run_catalog_crud_uses_shared_transaction_boundary())


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


async def run_concurrent_slug_insert_conflicts_are_translated():
    actor = {"id": "actor-super_admin"}

    category_service, category_db = build_catalog_service()

    async def duplicate_slug(*_args, **_kwargs):
        raise DuplicateKeyError(
            "duplicate slug",
            11000,
            {"keyPattern": {"slug": 1}, "keyValue": {"slug": "concurrent"}},
        )

    category_db.categories.insert_one = duplicate_slug
    with pytest.raises(CatalogError) as category_conflict:
        await category_service.create_category(
            {"name": "Concurrent", "slug": "concurrent"},
            actor,
        )
    assert category_conflict.value.status_code == 409
    assert category_conflict.value.code == "slug_conflict"

    product_service, product_db = build_catalog_service()
    product_db.categories.items.append(
        {
            "id": "category-1",
            "name": "Catalog",
            "slug": "catalog",
            "updated_at": "2026-07-30T00:00:00+00:00",
        }
    )
    product_db.products.insert_one = duplicate_slug
    with pytest.raises(CatalogError) as product_conflict:
        await product_service.create_product(
            {
                "category_id": "category-1",
                "name": "Concurrent Product",
                "slug": "concurrent-product",
            },
            actor,
        )
    assert product_conflict.value.status_code == 409
    assert product_conflict.value.code == "slug_conflict"

    unrelated_service, unrelated_db = build_catalog_service()

    async def duplicate_id(*_args, **_kwargs):
        raise DuplicateKeyError(
            "duplicate id",
            11000,
            {"keyPattern": {"_id": 1}, "keyValue": {"_id": "duplicate"}},
        )

    unrelated_db.categories.insert_one = duplicate_id
    with pytest.raises(DuplicateKeyError):
        await unrelated_service.create_category(
            {"name": "Duplicate ID", "slug": "duplicate-id"},
            actor,
        )

    database_service, database_db = build_catalog_service()

    async def database_failure(*_args, **_kwargs):
        raise PyMongoError("database unavailable")

    database_db.categories.insert_one = database_failure
    with pytest.raises(PyMongoError):
        await database_service.create_category(
            {"name": "Database Failure", "slug": "database-failure"},
            actor,
        )


def test_concurrent_slug_insert_conflicts_are_translated():
    asyncio.run(run_concurrent_slug_insert_conflicts_are_translated())


async def run_catalog_updates_reject_stale_pre_transaction_reads():
    actor = {"id": "actor-super_admin"}

    async def missed_compare_and_swap(*_args, **_kwargs):
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    category_service, category_db = build_catalog_service()
    category_db.categories.items.append(
        {
            "id": "category-1",
            "name": "Catalog",
            "slug": "catalog",
            "status": "active",
            "updated_at": "2026-07-30T00:00:00+00:00",
        }
    )
    category_db.categories.update_one = missed_compare_and_swap
    with pytest.raises(CatalogError) as category_update_conflict:
        await category_service.update_category(
            "category-1",
            {"name": "Updated Catalog", "slug": "updated-catalog"},
            actor,
        )
    assert category_update_conflict.value.code == "version_conflict"

    with pytest.raises(CatalogError) as category_archive_conflict:
        await category_service.archive_category(
            "category-1",
            actor,
            "Concurrent archive",
        )
    assert category_archive_conflict.value.code == "version_conflict"

    product_service, product_db = build_catalog_service()
    product_db.categories.items.append(
        {
            "id": "category-1",
            "name": "Catalog",
            "slug": "catalog",
            "updated_at": "2026-07-30T00:00:00+00:00",
        }
    )
    product_db.products.items.append(
        {
            "id": "product-1",
            "category_id": "category-1",
            "name": "Product",
            "slug": "product",
            "workflow_status": "published",
            "active_publication_id": "publication-1",
            "updated_at": "2026-07-30T00:00:00+00:00",
        }
    )
    product_db.products.update_one = missed_compare_and_swap
    with pytest.raises(CatalogError) as product_update_conflict:
        await product_service.update_product(
            "product-1",
            {
                "category_id": "category-1",
                "name": "Updated Product",
                "slug": "updated-product",
            },
            actor,
        )
    assert product_update_conflict.value.code == "version_conflict"

    with pytest.raises(CatalogError) as product_archive_conflict:
        await product_service.archive_product(
            "product-1",
            actor,
            "Concurrent archive",
        )
    assert product_archive_conflict.value.code == "version_conflict"


def test_catalog_updates_reject_stale_pre_transaction_reads():
    asyncio.run(run_catalog_updates_reject_stale_pre_transaction_reads())


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
        duplicate = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Concurrent duplicate publication"},
            headers=headers(),
        )
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"]["code"] == "catalog_publication_conflict"

        changed = await api.put(
            f"/api/admin/products/{product['id']}",
            json={**product, "name": "Desk Sign Revised"},
            headers=headers(),
        )
        assert changed.status_code == 200
        public_before = await api.get("/api/catalog/products/desk-sign")
        assert public_before.json()["product"]["name"] == "Desk Sign"
        stale_candidate = await api.post(
            f"/api/admin/products/{product['id']}/publish",
            json={"reason": "Must not publish an edited draft"},
            headers=headers(),
        )
        assert stale_candidate.status_code == 409
        assert stale_candidate.json()["detail"]["code"] == "catalog_candidate_required"
        candidate = await api.post(
            f"/api/admin/products/{product['id']}/validate",
            json={"reason": "Submit revised publication candidate"},
            headers=headers(),
        )
        assert candidate.status_code == 200

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
        category = await api.post("/api/admin/categories", json={"name": "Operations Drafts", "slug": "operations-drafts"}, headers=headers("catalog_manager"))
        assert category.status_code == 201
        priced_draft = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Operations Product", "short_description": "Draft copy", "description": "Draft description", "media": [{"storage_path": "catalog/draft.webp", "alt": "Draft"}], "pricing_mode": "fixed", "price_from": 50000, "currency": "IDR", "pricing_rule_reference": "rule-private"}, headers=headers("catalog_manager"))
        assert priced_draft.status_code == 201
        assert priced_draft.json()["price_from"] == 50000
        draft = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Operations Draft", "short_description": "Draft copy", "description": "Draft description", "media": [{"storage_path": "catalog/draft.webp", "alt": "Draft"}]}, headers=headers("catalog_manager"))
        assert draft.status_code == 201, draft.text
        priced = await api.post("/api/admin/products", json={"category_id": category.json()["id"], "name": "Owner Priced Product", "short_description": "Original", "description": "Original description", "pricing_mode": "fixed", "price_from": 75000, "currency": "IDR"}, headers=headers("super_admin"))
        assert priced.status_code == 201
        operations_update = await api.put(f"/api/admin/products/{priced.json()['id']}", json={"category_id": category.json()["id"], "name": "Owner Priced Product", "short_description": "Operations edit", "description": "Updated description"}, headers=headers("catalog_manager"))
        assert operations_update.status_code == 200, operations_update.text
        assert operations_update.json()["pricing_mode"] == "fixed"
        assert operations_update.json()["price_from"] == 75000
        priced_variant = await api.put(f"/api/admin/products/{draft.json()['id']}/variants", json={"variants": [{"sku": "OPS-DRAFT", "name": "Draft", "fixed_price": 50000, "currency": "IDR", "production_type": "made_to_order"}]}, headers=headers("catalog_manager"))
        assert priced_variant.status_code == 200
        assert priced_variant.json()[0]["fixed_price"] == 50000
        candidate = await api.post(
            f"/api/admin/products/{draft.json()['id']}/validate",
            json={"reason": "Catalog manager submits reviewed candidate"},
            headers=headers("catalog_manager"),
        )
        assert candidate.status_code == 200
        assert candidate.json()["workflow_status"] == "validated"
        assert (await api.post(f"/api/admin/products/{draft.json()['id']}/publish", json={"reason": "Operations cannot publish"}, headers=headers("catalog_manager"))).status_code == 403
        approved = await api.post(
            f"/api/admin/products/{draft.json()['id']}/publish",
            json={"reason": "Manager approves catalog candidate"},
            headers=headers("manager_approver"),
        )
        assert approved.status_code == 200
        assert (await api.post(f"/api/admin/products/{draft.json()['id']}/archive", json={"reason": "Operations cannot archive"}, headers=headers("catalog_manager"))).status_code == 403


def test_catalog_manager_can_edit_draft_pricing_but_cannot_publish():
    asyncio.run(run_operations_catalog_field_boundary())


async def run_operations_catalog_lifecycle_and_variant_boundaries():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        owner = headers("super_admin")
        operations = headers("catalog_manager")
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
        variant = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"sku": "ARCHIVED-VARIANT", "name": "Original", "fixed_price": 50000, "currency": "IDR", "production_type": "made_to_order"}]}, headers=owner)
        assert variant.status_code == 200
        variant_update = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"id": variant.json()[0]["id"], "sku": "ARCHIVED-VARIANT", "name": "Operations rename", "production_type": "made_to_order"}]}, headers=operations)
        assert variant_update.status_code == 200
        assert variant_update.json()[0]["fixed_price"] == 50000
        assert variant_update.json()[0]["currency"] == "IDR"
        sku_resolved = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"sku": "ARCHIVED-VARIANT", "name": "SKU resolved edit", "production_type": "made_to_order"}]}, headers=operations)
        assert sku_resolved.status_code == 200
        assert sku_resolved.json()[0]["fixed_price"] == 50000
        assert sku_resolved.json()[0]["currency"] == "IDR"
        assert sku_resolved.json()[0]["status"] == "active"
        operations_created = await api.put(f"/api/admin/products/{product_id}/variants", json={"variants": [{"sku": "OPS-NEW-VARIANT", "name": "Operations created", "production_type": "made_to_order"}]}, headers=operations)
        assert operations_created.status_code == 200
        new_variant = operations_created.json()[0]
        assert new_variant["status"] == "active"
        assert new_variant["currency"] == "IDR"
        assert new_variant["fixed_price"] is None
        operations_option = await api.put(f"/api/admin/products/{product_id}/options", json={"options": [{"code": "ops_finish", "label": "Operations finish", "type": "select", "allowed_values": ["matte"], "required": True}]}, headers=operations)
        assert operations_option.status_code == 200
        new_option = operations_option.json()[0]
        assert not {"fixed_price", "currency", "status"}.intersection(new_option)


def test_operations_catalog_lifecycle_and_variant_boundaries():
    asyncio.run(run_operations_catalog_lifecycle_and_variant_boundaries())
async def run_operations_cannot_change_archived_products_or_variants():
    app, db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        category, product = await create_publishable_product(api)
        owner = headers("super_admin")
        operations = headers("catalog_manager")
        await db.products.update_one(
            {"id": product["id"]}, {"$set": {"workflow_status": "archived"}}
        )

        owner_update = await api.put(
            f"/api/admin/products/{product['id']}",
            json={"category_id": category["id"], "name": "Owner archived update"},
            headers=owner,
        )
        assert owner_update.status_code == 200
        assert owner_update.json()["workflow_status"] == "archived"
        blocked_product = await api.put(
            f"/api/admin/products/{product['id']}",
            json={"category_id": category["id"], "name": "Archived product"},
            headers=operations,
        )
        assert blocked_product.status_code == 403
        assert blocked_product.json()["detail"]["code"] == "catalog_lifecycle_forbidden"

        owner_variant = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [{"sku": "ARCHIVED-OWNER", "name": "Owner variant", "production_type": "made_to_order", "status": "active"}]},
            headers=owner,
        )
        assert owner_variant.status_code == 200
        blocked_variant = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [{"id": owner_variant.json()[0]["id"], "sku": "ARCHIVED-OWNER", "name": "Operations rename", "production_type": "made_to_order"}]},
            headers=operations,
        )
        assert blocked_variant.status_code == 403
        assert blocked_variant.json()["detail"]["code"] == "catalog_lifecycle_forbidden"


def test_operations_cannot_change_archived_products_or_variants():
    asyncio.run(run_operations_cannot_change_archived_products_or_variants())


async def run_operations_cannot_set_variant_status_without_publish_permission():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        _category, product = await create_publishable_product(api)
        variant_payload = {
            "sku": "OPS-STATUS",
            "name": "Operations status attempt",
            "production_type": "made_to_order",
            "status": "archived",
        }
        blocked = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [variant_payload]},
            headers=headers("catalog_manager"),
        )
        assert blocked.status_code == 403
        assert blocked.json()["detail"] == {
            "code": "catalog_lifecycle_forbidden",
            "field": "status",
            "message": "Only an approver can change variant lifecycle.",
        }

        allowed = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json={"variants": [variant_payload]},
            headers=headers("super_admin"),
        )
        assert allowed.status_code == 200
        assert allowed.json()[0]["status"] == "archived"


def test_variant_status_requires_catalog_publish_permission():
    asyncio.run(run_operations_cannot_set_variant_status_without_publish_permission())


async def run_bulk_archive_reports_per_item_results():
    app, _db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        _category, product = await create_publishable_product(api)

        forbidden = await api.post(
            "/api/admin/products/bulk-archive",
            json={"product_ids": [product["id"]], "reason": "Warehouse cannot archive"},
            headers=headers("warehouse"),
        )
        assert forbidden.status_code == 403

        result = await api.post(
            "/api/admin/products/bulk-archive",
            json={"product_ids": [product["id"], "missing-product"], "reason": "Bulk archive cleanup"},
            headers=headers(),
        )
        assert result.status_code == 200
        rows = {row["id"]: row for row in result.json()["results"]}
        assert rows[product["id"]]["success"] is True
        assert rows["missing-product"]["success"] is False
        assert rows["missing-product"]["error"] is not None

        public = await api.get("/api/catalog/products/desk-sign")
        assert public.status_code == 404


def test_bulk_archive_reports_per_item_results_and_requires_permission():
    asyncio.run(run_bulk_archive_reports_per_item_results())
