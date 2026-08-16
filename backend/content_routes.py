from datetime import datetime
from typing import Literal

from content_domain import project_block_for_public
from content_service import ContentError, ContentService
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field


class ContentBlockPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    content_type: Literal["about", "capability", "faq", "cta", "contact"]
    slug: str = Field(default="", max_length=200)
    fields: dict = Field(default_factory=dict)
    reason: str = Field(min_length=3, max_length=500)


class ContentFieldsPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fields: dict = Field(default_factory=dict)
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class ReasonPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    reason: str = Field(min_length=3, max_length=500)
    expected_version: int = Field(ge=1)


class PublishPayload(ReasonPayload):
    scheduled_at: datetime | None = None


class RollbackPayload(ReasonPayload):
    version_id: str


class ContentTransitionPayload(ReasonPayload):
    target_status: Literal[
        "draft", "review", "preview", "scheduled", "published", "archived"
    ]


def build_content_router(
    *,
    get_db,
    get_client,
    get_capabilities,
    get_guard,
    require_permission,
    has_permission,
) -> APIRouter:
    router = APIRouter(tags=["content"])

    def service() -> ContentService:
        return ContentService(get_db(), get_client(), get_capabilities(), get_guard())

    async def invoke(awaitable):
        try:
            return await awaitable
        except ContentError as exc:
            raise HTTPException(
                status_code=exc.status_code, detail=exc.payload()
            ) from exc

    @router.get("/admin/content")
    async def list_content(
        content_type: str | None = None,
        _actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(service().list_blocks(content_type=content_type))

    @router.get("/admin/content/{block_id}")
    async def get_content(
        block_id: str,
        _actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(service().get_block(block_id))

    @router.post("/admin/content", status_code=status.HTTP_201_CREATED)
    async def create_content(
        payload: ContentBlockPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().create_block(
                content_type=payload.content_type,
                slug=payload.slug,
                fields=payload.fields,
                actor=actor,
                reason=payload.reason,
            )
        )

    @router.put("/admin/content/{block_id}")
    async def update_content(
        block_id: str,
        payload: ContentFieldsPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().update_block(
                block_id,
                fields=payload.fields,
                expected_version=payload.expected_version,
                actor=actor,
                reason=payload.reason,
            )
        )

    @router.post("/admin/content/{block_id}/validate")
    async def validate_content(
        block_id: str,
        _actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().validate_block(block_id))

    @router.post("/admin/content/{block_id}/transitions")
    async def transition_content(
        block_id: str,
        payload: ContentTransitionPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().transition_block(
                block_id,
                target_status=payload.target_status,
                actor=actor,
                reason=payload.reason,
                expected_version=payload.expected_version,
                # Publishing is an approval, not an edit.
                can_publish=has_permission(actor, "content.publish"),
            )
        )

    @router.post("/admin/content/{block_id}/publish")
    async def publish_content(
        block_id: str,
        payload: PublishPayload,
        actor: dict = Depends(require_permission("content.publish")),
    ):
        return await invoke(
            service().publish_block(
                block_id,
                actor=actor,
                reason=payload.reason,
                expected_version=payload.expected_version,
                scheduled_at=payload.scheduled_at,
            )
        )

    @router.post("/admin/content/{block_id}/rollback")
    async def rollback_content(
        block_id: str,
        payload: RollbackPayload,
        actor: dict = Depends(require_permission("content.publish")),
    ):
        return await invoke(
            service().rollback_block(
                block_id,
                version_id=payload.version_id,
                actor=actor,
                reason=payload.reason,
                expected_version=payload.expected_version,
            )
        )

    @router.post("/admin/content/{block_id}/archive")
    async def archive_content(
        block_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("content.archive")),
    ):
        return await invoke(
            service().archive_block(
                block_id,
                actor=actor,
                reason=payload.reason,
                expected_version=payload.expected_version,
            )
        )

    @router.get("/admin/content/{block_id}/versions")
    async def list_content_versions(
        block_id: str,
        _actor: dict = Depends(require_permission("content.read")),
    ):
        return await invoke(service().list_versions(block_id))

    @router.get("/content")
    async def public_content(content_type: str | None = None):
        blocks = await invoke(service().list_public_blocks(content_type=content_type))
        return [project_block_for_public(block) for block in blocks]

    return router
