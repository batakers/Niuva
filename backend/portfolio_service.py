import uuid
from copy import deepcopy
from datetime import datetime, timezone

from portfolio_domain import (
    PUBLIC_PORTFOLIO_FIELDS,
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


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def now_iso() -> str:
    return now_utc().isoformat()


def parse_scheduled_at(value: datetime | str | None) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        moment = value
    elif isinstance(value, str):
        try:
            moment = datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError as exc:
            raise PortfolioDomainError(
                422,
                "portfolio_schedule_invalid",
                "Jadwal aktivasi harus berupa tanggal ISO-8601 yang valid.",
            ) from exc
    else:
        raise PortfolioDomainError(
            422,
            "portfolio_schedule_invalid",
            "Jadwal aktivasi tidak valid.",
        )
    if moment.tzinfo is None:
        raise PortfolioDomainError(
            422,
            "portfolio_schedule_timezone_required",
            "Jadwal aktivasi harus memiliki timezone.",
        )
    return moment.astimezone(timezone.utc)


class PortfolioService:
    def __init__(self, *, db, transaction_guard):
        self.db = db
        self.transaction_guard = transaction_guard

    def _require_guard(self):
        if self.transaction_guard is None:
            raise PortfolioDomainError(
                503,
                "transaction_unavailable",
                "Mutation portofolio tidak tersedia tanpa transaction guard.",
            )
        return self.transaction_guard

    async def _get(self, entry_id: str, *, session=None) -> dict:
        options = {"session": session} if session is not None else {}
        entry = await self.db.portfolio.find_one(
            {"id": entry_id},
            {"_id": 0},
            **options,
        )
        if not entry:
            raise PortfolioDomainError(
                404,
                "portfolio_not_found",
                "Entri portofolio tidak ditemukan.",
            )
        return dict(entry)

    async def _revisions(self, entry_id: str, *, session=None) -> list[dict]:
        options = {"session": session} if session is not None else {}
        return await self.db.portfolio_revisions.find(
            {"portfolio_id": entry_id},
            {"_id": 0},
            **options,
        ).sort("revision", 1).to_list(1000)

    async def get(self, entry_id: str) -> dict:
        entry = await self._get(entry_id)
        entry["versions"] = await self._revisions(entry_id)
        return project_admin_portfolio(entry)

    async def list_admin(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        documents = await self.db.portfolio.find(query, {"_id": 0}).sort(
            "display_order",
            1,
        ).limit(500).to_list(500)
        return [project_admin_portfolio(document) for document in documents]

    async def list_public(self) -> list[dict]:
        publications = await self.db.portfolio_publications.find(
            {
                "retired_at": None,
                "activates_at": {"$lte": now_utc()},
            },
            {"_id": 0},
        ).sort("snapshot.display_order", 1).limit(200).to_list(200)
        return [
            project_public_portfolio(publication.get("snapshot") or {})
            for publication in publications
        ]

    async def create(self, payload: dict, *, actor: dict) -> dict:
        timestamp = now_iso()
        entry_id = str(uuid.uuid4())
        revision_id = str(uuid.uuid4())
        content = {field: payload.get(field) for field in CONTENT_FIELDS}
        highest = await self.db.portfolio.find(
            {},
            {"_id": 0, "display_order": 1},
        ).sort("display_order", -1).limit(1).to_list(1)
        revision = {
            "id": revision_id,
            "portfolio_id": entry_id,
            "revision": 1,
            "content": deepcopy(content),
            "actor_user_id": actor.get("id"),
            "reason": "Draft dibuat",
            "created_at": timestamp,
        }
        entry = {
            "id": entry_id,
            **content,
            "source_project_id": payload.get("source_project_id"),
            "status": "draft",
            "version": 1,
            "revision_count": 1,
            "current_revision_id": revision_id,
            "display_order": (
                highest[0].get("display_order", -1) + 1 if highest else 0
            ),
            "scheduled_for": None,
            "published_at": None,
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

        async def mutation(session):
            options = {"session": session}
            await self.db.portfolio_revisions.insert_one(
                deepcopy(revision),
                **options,
            )
            await self.db.portfolio.insert_one(deepcopy(entry), **options)
            return project_admin_portfolio({**entry, "versions": [revision]})

        return await self._require_guard().run(
            mutation,
            operation_name="portfolio.create",
        )

    async def create_from_project(self, project_id: str, *, actor: dict) -> dict:
        project = await self.db.b2b_projects.find_one(
            {"id": project_id},
            {"_id": 0},
        )
        if not project:
            raise PortfolioDomainError(
                404,
                "project_not_found",
                "Project tidak ditemukan.",
            )
        existing = await self.db.portfolio.find_one(
            {"source_project_id": project_id},
            {"_id": 0},
        )
        if existing:
            return await self.get(existing["id"])
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
                "Entri yang sudah tayang tidak dapat diubah langsung.",
            )
        if entry["status"] not in {"draft", "review", "preview"}:
            raise PortfolioDomainError(
                409,
                "portfolio_working_revision_required",
                "Konten hanya dapat diubah pada working revision.",
            )
        if not reason.strip():
            raise PortfolioDomainError(
                422,
                "reason_required",
                "Alasan perubahan wajib diisi.",
            )
        timestamp = now_iso()
        content = {field: payload.get(field) for field in CONTENT_FIELDS}
        revision_number = int(entry.get("revision_count", 0)) + 1
        revision_id = str(uuid.uuid4())
        revision = {
            "id": revision_id,
            "portfolio_id": entry_id,
            "revision": revision_number,
            "content": deepcopy(content),
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "created_at": timestamp,
        }
        changes = {
            **content,
            "version": expected_version + 1,
            "revision_count": revision_number,
            "current_revision_id": revision_id,
            "updated_at": timestamp,
        }

        async def mutation(session):
            options = {"session": session}
            await self.db.portfolio_revisions.insert_one(
                deepcopy(revision),
                **options,
            )
            result = await self.db.portfolio.update_one(
                {"id": entry_id, "version": expected_version},
                {"$set": changes},
                **options,
            )
            if not result.matched_count:
                raise PortfolioDomainError(
                    409,
                    "version_conflict",
                    "Entri portofolio berubah saat disimpan.",
                )
            revisions = await self._revisions(entry_id, session=session)
            return project_admin_portfolio(
                {**entry, **changes, "versions": revisions},
            )

        return await self._require_guard().run(
            mutation,
            operation_name="portfolio.update_content",
        )

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
                409,
                "version_conflict",
                "Entri portofolio telah berubah.",
            )
        source = await self.db.portfolio_revisions.find_one(
            {"portfolio_id": entry_id, "revision": revision},
            {"_id": 0},
        )
        if source is None:
            raise PortfolioDomainError(
                404,
                "portfolio_revision_not_found",
                "Revisi portofolio tidak ditemukan.",
            )
        return await self.update_content(
            entry_id,
            source["content"],
            expected_version=expected_version,
            reason=reason,
            actor=actor,
        )

    def _publication(
        self,
        entry: dict,
        changes: dict,
        *,
        activates_at: datetime,
        actor: dict,
        reason: str,
    ) -> dict:
        merged = {**entry, **changes}
        snapshot = {
            field: deepcopy(merged[field])
            for field in PUBLIC_PORTFOLIO_FIELDS
            if field in merged
        }
        return {
            "id": str(uuid.uuid4()),
            "portfolio_id": entry["id"],
            "source_revision_id": entry["current_revision_id"],
            "source_revision": entry.get("revision_count", 1),
            "snapshot": snapshot,
            "activates_at": activates_at,
            "retired_at": None,
            "created_by": actor.get("id"),
            "reason": reason.strip(),
            "created_at": now_utc(),
        }

    async def transition(
        self,
        entry_id: str,
        *,
        target_status: str,
        expected_version: int,
        reason: str,
        actor: dict,
        can_write: bool,
        can_publish: bool,
        can_archive: bool,
        scheduled_for: datetime | str | None = None,
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
        if requires_publish_authority(target_status):
            if not can_publish:
                raise PortfolioDomainError(
                    403,
                    "portfolio_publish_forbidden",
                    "Publikasi portofolio memerlukan wewenang approval.",
                )
        elif target_status == "archived":
            if not can_archive:
                raise PortfolioDomainError(
                    403,
                    "portfolio_archive_forbidden",
                    "Arsip portofolio memerlukan wewenang archive.",
                )
        elif not can_write:
            raise PortfolioDomainError(
                403,
                "portfolio_write_forbidden",
                "Transisi working revision memerlukan wewenang authoring.",
            )

        activation = parse_scheduled_at(scheduled_for)
        if target_status == "scheduled":
            if activation is None:
                raise PortfolioDomainError(
                    422,
                    "portfolio_schedule_required",
                    "Jadwal aktivasi wajib diisi untuk status scheduled.",
                )
            if activation <= now_utc():
                raise PortfolioDomainError(
                    422,
                    "portfolio_schedule_future_required",
                    "Jadwal aktivasi harus berada di masa depan.",
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
            changes["scheduled_for"] = activation
        elif target_status == "published":
            changes["published_at"] = timestamp
            changes["scheduled_for"] = None
            activation = now_utc()
        elif target_status == "archived":
            changes["archived_at"] = timestamp
        elif target_status in {"preview", "draft"}:
            changes["scheduled_for"] = None

        publication = None
        if target_status in {"scheduled", "published"}:
            publication = self._publication(
                entry,
                changes,
                activates_at=activation,
                actor=actor,
                reason=reason,
            )

        async def mutation(session):
            options = {"session": session}
            if entry["status"] in {"scheduled", "published"}:
                await self.db.portfolio_publications.update_many(
                    {"portfolio_id": entry_id, "retired_at": None},
                    {"$set": {"retired_at": now_utc()}},
                    **options,
                )
            if publication is not None:
                await self.db.portfolio_publications.insert_one(
                    deepcopy(publication),
                    **options,
                )
            result = await self.db.portfolio.update_one(
                {
                    "id": entry_id,
                    "version": expected_version,
                    "status": entry["status"],
                },
                {"$set": changes},
                **options,
            )
            if not result.matched_count:
                raise PortfolioDomainError(
                    409,
                    "version_conflict",
                    "Entri portofolio berubah selama transisi.",
                )
            return project_admin_portfolio({**entry, **changes})

        return await self._require_guard().run(
            mutation,
            operation_name="portfolio.transition",
        )

    async def reorder(
        self,
        ordered_ids: list[str],
        *,
        expected_versions: dict[str, int],
        actor: dict,
    ) -> list[dict]:
        entries = await self.db.portfolio.find(
            {},
            {"_id": 0, "id": 1, "version": 1},
        ).to_list(500)
        assignments = reorder_entries(entries, ordered_ids)
        current_versions = {
            entry["id"]: int(entry.get("version", 1)) for entry in entries
        }
        if expected_versions != current_versions:
            raise PortfolioDomainError(
                409,
                "version_conflict",
                "Urutan portofolio memakai versi yang sudah berubah.",
                details={"current_versions": current_versions},
            )
        timestamp = now_iso()

        async def mutation(session):
            for assignment in assignments:
                entry_id = assignment["id"]
                result = await self.db.portfolio.update_one(
                    {
                        "id": entry_id,
                        "version": expected_versions[entry_id],
                    },
                    {
                        "$set": {
                            "display_order": assignment["display_order"],
                            "updated_at": timestamp,
                            "reordered_by": actor.get("id"),
                        },
                        "$inc": {"version": 1},
                    },
                    session=session,
                )
                if not result.matched_count:
                    raise PortfolioDomainError(
                        409,
                        "version_conflict",
                        "Entri berubah selama reorder.",
                    )
            return await self.list_admin()

        return await self._require_guard().run(
            mutation,
            operation_name="portfolio.reorder",
        )
