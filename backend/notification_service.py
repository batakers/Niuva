import uuid
from datetime import datetime, timezone

from notification_domain import (
    deduplication_key,
    is_allowlisted_reference,
    project_notification,
)

MAX_DELIVERY_ATTEMPTS = 5


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _write_options(session=None) -> dict:
    return {"session": session} if session is not None else {}


class NotificationError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message

    def payload(self) -> dict:
        return {"code": self.code, "message": self.message}


class NotificationService:
    """The system feed behind the bell.

    Outbound communication a human composes is a different surface with a
    different audience; it does not pass through here.
    """

    def __init__(self, *, db):
        self.db = db

    async def publish(
        self,
        *,
        user_id: str,
        event: str,
        title: str,
        body: str,
        reference_type: str | None = None,
        reference_id: str | None = None,
        session=None,
    ) -> dict:
        """Record one notifiable condition for one reader, idempotently."""
        if reference_type is not None and not is_allowlisted_reference(reference_type):
            raise NotificationError(
                422,
                "notification_reference_not_allowed",
                "Referensi notifikasi tidak ada pada daftar yang diizinkan.",
            )

        key = deduplication_key(
            user_id=user_id,
            event=event,
            reference_type=reference_type,
            reference_id=reference_id,
        )
        timestamp = now_iso()
        existing = await self.db.notifications.find_one(
            {"deduplication_key": key}, {"_id": 0}, **_write_options(session)
        )
        if existing:
            # The condition recurred. Surface it again rather than duplicating
            # it, and leave a read notification read: re-notifying on every
            # observation is how a bell becomes noise nobody reads.
            await self.db.notifications.update_one(
                {"deduplication_key": key},
                {
                    "$set": {"last_seen_at": timestamp, "updated_at": timestamp},
                    "$inc": {"occurrence_count": 1},
                },
                **_write_options(session),
            )
            return project_notification(
                {
                    **existing,
                    "last_seen_at": timestamp,
                    "updated_at": timestamp,
                    "occurrence_count": existing.get("occurrence_count", 1) + 1,
                }
            )

        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "event": event,
            "title": title,
            "body": body,
            "reference_type": reference_type,
            "reference_id": reference_id,
            "deduplication_key": key,
            "read_at": None,
            "occurrence_count": 1,
            "created_at": timestamp,
            "last_seen_at": timestamp,
            "updated_at": timestamp,
        }
        await self.db.notifications.insert_one(
            dict(notification), **_write_options(session)
        )
        return project_notification(notification)

    async def list_for_user(
        self, user_id: str, *, unread_only: bool = False, limit: int = 50
    ) -> list[dict]:
        query = {"user_id": user_id}
        if unread_only:
            query["read_at"] = None
        documents = await self.db.notifications.find(query, {"_id": 0}).sort(
            "created_at", -1
        ).limit(min(limit, 200)).to_list(min(limit, 200))
        return [project_notification(document) for document in documents]

    async def unread_count(self, user_id: str) -> int:
        return await self.db.notifications.count_documents(
            {"user_id": user_id, "read_at": None}
        )

    async def mark_read(self, notification_id: str, *, user_id: str) -> dict:
        notification = await self.db.notifications.find_one(
            {"id": notification_id}, {"_id": 0}
        )
        # Scoped to the reader: a notification id must not reveal another
        # person's feed, so an unowned one reads as absent.
        if not notification or notification.get("user_id") != user_id:
            raise NotificationError(
                404, "notification_not_found", "Notifikasi tidak ditemukan."
            )
        if notification.get("read_at"):
            return project_notification(notification)

        timestamp = now_iso()
        await self.db.notifications.update_one(
            {"id": notification_id, "user_id": user_id, "read_at": None},
            {"$set": {"read_at": timestamp, "updated_at": timestamp}},
        )
        return project_notification(
            {**notification, "read_at": timestamp, "updated_at": timestamp}
        )

    async def mark_all_read(self, user_id: str) -> dict:
        timestamp = now_iso()
        result = await self.db.notifications.update_many(
            {"user_id": user_id, "read_at": None},
            {"$set": {"read_at": timestamp, "updated_at": timestamp}},
        )
        return {"marked": getattr(result, "modified_count", 0), "read_at": timestamp}

    # ------------------------------ Outbox ------------------------------
    #
    # Delivery is separated from recording. A notification is captured the
    # moment the condition happens; sending it is a later, retryable act, so a
    # mail outage costs a delayed email rather than a lost notification.

    async def enqueue_delivery(
        self,
        *,
        notification_id: str,
        channel: str,
        recipient: str,
        payload: dict,
        session=None,
    ) -> dict:
        entry = {
            "id": str(uuid.uuid4()),
            "notification_id": notification_id,
            "channel": channel,
            "recipient": recipient,
            "payload": dict(payload),
            "status": "pending",
            "attempts": 0,
            "last_error": None,
            "created_at": now_iso(),
            "updated_at": now_iso(),
        }
        await self.db.notification_outbox.insert_one(
            dict(entry), **_write_options(session)
        )
        return entry

    async def claim_pending(self, *, limit: int = 50) -> list[dict]:
        return await self.db.notification_outbox.find(
            {"status": "pending"}, {"_id": 0}
        ).sort("created_at", 1).limit(limit).to_list(limit)

    async def record_delivery_result(
        self, entry_id: str, *, delivered: bool, error: str | None = None
    ) -> dict:
        entry = await self.db.notification_outbox.find_one(
            {"id": entry_id}, {"_id": 0}
        )
        if not entry:
            raise NotificationError(
                404, "outbox_entry_not_found", "Entri outbox tidak ditemukan."
            )

        attempts = entry.get("attempts", 0) + 1
        timestamp = now_iso()
        if delivered:
            status = "delivered"
        elif attempts >= MAX_DELIVERY_ATTEMPTS:
            # Exhausted rather than failed: it stops being retried, and stays
            # visible so someone can see what never went out.
            status = "exhausted"
        else:
            status = "pending"

        changes = {
            "status": status,
            "attempts": attempts,
            "last_error": None if delivered else error,
            "updated_at": timestamp,
        }
        await self.db.notification_outbox.update_one(
            {"id": entry_id}, {"$set": changes}
        )
        return {**entry, **changes}
