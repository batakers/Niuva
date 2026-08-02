"""Bounded cursor pagination for approved Admin/B2B list routes."""

from __future__ import annotations

import base64
import binascii
import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Callable

from b2b_domain import B2BDomainError

DEFAULT_PAGE_LIMIT = 50
MAX_PAGE_LIMIT = 100
CURSOR_VERSION = 1


@dataclass(frozen=True)
class PageRequest:
    limit: int
    cursor: str | None
    filters: dict[str, str]
    updated_from: str | None
    updated_before: str | None


def _pagination_error(code: str, message: str) -> B2BDomainError:
    return B2BDomainError(422, code, message)


def _normalize_datetime(value: str | None, *, field: str) -> str | None:
    if value is None:
        return None
    candidate = value.strip()
    try:
        parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
    except ValueError as exc:
        raise _pagination_error(
            "pagination_datetime_invalid",
            f"{field} harus menggunakan format RFC3339.",
        ) from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise _pagination_error(
            "pagination_datetime_timezone_required",
            f"{field} wajib menyertakan timezone.",
        )
    return parsed.astimezone(timezone.utc).isoformat()


def build_page_request(
    *,
    limit: int = DEFAULT_PAGE_LIMIT,
    cursor: str | None = None,
    filters: dict[str, str | None] | None = None,
    updated_from: str | None = None,
    updated_before: str | None = None,
) -> PageRequest:
    if isinstance(limit, bool) or limit < 1 or limit > MAX_PAGE_LIMIT:
        raise _pagination_error(
            "pagination_limit_out_of_range",
            f"limit harus berada di antara 1 dan {MAX_PAGE_LIMIT}.",
        )
    normalized_from = _normalize_datetime(updated_from, field="updated_from")
    normalized_before = _normalize_datetime(
        updated_before,
        field="updated_before",
    )
    if (
        normalized_from is not None
        and normalized_before is not None
        and normalized_from >= normalized_before
    ):
        raise _pagination_error(
            "pagination_datetime_range_invalid",
            "updated_from harus lebih awal daripada updated_before.",
        )
    normalized_cursor = None
    if cursor is not None:
        if not isinstance(cursor, str) or not cursor.strip():
            raise _pagination_error(
                "pagination_cursor_invalid",
                "Cursor pagination tidak valid.",
            )
        normalized_cursor = cursor.strip()
    normalized_filters = {
        key: value.strip()
        for key, value in (filters or {}).items()
        if isinstance(value, str) and value.strip()
    }
    return PageRequest(
        limit=limit,
        cursor=normalized_cursor,
        filters=normalized_filters,
        updated_from=normalized_from,
        updated_before=normalized_before,
    )


