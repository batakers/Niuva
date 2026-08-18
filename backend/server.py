from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import asyncio  # noqa: E402
import base64  # noqa: E402
import csv  # noqa: E402
import hashlib  # noqa: E402
import html  # noqa: E402
import io  # noqa: E402
import json  # noqa: E402
import logging  # noqa: E402
import os  # noqa: E402
import re  # noqa: E402
import secrets  # noqa: E402
import tempfile  # noqa: E402
import uuid  # noqa: E402
from contextlib import asynccontextmanager  # noqa: E402
from datetime import datetime, timedelta, timezone  # noqa: E402
from typing import List, Literal, Optional  # noqa: E402
from urllib.parse import quote, urlencode, urlsplit  # noqa: E402

import bcrypt  # noqa: E402
import emailer  # noqa: E402
import httpx  # noqa: E402
import jwt  # noqa: E402
import storage  # noqa: E402
from api_contract import (  # noqa: E402
    error_response,
    error_responses,
    normalize_request_id,
)
from audit import append_audit_event, append_identity_governance_event  # noqa: E402
from auth_password import (  # noqa: E402
    PasswordPolicyError,
    PasswordPolicyUnavailableError,
    PasswordWriteDisabledError,
    build_password_module,
)
from auth_rate_limit import LoginRateLimiter, PublicRateLimiter  # noqa: E402
from auth_recovery import (  # noqa: E402
    MongoRecoveryStore,
    PublicSiteOrigin,
    PublicSiteOriginError,
    build_recovery_module,
)
from auth_security_events import (  # noqa: E402
    AuthenticationSecurityEventService,
    EventPseudonymizer,
    MongoSecurityEventStore,
    SecurityEventDependencyError,
)
from auth_session import (  # noqa: E402
    ACCESS_COOKIE_NAME,
    SESSION_COOKIE_NAME,
    AdminSessionError,
    AdminSessionModule,
    MongoSessionStore,
    RequestVerificationError,
    SessionExpiredError,
    access_cookie_options,
    clear_cookie_options,
    session_cookie_options,
)
from auth_sessions import (  # noqa: E402
    ACCESS_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    REFRESH_COOKIE,
    AuthSessionService,
    validate_cookie_configuration,
)
from b2b_routes import build_b2b_router  # noqa: E402
from catalog_routes import build_catalog_router  # noqa: E402
from content_routes import build_content_router  # noqa: E402
from csv_safety import safe_csv_row  # noqa: E402
from dashboard_domain import (  # noqa: E402
    DashboardRangeError,
    created_within,
    date_bucket,
    distinct_count,
    resolve_date_range,
    summarize_movements,
    withheld_revenue,
)
from database_capabilities import DatabaseCapabilities  # noqa: E402
from fastapi import (  # noqa: E402
    APIRouter,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.exceptions import RequestValidationError  # noqa: E402
from identity_routes import build_identity_router  # noqa: E402
from inventory_routes import build_inventory_router  # noqa: E402
from inventory_service import InventoryService  # noqa: E402
from material_routes import build_material_router  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402
from pymongo import ReturnDocument  # noqa: E402
from pymongo.errors import DuplicateKeyError  # noqa: E402
from notification_service import NotificationError, NotificationService  # noqa: E402
from notification_worker import NotificationDeliveryWorker  # noqa: E402
from observability import Observability, route_template_for_request  # noqa: E402
from permissions import (  # noqa: E402
    CUSTOMER_ROLES,
    ROLE_LABELS,
    ROLE_POLICY_VERSION,
    canonical_roles,
    has_permission,
    is_internal,
    permissions_for,
)
from portfolio_routes import build_portfolio_router  # noqa: E402
from pydantic import (  # noqa: E402
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    TypeAdapter,
    ValidationError,
    field_validator,
)
from readiness_health import (  # noqa: E402
    TOTAL_TIMEOUT_SECONDS,
    ReadinessProbeCoordinator,
    public_schema_status,
    public_transaction_status,
)
from retail_domain import (  # noqa: E402
    project_customer_legacy_order,
    project_internal_legacy_order,
)
from retail_routes import build_retail_router  # noqa: E402
from settings_domain import (  # noqa: E402
    PUBLIC_PROFILE_FIELDS,
    default_settings,
    merge_profile,
    project_admin_settings,
    project_public_settings,
)
from starlette.middleware.cors import CORSMiddleware  # noqa: E402
from starlette.responses import JSONResponse, RedirectResponse, StreamingResponse  # noqa: E402
from transaction_api import transaction_unavailable_handler  # noqa: E402
from transaction_execution import (  # noqa: E402
    TransactionExecutor,
    TransactionUnavailableError,
)
from transaction_guard import TransactionMutationGuard  # noqa: E402
from transaction_observability import TransactionLogSink  # noqa: E402
from worker_runtime import (  # noqa: E402
    APPROVED_DRAIN_SECONDS,
    NamedJobLease,
    WorkerRuntime,
    WorkerRuntimeConfig,
    cancel_task_with_deadline,
    is_co_located_mode,
    is_worker_mode,
    renew_lease_until_stopped,
    resolve_runtime_mode,
    wait_for_stop,
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("niuva")
observability = Observability(
    environment=os.environ.get("APP_ENV", "sandbox").strip().lower()
)

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
database_name = os.environ["DB_NAME"]
db = client[database_name]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
HRD_EMAIL = os.environ.get("HRD_EMAIL", "hrd@niuva.com")
APP_NAME = os.environ.get("APP_NAME", "niuva")

MAX_FILE_SIZE = 50 * 1024 * 1024
MAX_MEDIA_FILE_SIZE = 10 * 1024 * 1024
DESIGN_EXTS = {"stl", "obj"}
IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif", "pdf"}
SAFE_FILE_CONTENT_TYPES = {
    "stl": "model/stl",
    "obj": "text/plain",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
    "gif": "image/gif",
    "pdf": "application/pdf",
}
FILE_SIGNATURE_SAMPLE_SIZE = 4 * 1024
FILE_SCOPE_PERMISSIONS = {
    "admin_media": ("media.read",),
    "order_design": ("orders.read", "design.read"),
    "payment_proof": ("payments.read",),
    "project_design": ("projects.read", "design.read"),
    "project_file": ("projects.read",),
    "production_file": ("production.read",),
    "qc_evidence": ("qc.read",),
    "fulfilment_evidence": ("fulfilment.read",),
}

# This is the public capability contract for the bounded staging candidate.
# Keep transaction, payment, production upload, and organization capabilities
# explicitly inactive until a separately approved source gate changes them.
PUBLIC_CAPABILITIES = {
    "retail_discovery": "active",
    "retail_create": "inactive",
    "legacy_order_create": "inactive",
    "checkout": "inactive",
    "payment": "inactive",
    "production_upload": "inactive",
    "organization_portal": "inactive",
}

ORDER_STATUSES = [
    "pending_estimate",
    "awaiting_payment",
    "in_process",
    "completed",
    "cancelled",
]

READINESS_PROBE_INTERVAL_SECONDS = 5
NOTIFICATION_WORKER_HEARTBEAT_INTERVAL_SECONDS = 5
NOTIFICATION_WORKER_STALE_SECONDS = 30

CUSTOMER_QUERY = {
    "$or": [
        {"roles": {"$in": ["retail_customer", "organization_customer"]}},
        {"role": "client"},
    ]
}

# Customer registration is an independently gated capability.  The source
# contract is present for review and tests, but no environment enables it by
# default.  Google remains opt-in even when registration itself is enabled.
REGISTRATION_TOKEN_TTL = timedelta(minutes=30)
OIDC_STATE_TTL = timedelta(minutes=10)
REGISTRATION_CONSENT_VERSION = "customer-account-privacy-v1"
REGISTRATION_GENERIC_MESSAGE = (
    "Jika alamat email dapat digunakan, instruksi verifikasi akan dikirim."
)
GOOGLE_ISSUER = "https://accounts.google.com"
GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GOOGLE_JWKS_ENDPOINT = "https://www.googleapis.com/oauth2/v3/certs"
GOOGLE_ALLOWED_ALGORITHMS = ("RS256",)
REGISTRATION_RETURN_PATHS = frozenset({"/dashboard", "/order", "/retail"})


@asynccontextmanager
async def lifespan(_application: FastAPI):
    await _startup_runtime()
    try:
        yield
    finally:
        await _shutdown_runtime()


app = FastAPI(title="NIUVA API", lifespan=lifespan)
app.state.observability = observability
app.state.database_capabilities = DatabaseCapabilities(transactions=False)
app.state.readiness_probe_coordinator = ReadinessProbeCoordinator(
    client,
    db,
    database_name,
)
app.state.readiness_probe_task = None
app.state.reservation_expiry_task = None
app.state.notification_worker_task = None
app.state.runtime_mode = "api"
app.state.worker_runtime_config = WorkerRuntimeConfig()
app.state.scheduler_stop_event = None
app.state.observability_metrics_task = None
app.state.worker_runtime = None
app.state.notification_worker_status = {
    "enabled": False,
    "running": False,
    "draining": False,
    "last_heartbeat_at": None,
    "last_result": None,
    "last_error_type": None,
}
app.state.schema_status = {
    "required_version": "unknown",
    "required_versions": [],
    "migrations": {},
    "applied": False,
    "indexes_ready": False,
    "missing_index_count": None,
    "retired_index_count": None,
    "inspection_complete": False,
    "ready": False,
}
app.state.transaction_executor = TransactionExecutor(
    client,
    lambda: current_database_capabilities(),
    event_sink=TransactionLogSink(
        logging.getLogger("niuva.transaction"),
        telemetry=observability,
    ),
    include_duration=True,
)
app.state.transaction_guard = TransactionMutationGuard(
    app.state.transaction_executor,
    lambda: os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").strip().lower()
    == "true",
)
app.state.password_recovery_delivery = emailer.PasswordRecoveryDelivery()
app.state.admin_session_module = None
app.state.auth_security_event_service = None
app.state.auth_security_event_status = {
    "enabled": False,
    "ready": False,
    "last_error": None,
}
app.add_exception_handler(
    TransactionUnavailableError,
    transaction_unavailable_handler,
)


def current_database_capabilities() -> DatabaseCapabilities:
    coordinator = app.state.readiness_probe_coordinator
    if isinstance(coordinator, ReadinessProbeCoordinator):
        return coordinator.current_transaction_capabilities()
    return app.state.database_capabilities


async def password_policy_error_handler(request: Request, exc):
    return error_response(
        request,
        status_code=400,
        detail={"code": exc.code},
        default_code=exc.code,
    )


async def password_policy_unavailable_handler(request: Request, exc):
    return error_response(
        request,
        status_code=503,
        detail={"code": exc.code},
        default_code=exc.code,
    )


app.add_exception_handler(PasswordPolicyError, password_policy_error_handler)
app.add_exception_handler(
    PasswordPolicyUnavailableError,
    password_policy_unavailable_handler,
)
app.add_exception_handler(
    PasswordWriteDisabledError,
    password_policy_unavailable_handler,
)


async def admin_session_error_handler(request: Request, exc):
    status_code = 403 if isinstance(exc, RequestVerificationError) else 401
    return error_response(
        request,
        status_code=status_code,
        detail={"code": exc.code},
        default_code=exc.code,
        headers={"Cache-Control": "no-store"},
    )


app.add_exception_handler(AdminSessionError, admin_session_error_handler)
api = APIRouter(prefix="/api")


@app.exception_handler(HTTPException)
async def http_error_envelope(request: Request, exc: HTTPException):
    return error_response(
        request,
        status_code=exc.status_code,
        detail=exc.detail,
        default_code=f"http_{exc.status_code}",
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_error_envelope(request: Request, exc: RequestValidationError):
    issues = [
        {
            "location": list(issue.get("loc") or []),
            "message": issue.get("msg"),
            "type": issue.get("type"),
        }
        for issue in exc.errors()
    ]
    detail = {
        "code": "request_validation_failed",
        "message": "Request tidak memenuhi schema.",
        "details": {"issues": issues},
    }
    return error_response(
        request,
        status_code=422,
        detail=detail,
        default_code="request_validation_failed",
    )


@app.exception_handler(Exception)
async def unhandled_error_envelope(request: Request, exc: Exception):
    del exc
    logger.error("unhandled_request_error")
    detail = {
        "code": "internal_server_error",
        "message": "Terjadi kesalahan internal.",
    }
    return error_response(
        request,
        status_code=500,
        detail=detail,
        default_code="internal_server_error",
    )


@app.middleware("http")
async def request_context(request: Request, call_next):
    request.state.request_id = normalize_request_id(
        request.headers.get("X-Request-ID", "")
    )
    started = datetime.now(timezone.utc)
    try:
        response = await call_next(request)
    except Exception:
        elapsed_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
        observability.record_http(
            request_id=request.state.request_id,
            route_template=route_template_for_request(request),
            method=request.method.upper(),
            status_code=500,
            duration_ms=elapsed_ms,
        )
        logger.error("request_failed")
        raise
    elapsed_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
    response.headers["X-Request-ID"] = request.state.request_id
    observability.record_http(
        request_id=request.state.request_id,
        route_template=route_template_for_request(request),
        method=request.method.upper(),
        status_code=response.status_code,
        duration_ms=elapsed_ms,
    )
    logger.info("request_complete")
    return response


CSRF_EXEMPT_PATHS = frozenset(
    {
        "/api/auth/login",
        "/api/auth/admin/login",
        "/api/auth/forgot-password",
        "/api/auth/reset-password",
        "/api/auth/reset-password/validate",
        "/api/auth/refresh",
        "/api/auth/staff-invitations/accept",
    }
)


@app.middleware("http")
async def csrf_cookie_guard(request: Request, call_next):
    if not hasattr(request.state, "request_id"):
        request.state.request_id = normalize_request_id(
            request.headers.get("X-Request-ID", "")
        )
    if (
        request.url.path.startswith("/api/")
        and request.method.upper() not in {"GET", "HEAD", "OPTIONS"}
        and request.url.path not in CSRF_EXEMPT_PATHS
        and not (
            os.environ.get("NIUVA_TEST_BEARER_AUTH", "").lower() == "true"
            and request.headers.get("Authorization", "").startswith("Bearer ")
        )
        and (request.cookies.get(ACCESS_COOKIE) or request.cookies.get(REFRESH_COOKIE))
    ):
        cookie = request.cookies.get(CSRF_COOKIE, "")
        header = request.headers.get(CSRF_HEADER, "")
        if not cookie or not header or not secrets.compare_digest(cookie, header):
            response = error_response(
                request,
                status_code=403,
                detail="CSRF validation failed",
                default_code="csrf_validation_failed",
            )
            return response
    return await call_next(request)


@app.middleware("http")
async def auth_response_cache_guard(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/auth/"):
        response.headers["Cache-Control"] = "no-store"
    return response


# ----------------------------- Auth utils -----------------------------
BCRYPT_HASH_PATTERN = re.compile(
    r"^\$2[aby]\$(?:0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$"
)
# This fixed bcrypt hash is non-secret and exists only to keep unknown or
# unusable account records on the same password-verification work path.
DUMMY_PASSWORD_HASH = "$2b$12$XkHg95jvl7fV2g.2rkFkx.kcZpo2c1C790fDECpag42ZG5NPcLCH2"


def hash_password(p: str) -> str:
    """Create legacy bcrypt fixtures; runtime writes use the password module."""

    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def is_valid_password_hash(password_hash: object) -> bool:
    return isinstance(password_hash, str) and (
        bool(BCRYPT_HASH_PATTERN.fullmatch(password_hash))
        or password_hash.startswith("$argon2id$")
    )


def _environment_flag(name: str) -> bool:
    return os.environ.get(name, "false").strip().lower() == "true"


def get_auth_security_event_service():
    if app.state.auth_security_event_service is not None:
        return app.state.auth_security_event_service
    if not _environment_flag("AUTH_SECURITY_EVENTS_ENABLED"):
        return None
    key = os.environ.get("AUTH_EVENT_HMAC_KEY", "").encode("utf-8")
    key_version = os.environ.get("AUTH_EVENT_HMAC_KEY_VERSION", "v1")
    service = AuthenticationSecurityEventService(
        store=MongoSecurityEventStore(db.authentication_security_events),
        pseudonymizer=EventPseudonymizer(key=key, key_version=key_version),
    )
    app.state.auth_security_event_status = {
        "enabled": True,
        "ready": True,
        "last_error": None,
    }
    return service


async def _emit_auth_security_event(*, required: bool = False, **event):
    try:
        service = get_auth_security_event_service()
        if service is None:
            return None
        result = await service.emit(**event)
        app.state.auth_security_event_status = {
            "enabled": True,
            "ready": True,
            "last_error": None,
        }
        return result
    except SecurityEventDependencyError:
        app.state.auth_security_event_status = {
            "enabled": _environment_flag("AUTH_SECURITY_EVENTS_ENABLED"),
            "ready": False,
            "last_error": "dependency_unavailable",
        }
        if required:
            raise
        logger.error("Authentication security-event dependency unavailable")
        return None


def get_password_module():
    configured_blocklist = os.environ.get("AUTH_PASSWORD_BLOCKLIST_PATH")
    blocklist_path = (
        str(
            Path(configured_blocklist)
            if Path(configured_blocklist).is_absolute()
            else ROOT_DIR / configured_blocklist
        )
        if configured_blocklist
        else None
    )
    return build_password_module(
        blocklist_path=blocklist_path,
        argon2_writes_enabled=_environment_flag("AUTH_ARGON2_WRITES_ENABLED"),
    )


def hash_new_password(candidate: str, context_terms=()) -> str:
    return get_password_module().hash_new_password(
        candidate,
        context_terms=context_terms,
    )


def verify_password(p: str, h: str) -> bool:
    return get_password_module().verify_password(p, h).valid


def _public_site_origin():
    value = os.environ.get("PUBLIC_SITE_URL")
    if not value:
        return None
    local_mode = os.environ.get("APP_ENV", "production").strip().lower() in {
        "development",
        "local",
        "test",
    }
    try:
        return PublicSiteOrigin.parse(value, local_mode=local_mode)
    except PublicSiteOriginError:
        logger.error("Password recovery origin configuration is invalid")
        return None


def get_recovery_module():
    event_service = get_auth_security_event_service()

    async def write_completion_event(user, _completed_at, session):
        if event_service is None:
            return
        await event_service.emit(
            event_type="auth.reset_completed",
            outcome="success",
            reason_code="reset_completed",
            subject_kind="known_user",
            known_subject_id=user["id"],
            surface="recovery",
            session=session,
        )

    return build_recovery_module(
        store=MongoRecoveryStore(db),
        transaction_guard=app.state.transaction_guard,
        passwords=get_password_module(),
        delivery=app.state.password_recovery_delivery,
        public_site_origin=_public_site_origin(),
        completion_event_writer=(
            write_completion_event if event_service is not None else None
        ),
    )


def create_token(user_id: str, email: str, role: str, token_version: int = 0) -> str:
    """Issue a current-policy bearer fixture only in the isolated test runtime."""
    if os.environ.get("NIUVA_TEST_BEARER_AUTH", "").lower() != "true":
        raise RuntimeError("Bearer credential issuance is disabled")
    return AuthSessionService(
        db=db,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGO,
    ).encode_test_access(user_id, token_version)


async def get_user_from_token(token: str) -> dict:
    return await AuthSessionService(
        db=db,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGO,
    ).authenticate(
        token,
        allow_test_token=(
            os.environ.get("NIUVA_TEST_BEARER_AUTH", "").lower() == "true"
        ),
    )


def get_admin_session_module():
    if app.state.admin_session_module is not None:
        return app.state.admin_session_module
    csrf_key = os.environ.get("AUTH_SESSION_CSRF_KEY", "").encode("utf-8")
    if len(csrf_key) < 32:
        raise HTTPException(
            status_code=503,
            detail={"code": "admin_session_unavailable"},
        )

    async def current_token_version(user_id, session):
        user = await db.users.find_one(
            {"id": user_id}, {"_id": 0, "token_version": 1}, session=session
        )
        return user.get("token_version", 0) if user else None

    event_service = get_auth_security_event_service()

    async def write_login_event(user, document, session):
        if event_service is None:
            return
        await event_service.emit(
            event_type="auth.login_succeeded",
            outcome="success",
            reason_code="credentials_verified",
            subject_kind="known_user",
            known_subject_id=user["id"],
            surface="admin",
            session_ref=document["id"],
            session=session,
        )

    async def write_revocation_event(session_ref, reason):
        await _emit_auth_security_event(
            event_type=(
                "auth.session_replay_detected"
                if reason == "session_secret_replay"
                else "auth.session_revoked"
            ),
            outcome=("blocked" if reason == "session_secret_replay" else "success"),
            reason_code=(
                "session_replay"
                if reason == "session_secret_replay"
                else "session_revoked"
            ),
            subject_kind="system",
            surface="admin",
            session_ref=session_ref,
        )

    return AdminSessionModule(
        store=MongoSessionStore(db),
        transaction_guard=app.state.transaction_guard,
        csrf_key=csrf_key,
        user_version_provider=current_token_version,
        event_writer=write_login_event if event_service is not None else None,
        revocation_event_writer=write_revocation_event,
    )


def _approved_request_origin() -> str:
    origin = _public_site_origin()
    if origin is None:
        raise RequestVerificationError()
    return origin.value


def _request_origin(request: Request) -> str | None:
    candidate = request.headers.get("origin")
    if candidate:
        return candidate.rstrip("/")
    referer = request.headers.get("referer")
    if not referer:
        return None
    parsed = urlsplit(referer)
    if not parsed.scheme or not parsed.netloc:
        return None
    return f"{parsed.scheme}://{parsed.netloc}"


def verify_auth_origin(request: Request) -> None:
    if not secrets.compare_digest(
        _request_origin(request) or "invalid",
        _approved_request_origin(),
    ):
        raise RequestVerificationError()


def verify_admin_origin(request: Request) -> None:
    verify_auth_origin(request)


async def get_admin_user(request: Request, *, verify_csrf: bool = True) -> dict:
    access_secret = request.cookies.get(ACCESS_COOKIE_NAME)
    if not access_secret:
        raise SessionExpiredError()
    context = {"access_secret": access_secret}
    if verify_csrf and request.method.upper() not in {"GET", "HEAD", "OPTIONS"}:
        verify_admin_origin(request)
        context["csrf_token"] = request.headers.get("x-csrf-token")
    session = await get_admin_session_module().authenticate_admin_session(context)
    user = await db.users.find_one(
        {"id": session.user_id}, {"_id": 0, "password_hash": 0}
    )
    if (
        not user
        or user.get("status", "active") == "disabled"
        or user.get("access_state", "approved") != "approved"
        or not has_permission(user, "admin.access")
    ):
        await get_admin_session_module().revoke_admin_session(
            session,
            "user_ineligible",
        )
        raise SessionExpiredError()
    request.state.admin_session = session
    return user


async def get_current_user(request: Request) -> dict:
    test_bearer_enabled = os.environ.get("NIUVA_TEST_BEARER_AUTH", "").lower() == "true"
    if test_bearer_enabled:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            user = await get_user_from_token(auth_header[7:])
            if has_permission(user, "admin.access"):
                raise SessionExpiredError()
            return user
    customer_access = request.cookies.get(ACCESS_COOKIE)
    if customer_access:
        return await get_user_from_token(customer_access)
    if request.cookies.get(ACCESS_COOKIE_NAME):
        return await get_admin_user(request)
    raise HTTPException(status_code=401, detail="Not authenticated")


def require_permission(permission: str):
    async def dependency(user: dict = Depends(get_current_user)) -> dict:
        if not has_permission(user, permission):
            raise HTTPException(
                status_code=403,
                detail="Forbidden",
            )
        return user

    return dependency


require_admin = require_permission("admin.access")


# ----------------------------- Models -----------------------------
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


class SafeUserResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    name: str
    email: str
    phone: str
    company: str
    status: str
    access_state: str
    role_policy_version: str | None = None
    role: str
    roles: list[str]
    role_labels: list[str]
    permissions: list[str]
    version: int
    created_at: str | datetime | None = None


class CapabilityResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    retail_discovery: Literal["active"]
    retail_create: Literal["inactive"]
    legacy_order_create: Literal["inactive"]
    checkout: Literal["inactive"]
    payment: Literal["inactive"]
    production_upload: Literal["inactive"]
    organization_portal: Literal["inactive"]


class LoginResponse(BaseModel):
    user: SafeUserResponse


class AdminSessionResponse(LoginResponse):
    csrf_token: str
    access_expires_at: str
    idle_expires_at: str
    absolute_expires_at: str


class CustomerOrderFileResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    original_filename: str | None = None
    content_type: str | None = None
    size: int | None = None


class CustomerOrderEstimateResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    amount: int | float | None = None
    currency: str | None = None
    estimated_at: str | datetime | None = None


class CustomerOrderPaymentResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    verified: bool | None = None
    uploaded_at: str | datetime | None = None
    verified_at: str | datetime | None = None
    proof_recorded: bool | None = None
    proof: CustomerOrderFileResponse | None = None


class CustomerOrderStatusEventResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str
    at: str | datetime | None = None


class CustomerLegacyOrderResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    order_number: str | None = None
    material_name: str | None = None
    status: str | None = None
    created_at: str | datetime | None = None
    updated_at: str | datetime | None = None
    record_class: str
    canonical_status_equivalent: str | None = None
    creation_enabled: bool
    mutations_enabled: bool
    file: CustomerOrderFileResponse | None = None
    estimate: CustomerOrderEstimateResponse | None = None
    payment: CustomerOrderPaymentResponse | None = None
    status_history: list[CustomerOrderStatusEventResponse]


class ClientProvisionReq(StrictModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    phone: Optional[str] = None
    company: Optional[str] = None


class CustomerStatusReq(StrictModel):
    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)


class LoginReq(StrictModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=256)


class CustomerRegistrationReq(StrictModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    privacy_consent: Literal[True]
    return_to: str = Field(default="/dashboard", max_length=200)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        candidate = value.strip()
        if len(candidate) < 2 or any(
            ord(character) < 32 or ord(character) == 127 for character in candidate
        ):
            raise ValueError("name_invalid")
        return candidate


class RegistrationTokenReq(StrictModel):
    token: str = Field(min_length=43, max_length=256)


class RegistrationResendReq(StrictModel):
    email: EmailStr


class GoogleStartReq(StrictModel):
    mode: Literal["login", "register", "link"] = "login"
    return_to: str = Field(default="/dashboard", max_length=200)
    privacy_consent: bool = False


class AdminLoginReq(LoginReq):
    remember_me: bool = False


class ForgotPasswordReq(StrictModel):
    email: EmailStr


class ResetPasswordReq(StrictModel):
    token: str = Field(min_length=1, max_length=1024)
    new_password: str = Field(min_length=1, max_length=128)


class ValidatePasswordResetReq(StrictModel):
    token: str = Field(min_length=1, max_length=1024)


class EstimateReq(StrictModel):
    amount: float
    note: Optional[str] = ""


class StatusReq(StrictModel):
    status: str
    note: Optional[str] = ""


class BulkStatusReq(StrictModel):
    order_ids: List[str] = Field(min_length=1, max_length=100)
    status: str
    note: Optional[str] = ""


class ContactReq(StrictModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=10, max_length=5000)


class AdminNotificationReq(StrictModel):
    target: str = Field(pattern="^(user|segment|broadcast)$")
    user_id: Optional[str] = None
    segment: Optional[str] = Field(default=None, pattern="^(active_orders)$")
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=3, max_length=2000)


class SettingsReq(StrictModel):
    """Company profile only.

    extra="forbid" keeps a caller from writing anything the public projection
    does not name, including reintroducing bank details through this door.
    """

    model_config = ConfigDict(extra="forbid")

    expected_version: int = Field(ge=1)
    reason: str = Field(min_length=3, max_length=500)
    legal_name: str = Field(min_length=2, max_length=200)
    tagline: str = Field(default="", max_length=300)
    address: str = Field(default="", max_length=500)
    email: str = Field(default="", max_length=200)
    phone: str = Field(default="", max_length=50)
    whatsapp: str = Field(default="", max_length=50)
    maps_url: str = Field(default="", max_length=500)
    instagram_url: str = Field(default="", max_length=500)
    linkedin_url: str = Field(default="", max_length=500)

    @field_validator("email")
    @classmethod
    def validate_optional_email(cls, value: str) -> str:
        candidate = value.strip()
        if not candidate:
            return ""
        try:
            return str(TypeAdapter(EmailStr).validate_python(candidate))
        except ValidationError as exc:
            raise ValueError("email must be a valid address") from exc

    @field_validator("maps_url", "instagram_url", "linkedin_url")
    @classmethod
    def validate_optional_public_url(cls, value: str) -> str:
        candidate = value.strip()
        if not candidate:
            return ""
        parsed = urlsplit(candidate)
        if (
            parsed.scheme != "https"
            or not parsed.hostname
            or parsed.username
            or parsed.password
        ):
            raise ValueError("public URL must be credential-free HTTPS")
        return candidate


# ----------------------------- Helpers -----------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_user(user: dict) -> dict:
    roles = canonical_roles(user)
    return {
        "id": user["id"],
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "phone": user.get("phone", ""),
        "company": user.get("company", ""),
        "status": user.get("status", "active"),
        "access_state": user.get("access_state", "approved"),
        "role_policy_version": user.get("role_policy_version"),
        "role": roles[0] if roles else "",
        "roles": list(roles),
        "role_labels": [ROLE_LABELS[role] for role in roles],
        "permissions": sorted(permissions_for(user)),
        "version": user.get("version", 1),
        "created_at": user.get("created_at"),
    }


def _set_admin_cookies(response: Response, grant) -> None:
    response.set_cookie(
        ACCESS_COOKIE_NAME,
        grant.access_secret,
        **access_cookie_options(),
    )
    response.set_cookie(
        SESSION_COOKIE_NAME,
        grant.session_secret,
        **session_cookie_options(grant.remember_me),
    )


def _clear_admin_cookies(response: Response) -> None:
    options = clear_cookie_options()
    response.delete_cookie(ACCESS_COOKIE_NAME, **options)
    response.delete_cookie(SESSION_COOKIE_NAME, **options)


def _admin_session_response(user: dict, grant) -> JSONResponse:
    response = JSONResponse(
        {
            "user": safe_user(user),
            "csrf_token": grant.csrf_token,
            "access_expires_at": grant.access_expires_at.isoformat(),
            "idle_expires_at": grant.idle_expires_at.isoformat(),
            "absolute_expires_at": grant.absolute_expires_at.isoformat(),
        },
        headers={"Cache-Control": "no-store"},
    )
    _set_admin_cookies(response, grant)
    return response


async def authenticate_credentials(req: LoginReq, *, surface: str) -> dict:
    user = await db.users.find_one({"email": req.email.lower()})
    stored_hash = user.get("password_hash") if user else None
    valid_stored_hash = is_valid_password_hash(stored_hash)
    verification_hash = stored_hash if valid_stored_hash else DUMMY_PASSWORD_HASH
    password_valid = verify_password(req.password, verification_hash)

    explicitly_blocked = bool(
        user
        and (
            user.get("status") == "disabled"
            or user.get("access_state") == "access_review_required"
        )
    )
    eligible_roles = canonical_roles(user) if user else ()
    account_ready = bool(
        user
        and user.get("status", "active") == "active"
        and user.get("access_state", "approved") == "approved"
    )
    correct_surface = bool(
        user
        and (
            (surface == "customer" and set(eligible_roles) <= CUSTOMER_ROLES)
            or (surface == "staff" and is_internal(user))
        )
    )
    if (
        not user
        or not valid_stored_hash
        or not password_valid
        or explicitly_blocked
        or not eligible_roles
        or not correct_surface
        or not account_ready
        or user.get("role_policy_version") != ROLE_POLICY_VERSION
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if (
        user.get("status", "active") == "disabled"
        or user.get("access_state", "approved") == "access_review_required"
    ):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user


async def provision_client(req: ClientProvisionReq) -> dict:
    email = req.email.lower()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "id": str(uuid.uuid4()),
        "name": req.name,
        "email": email,
        "password_hash": hash_new_password(
            req.password,
            context_terms=(email, req.name),
        ),
        "phone": req.phone or "",
        "company": req.company or "",
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
        "token_version": 0,
        "version": 1,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return safe_user(user)


async def rate_limit(
    key: str,
    limit: int = 10,
    window: int = 60,
    detail: str = "Terlalu banyak permintaan. Coba lagi sesaat.",
):
    await PublicRateLimiter(
        collection=db.public_rate_limits,
        secret=JWT_SECRET,
    ).consume(
        scope=key.split(":", 1)[0],
        identifier=key,
        limit=limit,
        window_seconds=window,
        detail=detail,
    )


async def rate_limit_cooldown(
    scope: str,
    identifier: str,
    cooldown_seconds: int,
    detail: str = "Terlalu banyak permintaan. Coba lagi sesaat.",
):
    await PublicRateLimiter(
        collection=db.public_rate_limits,
        secret=JWT_SECRET,
    ).consume_cooldown(
        scope=scope,
        identifier=identifier,
        cooldown_seconds=cooldown_seconds,
        detail=detail,
    )


def client_ip(request: Request) -> str:
    """Resolve the caller address used to key public rate limits."""
    return request.client.host if request.client else "unknown"


def safe_file_content_type(path: str) -> str:
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    return SAFE_FILE_CONTENT_TYPES.get(ext, "application/octet-stream")


def safe_original_filename(value: object) -> str:
    supplied = value if isinstance(value, str) else "upload.bin"
    candidate = supplied.replace("\\", "/").rsplit("/", 1)[-1]
    candidate = "".join(
        character
        for character in candidate
        if ord(character) >= 32 and character != "\x7f"
    ).strip()
    return candidate[:255] or "upload.bin"


def validate_file_signature(data: bytes, extension: str, size: int) -> bool:
    """Validate the bounded file prefix against the server-selected type."""

    extension = extension.lower()
    if extension == "png":
        return data.startswith(b"\x89PNG\r\n\x1a\n")
    if extension in {"jpg", "jpeg"}:
        return data.startswith(b"\xff\xd8\xff")
    if extension == "webp":
        return len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP"
    if extension == "gif":
        return data.startswith((b"GIF87a", b"GIF89a"))
    if extension == "pdf":
        return data.startswith(b"%PDF-")
    if extension == "stl":
        stripped = data.lstrip()
        if stripped.lower().startswith(b"solid"):
            lowered = stripped.lower()
            return b"\nfacet" in lowered or b"\nendsolid" in lowered
        if len(data) < 84:
            return False
        triangle_count = int.from_bytes(data[80:84], "little")
        return size == 84 + triangle_count * 50
    if extension == "obj":
        try:
            prefix = data.decode("utf-8")
        except UnicodeDecodeError as exc:
            if exc.reason != "unexpected end of data" or exc.end != len(data):
                return False
            prefix = data[: exc.start].decode("utf-8")
        directives = ("v ", "vn ", "vt ", "f ", "o ", "g ", "s ", "mtllib ")
        return any(
            line.lstrip().startswith(directives)
            for line in prefix.splitlines()
            if line.strip()
        )
    return False


def validate_image_signature(data: bytes, extension: str) -> bool:
    """Compatibility wrapper for existing image-only callers and tests."""

    return validate_file_signature(data, extension, len(data))


async def store_upload(
    file: UploadFile,
    prefix: str,
    allowed_exts: set,
    *,
    max_size: int = MAX_FILE_SIZE,
    require_image_signature: bool = False,
    require_content_signature: bool = False,
) -> dict:
    if isinstance(max_size, bool) or not isinstance(max_size, int) or max_size < 1:
        raise HTTPException(status_code=500, detail="Invalid upload size policy")
    original_filename = safe_original_filename(file.filename)
    ext = (
        original_filename.rsplit(".", 1)[-1] if "." in original_filename else "bin"
    ).lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")
    spool = tempfile.SpooledTemporaryFile(max_size=min(max_size, 1024 * 1024))
    try:
        size = 0
        signature = b""
        while True:
            chunk = await file.read(64 * 1024)
            if not chunk:
                break
            size += len(chunk)
            if size > max_size:
                raise HTTPException(status_code=400, detail="File exceeds size limit")
            if len(signature) < FILE_SIGNATURE_SAMPLE_SIZE:
                signature = (signature + chunk)[:FILE_SIGNATURE_SAMPLE_SIZE]
            spool.write(chunk)
        if size == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        if (
            require_image_signature or require_content_signature
        ) and not validate_file_signature(signature, ext, size):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "file_signature_invalid",
                    "message": "Isi file tidak sesuai dengan format yang diizinkan.",
                },
            )
        path = f"{APP_NAME}/{prefix}/{uuid.uuid4()}.{ext}"
        content_type = safe_file_content_type(path)
        spool.seek(0)
        result = storage.put_file_object(path, spool, size, content_type)
    except storage.InvalidStoragePathError as exc:
        logger.warning("Rejected generated storage path")
        raise HTTPException(
            status_code=400, detail="Invalid file storage path"
        ) from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail="File storage unavailable") from exc
    except storage.StorageError as exc:
        logger.error("storage_upload_failed")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    finally:
        spool.close()
    return {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": original_filename,
        "content_type": content_type,
        "size": result.get("size", size),
    }


# ----------------------------- Auth routes -----------------------------
def _registration_enabled() -> bool:
    return _environment_flag("CUSTOMER_REGISTRATION_ENABLED")


def _require_registration_gate(request: Request) -> None:
    """Preserve the legacy disabled response before parsing registration input."""
    # The flag is intentionally absent from existing deployments until the
    # separately gated activation step. Keep the historical 403 in that case;
    # an explicit false flag is the new fail-closed 503 state.
    if "CUSTOMER_REGISTRATION_ENABLED" not in os.environ:
        raise HTTPException(
            status_code=403,
            detail="Public registration is disabled. Client accounts must be provisioned by an administrator.",
        )
    verify_auth_origin(request)
    if not _registration_enabled() or _public_site_origin() is None:
        raise _registration_unavailable()


def _google_oidc_config() -> dict[str, str] | None:
    if not _environment_flag("CUSTOMER_GOOGLE_OIDC_ENABLED"):
        return None
    values = {
        "client_id": os.environ.get("GOOGLE_OIDC_CLIENT_ID", "").strip(),
        "client_secret": os.environ.get("GOOGLE_OIDC_CLIENT_SECRET", "").strip(),
        "redirect_uri": os.environ.get("GOOGLE_OIDC_REDIRECT_URI", "").strip(),
    }
    if not all(values.values()):
        return None
    parsed = urlsplit(values["redirect_uri"])
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
    ):
        return None
    return values


def _safe_registration_return(value: object) -> str:
    candidate = value if isinstance(value, str) else "/dashboard"
    parsed = urlsplit(candidate)
    if (
        parsed.scheme
        or parsed.netloc
        or not parsed.path.startswith("/")
        or parsed.path.startswith("//")
    ):
        return "/dashboard"
    # Only the allowlisted path is carried across auth. Query and fragment
    # values are deliberately discarded so caller-controlled parameters cannot
    # become a second redirect or state channel.
    path = parsed.path
    if path in REGISTRATION_RETURN_PATHS:
        return path
    if re.fullmatch(r"/orders/[^/?#]+", path):
        return path
    if re.fullmatch(r"/retail/products/[^/?#]+", path):
        return path
    return "/dashboard"


def _opaque_secret_hash(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _pkce_challenge(verifier: str) -> str:
    return base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode("ascii")).digest()
    ).rstrip(b"=").decode("ascii")


