import asyncio
import types
from pathlib import Path

import httpx
import pytest
from auth_rate_limit import PublicRateLimiter
from b2b_routes import build_b2b_router
from fastapi import APIRouter, FastAPI, Header, HTTPException
from fastapi.exceptions import RequestValidationError
from permissions import ROLE_POLICY_VERSION, has_permission
from transaction_execution import TransactionUnavailableError

from tests.test_identity_foundation import server

MISSING = object()


def field_matches(actual, expected):
    if not isinstance(expected, dict):
        return actual is not MISSING and actual == expected
    for operator, value in expected.items():
        if operator == "$type":
            if value != "string" or not isinstance(actual, str):
                return False
        elif operator == "$not":
            if field_matches(actual, value):
                return False
        elif operator == "$lt":
            if actual is MISSING or not actual < value:
                return False
        elif operator == "$gte":
            if actual is MISSING or not actual >= value:
                return False
        else:
            raise AssertionError(f"Unsupported test operator: {operator}")
    return True


def matches(document, query):
    for key, expected in query.items():
        if key == "$and":
            if not all(matches(document, clause) for clause in expected):
                return False
        elif key == "$or":
            if not any(matches(document, clause) for clause in expected):
                return False
        elif not field_matches(document.get(key, MISSING), expected):
            return False
    return True


class FakeCursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def sort(self, key, direction=None):
        fields = key if isinstance(key, list) else [(key, direction)]
        for field, field_direction in reversed(fields):
            self.items.sort(
                key=lambda item: item.get(field, ""),
                reverse=field_direction < 0,
            )
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
        values = [item for item in self.items if matches(item, query)]
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
        self.b2b_quotes = FakeCollection()
        self.b2b_quote_versions = FakeCollection()


class FakeRateLimitCollection:
    def __init__(self):
        self.items = {}

    async def update_one(self, query, update, upsert=False):
        key = query["_id"]
        item = self.items.get(key)
        if item is None:
            assert upsert is True
            item = {"_id": key, **update.get("$setOnInsert", {})}
            self.items[key] = item
        for field, amount in update.get("$inc", {}).items():
            item[field] = item.get(field, 0) + amount
        return types.SimpleNamespace(matched_count=1)

    async def find_one_and_update(
        self,
        query,
        update,
        upsert=False,
        return_document=False,
        **_options,
    ):
        key = query["_id"]
        item = self.items.get(key)
        before = dict(item) if item is not None else None
        if item is None:
            if not upsert:
                return None
            item = {"_id": key, **update.get("$setOnInsert", {})}
            self.items[key] = item
        for field, amount in update.get("$inc", {}).items():
            item[field] = item.get(field, 0) + amount
        return dict(item) if return_document else before

    async def find_one(self, query, projection=None):
        item = self.items.get(query["_id"])
        return dict(item) if item else None


class DisabledGuard:
    async def run(self, _callback, **_options):
        raise TransactionUnavailableError()


class EnabledGuard:
    async def run(self, callback, **_options):
        return await callback(object())


def permission_dependency(permission):
    async def dependency(x_role: str = Header(default="retail_customer")):
        actor = {
            "id": f"actor-{x_role}",
            "email": f"{x_role}@niuva.test",
            "roles": [x_role],
            "status": "active",
            "access_state": "approved",
            "role_policy_version": ROLE_POLICY_VERSION,
        }
        if not has_permission(actor, permission):
            raise HTTPException(status_code=403, detail="Permission denied")
        return actor

    return dependency


async def allow_intake(_request):
    return None


def build_context(
    throttle_intake=allow_intake,
    notify_inquiry=None,
    *,
    db=None,
    transaction_guard=None,
    permission_factory=permission_dependency,
):
    db = db or FakeDatabase()
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
            get_transaction_guard=lambda: transaction_guard,
            require_permission=permission_factory,
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
    "consent": True,
}


