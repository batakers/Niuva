"""Work orders: turning an accepted quotation into a production run.

A work order is the first thing that can consume material, so what it must
consume is settled here. The per-unit figures come from the accepted
quotation version, never from the live catalog: production builds what was
sold, and the catalog is free to move on afterwards.
"""

import asyncio

import pytest

from b2b_domain import (
    B2BDomainError,
    build_material_requirements,
    validate_work_order_transition,
    work_order_next_actions,
)
from b2b_service import B2BService
from tests.test_b2b_quote_conversion import EnabledGuard, FakeDatabase
from tests.test_b2b_quote_lifecycle import converted_quote

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
    {"id": "mat-ply", "sku": "PLY-18", "name": "Plywood 18mm", "base_unit": "sheet"},
    {"id": "mat-ink", "sku": "INK-BLK", "name": "Ink Black", "base_unit": "ml"},
]

ACTOR = {"id": "prod-1-user", "email": "production@niuva.test"}


def test_requirements_scale_per_unit_figures_to_the_run():
    requirements = build_material_requirements(
        [
            {
                "material_id": "mat-ply",
                "sku": "PLY-18",
                "name": "Plywood 18mm",
                "base_unit": "sheet",
                "quantity_per_unit": "0.5",
                "quantity_required": "1.0",
            }
        ],
        10,
    )

    assert requirements == [
        {
            "material_id": "mat-ply",
            "sku": "PLY-18",
            "name": "Plywood 18mm",
            "base_unit": "sheet",
            "quantity_per_unit": "0.5",
            "quantity_required": "5.0",
        }
    ]


def test_a_line_without_materials_requires_nothing():
    assert build_material_requirements(None, 5) == []
    assert build_material_requirements([], 5) == []


def test_work_order_transition_graph():
    assert work_order_next_actions("planned") == ["start", "cancel"]
    validate_work_order_transition("planned", "in_progress", reason="Mulai produksi")
    validate_work_order_transition("in_progress", "completed", reason="Selesai")

    with pytest.raises(B2BDomainError) as skipped:
        validate_work_order_transition("planned", "completed", reason="Lompat")
    assert skipped.value.code == "work_order_transition_invalid"

    with pytest.raises(B2BDomainError) as terminal:
        validate_work_order_transition("completed", "in_progress", reason="Ulangi")
    assert terminal.value.code == "work_order_terminal"

    with pytest.raises(B2BDomainError) as missing:
        validate_work_order_transition("planned", "cancelled", reason="  ")
    assert missing.value.code == "reason_required"


async def active_project(db, service):
    """Drive a quotation with a catalog line all the way to an active project."""
    quote, actor = await converted_quote(service)
    await db.products.insert_one(dict(PRODUCT))
    await db.product_variants.insert_one(dict(VARIANT))
    for material in MATERIALS:
        await db.materials.insert_one(dict(material))

    for target in ["internal_review", "sent", "revision_requested"]:
        quote = await service.transition_quote(
            quote["id"],
            target_status=target,
            expected_version=quote["version"],
            operation_id=f"op-{target}",
            reason=f"Move to {target}",
            actor=actor,
        )
    revised = await service.create_quote_revision(
        quote["id"],
        expected_version=quote["version"],
        operation_id="op-revision",
        reason="Menambahkan item katalog",
        scope_snapshot={"company": "PT Contoh"},
        items=[
            {
                "description": "Desk sign biru",
                "quantity": 4,
                "unit_price_minor": 750000,
                "variant_id": "var-1",
            }
        ],
        total_minor=None,
        actor=actor,
    )
    quote = revised
    for target in ["internal_review", "sent", "accepted"]:
        quote = await service.transition_quote(
            quote["id"],
            target_status=target,
            expected_version=quote["version"],
            operation_id=f"op-second-{target}",
            reason=f"Move to {target}",
            actor=actor,
        )
    created = await service.create_project_from_quote(
        quote["id"],
        expected_version=quote["version"],
        operation_id="op-project",
        reason="Mulai eksekusi",
        actor=actor,
    )
    return created["project"], actor


