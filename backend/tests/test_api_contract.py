import asyncio
import re

import httpx
from api_contract import ErrorEnvelope, error_responses, normalize_request_id

from tests.test_identity_foundation import server


async def request(method, path, **kwargs):
    transport = httpx.ASGITransport(app=server.app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport,
        base_url="https://testserver",
    ) as api:
        return await api.request(method, path, **kwargs)


def assert_error_contract(response, *, status_code, code):
    assert response.status_code == status_code
    body = response.json()
    assert set(body) == {"detail", "error", "request_id"}
    assert body["error"]["code"] == code
    assert body["error"]["message"]
    assert response.headers["x-request-id"] == body["request_id"]
    assert re.fullmatch(r"[A-Za-z0-9._:-]{1,128}", body["request_id"])
    ErrorEnvelope.model_validate(body)
    return body


def test_auth_http_error_preserves_detail_and_correlates_valid_request_id():
    response = asyncio.run(
        request(
            "GET",
            "/api/auth/me",
            headers={"X-Request-ID": "client-request.8-1"},
        )
    )

    body = assert_error_contract(response, status_code=401, code="http_401")
    assert body["detail"] == "Not authenticated"
    assert body["request_id"] == "client-request.8-1"
    assert response.headers["cache-control"] == "no-store"


def test_validation_error_is_structured_and_does_not_echo_request_values():
    sensitive_value = "must-not-be-reflected"
    response = asyncio.run(
        request(
            "POST",
            "/api/auth/login",
            headers={
                "Origin": "https://testserver",
                "X-Request-ID": "invalid request id",
            },
            json={"email": "not-an-email", "password": sensitive_value, "extra": True},
        )
    )

    body = assert_error_contract(
        response,
        status_code=422,
        code="request_validation_failed",
    )
    assert body["request_id"] != "invalid request id"
    assert body["detail"]["details"]["issues"]
    assert sensitive_value not in response.text


def test_admin_session_handler_uses_shared_envelope_and_no_store():
    response = asyncio.run(request("GET", "/api/auth/admin/session"))

    body = assert_error_contract(
        response,
        status_code=401,
        code="admin_session_expired",
    )
    assert body["detail"] == {"code": "admin_session_expired"}
    assert response.headers["cache-control"] == "no-store"


def test_request_id_normalization_rejects_unbounded_or_unsafe_values():
    assert normalize_request_id("safe.request-1") == "safe.request-1"
    assert normalize_request_id("x" * 129) != "x" * 129
    assert normalize_request_id("unsafe request") != "unsafe request"
    assert normalize_request_id(123) != "123"


def test_shared_error_response_factory_uses_one_schema():
    responses = error_responses(401, 403, 422, 503)
    assert set(responses) == {401, 403, 422, 503}
    assert {entry["model"] for entry in responses.values()} == {ErrorEnvelope}


def test_representative_openapi_routes_publish_success_and_error_models():
    schema = server.app.openapi()
    paths = schema["paths"]

    representatives = {
        ("/api/auth/me", "get"): ("SafeUserResponse", (401, 403, 500)),
        ("/api/orders", "get"): ("CustomerLegacyOrderResponse", (401, 403, 500)),
        ("/api/orders/{oid}", "get"): (
            "CustomerLegacyOrderResponse",
            (401, 403, 404, 500),
        ),
        ("/api/catalog/products", "get"): (
            "PublicCatalogPageResponse",
            (422, 500, 503),
        ),
        ("/api/admin/b2b/quotes/{quote_id}/transitions", "post"): (
            None,
            (401, 403, 404, 409, 422, 500),
        ),
    }

    for (path, method), (success_model, error_statuses) in representatives.items():
        responses = paths[path][method]["responses"]
        if success_model == "CustomerLegacyOrderResponse" and path == "/api/orders":
            success_schema = responses["200"]["content"]["application/json"]["schema"]
            assert success_schema["items"] == {
                "$ref": "#/components/schemas/CustomerLegacyOrderResponse"
            }
        elif success_model:
            success_schema = responses["200"]["content"]["application/json"]["schema"]
            assert success_schema == {"$ref": f"#/components/schemas/{success_model}"}
        for status_code in error_statuses:
            error_schema = responses[str(status_code)]["content"]["application/json"][
                "schema"
            ]
            assert error_schema == {"$ref": "#/components/schemas/ErrorEnvelope"}


def test_openapi_error_schema_keeps_compatibility_detail():
    schema = server.app.openapi()["components"]["schemas"]["ErrorEnvelope"]
    assert schema["required"] == ["detail", "error", "request_id"]
    assert set(schema["properties"]) == {"detail", "error", "request_id"}