def _registration_unavailable(code: str = "registration_unavailable") -> HTTPException:
    return HTTPException(
        status_code=503,
        detail={
            "code": code,
            "message": "Registrasi belum tersedia. Coba lagi nanti.",
        },
    )


def _registration_verification_url(raw_token: str) -> str | None:
    origin = _public_site_origin()
    if origin is None:
        return None
    return f"{origin.value}/register/verify?{urlencode({'token': raw_token})}"


def _registration_token_document(
    *, user_id: str, raw_token: str, now: datetime, return_to: str
) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "token_hash": _opaque_secret_hash(raw_token),
        "active": True,
        "purpose": "customer_registration",
        "return_to": return_to,
        "created_at": now,
        "expires_at": now + REGISTRATION_TOKEN_TTL,
        "used_at": None,
        "invalidated_at": None,
    }


async def _deactivate_registration_token(token_id: str, reason: str) -> None:
    try:
        async def deactivate(session):
            await db.customer_registration_tokens.update_one(
                {"id": token_id, "active": True},
                {
                    "$set": {
                        "active": False,
                        "invalidated_at": datetime.now(timezone.utc),
                        "invalidation_reason": reason,
                    }
                },
                session=session,
            )

        await app.state.transaction_guard.run(
            deactivate,
            operation_name="auth.customer_registration.invalidate_token",
            retry_safe=True,
        )
    except Exception:
        logger.error("customer_registration_token_invalidation_failed")


