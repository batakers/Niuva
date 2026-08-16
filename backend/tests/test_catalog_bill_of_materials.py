"""Variant bill of materials: what a produced unit consumes.

The BOM is the missing link between the catalog and inventory. It holds
references only, so nothing here can drift out of step with the material
register; snapshots are taken later, onto immutable quotation versions.
"""

import asyncio

import httpx
from catalog_domain import validate_bill_of_materials

from tests.test_catalog_routes import (
    build_test_context,
    create_publishable_product,
    headers,
)

MATERIALS = {
    "mat-ply": {
        "id": "mat-ply",
        "sku": "PLY-18",
        "name": "Plywood 18mm",
        "status": "active",
    },
    "mat-ink": {
        "id": "mat-ink",
        "sku": "INK-BLK",
        "name": "Ink Black",
        "status": "active",
    },
    "mat-old": {
        "id": "mat-old",
        "sku": "OLD-01",
        "name": "Retired",
        "status": "archived",
    },
}


def codes(errors):
    return [error["code"] for error in errors]


def test_accepts_distinct_active_materials_with_positive_quantities():
    errors = validate_bill_of_materials(
        [
            {"material_id": "mat-ply", "quantity_per_unit": "0.5"},
            {"material_id": "mat-ink", "quantity_per_unit": "2"},
        ],
        MATERIALS,
    )

    assert errors == []


def test_accepts_an_empty_bill_of_materials():
    """A variant may be defined before anyone works out what it consumes."""
    assert validate_bill_of_materials([], MATERIALS) == []
    assert validate_bill_of_materials(None, MATERIALS) == []


def test_rejects_a_material_that_does_not_exist():
    errors = validate_bill_of_materials(
        [{"material_id": "mat-ghost", "quantity_per_unit": "1"}], MATERIALS
    )

    assert codes(errors) == ["material_not_found"]
    assert errors[0]["field"] == "bill_of_materials.0.material_id"


def test_rejects_an_archived_material():
    errors = validate_bill_of_materials(
        [{"material_id": "mat-old", "quantity_per_unit": "1"}], MATERIALS
    )

    assert codes(errors) == ["material_archived"]


def test_rejects_the_same_material_twice():
    """Two lines for one material would make required quantity ambiguous."""
    errors = validate_bill_of_materials(
        [
            {"material_id": "mat-ply", "quantity_per_unit": "1"},
            {"material_id": "mat-ply", "quantity_per_unit": "3"},
        ],
        MATERIALS,
    )

    assert codes(errors) == ["duplicate_material"]


def test_rejects_quantities_that_cannot_consume_anything():
    for quantity in ("0", "-1", "", "abc", None):
        errors = validate_bill_of_materials(
            [{"material_id": "mat-ply", "quantity_per_unit": quantity}], MATERIALS
        )
        assert "quantity_invalid" in codes(errors), quantity


def test_reports_every_bad_line_rather_than_only_the_first():
    errors = validate_bill_of_materials(
        [
            {"material_id": "mat-ghost", "quantity_per_unit": "1"},
            {"material_id": "mat-ply", "quantity_per_unit": "0"},
        ],
        MATERIALS,
    )

    assert sorted(codes(errors)) == ["material_not_found", "quantity_invalid"]


async def run_variant_bom_route_boundary():
    app, db, _capabilities = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as api:
        _category, product = await create_publishable_product(api)
        for material in MATERIALS.values():
            await db.materials.insert_one(dict(material))

        def variant(bom):
            return {
                "variants": [
                    {
                        "sku": "SIGN-BLUE",
                        "name": "Blue",
                        "fixed_price": 50000,
                        "currency": "IDR",
                        "production_type": "ready_stock",
                        "inventory_tracking_enabled": True,
                        "reorder_point": "2",
                        "bill_of_materials": bom,
                        "status": "active",
                    }
                ]
            }

        rejected = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json=variant([{"material_id": "mat-ghost", "quantity_per_unit": "1"}]),
            headers=headers(),
        )
        assert rejected.status_code == 422
        detail = rejected.json()["detail"]
        assert detail["code"] == "bom_invalid"
        assert codes(detail["errors"]) == ["material_not_found"]

        # Nothing was written: the rejected replacement must not have touched
        # the variant that was already there.
        stored = await db.product_variants.find_one({"sku": "SIGN-BLUE"})
        assert not stored.get("bill_of_materials")

        accepted = await api.put(
            f"/api/admin/products/{product['id']}/variants",
            json=variant(
                [
                    {"material_id": "mat-ply", "quantity_per_unit": "0.5"},
                    {"material_id": "mat-ink", "quantity_per_unit": "2"},
                ]
            ),
            headers=headers(),
        )
        assert accepted.status_code == 200

        stored = await db.product_variants.find_one({"sku": "SIGN-BLUE"})
        assert stored["bill_of_materials"] == [
            {"material_id": "mat-ply", "quantity_per_unit": "0.5"},
            {"material_id": "mat-ink", "quantity_per_unit": "2"},
        ]

        # Quantities are held as strings, matching how the catalog already
        # stores decimals, so no binary float ever reaches the BOM.
        for entry in stored["bill_of_materials"]:
            assert isinstance(entry["quantity_per_unit"], str)


def test_variant_bom_is_validated_before_any_variant_is_written():
    asyncio.run(run_variant_bom_route_boundary())
