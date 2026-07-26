import uuid
from copy import deepcopy
from datetime import datetime, timezone

from audit import append_audit_event
from content_domain import (
    CONTENT_TYPES,
    build_version_snapshot,
    normalize_slug,
    validate_content_fields,
)


class ContentError(Exception):
    def __init__(self, status_code: int, code: str, message: str, *, errors: list[dict] | None = None):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.errors = errors

    def payload(self) -> dict:
        value = {"code": self.code, "message": self.message}
        if self.errors is not None:
            value["errors"] = self.errors
        return value


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_document(document: dict | None) -> dict | None:
    if document is None:
        return None
    value = dict(document)
    value.pop("_id", None)
    return value


def _write_options(session=None) -> dict:
    return {"session": session} if session is not None else {}


class ContentService:
    def __init__(self, db, client, capabilities, guard):
        self.db = db
        self.client = client
        self.capabilities = capabilities
        self.guard = guard

    def _require_transactions(self):
        if not self.capabilities.transactions:
            raise ContentError(
                503,
                "transaction_unavailable",
                "Operasi konten aman tidak tersedia karena database belum mendukung transaksi.",
            )

    async def _get_block(self, block_id: str) -> dict:
        block = clean_document(await self.db.content_blocks.find_one({"id": block_id}, {"_id": 0}))
        if not block:
            raise ContentError(404, "content_block_not_found", "Blok konten tidak ditemukan.")
        return block

    async def list_blocks(self, *, content_type: str | None = None) -> list[dict]:
        query = {"content_type": content_type} if content_type else {}
        return await self.db.content_blocks.find(query, {"_id": 0}).sort("updated_at", -1).to_list(500)

    async def get_block(self, block_id: str) -> dict:
        return await self._get_block(block_id)

    async def create_block(self, *, content_type: str, slug: str, fields: dict, actor: dict) -> dict:
        if content_type not in CONTENT_TYPES:
            raise ContentError(400, "unknown_content_type", "Jenis konten tidak dikenal.")
        normalized_slug = normalize_slug(slug) or str(uuid.uuid4())[:8]
        existing = await self.db.content_blocks.find_one(
            {"content_type": content_type, "slug": normalized_slug}, {"_id": 0}
        )
        if existing:
            raise ContentError(409, "slug_conflict", "Slug sudah dipakai untuk jenis konten ini.")
        timestamp = now_iso()
        block = {
            "id": str(uuid.uuid4()),
            "content_type": content_type,
            "slug": normalized_slug,
            "status": "draft",
            "fields": fields or {},
            "scheduled_at": None,
            "version": 1,
            "published_version_id": None,
            "created_by": actor.get("id"),
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        await self.db.content_blocks.insert_one(dict(block))
        await append_audit_event(
            self.db, actor=actor, action="content.block_created",
            target_type="content_block", target_id=block["id"], after=block,
        )
        return block

    async def update_block(self, block_id: str, *, fields: dict, actor: dict) -> dict:
        block = await self._get_block(block_id)
        if block["status"] == "archived":
            raise ContentError(403, "content_lifecycle_forbidden", "Blok konten yang diarsipkan tidak dapat diubah.")
        before = deepcopy(block)
        changes = {"fields": fields or {}, "updated_at": now_iso()}
        await self.db.content_blocks.update_one({"id": block_id}, {"$set": changes})
        after = {**block, **changes}
        await append_audit_event(
            self.db, actor=actor, action="content.block_updated",
            target_type="content_block", target_id=block_id, before=before, after=after,
        )
        return after

    async def validate_block(self, block_id: str) -> list[dict]:
        block = await self._get_block(block_id)
        return validate_content_fields(block["content_type"], block["fields"])

    async def publish_block(self, block_id: str, *, actor: dict, reason: str, scheduled_at: str | None = None) -> dict:
        self._require_transactions()
        block = await self._get_block(block_id)
        if block["status"] == "archived":
            raise ContentError(403, "content_lifecycle_forbidden", "Blok konten yang diarsipkan tidak dapat dipublikasikan.")
        errors = validate_content_fields(block["content_type"], block["fields"])
        if errors:
            raise ContentError(400, "content_invalid", "Konten belum memenuhi syarat publikasi.", errors=errors)

        timestamp = now_iso()
        new_status = "scheduled" if scheduled_at else "published"
        changes = {
            "status": new_status,
            "scheduled_at": scheduled_at,
            "version": block["version"] + 1,
            "updated_at": timestamp,
        }
        after = {**block, **changes}
        version_snapshot = build_version_snapshot(after, actor_id=actor.get("id"), reason=reason, event=new_status)
        changes["published_version_id"] = version_snapshot["id"]
        after["published_version_id"] = version_snapshot["id"]

        async def mutation(session):
            await self.db.content_block_versions.insert_one(
                dict(version_snapshot), **_write_options(session)
            )
            await self.db.content_blocks.update_one(
                {"id": block_id}, {"$set": changes}, **_write_options(session)
            )
            await append_audit_event(
                self.db, actor=actor, action="content.block_published",
                target_type="content_block", target_id=block_id,
                before={"status": block["status"], "version": block["version"]},
                after={"status": new_status, "version": after["version"], "published_version_id": version_snapshot["id"]},
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.publish_block")
        return after

    async def rollback_block(self, block_id: str, *, version_id: str, actor: dict, reason: str) -> dict:
        self._require_transactions()
        block = await self._get_block(block_id)
        selected = clean_document(
            await self.db.content_block_versions.find_one(
                {"id": version_id, "content_block_id": block_id}, {"_id": 0}
            )
        )
        if not selected:
            raise ContentError(404, "content_version_not_found", "Versi konten tidak ditemukan.")

        timestamp = now_iso()
        changes = {
            "fields": deepcopy(selected["fields"]),
            "status": "published",
            "version": block["version"] + 1,
            "updated_at": timestamp,
        }
        after = {**block, **changes}
        version_snapshot = build_version_snapshot(after, actor_id=actor.get("id"), reason=reason, event="rollback")
        version_snapshot["rollback_source_version_id"] = version_id
        changes["published_version_id"] = version_snapshot["id"]
        after["published_version_id"] = version_snapshot["id"]

        async def mutation(session):
            await self.db.content_block_versions.insert_one(
                dict(version_snapshot), **_write_options(session)
            )
            await self.db.content_blocks.update_one(
                {"id": block_id}, {"$set": changes}, **_write_options(session)
            )
            await append_audit_event(
                self.db, actor=actor, action="content.block_rolled_back",
                target_type="content_block", target_id=block_id,
                before={"version": block["version"], "published_version_id": block.get("published_version_id")},
                after={"version": after["version"], "published_version_id": version_snapshot["id"]},
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.rollback_block")
        return after

    async def archive_block(self, block_id: str, *, actor: dict, reason: str) -> dict:
        block = await self._get_block(block_id)
        before = deepcopy(block)
        changes = {"status": "archived", "updated_at": now_iso()}
        await self.db.content_blocks.update_one({"id": block_id}, {"$set": changes})
        after = {**block, **changes}
        await append_audit_event(
            self.db, actor=actor, action="content.block_archived",
            target_type="content_block", target_id=block_id, before=before, after=after, reason=reason,
        )
        return after

    async def list_versions(self, block_id: str) -> list[dict]:
        return await self.db.content_block_versions.find(
            {"content_block_id": block_id}, {"_id": 0}
        ).sort("created_at", -1).to_list(200)

    async def list_public_blocks(self, *, content_type: str | None = None) -> list[dict]:
        query = {"status": "published"}
        if content_type:
            query["content_type"] = content_type
        return await self.db.content_blocks.find(query, {"_id": 0}).sort("updated_at", -1).to_list(200)