async def _send_registration_verification(
    *, email: str, name: str, raw_token: str, token_id: str
) -> None:
    verification_url = _registration_verification_url(raw_token)
    if verification_url is None:
        raise _registration_unavailable()
    safe_name = html.escape(name, quote=True)
    safe_url = html.escape(verification_url, quote=True)
    result = await emailer.send_email(
        email,
        "Verifikasi akun NIUVA",
        "Verifikasi akun pelanggan",
        (
            f"<p>Halo {safe_name},</p>"
            "<p>Gunakan link berikut untuk memverifikasi akun pelanggan NIUVA:</p>"
            f'<p><a href="{safe_url}">{safe_url}</a></p>'
            "<p>Link ini berlaku selama 30 menit dan hanya dapat digunakan sekali.</p>"
        ),
        idempotency_key=f"customer-registration:{token_id}",
    )
    if not isinstance(result, dict) or result.get("status") == "error":
        raise _registration_unavailable("registration_email_unavailable")


async def _issue_customer_registration(
    req: CustomerRegistrationReq,
) -> tuple[dict, str | None, str | None]:
    email = str(req.email).strip().lower()
    now = datetime.now(timezone.utc)
    raw_token = secrets.token_urlsafe(32)
    return_to = _safe_registration_return(req.return_to)

    async def create(session):
        existing = await db.users.find_one({"email": email}, {"_id": 0}, session=session)
        if existing:
            account_verified = bool(
                existing.get("email_verified_at")
                or (
                    existing.get("status") == "active"
                    and existing.get("access_state") == "approved"
                )
            )
            if account_verified:
                return {"status": "existing"}, None, None
            if not existing.get("password_hash"):
                return {"status": "existing"}, None, None
            await db.customer_registration_tokens.update_many(
                {"user_id": existing["id"], "active": True},
                {
                    "$set": {
                        "active": False,
                        "invalidated_at": now,
                        "invalidation_reason": "superseded",
                    }
                },
                session=session,
            )
            token = _registration_token_document(
                user_id=existing["id"],
                raw_token=raw_token,
                now=now,
                return_to=return_to,
            )
            await db.customer_registration_tokens.insert_one(token, session=session)
            return {"status": "pending"}, raw_token, token["id"]

        password_hash = hash_new_password(
            req.password,
            context_terms=(email, req.name),
        )
        user = {
            "id": str(uuid.uuid4()),
            "name": req.name,
            "email": email,
            "password_hash": password_hash,
            "phone": "",
            "company": "",
            "roles": ["retail_customer"],
            "status": "pending_verification",
            "access_state": "verification_pending",
            "email_verified_at": None,
            "registration_source": "email",
            "consent_version": REGISTRATION_CONSENT_VERSION,
            "consented_at": now,
            "role_policy_version": ROLE_POLICY_VERSION,
            "token_version": 0,
            "version": 1,
            "created_at": now_iso(),
        }
        await db.users.insert_one(user, session=session)
        token = _registration_token_document(
            user_id=user["id"],
            raw_token=raw_token,
            now=now,
            return_to=return_to,
        )
        await db.customer_registration_tokens.insert_one(token, session=session)
        return {"status": "pending"}, raw_token, token["id"]

    try:
        return await app.state.transaction_guard.run(
            create,
            operation_name="auth.customer_registration.create",
        )
    except DuplicateKeyError:
        # A concurrent request may win the existing users.email unique index.
        # Keep the response indistinguishable from an already-known address.
        return {"status": "existing"}, None, None


