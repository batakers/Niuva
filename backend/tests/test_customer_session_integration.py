import asyncio
import os
import sys
from http.cookies import SimpleCookie
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi import HTTPException, Response

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from auth_sessions import (  # noqa: E402
    ACCESS_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    REFRESH_COOKIE,
    AuthSessionService,
)
from permissions import ROLE_POLICY_VERSION  # noqa: E402


def response_cookies(response: Response) -> dict[str, str]:
    parsed = SimpleCookie()
    for value in response.headers.getlist("set-cookie"):
        parsed.load(value)
    return {key: morsel.value for key, morsel in parsed.items()}


def refresh_request(cookies: dict[str, str]):
    return SimpleNamespace(
        cookies=cookies,
        headers={CSRF_HEADER: cookies[CSRF_COOKIE]},
    )


@pytest.mark.skipif(
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="Explicit real transaction opt-in and URL are required",
)
def test_real_mongo_customer_rotation_replay_and_logout_fallback(
    transaction_database_name,
):
    loaded_motor = sys.modules.get("motor.motor_asyncio")
    if loaded_motor is not None and getattr(loaded_motor, "__file__", None) is None:
        sys.modules.pop("motor.motor_asyncio", None)
        sys.modules.pop("motor", None)
    from motor.motor_asyncio import AsyncIOMotorClient

    client = AsyncIOMotorClient(os.environ["MONGO_TRANSACTION_TEST_URL"])
    database = client[transaction_database_name]
    service = AuthSessionService(
        db=database,
        jwt_secret="".join(["integration-", "only-", "signing-", "material"]),
        jwt_algorithm="HS256",
    )
    user = {
        "id": "customer-session-integration-user",
        "email": "customer-session-integration@example.invalid",
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
        "token_version": 0,
    }

    async def scenario():
        try:
            await database.users.insert_one(user)
            issued = Response()
            await service.issue(user, issued)
            original = response_cookies(issued)
            session_id = original[REFRESH_COOKIE].split(".", 1)[0]

            responses = [Response(), Response()]
            results = await asyncio.gather(
                service.refresh(refresh_request(original), responses[0]),
                service.refresh(refresh_request(original), responses[1]),
                return_exceptions=True,
            )
            successes = [
                result for result in results if not isinstance(result, Exception)
            ]
            failures = [result for result in results if isinstance(result, Exception)]
            assert len(successes) == 1
            assert len(failures) == 1
            assert isinstance(failures[0], HTTPException)
            assert failures[0].status_code == 401

            replayed = await database.auth_sessions.find_one(
                {"id": session_id}, {"_id": 0}
            )
            assert replayed["status"] == "revoked"
            assert replayed["revoke_reason"] == "refresh_replay"
            assert original[REFRESH_COOKIE] not in repr(replayed)

            second_issue = Response()
            await service.issue(user, second_issue)
            second = response_cookies(second_issue)
            second_session_id = second[REFRESH_COOKIE].split(".", 1)[0]
            logout_response = Response()
            await service.logout(
                SimpleNamespace(
                    cookies={
                        ACCESS_COOKIE: second[ACCESS_COOKIE],
                        REFRESH_COOKIE: "malformed-refresh",
                    },
                    headers={},
                ),
                logout_response,
            )

            logged_out = await database.auth_sessions.find_one(
                {"id": second_session_id}, {"_id": 0}
            )
            assert logged_out["status"] == "revoked"
            assert logged_out["revoke_reason"] == "logout"
            cleared = logout_response.headers.getlist("set-cookie")
            assert any(value.startswith(f"{ACCESS_COOKIE}=") for value in cleared)
            assert any(value.startswith(f"{REFRESH_COOKIE}=") for value in cleared)
            assert any(value.startswith(f"{CSRF_COOKIE}=") for value in cleared)
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
