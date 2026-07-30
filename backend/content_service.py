import uuid
from copy import deepcopy
from datetime import datetime, timezone

from audit import append_audit_event
from content_domain import (
    ContentTransitionError,
    content_requires_publish_authority,
    validate_content_transition,
    CONTENT_TYPES,
    build_version_snapshot,
    build_publication_snapshot,
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


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


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

    async def _get_block(self, block_id: str) -> dict:
        block = clean_document(await self.db.content_blocks.find_one({"id": block_id}, {"_id": 0}))
        if not block:
            raise ContentError(404, "content_block_not_found", "Blok konten tidak ditemukan.")
        return block

    @staticmethod
    def _conflict(block: dict) -> None:
        raise ContentError(
            409,
            "version_conflict",
            "Konten telah diubah oleh proses lain.",
            errors=[
                {
                    "current_version": block.get("version", 1),
                    "current_status": block.get("status"),
                }
            ],
        )

    @staticmethod
    def _aware_utc(value: datetime | None) -> datetime | None:
        if value is None:
            return None
        if value.tzinfo is None or value.utcoffset() is None:
            raise ContentError(
                422,
                "scheduled_at_timezone_required",
                "scheduled_at wajib menyertakan zona waktu.",
            )
        return value.astimezone(timezone.utc)

    async def list_blocks(self, *, content_type: str | None = None) -> list[dict]:
        query = {"content_type": content_type} if content_type else {}
        return await self.db.content_blocks.find(query, {"_id": 0}).sort("updated_at", -1).to_list(500)

    async def get_block(self, block_id: str) -> dict:
        return await self._get_block(block_id)

    async def create_block(
        self,
        *,
        content_type: str,
        slug: str,
        fields: dict,
        actor: dict,
        reason: str,
    ) -> dict:
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
        async def mutation(session):
            await self.db.content_blocks.insert_one(
                dict(block), **_write_options(session)
            )
            await append_audit_event(
                self.db,
                actor=actor,
                action="content.block_created",
                target_type="content_block",
                target_id=block["id"],
                after=block,
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.create_block")
        return block

    async def update_block(
        self,
        block_id: str,
        *,
        fields: dict,
        expected_version: int,
        actor: dict,
        reason: str,
    ) -> dict:
        block = await self._get_block(block_id)
        if block.get("version", 1) != expected_version:
            self._conflict(block)
        if block["status"] not in {"draft", "review", "preview"}:
            raise ContentError(
                403,
                "content_lifecycle_forbidden",
                "Buat working revision terlebih dahulu sebelum mengubah konten.",
            )
        before = deepcopy(block)
        changes = {
            "fields": fields or {},
            "version": expected_version + 1,
            "updated_at": now_iso(),
        }
        after = {**block, **changes}

        async def mutation(session):
            result = await self.db.content_blocks.update_one(
                {"id": block_id, "version": expected_version},
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                self._conflict(block)
            await append_audit_event(
                self.db,
                actor=actor,
                action="content.block_updated",
                target_type="content_block",
                target_id=block_id,
                before=before,
                after=after,
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.update_block")
        return after

    async def validate_block(self, block_id: str) -> list[dict]:
        block = await self._get_block(block_id)
        return validate_content_fields(block["content_type"], block["fields"])

    async def publish_block(
        self,
        block_id: str,
        *,
        actor: dict,
        reason: str,
        expected_version: int,
        scheduled_at: datetime | None = None,
    ) -> dict:
        block = await self._get_block(block_id)
        if block.get("version", 1) != expected_version:
            self._conflict(block)
        if block["status"] != "preview":
            raise ContentError(
                409,
                "content_publish_requires_preview",
                "Konten wajib melewati review dan preview sebelum dipublikasikan.",
            )
        errors = validate_content_fields(block["content_type"], block["fields"])
        if errors:
            raise ContentError(400, "content_invalid", "Konten belum memenuhi syarat publikasi.", errors=errors)

        activation = self._aware_utc(scheduled_at) or utc_now()
        if scheduled_at is not None and activation <= utc_now():
            raise ContentError(
                422,
                "scheduled_at_must_be_future",
                "scheduled_at wajib berada di masa depan.",
            )
        timestamp = now_iso()
        new_status = "scheduled" if scheduled_at is not None else "published"
        changes = {
            "status": new_status,
            "scheduled_at": activation if scheduled_at is not None else None,
            "version": expected_version + 1,
            "updated_at": timestamp,
        }
        after = {**block, **changes}
        version_snapshot = build_version_snapshot(after, actor_id=actor.get("id"), reason=reason, event=new_status)
        changes["published_version_id"] = version_snapshot["id"]
        after["published_version_id"] = version_snapshot["id"]
        publication = build_publication_snapshot(
            after,
            version_id=version_snapshot["id"],
            activates_at=activation,
            actor_id=actor.get("id"),
        )

        async def mutation(session):
            await self.db.content_block_versions.insert_one(
                dict(version_snapshot), **_write_options(session)
            )
            await self.db.content_publications.insert_one(
                dict(publication), **_write_options(session)
            )
            result = await self.db.content_blocks.update_one(
                {"id": block_id, "version": expected_version},
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                self._conflict(block)
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

    async def rollback_block(
        self,
        block_id: str,
        *,
        version_id: str,
        actor: dict,
        reason: str,
        expected_version: int,
    ) -> dict:
        block = await self._get_block(block_id)
        if block.get("version", 1) != expected_version:
            self._conflict(block)
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
            "status": "draft",
            "scheduled_at": None,
            "version": expected_version + 1,
            "updated_at": timestamp,
        }
        after = {**block, **changes}
        version_snapshot = build_version_snapshot(after, actor_id=actor.get("id"), reason=reason, event="rollback")
        version_snapshot["rollback_source_version_id"] = version_id
        async def mutation(session):
            await self.db.content_block_versions.insert_one(
                dict(version_snapshot), **_write_options(session)
            )
            result = await self.db.content_blocks.update_one(
                {"id": block_id, "version": expected_version},
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                self._conflict(block)
            if block.get("status") == "scheduled":
                retired_at = utc_now()
                await self.db.content_publications.update_many(
                    {
                        "content_block_id": block_id,
                        "retired_at": None,
                        "activates_at": {"$gt": retired_at},
                    },
                    {"$set": {"retired_at": retired_at}},
                    **_write_options(session),
                )
            await append_audit_event(
                self.db, actor=actor, action="content.block_rolled_back",
                target_type="content_block", target_id=block_id,
                before={"version": block["version"], "published_version_id": block.get("published_version_id")},
                after={
                    "version": after["version"],
                    "status": "draft",
                    "rollback_source_version_id": version_id,
                },
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.rollback_block")
        return after

    async def archive_block(
        self,
        block_id: str,
        *,
        actor: dict,
        reason: str,
        expected_version: int,
    ) -> dict:
        block = await self._get_block(block_id)
        if block.get("version", 1) != expected_version:
            self._conflict(block)
        before = deepcopy(block)
        retired_at = utc_now()
        changes = {
            "status": "archived",
            "scheduled_at": None,
            "version": expected_version + 1,
            "updated_at": retired_at.isoformat(),
        }
        after = {**block, **changes}

        async def mutation(session):
            result = await self.db.content_blocks.update_one(
                {"id": block_id, "version": expected_version},
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                self._conflict(block)
            await self.db.content_publications.update_many(
                {"content_block_id": block_id, "retired_at": None},
                {"$set": {"retired_at": retired_at}},
                **_write_options(session),
            )
            await append_audit_event(
                self.db, actor=actor, action="content.block_archived",
                target_type="content_block", target_id=block_id,
                before=before, after=after, reason=reason, session=session,
            )

        await self.guard.run(mutation, operation_name="content.archive_block")
        return after

    async def list_versions(self, block_id: str) -> list[dict]:
        return await self.db.content_block_versions.find(
            {"content_block_id": block_id}, {"_id": 0}
        ).sort("created_at", -1).to_list(200)

    async def list_public_blocks(self, *, content_type: str | None = None) -> list[dict]:
        """Return latest active immutable publication for each content block."""
        query = {"retired_at": None, "activates_at": {"$lte": utc_now()}}
        if content_type:
            query["content_type"] = content_type
        publications = await self.db.content_publications.find(
            query, {"_id": 0}
        ).sort("activates_at", -1).to_list(500)
        latest = {}
        for publication in publications:
            latest.setdefault(publication["content_block_id"], publication)
        return list(latest.values())

    async def transition_block(
        self,
        block_id: str,
        *,
        target_status: str,
        actor: dict,
        reason: str,
        expected_version: int,
        can_publish: bool,
    ) -> dict:
        """Move a block along the review lifecycle."""
        block = await self._get_block(block_id)
        if block.get("version", 1) != expected_version:
            self._conflict(block)
        try:
            validate_content_transition(block["status"], target_status)
        except ContentTransitionError as exc:
            raise ContentError(409, exc.code, exc.message, errors=None) from exc

        if content_requires_publish_authority(target_status):
            raise ContentError(
                409,
                "content_publish_endpoint_required",
                "Gunakan operasi publish agar immutable snapshot tercatat.",
            )
        if target_status in {"published", "preview"}:
            errors = validate_content_fields(block["content_type"], block["fields"])
            if errors:
                raise ContentError(
                    400,
                    "content_invalid",
                    "Konten belum memenuhi syarat tahap ini.",
                    errors=errors,
                )

        timestamp = now_iso()
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "updated_at": timestamp,
        }
        if target_status == "published":
            changes["scheduled_at"] = None
        elif block.get("status") == "scheduled":
            changes["scheduled_at"] = None
        after = {**block, **changes}
        snapshot = build_version_snapshot(
            after, actor_id=actor.get("id"), reason=reason, event=target_status
        )

        async def mutation(session):
            await self.db.content_block_versions.insert_one(
                dict(snapshot), **_write_options(session)
            )
            result = await self.db.content_blocks.update_one(
                {"id": block_id, "version": expected_version},
                {"$set": changes},
                **_write_options(session),
            )
            if not getattr(result, "matched_count", 0):
                self._conflict(block)
            if block.get("status") == "scheduled" and target_status != "published":
                retired_at = utc_now()
                await self.db.content_publications.update_many(
                    {
                        "content_block_id": block_id,
                        "retired_at": None,
                        "activates_at": {"$gt": retired_at},
                    },
                    {"$set": {"retired_at": retired_at}},
                    **_write_options(session),
                )
            await append_audit_event(
                self.db,
                actor=actor,
                action="content.block_transitioned",
                target_type="content_block",
                target_id=block_id,
                before={"status": block["status"], "version": block["version"]},
                after={"status": target_status, "version": after["version"]},
                reason=reason,
                session=session,
            )

        await self.guard.run(mutation, operation_name="content.transition_block")
        return after
