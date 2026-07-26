import uuid
from copy import deepcopy
from datetime import datetime, timezone

from b2b_domain import (
    B2BDomainError,
    project_inquiry,
    project_quote,
    validate_inquiry_transition,
    validate_quote_transition,
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

        timestamp = now_iso()
        revision = quote["current_revision"] + 1
        version_id = str(uuid.uuid4())
        version = {
            "id": version_id,
            "quote_id": quote_id,
            "revision": revision,
            "scope_snapshot": deepcopy(scope_snapshot),
            "items": deepcopy(items),
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
