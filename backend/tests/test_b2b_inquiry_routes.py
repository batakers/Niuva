import asyncio
import types

import httpx
from fastapi import APIRouter, FastAPI, Header, HTTPException

from b2b_routes import build_b2b_router
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

    async def insert_one(self, document, **_options):
        self.items.append(dict(document))
        return types.SimpleNamespace(inserted_id=document["id"])

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                return dict(item)
        return None

    def find(self, query, projection=None):
        values = [
            item
            for item in self.items
            if all(item.get(key) == value for key, value in query.items())
        ]
        return FakeCursor(values)

    async def update_one(self, query, update, **_options):
        for item in self.items:
            if all(item.get(key) == value for key, value in query.items()):
                item.update(update.get("$set", {}))
                return types.SimpleNamespace(matched_count=1)
        return types.SimpleNamespace(matched_count=0)


class FakeDatabase:
    def __init__(self):
        self.inquiries = FakeCollection()


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


def build_context():
    db = FakeDatabase()
    app = FastAPI()
    api = APIRouter(prefix="/api")
    api.include_router(
        build_b2b_router(
            get_db=lambda: db,
            get_transaction_guard=lambda: None,
            require_permission=permission_dependency,
        )
    )
    app.include_router(api)
    return app


def test_public_intake_and_permission_scoped_triage():
    async def scenario():
        app = build_context()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post(
                "/api/inquiries",
                json={
                    "company": "PT Contoh Industri",
                    "pic_name": "Ayu",
                    "pic_email": "ayu@example.com",
                    "pic_phone": "+628123456789",
                    "need": "Prototype enclosure",
                    "timeline": "Q4 2026",
                    "brief": "Membutuhkan validasi desain dan prototype fungsional.",
                },
            )
            assert created.status_code == 201
            inquiry = created.json()
            assert inquiry["status"] == "new"

            forbidden = await api.get(
                "/api/admin/inquiries",
                headers={"X-Role": "warehouse"},
            )
            assert forbidden.status_code == 403

            reviewed = await api.post(
                f"/api/admin/inquiries/{inquiry['id']}/transitions",
                headers={"X-Role": "sales_estimator"},
                json={
                    "target_status": "reviewed",
                    "expected_version": 1,
                    "operation_id": "0860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                    "reason": "Brief awal lengkap",
                },
            )
            assert reviewed.status_code == 200
            assert reviewed.json()["version"] == 2
            assert reviewed.json()["permitted_next_actions"] == [
                "contact",
                "reject",
            ]

            listed = await api.get(
                "/api/admin/inquiries",
                headers={"X-Role": "sales_estimator"},
            )
            assert listed.status_code == 200
            assert listed.json()[0]["id"] == inquiry["id"]

    asyncio.run(scenario())
