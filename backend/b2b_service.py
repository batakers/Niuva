import uuid
from copy import deepcopy
from datetime import datetime, timezone

from b2b_domain import (
    B2BDomainError,
    project_inquiry,
    validate_inquiry_transition,
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