@pytest.mark.parametrize(
    "override, rejected_field",
    [
        ({"consent": False}, "consent"),
        ({"pic_phone": ""}, "pic_phone"),
        ({"pic_phone": "0812"}, "pic_phone"),
    ],
)
def test_public_intake_refuses_incomplete_consent_or_contact(override, rejected_field):
    """DEC-UX-003 requires consent and a reachable phone at the boundary.

    The frontend checks both, but the public endpoint is reachable without it,
    so the contract is enforced here rather than assumed.
    """

    async def scenario():
        app = build_context()
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            response = await api.post(
                "/api/inquiries",
                json={**INTAKE_SUBMISSION, **override},
            )
            assert response.status_code == 422
            body = response.text
            assert rejected_field in body

    asyncio.run(scenario())


def test_public_intake_does_not_persist_consent_flag():
    """Consent gates the request; storing it needs its own schema decision."""

    async def scenario():
        database = FakeDatabase()
        app = build_context(db=database)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            assert created.status_code == 201
            assert "consent" not in created.json()

        stored = await database.inquiries.find_one({"id": created.json()["id"]})
        assert stored is not None
        assert "consent" not in stored

    asyncio.run(scenario())


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
                    "consent": True,
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
            assert listed.json()["items"][0]["id"] == inquiry["id"]

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


def test_inquiry_openapi_declares_success_and_error_contracts():
    schema = build_context().openapi()

    intake = schema["paths"]["/api/inquiries"]["post"]["responses"]
    assert intake["201"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/PublicInquiryResponse"
    }
    assert intake["429"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorEnvelope"
    }

    inquiry_list = schema["paths"]["/api/admin/inquiries"]["get"]["responses"]
    list_schema = inquiry_list["200"]["content"]["application/json"]["schema"]
    assert list_schema == {"$ref": "#/components/schemas/InquiryPageResponse"}
    assert inquiry_list["403"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorEnvelope"
    }

    conversion = schema["paths"]["/api/admin/inquiries/{inquiry_id}/convert"]["post"][
        "responses"
    ]
    assert conversion["200"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/InquiryConversionResponse"
    }
    for status_code in ("401", "403", "404", "409", "422", "500", "503"):
        assert conversion[status_code]["content"]["application/json"]["schema"] == {
            "$ref": "#/components/schemas/ErrorEnvelope"
        }


def test_b2b_list_openapi_declares_bounded_cursor_contract():
    schema = build_context().openapi()
    paths = schema["paths"]
    expected_models = {
        "/api/admin/inquiries": "InquiryPageResponse",
        "/api/admin/b2b/quotes": "B2BPageResponse",
        "/api/admin/b2b/projects": "B2BPageResponse",
        "/api/admin/b2b/work-orders": "B2BPageResponse",
        "/api/admin/b2b/material-shortages": "B2BPageResponse",
    }

    for path, model in expected_models.items():
        operation = paths[path]["get"]
        assert operation["responses"]["200"]["content"]["application/json"][
            "schema"
        ] == {"$ref": f"#/components/schemas/{model}"}
        parameters = {item["name"]: item for item in operation["parameters"]}
        assert set(("limit", "cursor", "updated_from", "updated_before")) <= set(
            parameters
        )
        assert parameters["limit"]["schema"]["minimum"] == 1
        assert parameters["limit"]["schema"]["maximum"] == 100


