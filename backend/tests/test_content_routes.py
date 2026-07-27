import asyncio
import types

import httpx
from fastapi import APIRouter, FastAPI, Header, HTTPException

from content_routes import build_content_router
from permissions import has_permission
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard


class FakeTransaction:
    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False


class FakeSession:
    """Mirrors the driver surface TransactionExecutor drives."""

    def __init__(self):
        self.in_transaction = False
        self.committed = 0
        self.aborted = 0
        self.ended = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, traceback):
        return False

    def start_transaction(self):
        self.in_transaction = True
        return FakeTransaction()

    async def commit_transaction(self):
        self.in_transaction = False
        self.committed += 1

    async def abort_transaction(self):
        self.in_transaction = False
        self.aborted += 1

    async def end_session(self):
        self.ended = True


class FakeClient:
    def __init__(self):
        self.sessions = []

    async def start_session(self):
        session = FakeSession()
        self.sessions.append(session)
        return session


class RecordingSink:
    def __init__(self):
        self.events = []

    def __call__(self, event, fields):
        self.events.append((event, fields["operation_name"]))


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, ""), reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class FakeCollection:
    def __init__(self):
        self.items = []

    @staticmethod
    def matches(item, query):
        for key, expected in query.items():
            # The public read activates scheduled blocks whose time has passed,
            # so the fake has to understand $or and the range operators.
            if key == "$or":
                if not any(FakeCollection.matches(item, clause) for clause in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict) and "$lte" in expected:
                if actual is None or actual > expected["$lte"]:
                    return False
                continue
            if actual != expected:
                return False
        return True

    @staticmethod
    def project(item, projection):
        result = dict(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self.matches(item, query):
                return self.project(item, projection)
        return None

    def find(self, query, projection=None):
        return FakeCursor(self.project(item, projection) for item in self.items if self.matches(item, query))

    async def insert_one(self, item, **_options):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if self.matches(item, query):
                item.update(update.get("$set", {}))
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)

    async def update_many(self, query, update, **_options):
        matched = 0
        for item in self.items:
            if self.matches(item, query):
                item.update(update.get("$set", {}))
                matched += 1
        return types.SimpleNamespace(matched_count=matched, modified_count=matched)


class FakeDatabase:
    def __init__(self):
        self.content_blocks = FakeCollection()
        self.content_block_versions = FakeCollection()
        self.content_publications = FakeCollection()
        self.audit_events = FakeCollection()


def permission_dependency(permission):
    async def dependency(x_role: str = Header(default="retail_customer")):
        actor = {
            "id": f"actor-{x_role}",
            "email": f"{x_role}@niuva.test",
            "roles": [x_role],
            "status": "active",
            "access_state": "approved",
        }
        if not has_permission(actor, permission):
            raise HTTPException(status_code=403, detail="Permission denied")
        return actor

    return dependency


def build_test_context():
    db = FakeDatabase()
    client = FakeClient()
    capabilities = types.SimpleNamespace(transactions=True)
    sink = RecordingSink()
    guard = TransactionMutationGuard(
        TransactionExecutor(client, lambda: capabilities, event_sink=sink)
    )
    app = FastAPI()
    app.state.transaction_guard = guard
    api = APIRouter(prefix="/api")
    api.include_router(
        build_content_router(
            get_db=lambda: db,
            get_client=lambda: client,
            get_capabilities=lambda: capabilities,
            get_guard=lambda: guard,
            require_permission=permission_dependency,
            has_permission=has_permission,
        )
    )
    app.include_router(api)
    return app, db


def headers(role="super_admin"):
    return {"X-Role": role}


VALID_FAQ_FIELDS = {"question": "Apa itu Niuva?", "answer": "Mitra R&D dan prototyping."}


async def transition(api, block_id, target_status, expected_version, reason="Lifecycle review"):
    return await api.post(
        f"/api/admin/content/{block_id}/transitions",
        json={
            "target_status": target_status,
            "expected_version": expected_version,
            "reason": reason,
        },
        headers=headers(),
    )


