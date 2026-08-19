import base64
import binascii
import json
import re
import uuid
from copy import deepcopy
from datetime import date, datetime, time, timezone

from retail_domain import (
    RETAIL_STATUSES,
    SUSPENDED_ACTIONS,
    RetailDomainError,
    project_retail_order,
    validate_retail_transition,
)

MAX_RETAIL_SEARCH_LENGTH = 80
DEFAULT_RETAIL_PAGE_SIZE = 50
MAX_RETAIL_PAGE_SIZE = 50
_DATE_ONLY = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def _raise_query_error(code: str, message: str) -> None:
    raise RetailDomainError(422, code, message)


def _normalize_timestamp(value: str | None, *, field: str, end_of_day: bool = False) -> str | None:
    if value is None or not value.strip():
        return None
    raw = value.strip()
    try:
        if _DATE_ONLY.fullmatch(raw):
            parsed_date = date.fromisoformat(raw)
            parsed = datetime.combine(
                parsed_date,
                time.max if end_of_day else time.min,
                tzinfo=timezone.utc,
            )
        else:
            parsed = datetime.fromisoformat(raw.replace("Z", "+00:00"))
            if parsed.tzinfo is None:
                parsed = parsed.replace(tzinfo=timezone.utc)
            parsed = parsed.astimezone(timezone.utc)
    except ValueError:
        _raise_query_error(
            "retail_timestamp_invalid",
            f"Parameter {field} harus berupa tanggal atau timestamp ISO-8601 yang valid.",
        )
    return parsed.isoformat()


def _encode_cursor(payload: dict[str, object]) -> str:
    encoded = json.dumps(payload, separators=(",", ":"), sort_keys=True).encode()
    return base64.urlsafe_b64encode(encoded).decode().rstrip("=")


