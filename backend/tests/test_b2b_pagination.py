import asyncio

import pytest
from b2b_domain import B2BDomainError
from b2b_pagination import build_page_request, paginate_collection

MISSING = object()


def field_matches(actual, expected):
    if not isinstance(expected, dict):
        return actual is not MISSING and actual == expected
    for operator, value in expected.items():
        if operator == "$type":
            if value != "string" or not isinstance(actual, str):
                return False
        elif operator == "$not":
            if field_matches(actual, value):
                return False
        elif operator == "$lt":
            if actual is MISSING or not actual < value:
                return False
        elif operator == "$gte":
            if actual is MISSING or not actual >= value:
                return False
        else:
            raise AssertionError(f"Unsupported test operator: {operator}")
    return True


def matches(document, query):
    for key, expected in query.items():
        if key == "$and":
            if not all(matches(document, clause) for clause in expected):
                return False
        elif key == "$or":
            if not any(matches(document, clause) for clause in expected):
                return False
        elif not field_matches(document.get(key, MISSING), expected):
            return False
    return True


class Cursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, fields):
        for field, direction in reversed(fields):
            self.items.sort(
                key=lambda item: item.get(field, ""),
                reverse=direction < 0,
            )
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class Collection:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def find(self, query, _projection):
        return Cursor([item for item in self.items if matches(item, query)])


def page(collection, request, *, scope="test"):
    return asyncio.run(paginate_collection(collection, request=request, scope=scope))


def test_equal_timestamps_use_id_tie_breaker_without_duplicates():
    collection = Collection(
        [
            {"id": "b", "status": "open", "updated_at": "2026-08-02T01:00:00+00:00"},
            {"id": "d", "status": "open", "updated_at": "2026-08-02T02:00:00+00:00"},
            {"id": "c", "status": "open", "updated_at": "2026-08-02T02:00:00+00:00"},
            {"id": "a", "status": "open", "updated_at": "2026-08-01T23:00:00+00:00"},
        ]
    )
    first = page(
        collection,
        build_page_request(limit=2, filters={"status": "open"}),
    )
    second = page(
        collection,
        build_page_request(
            limit=2,
            cursor=first["next_cursor"],
            filters={"status": "open"},
        ),
    )

    assert [item["id"] for item in first["items"]] == ["d", "c"]
    assert [item["id"] for item in second["items"]] == ["b", "a"]
    assert second["next_cursor"] is None


def test_cursor_is_bound_to_filters_and_rejects_invalid_input():
    collection = Collection(
        [
            {"id": "b", "status": "open", "updated_at": "2026-08-02T02:00:00+00:00"},
            {"id": "a", "status": "open", "updated_at": "2026-08-02T01:00:00+00:00"},
        ]
    )
    first = page(
        collection,
        build_page_request(limit=1, filters={"status": "open"}),
    )

    with pytest.raises(B2BDomainError) as mismatch:
        page(
            collection,
            build_page_request(
                limit=1,
                cursor=first["next_cursor"],
                filters={"status": "resolved"},
            ),
        )
    assert mismatch.value.code == "pagination_cursor_filter_mismatch"

    with pytest.raises(B2BDomainError) as invalid:
        page(collection, build_page_request(cursor="%%%not-a-cursor%%%"))
    assert invalid.value.code == "pagination_cursor_invalid"


def test_cursor_is_bound_to_its_list_scope():
    collection = Collection(
        [
            {"id": "b", "updated_at": "2026-08-02T02:00:00+00:00"},
            {"id": "a", "updated_at": "2026-08-02T01:00:00+00:00"},
        ]
    )
    first = page(
        collection,
        build_page_request(limit=1),
        scope="inquiries",
    )

    with pytest.raises(B2BDomainError) as mismatch:
        page(
            collection,
            build_page_request(limit=1, cursor=first["next_cursor"]),
            scope="quotes",
        )

    assert mismatch.value.code == "pagination_cursor_filter_mismatch"


def test_timezone_range_is_normalized_and_half_open():
    request = build_page_request(
        limit=10,
        updated_from="2026-08-02T07:00:00+07:00",
        updated_before="2026-08-02T09:00:00+07:00",
    )
    assert request.updated_from == "2026-08-02T00:00:00+00:00"
    assert request.updated_before == "2026-08-02T02:00:00+00:00"

    result = page(
        Collection(
            [
                {"id": "before", "updated_at": "2026-08-01T23:59:59+00:00"},
                {"id": "start", "updated_at": "2026-08-02T00:00:00+00:00"},
                {"id": "inside", "updated_at": "2026-08-02T01:59:59+00:00"},
                {"id": "end", "updated_at": "2026-08-02T02:00:00+00:00"},
            ]
        ),
        request,
    )
    assert [item["id"] for item in result["items"]] == ["inside", "start"]


@pytest.mark.parametrize(
    ("values", "code"),
    [
        (
            {"updated_from": "2026-08-02T00:00:00"},
            "pagination_datetime_timezone_required",
        ),
        (
            {
                "updated_from": "2026-08-02T02:00:00Z",
                "updated_before": "2026-08-02T01:00:00Z",
            },
            "pagination_datetime_range_invalid",
        ),
        ({"updated_before": "not-a-date"}, "pagination_datetime_invalid"),
        (
            {"updated_from": "0001-01-01T00:00:00+14:00"},
            "pagination_datetime_invalid",
        ),
        (
            {"updated_before": "9999-12-31T23:59:59-14:00"},
            "pagination_datetime_invalid",
        ),
        ({"limit": 101}, "pagination_limit_out_of_range"),
        ({"cursor": "   "}, "pagination_cursor_invalid"),
    ],
)
def test_invalid_page_inputs_fail_safely(values, code):
    with pytest.raises(B2BDomainError) as rejected:
        build_page_request(**values)
    assert rejected.value.code == code


def test_missing_timestamp_records_are_visible_in_deterministic_legacy_tail():
    collection = Collection(
        [
            {"id": "legacy-b", "status": "open"},
            {
                "id": "dated",
                "status": "open",
                "updated_at": "2026-08-02T00:00:00+00:00",
            },
            {"id": "legacy-a", "status": "open", "updated_at": None},
        ]
    )
    first = page(collection, build_page_request(limit=2, filters={"status": "open"}))
    second = page(
        collection,
        build_page_request(
            limit=2,
            cursor=first["next_cursor"],
            filters={"status": "open"},
        ),
    )

    assert [item["id"] for item in first["items"]] == ["dated", "legacy-b"]
    assert [item["id"] for item in second["items"]] == ["legacy-a"]
    assert second["next_cursor"] is None


def test_date_filter_excludes_legacy_tail_without_backfill():
    result = page(
        Collection(
            [
                {"id": "dated", "updated_at": "2026-08-02T00:00:00+00:00"},
                {"id": "legacy"},
            ]
        ),
        build_page_request(updated_from="2026-08-01T00:00:00Z"),
    )
    assert [item["id"] for item in result["items"]] == ["dated"]
