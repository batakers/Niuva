from datetime import datetime
from decimal import Decimal
from typing import Any, Literal

from api_contract import error_responses
from catalog_service import CatalogError, CatalogService
from fastapi import APIRouter, Depends, HTTPException, status
from permissions import has_permission
from pydantic import BaseModel, ConfigDict, Field


class CategoryPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(default="", max_length=200)
    description: str = Field(default="", max_length=2000)
    sort_order: int = Field(default=0, ge=0)
    status: Literal["active", "archived"] = "active"


class MediaPayload(BaseModel):
    storage_path: str = Field(min_length=1, max_length=1000)
    alt: str = Field(min_length=1, max_length=500)


class ProductPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = Field(default=None, exclude=True)
    workflow_status: str | None = Field(default=None, exclude=True)
    active_publication_id: str | None = Field(default=None, exclude=True)
    created_at: str | None = Field(default=None, exclude=True)
    created_by: str | None = Field(default=None, exclude=True)
    updated_at: str | None = Field(default=None, exclude=True)
    updated_by: str | None = Field(default=None, exclude=True)
    category_id: str
    name: str = Field(min_length=2, max_length=200)
    slug: str = Field(default="", max_length=200)
    short_description: str = Field(default="", max_length=500)
    description: str = Field(default="", max_length=5000)
    media: list[MediaPayload] = Field(default_factory=list)
    seo_title: str = Field(default="", max_length=200)
    seo_description: str = Field(default="", max_length=500)
    pricing_mode: Literal["fixed", "calculated", "quote_required"] = "quote_required"
    price_from: int = Field(default=0, ge=0)
    currency: Literal["IDR"] = "IDR"
    pricing_rule_reference: str | None = None
    retail_cta_enabled: bool = True
    b2b_cta_enabled: bool = True
    stock_visibility: Literal["status_only", "made_to_order"] = "status_only"


class BomEntryPayload(BaseModel):
    """One material requirement per produced unit of a variant."""

    model_config = ConfigDict(extra="forbid")

    material_id: str = Field(min_length=1, max_length=100)
    quantity_per_unit: Decimal = Field(gt=0)


class VariantPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    product_id: str | None = Field(default=None, exclude=True)
    created_at: str | None = Field(default=None, exclude=True)
    created_by: str | None = Field(default=None, exclude=True)
    updated_at: str | None = Field(default=None, exclude=True)
    updated_by: str | None = Field(default=None, exclude=True)
    sku: str = Field(min_length=2, max_length=100)
    name: str = Field(min_length=1, max_length=200)
    option_values: dict = Field(default_factory=dict)
    fixed_price: int | None = Field(default=None, ge=0)
    currency: Literal["IDR"] = "IDR"
    production_type: Literal["ready_stock", "made_to_order"]
    inventory_tracking_enabled: bool = False
    reorder_point: Decimal = Field(default=Decimal("0"), ge=0)
    bill_of_materials: list[BomEntryPayload] = Field(default_factory=list)
    status: Literal["active", "archived"] = "active"


class VariantListPayload(BaseModel):
    variants: list[VariantPayload]


class OptionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    product_id: str | None = Field(default=None, exclude=True)
    created_at: str | None = Field(default=None, exclude=True)
    created_by: str | None = Field(default=None, exclude=True)
    updated_at: str | None = Field(default=None, exclude=True)
    updated_by: str | None = Field(default=None, exclude=True)
    code: str = Field(min_length=1, max_length=100)
    label: str = Field(min_length=1, max_length=200)
    type: Literal["select", "number", "text", "file", "boolean"]
    allowed_values: list[str] = Field(default_factory=list)
    min_value: Decimal | None = None
    max_value: Decimal | None = None
    required: bool = False
    active: bool = True
    display_order: int = Field(default=0, ge=0)


class OptionListPayload(BaseModel):
    options: list[OptionPayload]


