import re
import uuid
from copy import deepcopy
from decimal import Decimal

PUBLIC_PRODUCT_FIELDS = frozenset(
    {
        "id",
        "name",
        "slug",
        "short_description",
        "description",
        "media",
        "seo_title",
        "seo_description",
        "pricing_mode",
        "price_from",
        "currency",
        "retail_cta_enabled",
        "b2b_cta_enabled",
        "stock_visibility",
    }
)
PUBLIC_VARIANT_FIELDS = frozenset(
    {
        "id",
        "sku",
        "name",
        "option_values",
        "fixed_price",
        "currency",
        "production_type",
    }
)
PUBLIC_OPTION_FIELDS = frozenset(
    {
        "id",
        "code",
        "name",
        "label",
        "type",
        "value",
        "allowed_values",
        "min_value",
        "max_value",
        "required",
        "display_order",
        "sort_order",
    }
)


def normalize_slug(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.strip().lower())
    return normalized.strip("-")


def _error(code: str, field: str, message: str) -> dict:
    return {"code": code, "field": field, "message": message}


def validate_catalog_aggregate(aggregate: dict) -> list[dict]:
    category = aggregate.get("category") or {}
    product = aggregate.get("product") or {}
    all_variants = aggregate.get("variants") or []
    variants = [item for item in all_variants if item.get("status") == "active"]
    errors: list[dict] = []

    if category.get("status") != "active":
        errors.append(
            _error(
                "category_inactive",
                "category_id",
                "Kategori harus aktif sebelum produk dipublikasikan.",
            )
        )

    for field in ("name", "slug", "short_description", "description"):
        if not str(product.get(field, "")).strip():
            errors.append(_error("required", field, f"{field} wajib diisi."))

    media = product.get("media") or []
    if not media or any(
        not str(item.get("storage_path", "")).strip()
        or not str(item.get("alt", "")).strip()
        for item in media
    ):
        errors.append(
            _error(
                "media_required",
                "media",
                "Media dengan storage path dan alt text wajib diisi.",
            )
        )

    if not variants:
        errors.append(
            _error(
                "variant_required",
                "variants",
                "Minimal satu varian aktif wajib tersedia.",
            )
        )

    normalized_skus = [
        str(item.get("sku", "")).strip().upper()
        for item in all_variants
        if str(item.get("sku", "")).strip()
    ]
    if len(normalized_skus) != len(set(normalized_skus)):
        errors.append(
            _error(
                "duplicate_variant_sku",
                "variants.sku",
                "SKU varian harus unik.",
            )
        )

    pricing_mode = product.get("pricing_mode")
    if pricing_mode == "fixed" and variants:
        if any(int(item.get("fixed_price") or 0) <= 0 for item in variants):
            errors.append(
                _error(
                    "fixed_price_required",
                    "variants.fixed_price",
                    "Harga tetap varian aktif wajib lebih dari nol.",
                )
            )
    elif pricing_mode == "calculated":
        if not product.get("pricing_rule_reference") or int(
            product.get("price_from") or 0
        ) <= 0:
            errors.append(
                _error(
                    "calculated_metadata_required",
                    "pricing",
                    "Referensi aturan dan harga mulai wajib diisi.",
                )
            )
    elif pricing_mode == "quote_required" and not product.get("b2b_cta_enabled"):
        errors.append(
            _error(
                "rfq_cta_required",
                "b2b_cta_enabled",
                "CTA B2B/RFQ wajib aktif untuk produk yang memerlukan penawaran.",
            )
        )

    if not product.get("retail_cta_enabled") and not product.get("b2b_cta_enabled"):
        errors.append(
            _error(
                "cta_required",
                "retail_cta_enabled",
                "Minimal satu CTA produk wajib aktif.",
            )
        )

    if any(
        item.get("production_type") == "ready_stock"
        and not item.get("inventory_tracking_enabled")
        for item in variants
    ):
        errors.append(
            _error(
                "inventory_tracking_required",
                "variants.inventory_tracking_enabled",
                "Varian ready-stock wajib melacak inventory.",
            )
        )

    return errors


def build_publication_snapshot(
    aggregate: dict,
    *,
    revision: int,
    actor_id: str,
    reason: str,
    published_at: str,
) -> dict:
    product = {
        key: deepcopy(value)
        for key, value in aggregate["product"].items()
        if key in PUBLIC_PRODUCT_FIELDS
    }
    variants = [
        {
            key: deepcopy(value)
            for key, value in item.items()
            if key in PUBLIC_VARIANT_FIELDS
        }
        for item in aggregate.get("variants", [])
        if item.get("status") == "active"
    ]
    options = [
        {
            key: deepcopy(value)
            for key, value in item.items()
            if key in PUBLIC_OPTION_FIELDS
        }
        for item in aggregate.get("options", [])
        if item.get("active", True)
    ]
    category = {
        key: deepcopy(aggregate["category"][key])
        for key in ("id", "name", "slug")
    }
    return {
        "id": str(uuid.uuid4()),
        "product_id": product["id"],
        "revision": revision,
        "category": category,
        "product": product,
        "variants": variants,
        "options": options,
        "published_at": published_at,
        "published_by": actor_id,
        "publish_reason": reason,
    }


def public_stock_status(
    production_type: str,
    available: Decimal,
    reorder_point: Decimal,
) -> str:
    if production_type == "made_to_order":
        return "made_to_order"
    if available <= 0:
        return "out_of_stock"
    if available <= reorder_point:
        return "low_stock"
    return "in_stock"


def project_publication_for_public(
    snapshot: dict,
    stock_by_variant: dict,
) -> dict:
    public = deepcopy(snapshot)
    public.pop("published_by", None)
    public.pop("publish_reason", None)

    for variant in public.get("variants", []):
        stock = stock_by_variant.get(variant["id"], {})
        available = Decimal(str(stock.get("available", "0")))
        reorder_point = Decimal(str(stock.get("reorder_point", "0")))
        variant["stock_status"] = public_stock_status(
            variant.get("production_type", "made_to_order"),
            available,
            reorder_point,
        )

    return public
