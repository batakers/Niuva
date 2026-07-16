from decimal import Decimal

import pytest

from inventory_domain import (
    InventoryConflict,
    apply_deltas,
    compute_deltas,
    operation_fingerprint,
    validate_subject_movement,
)


BASE = {
    "on_hand": Decimal("10"),
    "reserved": Decimal("2"),
    "incoming": Decimal("4"),
    "planned_demand": Decimal("3"),
}


@pytest.mark.parametrize(
    ("movement_type", "field", "expected"),
    [
        ("receive", "on_hand", Decimal("15")),
        ("produce", "on_hand", Decimal("15")),
        ("reserve", "reserved", Decimal("7")),
        ("release", "reserved", Decimal("0")),
        ("consume", "on_hand", Decimal("8")),
        ("ship", "on_hand", Decimal("8")),
        ("damage", "on_hand", Decimal("8")),
        ("plan_incoming", "incoming", Decimal("9")),
        ("cancel_incoming", "incoming", Decimal("2")),
        ("plan_demand", "planned_demand", Decimal("8")),
        ("cancel_demand", "planned_demand", Decimal("1")),
    ],
)
def test_inventory_delta_rules(movement_type, field, expected):
    quantity = Decimal("2") if movement_type in {
        "release",
        "consume",
        "ship",
        "damage",
        "cancel_incoming",
        "cancel_demand",
    } else Decimal("5")
    result = apply_deltas(BASE, compute_deltas(movement_type, quantity))
    assert result[field] == expected


def test_receive_derives_available_and_projected():
    received = apply_deltas(BASE, compute_deltas("receive", Decimal("5")))
    assert received["on_hand"] == Decimal("15")
    assert received["available"] == Decimal("13")
    assert received["projected"] == Decimal("14")


def test_adjustment_accepts_signed_on_hand_delta():
    reduced = apply_deltas(
        BASE,
        compute_deltas("adjustment", on_hand_delta=Decimal("-3.5")),
    )
    assert reduced["on_hand"] == Decimal("6.5")
    assert reduced["available"] == Decimal("4.5")


@pytest.mark.parametrize(
    ("movement_type", "quantity"),
    [("receive", Decimal("0")), ("reserve", Decimal("-1"))],
)
def test_non_adjustment_requires_positive_quantity(movement_type, quantity):
    with pytest.raises(InventoryConflict, match="positive"):
        compute_deltas(movement_type, quantity)


def test_negative_protected_fields_are_rejected_but_projected_may_be_negative():
    with pytest.raises(InventoryConflict, match="negative"):
        apply_deltas(BASE, compute_deltas("reserve", Decimal("9")))

    projected_shortage = apply_deltas(
        {**BASE, "planned_demand": Decimal("20")},
        compute_deltas("receive", Decimal("1")),
    )
    assert projected_shortage["projected"] == Decimal("-7")


@pytest.mark.parametrize(
    ("subject_type", "movement_type"),
    [
        ("material", "produce"),
        ("material", "ship"),
        ("product_variant", "receive"),
        ("product_variant", "consume"),
        ("unknown", "receive"),
    ],
)
def test_invalid_subject_movement_pairs_are_rejected(subject_type, movement_type):
    with pytest.raises(InventoryConflict, match="not allowed"):
        validate_subject_movement(subject_type, movement_type)


@pytest.mark.parametrize(
    ("subject_type", "movement_type"),
    [
        ("material", "receive"),
        ("material", "consume"),
        ("material", "adjustment"),
        ("product_variant", "produce"),
        ("product_variant", "ship"),
        ("product_variant", "adjustment"),
    ],
)
def test_valid_subject_movement_pairs(subject_type, movement_type):
    validate_subject_movement(subject_type, movement_type)


def test_operation_fingerprint_is_order_independent_and_decimal_stable():
    first = {
        "operation_id": "11111111-1111-1111-1111-111111111111",
        "subject": {"type": "material", "id": "mat-1"},
        "quantity": Decimal("10.00"),
        "metadata": {"reference_id": "r-1", "tags": ["a", "b"]},
    }
    second = {
        "metadata": {"tags": ["a", "b"], "reference_id": "r-1"},
        "quantity": Decimal("10.00"),
        "subject": {"id": "mat-1", "type": "material"},
        "operation_id": "11111111-1111-1111-1111-111111111111",
    }
    assert operation_fingerprint(first) == operation_fingerprint(second)
    assert len(operation_fingerprint(first)) == 64


def test_fingerprint_changes_when_operation_content_changes():
    base = {"operation_id": "op-1", "quantity": Decimal("1"), "reason": "Receipt"}
    changed = {**base, "quantity": Decimal("2")}
    assert operation_fingerprint(base) != operation_fingerprint(changed)
