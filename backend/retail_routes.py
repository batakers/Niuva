from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from retail_domain import RetailDomainError
from retail_service import RetailOrderService


class RetailCustomerPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=50)


class RetailItemPayload(BaseModel):
    """An ordered line. Price is read from the catalog, never submitted."""

    model_config = ConfigDict(extra="forbid")

    variant_id: str = Field(min_length=1, max_length=100)
    quantity: int = Field(gt=0, le=1000)


class RetailOrderCreatePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    operation_id: UUID
    customer: RetailCustomerPayload
    items: list[RetailItemPayload] = Field(min_length=1)
    fulfilment_method: Literal["ship", "pickup"]
    notes: str = Field(default="", max_length=2000)


class RetailTransitionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_status: Literal[
        "awaiting_payment",
        "paid",
        "file_review",
        "queued",
        "in_production",
        "quality_control",
        "ready_to_ship",
        "ready_to_pickup",
        "shipped",
        "picked_up",
        "completed",
    ]
    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


def build_retail_router(
    *,
    get_db,
    get_transaction_guard,
    require_permission,
) -> APIRouter:
    router = APIRouter(prefix="/admin/retail-orders", tags=["retail"])

    def service() -> RetailOrderService:
        return RetailOrderService(
            db=get_db(),
            transaction_guard=get_transaction_guard(),
        )

    async def invoke(awaitable):
        try:
            return await awaitable
        except RetailDomainError as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.payload(),
            ) from exc

    @router.get("")
    async def list_orders(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("orders.read")),
    ):
        return await invoke(service().list_orders(status=status_filter))

    @router.post("", status_code=status.HTTP_201_CREATED)
    async def create_order(
        payload: RetailOrderCreatePayload,
        actor: dict = Depends(require_permission("orders.write")),
    ):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "retail_transaction_inactive",
                "message": (
                    "Retail saat ini hanya mendukung discovery; pembuatan "
                    "pesanan belum diaktifkan."
                ),
            },
        )

    @router.get("/{order_id}")
    async def get_order(
        order_id: str,
        _actor: dict = Depends(require_permission("orders.read")),
    ):
        return await invoke(service().get_order(order_id))

    @router.post("/{order_id}/transitions")
    async def transition_order(
        order_id: str,
        payload: RetailTransitionPayload,
        actor: dict = Depends(require_permission("orders.write")),
    ):
        raise HTTPException(
            status_code=503,
            detail={
                "code": "retail_transaction_inactive",
                "message": (
                    "Retail order historis bersifat read-only; payment, "
                    "production, dan fulfilment belum diaktifkan."
                ),
            },
        )

    # Named rather than absent, so an attempt is answered with the reason it is
    # withheld instead of a 404 that reads like a missing feature.
    @router.post("/{order_id}/{suspended_action}")
    async def suspended_action(
        order_id: str,
        suspended_action: Literal["cancel", "refund", "return"],
        _actor: dict = Depends(require_permission("orders.write")),
    ):
        return await invoke(service().refuse_suspended_action(suspended_action))

    return router
