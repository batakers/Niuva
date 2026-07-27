"""Portfolio publication: nothing public before it is published, nothing lost.

The two properties that carry the weight: a draft never reaches the public
projection, and no route can destroy an entry.
"""

import asyncio
import types

import pytest

from portfolio_domain import (
    PUBLIC_PORTFOLIO_FIELDS,
    PortfolioDomainError,
    portfolio_next_actions,
    prefill_from_project,
    project_public_portfolio,
    reorder_entries,
    validate_portfolio_transition,
)
from portfolio_service import PortfolioService

ACTOR = {"id": "content-1", "email": "content@niuva.test"}
APPROVER = {"id": "manager-1", "email": "manager@niuva.test"}

DRAFT = {
    "title_id": "Purwarupa Enclosure",
    "title_en": "Enclosure Prototype",
    "category": "Prototyping",
    "description_id": "Validasi desain.",
    "description_en": "Design validation.",
    "images": ["portfolio/one.webp"],
    "featured": False,
}


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @staticmethod
    def _matches(item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(FakeCollection._matches(item, clause) for clause in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict) and "$lte" in expected:
                if actual is None or actual > expected["$lte"]:
                    return False
            elif actual != expected:
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

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                for key, value in update.get("$inc", {}).items():
                    item[key] = item.get(key, 0) + value
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)

    async def update_many(self, query, update, **_options):
        matched = 0
        for item in self.items:
            if self._matches(item, query):
                item.update(update.get("$set", {}))
                matched += 1
        return types.SimpleNamespace(matched_count=matched)


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key) or 0, reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class FakeDatabase:
    def __init__(self):
        self.portfolio = FakeCollection()
        self.portfolio_revisions = FakeCollection()
        self.portfolio_publications = FakeCollection()
        self.b2b_projects = FakeCollection()


class EnabledGuard:
    async def run(self, callback, **_options):
        return await callback(object())


def build_service():
    db = FakeDatabase()
    return PortfolioService(db=db, transaction_guard=EnabledGuard()), db


async def published_entry(service, *, actor=APPROVER):
    entry = await service.create(dict(DRAFT), actor=ACTOR)
    for target in ("review", "preview", "published"):
        entry = await service.transition(
            entry["id"],
            target_status=target,
            expected_version=entry["version"],
            reason=f"Menuju {target}",
            actor=actor,
            can_write=True,
            can_publish=True,
            can_archive=True,
        )
    return entry


# --------------------------- Lifecycle ---------------------------


def test_the_lifecycle_moves_forward_and_can_send_work_back():
    validate_portfolio_transition("draft", "review", reason="Siap ditinjau")
    validate_portfolio_transition("review", "draft", reason="Perlu perbaikan")
    validate_portfolio_transition("preview", "scheduled", reason="Dijadwalkan")

    with pytest.raises(PortfolioDomainError) as skipped:
        validate_portfolio_transition("draft", "published", reason="Langsung tayang")
    assert skipped.value.code == "portfolio_transition_invalid"


def test_archive_is_a_resting_state_not_a_grave():
    assert portfolio_next_actions("archived") == ["restore"]
    validate_portfolio_transition("archived", "draft", reason="Diaktifkan lagi")
    # Every live status can be archived, so nothing needs deleting to disappear.
    for status in ("draft", "review", "preview", "scheduled", "published"):
        validate_portfolio_transition(status, "archived", reason="Diarsipkan")


def test_publishing_requires_approval_authority():
    async def scenario():
        service, _db = build_service()
        entry = await service.create(dict(DRAFT), actor=ACTOR)
        for target in ("review", "preview"):
            entry = await service.transition(
                entry["id"],
                target_status=target,
                expected_version=entry["version"],
                reason=f"Menuju {target}",
                actor=ACTOR,
                can_write=True,
                can_publish=False,
                can_archive=False,
            )

        with pytest.raises(PortfolioDomainError) as refused:
            await service.transition(
                entry["id"],
                target_status="published",
                expected_version=entry["version"],
                reason="Tayangkan",
                actor=ACTOR,
                can_write=True,
                can_publish=False,
                can_archive=False,
            )
        # Authoring and approving are different authorities.
        assert refused.value.status_code == 403
        assert refused.value.code == "portfolio_publish_forbidden"

    asyncio.run(scenario())


