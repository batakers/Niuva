import asyncio

import httpx
from fastapi import FastAPI

from transaction_api import transaction_unavailable_handler
from transaction_execution import (
    TransactionCommitOutcomeUnknownError,
    TransactionUnavailableError,
)


async def request_error_response():
    app = FastAPI()
    app.add_exception_handler(
        TransactionUnavailableError,
        transaction_unavailable_handler,
    )

    @app.post("/required-mutation")
    async def required_mutation():
        error = TransactionUnavailableError()
        error.__cause__ = RuntimeError(
            "mongodb://user:secret@db.internal/?replicaSet=private"
        )
        raise error

    transport = httpx.ASGITransport(app=app, raise_app_exceptions=False)
    async with httpx.AsyncClient(
        transport=transport, base_url="http://testserver"
    ) as client:
        return await client.post(
            "/required-mutation",
            json={"customer": "private", "token": "sensitive"},
        )


def test_transaction_unavailable_response_uses_stable_existing_envelope():
    response = asyncio.run(request_error_response())
    expected_message = "Operasi sementara tidak tersedia karena transaksi "
    expected_message += "database belum siap."
    assert response.status_code == 503
    assert response.json() == {
        "detail": {
            "code": "transaction_unavailable",
            "message": expected_message,
        }
    }


def test_transaction_unavailable_response_leaks_no_internal_detail():
    response = asyncio.run(request_error_response())
    text = response.text.lower()
    for forbidden in (
        "secret",
        "db.internal",
        "replicaset",
        "private",
        "sensitive",
        "traceback",
    ):
        assert forbidden not in text


def test_unknown_commit_stays_internal_without_public_retry_mapping():
    app = FastAPI()
    app.add_exception_handler(
        TransactionUnavailableError,
        transaction_unavailable_handler,
    )
    error = TransactionCommitOutcomeUnknownError(attempts=3)

    assert TransactionCommitOutcomeUnknownError not in app.exception_handlers
    assert not isinstance(error, TransactionUnavailableError)
    assert not hasattr(error, "status_code")
    assert error.code == "transaction_commit_outcome_unknown"
    assert error.reconciliation_required is True
    assert "retry" not in str(error).lower()


def test_server_composes_one_shared_transaction_guard_and_handler():
    from tests.test_identity_foundation import server
    from transaction_guard import TransactionMutationGuard

    guard = server.app.state.transaction_guard
    handlers = server.app.exception_handlers
    expected_handler = transaction_unavailable_handler
    assert isinstance(guard, TransactionMutationGuard)
    assert handlers[TransactionUnavailableError] is expected_handler
    assert TransactionCommitOutcomeUnknownError not in handlers
