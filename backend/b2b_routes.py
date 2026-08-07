import inspect
import logging
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from api_contract import error_responses
from b2b_domain import B2BDomainError, project_customer_inquiry
from b2b_pagination import PageRequest, build_page_request
from b2b_service import B2BService
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from transaction_execution import TransactionUnavailableError

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


class InquiryHistoryResponse(BaseModel):
    from_status: str | None
    to_status: str
    actor_user_id: str | None
    reason: str
    operation_id: str | None
    timestamp: str


class PublicInquiryResponse(BaseModel):
    id: str
    company: str
    pic_name: str
    pic_email: EmailStr
    pic_phone: str
    need: str
    timeline: str
    brief: str
    status: Literal["new"]
    created_at: str
    updated_at: str


class AdminInquiryResponse(BaseModel):
    id: str
    company: str
    pic_name: str
    pic_email: EmailStr
    pic_phone: str
    need: str
    timeline: str
    brief: str
    status: Literal["new", "reviewed", "contacted", "converted", "rejected"]
    version: int
    converted_quote_id: str | None
    history: list[InquiryHistoryResponse]
    created_at: str
    updated_at: str
    permitted_next_actions: list[str]


class InquiryConversionResponse(BaseModel):
    inquiry: AdminInquiryResponse
    quote: dict[str, Any]


class PaginationParams:
    def __init__(
        self,
        limit: int = Query(default=50, ge=1, le=100),
        cursor: str | None = Query(default=None, max_length=2048),
        updated_from: str | None = Query(default=None, max_length=64),
        updated_before: str | None = Query(default=None, max_length=64),
    ):
        self.limit = limit
        self.cursor = cursor
        self.updated_from = updated_from
        self.updated_before = updated_before


class InquiryPageResponse(BaseModel):
    items: list[AdminInquiryResponse]
    next_cursor: str | None


class B2BPageResponse(BaseModel):
    items: list[dict[str, Any]]
    next_cursor: str | None


B2B_ERROR_RESPONSES = error_responses(401, 403, 404, 409, 422, 429, 500, 503)


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
    target_status: Literal["in_progress", "quality_control", "cancelled"]


class WorkOrderQCPayload(WorkOrderCommandPayload):
    outcome: Literal["passed", "rework_required"]


