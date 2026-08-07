"""Real replica-set evidence for work-order material allocation.

The invariant here is all-or-nothing across several materials at once. A fake
collection cannot abort a transaction, so testing this against fakes would
prove nothing: the assertions would pass whether or not the rollback works.
It is therefore only tested against a real replica set.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone
from decimal import Decimal

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if (
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not MONGO_TRANSACTION_TEST_URL
):
    pytest.skip(
        "Explicit real transaction opt-in and MONGO_TRANSACTION_TEST_URL are required",
        allow_module_level=True,
    )

from b2b_domain import B2BDomainError  # noqa: E402
from b2b_service import B2BService  # noqa: E402
from bson.decimal128 import Decimal128  # noqa: E402
from database_capabilities import probe_database_capabilities  # noqa: E402
from inventory_service import InventoryService  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from transaction_execution import TransactionExecutor  # noqa: E402
from transaction_guard import TransactionMutationGuard  # noqa: E402

ACTOR = {"id": "user-production", "email": "production@niuva.test"}

VARIANT = {
    "id": "var-1",
    "product_id": "prod-1",
    "sku": "SIGN-BLUE",
    "name": "Blue",
    "option_values": {"finish": "matte"},
    "production_type": "made_to_order",
    "bill_of_materials": [
        {"material_id": "mat-ply", "quantity_per_unit": "0.5"},
        {"material_id": "mat-ink", "quantity_per_unit": "2"},
    ],
}
PRODUCT = {"id": "prod-1", "name": "Desk Sign", "slug": "desk-sign"}
MATERIALS = [
    {
        "id": "mat-ply",
        "sku": "PLY-18",
        "name": "Plywood 18mm",
        "base_unit": "sheet",
        "status": "active",
        "setup_status": "ready",
        "inventory_tracking_enabled": True,
    },
    {
        "id": "mat-ink",
        "sku": "INK-BLK",
        "name": "Ink Black",
        "base_unit": "ml",
        "status": "active",
        "setup_status": "ready",
        "inventory_tracking_enabled": True,
    },
]

SUBMISSION = {
    "company": "PT Contoh Industri",
    "pic_name": "Ayu",
    "pic_email": "ayu@example.com",
    "pic_phone": "+628123456789",
    "need": "Prototype enclosure",
    "timeline": "Q4 2026",
    "brief": "Membutuhkan validasi desain dan prototype fungsional.",
}


def operation_id():
    return str(uuid.uuid4())


class Context:
    def __init__(self, client, database_name, capabilities):
        self.client = client
        self.database = client[database_name]
        self.transaction_events = []
        executor = TransactionExecutor(
            client,
            lambda: capabilities,
            event_sink=lambda event, fields: self.transaction_events.append(
                (event, fields["operation_name"])
            ),
        )
        guard = TransactionMutationGuard(executor, lambda: True)
        self.b2b = B2BService(
            db=self.database,
            transaction_guard=guard,
        )
        self.inventory = InventoryService(
            db=self.database,
            client=client,
            capabilities=capabilities,
            guard=guard,
        )


async def build_context(client, database_name):
    capabilities = await probe_database_capabilities(client, database_name)
    assert capabilities.transactions is True
    return Context(client, database_name, capabilities)


async def seed_planned_work_order(context, stock):
    """Quote a catalog line, accept it, open a project, and plan a run."""
    database = context.database
    await database.products.insert_one(dict(PRODUCT))
    await database.product_variants.insert_one(dict(VARIANT))
    for material in MATERIALS:
        await database.materials.insert_one(dict(material))

    b2b = context.b2b
    inquiry = await b2b.create_inquiry(dict(SUBMISSION))
    for target, version in (("reviewed", 1), ("contacted", 2)):
        await b2b.transition_inquiry(
            inquiry["id"],
            target_status=target,
            expected_version=version,
            operation_id=operation_id(),
            reason=f"Menuju {target}",
            actor=ACTOR,
        )
    converted = await b2b.convert_inquiry(
        inquiry["id"],
        expected_version=3,
        operation_id=operation_id(),
        reason="Konversi ke penawaran",
        actor=ACTOR,
    )
    quote = converted["quote"]
    quote = await b2b.create_quote_revision(
        quote["id"],
        expected_version=quote["version"],
        operation_id=operation_id(),
        reason="Initial commercial authoring",
        scope_snapshot=dict(SUBMISSION),
        items=[
            {
                "description": "Desk sign biru",
                "quantity": 4,
                "unit_price_minor": 750000,
                "variant_id": "var-1",
            }
        ],
        total_minor=None,
        actor=ACTOR,
    )
    for target in ("internal_review", "sent"):
        quote = await b2b.transition_quote(
            quote["id"],
            target_status=target,
            expected_version=quote["version"],
            operation_id=operation_id(),
            reason=f"Menuju {target}",
            actor=ACTOR,
        )
    quote = await b2b.accept_quote(
        quote["id"],
        expected_version=quote["version"],
        operation_id=operation_id(),
        reason="Customer approval recorded",
        approver={"name": "Ayu", "identity": "ayu@example.com"},
        accepted_at=datetime.now(timezone.utc),
        channel="email",
        evidence_reference="email-thread-allocation-integration",
        actor=ACTOR,
    )
    created = await b2b.create_project_from_quote(
        quote["id"],
        expected_version=quote["version"],
        operation_id=operation_id(),
        reason="Mulai eksekusi",
        actor=ACTOR,
    )
    project = created["project"]

    for material_id, on_hand in stock.items():
        await context.inventory.apply_operation(
            actor=ACTOR,
            payload={
                "operation_id": operation_id(),
                "subject_type": "material",
                "subject_id": material_id,
                "movement_type": "receive",
                "quantity": on_hand,
                "reference_type": "manual",
                "reference_id": "seed",
                "reason": "Stok awal",
            },
        )

    return await b2b.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id=operation_id(),
        reason="Produksi batch",
        quote_line_id=project["quote_snapshot"]["items"][0]["quote_line_id"],
        quantity=2,
        actor=ACTOR,
    )


async def balances(database):
    """Balances keyed by subject, with quantities as exact Decimals.

    Decimal128 keeps the scale it was written with, so 0 and 0.0 are the same
    number in different clothes. Comparing numerically keeps these assertions
    about quantity rather than formatting.
    """
    documents = await database.inventory_balances.find({}, {"_id": 0}).to_list(50)
    return {
        item["subject_id"]: {
            key: value.to_decimal() if isinstance(value, Decimal128) else value
            for key, value in item.items()
        }
        for item in documents
    }


async def run_allocation_reserves_the_whole_bill(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        context = await build_context(client, database_name)
        work_order = await seed_planned_work_order(
            context, {"mat-ply": "10", "mat-ink": "50"}
        )

        allocated = await context.b2b.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id=operation_id(),
            reason="Alokasi material produksi",
            actor=ACTOR,
            inventory_service=context.inventory,
        )

        assert len(allocated["reservation_ids"]) == 2
        current = await balances(context.database)
        # A run of 2 at 0.5 and 2 per unit.
        assert current["mat-ply"]["reserved"] == Decimal("1.0")
        assert current["mat-ink"]["reserved"] == Decimal("4")
        # Reserving makes stock unavailable; it does not remove it.
        assert current["mat-ply"]["on_hand"] == Decimal("10")
        assert (
            "transaction_start",
            "inventory.apply_bulk_operations",
        ) in context.transaction_events
        assert (
            "transaction_commit",
            "inventory.apply_bulk_operations",
        ) in context.transaction_events
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_shortage_reserves_nothing(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        context = await build_context(client, database_name)
        # Plenty of plywood, not nearly enough ink.
        work_order = await seed_planned_work_order(
            context, {"mat-ply": "10", "mat-ink": "1"}
        )

        with pytest.raises(B2BDomainError) as rejected:
            await context.b2b.allocate_work_order(
                work_order["id"],
                expected_version=work_order["version"],
                operation_id=operation_id(),
                reason="Alokasi material produksi",
                actor=ACTOR,
                inventory_service=context.inventory,
            )
        assert rejected.value.status_code == 409
        assert rejected.value.code == "work_order_material_shortage"
        assert rejected.value.details["lines"][0]["material_id"] == "mat-ink"
        assert rejected.value.details["lines"][0]["deficit"] == "3"

        database = context.database
        current = await balances(database)
        # The plywood line would have succeeded on its own. Nothing survives.
        assert current["mat-ply"]["reserved"] == Decimal("0")
        assert await database.inventory_reservations.count_documents({}) == 0
        assert (
            await database.stock_movements.count_documents({"movement_type": "reserve"})
            == 0
        )

        reloaded = await context.b2b.get_work_order(work_order["id"])
        assert reloaded["reservation_ids"] == []
        assert reloaded["version"] == work_order["version"]

        # The rollback left no trace in inventory, but the stall itself is
        # recorded: an open shortage that survives the aborted transaction.
        open_shortages = await context.b2b.list_material_shortages(status="open")
        assert len(open_shortages) == 1
        assert open_shortages[0]["work_order_id"] == work_order["id"]

        # Material arrives; the retry allocates and clears the queue.
        await context.inventory.apply_operation(
            actor=ACTOR,
            payload={
                "operation_id": operation_id(),
                "subject_type": "material",
                "subject_id": "mat-ink",
                "movement_type": "receive",
                "quantity": "10",
                "reference_type": "manual",
                "reference_id": "restock",
                "reason": "Restock tinta",
            },
        )
        allocated = await context.b2b.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id=operation_id(),
            reason="Alokasi setelah restock",
            actor=ACTOR,
            inventory_service=context.inventory,
        )
        assert len(allocated["reservation_ids"]) == 2
        assert await context.b2b.list_material_shortages(status="open") == []
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_consumption_draws_down_stock(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        context = await build_context(client, database_name)
        b2b = context.b2b
        work_order = await seed_planned_work_order(
            context, {"mat-ply": "10", "mat-ink": "50"}
        )
        allocated = await b2b.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id=operation_id(),
            reason="Alokasi material produksi",
            actor=ACTOR,
            inventory_service=context.inventory,
        )
        started = await b2b.transition_work_order(
            allocated["id"],
            target_status="in_progress",
            expected_version=allocated["version"],
            operation_id=operation_id(),
            reason="Mulai produksi",
            actor=ACTOR,
        )

        # A run holding reservations cannot enter QC.
        with pytest.raises(B2BDomainError) as gated:
            await b2b.transition_work_order(
                started["id"],
                target_status="quality_control",
                expected_version=started["version"],
                operation_id=operation_id(),
                reason="QC tanpa konsumsi",
                actor=ACTOR,
            )
        assert gated.value.code == "work_order_materials_outstanding"

        consumed = await b2b.consume_work_order(
            started["id"],
            expected_version=started["version"],
            operation_id=operation_id(),
            reason="Pemakaian material aktual",
            actor=ACTOR,
            inventory_service=context.inventory,
        )
        assert consumed["materials_consumed"] is True

        current = await balances(context.database)
        # Consuming releases the reservation and removes the stock.
        assert current["mat-ply"]["reserved"] == Decimal("0")
        assert current["mat-ply"]["on_hand"] == Decimal("9.0")
        assert current["mat-ink"]["on_hand"] == Decimal("46")

        awaiting_qc = await b2b.transition_work_order(
            consumed["id"],
            target_status="quality_control",
            expected_version=consumed["version"],
            operation_id=operation_id(),
            reason="Produksi selesai",
            actor=ACTOR,
        )
        completed = await b2b.record_work_order_qc(
            awaiting_qc["id"],
            outcome="passed",
            expected_version=awaiting_qc["version"],
            operation_id=operation_id(),
            reason="Hasil QC sesuai",
            actor={"id": "qc-integration"},
        )
        assert completed["status"] == "completed"
    finally:
        await client.drop_database(database_name)
        client.close()


async def run_replayed_allocation_reserves_once(database_name):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    try:
        context = await build_context(client, database_name)
        work_order = await seed_planned_work_order(
            context, {"mat-ply": "10", "mat-ink": "50"}
        )
        replayed = operation_id()

        first = await context.b2b.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id=replayed,
            reason="Alokasi material produksi",
            actor=ACTOR,
            inventory_service=context.inventory,
        )
        second = await context.b2b.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id=replayed,
            reason="Alokasi material produksi",
            actor=ACTOR,
            inventory_service=context.inventory,
        )

        assert second["reservation_ids"] == first["reservation_ids"]
        assert await context.database.inventory_reservations.count_documents({}) == 2
        current = await balances(context.database)
        assert current["mat-ink"]["reserved"] == Decimal("4")
    finally:
        await client.drop_database(database_name)
        client.close()


def test_allocation_reserves_the_whole_bill(transaction_database_name):
    asyncio.run(run_allocation_reserves_the_whole_bill(transaction_database_name))


def test_a_shortage_leaves_no_partial_allocation(transaction_database_name):
    asyncio.run(run_shortage_reserves_nothing(transaction_database_name))


def test_consumption_releases_reservations_and_draws_down_stock(
    transaction_database_name,
):
    asyncio.run(run_consumption_draws_down_stock(transaction_database_name))


def test_a_replayed_allocation_does_not_reserve_twice(transaction_database_name):
    asyncio.run(run_replayed_allocation_reserves_once(transaction_database_name))
