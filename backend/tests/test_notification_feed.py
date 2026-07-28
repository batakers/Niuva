"""The system notification feed: allowlisted links, dedup, read state, outbox.

The security-critical property is that a reader's destination is derived from
an allowlisted reference, never stored by whoever wrote the notification.
"""

import asyncio
import types
from datetime import datetime, timedelta, timezone

import pytest

from notification_domain import (
    NOTIFICATION_REFERENCE_ROUTES,
    deduplication_key,
    deep_link_for,
    is_allowlisted_reference,
    project_notification,
)
from notification_service import (
    MAX_DELIVERY_ATTEMPTS,
    NotificationError,
    NotificationService,
)
from notification_worker import NotificationDeliveryWorker


class FakeCollection:
    def __init__(self):
        self.items = []

    @staticmethod
    def _matches(item, query):
        for key, value in query.items():
            if key == "$or":
                if not any(FakeCollection._matches(item, branch) for branch in value):
                    return False
                continue
            actual = item.get(key)
            if isinstance(value, dict) and "$lte" in value:
                if actual is None or actual > value["$lte"]:
                    return False
            elif actual != value:
                return False
        return True

    async def insert_one(self, document, **_options):
        self.items.append(dict(document))
        return types.SimpleNamespace(inserted_id=document.get("id"))

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self._matches(item, query):
                return dict(item)
        return None

    def find(self, query, projection=None, **_options):
        return FakeCursor([item for item in self.items if self._matches(item, query)])

    async def count_documents(self, query, **_options):
        return sum(1 for item in self.items if self._matches(item, query))

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                for key, amount in (update.get("$inc") or {}).items():
                    item[key] = item.get(key, 0) + amount
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def find_one_and_update(
        self,
        query,
        update,
        *,
        sort=None,
        projection=None,
        return_document=None,
    ):
        candidates = [item for item in self.items if self._matches(item, query)]
        for key, direction in reversed(sort or []):
            candidates.sort(
                key=lambda item: item.get(key) or datetime.min.replace(tzinfo=timezone.utc),
                reverse=direction < 0,
            )
        if not candidates:
            return None
        target = candidates[0]
        target.update(update.get("$set", {}))
        return {
            key: value
            for key, value in target.items()
            if not projection or projection.get(key, 1)
        }

    async def update_many(self, query, update, **_options):
        modified = 0
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                modified += 1
        return types.SimpleNamespace(modified_count=modified)


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key) or "", reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class FakeDatabase:
    def __init__(self):
        self.notifications = FakeCollection()
        self.notification_outbox = FakeCollection()


def build_service():
    db = FakeDatabase()
    return NotificationService(db=db), db


async def publish(service, **overrides):
    payload = {
        "user_id": "user-1",
        "event": "work_order.material_shortage",
        "title": "Material kurang",
        "body": "Work Order tertahan menunggu material.",
        "reference_type": "work_order",
        "reference_id": "wo-1",
    }
    payload.update(overrides)
    return await service.publish(**payload)


# --------------------------- Deep links ---------------------------


def test_a_link_is_derived_from_an_allowlisted_reference():
    assert deep_link_for("work_order", "wo-1") == "/admin/b2b/work-orders/wo-1"
    assert deep_link_for("inquiry", "inq-1") == "/admin/inquiries/inq-1"
    assert (
        deep_link_for("material", "mat-1")
        == "/admin/stock-movements?subject_type=material&subject_id=mat-1"
    )


def test_a_reference_outside_the_allowlist_yields_no_link():
    """An unlinked notification is a smaller failure than one pointing anywhere."""
    assert is_allowlisted_reference("evil_type") is False
    assert deep_link_for("evil_type", "anything") is None
    assert deep_link_for(None, "anything") is None


@pytest.mark.parametrize(
    "hostile_id",
    [
        "../../etc/passwd",
        "wo-1/../../admin/users",
        "wo-1?redirect=https://evil.test",
        "wo-1#fragment",
        "https://evil.test",
        "wo-1&extra=1",
        "",
        "   ",
    ],
)
def test_a_reference_id_cannot_escape_its_template(hostile_id):
    assert deep_link_for("work_order", hostile_id) is None