def _filter_fingerprint(request: PageRequest) -> str:
    canonical = json.dumps(
        {
            "filters": request.filters,
            "updated_before": request.updated_before,
            "updated_from": request.updated_from,
        },
        sort_keys=True,
        separators=(",", ":"),
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()[:24]


def _encode_cursor(document: dict, *, bucket: str, fingerprint: str) -> str:
    identifier = document.get("id")
    updated_at = document.get("updated_at") if bucket == "dated" else None
    if not isinstance(identifier, str) or not identifier:
        raise RuntimeError("Paginated B2B records require a stable string id")
    if bucket == "dated" and not isinstance(updated_at, str):
        raise RuntimeError("Dated B2B cursor records require updated_at")
    payload = {
        "b": bucket,
        "f": fingerprint,
        "i": identifier,
        "u": updated_at,
        "v": CURSOR_VERSION,
    }
    encoded = base64.urlsafe_b64encode(
        json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).decode("ascii")
    return encoded.rstrip("=")


def _decode_cursor(value: str, *, fingerprint: str) -> dict[str, Any]:
    try:
        padding = "=" * (-len(value) % 4)
        decoded = json.loads(base64.urlsafe_b64decode(value + padding).decode("utf-8"))
    except (
        ValueError,
        UnicodeDecodeError,
        json.JSONDecodeError,
        binascii.Error,
    ) as exc:
        raise _pagination_error(
            "pagination_cursor_invalid",
            "Cursor pagination tidak valid.",
        ) from exc
    if (
        not isinstance(decoded, dict)
        or decoded.get("v") != CURSOR_VERSION
        or decoded.get("b") not in {"dated", "legacy"}
        or not isinstance(decoded.get("i"), str)
        or not decoded.get("i")
        or not isinstance(decoded.get("f"), str)
        or not decoded.get("f")
        or (decoded.get("b") == "dated" and not isinstance(decoded.get("u"), str))
        or (decoded.get("b") == "dated" and not decoded.get("u"))
        or (decoded.get("b") == "legacy" and decoded.get("u") is not None)
    ):
        raise _pagination_error(
            "pagination_cursor_invalid",
            "Cursor pagination tidak valid.",
        )
    if decoded.get("f") != fingerprint:
        raise _pagination_error(
            "pagination_cursor_filter_mismatch",
            "Cursor tidak cocok dengan filter pagination aktif.",
        )
    return decoded


def _combine_query(*clauses: dict) -> dict:
    active = [clause for clause in clauses if clause]
    if not active:
        return {}
    if len(active) == 1:
        return active[0]
    return {"$and": active}


async def _find(
    collection,
    query: dict,
    *,
    count: int,
    sort: list[tuple[str, int]],
) -> list[dict]:
    cursor = collection.find(query, {"_id": 0}).sort(sort).limit(count)
    return [dict(item) for item in await cursor.to_list(count)]


async def paginate_collection(
    collection,
    *,
    request: PageRequest,
    project: Callable[[dict], dict] = dict,
) -> dict[str, Any]:
    fingerprint = _filter_fingerprint(request)
    position = (
        _decode_cursor(request.cursor, fingerprint=fingerprint)
        if request.cursor
        else None
    )
    base_query = dict(request.filters)
    date_range: dict[str, Any] = {"$type": "string"}
    if request.updated_from is not None:
        date_range["$gte"] = request.updated_from
    if request.updated_before is not None:
        date_range["$lt"] = request.updated_before

    dated: list[dict] = []
    if position is None or position["b"] == "dated":
        after = {}
        if position is not None:
            after = {
                "$or": [
                    {"updated_at": {"$lt": position["u"]}},
                    {
                        "updated_at": position["u"],
                        "id": {"$lt": position["i"]},
                    },
                ]
            }
        dated = await _find(
            collection,
            _combine_query(base_query, {"updated_at": date_range}, after),
            count=request.limit + 1,
            sort=[("updated_at", -1), ("id", -1)],
        )

    items = dated[: request.limit]
    if len(dated) > request.limit:
        last = items[-1]
        return {
            "items": [project(item) for item in items],
            "next_cursor": _encode_cursor(
                last,
                bucket="dated",
                fingerprint=fingerprint,
            ),
        }

    has_date_filter = (
        request.updated_from is not None or request.updated_before is not None
    )
    legacy: list[dict] = []
    remaining = request.limit - len(items)
    if not has_date_filter:
        legacy_after = {}
        if position is not None and position["b"] == "legacy":
            legacy_after = {"id": {"$lt": position["i"]}}
        legacy = await _find(
            collection,
            _combine_query(
                base_query,
                {"updated_at": {"$not": {"$type": "string"}}},
                legacy_after,
            ),
            count=remaining + 1,
            sort=[("id", -1)],
        )
        items.extend(legacy[:remaining])

    has_more = len(legacy) > remaining
    if not has_more:
        return {"items": [project(item) for item in items], "next_cursor": None}

    last = items[-1]
    bucket = "dated" if isinstance(last.get("updated_at"), str) else "legacy"
    return {
        "items": [project(item) for item in items],
        "next_cursor": _encode_cursor(
            last,
            bucket=bucket,
            fingerprint=fingerprint,
        ),
    }