async def _resend_customer_registration(email: str) -> tuple[str | None, str | None, str | None]:
    normalized = email.strip().lower()
    now = datetime.now(timezone.utc)
    raw_token = secrets.token_urlsafe(32)

    async def resend(session):
        user = await db.users.find_one(
            {
                "email": normalized,
                "status": "pending_verification",
                "access_state": "verification_pending",
            },
            {"_id": 0},
            session=session,
        )
        if not user or not user.get("password_hash"):
            return None, None, None
        await db.customer_registration_tokens.update_many(
            {"user_id": user["id"], "active": True},
            {
                "$set": {
                    "active": False,
                    "invalidated_at": now,
                    "invalidation_reason": "superseded",
                }
            },
            session=session,
        )
        token = _registration_token_document(
            user_id=user["id"],
            raw_token=raw_token,
            now=now,
            return_to="/dashboard",
        )
        await db.customer_registration_tokens.insert_one(token, session=session)
        return user["name"], raw_token, token["id"]

    try:
        return await app.state.transaction_guard.run(
            resend,
            operation_name="auth.customer_registration.resend",
        )
    except DuplicateKeyError:
        return None, None, None


async def _verify_customer_registration(raw_token: str) -> dict | None:
    token_hash = _opaque_secret_hash(raw_token)
    now = datetime.now(timezone.utc)

    async def verify(session):
        token = await db.customer_registration_tokens.find_one(
            {
                "token_hash": token_hash,
                "purpose": "customer_registration",
                "active": True,
                "expires_at": {"$gt": now},
            },
            {"_id": 0},
            session=session,
        )
        if not token:
            return None
        user = await db.users.find_one({"id": token["user_id"]}, {"_id": 0}, session=session)
        if not user or not user.get("password_hash"):
            return None
        consumed = await db.customer_registration_tokens.update_one(
            {"id": token["id"], "active": True},
            {"$set": {"active": False, "used_at": now}},
            session=session,
        )
        if not getattr(consumed, "matched_count", 0):
            return None
        if user.get("email_verified_at"):
            return user
        updated = await db.users.update_one(
            {"id": user["id"], "status": "pending_verification"},
            {
                "$set": {
                    "status": "active",
                    "access_state": "approved",
                    "email_verified_at": now,
                    "verified_at": now,
                },
                "$inc": {"version": 1},
            },
            session=session,
        )
        if not getattr(updated, "matched_count", 0):
            return None
        user.update(
            {
                "status": "active",
                "access_state": "approved",
                "email_verified_at": now,
                "verified_at": now,
            }
        )
        return user

    return await app.state.transaction_guard.run(
        verify,
        operation_name="auth.customer_registration.verify",
        retry_safe=True,
    )


def _google_redirect(path: str, code: str) -> RedirectResponse:
    separator = "&" if "?" in path else "?"
    target = f"{path}{separator}{urlencode({'auth': code})}"
    return RedirectResponse(target, status_code=303)


def _google_failure_redirect(state: dict | None, code: str) -> RedirectResponse:
    """Return provider failures to the owning auth surface with safe context."""
    state = state or {}
    entry = "/register" if state.get("intent") == "register" else "/login"
    return_to = _safe_registration_return(state.get("return_to"))
    return _google_redirect(
        f"{entry}?{urlencode({'return_to': return_to})}",
        code,
    )


async def _consume_google_state(raw_state: str) -> dict | None:
    now = datetime.now(timezone.utc)
    return await db.auth_oidc_states.find_one_and_update(
        {
            "state_hash": _opaque_secret_hash(raw_state),
            "expires_at": {"$gt": now},
            "$or": [{"consumed_at": None}, {"consumed_at": {"$exists": False}}],
        },
        {"$set": {"consumed_at": now}},
        projection={"_id": 0},
        return_document=ReturnDocument.AFTER,
    )


async def _exchange_google_code(config: dict[str, str], code: str, state: dict) -> dict:
    async with httpx.AsyncClient(timeout=5.0) as client_session:
        response = await client_session.post(
            GOOGLE_TOKEN_ENDPOINT,
            data={
                "code": code,
                "client_id": config["client_id"],
                "client_secret": config["client_secret"],
                "redirect_uri": config["redirect_uri"],
                "grant_type": "authorization_code",
                "code_verifier": state["code_verifier"],
            },
        )
        if response.status_code != 200:
            raise ValueError("google_token_exchange_failed")
        payload = response.json()
        id_token = payload.get("id_token") if isinstance(payload, dict) else None
        if not isinstance(id_token, str) or not id_token:
            raise ValueError("google_id_token_missing")
        jwks_response = await client_session.get(GOOGLE_JWKS_ENDPOINT)
        if jwks_response.status_code != 200:
            raise ValueError("google_jwks_unavailable")
        jwks = jwks_response.json()

    header = jwt.get_unverified_header(id_token)
    if header.get("alg") not in GOOGLE_ALLOWED_ALGORITHMS:
        raise ValueError("google_algorithm_not_allowed")
    key = next(
        (
            item
            for item in jwks.get("keys", [])
            if item.get("kid") == header.get("kid") and item.get("alg") == header.get("alg")
        ),
        None,
    )
    if not key:
        raise ValueError("google_signing_key_missing")
    signing_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
    claims = jwt.decode(
        id_token,
        signing_key,
        algorithms=list(GOOGLE_ALLOWED_ALGORITHMS),
        audience=config["client_id"],
        issuer=GOOGLE_ISSUER,
        options={"require": ["iss", "aud", "sub", "exp", "nonce", "email"]},
    )
    if claims.get("nonce") != state.get("nonce"):
        raise ValueError("google_nonce_invalid")
    if claims.get("email_verified") is not True:
        raise ValueError("google_email_unverified")
    return claims


async def _resolve_google_identity(claims: dict, state: dict) -> tuple[dict | None, str | None]:
    subject = claims.get("sub")
    email = claims.get("email")
    if (
        not isinstance(subject, str)
        or not subject
        or len(subject) > 256
        or not isinstance(email, str)
        or not email
    ):
        return None, "google_identity_invalid"
    normalized_email = email.strip().lower()
    now = datetime.now(timezone.utc)
    intent = state.get("intent")

    async def mutate(session):
        identity = await db.auth_identities.find_one(
            {"provider": "google", "subject": subject},
            {"_id": 0},
            session=session,
        )
        identity_user = None
        if identity:
            identity_user = await db.users.find_one(
                {"id": identity.get("user_id")}, {"_id": 0}, session=session
            )
            if not identity_user:
                return None, "google_identity_unavailable"

        if intent == "link":
            target = await db.users.find_one(
                {"id": state.get("user_id")}, {"_id": 0}, session=session
            )
            if not target or target.get("status") != "active":
                return None, "session_expired"
            if identity_user and identity_user.get("id") != target.get("id"):
                return None, "google_link_required"
            if not identity_user:
                other = await db.users.find_one(
                    {"email": normalized_email}, {"_id": 0}, session=session
                )
                if other and other.get("id") != target.get("id"):
                    return None, "google_link_required"
                await db.auth_identities.insert_one(
                    {
                        "id": str(uuid.uuid4()),
                        "provider": "google",
                        "subject": subject,
                        "user_id": target["id"],
                        "email_at_link": normalized_email,
                        "created_at": now,
                        "linked_at": now,
                    },
                    session=session,
                )
            return target, None

        if identity_user:
            if identity_user.get("status") != "active" or identity_user.get("access_state") != "approved":
                return None, "account_ineligible"
            return identity_user, None

        existing_email_user = await db.users.find_one(
            {"email": normalized_email}, {"_id": 0}, session=session
        )
        if existing_email_user:
            # A verified email is not proof that two Niuva identities should be
            # merged.  The authenticated linking flow is the only bridge.
            return None, "google_link_required"
        if intent == "login":
            return None, "google_registration_required"
        if intent != "register" or state.get("privacy_consent") is not True:
            return None, "google_consent_required"

        raw_name = claims.get("name")
        name = raw_name.strip() if isinstance(raw_name, str) else ""
        if len(name) < 2 or len(name) > 120:
            name = normalized_email.split("@", 1)[0][:120] or "Niuva Customer"
        user = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": normalized_email,
            "phone": "",
            "company": "",
            "roles": ["retail_customer"],
            "status": "active",
            "access_state": "approved",
            "email_verified_at": now,
            "registration_source": "google",
            "consent_version": REGISTRATION_CONSENT_VERSION,
            "consented_at": now,
            "role_policy_version": ROLE_POLICY_VERSION,
            "token_version": 0,
            "version": 1,
            "created_at": now_iso(),
        }
        await db.users.insert_one(user, session=session)
        await db.auth_identities.insert_one(
            {
                "id": str(uuid.uuid4()),
                "provider": "google",
                "subject": subject,
                "user_id": user["id"],
                "email_at_link": normalized_email,
                "created_at": now,
                "linked_at": now,
            },
            session=session,
        )
        return user, None

    try:
        return await app.state.transaction_guard.run(
            mutate,
            operation_name="auth.customer_registration.google_identity",
        )
    except DuplicateKeyError:
        return None, "google_link_required"


@api.post("/auth/register", responses=error_responses(400, 403, 422, 429, 500, 503))
async def register(
    req: CustomerRegistrationReq,
    request: Request,
    _: None = Depends(_require_registration_gate),
):
    peer_ip = client_ip(request)
    await rate_limit(f"registration_ip:{peer_ip}", limit=3, window=900)
    await rate_limit_cooldown("registration_email", str(req.email).lower(), 60)
    await rate_limit(f"registration_email_window:{str(req.email).lower()}", limit=3, window=900)
    result, raw_token, token_id = await _issue_customer_registration(req)
    if raw_token and token_id:
        try:
            await _send_registration_verification(
                email=str(req.email).lower(),
                name=req.name,
                raw_token=raw_token,
                token_id=token_id,
            )
        except HTTPException:
            await _deactivate_registration_token(token_id, "delivery_failed")
            raise
    await _emit_auth_security_event(
        event_type="auth.registration_requested",
        outcome="success",
        reason_code="registration_processed",
        subject_kind="unknown_identifier",
        unknown_identifier=str(req.email),
        surface="customer",
        peer_identifier=peer_ip,
    )
    return {"status": "verification_pending", "message": REGISTRATION_GENERIC_MESSAGE}


@api.post("/auth/register/resend", responses=error_responses(400, 422, 429, 503))
async def resend_registration(req: RegistrationResendReq, request: Request):
    verify_auth_origin(request)
    if not _registration_enabled() or _public_site_origin() is None:
        raise _registration_unavailable()
    peer_ip = client_ip(request)
    email = str(req.email).lower()
    await rate_limit(f"registration_resend_ip:{peer_ip}", limit=3, window=900)
    await rate_limit_cooldown("registration_resend_email", email, 60)
    await rate_limit(f"registration_resend_window:{email}", limit=3, window=900)
    name, raw_token, token_id = await _resend_customer_registration(email)
    if name and raw_token and token_id:
        try:
            await _send_registration_verification(
                email=email,
                name=name,
                raw_token=raw_token,
                token_id=token_id,
            )
        except HTTPException:
            await _deactivate_registration_token(token_id, "delivery_failed")
            raise
    return {"status": "verification_pending", "message": REGISTRATION_GENERIC_MESSAGE}


@api.post("/auth/register/verify", responses=error_responses(400, 403, 503))
async def verify_registration(req: RegistrationTokenReq, request: Request):
    verify_auth_origin(request)
    if not _registration_enabled():
        raise _registration_unavailable()
    try:
        user = await _verify_customer_registration(req.token)
    except DuplicateKeyError:
        user = None
    if not user:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "registration_verification_invalid",
                "message": "Link verifikasi tidak valid atau sudah kedaluwarsa.",
            },
        )
    await _emit_auth_security_event(
        event_type="auth.registration_verified",
        outcome="success",
        reason_code="registration_verified",
        subject_kind="known_user",
        known_subject_id=user["id"],
        surface="customer",
    )
    return {
        "status": "verified",
        "message": "Email berhasil diverifikasi. Silakan masuk ke akun Anda.",
        "return_to": _safe_registration_return(
            (await db.customer_registration_tokens.find_one(
                {"token_hash": _opaque_secret_hash(req.token)}, {"return_to": 1}
            )
            or {}).get("return_to")
        ),
    }


@api.post("/auth/google/start", responses=error_responses(400, 401, 403, 422, 503))
async def google_start(req: GoogleStartReq, request: Request):
    verify_auth_origin(request)
    config = _google_oidc_config()
    if config is None:
        raise _registration_unavailable("google_provider_unavailable")
    if req.mode == "register" and req.privacy_consent is not True:
        raise HTTPException(
            status_code=422,
            detail={"code": "registration_consent_required"},
        )
    current_user = None
    if req.mode == "link":
        current_user = await get_current_user(request)
        if not current_user or current_user.get("status") != "active":
            raise SessionExpiredError()
    raw_state = secrets.token_urlsafe(32)
    nonce = secrets.token_urlsafe(32)
    code_verifier = secrets.token_urlsafe(48)
    state_document = {
        "id": str(uuid.uuid4()),
        "state_hash": _opaque_secret_hash(raw_state),
        "nonce": nonce,
        "code_verifier": code_verifier,
        "intent": req.mode,
        "user_id": current_user.get("id") if current_user else None,
        "privacy_consent": req.privacy_consent is True,
        "return_to": _safe_registration_return(req.return_to),
        "created_at": datetime.now(timezone.utc),
        "expires_at": datetime.now(timezone.utc) + OIDC_STATE_TTL,
        "consumed_at": None,
    }

    async def persist_state(session):
        await db.auth_oidc_states.insert_one(state_document, session=session)

    await app.state.transaction_guard.run(
        persist_state,
        operation_name="auth.customer_registration.google_state",
    )
    params = {
        "client_id": config["client_id"],
        "redirect_uri": config["redirect_uri"],
        "response_type": "code",
        "scope": "openid email profile",
        "state": raw_state,
        "nonce": nonce,
        "code_challenge": _pkce_challenge(code_verifier),
        "code_challenge_method": "S256",
    }
    return {"authorization_url": f"{GOOGLE_AUTHORIZATION_ENDPOINT}?{urlencode(params)}"}