def test_inquiry_cursor_pages_are_stable_and_filter_bound():
    async def scenario():
        database = FakeDatabase()
        timestamp = "2026-08-02T08:00:00+00:00"
        for identifier in ("inquiry-a", "inquiry-c", "inquiry-b"):
            await database.inquiries.insert_one(
                {
                    "id": identifier,
                    "company": "PT Contoh",
                    "pic_name": "Ayu",
                    "pic_email": "ayu@example.com",
                    "pic_phone": "",
                    "need": "Prototype",
                    "timeline": "Q4",
                    "brief": "Membutuhkan prototype untuk validasi.",
                    "status": "new",
                    "version": 1,
                    "converted_quote_id": None,
                    "history": [],
                    "created_at": timestamp,
                    "updated_at": timestamp,
                }
            )
        app = build_context(db=database)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            first = await api.get(
                "/api/admin/inquiries?limit=2&status_filter=new",
                headers={"X-Role": "sales_estimator"},
            )
            assert first.status_code == 200
            assert [item["id"] for item in first.json()["items"]] == [
                "inquiry-c",
                "inquiry-b",
            ]
            cursor = first.json()["next_cursor"]
            assert cursor

            second = await api.get(
                "/api/admin/inquiries",
                params={"limit": 2, "status_filter": "new", "cursor": cursor},
                headers={"X-Role": "sales_estimator"},
            )
            assert [item["id"] for item in second.json()["items"]] == ["inquiry-a"]
            assert second.json()["next_cursor"] is None

            mismatch = await api.get(
                "/api/admin/inquiries",
                params={"status_filter": "reviewed", "cursor": cursor},
                headers={"X-Role": "sales_estimator"},
            )
            assert mismatch.status_code == 422
            assert (
                mismatch.json()["error"]["code"] == "pagination_cursor_filter_mismatch"
            )

            empty_cursor = await api.get(
                "/api/admin/inquiries",
                params={"cursor": "   "},
                headers={"X-Role": "sales_estimator"},
            )
            assert empty_cursor.status_code == 422
            assert empty_cursor.json()["error"]["code"] == "pagination_cursor_invalid"

            naive = await api.get(
                "/api/admin/inquiries",
                params={"updated_from": "2026-08-02T00:00:00"},
                headers={"X-Role": "sales_estimator"},
            )
            assert naive.status_code == 422
            assert (
                naive.json()["error"]["code"] == "pagination_datetime_timezone_required"
            )

            oversized = await api.get(
                "/api/admin/inquiries?limit=101",
                headers={"X-Role": "sales_estimator"},
            )
            assert oversized.status_code == 422
            assert oversized.json()["error"]["code"] == "request_validation_failed"

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


def test_router_refuses_to_mount_without_an_intake_limiter():
    with pytest.raises(ValueError, match="requires a rate limiter"):
        build_b2b_router(
            get_db=FakeDatabase,
            get_transaction_guard=lambda: None,
            require_permission=permission_dependency,
            throttle_intake=None,
        )


def test_public_intake_limit_returns_429_retry_after_and_shared_envelope():
    collection = FakeRateLimitCollection()
    limiter = PublicRateLimiter(collection=collection, secret="test-secret")

    async def throttle(request):
        await limiter.consume(
            scope="inquiry",
            identifier=request.client.host,
            limit=5,
            window_seconds=600,
        )

    async def scenario():
        app = build_context(throttle_intake=throttle)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            responses = [
                await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
                for _attempt in range(6)
            ]

        assert [response.status_code for response in responses[:5]] == [201] * 5
        limited = responses[5]
        assert limited.status_code == 429
        assert int(limited.headers["Retry-After"]) >= 1
        body = limited.json()
        assert body["error"]["code"] == "http_429"
        assert body["request_id"]
        assert all("127.0.0.1" not in key for key in collection.items)

    asyncio.run(scenario())


def test_conversion_requires_inquiry_and_quote_write_permissions():
    async def request_with_denied_permission(denied_permission):
        def selective_permission(permission):
            async def dependency():
                if permission == denied_permission:
                    raise HTTPException(status_code=403, detail="Permission denied")
                return {"id": "bounded-writer", "roles": ["test_writer"]}

            return dependency

        app = build_context(permission_factory=selective_permission)
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            response = await api.post(
                "/api/admin/inquiries/known-id/convert",
                json={
                    "expected_version": 3,
                    "operation_id": "0860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                    "reason": "Scope qualified",
                },
            )
        return response

    for denied_permission in ("inquiries.write", "quotes.write"):
        response = asyncio.run(request_with_denied_permission(denied_permission))
        assert response.status_code == 403, denied_permission
        assert response.json()["error"]["code"] == "http_403", denied_permission


