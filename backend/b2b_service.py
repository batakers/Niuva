import logging
import uuid
from copy import deepcopy
from datetime import datetime, timezone
from decimal import Decimal

from bson.decimal128 import Decimal128

from inventory_service import InventoryError

from b2b_domain import (
    B2BDomainError,
    PROJECT_STATUSES_ACCEPTING_WORK,
    build_material_requirements,
    build_quote_item_snapshot,
    project_work_order,
    require_exact_quote_line_identities,
    validate_work_order_transition,
    project_inquiry,
    project_b2b_project,
    project_quote,
    validate_inquiry_transition,
    validate_quote_readiness,
    validate_quote_transition,
    validate_project_transition,
)


logger = logging.getLogger(__name__)


def to_decimal(value) -> Decimal:
    """Read a stored quantity as an exact Decimal, whatever encoding it uses."""
    if isinstance(value, Decimal128):
        return value.to_decimal()
    return value if isinstance(value, Decimal) else Decimal(str(value))


def decimal_string(value) -> str:
    """Render a stored quantity as an exact decimal string, never a float."""
    amount = to_decimal(value)
    return "0" if amount == 0 else format(amount.normalize(), "f")


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
        if target_status == "accepted":
            raise B2BDomainError(
                409,
                "acceptance_evidence_required",
                "Penerimaan Quote harus direkam melalui command acceptance dengan evidence.",
            )
        validate_quote_transition(quote["status"], target_status, reason=reason)
        current_version = await self._get_quote_version(quote["current_version_id"])
        if target_status in {"internal_review", "sent"}:
            validate_quote_readiness(current_version)
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
        if target_status == "sent":
            changes["sent_version_id"] = quote["current_version_id"]
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
        return project_quote({**quote, **changes}, current_version)

    async def accept_quote(
        self,
        quote_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        approver: dict,
        accepted_at: datetime,
        channel: str,
        evidence_reference: str,
        actor: dict,
    ) -> dict:
        quote = await self._get_quote(quote_id)
        for event in quote.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("event") != "quote_accepted_with_evidence":
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
                "Quote telah berubah. Muat versi terbaru sebelum menerima.",
                details={
                    "current_version": quote["version"],
                    "current_status": quote["status"],
                },
            )
        validate_quote_transition(quote["status"], "accepted", reason=reason)
        current_version = await self._get_quote_version(quote["current_version_id"])
        validate_quote_readiness(current_version)
        if quote.get("sent_version_id") != quote["current_version_id"]:
            raise B2BDomainError(
                409,
                "quote_sent_version_mismatch",
                "Versi Quote yang diterima harus sama dengan versi yang dikirim.",
            )
        if accepted_at.tzinfo is None:
            raise B2BDomainError(
                422,
                "accepted_at_timezone_required",
                "Waktu penerimaan harus memiliki timezone.",
            )
        if accepted_at > datetime.now(timezone.utc):
            raise B2BDomainError(
                422,
                "accepted_at_in_future",
                "Waktu penerimaan tidak boleh berada di masa depan.",
            )
        approver_name = str(approver.get("name") or "").strip()
        approver_identity = str(approver.get("identity") or "").strip()
        evidence_reference = evidence_reference.strip()
        if not approver_name or not approver_identity or len(evidence_reference) < 3:
            raise B2BDomainError(
                422,
                "acceptance_evidence_invalid",
                "Identitas approver dan referensi evidence wajib diisi.",
            )
        timestamp = now_iso()
        acceptance = {
            "approver": {
                "name": approver_name,
                "identity": approver_identity,
            },
            "accepted_at": accepted_at.astimezone(timezone.utc).isoformat(),
            "channel": channel,
            "evidence_reference": evidence_reference,
            "recorded_by": actor.get("id"),
            "recorded_at": timestamp,
            "reason": reason.strip(),
            "version_id": quote["current_version_id"],
        }
        event = {
            "event": "quote_accepted_with_evidence",
            "from_status": quote["status"],
            "to_status": "accepted",
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
            "acceptance": deepcopy(acceptance),
        }
        changes = {
            "status": "accepted",
            "version": expected_version + 1,
            "accepted_version_id": quote["current_version_id"],
            "acceptance": acceptance,
            "history": [*quote.get("history", []), event],
            "updated_at": timestamp,
        }
        result = await self.db.b2b_quotes.update_one(
            {
                "id": quote_id,
                "version": expected_version,
                "status": "sent",
                "current_version_id": quote["current_version_id"],
                "sent_version_id": quote["current_version_id"],
            },
            {"$set": changes},
        )
        if not result.matched_count:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Quote berubah selama pencatatan penerimaan.",
            )
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
        if quote["status"] not in {"draft", "revision_requested"}:
            raise B2BDomainError(
                409,
                "quote_revision_forbidden",
                "Revisi hanya dapat dibuat saat Quote draft atau revision requested.",
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
            "from_status": quote["status"],
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
                    "status": quote["status"],
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

    async def _get_work_order(self, work_order_id: str) -> dict:
        work_order = await self.db.work_orders.find_one(
            {"id": work_order_id}, {"_id": 0}
        )
        if not work_order:
            raise B2BDomainError(
                404, "work_order_not_found", "Work Order tidak ditemukan."
            )
        return dict(work_order)

    async def get_work_order(self, work_order_id: str) -> dict:
        return project_work_order(await self._get_work_order(work_order_id))

    async def list_work_orders(
        self, *, project_id: str | None = None, status: str | None = None
    ) -> list[dict]:
        query = {}
        if project_id:
            query["project_id"] = project_id
        if status:
            query["status"] = status
        documents = await self.db.work_orders.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(500).to_list(500)
        return [project_work_order(document) for document in documents]

    async def _accepted_line(
        self,
        project: dict,
        *,
        quote_line_id: str,
    ) -> dict:
        """Resolve exactly one immutable accepted line; never infer by variant."""
        source_version_id = project.get("source_quote_version_id")
        if not isinstance(source_version_id, str) or not source_version_id:
            raise B2BDomainError(
                409,
                "quote_line_reconciliation_required",
                "Project historis tidak memiliki referensi versi Quote.",
                details={"reason": "missing_source_quote_version"},
            )
        version = await self._get_quote_version(source_version_id)
        if version.get("quote_id") != project.get("quote_id"):
            raise B2BDomainError(
                409,
                "quote_line_reconciliation_required",
                "Referensi Quote pada Project dan versi sumber tidak konsisten.",
                details={"reason": "source_quote_mismatch"},
            )
        snapshot = project.get("quote_snapshot")
        if snapshot and snapshot.get("id") != source_version_id:
            raise B2BDomainError(
                409,
                "quote_line_reconciliation_required",
                "Referensi versi Quote pada Project tidak konsisten.",
                details={"reason": "source_quote_version_mismatch"},
            )
        items = version.get("items") or []
        require_exact_quote_line_identities(items)
        for item in items:
            if item["quote_line_id"] == quote_line_id:
                return item
        raise B2BDomainError(
            422,
            "work_order_line_not_quoted",
            "Baris penawaran tidak ada pada versi Quote yang diterima.",
            details={"quote_line_id": quote_line_id},
        )

    async def create_work_order(
        self,
        project_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        quote_line_id: str,
        quantity: int,
        actor: dict,
    ) -> dict:
        project = await self._get_project(project_id)

        for event in project.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("event") != "work_order_created":
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi Project berbeda.",
                    )
                return await self.get_work_order(event["work_order_id"])

        if project["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Project telah berubah. Muat versi terbaru sebelum membuat Work Order.",
                details={
                    "current_version": project["version"],
                    "current_status": project["status"],
                },
            )
        if project["status"] not in PROJECT_STATUSES_ACCEPTING_WORK:
            raise B2BDomainError(
                409,
                "project_not_accepting_work",
                "Project pada status ini tidak dapat menerima Work Order baru.",
                details={"current_status": project["status"]},
            )
        if not reason.strip():
            raise B2BDomainError(
                422, "reason_required", "Alasan pembuatan Work Order wajib diisi."
            )
        if quantity < 1:
            raise B2BDomainError(
                422,
                "work_order_quantity_invalid",
                "Jumlah produksi harus minimal satu.",
            )

        line = await self._accepted_line(
            project,
            quote_line_id=quote_line_id,
        )
        resolved_line_id = line["quote_line_id"]
        resolved_variant_id = line.get("variant_id")
        if not resolved_variant_id:
            raise B2BDomainError(
                422,
                "work_order_line_has_no_variant",
                "Baris Quote tidak mereferensikan varian produksi.",
            )
        active_work_orders = await self.db.work_orders.find(
            {
                "project_id": project_id,
                "source_quote_version_id": project["source_quote_version_id"],
                "quote_line_id": resolved_line_id,
                "status": {"$ne": "cancelled"},
            },
            {"_id": 0, "quantity": 1},
        ).to_list(1000)
        committed_quantity = sum(
            int(item.get("quantity", 0)) for item in active_work_orders
        )
        accepted_quantity = int(line["quantity"])
        if committed_quantity + quantity > accepted_quantity:
            raise B2BDomainError(
                409,
                "work_order_quote_quantity_exceeded",
                "Total Work Order tidak boleh melebihi kuantitas Quote yang diterima.",
                details={
                    "accepted_quantity": accepted_quantity,
                    "committed_quantity": committed_quantity,
                    "requested_quantity": quantity,
                    "remaining_quantity": max(
                        accepted_quantity - committed_quantity,
                        0,
                    ),
                },
            )

        timestamp = now_iso()
        work_order_id = str(uuid.uuid4())
        work_order = {
            "id": work_order_id,
            "project_id": project_id,
            "quote_id": project["quote_id"],
            "source_quote_version_id": project["source_quote_version_id"],
            "quote_line_id": resolved_line_id,
            "variant_id": resolved_variant_id,
            "quantity": quantity,
            "status": "planned",
            "version": 1,
            # Scaled from the accepted quotation, so production consumes what
            # was sold rather than whatever the catalog says today.
            "material_requirements": build_material_requirements(
                line.get("material_snapshot"), quantity
            ),
            "reservation_ids": [],
            "history": [
                {
                    "event": "work_order_created",
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
        project_event = {
            "event": "work_order_created",
            "from_status": project["status"],
            "to_status": project["status"],
            "work_order_id": work_order_id,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        project_changes = {
            "version": expected_version + 1,
            "work_order_ids": [*project.get("work_order_ids", []), work_order_id],
            "history": [*project.get("history", []), project_event],
            "updated_at": timestamp,
        }

        async def mutation(session):
            options = {"session": session}
            await self.db.work_orders.insert_one(deepcopy(work_order), **options)
            result = await self.db.b2b_projects.update_one(
                {
                    "id": project_id,
                    "version": expected_version,
                    "status": project["status"],
                },
                {"$set": project_changes},
                **options,
            )
            if not result.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Project berubah selama pembuatan Work Order.",
                )
            return project_work_order(work_order)

        if self.transaction_guard is None:
            raise B2BDomainError(
                503,
                "transaction_unavailable",
                "Pembuatan Work Order tidak tersedia tanpa transaction guard.",
            )
        return await self.transaction_guard.run(
            mutation,
            operation_name="b2b.create_work_order",
            retry_safe=True,
            correlation_id=operation_id,
        )

    async def _material_shortage_lines(self, requirements: list[dict]) -> list[dict]:
        """Compare each requirement with the balance it would draw against."""
        lines = []
        for entry in requirements:
            balance = await self.db.inventory_balances.find_one(
                {"subject_type": "material", "subject_id": entry["material_id"]},
                {"_id": 0},
            )
            available = (
                to_decimal(balance.get("on_hand", 0))
                - to_decimal(balance.get("reserved", 0))
                if balance
                else Decimal(0)
            )
            required = to_decimal(entry["quantity_required"])
            if required > available:
                lines.append(
                    {
                        "material_id": entry["material_id"],
                        "sku": entry.get("sku", ""),
                        "name": entry.get("name", ""),
                        "base_unit": entry.get("base_unit"),
                        "quantity_required": decimal_string(required),
                        "available": decimal_string(available),
                        "deficit": decimal_string(required - available),
                    }
                )
        return lines

    async def _record_material_shortage(
        self,
        work_order: dict,
        lines: list[dict],
        *,
        operation_id: str,
        actor: dict,
    ) -> dict:
        """Keep one open shortage per run, refreshed on every failed attempt.

        The allocation transaction has already aborted, so this write happens
        outside it by design: the shortage queue records that nothing happened,
        which is exactly why it must survive the rollback.
        """
        timestamp = now_iso()
        existing = await self.db.work_order_shortages.find_one(
            {"work_order_id": work_order["id"], "status": "open"}, {"_id": 0}
        )
        if existing:
            await self.db.work_order_shortages.update_one(
                {"id": existing["id"], "status": "open"},
                {
                    "$set": {
                        "lines": lines,
                        "last_operation_id": operation_id,
                        "updated_at": timestamp,
                        "updated_by": actor.get("id"),
                    }
                },
            )
            return {**existing, "lines": lines}
        shortage = {
            "id": str(uuid.uuid4()),
            "work_order_id": work_order["id"],
            "project_id": work_order["project_id"],
            "status": "open",
            "lines": lines,
            "last_operation_id": operation_id,
            "created_at": timestamp,
            "created_by": actor.get("id"),
            "updated_at": timestamp,
            "updated_by": actor.get("id"),
        }
        await self.db.work_order_shortages.insert_one(deepcopy(shortage))
        return shortage

    async def _resolve_material_shortage(self, work_order_id: str, actor: dict) -> None:
        timestamp = now_iso()
        await self.db.work_order_shortages.update_one(
            {"work_order_id": work_order_id, "status": "open"},
            {
                "$set": {
                    "status": "resolved",
                    "resolved_at": timestamp,
                    "resolved_by": actor.get("id"),
                    "updated_at": timestamp,
                }
            },
        )

    async def list_material_shortages(self, *, status: str | None = None) -> list[dict]:
        query = {"status": status} if status else {}
        return await self.db.work_order_shortages.find(query, {"_id": 0}).sort(
            "updated_at", -1
        ).limit(500).to_list(500)

    async def allocate_work_order(
        self,
        work_order_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
        inventory_service,
    ) -> dict:
        """Reserve every material on the run's bill, or reserve none of them."""
        work_order = await self._get_work_order(work_order_id)

        for event in work_order.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("event") != "materials_allocated":
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi berbeda.",
                    )
                return project_work_order(work_order)

        if work_order["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Work Order telah berubah. Muat versi terbaru sebelum alokasi.",
                details={
                    "current_version": work_order["version"],
                    "current_status": work_order["status"],
                },
            )
        if work_order["status"] != "planned":
            raise B2BDomainError(
                409,
                "work_order_not_allocatable",
                "Alokasi material hanya dapat dilakukan pada Work Order terencana.",
                details={"current_status": work_order["status"]},
            )
        if work_order.get("reservation_ids"):
            raise B2BDomainError(
                409,
                "work_order_already_allocated",
                "Work Order sudah memiliki alokasi material.",
            )
        if not reason.strip():
            raise B2BDomainError(
                422, "reason_required", "Alasan alokasi wajib diisi."
            )

        requirements = work_order.get("material_requirements") or []
        if not requirements:
            raise B2BDomainError(
                422,
                "work_order_has_no_requirements",
                "Work Order tidak memiliki kebutuhan material untuk dialokasikan.",
            )

        operations = [
            {
                "payload": {
                    # Derived per material so each movement stays individually
                    # idempotent while the set replays as one allocation.
                    "operation_id": f"{operation_id}:reserve:{entry['material_id']}",
                    "subject_type": "material",
                    "subject_id": entry["material_id"],
                    "movement_type": "reserve",
                    "quantity": entry["quantity_required"],
                    "reference_type": "work_order",
                    "reference_id": work_order_id,
                    "reason": reason.strip(),
                },
                "reservation_create": {"expires_at": None},
            }
            for entry in requirements
        ]

        timestamp = now_iso()

        async def update_work_order(session, results):
            event = {
                "event": "materials_allocated",
                "from_status": "planned",
                "to_status": "planned",
                "actor_user_id": actor.get("id"),
                "reason": reason.strip(),
                "operation_id": operation_id,
                "timestamp": timestamp,
            }
            changes = {
                "version": expected_version + 1,
                "reservation_ids": [
                    result["reservation"]["id"] for result in results
                ],
                "history": [*work_order.get("history", []), event],
                "updated_at": timestamp,
            }
            updated = await self.db.work_orders.update_one(
                {
                    "id": work_order_id,
                    "version": expected_version,
                    "status": "planned",
                },
                {"$set": changes},
                session=session,
            )
            if not updated.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Work Order berubah selama alokasi material.",
                )

        try:
            await inventory_service.apply_bulk_operations(
                actor=actor,
                operations=operations,
                extra_mutation=update_work_order,
            )
        except InventoryError as exc:
            if exc.code == "inventory_conflict":
                lines = await self._material_shortage_lines(requirements)
                if lines:
                    shortage = None
                    try:
                        shortage = await self._record_material_shortage(
                            work_order,
                            lines,
                            operation_id=operation_id,
                            actor=actor,
                        )
                    except Exception:
                        # The queue is best-effort; the conflict is the answer.
                        logger.exception(
                            "Shortage occurred but could not be recorded "
                            "(work_order_id=%s)",
                            work_order_id,
                        )
                    raise B2BDomainError(
                        409,
                        "work_order_material_shortage",
                        "Stok material tidak mencukupi untuk alokasi Work Order.",
                        details={
                            **(
                                {"shortage_id": shortage["id"]} if shortage else {}
                            ),
                            "lines": lines,
                        },
                    ) from exc
            raise B2BDomainError(exc.status_code, exc.code, exc.message) from exc

        try:
            await self._resolve_material_shortage(work_order_id, actor)
        except Exception:
            # The allocation itself committed; a stale queue entry must not
            # turn that success into an error.
            logger.exception(
                "Allocation succeeded but shortage resolution failed "
                "(work_order_id=%s)",
                work_order_id,
            )
        return await self.get_work_order(work_order_id)

    async def consume_work_order(
        self,
        work_order_id: str,
        *,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
        inventory_service,
    ) -> dict:
        """Turn the run's reservations into actual consumption, all at once."""
        work_order = await self._get_work_order(work_order_id)

        for event in work_order.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("event") != "materials_consumed":
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi berbeda.",
                    )
                return project_work_order(work_order)

        if work_order["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Work Order telah berubah. Muat versi terbaru sebelum konsumsi.",
                details={
                    "current_version": work_order["version"],
                    "current_status": work_order["status"],
                },
            )
        if work_order["status"] != "in_progress":
            raise B2BDomainError(
                409,
                "work_order_not_consumable",
                "Konsumsi material hanya dapat dilakukan saat produksi berjalan.",
                details={"current_status": work_order["status"]},
            )
        reservation_ids = work_order.get("reservation_ids") or []
        if not reservation_ids:
            raise B2BDomainError(
                409,
                "work_order_not_allocated",
                "Work Order belum memiliki alokasi material.",
            )
        if not reason.strip():
            raise B2BDomainError(
                422, "reason_required", "Alasan konsumsi wajib diisi."
            )

        operations = []
        for reservation_id in reservation_ids:
            reservation = await self.db.inventory_reservations.find_one(
                {"id": reservation_id}, {"_id": 0}
            )
            if not reservation:
                raise B2BDomainError(
                    409,
                    "reservation_missing",
                    "Reservation Work Order tidak ditemukan dan memerlukan rekonsiliasi.",
                    details={"reservation_id": reservation_id},
                )
            operations.append(
                {
                    "payload": {
                        "operation_id": f"{operation_id}:consume:{reservation_id}",
                        "subject_type": reservation["subject_type"],
                        "subject_id": reservation["subject_id"],
                        "movement_type": "consume",
                        "quantity": decimal_string(reservation["quantity"]),
                        "reference_type": "work_order",
                        "reference_id": work_order_id,
                        "reason": reason.strip(),
                    },
                    "reservation_transition": {
                        "reservation_id": reservation_id,
                        "action": "consume",
                        "status": "consumed",
                    },
                }
            )

        timestamp = now_iso()

        async def update_work_order(session, _results):
            event = {
                "event": "materials_consumed",
                "from_status": "in_progress",
                "to_status": "in_progress",
                "actor_user_id": actor.get("id"),
                "reason": reason.strip(),
                "operation_id": operation_id,
                "timestamp": timestamp,
            }
            changes = {
                "version": expected_version + 1,
                "materials_consumed": True,
                "history": [*work_order.get("history", []), event],
                "updated_at": timestamp,
            }
            updated = await self.db.work_orders.update_one(
                {
                    "id": work_order_id,
                    "version": expected_version,
                    "status": "in_progress",
                },
                {"$set": changes},
                session=session,
            )
            if not updated.matched_count:
                raise B2BDomainError(
                    409,
                    "version_conflict",
                    "Work Order berubah selama konsumsi material.",
                )

        try:
            await inventory_service.apply_bulk_operations(
                actor=actor,
                operations=operations,
                extra_mutation=update_work_order,
            )
        except InventoryError as exc:
            # Translated so the B2B surface answers with its own error
            # contract instead of leaking a 500.
            raise B2BDomainError(exc.status_code, exc.code, exc.message) from exc
        return await self.get_work_order(work_order_id)

    async def transition_work_order(
        self,
        work_order_id: str,
        *,
        target_status: str,
        expected_version: int,
        operation_id: str,
        reason: str,
        actor: dict,
        inventory_service=None,
    ) -> dict:
        work_order = await self._get_work_order(work_order_id)
        for event in work_order.get("history", []):
            if event.get("operation_id") == operation_id:
                if event.get("to_status") != target_status:
                    raise B2BDomainError(
                        409,
                        "operation_id_conflict",
                        "Operation ID sudah digunakan untuk aksi berbeda.",
                    )
                return project_work_order(work_order)

        if work_order["version"] != expected_version:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Work Order telah berubah. Muat versi terbaru sebelum mencoba lagi.",
                details={
                    "current_version": work_order["version"],
                    "current_status": work_order["status"],
                    "permitted_next_actions": project_work_order(work_order)[
                        "permitted_next_actions"
                    ],
                },
            )

        validate_work_order_transition(
            work_order["status"], target_status, reason=reason
        )

        # A run that reserved material cannot be called done while that material
        # is still only reserved: the reservation would outlive the run and hold
        # stock nobody can use.
        if (
            target_status == "completed"
            and work_order.get("reservation_ids")
            and not work_order.get("materials_consumed")
        ):
            raise B2BDomainError(
                409,
                "work_order_materials_outstanding",
                "Work Order tidak dapat diselesaikan sebelum material dikonsumsi.",
                details={"reservation_ids": work_order["reservation_ids"]},
            )

        timestamp = now_iso()
        event = {
            "from_status": work_order["status"],
            "to_status": target_status,
            "actor_user_id": actor.get("id"),
            "reason": reason.strip(),
            "operation_id": operation_id,
            "timestamp": timestamp,
        }
        changes = {
            "status": target_status,
            "version": expected_version + 1,
            "history": [*work_order.get("history", []), event],
            "updated_at": timestamp,
        }
        if (
            target_status == "cancelled"
            and work_order.get("reservation_ids")
            and not work_order.get("materials_consumed")
        ):
            if inventory_service is None:
                raise B2BDomainError(
                    503,
                    "inventory_unavailable",
                    "Pembatalan dengan reservation memerlukan layanan inventory.",
                )
            operations = []
            for reservation_id in work_order["reservation_ids"]:
                reservation = await self.db.inventory_reservations.find_one(
                    {"id": reservation_id},
                    {"_id": 0},
                )
                if not reservation:
                    raise B2BDomainError(
                        409,
                        "reservation_missing",
                        "Reservation Work Order tidak ditemukan.",
                        details={"reservation_id": reservation_id},
                    )
                if reservation.get("status") != "active":
                    continue
                operations.append(
                    {
                        "payload": {
                            "operation_id": (
                                f"{operation_id}:release:{reservation_id}"
                            ),
                            "subject_type": reservation["subject_type"],
                            "subject_id": reservation["subject_id"],
                            "movement_type": "release",
                            "quantity": decimal_string(reservation["quantity"]),
                            "reference_type": "work_order",
                            "reference_id": work_order_id,
                            "reason": reason.strip(),
                        },
                        "reservation_transition": {
                            "reservation_id": reservation_id,
                            "action": "release",
                            "status": "released",
                        },
                    }
                )

            async def update_cancelled_work_order(session, _results):
                updated = await self.db.work_orders.update_one(
                    {
                        "id": work_order_id,
                        "version": expected_version,
                        "status": work_order["status"],
                    },
                    {"$set": changes},
                    session=session,
                )
                if not updated.matched_count:
                    raise B2BDomainError(
                        409,
                        "version_conflict",
                        "Work Order berubah selama pembatalan.",
                    )

            try:
                await inventory_service.apply_bulk_operations(
                    actor=actor,
                    operations=operations,
                    extra_mutation=update_cancelled_work_order,
                )
            except InventoryError as exc:
                raise B2BDomainError(
                    exc.status_code,
                    exc.code,
                    exc.message,
                ) from exc
            return await self.get_work_order(work_order_id)

        result = await self.db.work_orders.update_one(
            {
                "id": work_order_id,
                "version": expected_version,
                "status": work_order["status"],
            },
            {"$set": changes},
        )
        if not result.matched_count:
            raise B2BDomainError(
                409,
                "version_conflict",
                "Work Order berubah selama transisi.",
            )
        return project_work_order({**work_order, **changes})

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
        if not quote.get("acceptance"):
            raise B2BDomainError(
                409,
                "project_acceptance_evidence_missing",
                "Project memerlukan evidence penerimaan Quote yang lengkap.",
            )
        if not reason.strip():
            raise B2BDomainError(422, "reason_required", "Alasan pembuatan Project wajib diisi.")

        accepted_version = await self._get_quote_version(quote["accepted_version_id"])
        require_exact_quote_line_identities(accepted_version.get("items") or [])
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
        if target_status in {"completed", "cancelled"}:
            work_orders = await self.db.work_orders.find(
                {"project_id": project_id},
                {"_id": 0, "id": 1, "status": 1},
            ).to_list(1000)
            required_status = (
                "completed" if target_status == "completed" else "cancelled"
            )
            blockers = [
                {
                    "id": work_order.get("id"),
                    "status": work_order.get("status"),
                }
                for work_order in work_orders
                if work_order.get("status") != required_status
            ]
            if blockers:
                raise B2BDomainError(
                    409,
                    "project_child_state_blocked",
                    "Status Work Order belum kompatibel dengan status Project tujuan.",
                    details={
                        "required_work_order_status": required_status,
                        "blockers": blockers,
                    },
                )
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
