"""Dashboard aggregation rules.

One applied date range governs every figure on the dashboard. A panel that
quietly counts all of history next to one that respects the range makes the
two uncomparable, so the range is resolved once and applied everywhere.
"""

from datetime import datetime, timedelta, timezone
from decimal import Decimal

from bson.decimal128 import Decimal128

DEFAULT_RANGE_DAYS = 30

# Revenue is withheld until an authoritative Payment aggregate exists. The
# legacy signal is a manually verified transfer proof, which records that
# someone looked at an image, not that money settled. Publishing it as revenue
# would put a number on a dashboard that no ledger can back.
REVENUE_WITHHELD_REASON = "authoritative_payment_aggregate_unavailable"


class DashboardRangeError(ValueError):
    def __init__(self, message: str, field: str):
        super().__init__(message)
        self.message = message
        self.field = field


def _parse_day(value: str, field: str) -> datetime:
    try:
        return datetime.strptime(value, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except (TypeError, ValueError) as exc:
        raise DashboardRangeError(f"{field} must be YYYY-MM-DD", field) from exc


def resolve_date_range(
    date_from: str | None,
    date_to: str | None,
    *,
    today: datetime | None = None,
) -> dict:
    """Resolve the one range every aggregate on the dashboard will use."""
    now = today or datetime.now(timezone.utc)
    end_value = date_to or now.strftime("%Y-%m-%d")
    start_value = date_from or (
        now - timedelta(days=DEFAULT_RANGE_DAYS)
    ).strftime("%Y-%m-%d")

    start = _parse_day(start_value, "date_from")
    end = _parse_day(end_value, "date_to")
    if start > end:
        raise DashboardRangeError("date_from must not be after date_to", "date_from")

    return {
        "date_from": start_value,
        "date_to": end_value,
        # Inclusive of the whole end day: a range ending today must contain
        # what happened today, not stop at midnight.
        "query": {"$gte": start_value, "$lte": f"{end_value}T23:59:59.999999+00:00"},
    }


def created_within(range_query: dict, field: str = "created_at") -> dict:
    return {field: dict(range_query)}


def date_bucket(timestamp: str | None) -> str:
    return (timestamp or "")[:10]


def as_decimal(value) -> Decimal:
    if isinstance(value, Decimal128):
        return value.to_decimal()
    if isinstance(value, Decimal):
        return value
    try:
        return Decimal(str(value))
    except (ArithmeticError, TypeError, ValueError):
        return Decimal(0)


def signed_movement_quantity(movement: dict) -> Decimal:
    """The signed on-hand effect of a movement.

    Counting movements treats a receipt and a write-off as the same event.
    The signed on_hand delta is what actually moved, and its sign is the
    difference between stock arriving and stock leaving.
    """
    deltas = movement.get("deltas") or {}
    return as_decimal(deltas.get("on_hand", 0))


def summarize_movements(movements: list[dict]) -> list[dict]:
    """Daily signed on-hand movement, with the count kept alongside it."""
    buckets: dict[str, dict] = {}
    for movement in movements:
        bucket = buckets.setdefault(
            date_bucket(movement.get("created_at")),
            {"signed_quantity": Decimal(0), "movements": 0},
        )
        bucket["signed_quantity"] += signed_movement_quantity(movement)
        bucket["movements"] += 1
    return [
        {
            "date": date,
            "signed_quantity": str(value["signed_quantity"]),
            "movements": value["movements"],
        }
        for date, value in sorted(buckets.items())
    ]


def distinct_count(documents: list[dict], field: str) -> int:
    """Distinct non-empty values of a field across the ranged documents."""
    return len({item[field] for item in documents if item.get(field)})


def withheld_revenue() -> dict:
    """State that revenue is withheld, and why, rather than omitting it.

    An absent key reads like a permission gap or a bug. A named reason tells
    the reader the figure is deliberately not published yet.
    """
    return {"available": False, "reason": REVENUE_WITHHELD_REASON}
