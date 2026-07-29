"""Legacy orders are classified on read, never rewritten.

The orders collection predates the separate retail aggregate. Its four-status
flow is not the canonical retail lifecycle, so every read says which record
class it belongs to and where its status lands on the canonical stages. None
of that is written back.
"""

import pytest
from retail_domain import (
    LEGACY_STATUS_EQUIVALENT,
    RETAIL_STATUSES,
    classify_legacy_order,
    project_customer_legacy_order,
)

LEGACY_ORDER = {
    "_id": "mongo-oid",
    "id": "order-1",
    "order_number": "NIV-2607-0001",
    "user_id": "user-1",
    "status": "in_process",
    "estimate": {"amount": 250000},
    "status_history": [
        {"status": "pending_estimate", "at": "t", "note": "Order received"}
    ],
    "created_at": "2026-07-01T00:00:00Z",
}


def test_classification_marks_the_record_class():
    classified = classify_legacy_order(LEGACY_ORDER)

    assert classified["record_class"] == "legacy_order"
    assert classified["canonical_status_equivalent"] == "in_production"


def test_classification_preserves_every_stored_field():
    classified = classify_legacy_order(LEGACY_ORDER)

    for key, value in LEGACY_ORDER.items():
        if key == "_id":
            continue
        assert classified[key] == value


def test_classification_drops_only_the_mongo_id():
    assert "_id" not in classify_legacy_order(LEGACY_ORDER)


def test_classification_does_not_mutate_the_source():
    document = dict(LEGACY_ORDER)
    classify_legacy_order(document)

    assert document == LEGACY_ORDER
    assert "record_class" not in document


def test_customer_projection_allowlists_historical_fields_and_withholds_internal_data():
    safe = project_customer_legacy_order(
        {
            **LEGACY_ORDER,
            "user_id": "user-1",
            "user_email": "customer@example.com",
            "material_name": "Acrylic",
            "notes": "Internal fulfilment note",
            "internal_price": 150000,
            "supplier": "Supplier internal",
            "file": {
                "storage_path": "niuva/orders/user-1/design.stl",
                "original_filename": "design.stl",
            },
            "estimate": {
                "amount": 250000,
                "currency": "IDR",
                "note": "Internal pricing rationale",
            },
            "payment": {
                "verified": False,
                "proof": {"storage_path": "niuva/payments/user-1/proof.png"},
            },
            "status_history": [
                {
                    "status": "pending_estimate",
                    "at": "2026-07-01T00:00:00Z",
                    "note": "Internal staff note",
                }
            ],
            "unexpected_internal_field": "never expose",
        }
    )

    assert safe == {
        "id": "order-1",
        "order_number": "NIV-2607-0001",
        "material_name": "Acrylic",
        "status": "in_process",
        "created_at": "2026-07-01T00:00:00Z",
        "record_class": "legacy_order",
        "canonical_status_equivalent": "in_production",
        "creation_enabled": False,
        "mutations_enabled": False,
        "file": {"original_filename": "design.stl"},
        "estimate": {"amount": 250000, "currency": "IDR"},
        "payment": {"verified": False},
        "status_history": [
            {"status": "pending_estimate", "at": "2026-07-01T00:00:00Z"}
        ],
    }


@pytest.mark.parametrize(
    ("legacy", "canonical"),
    [
        ("pending_estimate", "created"),
        ("awaiting_payment", "awaiting_payment"),
        ("in_process", "in_production"),
        ("completed", "completed"),
    ],
)
def test_each_legacy_status_maps_onto_a_canonical_stage(legacy, canonical):
    classified = classify_legacy_order({**LEGACY_ORDER, "status": legacy})

    assert classified["canonical_status_equivalent"] == canonical
    assert canonical in RETAIL_STATUSES


def test_cancellation_has_no_canonical_equivalent():
    """Canonical retail has no cancelled stage, so it is not forced onto one."""
    classified = classify_legacy_order({**LEGACY_ORDER, "status": "cancelled"})

    assert classified["canonical_status_equivalent"] is None


def test_an_unknown_legacy_status_is_left_unmapped_rather_than_guessed():
    classified = classify_legacy_order({**LEGACY_ORDER, "status": "something_else"})

    assert classified["record_class"] == "legacy_order"
    assert classified["canonical_status_equivalent"] is None


def test_every_mapped_stage_exists_on_the_canonical_lifecycle():
    for canonical in LEGACY_STATUS_EQUIVALENT.values():
        assert canonical is None or canonical in RETAIL_STATUSES
