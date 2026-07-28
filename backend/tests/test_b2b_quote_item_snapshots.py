"""Immutable quote item snapshots.

A quotation version is immutable, so what a line committed to must be frozen
onto it. The decisive cases are the ones where the catalog moves afterwards:
a rename, a repricing, or a BOM edit must not reach back into a quotation the
customer already received.
"""

import asyncio

import pytest

from b2b_domain import B2BDomainError, build_quote_item_snapshot
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
    {
        "id": "mat-ply",
        "sku": "PLY-18",
        "name": "Plywood 18mm",
        "base_unit": "sheet",
        "supplier_reference": "PT Rahasia Supplier",
    },
    {
        "id": "mat-ink",
        "sku": "INK-BLK",
        "name": "Ink Black",
        "base_unit": "ml",
        "supplier_reference": "PT Rahasia Supplier",
    },
]


def test_line_total_is_derived_never_accepted():
    """An immutable document must not disagree with its own arithmetic."""
    snapshot = build_quote_item_snapshot(
        {"description": "Enclosure", "quantity": 3, "unit_price_minor": 1000}
    )

    assert snapshot["line_total_minor"] == 3000


def test_a_line_without_a_catalog_reference_carries_no_snapshot():
    snapshot = build_quote_item_snapshot(
        {"description": "Jasa konsultasi", "quantity": 1, "unit_price_minor": 500}
    )

    assert snapshot["variant_id"] is None
    assert snapshot["product_snapshot"] is None
    assert snapshot["configuration_snapshot"] is None
    assert snapshot["material_snapshot"] is None


def test_material_snapshot_scales_the_bom_to_the_quoted_quantity():
    snapshot = build_quote_item_snapshot(
        {"description": "Desk sign", "quantity": 4, "unit_price_minor": 100},
        variant=VARIANT,
        product=PRODUCT,
        materials_by_id={item["id"]: item for item in MATERIALS},
    )

    assert snapshot["configuration_snapshot"]["sku"] == "SIGN-BLUE"
    assert snapshot["product_snapshot"]["name"] == "Desk Sign"
    assert snapshot["material_snapshot"] == [
        {
            "material_id": "mat-ply",
            "sku": "PLY-18",
            "name": "Plywood 18mm",
            "base_unit": "sheet",
            "quantity_per_unit": "0.5",
            "quantity_required": "2.0",
        },
        {
            "material_id": "mat-ink",
            "sku": "INK-BLK",
            "name": "Ink Black",
            "base_unit": "ml",
            "quantity_per_unit": "2",
            "quantity_required": "8",
        },
    ]


def test_material_snapshot_never_carries_sourcing():
    """supplier_reference is permission gated for staff and must not travel."""
    snapshot = build_quote_item_snapshot(
        {"description": "Desk sign", "quantity": 1, "unit_price_minor": 100},
        variant=VARIANT,
        product=PRODUCT,
        materials_by_id={item["id"]: item for item in MATERIALS},
    )

    for material in snapshot["material_snapshot"]:
        assert "supplier_reference" not in material


def test_configuration_snapshot_does_not_alias_the_variant():
    snapshot = build_quote_item_snapshot(
        {"description": "Desk sign", "quantity": 1, "unit_price_minor": 100},
        variant=VARIANT,
        product=PRODUCT,
        materials_by_id={},
    )
    snapshot["configuration_snapshot"]["option_values"]["finish"] = "gloss"

    assert VARIANT["option_values"]["finish"] == "matte"


async def revision_ready_quote(service, db):
    quote, actor = await converted_quote(service)
    for target in ["internal_review", "sent", "revision_requested"]:
        quote = await service.transition_quote(
            quote["id"],
            target_status=target,
            expected_version=quote["version"],
            operation_id=f"op-{target}",
            reason=f"Move to {target}",
            actor=actor,
        )
    await db.products.insert_one(dict(PRODUCT))
    await db.product_variants.insert_one(dict(VARIANT))
    for material in MATERIALS:
        await db.materials.insert_one(dict(material))
    return quote, actor


async def run_revision_freezes_the_catalog():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    quote, actor = await revision_ready_quote(service, db)

    revised = await service.create_quote_revision(
        quote["id"],
        expected_version=quote["version"],
        operation_id="op-revision",
        reason="Menambahkan item katalog",
        scope_snapshot={"company": "PT Contoh"},
        items=[
            {
                "description": "Desk sign biru",
                "quantity": 2,
                "unit_price_minor": 750000,
                "variant_id": "var-1",
            }
        ],
        total_minor=None,
        actor=actor,
    )

    line = revised["current_version"]["items"][0]
    assert line["line_total_minor"] == 1500000
    # Absent from the payload entirely, yet derived from the lines.
    assert revised["current_version"]["total_minor"] == 1500000
    assert line["configuration_snapshot"]["sku"] == "SIGN-BLUE"
    assert line["material_snapshot"][0]["quantity_required"] == "1.0"

    # The catalog moves on: rename, reprice, and rewrite the BOM.
    await db.products.update_one({"id": "prod-1"}, {"$set": {"name": "Renamed Sign"}})
    await db.product_variants.update_one(
        {"id": "var-1"},
        {"$set": {"sku": "SIGN-RED", "bill_of_materials": []}},
    )
    await db.materials.update_one({"id": "mat-ply"}, {"$set": {"name": "Other Board"}})

    stored = db.b2b_quote_versions.items[-1]["items"][0]
    assert stored["product_snapshot"]["name"] == "Desk Sign"
    assert stored["configuration_snapshot"]["sku"] == "SIGN-BLUE"
    assert stored["material_snapshot"][0]["name"] == "Plywood 18mm"


def test_revision_freezes_the_catalog_it_quoted():
    asyncio.run(run_revision_freezes_the_catalog())


async def run_unknown_variant_is_refused():
    db = FakeDatabase()
    service = B2BService(db=db, transaction_guard=EnabledGuard())
    quote, actor = await revision_ready_quote(service, db)

    with pytest.raises(B2BDomainError) as rejected:
        await service.create_quote_revision(
            quote["id"],
            expected_version=quote["version"],
            operation_id="op-revision",
            reason="Item menunjuk varian hantu",
            scope_snapshot={"company": "PT Contoh"},
            items=[
                {
                    "description": "Hantu",
                    "quantity": 1,
                    "unit_price_minor": 100,
                    "variant_id": "var-ghost",
                }
            ],
            total_minor=None,
            actor=actor,
        )

    assert rejected.value.status_code == 422
    assert rejected.value.code == "quote_item_variant_not_found"
    # Refused before the transaction, so no version was written.
    assert len(db.b2b_quote_versions.items) == 2


def test_a_line_cannot_quote_a_variant_that_does_not_exist():
    asyncio.run(run_unknown_variant_is_refused())
