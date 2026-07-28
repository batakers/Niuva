from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from portfolio_domain import PortfolioDomainError
from portfolio_service import PortfolioService


class PortfolioContentPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title_id: str = Field(min_length=2, max_length=200)
    title_en: str = Field(min_length=2, max_length=200)
    category: str = Field(default="", max_length=120)
    description_id: str = Field(default="", max_length=5000)
    description_en: str = Field(default="", max_length=5000)
    images: list[str] = Field(default_factory=list)
    featured: bool = False


class PortfolioUpdatePayload(PortfolioContentPayload):
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class PortfolioTransitionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    target_status: Literal[
        "draft", "review", "preview", "scheduled", "published", "archived"
    ]
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)
    scheduled_for: datetime | None = None


class PortfolioRollbackPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    revision: int = Field(ge=1)
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class PortfolioReorderPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    ordered_ids: list[str] = Field(min_length=1)
    expected_versions: dict[str, int]


def build_portfolio_router(
    *,
    get_db,
    get_transaction_guard,
    require_permission,
    has_permission,
) -> APIRouter:
    router = APIRouter(tags=["portfolio"])

    def service() -> PortfolioService:
        return PortfolioService(
            db=get_db(),
            transaction_guard=get_transaction_guard(),
        )

    async def invoke(awaitable):
        try:
            return await awaitable
        except PortfolioDomainError as exc:
            raise HTTPException(
                status_code=exc.status_code, detail=exc.payload()
            ) from exc

    @router.get("/portfolio")
    async def list_public_portfolio():
        """Public: only published entries, and only their public fields."""
        return await invoke(service().list_public())

    @router.get("/admin/portfolio")
    async def list_admin_portfolio(
        status_filter: str | None = None,
        _actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(service().list_admin(status=status_filter))

    @router.get("/admin/portfolio/{entry_id}")
    async def get_portfolio(
        entry_id: str,
        _actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(service().get(entry_id))

    @router.post("/admin/portfolio", status_code=status.HTTP_201_CREATED)
    async def create_portfolio(
        payload: PortfolioContentPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().create(payload.model_dump(), actor=actor))

    @router.post(
        "/admin/portfolio/from-project/{project_id}",
        status_code=status.HTTP_201_CREATED,
    )
    async def create_portfolio_from_project(
        project_id: str,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().create_from_project(project_id, actor=actor))

    @router.put("/admin/portfolio/{entry_id}")
    async def update_portfolio(
        entry_id: str,
        payload: PortfolioUpdatePayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        body = payload.model_dump()
        expected_version = body.pop("expected_version")
        reason = body.pop("reason")
        return await invoke(
            service().update_content(
                entry_id,
                body,
                expected_version=expected_version,
                reason=reason,
                actor=actor,
            )
        )

    @router.post("/admin/portfolio/{entry_id}/rollback")
    async def rollback_portfolio(
        entry_id: str,
        payload: PortfolioRollbackPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().rollback(
                entry_id,
                revision=payload.revision,
                expected_version=payload.expected_version,
                reason=payload.reason,
                actor=actor,
            )
        )

    @router.post("/admin/portfolio/{entry_id}/transitions")
    async def transition_portfolio(
        entry_id: str,
        payload: PortfolioTransitionPayload,
        actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(
            service().transition(
                entry_id,
                target_status=payload.target_status,
                expected_version=payload.expected_version,
                reason=payload.reason,
                actor=actor,
                can_write=has_permission(actor, "content.write"),
                can_publish=has_permission(actor, "content.publish"),
                can_archive=has_permission(actor, "content.archive"),
                scheduled_for=payload.scheduled_for,
            )
        )

    @router.post("/admin/portfolio/reorder")
    async def reorder_portfolio(
        payload: PortfolioReorderPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().reorder(
                payload.ordered_ids,
                expected_versions=payload.expected_versions,
                actor=actor,
            )
        )

    return router
