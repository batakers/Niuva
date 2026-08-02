from fastapi import Request
from starlette.responses import JSONResponse

from api_contract import error_response
from transaction_execution import TransactionUnavailableError

TRANSACTION_UNAVAILABLE_DETAIL = {
    "code": TransactionUnavailableError.code,
    "message": TransactionUnavailableError.message,
}


async def transaction_unavailable_handler(
    request: Request,
    _exc: TransactionUnavailableError,
) -> JSONResponse:
    return error_response(
        request,
        status_code=TransactionUnavailableError.status_code,
        detail=dict(TRANSACTION_UNAVAILABLE_DETAIL),
        default_code=TransactionUnavailableError.code,
    )