@api.get("/auth/google/callback", responses=error_responses(400, 503))
async def google_callback(
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    config = _google_oidc_config()
    fallback = "/login"
    if config is None:
        return _google_redirect(fallback, "google_provider_unavailable")
    if error or not code or not state:
        return _google_redirect(fallback, "google_verification_failed")
    try:
        state_document = await _consume_google_state(state)
        if not state_document:
            return _google_redirect(fallback, "google_state_invalid")
        claims = await _exchange_google_code(config, code, state_document)
        user, failure = await _resolve_google_identity(claims, state_document)
    except Exception:
        logger.error("google_oidc_callback_failed")
        return _google_failure_redirect(
            state_document if "state_document" in locals() else None,
            "google_verification_failed",
        )
    return_to = _safe_registration_return(state_document.get("return_to"))
    if failure or not user:
        return _google_failure_redirect(state_document, failure or "google_verification_failed")
    response = _google_redirect(return_to, "success")
    if state_document.get("intent") != "link":
        await _session_service().issue(user, response)
        await _emit_auth_security_event(
            event_type="auth.provider_login_succeeded",
            outcome="success",
            reason_code="provider_verified",
            subject_kind="known_user",
            known_subject_id=user["id"],
            surface="customer",
        )
    return response


def _session_service() -> AuthSessionService:
    async def write_revocation_event(session_ref, reason):
        await _emit_auth_security_event(
            event_type=(
                "auth.session_replay_detected"
                if reason == "refresh_replay"
                else "auth.session_revoked"
            ),
            outcome="blocked" if reason == "refresh_replay" else "success",
            reason_code=(
                "session_replay" if reason == "refresh_replay" else "session_revoked"
            ),
            subject_kind="system",
            surface="customer",
            session_ref=session_ref,
        )

    return AuthSessionService(
        db=db,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGO,
        revocation_event_writer=write_revocation_event,
    )


def _login_limiter() -> LoginRateLimiter:
    return LoginRateLimiter(
        collection=db.login_rate_limits,
        secret=JWT_SECRET,
    )


async def _perform_login(
    req: LoginReq,
    request: Request,
    response: Response,
    *,
    surface: str,
) -> dict:
    account = req.email.lower()
    peer_ip = client_ip(request)
    limiter = _login_limiter()
    try:
        await limiter.enforce(account=account, peer_ip=peer_ip)
    except HTTPException as exc:
        if exc.status_code == 429:
            await _emit_auth_security_event(
                event_type="auth.login_blocked",
                outcome="blocked",
                reason_code="rate_limit_exceeded",
                subject_kind="unknown_identifier",
                unknown_identifier=account,
                surface=surface,
                peer_identifier=peer_ip,
            )
        raise
    try:
        user = await authenticate_credentials(req, surface=surface)
    except HTTPException as exc:
        if exc.status_code == 401:
            try:
                await limiter.record_failure(account=account, peer_ip=peer_ip)
            except HTTPException as limited:
                if limited.status_code == 429:
                    await _emit_auth_security_event(
                        event_type="auth.login_blocked",
                        outcome="blocked",
                        reason_code="rate_limit_exceeded",
                        subject_kind="unknown_identifier",
                        unknown_identifier=account,
                        surface=surface,
                        peer_identifier=peer_ip,
                    )
                raise
            await _emit_auth_security_event(
                event_type="auth.login_failed",
                outcome="denied",
                reason_code="credentials_invalid",
                subject_kind="unknown_identifier",
                unknown_identifier=account,
                surface=surface,
                peer_identifier=peer_ip,
            )
        raise
    await limiter.clear_account(account=account)
    await _session_service().issue(user, response)
    await _emit_auth_security_event(
        event_type="auth.login_succeeded",
        outcome="success",
        reason_code="credentials_verified",
        subject_kind="known_user",
        known_subject_id=user["id"],
        surface="customer",
        peer_identifier=peer_ip,
    )
    return {"user": safe_user(user)}


@api.post(
    "/auth/login",
    response_model=LoginResponse,
    responses=error_responses(401, 403, 422, 429, 500),
)
async def login(req: LoginReq, request: Request, response: Response):
    verify_auth_origin(request)
    return await _perform_login(
        req,
        request,
        response,
        surface="customer",
    )


@api.post(
    "/auth/admin/login",
    response_model=AdminSessionResponse,
    responses=error_responses(401, 403, 422, 429, 500, 503),
)
async def admin_login(req: AdminLoginReq, request: Request):
    verify_admin_origin(request)
    account = req.email.lower()
    peer_ip = client_ip(request)
    limiter = _login_limiter()
    try:
        await limiter.enforce(account=account, peer_ip=peer_ip)
    except HTTPException as exc:
        if exc.status_code == 429:
            await _emit_auth_security_event(
                event_type="auth.login_blocked",
                outcome="blocked",
                reason_code="rate_limit_exceeded",
                subject_kind="unknown_identifier",
                unknown_identifier=account,
                surface="admin",
                peer_identifier=peer_ip,
            )
        raise
    try:
        user = await authenticate_credentials(req, surface="staff")
    except HTTPException as exc:
        if exc.status_code == 401:
            try:
                await limiter.record_failure(account=account, peer_ip=peer_ip)
            except HTTPException as limited:
                if limited.status_code == 429:
                    await _emit_auth_security_event(
                        event_type="auth.login_blocked",
                        outcome="blocked",
                        reason_code="rate_limit_exceeded",
                        subject_kind="unknown_identifier",
                        unknown_identifier=account,
                        surface="admin",
                        peer_identifier=peer_ip,
                    )
                raise
            await _emit_auth_security_event(
                event_type="auth.login_failed",
                outcome="denied",
                reason_code="credentials_invalid",
                subject_kind="unknown_identifier",
                unknown_identifier=account,
                surface="admin",
                peer_identifier=peer_ip,
            )
        raise
    await limiter.clear_account(account=account)
    try:
        grant = await get_admin_session_module().create_admin_session(
            user,
            req.remember_me,
            {},
        )
    except SecurityEventDependencyError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "admin_authentication_unavailable"},
        ) from exc
    return _admin_session_response(user, grant)


@api.post("/auth/refresh", responses=error_responses(401, 403, 500))
async def refresh_session(request: Request, response: Response):
    user = await _session_service().refresh(request, response)
    return {"user": safe_user(user)}


@api.post("/auth/logout", responses=error_responses(500))
async def logout_session(request: Request, response: Response):
    await _session_service().logout(request, response)
    return {"ok": True}


@api.post("/auth/admin/session/refresh", responses=error_responses(401, 500))
async def refresh_admin_session(request: Request):
    verify_admin_origin(request)
    session_secret = request.cookies.get(SESSION_COOKIE_NAME)
    if not session_secret:
        raise SessionExpiredError()
    grant = await get_admin_session_module().rotate_admin_session(
        None,
        {"session_secret": session_secret},
    )
    user = await db.users.find_one(
        {"id": grant.user_id}, {"_id": 0, "password_hash": 0}
    )
    if (
        not user
        or user.get("status", "active") == "disabled"
        or user.get("access_state", "approved") != "approved"
        or not has_permission(user, "admin.access")
    ):
        await get_admin_session_module().revoke_admin_session(
            grant,
            "user_ineligible",
        )
        raise SessionExpiredError()
    return _admin_session_response(user, grant)


@api.get(
    "/auth/admin/session",
    response_model=LoginResponse,
    responses=error_responses(401, 403, 500, 503),
)
async def current_admin_session(request: Request):
    user = await get_admin_user(request, verify_csrf=False)
    return JSONResponse(
        {"user": safe_user(user)},
        headers={"Cache-Control": "no-store"},
    )


@api.post("/auth/admin/logout", responses=error_responses(403, 500))
async def admin_logout(request: Request):
    try:
        await get_admin_user(request)
        session = request.state.admin_session
    except SessionExpiredError:
        verify_admin_origin(request)
        session_secret = request.cookies.get(SESSION_COOKIE_NAME)
        try:
            session = await get_admin_session_module().rotate_admin_session(
                None,
                {"session_secret": session_secret},
            )
        except SessionExpiredError:
            session = None
    if session is not None:
        await get_admin_session_module().revoke_admin_session(session, "logout")
    response = JSONResponse(
        {"ok": True},
        headers={"Cache-Control": "no-store"},
    )
    _clear_admin_cookies(response)
    return response


@api.get(
    "/auth/me",
    response_model=SafeUserResponse,
    responses=error_responses(401, 403, 500),
)
async def me(user: dict = Depends(get_current_user)):
    return safe_user(user)


@api.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordReq, request: Request):
    client_host = client_ip(request)
    email = req.email.lower()
    if _public_site_origin() is not None:
        await rate_limit(f"forgot_password_ip:{client_host}", limit=3, window=900)
        await rate_limit_cooldown(
            "forgot_password_resend",
            email,
            cooldown_seconds=60,
        )
        await rate_limit(f"forgot_password_email:{email}", limit=3, window=900)

    result = await get_recovery_module().request_password_reset(
        email,
        {"client_ip": client_host},
    )
    await _emit_auth_security_event(
        event_type="auth.reset_requested",
        outcome="success",
        reason_code="reset_processed",
        subject_kind="unknown_identifier",
        unknown_identifier=req.email,
        surface="recovery",
        peer_identifier=client_host,
    )
    return result


@api.get("/auth/password-policy", responses=error_responses(500))
async def password_policy():
    return get_password_module().public_policy()


@api.post("/auth/reset-password/validate")
async def validate_reset_password(req: ValidatePasswordResetReq):
    result = await get_recovery_module().validate_password_reset(req.token)
    response = {"valid": result.valid}
    if result.code:
        response["code"] = result.code
    return response


@api.post("/auth/reset-password")
async def reset_password(req: ResetPasswordReq):
    try:
        result = await get_recovery_module().complete_password_reset(
            req.token,
            req.new_password,
        )
    except SecurityEventDependencyError as exc:
        raise HTTPException(
            status_code=503,
            detail={"code": "password_recovery_unavailable"},
        ) from exc
    if not result.ok:
        raise HTTPException(
            status_code=400,
            detail={"code": result.code},
        )
    return {"ok": True, "message": result.message}


# ----------------------------- Orders -----------------------------
async def get_settings():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    if not s:
        # No placeholder bank account: seeding one publishes a payment
        # instruction for a flow that is disabled.
        s = default_settings()
        await db.settings.insert_one(dict(s))
    return s


@api.post("/orders", responses=error_responses(401, 403, 500, 503))
async def create_order(
    _user: dict = Depends(get_current_user),
):
    raise HTTPException(
        status_code=503,
        detail={
            "code": "legacy_order_creation_inactive",
            "message": (
                "Pembuatan pesanan legacy dinonaktifkan. "
                "Retail saat ini hanya mendukung discovery dan permintaan penawaran."
            ),
        },
    )


@api.get(
    "/capabilities",
    response_model=CapabilityResponse,
    responses=error_responses(500),
)
async def public_capabilities():
    return PUBLIC_CAPABILITIES


