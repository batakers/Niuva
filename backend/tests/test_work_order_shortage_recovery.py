"""Persistent shortage recovery for work-order allocation.

A shortage used to be a 409 that vanished with the response, so nothing told
the warehouse which runs were stalled waiting for material. These tests cover
the queue around the transaction: recording, refresh, translation, and
resolution. The rollback itself is real replica-set evidence in
test_work_order_allocation_integration, not something a fake can prove.
"""

import asyncio

import pytest

from b2b_domain import B2BDomainError
from b2b_service import B2BService
from inventory_service import InventoryError
from tests.test_b2b_quote_conversion import EnabledGuard, FakeDatabase
from tests.test_b2b_work_orders import active_project


class FakeInventory:
    """Stands in for InventoryService at the seam allocate_work_order uses."""

    def __init__(self, error: InventoryError | None = None):
        self.error = error
        self.calls = 0

    async def apply_bulk_operations(self, *, actor, operations, extra_mutation=None):
        self.calls += 1
        if self.error is not None:
            raise self.error
        results = [
            {"reservation": {"id": f"res-{index}"}}
            for index, _operation in enumerate(operations)
        ]
        if extra_mutation is not None:
            await extra_mutation(None, results)
        return results


def shortage_error() -> InventoryError:
    return InventoryError(
        409,
        "inventory_conflict",
        "inventory protected fields cannot be negative: available",
    )


async def seed_balances(db, quantities):
    for material_id, (on_hand, reserved) in quantities.items():
        await db.inventory_balances.insert_one(
            {
                "id": f"bal-{material_id}",
                "subject_type": "material",
                "subject_id": material_id,
                "on_hand": on_hand,
                "reserved": reserved,
            }
        )


async def planned_work_order(db, service):
    project, actor = await active_project(db, service)
    work_order = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo",
        reason="Produksi batch",
        variant_id="var-1",
        quantity=2,
        actor=actor,
    )
    return work_order, actor


async def run_shortage_is_recorded_with_deficits():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    work_order, actor = await planned_work_order(db, service)
    # Requirements are 1.0 plywood and 4 ink; ink has 1 with nothing reserved.
    await seed_balances(db, {"mat-ply": ("10", "0"), "mat-ink": ("1", "0")})

    with pytest.raises(B2BDomainError) as rejected:
        await service.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id="op-allocate",
            reason="Alokasi material produksi",
            actor=actor,
            inventory_service=FakeInventory(error=shortage_error()),
        )

    assert rejected.value.code == "work_order_material_shortage"
    assert rejected.value.status_code == 409
    # Only the deficient material appears, measured against the live balance.
    assert rejected.value.details["lines"] == [
        {
            "material_id": "mat-ink",
            "sku": "INK-BLK",
            "name": "Ink Black",
            "base_unit": "ml",
            "quantity_required": "4",
            "available": "1",
            "deficit": "3",
        }
    ]

    shortages = await service.list_material_shortages(status="open")
    assert len(shortages) == 1
    assert shortages[0]["work_order_id"] == work_order["id"]
    assert shortages[0]["id"] == rejected.value.details["shortage_id"]


def test_a_shortage_is_recorded_as_an_open_queue_entry():
    asyncio.run(run_shortage_is_recorded_with_deficits())


async def run_repeated_shortage_keeps_one_open_entry():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    work_order, actor = await planned_work_order(db, service)
    await seed_balances(db, {"mat-ply": ("10", "0"), "mat-ink": ("1", "0")})

    for attempt in ("op-first", "op-second"):
        with pytest.raises(B2BDomainError):
            await service.allocate_work_order(
                work_order["id"],
                expected_version=work_order["version"],
                operation_id=attempt,
                reason="Alokasi material produksi",
                actor=actor,
                inventory_service=FakeInventory(error=shortage_error()),
            )

    shortages = await service.list_material_shortages(status="open")
    assert len(shortages) == 1
    # The surviving entry reflects the latest attempt.
    assert shortages[0]["last_operation_id"] == "op-second"


def test_a_stalled_run_holds_one_entry_not_one_per_attempt():
    asyncio.run(run_repeated_shortage_keeps_one_open_entry())


async def run_successful_allocation_resolves_the_shortage():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    work_order, actor = await planned_work_order(db, service)
    await seed_balances(db, {"mat-ply": ("10", "0"), "mat-ink": ("1", "0")})

    with pytest.raises(B2BDomainError):
        await service.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id="op-short",
            reason="Alokasi material produksi",
            actor=actor,
            inventory_service=FakeInventory(error=shortage_error()),
        )

    # Material arrives; the retry succeeds and clears the queue.
    allocated = await service.allocate_work_order(
        work_order["id"],
        expected_version=work_order["version"],
        operation_id="op-retry",
        reason="Alokasi setelah restock",
        actor=actor,
        inventory_service=FakeInventory(),
    )

    assert allocated["reservation_ids"] == ["res-0", "res-1"]
    assert await service.list_material_shortages(status="open") == []
    resolved = await service.list_material_shortages(status="resolved")
    assert len(resolved) == 1
    assert resolved[0]["resolved_by"] == actor["id"]


def test_a_successful_allocation_resolves_the_open_shortage():
    asyncio.run(run_successful_allocation_resolves_the_shortage())


async def run_other_inventory_errors_translate_without_queueing():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    work_order, actor = await planned_work_order(db, service)
    await seed_balances(db, {"mat-ply": ("10", "0"), "mat-ink": ("50", "0")})

    with pytest.raises(B2BDomainError) as rejected:
        await service.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id="op-clash",
            reason="Alokasi material produksi",
            actor=actor,
            inventory_service=FakeInventory(
                error=InventoryError(
                    409,
                    "balance_version_conflict",
                    "Saldo inventory berubah bersamaan; silakan ulangi operasi.",
                )
            ),
        )

    # Same status and code, but as the B2B error contract, never a 500.
    assert rejected.value.status_code == 409
    assert rejected.value.code == "balance_version_conflict"
    # Not a shortage, so nothing joined the queue.
    assert await service.list_material_shortages() == []


def test_non_shortage_errors_translate_and_do_not_queue():
    asyncio.run(run_other_inventory_errors_translate_without_queueing())


async def run_conflict_with_sufficient_balances_does_not_queue():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    work_order, actor = await planned_work_order(db, service)
    # Every requirement is satisfiable, so the conflict is something else
    # (a concurrent reservation, a subject rule) and no deficit exists.
    await seed_balances(db, {"mat-ply": ("10", "0"), "mat-ink": ("50", "0")})

    with pytest.raises(B2BDomainError) as rejected:
        await service.allocate_work_order(
            work_order["id"],
            expected_version=work_order["version"],
            operation_id="op-odd",
            reason="Alokasi material produksi",
            actor=actor,
            inventory_service=FakeInventory(error=shortage_error()),
        )

    assert rejected.value.code == "inventory_conflict"
    assert await service.list_material_shortages() == []


def test_a_conflict_without_a_measurable_deficit_does_not_queue():
    asyncio.run(run_conflict_with_sufficient_balances_does_not_queue())
