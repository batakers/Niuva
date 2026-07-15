from copy import deepcopy
from decimal import Decimal

import pytest

from catalog_domain import (
    build_publication_snapshot,
    normalize_slug,
    project_publication_for_public,
    public_stock_status,
    validate_catalog_aggregate,
)


@pytest.fixture
def valid_aggregate():
    return {
        "category": {
            "id": "cat-1",
            "name": "Ready Stock",
            "slug": "ready-stock",
            "status": "active",
        },
        "product": {
            "id": "prod-1",
            "name": "Desk Sign",
            "slug": "desk-sign",
            "short_description": "Custom desk sign",
            "description": "Printed desk sign",
            "media": [
                {"storage_path": "catalog/sign.webp", "alt": "Blue desk sign"}
            ],
            "pricing_mode": "fixed",
            "price_from": 50000,
            "currency": "IDR",
            "pricing_rule_reference": None,
            "retail_cta_enabled": True,
            "b2b_cta_enabled": True,
            "stock_visibility": "status_only",
            "workflow_status": "draft",
        },
        "variants": [
            {
                "id": "var-1",
                "sku": "SIGN-BLUE",
                "name": "Blue",
                "fixed_price": 50000,
                "currency": "IDR",
                "production_type": "ready_stock",
                "inventory_tracking_enabled": True,
                "reorder_point": "2",
                "status": "active",
            }
        ],
        "options": [],
    }


def error_codes(aggregate):
    return {item["code"] for item in validate_catalog_aggregate(aggregate)}


def test_slug_normalization_is_deterministic():
    assert normalize_slug("  Desk Sign / Biru  ") == "desk-sign-biru"


def test_complete_fixed_aggregate_is_valid(valid_aggregate):
    assert validate_catalog_aggregate(valid_aggregate) == []


@pytest.mark.parametrize(
    ("mutate", "expected_code"),
    [
        (lambda value: value["category"].update(status="archived"), "category_inactive"),
        (lambda value: value["product"].update(name=""), "required"),
        (lambda value: value["product"].update(media=[]), "media_required"),
        (
            lambda value: value["product"]["media"][0].update(alt=""),
            "media_required",
        ),
        (lambda value: value.update(variants=[]), "variant_required"),
        (
            lambda value: value["variants"][0].update(fixed_price=0),
            "fixed_price_required",
        ),
        (
            lambda value: value["variants"][0].update(
                inventory_tracking_enabled=False
            ),
            "inventory_tracking_required",
        ),
        (
            lambda value: value["product"].update(
                retail_cta_enabled=False, b2b_cta_enabled=False
            ),
            "cta_required",
        ),
    ],
)
def test_catalog_validation_rejects_invalid_aggregate(
    valid_aggregate, mutate, expected_code
):
    aggregate = deepcopy(valid_aggregate)
    mutate(aggregate)
    assert expected_code in error_codes(aggregate)


def test_catalog_validation_rejects_duplicate_variant_sku(valid_aggregate):
    duplicate = deepcopy(valid_aggregate["variants"][0])
    duplicate["id"] = "var-2"
    valid_aggregate["variants"].append(duplicate)

    assert "duplicate_variant_sku" in error_codes(valid_aggregate)


def test_calculated_product_requires_rule_and_price_from(valid_aggregate):
    valid_aggregate["product"].update(
        pricing_mode="calculated",
        pricing_rule_reference=None,
        price_from=0,
    )

    assert "calculated_metadata_required" in error_codes(valid_aggregate)


def test_quote_required_product_requires_b2b_cta(valid_aggregate):
    valid_aggregate["product"].update(
        pricing_mode="quote_required",
        retail_cta_enabled=True,
        b2b_cta_enabled=False,
    )

    assert "rfq_cta_required" in error_codes(valid_aggregate)


def test_publication_filters_internal_product_variant_and_option_fields(
    valid_aggregate,
):
    valid_aggregate["product"]["internal_cost"] = 12000
    valid_aggregate["variants"][0]["reorder_point"] = "2"
    valid_aggregate["options"] = [
        {
            "id": "opt-1",
            "code": "size",
            "label": "Size",
            "type": "select",
            "allowed_values": ["Large"],
            "required": True,
            "display_order": 1,
            "active": True,
            "internal_cost": 9000,
        }
    ]

    snapshot = build_publication_snapshot(
        valid_aggregate,
        revision=1,
        actor_id="catalog-1",
        reason="Initial publication",
        published_at="2026-07-14T00:00:00+00:00",
    )

    assert snapshot["revision"] == 1
    assert snapshot["publish_reason"] == "Initial publication"
    assert snapshot["options"][0]["code"] == "size"
    assert "internal_cost" not in str(snapshot)
    assert "reorder_point" not in str(snapshot)


def test_public_projection_removes_actor_reason_and_exact_stock(valid_aggregate):
    snapshot = build_publication_snapshot(
        valid_aggregate,
        revision=1,
        actor_id="catalog-1",
        reason="Initial publication",
        published_at="2026-07-14T00:00:00+00:00",
    )

    public = project_publication_for_public(
        snapshot,
        {"var-1": {"available": "2", "reorder_point": "2"}},
    )

    assert public["variants"][0]["stock_status"] == "low_stock"
    assert "published_by" not in public
    assert "publish_reason" not in public
    assert "available" not in str(public)
    assert "reorder_point" not in str(public)


def test_public_stock_mapping_never_returns_quantity():
    assert (
        public_stock_status("ready_stock", Decimal("0"), Decimal("2"))
        == "out_of_stock"
    )
    assert (
        public_stock_status("ready_stock", Decimal("2"), Decimal("2"))
        == "low_stock"
    )
    assert (
        public_stock_status("ready_stock", Decimal("3"), Decimal("2"))
        == "in_stock"
    )
    assert (
        public_stock_status("made_to_order", Decimal("0"), Decimal("0"))
        == "made_to_order"
    )