@api.get(
    "/orders",
    response_model=list[CustomerLegacyOrderResponse],
    response_model_exclude_none=True,
    responses=error_responses(401, 403, 500),
)
async def my_orders(user: dict = Depends(get_current_user)):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    documents = (
        await db.orders.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [project_customer_legacy_order(document) for document in documents]


@api.get(
    "/orders/{oid}/design-file",
    responses=error_responses(401, 403, 404, 500),
)
async def download_legacy_order_design_file(
    oid: str, user: dict = Depends(get_current_user)
):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    order = await db.orders.find_one(
        {"id": oid, "user_id": user["id"]},
        {"_id": 0},
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    file = order.get("file")
    storage_path = file.get("storage_path") if isinstance(file, dict) else None
    if not isinstance(storage_path, str):
        raise HTTPException(status_code=404, detail="File not found")
    return await download_file(storage_path, user)


@api.get(
    "/orders/{oid}",
    response_model=CustomerLegacyOrderResponse,
    response_model_exclude_none=True,
    responses=error_responses(401, 403, 404, 500),
)
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    order = await db.orders.find_one(
        {"id": oid, "user_id": user["id"]},
        {"_id": 0},
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return project_customer_legacy_order(order)


@api.post(
    "/orders/{oid}/payment-proof",
    responses=error_responses(401, 403, 410, 500),
)
async def upload_payment_proof(
    oid: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)
):
    raise HTTPException(
        status_code=410,
        detail={
            "code": "legacy_manual_transfer_disabled",
            "message": "Mutasi pembayaran transfer manual baru dinonaktifkan.",
        },
    )


@api.get(
    "/admin/payment-capabilities",
    responses=error_responses(401, 403, 500),
)
async def payment_capabilities(
    _user: dict = Depends(require_permission("payments.read")),
):
    return {
        "contract": "provider_neutral",
        "provider_status": "inactive",
        "manual_transfer_mutations": "disabled",
        "checkout": "inactive",
        "finance_activation": "not_approved",
    }


# ----------------------------- Admin orders -----------------------------
def rows_to_csv_response(fieldnames: list, rows: list, filename: str) -> Response:
    """Serialize dict rows to a CSV download. Bounded data (<=500 rows), no disk write."""
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()
    for row in rows:
        writer.writerow(safe_csv_row(row, fieldnames))
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def serialize_admin_order_for(actor: dict, order: dict) -> dict:
    """Return a role-safe order representation for internal readers.

    Classified as legacy on read: these records predate the separate retail
    aggregate and follow a four-status flow, not the canonical lifecycle.
    """
    return project_internal_legacy_order(
        order,
        include_payment=has_permission(actor, "payments.read"),
        include_operational_notes=has_permission(actor, "orders.write"),
    )


# ----------------------------- Admin orders -----------------------------
@api.get("/admin/orders")
async def admin_orders(
    status: Optional[str] = None,
    user: dict = Depends(require_permission("orders.read")),
):
    q = {"status": status} if status else {}
    return [
        serialize_admin_order_for(user, order)
        for order in await db.orders.find(q, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    ]


@api.get("/admin/orders/export")
async def export_orders(
    status: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: dict = Depends(require_permission("orders.read")),
):
    q = {}
    if status:
        q["status"] = status
    created = {}
    if date_from:
        created["$gte"] = date_from
    if date_to:
        created["$lte"] = date_to
    if created:
        q["created_at"] = created

    include_payment = has_permission(user, "payments.read")
    fieldnames = [
        "order_number",
        "user_name",
        "user_email",
        "material_name",
        "status",
        "created_at",
        "updated_at",
    ]
    if include_payment:
        fieldnames += ["estimate_amount", "estimate_currency", "payment_verified"]

    rows = []
    for order in (
        await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)
    ):
        safe = serialize_admin_order_for(user, order)
        row = {
            key: safe.get(key, "")
            for key in fieldnames
            if not key.startswith(("estimate_", "payment_"))
        }
        if include_payment:
            estimate = safe.get("estimate") or {}
            payment = safe.get("payment") or {}
            row["estimate_amount"] = estimate.get("amount", "")
            row["estimate_currency"] = estimate.get("currency", "")
            row["payment_verified"] = payment.get("verified", "")
        rows.append(row)

    stamp = datetime.now(timezone.utc).strftime("%Y%m%d")
    return rows_to_csv_response(fieldnames, rows, f"niuva-orders-{stamp}.csv")


@api.post("/admin/orders/{oid}/estimate")
async def set_estimate(
    oid: str,
    req: EstimateReq,
    user: dict = Depends(require_permission("quotes.write")),
):
    raise HTTPException(
        status_code=410,
        detail={
            "code": "legacy_manual_transfer_disabled",
            "message": "Mutasi pembayaran transfer manual baru dinonaktifkan.",
        },
    )


@api.post("/admin/orders/{oid}/verify-payment")
async def verify_payment(
    oid: str,
    user: dict = Depends(require_permission("payments.write")),
):
    raise HTTPException(
        status_code=410,
        detail={
            "code": "legacy_manual_transfer_disabled",
            "message": "Mutasi pembayaran transfer manual baru dinonaktifkan.",
        },
    )


async def apply_order_status(oid: str, status: str, note: str) -> dict:
    """Historical compatibility surface: retained read-only."""
    raise HTTPException(
        status_code=410,
        detail={
            "code": "legacy_order_mutations_disabled",
            "message": "Pesanan legacy dipertahankan sebagai data historis hanya-baca.",
        },
    )


@api.post("/admin/orders/{oid}/status")
async def update_status(
    oid: str,
    req: StatusReq,
    user: dict = Depends(require_permission("orders.write")),
):
    return serialize_admin_order_for(
        user, await apply_order_status(oid, req.status, req.note)
    )


@api.post("/admin/orders/bulk-status")
async def bulk_update_status(
    req: BulkStatusReq,
    user: dict = Depends(require_permission("orders.write")),
):
    raise HTTPException(
        status_code=410,
        detail={
            "code": "legacy_order_mutations_disabled",
            "message": "Pesanan legacy dipertahankan sebagai data historis hanya-baca.",
        },
    )


# ----------------------------- Development media upload -----------------------------
def development_media_upload_active() -> bool:
    return (
        os.environ.get("APP_ENV", "production").strip().lower()
        in storage.LOCAL_ENVIRONMENTS
        and os.environ.get("STORAGE_BACKEND", "disabled").strip().lower() == "local"
    )


@api.get("/admin/media/capabilities", responses=error_responses(401, 403, 500))
async def admin_media_capabilities(
    _user: dict = Depends(require_permission("media.read")),
):
    active = development_media_upload_active()
    return {
        "local_upload": "active" if active else "inactive",
        "production_upload": "inactive",
        "allowed_extensions": ["png", "jpg", "jpeg", "webp"] if active else [],
        "max_size_bytes": MAX_MEDIA_FILE_SIZE if active else None,
    }


@api.post("/admin/media", status_code=status.HTTP_201_CREATED)
async def upload_admin_media(
    file: UploadFile = File(...),
    user: dict = Depends(require_permission("media.write")),
):
    if not development_media_upload_active():
        raise HTTPException(
            status_code=503,
            detail={
                "code": "development_media_upload_inactive",
                "message": (
                    "Upload media hanya tersedia pada adapter lokal "
                    "development/demo/test."
                ),
            },
        )

    metadata = await store_upload(
        file,
        f"media/{uuid.uuid4()}",
        {"png", "jpg", "jpeg", "webp"},
        max_size=MAX_MEDIA_FILE_SIZE,
        require_content_signature=True,
    )
    timestamp = now_iso()
    document = {
        **metadata,
        "reference": f"media:{metadata['id']}",
        "owner_id": user["id"],
        "uploaded_by": user["id"],
        "purpose": "admin_media",
        "object_type": "admin_media",
        "state": "active",
        "validation_status": "passed",
        "signature_validated": True,
        "validated_at": timestamp,
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    try:
        await db.file_objects.insert_one(dict(document))
    except Exception as metadata_exc:
        try:
            persisted = await db.file_objects.find_one(
                {
                    "$or": [
                        {"id": document["id"]},
                        {"reference": document["reference"]},
                    ]
                },
                {
                    "_id": 0,
                    "id": 1,
                    "reference": 1,
                    "storage_path": 1,
                    "state": 1,
                },
            )
        except Exception as resolution_exc:
            logger.error("file_metadata_outcome_resolution_failed")
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "file_metadata_outcome_unknown",
                    "message": "Status metadata file belum dapat dipastikan.",
                    "retryable": True,
                    "file_id": document["id"],
                },
            ) from resolution_exc

        if persisted:
            expected_identity = {
                "id": document["id"],
                "reference": document["reference"],
                "storage_path": document["storage_path"],
                "state": "active",
            }
            if all(
                persisted.get(field) == expected
                for field, expected in expected_identity.items()
            ):
                return document
            logger.error(
                "file_metadata_outcome_conflict",
            )
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "file_metadata_outcome_unknown",
                    "message": "Status metadata file belum dapat dipastikan.",
                    "retryable": True,
                    "file_id": document["id"],
                },
            ) from metadata_exc

        try:
            storage.delete_object(metadata["storage_path"])
        except storage.StorageError as compensation_exc:
            logger.error("file_metadata_compensation_failed")
            raise HTTPException(
                status_code=503,
                detail={
                    "code": "file_storage_compensation_failed",
                    "message": "Penyimpanan file sementara tidak tersedia.",
                    "retryable": True,
                    "file_id": document["id"],
                },
            ) from compensation_exc
        raise HTTPException(
            status_code=503,
            detail={
                "code": "file_metadata_unavailable",
                "message": "Metadata file sementara tidak tersedia.",
            },
        ) from metadata_exc
    return document


async def _public_media_is_published(reference: str) -> bool:
    catalog_publications = (
        await db.catalog_publications.find(
            {"product.media.storage_path": reference},
            {"_id": 0, "id": 1},
        )
        .limit(100)
        .to_list(100)
    )
    publication_ids = [
        publication["id"]
        for publication in catalog_publications
        if publication.get("id")
    ]
    if publication_ids and await db.products.find_one(
        {"active_publication_id": {"$in": publication_ids}},
        {"_id": 0, "id": 1},
    ):
        return True

    return bool(
        await db.portfolio_publications.find_one(
            {
                "snapshot.images": reference,
                "retired_at": None,
                "activates_at": {"$lte": datetime.now(timezone.utc)},
            },
            {"_id": 0, "id": 1},
        )
    )


@api.get("/media/{file_id}")
async def download_public_media(file_id: str):
    metadata = await db.file_objects.find_one(
        {
            "id": file_id,
            "purpose": "admin_media",
            "state": "active",
        },
        {"_id": 0},
    )
    reference = f"media:{file_id}"
    if not metadata or not await _public_media_is_published(reference):
        raise HTTPException(status_code=404, detail="Media not found")
    storage_path = metadata.get("storage_path")
    if (
        not isinstance(storage_path, str)
        or metadata.get("validation_status") != "passed"
        or metadata.get("signature_validated") is not True
    ):
        raise HTTPException(status_code=404, detail="Media not found")
    expected_content_type = safe_file_content_type(storage_path)
    if (
        expected_content_type not in {"image/png", "image/jpeg", "image/webp"}
        or metadata.get("content_type") != expected_content_type
    ):
        raise HTTPException(status_code=404, detail="Media not found")
    try:
        chunks, content_type, size = storage.stream_object(storage_path)
    except (
        storage.InvalidStoragePathError,
        storage.StorageNotFoundError,
    ) as exc:
        raise HTTPException(status_code=404, detail="Media not found") from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(
            status_code=503, detail="Media storage unavailable"
        ) from exc
    except storage.StorageError as exc:
        logger.error("public_media_read_failed")
        raise HTTPException(
            status_code=500, detail="Media storage unavailable"
        ) from exc
    if content_type != expected_content_type:
        raise HTTPException(status_code=404, detail="Media not found")
    return StreamingResponse(
        chunks,
        media_type=content_type,
        headers={
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
            "Content-Length": str(size),
        },
    )


# ----------------------------- File download -----------------------------
def _file_scope_permissions(metadata: dict) -> tuple[str, ...]:
    object_type = metadata.get("object_type") or metadata.get("purpose")
    if isinstance(object_type, str):
        permissions = FILE_SCOPE_PERMISSIONS.get(object_type)
        if permissions:
            return permissions
    linked_type = metadata.get("linked_type")
    if linked_type == "order":
        return ("orders.read",)
    if linked_type == "project":
        return ("projects.read",)
    return ()


def _can_download_file(user: dict, metadata: dict) -> bool:
    owner_id = metadata.get("owner_id")
    if (
        not is_internal(user)
        and isinstance(owner_id, str)
        and owner_id == user.get("id")
    ):
        return True
    permissions = _file_scope_permissions(metadata)
    return bool(permissions) and any(
        has_permission(user, permission) for permission in permissions
    )


async def _stream_authorized_file(metadata: dict) -> StreamingResponse:
    path = metadata.get("storage_path")
    if not isinstance(path, str):
        raise HTTPException(status_code=404, detail="File not found")
    try:
        chunks, _stored_content_type, size = storage.stream_object(path)
    except storage.InvalidStoragePathError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail="File storage unavailable") from exc
    except storage.StorageNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except storage.StorageError as exc:
        logger.error("stored_file_read_failed")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    filename = safe_original_filename(metadata.get("original_filename"))
    return StreamingResponse(
        chunks,
        media_type=safe_file_content_type(path),
        headers={
            "Cache-Control": "private, no-store",
            "Content-Disposition": (
                "attachment; filename*=UTF-8''" + quote(filename, safe="")
            ),
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
            "Content-Length": str(size),
        },
    )


@api.get("/file-objects/{file_id}")
async def download_file_object(
    file_id: str,
    user: dict = Depends(get_current_user),
):
    metadata = await db.file_objects.find_one(
        {"id": file_id, "state": "active"},
        {"_id": 0},
    )
    if not metadata or not _can_download_file(user, metadata):
        raise HTTPException(status_code=404, detail="File not found")
    return await _stream_authorized_file(metadata)


@api.get("/files/{path:path}")
async def download_file(path: str, user: dict = Depends(get_current_user)):
    metadata = await db.file_objects.find_one(
        {"storage_path": path, "state": "active"},
        {"_id": 0},
    )
    if not metadata or not _can_download_file(user, metadata):
        raise HTTPException(status_code=404, detail="File not found")
    return await _stream_authorized_file(metadata)


# ----------------------------- Contact -----------------------------
@api.post("/contact")
async def contact(req: ContactReq, request: Request):
    await rate_limit(f"contact:{client_ip(request)}", limit=5, window=600)

    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.contacts.insert_one(dict(doc))
    try:
        await queue_operational_email(
            notification_id=f"legacy-contact:{doc['id']}",
            recipient=HRD_EMAIL,
            subject=f"Inquiry Baru: {req.subject}",
            title="Pesan Kontak Baru",
            body_html=(
                f"<p>Dari <strong>{html.escape(req.name)}</strong> "
                f"({html.escape(str(req.email))})</p>"
                f"<p>{html.escape(req.message).replace(chr(10), '<br>')}</p>"
            ),
        )
    except Exception:
        logger.error("contact_notification_enqueue_failed")
    return {"ok": True, "message": "Pesan berhasil dikirim"}


@api.get("/admin/contacts", responses=error_responses(401, 403, 500))
async def list_contacts(
    user: dict = Depends(require_permission("inquiries.read")),
):
    """Pre-migration contact submissions, classified on read.

    Structured intake now lands on the canonical Inquiry aggregate. These rows
    predate that and carry no company, status, or version, so they cannot be
    triaged. Classification is applied on read and never written back: the
    history stays exactly as it was captured.
    """
    documents = (
        await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    )
    return [
        {**document, "record_class": "legacy_contact", "read_only": True}
        for document in documents
    ]


# ----------------------------- Portfolio -----------------------------
# Portfolio is served by build_portfolio_router: it carries a publication
# lifecycle, versions, and archiving, and its public read is published-only.


# ----------------------------- Settings & Users -----------------------------
@api.get("/settings", responses=error_responses(500))
async def settings_public():
    """The company profile the public site and its footer read from."""
    return project_public_settings(await get_settings())


@api.get("/admin/settings", responses=error_responses(401, 403, 500))
async def settings_admin(
    _actor: dict = Depends(require_permission("settings.write")),
):
    return project_admin_settings(await get_settings())


@api.put("/admin/settings")
async def update_settings(
    req: SettingsReq,
    actor: dict = Depends(require_permission("settings.write")),
):
    current = await get_settings()
    if current.get("version", 1) != req.expected_version:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "version_conflict",
                "current_version": current.get("version", 1),
            },
        )
    merged = merge_profile(current, req.model_dump())
    result_document: dict = {}

    async def mutation(session):
        result = await db.settings.update_one(
            {"key": "site", "version": req.expected_version},
            {
                "$set": {
                    **{field: merged[field] for field in PUBLIC_PROFILE_FIELDS},
                    "updated_at": datetime.now(timezone.utc),
                    "updated_by": actor["id"],
                },
                "$inc": {"version": 1},
            },
            session=session,
        )
        if result.matched_count == 0:
            raise HTTPException(
                status_code=409,
                detail={"code": "version_conflict"},
            )
        after = {
            **merged,
            "version": req.expected_version + 1,
        }
        await append_audit_event(
            db,
            actor=actor,
            action="settings.profile_updated",
            target_type="settings",
            target_id="site",
            before=project_public_settings(current),
            after=project_public_settings(after),
            reason=req.reason,
            session=session,
        )
        result_document.update(after)

    await app.state.transaction_guard.run(
        mutation,
        operation_name="settings.profile_update",
    )
    return project_admin_settings(result_document)


@api.post("/admin/customers", status_code=201)
async def create_client_user(
    req: ClientProvisionReq,
    user: dict = Depends(require_permission("customers.manage")),
):
    return await provision_client(req)