async def run_lifecycle_and_public_boundary():
    app, db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        forbidden = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "forbidden", "fields": VALID_FAQ_FIELDS, "reason": "Create forbidden fixture"},
            headers=headers("warehouse"),
        )
        assert forbidden.status_code == 403

        created = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "shipping", "fields": VALID_FAQ_FIELDS, "reason": "Create shipping FAQ"},
            headers=headers(),
        )
        assert created.status_code == 201
        block_id = created.json()["id"]
        assert created.json()["status"] == "draft"

        # Draft content must not be visible on the public endpoint.
        public_before = await api.get("/api/content?content_type=faq")
        assert public_before.json() == []

        published = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Direct draft publish", "expected_version": 1},
            headers=headers(),
        )
        assert published.status_code == 409
        reviewed = await transition(api, block_id, "review", 1)
        assert reviewed.status_code == 200
        previewed = await transition(api, block_id, "preview", 2)
        assert previewed.status_code == 200
        published = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Initial publish", "expected_version": 3},
            headers=headers(),
        )
        assert published.status_code == 200
        assert published.json()["status"] == "published"
        assert published.json()["version"] == 4

        # The mutation must reach MongoDB through the shared central boundary,
        # not through a session the service opened for itself.
        events = app.state.transaction_guard.executor.event_sink.events
        assert ("transaction_start", "content.publish_block") in events
        assert ("transaction_commit", "content.publish_block") in events

        public_after = await api.get("/api/content?content_type=faq")
        assert public_after.status_code == 200
        assert public_after.json()[0]["slug"] == "shipping"
        assert "status" not in public_after.json()[0]
        assert "created_by" not in public_after.json()[0]

        updated = await api.put(
            f"/api/admin/content/{block_id}",
            json={
                "fields": {
                    "question": "Apa itu Niuva?",
                    "answer": "Jawaban baru yang lebih lengkap.",
                },
                "expected_version": 4,
                "reason": "Revise published answer",
            },
            headers=headers(),
        )
        assert updated.status_code == 403
        draft = await transition(api, block_id, "draft", 4)
        assert draft.status_code == 200
        updated = await api.put(
            f"/api/admin/content/{block_id}",
            json={
                "fields": {
                    "question": "Apa itu Niuva?",
                    "answer": "Jawaban baru yang lebih lengkap.",
                },
                "expected_version": 5,
                "reason": "Revise published answer",
            },
            headers=headers(),
        )
        assert updated.status_code == 200

        # Editing the working revision must not mutate the public snapshot.
        public_while_editing = await api.get("/api/content?content_type=faq")
        assert (
            public_while_editing.json()[0]["fields"]["answer"]
            == "Mitra R&D dan prototyping."
        )

        versions = await api.get(f"/api/admin/content/{block_id}/versions", headers=headers())
        assert versions.status_code == 200
        first_version_id = next(
            version["id"]
            for version in versions.json()
            if version["event"] == "published"
        )

        assert (await transition(api, block_id, "review", 6)).status_code == 200
        assert (await transition(api, block_id, "preview", 7)).status_code == 200
        republished = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Publish updated answer", "expected_version": 8},
            headers=headers(),
        )
        assert republished.status_code == 200
        assert republished.json()["fields"]["answer"] == "Jawaban baru yang lebih lengkap."

        rolled_back = await api.post(
            f"/api/admin/content/{block_id}/rollback",
            json={
                "version_id": first_version_id,
                "reason": "Revert to original answer",
                "expected_version": 9,
            },
            headers=headers(),
        )
        assert rolled_back.status_code == 200
        assert rolled_back.json()["status"] == "draft"
        assert rolled_back.json()["fields"]["answer"] == "Mitra R&D dan prototyping."

        archived = await api.post(
            f"/api/admin/content/{block_id}/archive",
            json={"reason": "Retiring this FAQ entry", "expected_version": 10},
            headers=headers(),
        )
        assert archived.status_code == 200
        assert archived.json()["status"] == "archived"

        blocked_update = await api.put(
            f"/api/admin/content/{block_id}",
            json={
                "fields": VALID_FAQ_FIELDS,
                "expected_version": 11,
                "reason": "Attempt archived edit",
            },
            headers=headers(),
        )
        assert blocked_update.status_code == 403
        assert blocked_update.json()["detail"]["code"] == "content_lifecycle_forbidden"

        assert db.audit_events.items[-1]["action"] == "content.block_archived"
        assert (await api.get("/api/content?content_type=faq")).json() == []


def test_content_lifecycle_and_public_boundary():
    asyncio.run(run_lifecycle_and_public_boundary())


async def run_publish_validation_and_conflicts():
    app, _db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        incomplete = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "incomplete", "fields": {"question": ""}, "reason": "Create incomplete fixture"},
            headers=headers(),
        )
        assert incomplete.status_code == 201
        block_id = incomplete.json()["id"]

        blocked_publish = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Try to publish incomplete content", "expected_version": 1},
            headers=headers(),
        )
        assert blocked_publish.status_code == 409
        assert (await transition(api, block_id, "review", 1)).status_code == 200
        invalid_preview = await transition(api, block_id, "preview", 2)
        assert invalid_preview.status_code == 400
        assert invalid_preview.json()["detail"]["code"] == "content_invalid"
        assert invalid_preview.json()["detail"]["errors"]

        duplicate = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "incomplete", "fields": VALID_FAQ_FIELDS, "reason": "Check duplicate slug"},
            headers=headers(),
        )
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"]["code"] == "slug_conflict"

        capability_missing_priority = await api.post(
            "/api/admin/content",
            json={
                "content_type": "capability", "slug": "rnd",
                "fields": {"title": "R&D", "body": "x", "output": "x", "targetUsers": "x", "cta": "x"},
                "reason": "Create capability fixture",
            },
            headers=headers(),
        )
        assert capability_missing_priority.status_code == 201
        invalid_priority_publish = await api.post(
            f"/api/admin/content/{capability_missing_priority.json()['id']}/publish",
            json={"reason": "Missing priority", "expected_version": 1},
            headers=headers(),
        )
        assert invalid_priority_publish.status_code == 409


def test_content_publish_validation_and_slug_conflicts():
    asyncio.run(run_publish_validation_and_conflicts())


async def run_scheduled_publish_sets_scheduled_status():
    app, _db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        created = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "scheduled-item", "fields": VALID_FAQ_FIELDS, "reason": "Create scheduled FAQ"},
            headers=headers(),
        )
        block_id = created.json()["id"]
        assert (await transition(api, block_id, "review", 1)).status_code == 200
        assert (await transition(api, block_id, "preview", 2)).status_code == 200
        scheduled = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={
                "reason": "Publish later",
                "expected_version": 3,
                "scheduled_at": "2030-01-01T00:00:00+00:00",
            },
            headers=headers(),
        )
        assert scheduled.status_code == 200
        assert scheduled.json()["status"] == "scheduled"

        public = await api.get("/api/content?content_type=faq")
        assert public.json() == []


def test_scheduled_publish_is_not_publicly_visible():
    asyncio.run(run_scheduled_publish_sets_scheduled_status())
