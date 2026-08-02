import uuid
from datetime import datetime, timedelta, timezone

from notification_domain import (
    NOTIFICATION_REFERENCE_ROUTES,
    NOTIFICATION_RETENTION,
    NOTIFICATION_SCHEMA_VERSION,
    REFERENCE_ID_PATTERN,
    deduplication_key,
    deep_link_for,
    is_allowlisted_reference,
    is_notification_readable,
    project_notification,
)
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

MAX_DELIVERY_ATTEMPTS = 5


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


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

    @staticmethod
    def _required_text(value, *, field: str, maximum: int) -> str:
        if not isinstance(value, str) or not value.strip() or len(value) > maximum:
            raise NotificationError(
                422,
                "invalid_notification_field",
                f"Field notifikasi tidak valid: {field}.",
            )
        return value.strip()

    @classmethod
    def _required_identity(cls, value, *, field: str, maximum: int) -> str:
        identity = cls._required_text(value, field=field, maximum=maximum)
        if "|" in identity or any(
            ord(character) < 32 or ord(character) == 127 for character in identity
        ):
            raise NotificationError(
                422,
                "invalid_notification_field",
                f"Field notifikasi tidak valid: {field}.",
            )
        return identity

    @staticmethod
    def _compatible_recurrence(document: dict, *, expected: dict, at: datetime) -> bool:
        projected = project_notification(document)
        return (
            projected is not None
            and is_notification_readable(document, user_id=expected["user_id"], at=at)
            and all(
                document.get(field) == expected[field]
                for field in ("user_id", "event", "reference_type", "reference_id")
            )
        )

    @staticmethod
    def _storage_timestamp(document: dict, timestamp: datetime):
        return (
            timestamp.isoformat()
            if isinstance(document.get("updated_at"), str)
            else timestamp
        )

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
        user_id = self._required_identity(user_id, field="user_id", maximum=200)
        event = self._required_identity(event, field="event", maximum=200)
        title = self._required_text(title, field="title", maximum=300)
        body = self._required_text(body, field="body", maximum=5000)
        if reference_type is None and reference_id is not None:
            raise NotificationError(
                422,
                "notification_reference_not_allowed",
                "Referensi notifikasi tidak ada pada daftar yang diizinkan.",
            )
        if reference_type is not None:
            reference_type = self._required_text(
                reference_type, field="reference_type", maximum=80
            )
            if not is_allowlisted_reference(reference_type):
                raise NotificationError(
                    422,
                    "notification_reference_not_allowed",
                    "Referensi notifikasi tidak ada pada daftar yang diizinkan.",
                )
            if "{id}" in NOTIFICATION_REFERENCE_ROUTES[reference_type]:
                reference_id = self._required_identity(
                    reference_id, field="reference_id", maximum=200
                )
                if deep_link_for(reference_type, reference_id) is None:
                    raise NotificationError(
                        422,
                        "notification_reference_not_allowed",
                        "Referensi notifikasi tidak ada pada daftar yang diizinkan.",
                    )
            elif reference_id is not None:
                reference_id = self._required_identity(
                    reference_id, field="reference_id", maximum=200
                )
                if REFERENCE_ID_PATTERN.fullmatch(reference_id) is None:
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
        timestamp = now_utc()
        notification = {
            "schema_version": NOTIFICATION_SCHEMA_VERSION,
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
            "expires_at": timestamp + NOTIFICATION_RETENTION,
        }
        identity = {
            "user_id": user_id,
            "event": event,
            "reference_type": reference_type,
            "reference_id": reference_id,
        }
        for _attempt in range(3):
            existing = await self.db.notifications.find_one(
                {"deduplication_key": key}, {"_id": 0}, **_write_options(session)
            )
            if existing:
                if not self._compatible_recurrence(
                    existing, expected=identity, at=timestamp
                ):
                    raise NotificationError(
                        409,
                        "notification_schema_conflict",
                        "Identitas notifikasi berbenturan dengan record yang tidak kompatibel.",
                    )
                stored_timestamp = self._storage_timestamp(existing, timestamp)
                updated = await self.db.notifications.find_one_and_update(
                    {"id": existing["id"], "deduplication_key": key},
                    {
                        "$max": {
                            "last_seen_at": stored_timestamp,
                            "updated_at": stored_timestamp,
                        },
                        "$inc": {"occurrence_count": 1},
                    },
                    projection={"_id": 0},
                    return_document=ReturnDocument.AFTER,
                    **_write_options(session),
                )
                if updated is None:
                    continue
                projected = project_notification(updated)
                if projected is None:
                    raise NotificationError(
                        409,
                        "notification_schema_conflict",
                        "Record notifikasi tidak kompatibel.",
                    )
                return projected
            try:
                insert_defaults = {
                    field: value
                    for field, value in notification.items()
                    if field not in {"occurrence_count", "last_seen_at", "updated_at"}
                }
                updated = await self.db.notifications.find_one_and_update(
                    {
                        # The built-in MongoDB `_id` index is always present,
                        # unlike the separately gated Migration 007 dedup index.
                        # Binding a canonical row to this deterministic key keeps
                        # concurrent upserts atomic without activating a migration.
                        "_id": f"notification:{key}",
                        "deduplication_key": key,
                        "schema_version": NOTIFICATION_SCHEMA_VERSION,
                        **identity,
                    },
                    {
                        "$setOnInsert": insert_defaults,
                        "$max": {
                            "last_seen_at": timestamp,
                            "updated_at": timestamp,
                        },
                        "$inc": {"occurrence_count": 1},
                    },
                    projection={"_id": 0},
                    return_document=ReturnDocument.AFTER,
                    upsert=True,
                    **_write_options(session),
                )
            except DuplicateKeyError:
                continue
            projected = project_notification(updated or {})
            if projected is None:  # Defensive: the writer must satisfy its own schema.
                raise RuntimeError("canonical_notification_projection_failed")
            return projected
        raise NotificationError(
            409,
            "notification_publish_conflict",
            "Notifikasi sedang diperbarui; silakan coba kembali.",
        )

    async def list_for_user(
        self, user_id: str, *, unread_only: bool = False, limit: int = 50
    ) -> list[dict]:
        bounded_limit = max(1, min(int(limit), 200))
        query: dict[str, object] = {"user_id": user_id}
        if unread_only:
            query["read_at"] = None
        moment = now_utc()
        projected = []
        cursor = self.db.notifications.find(query, {"_id": 0}).sort("created_at", -1)
        async for document in cursor:
            if not is_notification_readable(document, user_id=user_id, at=moment):
                continue
            value = project_notification(document)
            if value is not None:
                projected.append(value)
            if len(projected) >= bounded_limit:
                break
        return projected

    async def unread_count(self, user_id: str) -> int:
        count = 0
        moment = now_utc()
        cursor = self.db.notifications.find(
            {"user_id": user_id, "read_at": None}, {"_id": 0}
        )
        async for document in cursor:
            if is_notification_readable(document, user_id=user_id, at=moment):
                count += 1
        return count

    async def mark_read(self, notification_id: str, *, user_id: str) -> dict:
        notification = await self.db.notifications.find_one(
            {"id": notification_id, "user_id": user_id}, {"_id": 0}
        )
        timestamp = now_utc()
        # Scoped to the reader: a notification id must not reveal another
        # person's feed, so an unowned one reads as absent.
        if not notification or not is_notification_readable(
            notification, user_id=user_id, at=timestamp
        ):
            raise NotificationError(
                404, "notification_not_found", "Notifikasi tidak ditemukan."
            )
        if notification.get("read_at"):
            projected = project_notification(notification)
            if projected is None:
                raise NotificationError(
                    404, "notification_not_found", "Notifikasi tidak ditemukan."
                )
            return projected

        stored_timestamp = self._storage_timestamp(notification, timestamp)
        updated = await self.db.notifications.find_one_and_update(
            {"id": notification_id, "user_id": user_id, "read_at": None},
            {
                "$set": {"read_at": stored_timestamp},
                "$max": {"updated_at": stored_timestamp},
            },
            projection={"_id": 0},
            return_document=ReturnDocument.AFTER,
        )
        if updated is None:
            updated = await self.db.notifications.find_one(
                {"id": notification_id, "user_id": user_id}, {"_id": 0}
            )
        projected = project_notification(updated or {})
        if projected is None:
            raise NotificationError(
                404, "notification_not_found", "Notifikasi tidak ditemukan."
            )
        return projected

    async def mark_all_read(self, user_id: str) -> dict:
        timestamp = now_utc()
        datetime_ids = []
        string_ids = []
        cursor = self.db.notifications.find(
            {"user_id": user_id, "read_at": None}, {"_id": 0}
        )
        async for document in cursor:
            if is_notification_readable(document, user_id=user_id, at=timestamp):
                target = (
                    string_ids
                    if isinstance(document.get("updated_at"), str)
                    else datetime_ids
                )
                target.append(document["id"])
        if not datetime_ids and not string_ids:
            return {"marked": 0, "read_at": timestamp}
        modified = 0
        for notification_ids, stored_timestamp in (
            (datetime_ids, timestamp),
            (string_ids, timestamp.isoformat()),
        ):
            if not notification_ids:
                continue
            result = await self.db.notifications.update_many(
                {
                    "id": {"$in": notification_ids},
                    "user_id": user_id,
                    "read_at": None,
                },
                {
                    "$set": {"read_at": stored_timestamp},
                    "$max": {"updated_at": stored_timestamp},
                },
            )
            modified += getattr(result, "modified_count", 0)
        return {"marked": modified, "read_at": timestamp}

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
            "next_attempt_at": now_utc(),
            "lease_owner": None,
            "lease_token": None,
            "lease_until": None,
            "delivery_key": f"notification-delivery:{uuid.uuid4()}",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        }
        await self.db.notification_outbox.insert_one(
            dict(entry), **_write_options(session)
        )
        return entry

    async def claim_pending(
        self,
        *,
        worker_id: str,
        limit: int = 50,
        lease_seconds: int = 60,
        at: datetime | None = None,
    ) -> list[dict]:
        """Atomically lease due work so concurrent workers cannot both send it."""
        moment = at or now_utc()
        claimed = []
        for _index in range(min(limit, 200)):
            lease_token = str(uuid.uuid4())
            entry = await self.db.notification_outbox.find_one_and_update(
                {
                    "$or": [
                        {
                            "status": "pending",
                            "next_attempt_at": {"$lte": moment},
                            "$or": [
                                {"lease_until": None},
                                {"lease_until": {"$lte": moment}},
                            ],
                        },
                        {
                            "status": "processing",
                            "lease_until": {"$lte": moment},
                        },
                    ],
                },
                {
                    "$set": {
                        "status": "processing",
                        "lease_owner": worker_id,
                        "lease_token": lease_token,
                        "lease_until": moment + timedelta(seconds=lease_seconds),
                        "updated_at": moment,
                    }
                },
                sort=[("next_attempt_at", 1), ("created_at", 1)],
                projection={"_id": 0},
                return_document=ReturnDocument.AFTER,
            )
            if not entry:
                break
            claimed.append(entry)
        return claimed

    async def record_delivery_result(
        self,
        entry_id: str,
        *,
        lease_token: str,
        delivered: bool,
        error: str | None = None,
        at: datetime | None = None,
    ) -> dict:
        entry = await self.db.notification_outbox.find_one({"id": entry_id}, {"_id": 0})
        if not entry:
            raise NotificationError(
                404, "outbox_entry_not_found", "Entri outbox tidak ditemukan."
            )

        if (
            entry.get("status") != "processing"
            or entry.get("lease_token") != lease_token
        ):
            raise NotificationError(
                409,
                "outbox_lease_lost",
                "Lease outbox tidak lagi dimiliki worker ini.",
            )
        attempts = entry.get("attempts", 0) + 1
        timestamp = at or now_utc()
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
            "next_attempt_at": (
                None
                if delivered or status == "exhausted"
                else timestamp + timedelta(seconds=min(2**attempts, 300))
            ),
            "lease_owner": None,
            "lease_token": None,
            "lease_until": None,
        }
        result = await self.db.notification_outbox.update_one(
            {
                "id": entry_id,
                "status": "processing",
                "lease_token": lease_token,
            },
            {"$set": changes},
        )
        if not result.matched_count:
            raise NotificationError(
                409,
                "outbox_lease_lost",
                "Lease outbox hilang sebelum hasil delivery dicatat.",
            )
        return {**entry, **changes}