def _decode_cursor(value: str) -> dict[str, object]:
    try:
        padded = value + "=" * (-len(value) % 4)
        decoded = base64.urlsafe_b64decode(padded.encode())
        payload = json.loads(decoded.decode())
    except (
        ValueError,
        TypeError,
        UnicodeDecodeError,
        json.JSONDecodeError,
        binascii.Error,
    ):
        _raise_query_error("retail_cursor_invalid", "Cursor pesanan retail tidak valid.")
    if not isinstance(payload, dict) or payload.get("v") != 1:
        _raise_query_error("retail_cursor_invalid", "Cursor pesanan retail tidak valid.")
    return payload


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class RetailOrderService:
    def __init__(self, *, db, transaction_guard):
        self.db = db
        self.transaction_guard = transaction_guard

    async def _get_order(self, order_id: str) -> dict:
        order = await self.db.retail_orders.find_one({"id": order_id}, {"_id": 0})
        if not order:
            raise RetailDomainError(
                404, "retail_order_not_found", "Pesanan retail tidak ditemukan."
            )
        return dict(order)

    async def get_order(self, order_id: str, *, actor: dict | None = None) -> dict:
        return project_retail_order(
            await self._get_order(order_id), actor=actor, detail=True
        )

    @staticmethod
    def _query_signature(
        *,
        status: str | None,
        search: str | None,
        updated_from: str | None,
        updated_to: str | None,
        limit: int,
    ) -> dict[str, object]:
        return {
            "status": status,
            "search": search,
            "updated_from": updated_from,
            "updated_to": updated_to,
            "limit": limit,
        }

    def _normalize_list_query(
        self,
        *,
        status: str | None,
        search: str | None,
        updated_from: str | None,
        updated_to: str | None,
        limit: int,
    ) -> dict[str, object]:
        normalized_status = status.strip() if isinstance(status, str) else None
        if normalized_status == "":
            normalized_status = None
        if normalized_status is not None and normalized_status not in RETAIL_STATUSES:
            _raise_query_error(
                "retail_status_invalid",
                "Status pesanan retail tidak dikenali.",
            )

        normalized_search = search.strip() if isinstance(search, str) else None
        if normalized_search == "":
            normalized_search = None
        if normalized_search and len(normalized_search) > MAX_RETAIL_SEARCH_LENGTH:
            _raise_query_error(
                "retail_search_too_long",
                "Pencarian pesanan retail terlalu panjang.",
            )

        normalized_from = _normalize_timestamp(
            updated_from, field="updated_from"
        )
        normalized_to = _normalize_timestamp(
            updated_to, field="updated_to", end_of_day=True
        )
        if normalized_from and normalized_to and normalized_from > normalized_to:
            _raise_query_error(
                "retail_date_range_invalid",
                "Rentang tanggal pembaruan pesanan retail tidak valid.",
            )
        if isinstance(limit, bool) or not isinstance(limit, int):
            _raise_query_error("retail_limit_invalid", "Limit pesanan retail tidak valid.")
        if not 1 <= limit <= MAX_RETAIL_PAGE_SIZE:
            _raise_query_error("retail_limit_invalid", "Limit pesanan retail tidak valid.")
        return {
            "status": normalized_status,
            "search": normalized_search,
            "updated_from": normalized_from,
            "updated_to": normalized_to,
            "limit": limit,
        }

    async def list_orders(
        self,
        *,
        status: str | None = None,
        search: str | None = None,
        updated_from: str | None = None,
        updated_to: str | None = None,
        limit: int = DEFAULT_RETAIL_PAGE_SIZE,
        cursor: str | None = None,
        actor: dict | None = None,
    ) -> dict[str, object]:
        normalized = self._normalize_list_query(
            status=status,
            search=search,
            updated_from=updated_from,
            updated_to=updated_to,
            limit=limit,
        )
        query_parts: list[dict[str, object]] = []
        if normalized["status"]:
            query_parts.append({"status": normalized["status"]})
        if normalized["updated_from"]:
            query_parts.append({"updated_at": {"$gte": normalized["updated_from"]}})
        if normalized["updated_to"]:
            query_parts.append({"updated_at": {"$lte": normalized["updated_to"]}})
        if normalized["search"]:
            pattern = re.escape(str(normalized["search"]))
            query_parts.append(
                {
                    "$or": [
                        {"order_number": {"$regex": pattern, "$options": "i"}},
                        {"customer.name": {"$regex": pattern, "$options": "i"}},
                        {"customer.email": {"$regex": pattern, "$options": "i"}},
                    ]
                }
            )

        if cursor:
            if len(cursor) > 512:
                _raise_query_error(
                    "retail_cursor_invalid", "Cursor pesanan retail tidak valid."
                )
            decoded = _decode_cursor(cursor)
            expected_signature = self._query_signature(**normalized)
            if decoded.get("filters") != expected_signature:
                _raise_query_error(
                    "retail_cursor_invalid",
                    "Cursor pesanan retail tidak cocok dengan filter saat ini.",
                )
            cursor_updated_at = decoded.get("updated_at")
            cursor_id = decoded.get("id")
            if not isinstance(cursor_updated_at, str) or not isinstance(cursor_id, str):
                _raise_query_error("retail_cursor_invalid", "Cursor pesanan retail tidak valid.")
            query_parts.append(
                {
                    "$or": [
                        {"updated_at": {"$lt": cursor_updated_at}},
                        {
                            "updated_at": cursor_updated_at,
                            "id": {"$lt": cursor_id},
                        },
                    ]
                }
            )

        query: dict[str, object]
        if not query_parts:
            query = {}
        elif len(query_parts) == 1:
            query = query_parts[0]
        else:
            query = {"$and": query_parts}
        documents = (
            await self.db.retail_orders.find(query, {"_id": 0})
            .sort([("updated_at", -1), ("id", -1)])
            .limit(normalized["limit"] + 1)
            .to_list(normalized["limit"] + 1)
        )
        has_more = len(documents) > normalized["limit"]
        page = documents[: normalized["limit"]]
        next_cursor = None
        if has_more and page:
            last = page[-1]
            next_cursor = _encode_cursor(
                {
                    "v": 1,
                    "id": last.get("id"),
                    "updated_at": last.get("updated_at"),
                    "filters": self._query_signature(**normalized),
                }
            )
        return {
            "items": [
                project_retail_order(document, actor=actor, detail=False)
                for document in page
            ],
            "next_cursor": next_cursor,
        }

    async def _next_order_number(self, session) -> str:
        """Draw the next number from a counter, not from a document count.

        Counting documents to derive a number is a race: two orders created at
        once read the same count and claim the same number. A counter advanced
        inside the order's own transaction hands out each number exactly once.
        """
        stamp = datetime.now(timezone.utc).strftime("%y%m")
        counter = await self.db.retail_order_counters.find_one_and_update(
            {"id": stamp},
            {"$inc": {"sequence": 1}},
            upsert=True,
            return_document=True,
            session=session,
        )
        return f"NIV-R-{stamp}-{counter['sequence']:04d}"

    async def create_order(
        self,
        *,
        operation_id: str,
        customer: dict,
        items: list[dict],
        fulfilment_method: str,
        notes: str,
        actor: dict,
    ) -> dict:
        existing = await self.db.retail_orders.find_one(
            {"creation_operation_id": operation_id}, {"_id": 0}
        )
        if existing:
            return project_retail_order(existing, actor=actor, detail=True)

        if not items:
            raise RetailDomainError(
                422,
                "retail_items_required",
                "Pesanan retail memerlukan minimal satu item.",
            )

        snapshots = await self._build_item_snapshots(items)
        total_minor = sum(item["line_total_minor"] for item in snapshots)

        timestamp = now_iso()
        order_id = str(uuid.uuid4())
        event = {
            "event": "order_created",
            "from_status": None,
            "to_status": "created",
            "actor_user_id": actor.get("id"),
            "reason": "Pesanan retail dibuat",
            "operation_id": operation_id,
            "timestamp": timestamp,
        }

        async def mutation(session):
            order = {
                "id": order_id,
                "order_number": await self._next_order_number(session),
                "creation_operation_id": operation_id,
                "customer": deepcopy(customer),
                "items": snapshots,
                "currency": "IDR",
                "total_minor": total_minor,
                "fulfilment_method": fulfilment_method,
                "notes": notes.strip(),
                "status": "created",
                "version": 1,
                "history": [event],
                "created_at": timestamp,
                "updated_at": timestamp,
            }
            await self.db.retail_orders.insert_one(
                deepcopy(order), **{"session": session}
            )
            return project_retail_order(order, actor=actor, detail=True)

        if self.transaction_guard is None:
            raise RetailDomainError(
                503,
                "transaction_unavailable",
                "Pembuatan pesanan retail tidak tersedia tanpa transaction guard.",
            )
        return await self.transaction_guard.run(
            mutation,
            operation_name="retail.create_order",
            retry_safe=True,
            correlation_id=operation_id,
        )

    async def _build_item_snapshots(self, items: list[dict]) -> list[dict]:
        """Freeze what each line commits to at the moment it is ordered."""
        variant_ids = sorted(
            {
                str(item["variant_id"]).strip()
                for item in items
                if item.get("variant_id")
            }
        )
        if not variant_ids:
            raise RetailDomainError(
                422,
                "retail_item_variant_required",
                "Setiap item pesanan retail harus menunjuk varian produk.",
            )

        variants = await self.db.product_variants.find(
            {"id": {"$in": variant_ids}}, {"_id": 0}
        ).to_list(len(variant_ids))
        variants_by_id = {item["id"]: item for item in variants}
        missing = [item for item in variant_ids if item not in variants_by_id]
        if missing:
            raise RetailDomainError(
                422,
                "retail_item_variant_not_found",
                "Varian produk pada item pesanan tidak ditemukan.",
                details={"variant_ids": missing},
            )

        product_ids = sorted(
            {
                variant["product_id"]
                for variant in variants_by_id.values()
                if variant.get("product_id")
            }
        )
        products = (
            await self.db.products.find(
                {"id": {"$in": product_ids}}, {"_id": 0}
            ).to_list(len(product_ids))
            if product_ids
            else []
        )
        products_by_id = {item["id"]: item for item in products}

        snapshots = []
        for item in items:
            variant = variants_by_id[str(item["variant_id"]).strip()]
            product = products_by_id.get(variant.get("product_id")) or {}
            quantity = int(item["quantity"])
            # Price comes from the catalog, never from the caller: a client
            # supplied price would let anyone name their own total.
            unit_price_minor = int(variant.get("fixed_price") or 0)
            if unit_price_minor <= 0:
                raise RetailDomainError(
                    422,
                    "retail_item_not_priced",
                    "Varian tidak memiliki harga tetap dan tidak dapat dipesan retail.",
                    details={"variant_id": variant["id"]},
                )
            snapshots.append(
                {
                    "variant_id": variant["id"],
                    "quantity": quantity,
                    "unit_price_minor": unit_price_minor,
                    "line_total_minor": quantity * unit_price_minor,
                    "product_snapshot": {
                        "product_id": product.get("id"),
                        "name": product.get("name", ""),
                        "slug": product.get("slug", ""),
                    },
                    "configuration_snapshot": {
                        "variant_id": variant["id"],
                        "sku": variant.get("sku", ""),
                        "name": variant.get("name", ""),
                        "option_values": deepcopy(variant.get("option_values") or {}),
                        "production_type": variant.get("production_type", ""),
                    },
                    "price_snapshot": {
                        "currency": variant.get("currency", "IDR"),
                        "unit_price_minor": unit_price_minor,
                        "captured_at": now_iso(),
                    },
                }
            )
        return snapshots

    async def transition_order(
        self,
        order_id: str,
        *,
        target_status: str,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        order = await self._get_order(order_id)

        for event in order.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("to_status") != target_status:
                    raise RetailDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi berbeda.",
                    )
                return project_retail_order(order, actor=actor, detail=True)

        if order["version"] != expected_version:
            raise RetailDomainError(
                409,
                "version_conflict",
                "Pesanan retail telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": order["version"],
                    "current_status": order["status"],
                    "permitted_next_actions": project_retail_order(order, actor=actor)[
                        "permitted_next_actions"
                    ],
                },
            )

        validate_retail_transition(order["status"], target_status, reason=reason)

        timestamp = now_iso()
        event = {
            "from_status": order["status"],
            "to_status": target_status,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [*order.get("history", []), event],
            "updated_at": timestamp,
        }
        result = await self.db.retail_orders.update_one(
            {"id": order_id, "version": expected_version, "status": order["status"]},
            {"$set": changes},
        )
        if not result.matched_count:
            raise RetailDomainError(
                409, "version_conflict", "Pesanan retail berubah selama transisi."
            )
        return project_retail_order({**order, **changes}, actor=actor, detail=True)

    async def refuse_suspended_action(self, action: str) -> None:
        """Answer a withheld action with its reason, not as an unknown route."""
        code = SUSPENDED_ACTIONS.get(action)
        if code is None:
            raise RetailDomainError(
                404, "retail_action_unknown", "Aksi pesanan retail tidak dikenali."
            )
        raise RetailDomainError(
            409,
            code,
            "Aksi ini dinonaktifkan sampai kebijakan dan penyedia pembayaran disetujui.",
        )
