from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from b2b_domain import B2BDomainError
from b2b_service import B2BService


class InquiryPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    company: str = Field(min_length=2, max_length=200)
    pic_name: str = Field(min_length=2, max_length=120)
    pic_email: EmailStr
    pic_phone: str = Field(default="", max_length=50)
    need: str = Field(min_length=3, max_length=500)
    timeline: str = Field(default="", max_length=200)
    brief: str = Field(min_length=10, max_length=5000)


class InquiryTransitionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_status: Literal["reviewed", "contacted", "rejected"]
    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(default="", max_length=500)


def build_b2b_router(
    *,
    get_db,
    get_transaction_guard,
    require_permission,
) -> APIRouter:
    router = APIRouter(tags=["b2b"])

    def service() -> B2BService:
        return B2BService(
            db=get_db(),
            transaction_guard=get_transaction_guard(),
        )

    async def invoke(awaitable):
        try:
            return await awaitable
        except B2BDomainError as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.payload(),
            ) from exc

    @router.post("/inquiries", status_code=status.HTTP_201_CREATED)
    async def create_inquiry(payload: InquiryPayload):
        return await invoke(service().create_inquiry(payload.model_dump()))

    @router.get("/admin/inquiries")
    async def list_inquiries(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("inquiries.read")),
    ):
        return await invoke(service().list_inquiries(status=status_filter))

    @router.get("/admin/inquiries/{inquiry_id}")
    async def get_inquiry(
        inquiry_id: str,
        _actor: dict = Depends(require_permission("inquiries.read")),
    ):
        return await invoke(service().get_inquiry(inquiry_id))

    @router.post("/admin/inquiries/{inquiry_id}/transitions")
    async def transition_inquiry(
        inquiry_id: str,
        payload: InquiryTransitionPayload,
        actor: dict = Depends(require_permission("inquiries.write")),
    ):
        return await invoke(
            service().transition_inquiry(
                inquiry_id,
                target_status=payload.target_status,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    return router
