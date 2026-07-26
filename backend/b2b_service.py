import uuid
from copy import deepcopy
from datetime import datetime, timezone

from b2b_domain import (
    B2BDomainError,
    build_quote_item_snapshot,
    project_inquiry,
    project_b2b_project,
    project_quote,
    validate_inquiry_transition,
    validate_quote_transition,
    validate_project_transition,
)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class B2BService:
    def __init__(self, *, db, transaction_guard):
        self.db = db
        self.transaction_guard = transaction_guard

    async def _get_inquiry(self, inquiry_id: str) -> dict:
        inquiry = await self.db.inquiries.find_one(
            {"id": inquiry_id},
            {"_id": 0},
        )
        if not inquiry:
            raise B2BDomainError(
                404,
                "inquiry_not_found",
                "Inquiry tidak ditemukan.",
            )
        return dict(inquiry)

    async def create_inquiry(self, payload: dict) -> dict:
        timestamp = now_iso()
        inquiry_id = str(uuid.uuid4())
        event = {
            "from_status": None,
            "to_status": "new",
            "actor_user_id": None,
            "reason": "Public inquiry submitted",
            "operation_id": None,
            "timestamp": timestamp,
        }
        inquiry = {
            "id": inquiry_id,
            "company": payload["company"].strip(),
            "pic_name": payload["pic_name"].strip(),
            "pic_email": str(payload["pic_email"]).strip().lower(),
            "pic_phone": payload.get("pic_phone", "").strip(),
            "need": payload["need"].strip(),
            "timeline": payload.get("timeline", "").strip(),
            "brief": payload["brief"].strip(),
            "status": "new",
            "version": 1,
            "converted_quote_id": None,
            "history": [event],
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        await self.db.inquiries.insert_one(deepcopy(inquiry))
        return project_inquiry(inquiry)

    async def list_inquiries(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        documents = await self.db.inquiries.find(
            query,
            {"_id": 0},
        ).sort("updated_at", -1).limit(500).to_list(500)
        return [project_inquiry(document) for document in documents]

    async def get_inquiry(self, inquiry_id: str) -> dict:
        return project_inquiry(await self._get_inquiry(inquiry_id))

    async def transition_inquiry(
        self,
        inquiry_id: str,
        *,
        target_status: str,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        inquiry = await self._get_inquiry(inquiry_id)
        for event in inquiry.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("to_status") != target_status:
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi berbeda.",
                    )
                return project_inquiry(inquiry)

        if inquiry["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Inquiry telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": inquiry["version"],
                    "current_status": inquiry["status"],
                    "permitted_next_actions": project_inquiry(inquiry)[
                        "permitted_next_actions"
                    ],
                },
            )

        validate_inquiry_transition(
            inquiry["status"],
            target_status,
            reason=reason,
        )
        timestamp = now_iso()
        event = {
            "from_status": inquiry["status"],
            "to_status": target_status,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [*inquiry.get("history", []), event],
            "updated_at": timestamp,
        }
        result = await self.db.inquiries.update_one(
            {
                "id": inquiry_id,
                "version": expected_version,
                "status": inquiry["status"],
            },
            {"$set": changes},
        )
        if not result.matched_count:
            current = await self._get_inquiry(inquiry_id)
            raise B2BDomainError(
                409,
                "version_conflict",
                "Inquiry telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": current["version"],
                    "current_status": current["status"],
                    "permitted_next_actions": project_inquiry(current)[
                        "permitted_next_actions"
                    ],
                },
            )
        return project_inquiry({**inquiry, **changes})

    async def _conversion_result(self, inquiry: dict) -> dict:
        quote_id = inquiry.get("converted_quote_id")
        quote = await self.db.b2b_quotes.find_one({"id": quote_id}, {"_id": 0})
        if not quote:
            raise B2BDomainError(
                409,
                "quote_conversion_incomplete",
                "Hasil conversion memerlukan rekonsiliasi.",
            )
        version = await self.db.b2b_quote_versions.find_one(
            {"id": quote["current_version_id"]},
            {"_id": 0},
        )
        return {
            "inquiry": project_inquiry(inquiry),
            "quote": project_quote(quote, version),
        }

    async def _get_quote(self, quote_id: str) -> dict:
        quote = await self.db.b2b_quotes.find_one({"id": quote_id}, {"_id": 0})
        if not quote:
            raise B2BDomainError(404, "quote_not_found", "Quote tidak ditemukan.")
        return dict(quote)

    async def _get_quote_version(self, version_id: str) -> dict:
        version = await self.db.b2b_quote_versions.find_one(
            {"id": version_id},
            {"_id": 0},
        )
        if not version:
            raise B2BDomainError(
                409,
                "quote_version_missing",
                "Versi Quote tidak ditemukan dan memerlukan rekonsiliasi.",
            )
        return dict(version)

    async def get_quote(self, quote_id: str) -> dict:
        quote = await self._get_quote(quote_id)
        version = await self._get_quote_version(quote["current_version_id"])
        return project_quote(quote, version)

    async def list_quotes(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        quotes = await self.db.b2b_quotes.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(500).to_list(500)
        return [project_quote(quote) for quote in quotes]

    async def transition_quote(
        self,
        quote_id: str,
        *,
        target_status: str,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        quote = await self._get_quote(quote_id)
        for event in quote.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("to_status") != target_status:
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi Quote berbeda.",
                    )
                return await self.get_quote(quote_id)
        if quote["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Quote telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": quote["version"],
                    "current_status": quote["status"],
                    "permitted_next_actions": project_quote(quote)[
                        "permitted_next_actions"
                    ],
                },
            )
        validate_quote_transition(quote["status"], target_status, reason=reason)
        timestamp = now_iso()
        event = {
            "from_status": quote["status"],
            "to_status": target_status,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [*quote.get("history", []), event],
            "updated_at": timestamp,
        }
        if target_status == "accepted":
            changes["accepted_version_id"] = quote["current_version_id"]
        result = await self.db.b2b_quotes.update_one(
            {"id": quote_id, "version": expected_version, "status": quote["status"]},
            {"$set": changes},
        )
        if not result.matched_count:
            current = await self._get_quote(quote_id)
            raise B2BDomainError(
                409,
                "version_conflict",
                "Quote telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": current["version"],
                    "current_status": current["status"],
                    "permitted_next_actions": project_quote(current)[
                        "permitted_next_actions"
                    ],
                },
            )
        current_version = await self._get_quote_version(quote["current_version_id"])
        return project_quote({**quote, **changes}, current_version)

    async def create_quote_revision(
        self,
        quote_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        scope_snapshot: dict,
        items: list[dict],
        total_minor: int | None,
        actor: dict,
    ) -> dict:
        quote = await self._get_quote(quote_id)
        for event in quote.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("event") != "revision_created":
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi Quote berbeda.",
                    )
                return await self.get_quote(quote_id)
        if quote["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Quote telah berubah. Muat versi terbaru sebelum membuat revisi.",
                details={"current_version": quote["version"], "current_status": quote["status"]},
            )
        if quote["status"] != "revision_requested":
            raise B2BDomainError(
                409,
                "quote_revision_forbidden",
                "Revisi baru hanya dapat dibuat setelah revision requested.",
            )
        if not reason.strip():
            raise B2BDomainError(422, "reason_required", "Alasan revisi wajib diisi.")
        if total_minor is not None and (not isinstance(total_minor, int) or total_minor < 0):
            raise B2BDomainError(
                422,
                "money_invalid",
                "Total Quote harus berupa integer minor-unit non-negatif.",
            )

        snapshot_items = await self._build_item_snapshots(items)
        if snapshot_items:
            total_minor = sum(item["line_total_minor"] for item in snapshot_items)

        timestamp = now_iso()
        revision = quote["current_revision"] + 1
        version_id = str(uuid.uuid4())
        version = {
            "id": version_id,
            "quote_id": quote_id,
            "revision": revision,
            "scope_snapshot": deepcopy(scope_snapshot),
            "items": snapshot_items,
            "currency": "IDR",
            "total_minor": total_minor,
            "created_by": actor.get("id"),
            "reason": reason.strip(),
            "created_at": timestamp,
        }
        event = {
            "event": "revision_created",
            "from_status": "revision_requested",
            "to_status": "draft",
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": "draft",
            "version": expected_version + 1,
            "current_revision": revision,
            "current_version_id": version_id,
            "history": [*quote.get("history", []), event],
            "updated_at": timestamp,
        }

        async def mutation(session):
            options = {"session": session}
            await self.db.b2b_quote_versions.insert_one(deepcopy(version), **options)
            result = await self.db.b2b_quotes.update_one(
                {
                    "id": quote_id,
                    "version": expected_version,
                    "status": "revision_requested",
                    "current_version_id": quote["current_version_id"],
                },
                {"$set": changes},
                **options,
            )
            if not result.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Quote berubah selama pembuatan revisi.",
                )
            return project_quote({**quote, **changes}, version)

        if self.transaction_guard is None:
            raise B2BDomainError(
                503,
                "transaction_unavailable",
                "Pembuatan revisi Quote tidak tersedia tanpa transaction guard.",
            )
        return await self.transaction_guard.run(
            mutation,
            operation_name="b2b.create_quote_revision",
            retry_safe=True,
            correlation_id=operation_id,
        )

    async def _build_item_snapshots(self, items: list[dict]) -> list[dict]:
        """Read the catalog once and freeze it onto each quoted line."""
        variant_ids = sorted(
            {
                str(item["variant_id"]).strip()
                for item in items
                if str(item.get("variant_id") or "").strip()
            }
        )
        variants_by_id: dict[str, dict] = {}
        products_by_id: dict[str, dict] = {}
        materials_by_id: dict[str, dict] = {}

        if variant_ids:
            variants = await self.db.product_variants.find(
                {"id": {"$in": variant_ids}}, {"_id": 0}
            ).to_list(len(variant_ids))
            variants_by_id = {item["id"]: item for item in variants}

            missing = [
                variant_id
                for variant_id in variant_ids
                if variant_id not in variants_by_id
            ]
            if missing:
                raise B2BDomainError(
                    422,
                    "quote_item_variant_not_found",
                    "Varian produk pada item penawaran tidak ditemukan.",
                    details={"variant_ids": missing},
                )

            product_ids = sorted(
                {
                    variant["product_id"]
                    for variant in variants_by_id.values()
                    if variant.get("product_id")
                }
            )
            if product_ids:
                products = await self.db.products.find(
                    {"id": {"$in": product_ids}}, {"_id": 0}
                ).to_list(len(product_ids))
                products_by_id = {item["id"]: item for item in products}

            material_ids = sorted(
                {
                    entry["material_id"]
                    for variant in variants_by_id.values()
                    for entry in variant.get("bill_of_materials") or []
                    if entry.get("material_id")
                }
            )
            if material_ids:
                materials = await self.db.materials.find(
                    {"id": {"$in": material_ids}}, {"_id": 0}
                ).to_list(len(material_ids))
                materials_by_id = {item["id"]: item for item in materials}

        snapshots = []
        for item in items:
            variant_id = str(item.get("variant_id") or "").strip()
            variant = variants_by_id.get(variant_id) if variant_id else None
            product = (
                products_by_id.get(variant.get("product_id")) if variant else None
            )
            snapshots.append(
                build_quote_item_snapshot(
                    item,
                    variant=variant,
                    product=product,
                    materials_by_id=materials_by_id,
                )
            )
        return snapshots

    async def _get_project(self, project_id: str) -> dict:
        project = await self.db.b2b_projects.find_one({"id": project_id}, {"_id": 0})
        if not project:
            raise B2BDomainError(404, "project_not_found", "Project tidak ditemukan.")
        return dict(project)

    async def get_project(self, project_id: str) -> dict:
        return project_b2b_project(await self._get_project(project_id))

    async def list_projects(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        projects = await self.db.b2b_projects.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(500).to_list(500)
        return [project_b2b_project(project) for project in projects]

    async def create_project_from_quote(
        self,
        quote_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        quote = await self._get_quote(quote_id)
        if quote.get("project_id"):
            replay = next(
                (
                    event
                    for event in quote.get("history", [])
                    if event.get("operation_id") == operation_id
                    and event.get("event") == "project_created"
                ),
                None,
            )
            if replay:
                project = await self._get_project(quote["project_id"])
                version = await self._get_quote_version(quote["current_version_id"])
                return {
                    "quote": project_quote(quote, version),
                    "project": project_b2b_project(project),
                }
            raise B2BDomainError(
                409,
                "project_already_created",
                "Accepted Quote sudah memiliki Project.",
                details={"project_id": quote["project_id"]},
            )
        if quote["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Quote telah berubah. Muat versi terbaru sebelum membuat Project.",
                details={"current_version": quote["version"], "current_status": quote["status"]},
            )
        if quote["status"] != "accepted" or not quote.get("accepted_version_id"):
            raise B2BDomainError(
                409,
                "project_creation_forbidden",
                "Project hanya dapat dibuat dari Quote yang sudah accepted.",
            )
        if not reason.strip():
            raise B2BDomainError(422, "reason_required", "Alasan pembuatan Project wajib diisi.")

        accepted_version = await self._get_quote_version(quote["accepted_version_id"])
        timestamp = now_iso()
        project_id = str(uuid.uuid4())
        project = {
            "id": project_id,
            "quote_id": quote_id,
            "inquiry_id": quote["inquiry_id"],
            "source_quote_version_id": quote["accepted_version_id"],
            "quote_snapshot": deepcopy(accepted_version),
            "status": "planned",
            "version": 1,
            "milestones": [],
            "design_versions": [],
            "work_order_ids": [],
            "qc_record_ids": [],
            "fulfilment_ids": [],
            "history": [
                {
                    "from_status": None,
                    "to_status": "planned",
                    "actor_user_id": actor.get("id"),
                    "reason": reason.strip(),
                    "operation_id": operation_id,
                    "timestamp": timestamp,
                }
            ],
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        quote_event = {
            "event": "project_created",
            "from_status": "accepted",
            "to_status": "accepted",
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        quote_changes = {
            "project_id": project_id,
            "version": expected_version + 1,
            "history": [*quote.get("history", []), quote_event],
            "updated_at": timestamp,
        }

        async def mutation(session):
            options = {"session": session}
            await self.db.b2b_projects.insert_one(deepcopy(project), **options)
            result = await self.db.b2b_quotes.update_one(
                {
                    "id": quote_id,
                    "version": expected_version,
                    "status": "accepted",
                    "accepted_version_id": quote["accepted_version_id"],
                    "project_id": None,
                },
                {"$set": quote_changes},
                **options,
            )
            if not result.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Quote berubah selama pembuatan Project.",
                )
            return {
                "quote": project_quote({**quote, **quote_changes}, accepted_version),
                "project": project_b2b_project(project),
            }

        if self.transaction_guard is None:
            raise B2BDomainError(
                503,
                "transaction_unavailable",
                "Pembuatan Project tidak tersedia tanpa transaction guard.",
            )
        return await self.transaction_guard.run(
            mutation,
            operation_name="b2b.create_project",
            retry_safe=True,
            correlation_id=operation_id,
        )

    async def transition_project(
        self,
        project_id: str,
        *,
        target_status: str,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        project = await self._get_project(project_id)
        for event in project.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("to_status") != target_status:
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi Project berbeda.",
                    )
                return project_b2b_project(project)
        if project["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Project telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": project["version"],
                    "current_status": project["status"],
                    "permitted_next_actions": project_b2b_project(project)[
                        "permitted_next_actions"
                    ],
                },
            )
        validate_project_transition(project["status"], target_status, reason=reason)
        timestamp = now_iso()
        event = {
            "from_status": project["status"],
            "to_status": target_status,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [*project.get("history", []), event],
            "updated_at": timestamp,
        }
        result = await self.db.b2b_projects.update_one(
            {"id": project_id, "version": expected_version, "status": project["status"]},
            {"$set": changes},
        )
        if not result.matched_count:
            current = await self._get_project(project_id)
            raise B2BDomainError(
                409,
                "version_conflict",
                "Project telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={"current_version": current["version"], "current_status": current["status"]},
            )
        return project_b2b_project({**project, **changes})

    async def convert_inquiry(
        self,
        inquiry_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
    ) -> dict:
        inquiry = await self._get_inquiry(inquiry_id)
        if inquiry["status"] == "converted":
            replay = next(
                (
                    event
                    for event in inquiry.get("history", [])
                    if event.get("operation_id") == operation_id
                    and event.get("to_status") == "converted"
                ),
                None,
            )
            if replay:
                return await self._conversion_result(inquiry)
            raise B2BDomainError(
                409,
                "inquiry_already_converted",
                "Inquiry sudah memiliki Quote.",
                details={"converted_quote_id": inquiry.get("converted_quote_id")},
            )
        if inquiry["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Inquiry telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": inquiry["version"],
                    "current_status": inquiry["status"],
                    "permitted_next_actions": project_inquiry(inquiry)[
                        "permitted_next_actions"
                    ],
                },
            )
        validate_inquiry_transition(
            inquiry["status"],
            "converted",
            reason=reason,
        )
        if not reason.strip():
            raise B2BDomainError(422, "reason_required", "Alasan conversion wajib diisi.")

        timestamp = now_iso()
        quote_id = str(uuid.uuid4())
        version_id = str(uuid.uuid4())
        quote_version = {
            "id": version_id,
            "quote_id": quote_id,
            "revision": 1,
            "scope_snapshot": {
                "company": inquiry["company"],
                "pic_name": inquiry["pic_name"],
                "pic_email": inquiry["pic_email"],
                "pic_phone": inquiry.get("pic_phone", ""),
                "need": inquiry["need"],
                "timeline": inquiry.get("timeline", ""),
                "brief": inquiry["brief"],
            },
            "items": [],
            "currency": "IDR",
            "total_minor": None,
            "created_by": actor.get("id"),
            "reason": reason.strip(),
            "created_at": timestamp,
        }
        quote = {
            "id": quote_id,
            "inquiry_id": inquiry_id,
            "status": "draft",
            "version": 1,
            "current_revision": 1,
            "current_version_id": version_id,
            "accepted_version_id": None,
            "project_id": None,
            "history": [
                {
                    "from_status": None,
                    "to_status": "draft",
                    "actor_user_id": actor.get("id"),
                    "reason": reason.strip(),
                    "operation_id": operation_id,
                    "timestamp": timestamp,
                }
            ],
            "created_at": timestamp,
            "updated_at": timestamp,
        }
        inquiry_event = {
            "from_status": inquiry["status"],
            "to_status": "converted",
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        inquiry_changes = {
            "status": "converted",
            "version": expected_version + 1,
            "converted_quote_id": quote_id,
            "history": [*inquiry.get("history", []), inquiry_event],
            "updated_at": timestamp,
        }

        async def mutation(session):
            options = {"session": session}
            await self.db.b2b_quote_versions.insert_one(
                deepcopy(quote_version),
                **options,
            )
            await self.db.b2b_quotes.insert_one(deepcopy(quote), **options)
            result = await self.db.inquiries.update_one(
                {
                    "id": inquiry_id,
                    "version": expected_version,
                    "status": "contacted",
                    "converted_quote_id": None,
                },
                {"$set": inquiry_changes},
                **options,
            )
            if not result.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Inquiry telah berubah selama conversion.",
                )
            return {
                "inquiry": project_inquiry({**inquiry, **inquiry_changes}),
                "quote": project_quote(quote, quote_version),
            }

        if self.transaction_guard is None:
            raise B2BDomainError(
                503,
                "transaction_unavailable",
                "Conversion Inquiry tidak tersedia tanpa transaction guard.",
            )
        return await self.transaction_guard.run(
            mutation,
            operation_name="b2b.convert_inquiry",
            retry_safe=True,
            correlation_id=operation_id,
        )
