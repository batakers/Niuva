import asyncio
import types

import pytest

from b2b_domain import B2BDomainError
from b2b_service import B2BService
from transaction_execution import TransactionUnavailableError


def _matches(item: dict, query: dict) -> bool:
    for key, condition in query.items():
        value = item.get(key)
        if isinstance(condition, dict) and "$in" in condition:
            if value not in condition["$in"]:
                return False
        elif value != condition:
            return False
    return True


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class FakeCollection:
    def __init__(self):
        self.items = []

    async def insert_one(self, document, **_options):
        self.items.append(dict(document))
        return types.SimpleNamespace(inserted_id=document["id"])

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if _matches(item, query):
                return dict(item)
        return None

    def find(self, query, projection=None, **_options):
        return FakeCursor([item for item in self.items if _matches(item, query)])

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if _matches(item, query):
                item.update(update.get("$set", {}))
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)


class FakeDatabase:
    def __init__(self):
        self.inquiries = FakeCollection()
        self.b2b_quotes = FakeCollection()
        self.b2b_quote_versions = FakeCollection()
        self.b2b_projects = FakeCollection()
        self.work_orders = FakeCollection()
        # Read when a quoted line references the catalog.
        self.products = FakeCollection()
        self.product_variants = FakeCollection()
        self.materials = FakeCollection()


class EnabledGuard:
    def __init__(self):
        self.calls = []

    async def run(self, callback, **options):
        self.calls.append(options)
        return await callback(object())


class DisabledGuard:
    async def run(self, _callback, **_options):
        raise TransactionUnavailableError()


async def qualified_inquiry(service):
    inquiry = await service.create_inquiry(
        {
            "company": "PT Contoh Industri",
            "pic_name": "Ayu",
            "pic_email": "ayu@example.com",
            "pic_phone": "+628123456789",
            "need": "Prototype enclosure",
            "timeline": "Q4 2026",
            "brief": "Membutuhkan validasi desain dan prototype fungsional.",
        }
    )
    actor = {"id": "sales-1", "email": "sales@niuva.test"}
    for target, operation in [
        ("reviewed", "op-review"),
        ("contacted", "op-contact"),
    ]:
        inquiry = await service.transition_inquiry(
            inquiry["id"],
            target_status=target,
            expected_version=inquiry["version"],
            operation_id=operation,
            reason=f"Move to {target}",
            actor=actor,
        )
    return inquiry, actor


def test_conversion_creates_exactly_one_quote_and_immutable_revision():
    async def scenario():
        db = FakeDatabase()
        guard = EnabledGuard()
        service = B2BService(db=db, transaction_guard=guard)
        inquiry, actor = await qualified_inquiry(service)

        first = await service.convert_inquiry(
            inquiry["id"],
            expected_version=inquiry["version"],
            operation_id="op-convert-1",
            reason="Scope qualified for quotation",
            actor=actor,
        )
        replay = await service.convert_inquiry(
            inquiry["id"],
            expected_version=inquiry["version"],
            operation_id="op-convert-1",
            reason="Scope qualified for quotation",
            actor=actor,
        )

        assert first["quote"]["id"] == replay["quote"]["id"]
        assert first["inquiry"]["status"] == "converted"
        assert first["inquiry"]["converted_quote_id"] == first["quote"]["id"]
        assert first["quote"]["status"] == "draft"
        assert first["quote"]["version"] == 1
        assert first["quote"]["current_revision"] == 1
        assert len(db.b2b_quotes.items) == 1
        assert len(db.b2b_quote_versions.items) == 1
        assert db.b2b_quote_versions.items[0]["scope_snapshot"]["brief"].startswith(
            "Membutuhkan"
        )
        assert guard.calls[0]["operation_name"] == "b2b.convert_inquiry"

        with pytest.raises(B2BDomainError) as duplicate:
            await service.convert_inquiry(
                inquiry["id"],
                expected_version=first["inquiry"]["version"],
                operation_id="op-convert-other",
                reason="Try duplicate conversion",
                actor=actor,
            )
        assert duplicate.value.code == "inquiry_already_converted"

    asyncio.run(scenario())


def test_conversion_fails_closed_without_transaction_capability():
    async def scenario():
        db = FakeDatabase()
        service = B2BService(db=db, transaction_guard=DisabledGuard())
        inquiry, actor = await qualified_inquiry(service)

        with pytest.raises(TransactionUnavailableError):
            await service.convert_inquiry(
                inquiry["id"],
                expected_version=inquiry["version"],
                operation_id="op-convert-disabled",
                reason="Scope qualified",
                actor=actor,
            )

        assert db.b2b_quotes.items == []
        assert db.b2b_quote_versions.items == []
        stored = await db.inquiries.find_one({"id": inquiry["id"]})
        assert stored["status"] == "contacted"
        assert stored["converted_quote_id"] is None

    asyncio.run(scenario())