@api.get("/admin/customers", responses=error_responses(401, 403, 500))
async def list_customers(
    user: dict = Depends(require_permission("customers.read")),
):
    candidates = await db.users.find(
        CUSTOMER_QUERY, {"_id": 0, "password_hash": 0}
    ).to_list(500)
    return [
        safe_user(candidate)
        for candidate in candidates
        if candidate.get("role") == "client"
        or bool(set(candidate.get("roles") or []) & CUSTOMER_ROLES)
    ]


async def update_customer_status(
    *,
    customer_id: str,
    payload: CustomerStatusReq,
    actor: dict,
    next_status: str,
) -> dict:
    updated: dict = {}
    guard = app.state.transaction_guard

    async def mutate(session):
        current = await db.users.find_one({"id": customer_id}, session=session)
        if not current:
            raise HTTPException(status_code=404, detail="Customer not found")
        is_customer = current.get("role") == "client" or bool(
            set(current.get("roles") or []) & CUSTOMER_ROLES
        )
        if not is_customer:
            raise HTTPException(
                status_code=409,
                detail={"code": "staff_account_boundary"},
            )
        if current.get("version", 1) != payload.expected_version:
            raise HTTPException(
                status_code=409,
                detail={
                    "code": "version_conflict",
                    "current_version": current.get("version", 1),
                    "current_status": current.get("status"),
                },
            )
        timestamp = now_iso()
        result = await db.users.update_one(
            {"id": customer_id, "version": payload.expected_version},
            {
                "$set": {
                    "status": next_status,
                    "updated_at": timestamp,
                },
                "$inc": {"version": 1, "token_version": 1},
            },
            session=session,
        )
        if result.matched_count == 0:
            raise HTTPException(
                status_code=409,
                detail={"code": "version_conflict"},
            )
        after = {
            **current,
            "status": next_status,
            "updated_at": timestamp,
            "version": payload.expected_version + 1,
            "token_version": current.get("token_version", 0) + 1,
        }
        await append_identity_governance_event(
            db,
            actor=actor,
            action=f"identity.customer_{next_status}",
            target_type="user",
            target_id=customer_id,
            before=safe_user(current),
            after=safe_user(after),
            reason=payload.reason,
            session=session,
        )
        updated.update(after)

    await guard.run(
        mutate,
        operation_name=f"identity.customer_{next_status}",
    )
    await _session_service().revoke_user_sessions(
        customer_id,
        reason=f"customer_{next_status}",
    )
    return safe_user(updated)


@api.post("/admin/customers/{customer_id}/deactivate")
async def deactivate_customer(
    customer_id: str,
    payload: CustomerStatusReq,
    actor: dict = Depends(require_permission("customers.manage")),
):
    return await update_customer_status(
        customer_id=customer_id,
        payload=payload,
        actor=actor,
        next_status="disabled",
    )


@api.post("/admin/customers/{customer_id}/reactivate")
async def reactivate_customer(
    customer_id: str,
    payload: CustomerStatusReq,
    actor: dict = Depends(require_permission("customers.manage")),
):
    return await update_customer_status(
        customer_id=customer_id,
        payload=payload,
        actor=actor,
        next_status="active",
    )


def _resolve_range(date_from: Optional[str], date_to: Optional[str]) -> dict:
    try:
        return resolve_date_range(date_from, date_to)
    except DashboardRangeError as exc:
        raise HTTPException(status_code=400, detail=exc.message) from exc


@api.get("/admin/stats")
async def admin_stats(
    *,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: dict = Depends(require_permission("dashboard.read")),
):
    """Counts for one applied date range, never for all of history.

    Every figure below is scoped by the same range, so two panels on the same
    dashboard always describe the same window.
    """
    applied = _resolve_range(date_from, date_to)
    ranged = created_within(applied["query"])

    orders = await db.orders.find(
        ranged, {"_id": 0, "status": 1, "user_id": 1}
    ).to_list(5000)
    counts = {status: 0 for status in ORDER_STATUSES}
    for order in orders:
        if order.get("status") in counts:
            counts[order["status"]] += 1

    retail_orders = await db.retail_orders.count_documents(ranged)
    inquiries = await db.inquiries.count_documents(ranged)
    organizations = await db.inquiries.find(ranged, {"_id": 0, "company": 1}).to_list(
        5000
    )

    # Registered customers within the range, resolved through the canonical
    # role query so a legacy marker and a canonical role both count once.
    registered_customers = await db.users.count_documents({**CUSTOMER_QUERY, **ranged})

    return {
        "date_from": applied["date_from"],
        "date_to": applied["date_to"],
        "total_orders": len(orders),
        "pending_estimate": counts["pending_estimate"],
        "awaiting_payment": counts["awaiting_payment"],
        "in_process": counts["in_process"],
        "completed": counts["completed"],
        "retail_orders": retail_orders,
        "inquiries": inquiries,
        # Distinct within the range, not lifetime registrations: a customer
        # count that ignores the range cannot be read next to one that does not.
        "clients": distinct_count(orders, "user_id"),
        "registered_customers": registered_customers,
        "organizations": distinct_count(organizations, "company"),
        "revenue": withheld_revenue(),
    }


@api.get("/admin/stats/timeseries")
async def admin_stats_timeseries(
    *,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    user: dict = Depends(require_permission("dashboard.read")),
):
    """Aggregate real order/payment/stock-movement history into a daily trend.

    Series composition depends on the actor's permissions (DEC-OPS-001: no
    identical dashboard for every role) — operations sees production/stock
    trends, commercial_finance sees revenue trends. Every value here is a
    direct count or sum over existing transaction records, never a fabricated
    metric.
    """
    applied = _resolve_range(date_from, date_to)
    ranged = created_within(applied["query"])

    orders = await db.orders.find(
        ranged,
        {"_id": 0, "created_at": 1, "status": 1},
    ).to_list(5000)

    orders_by_status: dict = {}
    for order in orders:
        bucket = orders_by_status.setdefault(
            date_bucket(order.get("created_at")),
            {status: 0 for status in ORDER_STATUSES},
        )
        status = order.get("status")
        if status in bucket:
            bucket[status] += 1

    series = {
        "orders_by_status": [
            {"date": date, **counts}
            for date, counts in sorted(orders_by_status.items())
        ]
    }

    if has_permission(user, "inventory.read"):
        movements = await db.stock_movements.find(
            ranged,
            {"_id": 0, "created_at": 1, "movement_type": 1, "deltas": 1},
        ).to_list(5000)
        # Signed, not counted: a receipt and a write-off are not the same event.
        series["stock_movements"] = summarize_movements(movements)

    # Revenue is withheld for every reader, including payments.read. Serving it
    # and hiding it in the client would still put it on the wire.
    series["revenue"] = withheld_revenue()

    return {
        "date_from": applied["date_from"],
        "date_to": applied["date_to"],
        "series": series,
    }


def notification_service() -> NotificationService:
    return NotificationService(db=db)


async def queue_operational_email(
    *,
    notification_id: str,
    recipient: str,
    subject: str,
    title: str,
    body_html: str,
) -> dict:
    """Persist provider-neutral email work for the leased delivery worker."""
    return await notification_service().enqueue_delivery(
        notification_id=notification_id,
        channel="email",
        recipient=recipient,
        payload={
            "subject": subject,
            "title": title,
            "body_html": body_html,
        },
    )


async def _invoke_notifications(awaitable):
    try:
        return await awaitable
    except NotificationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.payload()) from exc


@api.get("/notifications")
async def my_notifications(
    unread_only: bool = False,
    limit: int = 50,
    user: dict = Depends(get_current_user),
):
    """The bell feed: what the system did that this reader may need to act on."""
    return await _invoke_notifications(
        notification_service().list_for_user(
            user["id"], unread_only=unread_only, limit=limit
        )
    )


@api.get("/notifications/unread-count", responses=error_responses(401, 500))
async def my_unread_notification_count(user: dict = Depends(get_current_user)):
    return {"unread": await notification_service().unread_count(user["id"])}


@api.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    user: dict = Depends(get_current_user),
):
    return await _invoke_notifications(
        notification_service().mark_read(notification_id, user_id=user["id"])
    )


@api.post("/notifications/read-all", responses=error_responses(401, 500))
async def mark_all_notifications_read(user: dict = Depends(get_current_user)):
    return await _invoke_notifications(notification_service().mark_all_read(user["id"]))


async def resolve_notification_recipients(req: AdminNotificationReq) -> list:
    """Return safe recipient projections ({id, email, name}) for the requested target."""
    if req.target == "user":
        if not req.user_id:
            raise HTTPException(
                status_code=400, detail="user_id is required for target=user"
            )
        recipient = await db.users.find_one(
            {"id": req.user_id}, {"_id": 0, "id": 1, "email": 1, "name": 1}
        )
        if not recipient:
            raise HTTPException(status_code=404, detail="User not found")
        return [recipient]

    if req.target == "segment":
        if req.segment == "active_orders":
            order_user_ids = await db.orders.distinct(
                "user_id", {"status": {"$in": ["awaiting_payment", "in_process"]}}
            )
            return await db.users.find(
                {"id": {"$in": order_user_ids}},
                {"_id": 0, "id": 1, "email": 1, "name": 1},
            ).to_list(500)
        raise HTTPException(
            status_code=400,
            detail="segment is required and must be a known segment for target=segment",
        )

    return await db.users.find(
        CUSTOMER_QUERY, {"_id": 0, "id": 1, "email": 1, "name": 1}
    ).to_list(500)


@api.post("/admin/notifications")
async def send_admin_notification(
    req: AdminNotificationReq,
    actor: dict = Depends(require_permission("notifications.write")),
):
    await rate_limit(f"admin_notify:{actor['id']}", limit=10, window=600)
    recipients = await resolve_notification_recipients(req)
    log_id = str(uuid.uuid4())
    queued_count = 0
    service = notification_service()
    log_entry = {
        "id": log_id,
        "target": req.target,
        "user_id": req.user_id,
        "segment": req.segment,
        "subject": req.subject,
        "message": req.message,
        "recipient_count": len(recipients),
        "delivery_status": "queued",
        "sent_by": actor["id"],
        "created_at": now_iso(),
    }

    async def mutation(session):
        nonlocal queued_count
        for recipient in recipients:
            notification = await service.publish(
                user_id=recipient["id"],
                event=f"admin.message.{log_id}",
                title=req.subject,
                body=req.message,
                session=session,
            )
            await service.enqueue_delivery(
                notification_id=notification["id"],
                channel="email",
                recipient=recipient["email"],
                payload={
                    "subject": req.subject,
                    "title": req.subject,
                    "body_html": html.escape(req.message).replace(chr(10), "<br>"),
                },
                session=session,
            )
            queued_count += 1
        await db.admin_notification_log.insert_one(dict(log_entry), session=session)
        await append_audit_event(
            db,
            actor=actor,
            action="notifications.queued",
            target_type="notification",
            target_id=log_entry["id"],
            after={
                "target": req.target,
                "segment": req.segment,
                "recipient_count": queued_count,
                "delivery_status": "queued",
            },
            reason="Admin communication queued for delivery",
            session=session,
        )

    await app.state.transaction_guard.run(
        mutation,
        operation_name="notifications.queue_admin_message",
    )
    log_entry.pop("_id", None)
    return log_entry


@api.get("/admin/notifications/sent")
async def list_sent_notifications(
    limit: int = 50,
    _actor: dict = Depends(require_permission("notifications.write")),
):
    return (
        await db.admin_notification_log.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(min(limit, 200))
    )


@api.get("/health", responses=error_responses(500))
async def health():
    return {
        "status": "ok",
        "transactions": current_database_capabilities().transactions,
    }


@api.get("/health/live", responses=error_responses(500))
async def health_live():
    return {"status": "ok"}


@api.get(
    "/health/ready",
    responses={
        # The 503 body is the readiness payload (status/database/schema/
        # capabilities), not the shared ErrorEnvelope — it is not raised as an
        # HTTPException, so error_responses() would document the wrong shape.
        503: {"description": "Required dependency or capability is not ready"},
        **error_responses(500),
    },
)
async def health_ready():
    loop = asyncio.get_running_loop()
    started_at = loop.time()
    dependencies = await app.state.readiness_probe_coordinator.probe()
    capabilities = dependencies.capabilities
    database_available = dependencies.database_available
    probe_duration_ms = int((loop.time() - started_at) * 1000)
    observability.record_dependency(
        dependency="mongodb",
        operation="unknown",
        outcome="success" if database_available else "unavailable",
        duration_ms=probe_duration_ms,
    )
    observability.record_readiness(
        dependency="mongodb",
        ready=database_available,
        duration_ms=probe_duration_ms,
    )
    observability.metrics.set_gauge(
        "transaction_capability",
        {
            "safe_capability_reason": getattr(
                capabilities.transaction_reason, "value", "unknown"
            )
        },
        1 if capabilities.transactions else 0,
    )
    schema_status = public_schema_status(dependencies.schema_status)
    transaction_status = public_transaction_status(capabilities)
    transaction_required = _environment_flag("TRANSACTION_MUTATIONS_ENABLED")
    transaction_ready = bool(
        not transaction_required or transaction_status["available"]
    )
    runtime_mode = getattr(app.state, "runtime_mode", "api")
    worker_status_value = app.state.notification_worker_status
    worker_status = worker_status_value if isinstance(worker_status_value, dict) else {}
    worker_task = app.state.notification_worker_task
    # API mode is intentionally independent from an optional, separately
    # managed delivery worker. A task present in a test/co-located runtime is
    # still evaluated so the local readiness contract remains truthful.
    worker_is_co_located = is_co_located_mode(runtime_mode) or worker_task is not None
    worker_required = bool(
        _environment_flag("NOTIFICATION_WORKER_REQUIRED") and worker_is_co_located
    )
    heartbeat = worker_status.get("last_heartbeat_at")
    heartbeat_fresh = False
    if isinstance(heartbeat, datetime) and heartbeat.tzinfo is not None:
        heartbeat_age = datetime.now(timezone.utc) - heartbeat
        heartbeat_fresh = bool(
            timedelta(0)
            <= heartbeat_age
            <= timedelta(seconds=NOTIFICATION_WORKER_STALE_SECONDS)
        )
    worker_task_active = bool(worker_task is not None and not worker_task.done())
    worker_available = bool(
        not worker_is_co_located
        or (
            worker_status.get("enabled")
            and worker_status.get("running")
            and heartbeat_fresh
            and worker_task_active
        )
    )
    worker_ready = bool(not worker_required or worker_available)
    email_required = _environment_flag("EMAIL_DELIVERY_REQUIRED")
    email_configured = bool(
        isinstance(emailer.RESEND_API_KEY, str) and emailer.RESEND_API_KEY.strip()
    )
    email_ready = bool(not email_required or email_configured)
    auth_events_required = _environment_flag("AUTH_SECURITY_EVENTS_ENABLED")
    auth_events_ready = not auth_events_required
    auth_event_marker = False
    if auth_events_required and database_available:
        try:
            get_auth_security_event_service()
            remaining = TOTAL_TIMEOUT_SECONDS - (loop.time() - started_at)
            if remaining <= 0:
                raise TimeoutError("readiness deadline elapsed")
            marker = await asyncio.wait_for(
                db.migration_state.find_one(
                    {"_id": "010_auth_security_events"},
                    {"_id": 1},
                ),
                timeout=remaining,
            )
            auth_event_marker = marker is not None
            auth_events_ready = bool(
                app.state.auth_security_event_status.get("ready") and auth_event_marker
            )
        except Exception:
            auth_events_ready = False
    ready = bool(
        database_available
        and transaction_ready
        and schema_status.get("ready")
        and worker_ready
        and email_ready
        and auth_events_ready
    )
    payload = {
        "status": "ready" if ready else "not_ready",
        "database": "ready" if database_available else "unavailable",
        "transaction_mutations": (
            "ready" if transaction_status["available"] else "unavailable"
        ),
        "schema": schema_status,
        "capabilities": {
            "transactions": {
                **transaction_status,
                "required": transaction_required,
            },
            "production_upload": {"status": "inactive", "required": False},
            "payment": {"status": "inactive", "required": False},
            "organization_portal": {"status": "inactive", "required": False},
            "notification_worker": {
                "status": "ready" if worker_ready else "unavailable",
                "required": worker_required,
                "enabled": bool(worker_status.get("enabled")),
                "heartbeat_fresh": heartbeat_fresh,
            },
            "email_delivery": {
                "status": (
                    "ready"
                    if email_configured
                    else ("unavailable" if email_required else "inactive")
                ),
                "required": email_required,
            },
            "authentication_security_events": {
                "status": "ready" if auth_events_ready else "unavailable",
                "required": auth_events_required,
                "migration_010": auth_event_marker,
            },
        },
    }
    return JSONResponse(payload, status_code=200 if ready else 503)