def build_b2b_router(
    *,
    get_db,
    get_transaction_guard,
    require_permission,
    throttle_intake,
    notify_inquiry=None,
    get_inventory_service=None,
) -> APIRouter:
    """Build the B2B router.

    ``throttle_intake`` and ``notify_inquiry`` cover the public intake edge.
    The limiter is mandatory so a new mount cannot silently expose unthrottled
    anonymous writes. Notification remains best effort after the lead is
    persisted.
    """
    if throttle_intake is None:
        raise ValueError("B2B Inquiry intake requires a rate limiter")

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
        except TransactionUnavailableError as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail={
                    "code": exc.code,
                    "message": exc.message,
                },
            ) from exc

    def pagination_request(
        page: PaginationParams,
        *,
        status_filter: str | None = None,
        project_id: str | None = None,
    ) -> PageRequest:
        try:
            return build_page_request(
                limit=page.limit,
                cursor=page.cursor,
                filters={"status": status_filter, "project_id": project_id},
                updated_from=page.updated_from,
                updated_before=page.updated_before,
            )
        except B2BDomainError as exc:
            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.payload(),
            ) from exc

    @router.post(
        "/inquiries",
        status_code=status.HTTP_201_CREATED,
        response_model=PublicInquiryResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (422, 429, 500)},
    )
    async def create_inquiry(payload: InquiryPayload, request: Request):
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

    @router.get(
        "/admin/inquiries",
        response_model=InquiryPageResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 422, 500)},
    )
    async def list_inquiries(
        status_filter: str | None = Query(default=None, max_length=64),
        page: PaginationParams = Depends(),
        _actor: dict = Depends(require_permission("inquiries.read")),
    ):
        return await invoke(
            service().page_inquiries(
                pagination_request(page, status_filter=status_filter)
            )
        )

    @router.get(
        "/admin/inquiries/{inquiry_id}",
        response_model=AdminInquiryResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 404, 500)},
    )
    async def get_inquiry(
        inquiry_id: str,
        _actor: dict = Depends(require_permission("inquiries.read")),
    ):
        return await invoke(service().get_inquiry(inquiry_id))

    @router.post(
        "/admin/inquiries/{inquiry_id}/transitions",
        response_model=AdminInquiryResponse,
        responses={
            code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 404, 409, 422, 500)
        },
    )
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

    @router.post(
        "/admin/inquiries/{inquiry_id}/convert",
        response_model=InquiryConversionResponse,
        responses={
            code: B2B_ERROR_RESPONSES[code]
            for code in (401, 403, 404, 409, 422, 500, 503)
        },
    )
    async def convert_inquiry(
        inquiry_id: str,
        payload: InquiryConversionPayload,
        _inquiry_actor: dict = Depends(require_permission("inquiries.write")),
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

    @router.get(
        "/admin/b2b/quotes",
        response_model=B2BPageResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 422, 500)},
    )
    async def list_quotes(
        status_filter: str | None = Query(default=None, max_length=64),
        page: PaginationParams = Depends(),
        _actor: dict = Depends(require_permission("quotes.read")),
    ):
        return await invoke(
            service().page_quotes(pagination_request(page, status_filter=status_filter))
        )

    @router.get(
        "/admin/b2b/quotes/{quote_id}",
        response_model=dict[str, Any],
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 404, 500)},
    )
    async def get_quote(
        quote_id: str,
        _actor: dict = Depends(require_permission("quotes.read")),
    ):
        return await invoke(service().get_quote(quote_id))

    @router.post(
        "/admin/b2b/quotes/{quote_id}/transitions",
        response_model=dict[str, Any],
        responses={
            code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 404, 409, 422, 500)
        },
    )
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

    @router.post(
        "/admin/b2b/quotes/{quote_id}/versions",
        response_model=dict[str, Any],
        responses={
            code: B2B_ERROR_RESPONSES[code]
            for code in (401, 403, 404, 409, 422, 500, 503)
        },
    )
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

    @router.post(
        "/admin/b2b/quotes/{quote_id}/acceptance",
        response_model=dict[str, Any],
        responses={
            code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 404, 409, 422, 500)
        },
    )
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

    @router.get(
        "/admin/b2b/projects",
        response_model=B2BPageResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 422, 500)},
    )
    async def list_projects(
        status_filter: str | None = Query(default=None, max_length=64),
        page: PaginationParams = Depends(),
        _actor: dict = Depends(require_permission("projects.read")),
    ):
        return await invoke(
            service().page_projects(
                pagination_request(page, status_filter=status_filter)
            )
        )

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

    @router.get(
        "/admin/b2b/work-orders",
        response_model=B2BPageResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 422, 500)},
    )
    async def list_work_orders(
        project_id: str | None = Query(default=None, max_length=100),
        status_filter: str | None = Query(default=None, max_length=64),
        page: PaginationParams = Depends(),
        _actor: dict = Depends(require_permission("production.read")),
    ):
        return await invoke(
            service().page_work_orders(
                pagination_request(
                    page,
                    project_id=project_id,
                    status_filter=status_filter,
                )
            )
        )

    @router.get(
        "/admin/b2b/material-shortages",
        response_model=B2BPageResponse,
        responses={code: B2B_ERROR_RESPONSES[code] for code in (401, 403, 422, 500)},
    )
    async def list_material_shortages(
        status_filter: str | None = Query(default=None, max_length=64),
        page: PaginationParams = Depends(),
        _actor: dict = Depends(require_permission("inventory.read")),
    ):
        return await invoke(
            service().page_material_shortages(
                pagination_request(page, status_filter=status_filter)
            )
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

    @router.post("/admin/b2b/work-orders/{work_order_id}/qc")
    async def record_work_order_qc(
        work_order_id: str,
        payload: WorkOrderQCPayload,
        actor: dict = Depends(require_permission("qc.write")),
    ):
        return await invoke(
            service().record_work_order_qc(
                work_order_id,
                outcome=payload.outcome,
                expected_version=payload.expected_version,
                operation_id=str(payload.operation_id),
                reason=payload.reason,
                actor=actor,
            )
        )

    return router
