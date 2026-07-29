import asyncio
import types
from pathlib import Path

import httpx
from fastapi import APIRouter, FastAPI, Header, HTTPException
from fastapi.exceptions import RequestValidationError

from b2b_routes import build_b2b_router
from permissions import has_permission
from tests.test_identity_foundation import server


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


def build_context(throttle_intake=None, notify_inquiry=None):
    db = FakeDatabase()
    app = FastAPI()
    app.add_exception_handler(HTTPException, server.http_error_envelope)
    app.add_exception_handler(
        RequestValidationError,
        server.validation_error_envelope,
    )
    api = APIRouter(prefix="/api")
    api.include_router(
        build_b2b_router(
            get_db=lambda: db,
            get_transaction_guard=lambda: None,
            require_permission=permission_dependency,
            throttle_intake=throttle_intake,
            notify_inquiry=notify_inquiry,
        )
    )
    app.include_router(api)
    return app


INTAKE_SUBMISSION = {
    "company": "PT Contoh Industri",
    "pic_name": "Ayu",
    "pic_email": "ayu@example.com",
    "pic_phone": "+628123456789",
    "need": "Prototype enclosure",
    "timeline": "Q4 2026",
    "brief": "Membutuhkan validasi desain dan prototype fungsional.",
}


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


def test_b2b_route_errors_follow_the_shared_http_envelope():
    async def scenario():
        app = build_context()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            denied = await api.get(
                "/api/admin/inquiries",
                headers={"X-Role": "warehouse"},
            )
            assert denied.status_code == 403
            denied_body = denied.json()
            assert denied_body["detail"] == "Permission denied"
            assert denied_body["error"] == {
                "code": "http_403",
                "message": "Permission denied",
            }
            assert denied_body["request_id"]

            malformed = await api.post(
                "/api/admin/inquiries/not-used/transitions",
                headers={"X-Role": "sales_estimator"},
                json={
                    "target_status": "reviewed",
                    "expected_version": 0,
                    "operation_id": "0860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                    "reason": "Brief awal lengkap",
                },
            )
            assert malformed.status_code == 422
            malformed_body = malformed.json()
            assert malformed_body["detail"]["code"] == "request_validation_failed"
            assert malformed_body["error"]["code"] == "request_validation_failed"
            assert malformed_body["request_id"]

    asyncio.run(scenario())


def test_b2b_command_replay_and_conflict_follow_the_shared_http_envelope():
    async def scenario():
        app = build_context()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            inquiry_id = created.json()["id"]
            command = {
                "target_status": "reviewed",
                "expected_version": 1,
                "operation_id": "0860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                "reason": "Brief awal lengkap",
            }
            first = await api.post(
                f"/api/admin/inquiries/{inquiry_id}/transitions",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            assert first.status_code == 200

            replay = await api.post(
                f"/api/admin/inquiries/{inquiry_id}/transitions",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            assert replay.status_code == 200
            assert replay.json()["version"] == first.json()["version"] == 2

            stale = await api.post(
                f"/api/admin/inquiries/{inquiry_id}/transitions",
                headers={"X-Role": "sales_estimator"},
                json={
                    **command,
                    "target_status": "contacted",
                    "operation_id": "1260ca2b-bd13-4bb3-ad7e-a47958aaa939",
                },
            )
            assert stale.status_code == 409
            stale_body = stale.json()
            assert stale_body["detail"]["code"] == "version_conflict"
            assert stale_body["error"]["code"] == "version_conflict"
            assert stale_body["error"]["details"]["current_version"] == 2
            assert stale_body["request_id"]

    asyncio.run(scenario())


def test_public_intake_is_throttled_and_announced():
    """The anonymous intake edge must be rate limited and must raise a lead."""
    throttled = []
    announced = []

    async def notify(inquiry):
        announced.append(inquiry)

    async def scenario():
        app = build_context(
            throttle_intake=lambda request: throttled.append(request.url.path),
            notify_inquiry=notify,
        )
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            assert created.status_code == 201

    asyncio.run(scenario())

    assert throttled == ["/api/inquiries"]
    assert len(announced) == 1
    # The notifier sees the persisted record, not the raw submission, so the
    # lead alert can reference the inquiry an operator will actually open.
    assert announced[0]["id"]
    assert announced[0]["status"] == "new"
    assert announced[0]["company"] == "PT Contoh Industri"


def test_lead_notification_failure_never_costs_the_lead():
    """A broken mailer must not turn a captured lead into a failed submission."""

    async def failing_notify(_inquiry):
        raise RuntimeError("smtp unavailable")

    async def scenario():
        app = build_context(notify_inquiry=failing_notify)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            assert created.status_code == 201
            assert created.json()["status"] == "new"

            listed = await api.get(
                "/api/admin/inquiries",
                headers={"X-Role": "sales_estimator"},
            )
            assert [item["id"] for item in listed.json()] == [created.json()["id"]]

    asyncio.run(scenario())


def test_server_wires_the_public_intake_guards():
    """A mount that forgets the guards yields silent, unthrottled intake."""
    source = (Path(__file__).resolve().parents[1] / "server.py").read_text(
        encoding="utf-8"
    )
    build_call = source.split("build_b2b_router(", 1)[1].split(")", 1)[0]

    assert "throttle_intake=throttle_inquiry_intake" in build_call
    assert "notify_inquiry=notify_new_inquiry" in build_call
    assert 'await rate_limit(f"inquiry:{client_ip(request)}", limit=5, window=600)' in source
