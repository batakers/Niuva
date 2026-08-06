"""Pure Retail checkout-intent and authoritative snapshot contract.

This module deliberately has no database, HTTP, inventory, payment-provider,
or environment dependency. It is the first implementation slice of the
Commerce Transaction task: it makes the server-owned commercial input shape
explicit while the runtime checkout capability remains inactive.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from copy import deepcopy
from typing import Any


_ALLOWED_INTENT_FIELDS = frozenset(
    {"customer_id", "operation_id", "items", "fulfilment_method"}
)
_ALLOWED_ITEM_FIELDS = frozenset({"variant_id", "quantity"})
_ALLOWED_FULFILMENT_METHODS = frozenset({"ship", "pickup"})
_ALLOWED_PRICING_MODE = "fixed"
_ALLOWED_FULFILMENT_MODE = "ready_stock"


class RetailCheckoutContractError(ValueError):
    """A safe, transport-neutral validation failure for the checkout boundary."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = dict(details or {})

    def payload(self) -> dict[str, Any]:
        return {
            "code": self.code,
            "message": self.message,
            **({"details": deepcopy(self.details)} if self.details else {}),
        }


def _require_text(value: Any, *, code: str, field: str, maximum: int = 200) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise RetailCheckoutContractError(
            code,
            f"{field} harus berupa teks yang valid.",
            details={"field": field},
        )
    return value.strip()


def _reject_unknown_fields(
    value: Mapping[str, Any], *, allowed: frozenset[str], field: str
) -> None:
    unknown = sorted(set(value) - allowed)
    if unknown:
        raise RetailCheckoutContractError(
            "checkout_unknown_field",
            f"Field {field} tidak diizinkan pada kontrak checkout.",
            details={"field": field, "unknown_fields": unknown},
        )


def normalize_checkout_intent(payload: Mapping[str, Any]) -> dict[str, Any]:
    """Normalize only client-controlled checkout intent fields.

    Authentication must resolve ``customer_id`` before this function is
    called. Authoritative price, stock, tax, payment, provider, and total data
    are intentionally not accepted as input.
    """

    if not isinstance(payload, Mapping):
        raise RetailCheckoutContractError(
            "checkout_payload_invalid", "Input checkout harus berupa object."
        )
    _reject_unknown_fields(payload, allowed=_ALLOWED_INTENT_FIELDS, field="intent")

    customer_id = _require_text(
        payload.get("customer_id"),
        code="checkout_customer_required",
        field="customer_id",
    )
    operation_id = _require_text(
        payload.get("operation_id"),
        code="checkout_operation_required",
        field="operation_id",
    )
    fulfilment_method = payload.get("fulfilment_method")
    if fulfilment_method not in _ALLOWED_FULFILMENT_METHODS:
        raise RetailCheckoutContractError(
            "checkout_fulfilment_invalid",
            "Metode fulfilment checkout tidak diizinkan.",
            details={"field": "fulfilment_method"},
        )

    raw_items = payload.get("items")
    if not isinstance(raw_items, (list, tuple)) or not raw_items:
        raise RetailCheckoutContractError(
            "checkout_items_required", "Checkout memerlukan minimal satu item."
        )

    items: list[dict[str, Any]] = []
    seen_variants: set[str] = set()
    for index, raw_item in enumerate(raw_items):
        if not isinstance(raw_item, Mapping):
            raise RetailCheckoutContractError(
                "checkout_item_invalid",
                "Setiap item checkout harus berupa object.",
                details={"index": index},
            )
        _reject_unknown_fields(
            raw_item, allowed=_ALLOWED_ITEM_FIELDS, field=f"items[{index}]"
        )
        variant_id = _require_text(
            raw_item.get("variant_id"),
            code="checkout_variant_required",
            field=f"items[{index}].variant_id",
        )
        quantity = raw_item.get("quantity")
        if isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1:
            raise RetailCheckoutContractError(
                "checkout_quantity_invalid",
                "Quantity checkout harus berupa bilangan bulat positif.",
                details={"index": index},
            )
        if variant_id in seen_variants:
            raise RetailCheckoutContractError(
                "checkout_duplicate_variant",
                "Variant yang sama harus digabung sebelum checkout.",
                details={"variant_id": variant_id},
            )
        seen_variants.add(variant_id)
        items.append({"variant_id": variant_id, "quantity": quantity})

    return {
        "customer_id": customer_id,
        "operation_id": operation_id,
        "fulfilment_method": fulfilment_method,
        "items": items,
    }