class ReasonPayload(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


class RollbackPayload(ReasonPayload):
    publication_id: str


class BulkArchivePayload(ReasonPayload):
    product_ids: list[str] = Field(min_length=1, max_length=100)


class PublicCatalogCategoryResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    slug: str


class PublicCatalogProductResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    product_id: str
    revision: int
    category: dict[str, Any]
    product: dict[str, Any]
    variants: list[dict[str, Any]]
    options: list[dict[str, Any]]
    published_at: str | datetime
    cta_state: Literal["unavailable", "quote_required", "discovery_only"]
    rollback_source_publication_id: str | None = None


class PublicCatalogPageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    items: list[PublicCatalogProductResponse]
    next_cursor: str | None


def build_catalog_router(
    *,
    get_db,
    get_client,
    get_capabilities,
    get_guard,
    require_permission,
) -> APIRouter:
    router = APIRouter(tags=["catalog"])

    def reject_operations_pricing(actor: dict, fields: set[str]):
        if has_permission(actor, "pricing.write") or has_permission(
            actor, "pricing.override"
        ):
            return
        for field in (
            "pricing_mode",
            "price_from",
            "pricing_rule_reference",
            "currency",
            "fixed_price",
        ):
            if field in fields:
                raise HTTPException(status_code=403, detail={
                    "code": "catalog_field_forbidden",
                    "field": field,
                    "message": f"Operations cannot write {field}.",
                })

    def reject_variant_lifecycle(actor: dict, fields: set[str]):
        if "status" in fields and not has_permission(actor, "catalog.publish"):
            raise HTTPException(
                status_code=403,
                detail={
                    "code": "catalog_lifecycle_forbidden",
                    "field": "status",
                    "message": "Only an approver can change variant lifecycle.",
                },
            )

    def reject_operations_category_lifecycle(actor: dict, fields: set[str], *, requested_status: str, current_status: str | None = None):
        if has_permission(actor, "catalog.publish"):
            return
        if current_status == "archived":
            raise HTTPException(status_code=403, detail={"code": "catalog_lifecycle_forbidden", "message": "Operations cannot update archived categories."})
        if "status" in fields and requested_status != "active":
            raise HTTPException(status_code=403, detail={"code": "catalog_lifecycle_forbidden", "field": "status", "message": "Operations cannot change category status."})
    async def reject_operations_archived_product(actor: dict, product_id: str):
        if has_permission(actor, "catalog.publish"):
            return
        current = await invoke(service().get_product(product_id))
        if current["product"].get("workflow_status") == "archived":
            raise HTTPException(
                status_code=403,
                detail={"code": "catalog_lifecycle_forbidden", "message": "Operations cannot update archived products."},
            )
    def service() -> CatalogService:
        return CatalogService(
            get_db(), get_client(), get_capabilities(), get_guard()
        )

    async def invoke(awaitable):
        try:
            return await awaitable
        except CatalogError as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.payload(),
            ) from exc

    @router.get("/admin/categories")
    async def list_categories(
        _actor: dict = Depends(require_permission("catalog.read")),
    ):
        return await invoke(service().list_categories())

    @router.post("/admin/categories", status_code=status.HTTP_201_CREATED)
    async def create_category(
        payload: CategoryPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        reject_operations_category_lifecycle(actor, payload.model_fields_set, requested_status=payload.status)
        return await invoke(
            service().create_category(payload.model_dump(mode="json"), actor)
        )

    @router.get("/admin/categories/{category_id}")
    async def get_category(
        category_id: str,
        _actor: dict = Depends(require_permission("catalog.read")),
    ):
        return await invoke(service().get_category(category_id))

    @router.put("/admin/categories/{category_id}")
    async def update_category(
        category_id: str,
        payload: CategoryPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        current = await invoke(service().get_category(category_id))
        reject_operations_category_lifecycle(actor, payload.model_fields_set, requested_status=payload.status, current_status=current.get("status"))
        return await invoke(
            service().update_category(
                category_id, payload.model_dump(mode="json", exclude_unset=not has_permission(actor, "catalog.publish")), actor
            )
        )

    @router.post("/admin/categories/{category_id}/archive")
    async def archive_category(
        category_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("catalog.archive")),
    ):
        return await invoke(
            service().archive_category(category_id, actor, payload.reason)
        )

    @router.get("/admin/products")
    async def list_products(
        _actor: dict = Depends(require_permission("catalog.read")),
    ):
        return await invoke(service().list_products())

    @router.post("/admin/products", status_code=status.HTTP_201_CREATED)
    async def create_product(
        payload: ProductPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        reject_operations_pricing(actor, payload.model_fields_set)
        return await invoke(
            service().create_product(payload.model_dump(mode="json"), actor)
        )

    @router.get("/admin/catalog/quotable-variants")
    async def list_quotable_variants(
        _actor: dict = Depends(require_permission("catalog.read")),
    ):
        """Active variants a quotation line may reference."""
        return await invoke(service().list_quotable_variants())

    @router.get("/admin/products/{product_id}")
    async def get_product(
        product_id: str,
        _actor: dict = Depends(require_permission("catalog.read")),
    ):
        return await invoke(service().get_product(product_id))

    @router.put("/admin/products/{product_id}")
    async def update_product(
        product_id: str,
        payload: ProductPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        reject_operations_pricing(actor, payload.model_fields_set)
        await reject_operations_archived_product(actor, product_id)
        return await invoke(
            service().update_product(
                product_id, payload.model_dump(mode="json", exclude_unset=not has_permission(actor, "catalog.publish")), actor
            )
        )

    @router.put("/admin/products/{product_id}/variants")
    async def replace_variants(
        product_id: str,
        payload: VariantListPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        await reject_operations_archived_product(actor, product_id)
        for item in payload.variants:
            reject_operations_pricing(actor, item.model_fields_set)
            reject_variant_lifecycle(actor, item.model_fields_set)
        values = [
            item.model_dump(
                mode="json",
                exclude_unset=not has_permission(actor, "catalog.publish"),
            )
            for item in payload.variants
        ]
        return await invoke(service().replace_variants(product_id, values, actor))

    @router.put("/admin/products/{product_id}/options")
    async def replace_options(
        product_id: str,
        payload: OptionListPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        await reject_operations_archived_product(actor, product_id)
        values = [item.model_dump(mode="json") for item in payload.options]
        return await invoke(service().replace_options(product_id, values, actor))

    @router.post("/admin/products/{product_id}/validate")
    async def validate_product(
        product_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("catalog.write")),
    ):
        return await invoke(
            service().submit_publication_candidate(
                product_id,
                actor=actor,
                reason=payload.reason,
            )
        )

    @router.post("/admin/products/{product_id}/publish")
    async def publish_product(
        product_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("catalog.publish")),
    ):
        return await invoke(
            service().publish_product(product_id, actor, payload.reason)
        )

    @router.post("/admin/products/{product_id}/rollback")
    async def rollback_product(
        product_id: str,
        payload: RollbackPayload,
        actor: dict = Depends(require_permission("catalog.publish")),
    ):
        return await invoke(
            service().rollback_product(
                product_id,
                payload.publication_id,
                actor,
                payload.reason,
            )
        )

    @router.post("/admin/products/{product_id}/archive")
    async def archive_product(
        product_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("catalog.archive")),
    ):
        return await invoke(
            service().archive_product(product_id, actor, payload.reason)
        )

    @router.post("/admin/products/bulk-archive")
    async def bulk_archive_products(
        payload: BulkArchivePayload,
        actor: dict = Depends(require_permission("catalog.archive")),
    ):
        results = []
        for product_id in payload.product_ids:
            try:
                await service().archive_product(product_id, actor, payload.reason)
                results.append({"id": product_id, "success": True, "error": None})
            except CatalogError as exc:
                results.append({"id": product_id, "success": False, "error": exc.payload()})
        return {"results": results}

    @router.get(
        "/catalog/categories",
        response_model=list[PublicCatalogCategoryResponse],
        responses=error_responses(422, 500, 503),
    )
    async def public_categories():
        return await invoke(service().list_public_categories())

    @router.get(
        "/catalog/products",
        response_model=PublicCatalogPageResponse,
        responses=error_responses(422, 500, 503),
    )
    async def public_products(
        limit: int = 24,
        cursor: str | None = None,
    ):
        if limit < 1 or limit > 50:
            raise HTTPException(
                status_code=422,
                detail={"code": "limit_out_of_range"},
            )
        return await invoke(
            service().list_public_products(limit=limit, cursor=cursor)
        )

    @router.get(
        "/catalog/products/{slug}",
        response_model=PublicCatalogProductResponse,
        response_model_exclude_none=True,
        responses=error_responses(404, 422, 500, 503),
    )
    async def public_product(slug: str):
        value = await invoke(service().get_public_product(slug))
        if value is None:
            raise HTTPException(
                status_code=404,
                detail={"code": "product_not_found", "message": "Produk tidak ditemukan."},
            )
        return value

    return router
