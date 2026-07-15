import asyncio
import importlib
from copy import deepcopy
from types import SimpleNamespace

from catalog_inventory_indexes import INDEX_DECLARATIONS, ensure_catalog_inventory_indexes


migration = importlib.import_module("migrations.002_catalog_material_inventory")


class FakeCursor:
    def __init__(self, items):
        self.items = [deepcopy(item) for item in items]

    async def to_list(self, limit):
        return deepcopy(self.items[:limit])


class FakeCollection:
    def __init__(self, items=None):
        self.items = deepcopy(items or [])
        self.indexes = []

    @staticmethod
    def matches(item, query):
        for key, expected in query.items():
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$exists" in expected and (key in item) != expected["$exists"]:
                    return False
                continue
            if actual != expected:
                return False
        return True

    async def find_one(self, query, projection=None):
        for item in self.items:
            if self.matches(item, query):
                value = deepcopy(item)
                if projection:
                    for key, include in projection.items():
                        if not include:
                            value.pop(key, None)
                return value
        return None

    def find(self, query, projection=None):
        values = []
        for item in self.items:
            if self.matches(item, query):
                value = deepcopy(item)
                if projection:
                    for key, include in projection.items():
                        if not include:
                            value.pop(key, None)
                values.append(value)
        return FakeCursor(values)

    async def update_one(self, query, update):
        for item in self.items:
            if self.matches(item, query):
                item.update(deepcopy(update.get("$set", {})))
                return SimpleNamespace(matched_count=1, modified_count=1)
        return SimpleNamespace(matched_count=0, modified_count=0)

    async def create_index(self, keys, **options):
        self.indexes.append((deepcopy(keys), deepcopy(options)))
        return options.get("name", str(keys))


class FakeDatabase:
    COLLECTIONS = (
        "categories",
        "products",
        "product_variants",
        "materials",
        "catalog_publications",
        "material_price_versions",
        "inventory_balances",
        "stock_movements",
        "inventory_reservations",
        "restock_alerts",
        "orders",
    )

    def __init__(self, *, materials=None, orders=None):
        for name in self.COLLECTIONS:
            setattr(self, name, FakeCollection())
        self.materials = FakeCollection(materials)
        self.orders = FakeCollection(orders)


def legacy_fixture():
    active_id = "11111111-2222-3333-4444-555555555555"
    inactive_id = "legacy-inactive-material"
    db = FakeDatabase(
        materials=[
            {
                "id": active_id,
                "name": "Legacy Active PLA",
                "description": "",
                "color": "White",
                "active": True,
                "created_at": "2026-01-01T00:00:00+00:00",
            },
            {
                "id": inactive_id,
                "name": "Legacy Inactive ABS",
                "description": "",
                "color": "Black",
                "active": False,
                "created_at": "2026-01-02T00:00:00+00:00",
            },
        ],
        orders=[
            {
                "id": "order-1",
                "material_id": active_id,
                "material_name": "Legacy Active PLA",
            }
        ],
    )
    return db, active_id, inactive_id


async def run_dry_run_and_apply_idempotency():
    db, active_id, inactive_id = legacy_fixture()
    materials_before = deepcopy(db.materials.items)
    order_before = deepcopy(db.orders.items[0])

    dry_run = await migration.migrate(db, dry_run=True)
    assert set(dry_run) >= {
        "scanned",
        "changed",
        "already_migrated",
        "needs_review",
        "collisions",
        "failures",
        "dry_run",
    }
    assert dry_run == {
        **dry_run,
        "scanned": 2,
        "changed": 2,
        "already_migrated": 0,
        "needs_review": 2,
        "collisions": 0,
        "failures": 0,
        "dry_run": True,
    }
    assert db.materials.items == materials_before
    assert all(not collection.indexes for collection in vars(db).values() if isinstance(collection, FakeCollection))

    applied = await migration.migrate(db, dry_run=False)
    assert applied["changed"] == 2
    assert applied["dry_run"] is False
    active = await db.materials.find_one({"id": active_id})
    inactive = await db.materials.find_one({"id": inactive_id})
    assert active["id"] == active_id
    assert inactive["id"] == inactive_id
    assert active["status"] == "active"
    assert inactive["status"] == "archived"
    assert active["setup_status"] == inactive["setup_status"] == "needs_review"
    assert active["sku"] == migration.legacy_material_sku(active_id)
    assert inactive["sku"] == migration.legacy_material_sku(inactive_id)
    assert active["sku"] != inactive["sku"]
    assert db.orders.items[0] == order_before
    assert db.material_price_versions.items == []
    assert db.inventory_balances.items == []

    second = await migration.migrate(db, dry_run=False)
    assert second["changed"] == 0
    assert second["already_migrated"] == 2
    assert db.orders.items[0]["material_id"] == active_id


def test_migration_is_dry_run_first_idempotent_and_preserves_references():
    asyncio.run(run_dry_run_and_apply_idempotency())


async def run_collision_preflight():
    db, active_id, _inactive_id = legacy_fixture()
    collision_sku = migration.legacy_material_sku(active_id)
    db.materials.items.append(
        {
            "id": "already-new-material",
            "name": "Conflicting New Material",
            "sku": collision_sku,
            "setup_status": "ready",
            "base_unit": "kg",
            "status": "active",
            "active": True,
        }
    )
    before = deepcopy(db.materials.items)
    report = await migration.migrate(db, dry_run=False)
    assert report["collisions"] == 1
    assert report["failures"] == 1
    assert active_id in report["affected_material_ids"]
    assert report["changed"] == 0
    assert db.materials.items == before
    assert all(not collection.indexes for collection in vars(db).values() if isinstance(collection, FakeCollection))


def test_deterministic_sku_collision_blocks_every_write():
    asyncio.run(run_collision_preflight())


async def run_index_declarations():
    db = FakeDatabase()
    await ensure_catalog_inventory_indexes(db)
    names = {
        options["name"]
        for collection in vars(db).values()
        if isinstance(collection, FakeCollection)
        for _keys, options in collection.indexes
    }
    assert names == {declaration["options"]["name"] for declaration in INDEX_DECLARATIONS}
    assert {
        "uq_category_slug",
        "uq_product_slug",
        "uq_product_variant_sku",
        "uq_material_sku",
        "uq_catalog_publication_revision",
        "uq_material_price_effective_from",
        "uq_inventory_subject",
        "uq_stock_movement_operation",
        "ix_stock_movement_subject_created",
        "uq_inventory_reservation_id",
        "ix_inventory_reservation_reference_status",
        "uq_active_restock_deduplication",
    } == names
    assert next(
        item for item in INDEX_DECLARATIONS if item["options"]["name"] == "uq_material_sku"
    )["options"]["partialFilterExpression"] == {"sku": {"$type": "string"}}
    assert next(
        item for item in INDEX_DECLARATIONS if item["options"]["name"] == "uq_active_restock_deduplication"
    )["options"]["partialFilterExpression"] == {"status": "active"}


def test_shared_index_declarations_match_locked_design():
    asyncio.run(run_index_declarations())