def checkout_request_fingerprint(payload: Mapping[str, Any]) -> str:
    """Return a stable fingerprint of client intent, excluding server facts.

    ``operation_id`` is the idempotency key and is intentionally excluded from
    the fingerprint. Reusing that key with a different customer/cart intent
    therefore remains detectable as a conflict.
    """

    normalized = normalize_checkout_intent(payload)
    fingerprint_input = {
        "customer_id": normalized["customer_id"],
        "fulfilment_method": normalized["fulfilment_method"],
        "items": normalized["items"],
    }
    encoded = json.dumps(
        fingerprint_input,
        ensure_ascii=True,
        separators=(",", ":"),
        sort_keys=True,
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def _require_positive_minor(value: Any, *, field: str) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value <= 0:
        raise RetailCheckoutContractError(
            "checkout_authoritative_price_invalid",
            "Harga authoritative harus berupa bilangan bulat positif.",
            details={"field": field},
        )
    return value


def _require_revision(value: Any) -> int:
    if isinstance(value, bool) or not isinstance(value, int) or value < 1:
        raise RetailCheckoutContractError(
            "checkout_publication_revision_invalid",
            "Publication revision authoritative tidak valid.",
        )
    return value


def build_fixed_price_snapshot(
    payload: Mapping[str, Any],
    authoritative_variants: Mapping[str, Mapping[str, Any]],
    *,
    tax_profile_version: str | None,
    fulfilment_policy_version: str | None,
    captured_at: str,
) -> dict[str, Any]:
    """Build detached, customer-safe commercial facts from server inputs.

    The caller owns authentication, active-publication lookup, availability
    lookup, and transaction orchestration. This function only accepts their
    already-authoritative result and refuses unsupported or activation-gated
    records rather than guessing a price or policy.
    """

    normalized = normalize_checkout_intent(payload)
    captured_at = _require_text(
        captured_at,
        code="checkout_capture_time_required",
        field="captured_at",
        maximum=100,
    )
    tax_profile_version = _require_text(
        tax_profile_version,
        code="checkout_tax_profile_required",
        field="tax_profile_version",
    )
    fulfilment_policy_version = _require_text(
        fulfilment_policy_version,
        code="checkout_fulfilment_policy_required",
        field="fulfilment_policy_version",
    )
    if not isinstance(authoritative_variants, Mapping):
        raise RetailCheckoutContractError(
            "checkout_catalog_invalid",
            "Catalog authoritative checkout harus berupa mapping variant.",
        )

    line_items: list[dict[str, Any]] = []
    currency: str | None = None
    for requested in normalized["items"]:
        variant_id = requested["variant_id"]
        record = authoritative_variants.get(variant_id)
        if not isinstance(record, Mapping):
            raise RetailCheckoutContractError(
                "checkout_catalog_missing",
                "Variant checkout tidak tersedia pada publication authoritative.",
                details={"variant_id": variant_id},
            )

        pricing_mode = record.get("pricing_mode")
        if pricing_mode == "quote_required":
            raise RetailCheckoutContractError(
                "checkout_quote_required",
                "Item ini harus masuk jalur quote_required.",
                details={"variant_id": variant_id},
            )
        if pricing_mode != _ALLOWED_PRICING_MODE:
            raise RetailCheckoutContractError(
                "checkout_pricing_mode_unavailable",
                "Item ini belum memiliki pricing mode checkout yang aktif.",
                details={"variant_id": variant_id},
            )
        if record.get("fulfilment_mode") != _ALLOWED_FULFILMENT_MODE:
            raise RetailCheckoutContractError(
                "checkout_fulfilment_mode_unavailable",
                "Item ini belum eligible untuk ready-stock checkout.",
                details={"variant_id": variant_id},
            )

        item_currency = _require_text(
            record.get("currency"),
            code="checkout_currency_required",
            field=f"catalog[{variant_id}].currency",
            maximum=20,
        )
        if currency is None:
            currency = item_currency
        elif currency != item_currency:
            raise RetailCheckoutContractError(
                "checkout_currency_mismatch",
                "Satu checkout tidak boleh mencampur currency.",
            )

        unit_price_minor = _require_positive_minor(
            record.get("unit_price_minor"),
            field=f"catalog[{variant_id}].unit_price_minor",
        )
        product_id = _require_text(
            record.get("product_id"),
            code="checkout_product_snapshot_invalid",
            field=f"catalog[{variant_id}].product_id",
        )
        product_name = _require_text(
            record.get("product_name"),
            code="checkout_product_snapshot_invalid",
            field=f"catalog[{variant_id}].product_name",
            maximum=500,
        )
        product_slug = _require_text(
            record.get("product_slug"),
            code="checkout_product_snapshot_invalid",
            field=f"catalog[{variant_id}].product_slug",
            maximum=200,
        )
        sku = _require_text(
            record.get("sku"),
            code="checkout_variant_snapshot_invalid",
            field=f"catalog[{variant_id}].sku",
        )
        variant_name = _require_text(
            record.get("variant_name"),
            code="checkout_variant_snapshot_invalid",
            field=f"catalog[{variant_id}].variant_name",
            maximum=500,
        )
        option_values = record.get("option_values", {})
        if not isinstance(option_values, Mapping):
            raise RetailCheckoutContractError(
                "checkout_variant_snapshot_invalid",
                "Option values authoritative harus berupa object.",
                details={"variant_id": variant_id},
            )
        publication_revision = _require_revision(record.get("publication_revision"))
        quantity = requested["quantity"]
        line_total_minor = unit_price_minor * quantity

        line_items.append(
            {
                "variant_id": variant_id,
                "quantity": quantity,
                "unit_price_minor": unit_price_minor,
                "line_total_minor": line_total_minor,
                "currency": item_currency,
                "product_snapshot": {
                    "product_id": product_id,
                    "name": product_name,
                    "slug": product_slug,
                },
                "variant_snapshot": {
                    "sku": sku,
                    "name": variant_name,
                    "option_values": deepcopy(dict(option_values)),
                },
                "publication_snapshot": {
                    "revision": publication_revision,
                },
                "price_snapshot": {
                    "pricing_mode": _ALLOWED_PRICING_MODE,
                    "currency": item_currency,
                    "unit_price_minor": unit_price_minor,
                    "captured_at": captured_at,
                },
            }
        )

    assert currency is not None
    return {
        "customer_id": normalized["customer_id"],
        "operation_id": normalized["operation_id"],
        "fulfilment_method": normalized["fulfilment_method"],
        "currency": currency,
        "total_minor": sum(item["line_total_minor"] for item in line_items),
        "request_fingerprint": checkout_request_fingerprint(normalized),
        "tax_profile_version": tax_profile_version,
        "fulfilment_policy_version": fulfilment_policy_version,
        "items": line_items,
    }
