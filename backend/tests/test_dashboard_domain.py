"""One applied range, signed movement, and revenue withheld with a reason."""

from datetime import datetime, timezone
from decimal import Decimal

import pytest
from dashboard_domain import (
    REVENUE_WITHHELD_REASON,
    DashboardRangeError,
    created_within,
    distinct_count,
    resolve_date_range,
    signed_movement_quantity,
    summarize_movements,
    withheld_revenue,
)

TODAY = datetime(2026, 7, 27, 10, 30, tzinfo=timezone.utc)


def test_an_absent_range_defaults_to_the_last_thirty_days():
    applied = resolve_date_range(None, None, today=TODAY)

    assert applied["date_to"] == "2026-07-27"
    assert applied["date_from"] == "2026-06-27"


def test_the_range_includes_the_whole_end_day():
    """A range ending today must contain what happened today."""
    applied = resolve_date_range("2026-07-01", "2026-07-27", today=TODAY)

    assert applied["query"]["$gte"] == "2026-07-01"
    assert applied["query"]["$lte"].startswith("2026-07-27T23:59:59")
    # A timestamp late on the end day sorts inside the range.
    assert "2026-07-27T23:45:00+00:00" <= applied["query"]["$lte"]


def test_a_malformed_date_names_the_field_that_is_wrong():
    with pytest.raises(DashboardRangeError) as rejected:
        resolve_date_range("not-a-date", None, today=TODAY)
    assert rejected.value.field == "date_from"

    with pytest.raises(DashboardRangeError) as reversed_range:
        resolve_date_range("2026-07-27", "2026-07-01", today=TODAY)
    assert reversed_range.value.field == "date_from"


def test_the_same_range_query_is_reusable_across_aggregates():
    applied = resolve_date_range("2026-07-01", "2026-07-02", today=TODAY)
    orders = created_within(applied["query"])
    movements = created_within(applied["query"])

    assert orders == movements
    # Each caller gets its own copy, so one aggregate cannot mutate another's.
    orders["created_at"]["$gte"] = "tampered"
    assert movements["created_at"]["$gte"] == "2026-07-01"


def test_movement_quantity_is_signed_not_counted():
    assert signed_movement_quantity({"deltas": {"on_hand": "10"}}) == Decimal(10)
    assert signed_movement_quantity({"deltas": {"on_hand": "-4"}}) == Decimal(-4)
    # A reservation moves nothing on hand.
    assert signed_movement_quantity({"deltas": {"reserved": "5"}}) == Decimal(0)
    assert signed_movement_quantity({}) == Decimal(0)


def test_a_receipt_and_a_write_off_do_not_cancel_into_silence():
    """Counting movements would report two events and hide the net effect."""
    summary = summarize_movements(
        [
            {"created_at": "2026-07-01T08:00:00+00:00", "deltas": {"on_hand": "10"}},
            {"created_at": "2026-07-01T09:00:00+00:00", "deltas": {"on_hand": "-4"}},
            {"created_at": "2026-07-02T09:00:00+00:00", "deltas": {"on_hand": "-2"}},
        ]
    )

    assert summary == [
        {"date": "2026-07-01", "signed_quantity": "6", "movements": 2},
        {"date": "2026-07-02", "signed_quantity": "-2", "movements": 1},
    ]


def test_movement_quantities_never_become_floats():
    summary = summarize_movements(
        [
            {"created_at": "2026-07-01T08:00:00+00:00", "deltas": {"on_hand": "0.1"}},
            {"created_at": "2026-07-01T09:00:00+00:00", "deltas": {"on_hand": "0.2"}},
        ]
    )

    # 0.1 + 0.2 is exactly 0.3 in decimal, and 0.30000000000000004 in binary.
    assert summary[0]["signed_quantity"] == "0.3"


def test_distinct_counts_ignore_repeats_and_blanks():
    documents = [
        {"user_id": "u-1"},
        {"user_id": "u-1"},
        {"user_id": "u-2"},
        {"user_id": ""},
        {},
    ]

    assert distinct_count(documents, "user_id") == 2


def test_revenue_is_withheld_with_a_stated_reason():
    """Absent would read like a permission gap; named says deliberately not yet."""
    assert withheld_revenue() == {
        "available": False,
        "reason": REVENUE_WITHHELD_REASON,
    }
    assert "amount" not in withheld_revenue()
