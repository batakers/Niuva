import asyncio
import types

import httpx
from fastapi import APIRouter, FastAPI, Header, HTTPException

from content_routes import build_content_router
from permissions import has_permission


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
            if item.get(key) != expected:
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

    async def find_one(self, query, projection=None):
        for item in self.items:
            if self.matches(item, query):
                return self.project(item, projection)
        return None

    def find(self, query, projection=None):
        return FakeCursor(self.project(item, projection) for item in self.items if self.matches(item, query))

    async def insert_one(self, item):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update):
        for item in self.items:
            if self.matches(item, query):
                item.update(update.get("$set", {}))
                return types.SimpleNamespace(matched_count=1, modified_count=1)
        return types.SimpleNamespace(matched_count=0, modified_count=0)


class FakeDatabase:
    def __init__(self):
        self.content_blocks = FakeCollection()
        self.content_block_versions = FakeCollection()
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
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(build_content_router(get_db=lambda: db, require_permission=permission_dependency))
    app.include_router(api)
    return app, db


def headers(role="super_admin"):
    return {"X-Role": role}


VALID_FAQ_FIELDS = {"question": "Apa itu Niuva?", "answer": "Mitra R&D dan prototyping."}


async def run_lifecycle_and_public_boundary():
    app, db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        forbidden = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "forbidden", "fields": VALID_FAQ_FIELDS},
            headers=headers("warehouse"),
        )
        assert forbidden.status_code == 403

        created = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "shipping", "fields": VALID_FAQ_FIELDS},
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
            json={"reason": "Initial publish"},
            headers=headers(),
        )
        assert published.status_code == 200
        assert published.json()["status"] == "published"
        assert published.json()["version"] == 2

        public_after = await api.get("/api/content?content_type=faq")
        assert public_after.status_code == 200
        assert public_after.json()[0]["slug"] == "shipping"
        assert "status" not in public_after.json()[0]
        assert "created_by" not in public_after.json()[0]

        updated = await api.put(
            f"/api/admin/content/{block_id}",
            json={"fields": {"question": "Apa itu Niuva?", "answer": "Jawaban baru yang lebih lengkap."}},
            headers=headers(),
        )
        assert updated.status_code == 200

        versions = await api.get(f"/api/admin/content/{block_id}/versions", headers=headers())
        assert versions.status_code == 200
        assert len(versions.json()) == 1
        first_version_id = versions.json()[0]["id"]

        republished = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Publish updated answer"},
            headers=headers(),
        )
        assert republished.status_code == 200
        assert republished.json()["fields"]["answer"] == "Jawaban baru yang lebih lengkap."

        rolled_back = await api.post(
            f"/api/admin/content/{block_id}/rollback",
            json={"version_id": first_version_id, "reason": "Revert to original answer"},
            headers=headers(),
        )
        assert rolled_back.status_code == 200
        assert rolled_back.json()["fields"]["answer"] == "Mitra R&D dan prototyping."

        archived = await api.post(
            f"/api/admin/content/{block_id}/archive",
            json={"reason": "Retiring this FAQ entry"},
            headers=headers(),
        )
        assert archived.status_code == 200
        assert archived.json()["status"] == "archived"

        blocked_update = await api.put(
            f"/api/admin/content/{block_id}",
            json={"fields": VALID_FAQ_FIELDS},
            headers=headers(),
        )
        assert blocked_update.status_code == 403
        assert blocked_update.json()["detail"]["code"] == "content_lifecycle_forbidden"

        assert db.audit_events.items[-1]["action"] == "content.block_archived"


def test_content_lifecycle_and_public_boundary():
    asyncio.run(run_lifecycle_and_public_boundary())


async def run_publish_validation_and_conflicts():
    app, _db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        incomplete = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "incomplete", "fields": {"question": ""}},
            headers=headers(),
        )
        assert incomplete.status_code == 201
        block_id = incomplete.json()["id"]

        blocked_publish = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Try to publish incomplete content"},
            headers=headers(),
        )
        assert blocked_publish.status_code == 400
        assert blocked_publish.json()["detail"]["code"] == "content_invalid"
        assert blocked_publish.json()["detail"]["errors"]

        duplicate = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "incomplete", "fields": VALID_FAQ_FIELDS},
            headers=headers(),
        )
        assert duplicate.status_code == 409
        assert duplicate.json()["detail"]["code"] == "slug_conflict"

        capability_missing_priority = await api.post(
            "/api/admin/content",
            json={
                "content_type": "capability", "slug": "rnd",
                "fields": {"title": "R&D", "body": "x", "output": "x", "targetUsers": "x", "cta": "x"},
            },
            headers=headers(),
        )
        assert capability_missing_priority.status_code == 201
        invalid_priority_publish = await api.post(
            f"/api/admin/content/{capability_missing_priority.json()['id']}/publish",
            json={"reason": "Missing priority"},
            headers=headers(),
        )
        assert invalid_priority_publish.status_code == 400
        assert any(err["field"] == "priority" for err in invalid_priority_publish.json()["detail"]["errors"])


def test_content_publish_validation_and_slug_conflicts():
    asyncio.run(run_publish_validation_and_conflicts())


async def run_scheduled_publish_sets_scheduled_status():
    app, _db = build_test_context()
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        created = await api.post(
            "/api/admin/content",
            json={"content_type": "faq", "slug": "scheduled-item", "fields": VALID_FAQ_FIELDS},
            headers=headers(),
        )
        block_id = created.json()["id"]
        scheduled = await api.post(
            f"/api/admin/content/{block_id}/publish",
            json={"reason": "Publish later", "scheduled_at": "2030-01-01T00:00:00+00:00"},
            headers=headers(),
        )
        assert scheduled.status_code == 200
        assert scheduled.json()["status"] == "scheduled"

        public = await api.get("/api/content?content_type=faq")
        assert public.json() == []


def test_scheduled_publish_is_not_publicly_visible():
    asyncio.run(run_scheduled_publish_sets_scheduled_status())