@api.get("/", responses=error_responses(500))
async def root():
    return {"message": "NIUVA API", "status": "ok"}


api.include_router(
    build_identity_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        safe_user=safe_user,
        hash_new_password=hash_new_password,
    )
)


async def throttle_inquiry_intake(request: Request) -> None:
    """Throttle anonymous project intake at parity with the legacy form."""
    await rate_limit(f"inquiry:{client_ip(request)}", limit=5, window=600)


async def notify_new_inquiry(inquiry: dict) -> None:
    """Queue a captured lead; the router keeps the intake on enqueue failure."""
    await queue_operational_email(
        notification_id=f"inquiry:{inquiry['id']}",
        recipient=HRD_EMAIL,
        subject=f"Inquiry Baru: {inquiry['company']}",
        title="Inquiry Proyek Baru",
        body_html=(
            f"<p><strong>{html.escape(inquiry['company'])}</strong></p>"
            f"<p>PIC: {html.escape(inquiry['pic_name'])} "
            f"({html.escape(inquiry['pic_email'])})</p>"
            f"<p>Kebutuhan: {html.escape(inquiry['need'])}</p>"
            f"<p>Timeline: {html.escape(inquiry['timeline'] or '-')}</p>"
            f"<p>{html.escape(inquiry['brief']).replace(chr(10), '<br>')}</p>"
        ),
    )


api.include_router(
    build_b2b_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        throttle_intake=throttle_inquiry_intake,
        notify_inquiry=notify_new_inquiry,
        get_inventory_service=lambda: InventoryService(
            db=db,
            client=client,
            capabilities=current_database_capabilities(),
            guard=app.state.transaction_guard,
        ),
    )
)

api.include_router(
    build_portfolio_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        has_permission=has_permission,
    )
)

api.include_router(
    build_retail_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
    )
)

api.include_router(
    build_catalog_router(
        get_db=lambda: db,
        get_client=lambda: client,
        get_capabilities=current_database_capabilities,
        get_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
    )
)
api.include_router(
    build_material_router(
        get_db=lambda: db,
        get_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        has_permission=has_permission,
    )
)
api.include_router(
    build_inventory_router(
        get_service=lambda: InventoryService(
            db=db,
            client=client,
            capabilities=current_database_capabilities(),
            guard=app.state.transaction_guard,
        ),
        require_permission=require_permission,
        has_permission=has_permission,
    )
)
api.include_router(
    build_content_router(
        get_db=lambda: db,
        get_client=lambda: client,
        get_capabilities=current_database_capabilities,
        get_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        has_permission=has_permission,
    )
)

app.include_router(api)

cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
if "*" in cors_origins:
    raise RuntimeError(
        "CORS_ORIGINS must contain exact trusted origins when credentials are enabled"
    )

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------- Startup -----------------------------
async def seed():
    try:
        admin_email = str(
            TypeAdapter(EmailStr).validate_python(
                os.environ.get("ADMIN_EMAIL", "").strip()
            )
        ).lower()
    except ValidationError as exc:
        raise RuntimeError("ADMIN_EMAIL must be a valid email address") from exc
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        admin_password = os.environ.get("ADMIN_PASSWORD", "")
        admin_name = "NIUVA Admin"
        await db.users.insert_one(
            {
                "id": str(uuid.uuid4()),
                "name": admin_name,
                "email": admin_email,
                "password_hash": hash_new_password(
                    admin_password,
                    context_terms=(admin_email, admin_name),
                ),
                "phone": "",
                "company": "PT Niuva Inovasi Utama",
                "roles": ["super_admin"],
                "status": "active",
                "access_state": "approved",
                "role_policy_version": ROLE_POLICY_VERSION,
                "token_version": 0,
                "version": 1,
                "created_at": now_iso(),
            }
        )
    elif (
        canonical_roles(existing) != ("super_admin",)
        or existing.get("status") != "active"
        or existing.get("access_state") != "approved"
        or existing.get("role_policy_version") != ROLE_POLICY_VERSION
        or not is_valid_password_hash(existing.get("password_hash"))
    ):
        raise RuntimeError(
            "Configured bootstrap administrator already exists but is not a "
            "valid active super_admin; startup will not mutate identity "
            "credentials"
        )

    await get_settings()
    logger.info("Seed complete")


async def reservation_expiry_loop(stop_event: asyncio.Event | None = None):
    system_actor = {
        "id": "system:reservation-expiry",
        "email": "system@niuva.local",
        "roles": ["system"],
    }
    owner_id = f"scheduler:reservation-expiry:{uuid.uuid4()}"
    runtime_config = getattr(app.state, "worker_runtime_config", None)
    if not isinstance(runtime_config, WorkerRuntimeConfig):
        runtime_config = WorkerRuntimeConfig()
    lease = NamedJobLease(
        collection=db.runtime_job_leases,
        job_name="reservation_expiry",
        owner_id=owner_id,
        lease_seconds=runtime_config.lease_seconds,
    )
    while stop_event is None or not stop_event.is_set():
        acquired = False
        renewal_stop = None
        renewal_task = None
        job_started_at = datetime.now(timezone.utc)
        try:
            acquired = await lease.acquire() is not None
            if acquired:
                renewal_stop = asyncio.Event()
                renewal_task = asyncio.create_task(
                    renew_lease_until_stopped(
                        lease=lease,
                        stop_event=renewal_stop,
                        interval_seconds=max(
                            0.001,
                            runtime_config.lease_seconds
                            - runtime_config.renewal_threshold_seconds,
                        ),
                    )
                )
                try:
                    service = InventoryService(
                        db=db,
                        client=client,
                        capabilities=current_database_capabilities(),
                        guard=app.state.transaction_guard,
                    )
                    result = await service.expire_due_reservations(actor=system_actor)
                    if result.get("expired"):
                        logger.info("reservation_expiry_batch")
                    observability.record_scheduler(
                        job_name="reservation_expiry",
                        outcome="success",
                        duration_ms=int(
                            (
                                datetime.now(timezone.utc) - job_started_at
                            ).total_seconds()
                            * 1000
                        ),
                    )
                    await lease.release(status="completed", result=result)
                finally:
                    renewal_stop.set()
                    renewal_task.cancel()
                    await asyncio.gather(renewal_task, return_exceptions=True)
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.error("reservation_expiry_loop_failed")
            if acquired:
                observability.record_scheduler(
                    job_name="reservation_expiry",
                    outcome="failed_safe",
                    duration_ms=int(
                        (datetime.now(timezone.utc) - job_started_at).total_seconds()
                        * 1000
                    ),
                )
                await lease.release(status="failed")
        if stop_event is None:
            await asyncio.sleep(60)
        elif await wait_for_stop(stop_event, 60):
            break


async def readiness_probe_loop():
    while True:
        started_at = asyncio.get_running_loop().time()
        try:
            dependencies = await app.state.readiness_probe_coordinator.probe(
                refresh_transaction=True
            )
            database_available = bool(
                getattr(dependencies, "database_available", False)
            )
            duration_ms = int((asyncio.get_running_loop().time() - started_at) * 1000)
            observability.record_dependency(
                dependency="mongodb",
                operation="unknown",
                outcome="success" if database_available else "unavailable",
                duration_ms=duration_ms,
            )
            observability.record_readiness(
                dependency="mongodb",
                ready=database_available,
                duration_ms=duration_ms,
            )
        except Exception:
            observability.record_dependency(
                dependency="mongodb",
                operation="unknown",
                outcome="failed_safe",
                duration_ms=int(
                    (asyncio.get_running_loop().time() - started_at) * 1000
                ),
            )
            logger.error("readiness_probe_loop_failed")
        await asyncio.sleep(READINESS_PROBE_INTERVAL_SECONDS)


async def observability_metrics_loop(stop_event: asyncio.Event):
    while not stop_event.is_set():
        if await wait_for_stop(stop_event, 60):
            break
        try:
            observability.flush_metrics()
        except Exception:
            logger.error("observability_metrics_flush_failed")


async def notification_outbox_loop():
    worker_id = f"web-worker:{uuid.uuid4()}"

    async def deliver_email(entry, *, idempotency_key):
        payload = entry.get("payload") or {}
        result = await emailer.send_email(
            entry["recipient"],
            str(payload.get("subject") or "Notifikasi NIUVA"),
            str(payload.get("title") or payload.get("subject") or "Notifikasi"),
            str(payload.get("body_html") or payload.get("body") or ""),
            idempotency_key=idempotency_key,
        )
        if result.get("status") == "error":
            raise RuntimeError("email_delivery_failed")
        return True

    runtime_config = getattr(app.state, "worker_runtime_config", None)
    if not isinstance(runtime_config, WorkerRuntimeConfig):
        runtime_config = WorkerRuntimeConfig.from_environment()

    def publish_worker_status(status: dict) -> None:
        app.state.notification_worker_status = status
        result = status.get("last_result")
        if isinstance(result, dict) and result.get("claimed"):
            logger.info("notification_outbox_batch")
        error_type = status.get("last_error_type")
        if isinstance(error_type, str):
            logger.error("notification_outbox_loop_failed")

    async def publish_worker_result(result: dict) -> None:
        snapshot = {}
        try:
            snapshot = await asyncio.wait_for(
                NotificationService(db=db).worker_snapshot(),
                timeout=1,
            )
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.error("notification_worker_snapshot_failed")
        observability.record_worker(result=result, snapshot=snapshot)

    worker = NotificationDeliveryWorker(
        service=NotificationService(db=db),
        worker_id=worker_id,
        deliverers={"email": deliver_email},
        runtime_config=runtime_config,
    )
    runtime = WorkerRuntime(
        worker=worker,
        config=runtime_config,
        status_sink=publish_worker_status,
        result_sink=publish_worker_result,
        heartbeat_interval_seconds=NOTIFICATION_WORKER_HEARTBEAT_INTERVAL_SECONDS,
    )
    app.state.worker_runtime = runtime
    try:
        await runtime.run()
    finally:
        app.state.worker_runtime = None


async def _startup_runtime():
    validate_cookie_configuration()
    runtime_mode = resolve_runtime_mode()
    runtime_config = WorkerRuntimeConfig.from_environment()
    app.state.runtime_mode = runtime_mode
    app.state.worker_runtime_config = runtime_config
    app.state.scheduler_stop_event = asyncio.Event()
    app.state.observability_metrics_task = asyncio.create_task(
        observability_metrics_loop(app.state.scheduler_stop_event)
    )
    storage.init_storage()
    await seed()
    dependencies = await app.state.readiness_probe_coordinator.probe()
    app.state.database_capabilities = dependencies.capabilities
    app.state.schema_status = dependencies.schema_status
    logger.info("database_capability_checked")
    app.state.readiness_probe_task = asyncio.create_task(readiness_probe_loop())
    app.state.reservation_expiry_task = None
    if is_worker_mode(runtime_mode):
        app.state.reservation_expiry_task = asyncio.create_task(
            reservation_expiry_loop(app.state.scheduler_stop_event)
        )
    worker_enabled = (
        os.environ.get("NOTIFICATION_WORKER_ENABLED", "false").lower() == "true"
    )
    app.state.notification_worker_status = {
        "enabled": bool(worker_enabled and is_worker_mode(runtime_mode)),
        "running": False,
        "draining": False,
        "last_heartbeat_at": None,
        "last_result": None,
        "last_error_type": None,
    }
    app.state.notification_worker_task = None
    app.state.worker_runtime = None
    if worker_enabled and is_worker_mode(runtime_mode):
        app.state.notification_worker_task = asyncio.create_task(
            notification_outbox_loop(),
        )


async def _shutdown_runtime():
    scheduler_stop_event = getattr(app.state, "scheduler_stop_event", None)
    if scheduler_stop_event is not None:
        scheduler_stop_event.set()
    runtime = getattr(app.state, "worker_runtime", None)
    if isinstance(runtime, WorkerRuntime):
        runtime.request_shutdown()

    immediate_tasks = [
        app.state.readiness_probe_task,
        app.state.reservation_expiry_task,
        app.state.observability_metrics_task,
    ]
    for task in immediate_tasks:
        if task is not None:
            task.cancel()
    for task in immediate_tasks:
        if task is None:
            continue
        try:
            await task
        except asyncio.CancelledError:
            pass

    worker_task = app.state.notification_worker_task
    if worker_task is not None:
        runtime_config = getattr(app.state, "worker_runtime_config", None)
        drain_seconds = (
            runtime_config.drain_seconds
            if isinstance(runtime_config, WorkerRuntimeConfig)
            else APPROVED_DRAIN_SECONDS
        )
        completed = await cancel_task_with_deadline(worker_task, drain_seconds)
        if not completed:
            logger.error("notification_worker_drain_timeout")
    await app.state.readiness_probe_coordinator.close()
    client.close()
