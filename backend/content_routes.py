from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field

from content_domain import project_block_for_public
from content_service import ContentError, ContentService


class ContentBlockPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")

    content_type: Literal["about", "capability", "faq", "cta", "contact"]
    slug: str = Field(default="", max_length=200)
    fields: dict = Field(default_factory=dict)


class ContentFieldsPayload(BaseModel):
    model_config = ConfigDict(extra="ignore")

    fields: dict = Field(default_factory=dict)


class ReasonPayload(BaseModel):
    reason: str = Field(min_length=3, max_length=500)


class PublishPayload(ReasonPayload):
    scheduled_at: str | None = None


class RollbackPayload(ReasonPayload):
    version_id: str


def build_content_router(*, get_db, require_permission) -> APIRouter:
    router = APIRouter(tags=["content"])

    def service() -> ContentService:
        return ContentService(get_db())

    async def invoke(awaitable):
        try:
            return await awaitable
        except ContentError as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.payload()) from exc

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
                content_type=payload.content_type, slug=payload.slug,
                fields=payload.fields, actor=actor,
            )
        )

    @router.put("/admin/content/{block_id}")
    async def update_content(
        block_id: str,
        payload: ContentFieldsPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().update_block(block_id, fields=payload.fields, actor=actor))

    @router.post("/admin/content/{block_id}/validate")
    async def validate_content(
        block_id: str,
        _actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().validate_block(block_id))

    @router.post("/admin/content/{block_id}/publish")
    async def publish_content(
        block_id: str,
        payload: PublishPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().publish_block(
                block_id, actor=actor, reason=payload.reason, scheduled_at=payload.scheduled_at,
            )
        )

    @router.post("/admin/content/{block_id}/rollback")
    async def rollback_content(
        block_id: str,
        payload: RollbackPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(
            service().rollback_block(block_id, version_id=payload.version_id, actor=actor, reason=payload.reason)
        )

    @router.post("/admin/content/{block_id}/archive")
    async def archive_content(
        block_id: str,
        payload: ReasonPayload,
        actor: dict = Depends(require_permission("content.write")),
    ):
        return await invoke(service().archive_block(block_id, actor=actor, reason=payload.reason))

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
