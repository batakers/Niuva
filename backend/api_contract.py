"""Shared HTTP error and OpenAPI contract primitives.

The legacy ``detail`` field remains intentionally present while clients move to
the stable ``error`` and ``request_id`` fields. This module owns transport
shape only; route status codes and domain semantics remain with each route.
"""

from __future__ import annotations

import re
import uuid
from typing import Any

from fastapi import Request
from pydantic import BaseModel
from starlette.responses import JSONResponse

REQUEST_ID_MAX_LENGTH = 128
REQUEST_ID_PATTERN = re.compile(r"[A-Za-z0-9._:-]+")


class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict[str, Any] | None = None


class ErrorEnvelope(BaseModel):
    detail: Any
    error: ErrorBody
    request_id: str


ERROR_RESPONSE_DESCRIPTIONS = {
    400: "Malformed or rejected business input",
    401: "Authentication required",
    403: "Permission denied",
    404: "Resource not found",
    409: "Version or command conflict",
    410: "Retained compatibility action is disabled",
    422: "Request validation failed",
    429: "Rate limit exceeded",
    500: "Unexpected safe failure",
    503: "Required dependency unavailable",
}


def error_responses(*status_codes: int) -> dict[int, dict[str, Any]]:
    """Build route-specific OpenAPI declarations using one shared schema."""

    return {
        status_code: {
            "model": ErrorEnvelope,
            "description": ERROR_RESPONSE_DESCRIPTIONS[status_code],
        }
        for status_code in status_codes
    }


def normalize_request_id(candidate: object) -> str:
    """Accept only the bounded correlation alphabet or mint a safe UUID."""

    if isinstance(candidate, str):
        value = candidate.strip()
        if (
            value
            and len(value) <= REQUEST_ID_MAX_LENGTH
            and REQUEST_ID_PATTERN.fullmatch(value)
        ):
            return value
    return str(uuid.uuid4())


def request_id_for(request: Request) -> str:
    current = getattr(request.state, "request_id", None)
    request_id = normalize_request_id(current)
    request.state.request_id = request_id
    return request_id


def error_payload(detail: Any, *, request_id: str, default_code: str) -> dict:
    if isinstance(detail, dict):
        code = str(detail.get("code") or default_code)
        message = str(detail.get("message") or code)
        details = detail.get("details")
    else:
        code = default_code
        message = str(detail)
        details = None
    return {
        "detail": detail,
        "error": {
            "code": code,
            "message": message,
            **({"details": details} if details is not None else {}),
        },
        "request_id": request_id,
    }


def error_response(
    request: Request,
    *,
    status_code: int,
    detail: Any,
    default_code: str,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    request_id = request_id_for(request)
    response_headers = dict(headers or {})
    response_headers["X-Request-ID"] = request_id
    return JSONResponse(
        status_code=status_code,
        content=error_payload(
            detail,
            request_id=request_id,
            default_code=default_code,
        ),
        headers=response_headers,
    )