def test_scheduling_requires_an_activation_time():
    async def scenario():
        service, _db = build_service()
        entry = await service.create(dict(DRAFT), actor=ACTOR)
        for target in ("review", "preview"):
            entry = await service.transition(
                entry["id"],
                target_status=target,
                expected_version=entry["version"],
                reason=f"Menuju {target}",
                actor=APPROVER,
                can_write=True,
                can_publish=True,
                can_archive=True,
            )

        with pytest.raises(PortfolioDomainError) as refused:
            await service.transition(
                entry["id"],
                target_status="scheduled",
                expected_version=entry["version"],
                reason="Jadwalkan",
                actor=APPROVER,
                can_write=True,
                can_publish=True,
                can_archive=True,
            )
        assert refused.value.code == "portfolio_schedule_required"

    asyncio.run(scenario())


# --------------------------- Public boundary ---------------------------


def test_a_draft_never_reaches_the_public():
    async def scenario():
        service, _db = build_service()
        await service.create(dict(DRAFT), actor=ACTOR)

        assert await service.list_public() == []
        # It is visible internally the whole time.
        assert len(await service.list_admin()) == 1

    asyncio.run(scenario())


def test_a_future_schedule_stays_private_until_its_time():
    async def scenario():
        service, _db = build_service()
        entry = await service.create(dict(DRAFT), actor=ACTOR)
        for target in ("review", "preview"):
            entry = await service.transition(
                entry["id"],
                target_status=target,
                expected_version=entry["version"],
                reason=f"Menuju {target}",
                actor=APPROVER,
                can_write=True,
                can_publish=True,
                can_archive=True,
            )
        await service.transition(
            entry["id"],
            target_status="scheduled",
            expected_version=entry["version"],
            reason="Jadwalkan",
            actor=APPROVER,
            can_write=True,
            can_publish=True,
            can_archive=True,
            scheduled_for="2099-01-01T00:00:00+00:00",
        )

        # Scheduling early must not be a way to publish early.
        assert await service.list_public() == []

    asyncio.run(scenario())


def test_the_public_projection_is_an_allowlist():
    entry = {
        "id": "p-1",
        "title_id": "Judul",
        "status": "published",
        "version": 4,
        "history": [{"actor_user_id": "content-1", "reason": "internal"}],
        "versions": [{"revision": 1}],
        "source_project_id": "project-1",
        "client": "PT Rahasia",
        "internal_notes": "jangan tayang",
        "cost_minor": 1000,
    }

    public = project_public_portfolio(entry)

    assert public["title_id"] == "Judul"
    for leaked in (
        "status",
        "version",
        "history",
        "versions",
        "source_project_id",
        "client",
        "internal_notes",
        "cost_minor",
    ):
        assert leaked not in public


def test_no_public_field_names_a_customer_or_a_cost():
    for field in PUBLIC_PORTFOLIO_FIELDS:
        assert "client" not in field
        assert "cost" not in field
        assert "margin" not in field


# --------------------------- Prefill ---------------------------


COMPLETED_PROJECT = {
    "id": "project-1",
    "status": "completed",
    "quote_id": "quote-1",
    "quote_snapshot": {
        "scope_snapshot": {
            "company": "PT Contoh Industri",
            "pic_name": "Ayu",
            "pic_email": "ayu@example.com",
            "pic_phone": "0812",
            "need": "Prototype enclosure",
            "brief": "Rahasia internal pelanggan.",
        },
        "items": [{"unit_price_minor": 750000}],
        "total_minor": 3000000,
    },
    "work_order_ids": ["wo-1"],
    "history": [{"actor_user_id": "u-1", "reason": "internal"}],
}