async def run_work_order_draws_requirements_from_the_accepted_quote():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)

    work_order = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo-1",
        reason="Produksi batch pertama",
        variant_id="var-1",
        quantity=2,
        actor=actor,
    )

    assert work_order["status"] == "planned"
    assert work_order["quantity"] == 2
    assert work_order["permitted_next_actions"] == ["start", "cancel"]
    # 0.5 and 2 per unit, scaled to a run of 2.
    assert [
        (entry["material_id"], entry["quantity_required"])
        for entry in work_order["material_requirements"]
    ] == [("mat-ply", "1.0"), ("mat-ink", "4")]

    stored = await db.b2b_projects.find_one({"id": project["id"]})
    assert stored["work_order_ids"] == [work_order["id"]]
    assert stored["version"] == project["version"] + 1

    # The catalog moves on; the run keeps what it was planned against.
    await db.product_variants.update_one(
        {"id": "var-1"}, {"$set": {"bill_of_materials": []}}
    )
    reloaded = await service.get_work_order(work_order["id"])
    assert len(reloaded["material_requirements"]) == 2


def test_work_order_requirements_come_from_the_accepted_quotation():
    asyncio.run(run_work_order_draws_requirements_from_the_accepted_quote())


async def run_replayed_creation_returns_the_same_work_order():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)

    first = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo-replay",
        reason="Produksi batch pertama",
        variant_id="var-1",
        quantity=2,
        actor=actor,
    )
    second = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo-replay",
        reason="Produksi batch pertama",
        variant_id="var-1",
        quantity=2,
        actor=actor,
    )

    assert second["id"] == first["id"]
    assert len(db.work_orders.items) == 1


def test_a_replayed_operation_does_not_create_a_second_run():
    asyncio.run(run_replayed_creation_returns_the_same_work_order())


async def run_unquoted_variant_is_refused():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)

    with pytest.raises(B2BDomainError) as rejected:
        await service.create_work_order(
            project["id"],
            expected_version=project["version"],
            operation_id="op-wo-ghost",
            reason="Produksi varian yang tidak dijual",
            variant_id="var-ghost",
            quantity=1,
            actor=actor,
        )

    assert rejected.value.status_code == 422
    assert rejected.value.code == "work_order_line_not_quoted"
    assert db.work_orders.items == []


def test_production_cannot_be_ordered_for_something_never_quoted():
    asyncio.run(run_unquoted_variant_is_refused())


async def run_stale_version_is_refused():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)

    with pytest.raises(B2BDomainError) as rejected:
        await service.create_work_order(
            project["id"],
            expected_version=project["version"] + 5,
            operation_id="op-wo-stale",
            reason="Produksi dengan versi basi",
            variant_id="var-1",
            quantity=1,
            actor=actor,
        )

    assert rejected.value.code == "version_conflict"
    assert db.work_orders.items == []


def test_a_stale_project_version_creates_no_work_order():
    asyncio.run(run_stale_version_is_refused())


async def run_closed_project_refuses_new_work():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)
    cancelled = await service.transition_project(
        project["id"],
        target_status="cancelled",
        expected_version=project["version"],
        operation_id="op-cancel",
        reason="Dibatalkan pelanggan",
        actor=actor,
    )

    with pytest.raises(B2BDomainError) as rejected:
        await service.create_work_order(
            project["id"],
            expected_version=cancelled["version"],
            operation_id="op-wo-after-cancel",
            reason="Produksi setelah pembatalan",
            variant_id="var-1",
            quantity=1,
            actor=actor,
        )

    assert rejected.value.code == "project_not_accepting_work"
    assert db.work_orders.items == []


def test_a_closed_project_cannot_take_on_new_production():
    asyncio.run(run_closed_project_refuses_new_work())
