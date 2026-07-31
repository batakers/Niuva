import asyncio

import httpx

from tests.test_b2b_inquiry_routes import FakeDatabase, build_context

QUOTE_ID = "quote-lifecycle-1"
VERSION_ID = "quote-version-1"
OPERATION_ID = "0860ca2b-bd13-4bb3-ad7e-a47958aaa939"


async def seed_ready_quote(database):
    await database.b2b_quote_versions.insert_one(
        {
            "id": VERSION_ID,
            "quote_id": QUOTE_ID,
            "revision": 1,
            "scope_snapshot": {
                "company": "PT Contoh Industri",
                "pic_name": "Ayu",
                "pic_email": "ayu@example.com",
                "need": "Prototype enclosure",
            },
            "items": [
                {
                    "quote_line_id": "quote-line-1",
                    "description": "Engineering service",
                    "quantity": 1,
                    "unit_price_minor": 1000000,
                    "line_total_minor": 1000000,
                }
            ],
            "currency": "IDR",
            "total_minor": 1000000,
            "created_by": "actor-sales_estimator",
            "reason": "Initial quotation",
            "created_at": "2026-07-31T00:00:00+00:00",
        }
    )
    await database.b2b_quotes.insert_one(
        {
            "id": QUOTE_ID,
            "inquiry_id": "inquiry-1",
            "status": "draft",
            "version": 1,
            "current_revision": 1,
            "current_version_id": VERSION_ID,
            "sent_version_id": None,
            "accepted_version_id": None,
            "project_id": None,
            "history": [],
            "created_at": "2026-07-31T00:00:00+00:00",
            "updated_at": "2026-07-31T00:00:00+00:00",
        }
    )


def test_quote_transition_permission_replay_and_conflict_use_http_contract():
    async def scenario():
        database = FakeDatabase()
        await seed_ready_quote(database)
        app = build_context(db=database)
        transport = httpx.ASGITransport(app=app)
        command = {
            "target_status": "internal_review",
            "expected_version": 1,
            "operation_id": OPERATION_ID,
            "reason": "Ready for internal review",
        }

        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            denied = await api.post(
                f"/api/admin/b2b/quotes/{QUOTE_ID}/transitions",
                headers={"X-Role": "retail_customer"},
                json=command,
            )
            assert denied.status_code == 403
            assert denied.json()["error"]["code"] == "http_403"

            first = await api.post(
                f"/api/admin/b2b/quotes/{QUOTE_ID}/transitions",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            replay = await api.post(
                f"/api/admin/b2b/quotes/{QUOTE_ID}/transitions",
                headers={"X-Role": "sales_estimator"},
                json=command,
            )
            conflict = await api.post(
                f"/api/admin/b2b/quotes/{QUOTE_ID}/transitions",
                headers={"X-Role": "sales_estimator"},
                json={**command, "reason": "A different command"},
            )

        assert first.status_code == replay.status_code == 200
        assert first.json()["version"] == replay.json()["version"] == 2
        assert conflict.status_code == 409
        body = conflict.json()
        assert body["detail"]["code"] == "operation_id_conflict"
        assert body["error"]["code"] == "operation_id_conflict"
        assert body["request_id"]

    asyncio.run(scenario())


def test_quote_openapi_declares_the_shared_error_envelope():
    schema = build_context().openapi()
    paths = schema["paths"]

    transition = paths["/api/admin/b2b/quotes/{quote_id}/transitions"]["post"][
        "responses"
    ]
    revision = paths["/api/admin/b2b/quotes/{quote_id}/versions"]["post"]["responses"]
    acceptance = paths["/api/admin/b2b/quotes/{quote_id}/acceptance"]["post"][
        "responses"
    ]

    for responses in (transition, revision, acceptance):
        for status_code in ("401", "403", "404", "409", "422", "500"):
            assert responses[status_code]["content"]["application/json"]["schema"] == {
                "$ref": "#/components/schemas/ErrorEnvelope"
            }
    assert revision["503"]["content"]["application/json"]["schema"] == {
        "$ref": "#/components/schemas/ErrorEnvelope"
    }
