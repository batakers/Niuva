import uuid
from copy import deepcopy
from datetime import datetime, timezone

from portfolio_domain import (
    PortfolioDomainError,
    prefill_from_project,
    project_admin_portfolio,
    project_public_portfolio,
    reorder_entries,
    requires_publish_authority,
    validate_portfolio_transition,
)

CONTENT_FIELDS = (
    "title_id",
    "title_en",
    "category",
    "description_id",
    "description_en",
    "images",
    "featured",
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class PortfolioService:
    def __init__(self, *, db):
        self.db = db

    async def _get(self, entry_id: str) -> dict:
        entry = await self.db.portfolio.find_one({"id": entry_id}, {"_id": 0})
        if not entry:
            raise PortfolioDomainError(
                404, "portfolio_not_found", "Entri portofolio tidak ditemukan."
            )
        return dict(entry)

    async def get(self, entry_id: str) -> dict:
        return project_admin_portfolio(await self._get(entry_id))

    async def list_admin(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        documents = await self.db.portfolio.find(query, {"_id": 0}).sort(
            "display_order", 1
        ).limit(500).to_list(500)
        return [project_admin_portfolio(document) for document in documents]

    async def list_public(self) -> list[dict]:
        """Only what is published, and only its public fields.

        A scheduled entry stays private until its activation time passes, so a
        future publication cannot leak by being scheduled early.
        """
        now = now_iso()
        documents = await self.db.portfolio.find(
            {
                "$or": [
                    {"status": "published"},
                    {"status": "scheduled", "scheduled_for": {"$lte": now}},
                ]
            },
            {"_id": 0},
        ).sort("display_order", 1).limit(200).to_list(200)
        return [project_public_portfolio(document) for document in documents]

    async def create(self, payload: dict, *, actor: dict) -> dict:
        timestamp = now_iso()
        entry_id = str(uuid.uuid4())
        content = {field: payload.get(field) for field in CONTENT_FIELDS}
        highest = await self.db.portfolio.find({}, {"_id": 0, "display_order": 1}).sort(
            "display_order", -1
        ).limit(1).to_list(1)
        entry = {
            "id": entry_id,
            **content,
            "source_project_id": payload.get("source_project_id"),
            "status": "draft",
            "version": 1,
            "display_order": (highest[0].get("display_order", -1) + 1) if highest else 0,
            "scheduled_for": None,
            "published_at": None,
            "versions": [
                {
                    "revision": 1,
                    "content": deepcopy(content),
                    "actor_user_id": actor.get("id"),
                    "reason": "Draft dibuat",
                    "created_at": timestamp,
                }
            ],
            "history": [
                {
                    "from_status": None,
                    "to_status": "draft",
                    "actor_user_id": actor.get("id"),
                    "reason": "Draft dibuat",
                    "timestamp": timestamp,
                }
            ],
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        await self.db.portfolio.insert_one(deepcopy(entry))
        return project_admin_portfolio(entry)

    async def create_from_project(
        self, project_id: str, *, actor: dict
    ) -> dict:
        project = await self.db.b2b_projects.find_one({"id": project_id}, {"_id": 0})
        if not project:
            raise PortfolioDomainError(
                404, "project_not_found", "Project tidak ditemukan."
            )
        existing = await self.db.portfolio.find_one(
            {"source_project_id": project_id}, {"_id": 0}
        )
        if existing:
            # One project yields one portfolio draft; a second call returns the
            # first rather than forking the story of the same work.
            return project_admin_portfolio(existing)
        return await self.create(prefill_from_project(project), actor=actor)

    async def update_content(
        self,
        entry_id: str,
        payload: dict,
        *,
        expected_version: int,
        reason: str,
        actor: dict,
    ) -> dict:
        entry = await self._get(entry_id)
        if entry["version"] != expected_version:
            raise PortfolioDomainError(
                409,
                "version_conflict",
                "Entri portofolio telah berubah. Muat versi terbaru sebelum menyimpan.",
                details={"current_version": entry["version"]},
            )
        if entry["status"] == "published":
            raise PortfolioDomainError(
                409,
                "portfolio_published_immutable",
                "Entri yang sudah tayang tidak dapat diubah langsung. Arsipkan lalu buat draft baru.",
            )
        if not reason.strip():
            raise PortfolioDomainError(
                422, "reason_required", "Alasan perubahan wajib diisi."
            )

        timestamp = now_iso()
        content = {field: payload.get(field) for field in CONTENT_FIELDS}
        revision = len(entry.get("versions", [])) + 1
        changes = {
            **content,
            "version": expected_version + 1,
            "versions": [
                *entry.get("versions", []),
                {
                    "revision": revision,
                    "content": deepcopy(content),
                    "actor_user_id": actor.get("id"),
                    "reason": reason.strip(),
                    "created_at": timestamp,
                },
            ],
            "updated_at": timestamp,
        }
        result = await self.db.portfolio.update_one(
            {"id": entry_id, "version": expected_version},
            {"$set": changes},
        )
        if not result.matched_count:
            raise PortfolioDomainError(
                409, "version_conflict", "Entri portofolio berubah saat disimpan."
            )
        return project_admin_portfolio({**entry, **changes})

    async def rollback(
        self,
        entry_id: str,
        *,
        revision: int,
        expected_version: int,
        reason: str,
        actor: dict,
    ) -> dict:
        entry = await self._get(entry_id)
        if entry["version"] != expected_version:
            raise PortfolioDomainError(
                409, "version_conflict", "Entri portofolio telah berubah."
            )
        if not reason.strip():
            raise PortfolioDomainError(
                422, "reason_required", "Alasan rollback wajib diisi."
            )
        source = next(
            (
                item
                for item in entry.get("versions", [])
                if item["revision"] == revision
            ),
            None,
        )
        if source is None:
            raise PortfolioDomainError(
                404, "portfolio_revision_not_found", "Revisi portofolio tidak ditemukan."
            )

        # Rolling back appends the old content as a new revision rather than
        # truncating history: what was published stays on the record.
        return await self.update_content(
            entry_id,
            source["content"],
            expected_version=expected_version,
            reason=reason,
            actor=actor,
        )

    async def transition(
        self,
        entry_id: str,
        *,
        target_status: str,
        expected_version: int,
        reason: str,
        actor: dict,
        can_publish: bool,
        scheduled_for: str | None = None,
    ) -> dict:
        entry = await self._get(entry_id)
        if entry["version"] != expected_version:
            raise PortfolioDomainError(
                409,
                "version_conflict",
                "Entri portofolio telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": entry["version"],
                    "current_status": entry["status"],
                },
            )

        validate_portfolio_transition(entry["status"], target_status, reason=reason)

        if requires_publish_authority(target_status) and not can_publish:
            raise PortfolioDomainError(
                403,
                "portfolio_publish_forbidden",
                "Publikasi portofolio memerlukan wewenang approval.",
            )
        if target_status == "scheduled" and not scheduled_for:
            raise PortfolioDomainError(
                422,
                "portfolio_schedule_required",
                "Jadwal aktivasi wajib diisi untuk status scheduled.",
            )

        timestamp = now_iso()
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [
                *entry.get("history", []),
                {
                    "from_status": entry["status"],
                    "to_status": target_status,
                    "actor_user_id": actor.get("id"),
                    "reason": reason.strip(),
                    "timestamp": timestamp,
                },
            ],
            "updated_at": timestamp,
        }
        if target_status == "scheduled":
            changes["scheduled_for"] = scheduled_for
        if target_status == "published":
            changes["published_at"] = timestamp
            changes["scheduled_for"] = None
        if target_status == "archived":
            changes["archived_at"] = timestamp

        result = await self.db.portfolio.update_one(
            {"id": entry_id, "version": expected_version, "status": entry["status"]},
            {"$set": changes},
        )
        if not result.matched_count:
            raise PortfolioDomainError(
                409, "version_conflict", "Entri portofolio berubah selama transisi."
            )
        return project_admin_portfolio({**entry, **changes})

    async def reorder(self, ordered_ids: list[str], *, actor: dict) -> list[dict]:
        entries = await self.db.portfolio.find({}, {"_id": 0, "id": 1}).to_list(500)
        assignments = reorder_entries(entries, ordered_ids)
        timestamp = now_iso()
        for assignment in assignments:
            await self.db.portfolio.update_one(
                {"id": assignment["id"]},
                {
                    "$set": {
                        "display_order": assignment["display_order"],
                        "updated_at": timestamp,
                        "reordered_by": actor.get("id"),
                    }
                },
            )
        return await self.list_admin()
