from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import asyncio
import csv
import html
import io
import logging
import os
import re
import secrets
import tempfile
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from urllib.parse import urlsplit

import bcrypt
import emailer
import storage
from audit import append_audit_event, append_identity_governance_event
from auth_password import (
    PasswordPolicyError,
    PasswordPolicyUnavailableError,
    PasswordWriteDisabledError,
    build_password_module,
)
from auth_rate_limit import LoginRateLimiter, PublicRateLimiter
from auth_recovery import (
    MongoRecoveryStore,
    PublicSiteOrigin,
    PublicSiteOriginError,
    build_recovery_module,
)
from auth_session import (
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
from auth_sessions import (
    ACCESS_COOKIE,
    CSRF_COOKIE,
    CSRF_HEADER,
    REFRESH_COOKIE,
    AuthSessionService,
    validate_cookie_configuration,
)
from b2b_routes import build_b2b_router
from catalog_routes import build_catalog_router
from content_routes import build_content_router
from csv_safety import safe_csv_row
from dashboard_domain import (
    DashboardRangeError,
    created_within,
    date_bucket,
    distinct_count,
    resolve_date_range,
    summarize_movements,
    withheld_revenue,
)
from database_capabilities import DatabaseCapabilities, probe_database_capabilities
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    Form,
    Header,
    HTTPException,
    Request,
    Response,
    UploadFile,
    status,
)
from fastapi.exceptions import RequestValidationError
from identity_routes import build_identity_router
from inventory_routes import build_inventory_router
from inventory_service import InventoryService
from material_routes import build_material_router
from motor.motor_asyncio import AsyncIOMotorClient
from notification_service import NotificationError, NotificationService
from notification_worker import NotificationDeliveryWorker
from password_policy import validate_password
from permissions import (
    CUSTOMER_ROLES,
    ROLE_LABELS,
    ROLE_POLICY_VERSION,
    canonical_roles,
    has_permission,
    is_internal,
    permissions_for,
)
from portfolio_routes import build_portfolio_router
from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    TypeAdapter,
    ValidationError,
    field_validator,
)
from retail_domain import classify_legacy_order, project_customer_legacy_order
from retail_routes import build_retail_router
from schema_readiness import inspect_schema
from settings_domain import (
    PUBLIC_PROFILE_FIELDS,
    default_settings,
    merge_profile,
    project_admin_settings,
    project_public_settings,
)
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse, StreamingResponse
from transaction_api import transaction_unavailable_handler
from transaction_execution import TransactionExecutor, TransactionUnavailableError
from transaction_guard import TransactionMutationGuard
from transaction_observability import TransactionLogSink

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("niuva")

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

ORDER_STATUSES = [
    "pending_estimate",
    "awaiting_payment",
    "in_process",
    "completed",
    "cancelled",
]

CUSTOMER_QUERY = {
    "$or": [
        {"roles": {"$in": ["retail_customer", "organization_customer"]}},
        {"role": "client"},
    ]
}


@asynccontextmanager
async def lifespan(_application: FastAPI):
    await _startup_runtime()
    try:
        yield
    finally:
        await _shutdown_runtime()


app = FastAPI(title="NIUVA API", lifespan=lifespan)
app.state.database_capabilities = DatabaseCapabilities(transactions=False)
app.state.reservation_expiry_task = None
app.state.notification_worker_task = None
app.state.notification_worker_status = {
    "enabled": False,
    "running": False,
    "last_heartbeat_at": None,
    "last_result": None,
}
app.state.schema_status = {
    "required_version": "unknown",
    "required_versions": [],
    "migrations": {},
    "applied": False,
    "indexes_ready": False,
    "missing_index_count": 0,
    "retired_index_count": 0,
    "ready": False,
}
app.state.transaction_executor = TransactionExecutor(
    client,
    lambda: app.state.database_capabilities,
    event_sink=TransactionLogSink(logging.getLogger("niuva.transaction")),
)
app.state.transaction_guard = TransactionMutationGuard(
    app.state.transaction_executor,
    lambda: os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").strip().lower()
    == "true",
)
app.state.password_recovery_delivery = emailer.PasswordRecoveryDelivery(
    get_database=lambda: db,
)
app.state.admin_session_module = None
app.add_exception_handler(
    TransactionUnavailableError,
    transaction_unavailable_handler,
)


async def password_policy_error_handler(_request, exc):
    return JSONResponse(
        status_code=400,
        content={"detail": {"code": exc.code}},
    )


