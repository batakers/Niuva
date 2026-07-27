import logging
from datetime import datetime
import inspect
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field

from b2b_domain import B2BDomainError, project_customer_inquiry
from b2b_service import B2BService

logger = logging.getLogger(__name__)


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


class InquiryConversionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class QuoteTransitionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_status: Literal[
        "draft",
        "internal_review",
        "sent",
        "revision_requested",
        "expired",
        "rejected",
    ]
    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class QuoteItemPayload(BaseModel):
    """A quoted line. Snapshots are derived server-side, never submitted."""

    model_config = ConfigDict(extra="forbid")

    description: str = Field(min_length=1, max_length=500)
    quantity: int = Field(gt=0)
    unit_price_minor: int = Field(ge=0)
    variant_id: str | None = Field(default=None, max_length=100)


class QuoteRevisionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)
    scope_snapshot: dict
    items: list[QuoteItemPayload] = Field(default_factory=list)
    # Only meaningful for a revision with no lines. With lines, the total is
    # derived from them so the version cannot contradict itself.
    total_minor: int | None = Field(default=None, ge=0)


class QuoteAcceptancePayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)
    approver_name: str = Field(min_length=2, max_length=120)
    approver_identity: str = Field(min_length=3, max_length=320)
    accepted_at: datetime
    channel: Literal[
        "email",
        "signed_document",
        "meeting_minutes",
        "messaging",
        "other",
    ]
    evidence_reference: str = Field(min_length=3, max_length=500)


class ProjectCommandPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class ProjectTransitionPayload(ProjectCommandPayload):
    target_status: Literal["planned", "active", "on_hold", "completed", "cancelled"]


class WorkOrderCreatePayload(ProjectCommandPayload):
    quote_line_id: str = Field(min_length=1, max_length=100)
    quantity: int = Field(gt=0)


class WorkOrderCommandPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    operation_id: UUID
    reason: str = Field(min_length=3, max_length=500)


class WorkOrderTransitionPayload(WorkOrderCommandPayload):
    target_status: Literal["in_progress", "completed", "cancelled"]


