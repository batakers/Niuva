"""Work orders: turning an accepted quotation into a production run.

A work order is the first thing that can consume material, so what it must
consume is settled here. The per-unit figures come from the accepted
quotation version, never from the live catalog: production builds what was
sold, and the catalog is free to move on afterwards.
"""

import asyncio
from copy import deepcopy
from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from b2b_domain import (
    B2BDomainError,
    build_material_requirements,
    validate_work_order_transition,
    work_order_next_actions,
)
from b2b_service import B2BService
from b2b_routes import WorkOrderCreatePayload
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


def test_work_order_command_requires_exact_quote_line_identity():
    command = {
        "expected_version": 1,
        "operation_id": "11111111-1111-1111-1111-111111111111",
        "reason": "Create exact quoted run",
        "quantity": 1,
    }
    with pytest.raises(ValidationError):
        WorkOrderCreatePayload.model_validate(
            {**command, "variant_id": "var-1"}
        )

    parsed = WorkOrderCreatePayload.model_validate(
        {**command, "quote_line_id": "line-1"}
    )
    assert parsed.quote_line_id == "line-1"
    assert "variant_id" not in type(parsed).model_fields


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


async def active_project(db, service, *, quote_items=None):
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
        scope_snapshot=quote["current_version"]["scope_snapshot"],
        items=quote_items or [
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
    for target in ["internal_review", "sent"]:
        quote = await service.transition_quote(
            quote["id"],
            target_status=target,
            expected_version=quote["version"],
            operation_id=f"op-second-{target}",
            reason=f"Move to {target}",
            actor=actor,
        )
    quote = await service.accept_quote(
        quote["id"],
        expected_version=quote["version"],
        operation_id="op-second-accepted",
        reason="Customer approval recorded",
        approver={"name": "Ayu", "identity": "ayu@example.com"},
        accepted_at=datetime.now(timezone.utc),
        channel="email",
        evidence_reference="email-thread-wo",
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


def first_quote_line_id(project):
    return project["quote_snapshot"]["items"][0]["quote_line_id"]


async def run_work_order_draws_requirements_from_the_accepted_quote():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    project, actor = await active_project(db, service)

    work_order = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo-1",
        reason="Produksi batch pertama",
        quote_line_id=first_quote_line_id(project),
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
        quote_line_id=first_quote_line_id(project),
        quantity=2,
        actor=actor,
    )
    second = await service.create_work_order(
        project["id"],
        expected_version=project["version"],
        operation_id="op-wo-replay",
        reason="Produksi batch pertama",
        quote_line_id=first_quote_line_id(project),
        quantity=2,
        actor=actor,
    )

    assert second["id"] == first["id"]
    assert len(db.work_orders.items) == 1


def test_a_replayed_operation_does_not_create_a_second_run():
    asyncio.run(run_replayed_creation_returns_the_same_work_order())


def test_cumulative_work_orders_cannot_exceed_accepted_quantity():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        project, actor = await active_project(db, service)
        first = await service.create_work_order(
            project["id"],
            expected_version=project["version"],
            operation_id="op-cap-first",
            reason="Batch pertama",
            quote_line_id=first_quote_line_id(project),
            quantity=3,
            actor=actor,
        )
        current_project = await service.get_project(project["id"])
        with pytest.raises(B2BDomainError) as rejected:
            await service.create_work_order(
                project["id"],
                expected_version=current_project["version"],
                operation_id="op-cap-over",
                reason="Melebihi accepted quantity",
                quote_line_id=first_quote_line_id(project),
                quantity=2,
                actor=actor,
            )
        assert first["quantity"] == 3
        assert rejected.value.code == "work_order_quote_quantity_exceeded"
        assert rejected.value.details["remaining_quantity"] == 1
        assert len(db.work_orders.items) == 1

    asyncio.run(scenario())


def test_duplicate_variant_lines_have_independent_work_order_caps():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        project, actor = await active_project(
            db,
            service,
            quote_items=[
                {
                    "description": "Desk sign batch A",
                    "quantity": 2,
                    "unit_price_minor": 750000,
                    "variant_id": "var-1",
                },
                {
                    "description": "Desk sign batch B",
                    "quantity": 5,
                    "unit_price_minor": 700000,
                    "variant_id": "var-1",
                },
            ],
        )
        accepted = await db.b2b_quote_versions.find_one(
            {"id": project["source_quote_version_id"]}
        )
        first_line, second_line = accepted["items"]
        assert first_line["quote_line_id"] != second_line["quote_line_id"]

        first = await service.create_work_order(
            project["id"],
            expected_version=project["version"],
            operation_id="op-duplicate-line-first",
            reason="Produce quoted line A",
            quote_line_id=first_line["quote_line_id"],
            quantity=2,
            actor=actor,
        )
        current_project = await service.get_project(project["id"])
        second = await service.create_work_order(
            project["id"],
            expected_version=current_project["version"],
            operation_id="op-duplicate-line-second",
            reason="Produce quoted line B",
            quote_line_id=second_line["quote_line_id"],
            quantity=5,
            actor=actor,
        )

        assert first["variant_id"] == second["variant_id"] == "var-1"
        assert first["quote_line_id"] != second["quote_line_id"]
        assert first["source_quote_version_id"] == accepted["id"]
        assert second["source_quote_version_id"] == accepted["id"]

        latest_project = await service.get_project(project["id"])
        with pytest.raises(B2BDomainError) as rejected:
            await service.create_work_order(
                project["id"],
                expected_version=latest_project["version"],
                operation_id="op-duplicate-line-over",
                reason="Exceed only quoted line A",
                quote_line_id=first_line["quote_line_id"],
                quantity=1,
                actor=actor,
            )
        assert rejected.value.code == "work_order_quote_quantity_exceeded"
        assert rejected.value.details["remaining_quantity"] == 0

    asyncio.run(scenario())


def test_historical_missing_line_identity_requires_reconciliation():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        project, actor = await active_project(db, service)
        version = await db.b2b_quote_versions.find_one(
            {"id": project["source_quote_version_id"]}
        )
        items = deepcopy(version["items"])
        items[0].pop("quote_line_id")
        await db.b2b_quote_versions.update_one(
            {"id": version["id"]}, {"$set": {"items": items}}
        )

        with pytest.raises(B2BDomainError) as rejected:
            await service.create_work_order(
                project["id"],
                expected_version=project["version"],
                operation_id="op-historical-missing-line",
                reason="Historical quote must stop",
                quote_line_id="unknown-historical-line",
                quantity=1,
                actor=actor,
            )

        assert rejected.value.status_code == 409
        assert rejected.value.code == "quote_line_reconciliation_required"
        assert rejected.value.details["reason"] == "missing_quote_line_identity"
        assert db.work_orders.items == []

    asyncio.run(scenario())


def test_historical_duplicate_line_identity_requires_reconciliation():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        project, actor = await active_project(
            db,
            service,
            quote_items=[
                {
                    "description": "Desk sign A",
                    "quantity": 1,
                    "unit_price_minor": 750000,
                    "variant_id": "var-1",
                },
                {
                    "description": "Desk sign B",
                    "quantity": 1,
                    "unit_price_minor": 750000,
                    "variant_id": "var-1",
                },
            ],
        )
        version = await db.b2b_quote_versions.find_one(
            {"id": project["source_quote_version_id"]}
        )
        items = deepcopy(version["items"])
        items[1]["quote_line_id"] = items[0]["quote_line_id"]
        await db.b2b_quote_versions.update_one(
            {"id": version["id"]}, {"$set": {"items": items}}
        )

        with pytest.raises(B2BDomainError) as rejected:
            await service.create_work_order(
                project["id"],
                expected_version=project["version"],
                operation_id="op-historical-duplicate-line",
                reason="Ambiguous historical quote must stop",
                quote_line_id=items[0]["quote_line_id"],
                quantity=1,
                actor=actor,
            )

        assert rejected.value.code == "quote_line_reconciliation_required"
        assert rejected.value.details["reason"] == "duplicate_quote_line_identity"
        assert db.work_orders.items == []

    asyncio.run(scenario())


def test_project_quote_version_mismatch_requires_reconciliation():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=EnabledGuard())
        project, actor = await active_project(db, service)
        snapshot = deepcopy(project["quote_snapshot"])
        snapshot["id"] = "different-version"
        await db.b2b_projects.update_one(
            {"id": project["id"]}, {"$set": {"quote_snapshot": snapshot}}
        )

        with pytest.raises(B2BDomainError) as rejected:
            await service.create_work_order(
                project["id"],
                expected_version=project["version"],
                operation_id="op-mismatched-source-version",
                reason="Mismatched source must stop",
                quote_line_id=first_quote_line_id(project),
                quantity=1,
                actor=actor,
            )

        assert rejected.value.code == "quote_line_reconciliation_required"
        assert rejected.value.details["reason"] == "source_quote_version_mismatch"
        assert db.work_orders.items == []

        await db.b2b_projects.update_one(
            {"id": project["id"]},
            {
                "$set": {
                    "quote_id": "different-quote",
                    "quote_snapshot": project["quote_snapshot"],
                }
            },
        )
        with pytest.raises(B2BDomainError) as quote_mismatch:
            await service.create_work_order(
                project["id"],
                expected_version=project["version"],
                operation_id="op-mismatched-source-quote",
                reason="Mismatched Quote must stop",
                quote_line_id=first_quote_line_id(project),
                quantity=1,
                actor=actor,
            )
        assert quote_mismatch.value.code == "quote_line_reconciliation_required"
        assert quote_mismatch.value.details["reason"] == "source_quote_mismatch"
        assert db.work_orders.items == []

    asyncio.run(scenario())


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
            quote_line_id="quote-line-ghost",
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
            quote_line_id=first_quote_line_id(project),
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
            quote_line_id=first_quote_line_id(project),
            quantity=1,
            actor=actor,
        )

    assert rejected.value.code == "project_not_accepting_work"
    assert db.work_orders.items == []


def test_a_closed_project_cannot_take_on_new_production():
    asyncio.run(run_closed_project_refuses_new_work())
