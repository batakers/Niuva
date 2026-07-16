import hashlib
import json
from decimal import Decimal, InvalidOperation


class InventoryConflict(ValueError):
    pass


DELTA_RULES = {
    "receive": {"on_hand": 1},
    "produce": {"on_hand": 1},
    "reserve": {"reserved": 1},
    "release": {"reserved": -1},
    "consume": {"on_hand": -1},
    "ship": {"on_hand": -1},
    "damage": {"on_hand": -1},
    "plan_incoming": {"incoming": 1},
    "cancel_incoming": {"incoming": -1},
    "plan_demand": {"planned_demand": 1},
    "cancel_demand": {"planned_demand": -1},
}

ALLOWED_MOVEMENTS = {
    "material": {
        "receive",
        "reserve",
        "release",
        "consume",
        "damage",
        "adjustment",
        "plan_incoming",
        "cancel_incoming",
        "plan_demand",
        "cancel_demand",
    },
    "product_variant": {
        "produce",
        "reserve",
        "release",
        "ship",
        "damage",
        "adjustment",
        "plan_incoming",
        "cancel_incoming",
        "plan_demand",
        "cancel_demand",
    },
}

BALANCE_FIELDS = ("on_hand", "reserved", "incoming", "planned_demand")
PROTECTED_FIELDS = (*BALANCE_FIELDS, "available")


def as_decimal(value) -> Decimal:
    try:
        return value if isinstance(value, Decimal) else Decimal(str(value))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise InventoryConflict("quantity must be a valid decimal") from exc


def validate_subject_movement(subject_type: str, movement_type: str) -> None:
    if movement_type not in ALLOWED_MOVEMENTS.get(subject_type, set()):
        raise InventoryConflict(
            f"movement {movement_type!r} is not allowed for subject {subject_type!r}"
        )


def compute_deltas(
    movement_type: str,
    quantity: Decimal | str | int | None = None,
    *,
    on_hand_delta: Decimal | str | int | None = None,
) -> dict[str, Decimal]:
    if movement_type == "adjustment":
        if on_hand_delta is None:
            raise InventoryConflict("adjustment requires an explicit signed on_hand_delta")
        delta = as_decimal(on_hand_delta)
        if delta == 0:
            raise InventoryConflict("adjustment on_hand_delta must be non-zero")
        return {"on_hand": delta}

    rule = DELTA_RULES.get(movement_type)
    if rule is None:
        raise InventoryConflict(f"unknown movement type: {movement_type}")
    if quantity is None:
        raise InventoryConflict("quantity must be positive")
    amount = as_decimal(quantity)
    if amount <= 0:
        raise InventoryConflict("quantity must be positive")
    return {field: amount * multiplier for field, multiplier in rule.items()}


def apply_deltas(balance: dict, deltas: dict[str, Decimal]) -> dict[str, Decimal]:
    result = {field: as_decimal(balance.get(field, 0)) for field in BALANCE_FIELDS}
    for field, delta in deltas.items():
        if field not in BALANCE_FIELDS:
            raise InventoryConflict(f"unsupported balance field: {field}")
        result[field] += as_decimal(delta)

    result["available"] = result["on_hand"] - result["reserved"]
    result["projected"] = (
        result["available"] + result["incoming"] - result["planned_demand"]
    )
    negative = [field for field in PROTECTED_FIELDS if result[field] < 0]
    if negative:
        raise InventoryConflict(
            f"inventory protected fields cannot be negative: {', '.join(negative)}"
        )
    return result


def _canonical_value(value):
    if isinstance(value, Decimal):
        if value == 0:
            return "0"
        return format(value.normalize(), "f")
    if isinstance(value, dict):
        return {key: _canonical_value(value[key]) for key in sorted(value)}
    if isinstance(value, (list, tuple)):
        return [_canonical_value(item) for item in value]
    return value


def operation_fingerprint(payload: dict) -> str:
    canonical = json.dumps(
        _canonical_value(payload),
        sort_keys=True,
        separators=(",", ":"),
        ensure_ascii=False,
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()