def test_a_stored_link_is_never_trusted():
    """Whoever writes a notification must not choose where a reader lands."""
    projected = project_notification(
        {
            "id": "n-1",
            "reference_type": "work_order",
            "reference_id": "wo-1",
            "deep_link": "https://evil.test/steal",
            "link": "https://evil.test/steal",
            "url": "https://evil.test/steal",
        }
    )

    assert projected["deep_link"] == "/admin/b2b/work-orders/wo-1"
    assert "link" not in projected
    assert "url" not in projected


def test_every_allowlisted_route_is_an_in_app_path():
    for template in NOTIFICATION_REFERENCE_ROUTES.values():
        assert template.startswith("/admin/")
        assert "://" not in template


def test_publishing_an_unallowlisted_reference_is_refused():
    async def scenario():
        service, db = build_service()

        with pytest.raises(NotificationError) as refused:
            await publish(service, reference_type="evil_type")
        assert refused.value.code == "notification_reference_not_allowed"
        assert db.notifications.items == []

    asyncio.run(scenario())


# --------------------------- Deduplication ---------------------------


def test_the_same_condition_for_one_reader_is_one_notification():
    async def scenario():
        service, db = build_service()
        first = await publish(service)
        second = await publish(service)

        assert len(db.notifications.items) == 1
        assert second["id"] == first["id"]
        # The recurrence is recorded rather than duplicated.
        assert second["occurrence_count"] == 2
        assert second["last_seen_at"] >= first["last_seen_at"]

    asyncio.run(scenario())


def test_the_same_condition_still_reaches_every_reader_who_must_act():
    async def scenario():
        service, db = build_service()
        await publish(service, user_id="user-1")
        await publish(service, user_id="user-2")

        assert len(db.notifications.items) == 2

    asyncio.run(scenario())


def test_different_conditions_on_one_record_stay_separate():
    async def scenario():
        service, db = build_service()
        await publish(service, event="work_order.material_shortage")
        await publish(service, event="work_order.completed")

        assert len(db.notifications.items) == 2

    asyncio.run(scenario())


def test_the_dedup_key_is_stable_and_reader_scoped():
    base = {
        "user_id": "user-1",
        "event": "e",
        "reference_type": "work_order",
        "reference_id": "wo-1",
    }
    assert deduplication_key(**base) == deduplication_key(**base)
    assert deduplication_key(**base) != deduplication_key(**{**base, "user_id": "u-2"})


def test_a_recurrence_does_not_resurface_a_notification_already_read():
    async def scenario():
        service, _db = build_service()
        first = await publish(service)
        await service.mark_read(first["id"], user_id="user-1")

        again = await publish(service)

        # Re-notifying on every observation is how a bell becomes noise.
        assert again["is_read"] is True
        assert await service.unread_count("user-1") == 0

    asyncio.run(scenario())


# --------------------------- Read state ---------------------------


def test_unread_count_and_mark_one():
    async def scenario():
        service, _db = build_service()
        first = await publish(service, reference_id="wo-1")
        await publish(service, reference_id="wo-2")

        assert await service.unread_count("user-1") == 2

        marked = await service.mark_read(first["id"], user_id="user-1")
        assert marked["is_read"] is True
        assert await service.unread_count("user-1") == 1

        unread = await service.list_for_user("user-1", unread_only=True)
        assert [item["reference_id"] for item in unread] == ["wo-2"]

    asyncio.run(scenario())


def test_mark_all_read_clears_only_this_readers_feed():
    async def scenario():
        service, _db = build_service()
        await publish(service, user_id="user-1", reference_id="wo-1")
        await publish(service, user_id="user-1", reference_id="wo-2")
        await publish(service, user_id="user-2", reference_id="wo-1")

        result = await service.mark_all_read("user-1")

        assert result["marked"] == 2
        assert await service.unread_count("user-1") == 0
        assert await service.unread_count("user-2") == 1

    asyncio.run(scenario())