def build_b2b_router(
    *,
    get_db,
    get_transaction_guard,
    require_permission,
    throttle_intake=None,
    notify_inquiry=None,
    get_inventory_service=None,
) -> APIRouter:
    """Build the B2B router.

    ``throttle_intake`` and ``notify_inquiry`` cover the public intake edge:
    the first throttles anonymous submissions, the second announces a new lead.
    Both are injected so the router stays free of transport and mail concerns;
    a mount that omits them gets an unthrottled, silent intake, so
    ``test_public_intake_is_throttled_and_announced`` pins the server wiring.
    """
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
    async def create_inquiry(payload: InquiryPayload, request: Request):
        if throttle_intake is not None:
            throttle_result = throttle_intake(request)
            if inspect.isawaitable(throttle_result):
                await throttle_result
        inquiry = await invoke(service().create_inquiry(payload.model_dump()))
        # A lead is captured the moment it is persisted. Announcing it is a
        # best-effort side effect: a broken mailer must never cost us the lead.
        if notify_inquiry is not None:
            try:
                await notify_inquiry(inquiry)
            except Exception:
                logger.exception(
                    "Inquiry stored, but lead notification failed (inquiry_id=%s)",
                    inquiry["id"],
                )
        # This caller is anonymous. It receives its own submission back, never
        # the triage state, version, or audit history the admin projection adds.
        return project_customer_inquiry(inquiry)

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

    @router.post("/admin/inquiries/{inquiry_id}/convert")
    async def convert_inquiry(
        inquiry_id: str,
        payload: InquiryConversionPayload,
        actor: dict = Depends(require_permission("quotes.write")),
    ):
        return await invoke(
            service().convert_inquiry(
                inquiry_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.get("/admin/b2b/quotes")
    async def list_quotes(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("quotes.read")),
    ):
        return await invoke(service().list_quotes(status=status_filter))

    @router.get("/admin/b2b/quotes/{quote_id}")
    async def get_quote(
        quote_id: str,
        _actor: dict = Depends(require_permission("quotes.read")),
    ):
        return await invoke(service().get_quote(quote_id))

    @router.post("/admin/b2b/quotes/{quote_id}/transitions")
    async def transition_quote(
        quote_id: str,
        payload: QuoteTransitionPayload,
        actor: dict = Depends(require_permission("quotes.write")),
    ):
        return await invoke(
            service().transition_quote(
                quote_id,
                target_status=payload.target_status,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.post("/admin/b2b/quotes/{quote_id}/versions")
    async def create_quote_revision(
        quote_id: str,
        payload: QuoteRevisionPayload,
        actor: dict = Depends(require_permission("quotes.write")),
    ):
        return await invoke(
            service().create_quote_revision(
                quote_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                scope_snapshot=payload.scope_snapshot,
                items=[item.model_dump() for item in payload.items],
                total_minor=payload.total_minor,
                actor=actor,
            )
        )

    @router.post("/admin/b2b/quotes/{quote_id}/acceptance")
    async def accept_quote(
        quote_id: str,
        payload: QuoteAcceptancePayload,
        actor: dict = Depends(require_permission("quotes.write")),
    ):
        return await invoke(
            service().accept_quote(
                quote_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                approver={
                    "name": payload.approver_name,
                    "identity": payload.approver_identity,
                },
                accepted_at=payload.accepted_at,
                channel=payload.channel,
                evidence_reference=payload.evidence_reference,
                actor=actor,
            )
        )

    @router.post("/admin/b2b/quotes/{quote_id}/project")
    async def create_project(
        quote_id: str,
        payload: ProjectCommandPayload,
        actor: dict = Depends(require_permission("projects.write")),
    ):
        return await invoke(
            service().create_project_from_quote(
                quote_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.get("/admin/b2b/projects")
    async def list_projects(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("projects.read")),
    ):
        return await invoke(service().list_projects(status=status_filter))

    @router.get("/admin/b2b/projects/{project_id}")
    async def get_project(
        project_id: str,
        _actor: dict = Depends(require_permission("projects.read")),
    ):
        return await invoke(service().get_project(project_id))

    @router.post("/admin/b2b/projects/{project_id}/transitions")
    async def transition_project(
        project_id: str,
        payload: ProjectTransitionPayload,
        actor: dict = Depends(require_permission("projects.write")),
    ):
        return await invoke(
            service().transition_project(
                project_id,
                target_status=payload.target_status,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.post("/admin/b2b/projects/{project_id}/work-orders")
    async def create_work_order(
        project_id: str,
        payload: WorkOrderCreatePayload,
        actor: dict = Depends(require_permission("production.write")),
    ):
        return await invoke(
            service().create_work_order(
                project_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                quote_line_id=payload.quote_line_id,
                quantity=payload.quantity,
                actor=actor,
            )
        )

    @router.get("/admin/b2b/work-orders")
    async def list_work_orders(
        project_id: str | None = None,
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("production.read")),
    ):
        return await invoke(
            service().list_work_orders(project_id=project_id, status=status_filter)
        )

    @router.get("/admin/b2b/material-shortages")
    async def list_material_shortages(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(
            service().list_material_shortages(status=status_filter)
        )

    @router.get("/admin/b2b/work-orders/{work_order_id}")
    async def get_work_order(
        work_order_id: str,
        _actor: dict = Depends(require_permission("production.read")),
    ):
        return await invoke(service().get_work_order(work_order_id))

    def inventory():
        if get_inventory_service is None:
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "inventory_unavailable",
                    "message": "Layanan inventory tidak tersedia.",
                },
            )
        return get_inventory_service()

    @router.post("/admin/b2b/work-orders/{work_order_id}/allocate")
    async def allocate_work_order(
        work_order_id: str,
        payload: WorkOrderCommandPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await invoke(
            service().allocate_work_order(
                work_order_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
                inventory_service=inventory(),
            )
        )

    @router.post("/admin/b2b/work-orders/{work_order_id}/consume")
    async def consume_work_order(
        work_order_id: str,
        payload: WorkOrderCommandPayload,
        actor: dict = Depends(require_permission("inventory.write")),
    ):
        return await invoke(
            service().consume_work_order(
                work_order_id,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
                inventory_service=inventory(),
            )
        )

    @router.post("/admin/b2b/work-orders/{work_order_id}/transitions")
    async def transition_work_order(
        work_order_id: str,
        payload: WorkOrderTransitionPayload,
        actor: dict = Depends(require_permission("production.write")),
    ):
        return await invoke(
            service().transition_work_order(
                work_order_id,
                target_status=payload.target_status,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
                inventory_service=(
                    get_inventory_service()
                    if (
                        payload.target_status == "cancelled"
                        and get_inventory_service is not None
                    )
                    else None
                ),
            )
        )

    return router
