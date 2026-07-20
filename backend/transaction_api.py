from fastapi import Request
from fastapi.responses import JSONResponse

from transaction_execution import TransactionUnavailableError


TRANSACTION_UNAVAILABLE_DETAIL = {
    "code": TransactionUnavailableError.code,
    "message": TransactionUnavailableError.message,
}


async def transaction_unavailable_handler(
    _request: Request,
    _exc: TransactionUnavailableError,
) -> JSONResponse:
    return JSONResponse(
        status_code=TransactionUnavailableError.status_code,
        content={"detail": dict(TRANSACTION_UNAVAILABLE_DETAIL)},
    )