def test_a_notification_id_does_not_reveal_another_readers_feed():
    async def scenario():
        service, _db = build_service()
        theirs = await publish(service, user_id="user-2")

        with pytest.raises(NotificationError) as refused:
            await service.mark_read(theirs["id"], user_id="user-1")
        # Absent, not forbidden: existence itself is not disclosed.
        assert refused.value.status_code == 404

    asyncio.run(scenario())


# --------------------------- Outbox ---------------------------


def test_delivery_is_queued_separately_from_recording():
    async def scenario():
        service, db = build_service()
        notification = await publish(service)
        await service.enqueue_delivery(
            notification_id=notification["id"],
            channel="email",
            recipient="ops@niuva.test",
            payload={"subject": "Material kurang"},
        )

        pending = await service.claim_pending(worker_id="worker-a")
        assert len(pending) == 1
        assert pending[0]["status"] == "processing"
        assert await service.claim_pending(worker_id="worker-b") == []
        # The notification exists whether or not the email ever goes out.
        assert len(db.notifications.items) == 1

    asyncio.run(scenario())


def test_a_failed_delivery_is_retried_then_marked_exhausted():
    async def scenario():
        service, _db = build_service()
        notification = await publish(service)
        entry = await service.enqueue_delivery(
            notification_id=notification["id"],
            channel="email",
            recipient="ops@niuva.test",
            payload={},
        )

        moment = datetime.now(timezone.utc)
        for attempt in range(1, MAX_DELIVERY_ATTEMPTS):
            claimed = await service.claim_pending(
                worker_id="worker-a",
                at=moment,
            )
            result = await service.record_delivery_result(
                entry["id"],
                lease_token=claimed[0]["lease_token"],
                delivered=False,
                error="smtp unavailable",
                at=moment,
            )
            assert result["status"] == "pending", attempt
            assert result["attempts"] == attempt
            moment += timedelta(minutes=10)

        claimed = await service.claim_pending(worker_id="worker-a", at=moment)
        final = await service.record_delivery_result(
            entry["id"],
            lease_token=claimed[0]["lease_token"],
            delivered=False,
            error="smtp unavailable",
            at=moment,
        )
        # Exhausted, not deleted: what never went out stays visible.
        assert final["status"] == "exhausted"
        assert final["last_error"] == "smtp unavailable"
        assert await service.claim_pending(worker_id="worker-a", at=moment) == []

    asyncio.run(scenario())


def test_a_successful_delivery_clears_the_error():
    async def scenario():
        service, _db = build_service()
        notification = await publish(service)
        entry = await service.enqueue_delivery(
            notification_id=notification["id"],
            channel="email",
            recipient="ops@niuva.test",
            payload={},
        )
        moment = datetime.now(timezone.utc)
        claimed = await service.claim_pending(worker_id="worker-a", at=moment)
        await service.record_delivery_result(
            entry["id"],
            lease_token=claimed[0]["lease_token"],
            delivered=False,
            error="temporary",
            at=moment,
        )

        moment += timedelta(minutes=10)
        claimed = await service.claim_pending(worker_id="worker-a", at=moment)
        delivered = await service.record_delivery_result(
            entry["id"],
            lease_token=claimed[0]["lease_token"],
            delivered=True,
            at=moment,
        )

        assert delivered["status"] == "delivered"
        assert delivered["last_error"] is None
        assert delivered["attempts"] == 2

    asyncio.run(scenario())


def test_worker_claim_and_delivery_are_not_duplicated():
    async def scenario():
        service, _db = build_service()
        notification = await publish(service)
        await service.enqueue_delivery(
            notification_id=notification["id"],
            channel="email",
            recipient="ops@niuva.test",
            payload={"subject": "Material kurang"},
        )
        calls = []

        async def deliver(entry, *, idempotency_key):
            calls.append((entry["id"], idempotency_key))
            return True

        first = NotificationDeliveryWorker(
            service=service,
            worker_id="worker-a",
            deliverers={"email": deliver},
        )
        second = NotificationDeliveryWorker(
            service=service,
            worker_id="worker-b",
            deliverers={"email": deliver},
        )
        assert (await first.run_once())["delivered"] == 1
        assert (await second.run_once())["claimed"] == 0
        assert len(calls) == 1

    asyncio.run(scenario())