async def password_policy_unavailable_handler(_request, exc):
    return JSONResponse(
        status_code=503,
        content={"detail": {"code": exc.code}},
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


async def admin_session_error_handler(_request, exc):
    status_code = 403 if isinstance(exc, RequestVerificationError) else 401
    return JSONResponse(
        status_code=status_code,
        content={"detail": {"code": exc.code}},
        headers={"Cache-Control": "no-store"},
    )


app.add_exception_handler(AdminSessionError, admin_session_error_handler)
api = APIRouter(prefix="/api")


def request_id_for(request: Request) -> str:
    return getattr(request.state, "request_id", str(uuid.uuid4()))


def error_payload(request: Request, detail, *, default_code: str) -> dict:
    if isinstance(detail, dict):
        code = str(detail.get("code") or default_code)
        message = str(detail.get("message") or code)
        details = detail.get("details")
    else:
        code = default_code
        message = str(detail)
        details = None
    return {
        # Kept during the contract cutover for existing clients.
        "detail": detail,
        "error": {
            "code": code,
            "message": message,
            **({"details": details} if details is not None else {}),
        },
        "request_id": request_id_for(request),
    }


@app.exception_handler(HTTPException)
async def http_error_envelope(request: Request, exc: HTTPException):
    return JSONResponse(
        error_payload(
            request,
            exc.detail,
            default_code=f"http_{exc.status_code}",
        ),
        status_code=exc.status_code,
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
    return JSONResponse(
        error_payload(
            request,
            detail,
            default_code="request_validation_failed",
        ),
        status_code=422,
    )


@app.exception_handler(Exception)
async def unhandled_error_envelope(request: Request, exc: Exception):
    logger.exception(
        "unhandled_request_error request_id=%s method=%s path=%s",
        request_id_for(request),
        request.method,
        request.url.path,
        exc_info=exc,
    )
    detail = {
        "code": "internal_server_error",
        "message": "Terjadi kesalahan internal.",
    }
    return JSONResponse(
        error_payload(request, detail, default_code="internal_server_error"),
        status_code=500,
    )


@app.middleware("http")
async def request_context(request: Request, call_next):
    supplied = request.headers.get("X-Request-ID", "").strip()
    request.state.request_id = (
        supplied[:128]
        if supplied and re.fullmatch(r"[A-Za-z0-9._:-]+", supplied)
        else str(uuid.uuid4())
    )
    started = datetime.now(timezone.utc)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(
            "request_failed request_id=%s method=%s path=%s",
            request.state.request_id,
            request.method,
            request.url.path,
        )
        raise
    elapsed_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
    response.headers["X-Request-ID"] = request.state.request_id
    logger.info(
        "request_complete request_id=%s method=%s path=%s status=%s elapsed_ms=%s",
        request.state.request_id,
        request.method,
        request.url.path,
        response.status_code,
        elapsed_ms,
    )
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
        request.state.request_id = str(uuid.uuid4())
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
            response = JSONResponse(
                error_payload(
                    request,
                    "CSRF validation failed",
                    default_code="csrf_validation_failed",
                ),
                status_code=403,
            )
            response.headers["X-Request-ID"] = request.state.request_id
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
    return build_recovery_module(
        store=MongoRecoveryStore(db),
        transaction_guard=app.state.transaction_guard,
        passwords=get_password_module(),
        delivery=app.state.password_recovery_delivery,
        public_site_origin=_public_site_origin(),
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

    return AdminSessionModule(
        store=MongoSessionStore(db),
        transaction_guard=app.state.transaction_guard,
        csrf_key=csrf_key,
        user_version_provider=current_token_version,
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
                detail=f"Permission required: {permission}",
            )
        return user

    return dependency


require_admin = require_permission("admin.access")


# ----------------------------- Models -----------------------------
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


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
    validate_password(req.password)
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


def client_ip(request: Request) -> str:
    """Resolve the caller address used to key public rate limits."""
    return request.client.host if request.client else "unknown"


def safe_file_content_type(path: str) -> str:
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    return SAFE_FILE_CONTENT_TYPES.get(ext, "application/octet-stream")


def safe_original_filename(value: str | None) -> str:
    candidate = (value or "upload.bin").replace("\\", "/").rsplit("/", 1)[-1]
    candidate = "".join(
        character
        for character in candidate
        if ord(character) >= 32 and character != "\x7f"
    ).strip()
    return candidate[:255] or "upload.bin"


def validate_image_signature(data: bytes, extension: str) -> bool:
    signatures = {
        "png": data.startswith(b"\x89PNG\r\n\x1a\n"),
        "jpg": data.startswith(b"\xff\xd8\xff"),
        "jpeg": data.startswith(b"\xff\xd8\xff"),
        "webp": len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP",
    }
    return bool(signatures.get(extension, False))


async def store_upload(
    file: UploadFile,
    prefix: str,
    allowed_exts: set,
    *,
    max_size: int = MAX_FILE_SIZE,
    require_image_signature: bool = False,
) -> dict:
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
            if len(signature) < 16:
                signature = (signature + chunk)[:16]
            spool.write(chunk)
        if size == 0:
            raise HTTPException(status_code=400, detail="File is empty")
        if require_image_signature and not validate_image_signature(signature, ext):
            raise HTTPException(
                status_code=400,
                detail={
                    "code": "media_signature_invalid",
                    "message": "Isi file tidak sesuai dengan format gambar.",
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
        logger.exception("Unable to store uploaded file")
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
@api.post("/auth/register")
async def register():
    raise HTTPException(
        status_code=403,
        detail="Public registration is disabled. Client accounts must be provisioned by an administrator.",
    )


def _session_service() -> AuthSessionService:
    return AuthSessionService(
        db=db,
        jwt_secret=JWT_SECRET,
        jwt_algorithm=JWT_ALGO,
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
    await limiter.enforce(account=account, peer_ip=peer_ip)
    try:
        user = await authenticate_credentials(req, surface=surface)
    except HTTPException as exc:
        if exc.status_code == 401:
            await limiter.record_failure(account=account, peer_ip=peer_ip)
        raise
    await limiter.clear_account(account=account)
    await _session_service().issue(user, response)
    return {"user": safe_user(user)}


@api.post("/auth/login")
async def login(req: LoginReq, request: Request, response: Response):
    verify_auth_origin(request)
    return await _perform_login(
        req,
        request,
        response,
        surface="customer",
    )


@api.post("/auth/admin/login")
async def admin_login(req: AdminLoginReq, request: Request):
    verify_admin_origin(request)
    account = req.email.lower()
    peer_ip = client_ip(request)
    limiter = _login_limiter()
    await limiter.enforce(account=account, peer_ip=peer_ip)
    try:
        user = await authenticate_credentials(req, surface="staff")
    except HTTPException as exc:
        if exc.status_code == 401:
            await limiter.record_failure(account=account, peer_ip=peer_ip)
        raise
    await limiter.clear_account(account=account)
    grant = await get_admin_session_module().create_admin_session(
        user,
        req.remember_me,
        {},
    )
    return _admin_session_response(user, grant)


@api.post("/auth/refresh")
async def refresh_session(request: Request, response: Response):
    user = await _session_service().refresh(request, response)
    return {"user": safe_user(user)}


@api.post("/auth/logout")
async def logout_session(request: Request, response: Response):
    await _session_service().logout(request, response)
    return {"ok": True}


@api.post("/auth/admin/session/refresh")
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


@api.get("/auth/admin/session")
async def current_admin_session(request: Request):
    user = await get_admin_user(request, verify_csrf=False)
    return JSONResponse(
        {"user": safe_user(user)},
        headers={"Cache-Control": "no-store"},
    )


@api.post("/auth/admin/logout")
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


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return safe_user(user)


@api.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordReq, request: Request):
    client_host = client_ip(request)
    await rate_limit(f"forgot_password_ip:{client_host}", limit=3, window=900)
    await rate_limit(f"forgot_password_email:{req.email.lower()}", limit=3, window=900)

    return await get_recovery_module().request_password_reset(
        req.email.lower(),
        {"client_ip": client_host},
    )


@api.get("/auth/password-policy")
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
    result = await get_recovery_module().complete_password_reset(
        req.token,
        req.new_password,
    )
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


@api.post("/orders")
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


@api.get("/capabilities")
async def public_capabilities():
    return {
        "retail_discovery": "active",
        "retail_create": "inactive",
        "legacy_order_create": "inactive",
        "checkout": "inactive",
        "payment": "inactive",
        "production_upload": "inactive",
        "organization_portal": "inactive",
    }


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    documents = (
        await db.orders.find({"user_id": user["id"]}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(200)
    )
    return [project_customer_legacy_order(document) for document in documents]


@api.get("/orders/{oid}/design-file")
async def download_legacy_order_design_file(
    oid: str, user: dict = Depends(get_current_user)
):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    file = order.get("file")
    storage_path = file.get("storage_path") if isinstance(file, dict) else None
    if not isinstance(storage_path, str):
        raise HTTPException(status_code=404, detail="File not found")
    return await download_file(storage_path, user)


@api.get("/orders/{oid}")
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    if has_permission(user, "orders.read"):
        raise HTTPException(status_code=403, detail="Forbidden")
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return project_customer_legacy_order(order)


@api.post("/orders/{oid}/payment-proof")
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


@api.get("/admin/payment-capabilities")
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
    value = classify_legacy_order(order)
    if has_permission(actor, "payments.read"):
        return value
    operational_fields = {
        "id",
        "order_number",
        "user_id",
        "user_name",
        "user_email",
        "material_id",
        "material_name",
        "file",
        "notes",
        "status",
        "status_history",
        "created_at",
        "updated_at",
        "record_class",
        "canonical_status_equivalent",
    }
    return {key: value[key] for key in operational_fields if key in value}


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
            estimate = order.get("estimate") or {}
            payment = order.get("payment") or {}
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


@api.get("/admin/media/capabilities")
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
        require_image_signature=True,
    )
    timestamp = now_iso()
    document = {
        **metadata,
        "reference": f"media:{metadata['id']}",
        "owner_id": user["id"],
        "uploaded_by": user["id"],
        "purpose": "admin_media",
        "state": "active",
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    try:
        await db.file_objects.insert_one(dict(document))
    except Exception:
        try:
            storage.delete_object(metadata["storage_path"])
        except storage.StorageError:
            logger.exception("Unable to compensate failed media metadata write")
        raise
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
    try:
        chunks, content_type, size = storage.stream_object(metadata["storage_path"])
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
        logger.exception("Unable to read public media object")
        raise HTTPException(
            status_code=500, detail="Media storage unavailable"
        ) from exc
    if content_type not in {"image/png", "image/jpeg", "image/webp"}:
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
@api.get("/files/{path:path}")
async def download_file(path: str, user: dict = Depends(get_current_user)):
    metadata = await db.file_objects.find_one(
        {"storage_path": path},
        {"_id": 0},
    )
    if not metadata or metadata.get("state") in {"deleted", "quarantined"}:
        raise HTTPException(status_code=404, detail="File not found")
    if (
        not has_permission(user, "files.read")
        and not has_permission(user, "media.read")
        and metadata.get("owner_id") != user["id"]
    ):
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        chunks, _stored_content_type, size = storage.stream_object(path)
    except storage.InvalidStoragePathError as exc:
        raise HTTPException(status_code=400, detail="Invalid file path") from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail="File storage unavailable") from exc
    except storage.StorageNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except storage.StorageError as exc:
        logger.exception("Unable to read stored file")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    return StreamingResponse(
        chunks,
        media_type=safe_file_content_type(metadata["storage_path"]),
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
            "Content-Length": str(size),
        },
    )


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
        logger.exception(
            "Contact inquiry stored, but notification enqueue failed (contact_id=%s)",
            doc["id"],
        )
    return {"ok": True, "message": "Pesan berhasil dikirim"}


@api.get("/admin/contacts")
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
@api.get("/settings")
async def settings_public():
    """The company profile the public site and its footer read from."""
    return project_public_settings(await get_settings())


@api.get("/admin/settings")
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


@api.get("/admin/customers")
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


@api.get("/notifications/unread-count")
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


@api.post("/notifications/read-all")
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


@api.get("/health")
async def health():
    return {
        "status": "ok",
        "transactions": app.state.database_capabilities.transactions,
    }


@api.get("/health/live")
async def health_live():
    return {"status": "ok"}


@api.get("/health/ready")
async def health_ready():
    capabilities = app.state.database_capabilities
    database_available = False
    try:
        await db.command("ping")
        database_available = True
    except Exception:
        logger.warning("Readiness database ping failed")
    schema_status = app.state.schema_status
    worker_required = (
        os.environ.get("NOTIFICATION_WORKER_REQUIRED", "false").lower() == "true"
    )
    worker_status = app.state.notification_worker_status
    worker_task = app.state.notification_worker_task
    heartbeat = worker_status.get("last_heartbeat_at")
    heartbeat_fresh = bool(
        isinstance(heartbeat, datetime)
        and datetime.now(timezone.utc) - heartbeat <= timedelta(seconds=30)
    )
    worker_ready = bool(
        not worker_required
        or (
            worker_status.get("enabled")
            and worker_status.get("running")
            and heartbeat_fresh
            and worker_task is not None
            and not worker_task.done()
        )
    )
    email_required = (
        os.environ.get("EMAIL_DELIVERY_REQUIRED", "false").lower() == "true"
    )
    email_ready = bool(not email_required or emailer.RESEND_API_KEY)
    ready = bool(
        database_available
        and capabilities.transactions
        and schema_status.get("ready")
        and worker_ready
        and email_ready
    )
    payload = {
        "status": "ready" if ready else "not_ready",
        "database": "ready" if database_available else "unavailable",
        "transaction_mutations": (
            "ready" if capabilities.transactions else "unavailable"
        ),
        "schema": schema_status,
        "capabilities": {
            "transactions": capabilities.transaction_diagnostic(),
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
                "status": ("ready" if emailer.RESEND_API_KEY else "inactive"),
                "required": email_required,
            },
        },
    }
    return JSONResponse(payload, status_code=200 if ready else 503)


@api.get("/")
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
            capabilities=app.state.database_capabilities,
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
        get_capabilities=lambda: app.state.database_capabilities,
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
            capabilities=app.state.database_capabilities,
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
        get_capabilities=lambda: app.state.database_capabilities,
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


async def reservation_expiry_loop():
    system_actor = {
        "id": "system:reservation-expiry",
        "email": "system@niuva.local",
        "roles": ["system"],
    }
    while True:
        try:
            service = InventoryService(
                db=db,
                client=client,
                capabilities=app.state.database_capabilities,
                guard=app.state.transaction_guard,
            )
            result = await service.expire_due_reservations(actor=system_actor)
            if result.get("expired"):
                logger.info(
                    "reservation_expiry_batch",
                    extra={"reservation_expiry": result},
                )
        except Exception as exc:
            logger.error("reservation_expiry_loop error: %s", exc)
        await asyncio.sleep(60)


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

    worker = NotificationDeliveryWorker(
        service=NotificationService(db=db),
        worker_id=worker_id,
        deliverers={"email": deliver_email},
    )
    while True:
        try:
            result = await worker.run_once(limit=50)
            app.state.notification_worker_status = {
                "enabled": True,
                "running": True,
                "last_heartbeat_at": datetime.now(timezone.utc),
                "last_result": result,
            }
            if result.get("claimed"):
                logger.info(
                    "notification_outbox_batch",
                    extra={"notification_outbox": result},
                )
        except Exception:
            logger.exception("notification_outbox_loop failed")
            app.state.notification_worker_status = {
                **app.state.notification_worker_status,
                "enabled": True,
                "running": False,
                "last_heartbeat_at": datetime.now(timezone.utc),
            }
        await asyncio.sleep(5)


async def _startup_runtime():
    validate_cookie_configuration()
    storage.init_storage()
    await seed()
    app.state.database_capabilities = await probe_database_capabilities(
        client,
        database_name,
    )
    logger.info(
        "database capability checked transactions=%s reason=%s",
        app.state.database_capabilities.transactions,
        app.state.database_capabilities.transaction_reason.value,
    )
    try:
        app.state.schema_status = await inspect_schema(db)
    except Exception:
        logger.exception("Unable to inspect required database schema")
        app.state.schema_status = {
            **app.state.schema_status,
            "ready": False,
        }
    app.state.reservation_expiry_task = asyncio.create_task(reservation_expiry_loop())
    worker_enabled = (
        os.environ.get("NOTIFICATION_WORKER_ENABLED", "false").lower() == "true"
    )
    app.state.notification_worker_status = {
        "enabled": worker_enabled,
        "running": False,
        "last_heartbeat_at": None,
        "last_result": None,
    }
    if worker_enabled:
        app.state.notification_worker_task = asyncio.create_task(
            notification_outbox_loop(),
        )


async def _shutdown_runtime():
    tasks = [
        app.state.reservation_expiry_task,
        app.state.notification_worker_task,
    ]
    for task in tasks:
        if task is not None:
            task.cancel()
    for task in tasks:
        if task is None:
            continue
        try:
            await task
        except asyncio.CancelledError:
            pass
    client.close()