def test_prefill_carries_the_work_and_nothing_private():
    draft = prefill_from_project(COMPLETED_PROJECT)

    assert draft["title_id"] == "Prototype enclosure"
    assert draft["source_project_id"] == "project-1"
    # The company, the people, the brief, the money, and the internal trail
    # all stay behind.
    serialized = repr(draft)
    for private in (
        "PT Contoh Industri",
        "Ayu",
        "ayu@example.com",
        "Rahasia internal",
        "750000",
        "3000000",
        "quote-1",
        "wo-1",
    ):
        assert private not in serialized


def test_prefill_refuses_a_project_that_is_not_finished():
    with pytest.raises(PortfolioDomainError) as refused:
        prefill_from_project({**COMPLETED_PROJECT, "status": "active"})
    assert refused.value.code == "project_not_completed"


def test_one_project_yields_one_draft():
    async def scenario():
        service, db = build_service()
        await db.b2b_projects.insert_one(dict(COMPLETED_PROJECT))

        first = await service.create_from_project("project-1", actor=ACTOR)
        second = await service.create_from_project("project-1", actor=ACTOR)

        assert second["id"] == first["id"]
        assert len(db.portfolio.items) == 1

    asyncio.run(scenario())


# --------------------------- Versions and ordering ---------------------------


def test_editing_appends_a_revision_and_rollback_does_not_truncate():
    async def scenario():
        service, _db = build_service()
        entry = await service.create(dict(DRAFT), actor=ACTOR)
        edited = await service.update_content(
            entry["id"],
            {**DRAFT, "title_id": "Judul Baru"},
            expected_version=entry["version"],
            reason="Perbaiki judul",
            actor=ACTOR,
        )
        assert edited["title_id"] == "Judul Baru"
        assert len(edited["versions"]) == 2

        restored = await service.rollback(
            entry["id"],
            revision=1,
            expected_version=edited["version"],
            reason="Kembalikan judul lama",
            actor=ACTOR,
        )
        assert restored["title_id"] == "Purwarupa Enclosure"
        # Rolling back appends; what was published stays on the record.
        assert len(restored["versions"]) == 3

    asyncio.run(scenario())


def test_a_published_entry_is_not_edited_in_place():
    async def scenario():
        service, _db = build_service()
        entry = await published_entry(service)

        with pytest.raises(PortfolioDomainError) as refused:
            await service.update_content(
                entry["id"],
                {**DRAFT, "title_id": "Diam-diam diubah"},
                expected_version=entry["version"],
                reason="Ubah langsung",
                actor=ACTOR,
            )
        assert refused.value.code == "portfolio_published_immutable"

    asyncio.run(scenario())


def test_reordering_takes_the_whole_sequence_not_a_swap():
    entries = [{"id": "a"}, {"id": "b"}, {"id": "c"}]

    assert reorder_entries(entries, ["c", "a", "b"]) == [
        {"id": "c", "display_order": 0},
        {"id": "a", "display_order": 1},
        {"id": "b", "display_order": 2},
    ]

    # A partial order is refused: two people reordering at once would otherwise
    # interleave into an order neither of them chose.
    with pytest.raises(PortfolioDomainError) as incomplete:
        reorder_entries(entries, ["a", "b"])
    assert incomplete.value.code == "portfolio_order_incomplete"
    assert incomplete.value.details["missing"] == ["c"]

    with pytest.raises(PortfolioDomainError) as unknown:
        reorder_entries(entries, ["a", "b", "c", "d"])
    assert unknown.value.details["unknown"] == ["d"]


def test_a_stale_version_does_not_overwrite_a_newer_edit():
    async def scenario():
        service, _db = build_service()
        entry = await service.create(dict(DRAFT), actor=ACTOR)
        await service.update_content(
            entry["id"],
            {**DRAFT, "title_id": "Pertama"},
            expected_version=entry["version"],
            reason="Edit pertama",
            actor=ACTOR,
        )

        with pytest.raises(PortfolioDomainError) as stale:
            await service.update_content(
                entry["id"],
                {**DRAFT, "title_id": "Kedua"},
                expected_version=entry["version"],
                reason="Edit dari salinan basi",
                actor=ACTOR,
            )
        assert stale.value.code == "version_conflict"

    asyncio.run(scenario())
