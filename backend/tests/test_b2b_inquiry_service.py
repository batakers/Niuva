import asyncio
import types

import pytest
from b2b_domain import B2BDomainError
from b2b_service import B2BService


class FakeCollection:
    def __init__(self):
        self.items = []

    async def insert_one(self, document, **_options):
        self.items.append(dict(document))
        return types.SimpleNamespace(inserted_id=document["id"])

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                value = dict(item)
                value.pop("_id", None)
                return value
        return None

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                item.update(update.get("$set", {}))
                item.setdefault("history", []).extend(update.get("$push", {}).values())
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)


class FakeDatabase:
    def __init__(self):
        self.inquiries = FakeCollection()


def build_service():
    db = FakeDatabase()
    return B2BService(db=db, transaction_guard=None), db


def test_structured_inquiry_and_guarded_triage():
    async def scenario():
        service, _db = build_service()
        inquiry = await service.create_inquiry(
            {
                "company": "PT Contoh Industri",
                "pic_name": "Ayu",
                "pic_email": "ayu@example.test",
                "pic_phone": "+628123456789",
                "need": "Prototype enclosure",
                "timeline": "Q4 2026",
                "brief": "Membutuhkan validasi desain dan prototype fungsional.",
            }
        )
        assert inquiry["status"] == "new"
        assert inquiry["version"] == 1
        assert inquiry["permitted_next_actions"] == ["review", "reject"]
        assert inquiry["history"][0]["to_status"] == "new"

        actor = {"id": "sales-1", "email": "sales@niuva.test"}
        reviewed = await service.transition_inquiry(
            inquiry["id"],
            target_status="reviewed",
            expected_version=1,
            operation_id="op-review-1",
            reason="Brief awal lengkap",
            actor=actor,
        )
        assert reviewed["version"] == 2
        assert reviewed["history"][-1]["actor_user_id"] == "sales-1"

        replay = await service.transition_inquiry(
            inquiry["id"],
            target_status="reviewed",
            expected_version=1,
            operation_id="op-review-1",
            reason="Brief awal lengkap",
            actor=actor,
        )
        assert replay["version"] == 2
        assert len(replay["history"]) == 2

        with pytest.raises(B2BDomainError) as stale:
            await service.transition_inquiry(
                inquiry["id"],
                target_status="contacted",
                expected_version=1,
                operation_id="op-contact-1",
                reason="PIC dihubungi",
                actor=actor,
            )
        assert stale.value.code == "version_conflict"
        assert stale.value.details["current_version"] == 2

    asyncio.run(scenario())