def test_conversion_replay_and_conflicting_reuse_follow_http_contract():
    async def scenario():
        app = build_context(transaction_guard=EnabledGuard())
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            inquiry = (
                await api.get(
                    f"/api/admin/inquiries/{created.json()['id']}",
                    headers={"X-Role": "sales_estimator"},
                )
            ).json()
            for target, operation_id in (
                ("reviewed", "0860ca2b-bd13-4bb3-ad7e-a47958aaa939"),
                ("contacted", "1860ca2b-bd13-4bb3-ad7e-a47958aaa939"),
            ):
                inquiry = (
                    await api.post(
                        f"/api/admin/inquiries/{inquiry['id']}/transitions",
                        headers={"X-Role": "sales_estimator"},
                        json={
                            "target_status": target,
                            "expected_version": inquiry["version"],
                            "operation_id": operation_id,
                            "reason": f"Move to {target}",
                        },
                    )
                ).json()

            command = {
                "expected_version": inquiry["version"],
                "operation_id": "2860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                "reason": "Scope qualified",
            }
            first = await api.post(
                f"/api/admin/inquiries/{inquiry['id']}/convert",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            replay = await api.post(
                f"/api/admin/inquiries/{inquiry['id']}/convert",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            conflict = await api.post(
                f"/api/admin/inquiries/{inquiry['id']}/convert",
                headers={"X-Role": "sales_estimator"},
                json={**command, "reason": "Changed scope"},
            )

        assert first.status_code == replay.status_code == 200
        assert first.json()["quote"]["id"] == replay.json()["quote"]["id"]
        assert conflict.status_code == 409
        body = conflict.json()
        assert body["error"]["code"] == "operation_id_conflict"
        assert body["request_id"]

    asyncio.run(scenario())


def test_conversion_transaction_unavailable_uses_shared_http_envelope():
    async def scenario():
        app = build_context(transaction_guard=DisabledGuard())
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            created = await api.post("/api/inquiries", json=INTAKE_SUBMISSION)
            inquiry_id = created.json()["id"]
            inquiry = (
                await api.get(
                    f"/api/admin/inquiries/{inquiry_id}",
                    headers={"X-Role": "sales_estimator"},
                )
            ).json()
            for target in ("reviewed", "contacted"):
                transitioned = await api.post(
                    f"/api/admin/inquiries/{inquiry['id']}/transitions",
                    headers={"X-Role": "sales_estimator"},
                    json={
                        "target_status": target,
                        "expected_version": inquiry["version"],
                        "operation_id": (
                            "0860ca2b-bd13-4bb3-ad7e-a47958aaa939"
                            if target == "reviewed"
                            else "1860ca2b-bd13-4bb3-ad7e-a47958aaa939"
                        ),
                        "reason": f"Move to {target}",
                    },
                )
                assert transitioned.status_code == 200
                inquiry = transitioned.json()

            unavailable = await api.post(
                f"/api/admin/inquiries/{inquiry['id']}/convert",
                headers={"X-Role": "sales_estimator"},
                json={
                    "expected_version": inquiry["version"],
                    "operation_id": "2860ca2b-bd13-4bb3-ad7e-a47958aaa939",
                    "reason": "Scope qualified",
                },
            )

        assert unavailable.status_code == 503
        body = unavailable.json()
        assert body["detail"]["code"] == "transaction_unavailable"
        assert body["error"]["code"] == "transaction_unavailable"
        assert body["request_id"]

    asyncio.run(scenario())


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
            assert [item["id"] for item in listed.json()["items"]] == [
                created.json()["id"]
            ]

    asyncio.run(scenario())


def test_server_wires_the_public_intake_guards():
    """A mount that forgets the guards yields silent, unthrottled intake."""
    source = (Path(__file__).resolve().parents[1] / "server.py").read_text(
        encoding="utf-8"
    )
    build_call = source.split("build_b2b_router(", 1)[1].split(")", 1)[0]

    assert "throttle_intake=throttle_inquiry_intake" in build_call
    assert "notify_inquiry=notify_new_inquiry" in build_call
    assert (
        'await rate_limit(f"inquiry:{client_ip(request)}", limit=5, window=600)'
        in source
    )
