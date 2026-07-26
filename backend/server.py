from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import csv
import io
import uuid
import logging
import asyncio
import hashlib
import secrets
import html
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Header, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

import storage
import emailer
from audit import append_audit_event
from b2b_routes import build_b2b_router
from catalog_inventory_indexes import ensure_catalog_inventory_indexes
from catalog_routes import build_catalog_router
from content_routes import build_content_router
from database_capabilities import DatabaseCapabilities, probe_database_capabilities
from identity_routes import build_identity_router
from inventory_routes import build_inventory_router
from inventory_service import InventoryService
from material_routes import build_material_router
from permissions import (
    ROLE_LABELS,
    ROLE_POLICY_VERSION,
    canonical_roles,
    has_permission,
    permissions_for,
)
from transaction_api import transaction_unavailable_handler
from transaction_execution import TransactionExecutor, TransactionUnavailableError
from transaction_guard import TransactionMutationGuard
from transaction_observability import TransactionLogSink

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
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

ORDER_STATUSES = ["pending_estimate", "awaiting_payment", "in_process", "completed", "cancelled"]

CUSTOMER_QUERY = {
    "$or": [
        {"roles": {"$in": ["retail_customer", "organization_customer"]}},
        {"role": "client"},
    ]
}

app = FastAPI(title="NIUVA API")
app.state.database_capabilities = DatabaseCapabilities(transactions=False)
app.state.reservation_expiry_task = None
app.state.transaction_executor = TransactionExecutor(
    client,
    lambda: app.state.database_capabilities,
    event_sink=TransactionLogSink(logging.getLogger("niuva.transaction")),
)
app.state.transaction_guard = TransactionMutationGuard(
    app.state.transaction_executor,
    lambda: os.environ.get(
        "TRANSACTION_MUTATIONS_ENABLED", "false"
    ).strip().lower() == "true",
)
app.add_exception_handler(
    TransactionUnavailableError,
    transaction_unavailable_handler,
)
api = APIRouter(prefix="/api")


# ----------------------------- Auth utils -----------------------------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str, token_version: int = 0) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "token_version": token_version,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_user_from_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGO],
            options={"require": ["sub", "exp", "type"]},
        )
        if payload.get("type") != "access":
            raise jwt.InvalidTokenError("Invalid token type")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db.users.find_one(
        {"id": payload["sub"]},
        {"_id": 0, "password_hash": 0},
    )
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if user.get("status", "active") == "disabled":
        raise HTTPException(status_code=403, detail="User account is disabled")
    # Sessions issued before a password reset (or before this field existed)
    # carry a stale/absent token_version and must be rejected, even if the
    # JWT itself has not expired yet.
    if payload.get("token_version", 0) != user.get("token_version", 0):
        raise HTTPException(status_code=401, detail="Session expired, please log in again")
    return user


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await get_user_from_token(token)


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
class ClientProvisionReq(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: Optional[str] = None
    company: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordReq(BaseModel):
    email: EmailStr


class ResetPasswordReq(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=6)


class EstimateReq(BaseModel):
    amount: float
    note: Optional[str] = ""


class StatusReq(BaseModel):
    status: str
    note: Optional[str] = ""


class BulkStatusReq(BaseModel):
    order_ids: List[str] = Field(min_length=1, max_length=100)
    status: str
    note: Optional[str] = ""


class ContactReq(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=10, max_length=5000)


class AdminNotificationReq(BaseModel):
    target: str = Field(pattern="^(user|segment|broadcast)$")
    user_id: Optional[str] = None
    segment: Optional[str] = Field(default=None, pattern="^(active_orders)$")
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=3, max_length=2000)


class PortfolioReq(BaseModel):
    title_id: str
    title_en: str
    client: Optional[str] = ""
    category: Optional[str] = ""
    description_id: Optional[str] = ""
    description_en: Optional[str] = ""
    images: List[str] = []
    featured: bool = False


class SettingsReq(BaseModel):
    bank_name: str
    account_number: str
    account_holder: str


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
        "role_policy_version": ROLE_POLICY_VERSION,
        "role": roles[0] if roles else "",
        "roles": list(roles),
        "role_labels": [ROLE_LABELS[role] for role in roles],
        "permissions": sorted(permissions_for(user)),
        "version": user.get("version", 1),
        "created_at": user.get("created_at"),
    }


def auth_response(user: dict) -> dict:
    roles = canonical_roles(user)
    primary_role = roles[0] if roles else user.get("role", "")
    token = create_token(user["id"], user["email"], primary_role, user.get("token_version", 0))
    return {"token": token, "user": safe_user(user)}


async def authenticate_credentials(req: LoginReq) -> dict:
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
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
        "password_hash": hash_password(req.password),
        "phone": req.phone or "",
        "company": req.company or "",
        "roles": ["retail_customer"],
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return safe_user(user)


_rate_buckets: dict = {}


def rate_limit(key: str, limit: int = 10, window: int = 60, detail: str = "Terlalu banyak permintaan. Coba lagi sesaat."):
    now = datetime.now(timezone.utc).timestamp()
    bucket = [t for t in _rate_buckets.get(key, []) if now - t < window]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail=detail)
    bucket.append(now)
    _rate_buckets[key] = bucket


def client_ip(request: Request) -> str:
    """Resolve the caller address used to key public rate limits."""
    host = request.client.host if request.client else "unknown"
    if os.environ.get("TRUST_PROXY_HEADERS", "false").lower() == "true":
        host = request.headers.get("x-forwarded-for", host).split(",", 1)[0].strip()
    return host


def safe_file_content_type(path: str) -> str:
    ext = path.rsplit(".", 1)[-1].lower() if "." in path else ""
    return SAFE_FILE_CONTENT_TYPES.get(ext, "application/octet-stream")


async def store_upload(file: UploadFile, prefix: str, allowed_exts: set) -> dict:
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")
    path = f"{APP_NAME}/{prefix}/{uuid.uuid4()}.{ext}"
    content_type = safe_file_content_type(path)
    try:
        result = storage.put_object(path, data, content_type)
    except storage.InvalidStoragePathError as exc:
        logger.warning("Rejected generated storage path")
        raise HTTPException(status_code=400, detail="Invalid file storage path") from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail="File storage unavailable") from exc
    except storage.StorageError as exc:
        logger.exception("Unable to store uploaded file")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    return {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
    }


# ----------------------------- Auth routes -----------------------------
@api.post("/auth/register")
async def register():
    raise HTTPException(
        status_code=403,
        detail="Public registration is disabled. Client accounts must be provisioned by an administrator.",
    )


@api.post("/auth/login")
async def login(req: LoginReq):
    user = await authenticate_credentials(req)
    return auth_response(user)


@api.post("/auth/admin/login")
async def admin_login(req: LoginReq):
    user = await authenticate_credentials(req)
    if not has_permission(user, "admin.access"):
        raise HTTPException(
            status_code=403,
            detail="Permission required: admin.access",
        )
    return auth_response(user)


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return safe_user(user)


RESET_TOKEN_TTL_MINUTES = 30
_GENERIC_FORGOT_PASSWORD_RESPONSE = {
    "ok": True,
    "message": "Jika email terdaftar, instruksi reset password telah dikirim.",
}


def _hash_reset_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()


@api.post("/auth/forgot-password")
async def forgot_password(req: ForgotPasswordReq, request: Request):
    client_host = request.client.host if request.client else "unknown"
    if os.environ.get("TRUST_PROXY_HEADERS", "false").lower() == "true":
        client_host = request.headers.get("x-forwarded-for", client_host).split(",", 1)[0].strip()
    rate_limit(f"forgot_password_ip:{client_host}", limit=3, window=900)
    rate_limit(f"forgot_password_email:{req.email.lower()}", limit=3, window=900)

    # Always return the same generic response whether or not the email is
    # registered, to avoid leaking account existence (user-enumeration).
    user = await db.users.find_one({"email": req.email.lower()}, {"_id": 0, "id": 1, "email": 1, "name": 1})
    if not user:
        return _GENERIC_FORGOT_PASSWORD_RESPONSE

    # Invalidate any earlier unused tokens for this user before issuing a new one.
    await db.password_reset_tokens.update_many(
        {"user_id": user["id"], "used_at": None},
        {"$set": {"used_at": now_iso()}},
    )
    raw_token = secrets.token_urlsafe(32)
    created_at = datetime.now(timezone.utc)
    await db.password_reset_tokens.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "token_hash": _hash_reset_token(raw_token),
        "expires_at": (created_at + timedelta(minutes=RESET_TOKEN_TTL_MINUTES)).isoformat(),
        "used_at": None,
        "created_at": created_at.isoformat(),
    })

    site_url = (os.environ.get("REACT_APP_PUBLIC_SITE_URL") or "").rstrip("/")
    reset_link = f"{site_url}/reset-password?token={raw_token}"
    await emailer.send_email(
        user["email"],
        "Reset Password — NIUVA",
        "Permintaan reset password",
        f"<p>Kami menerima permintaan untuk mereset password akun Anda.</p>"
        f"<p>Link ini berlaku selama {RESET_TOKEN_TTL_MINUTES} menit: "
        f"<a href=\"{reset_link}\">{reset_link}</a></p>"
        f"<p>Jika Anda tidak meminta ini, abaikan email ini.</p>",
        db=db, user_id=user["id"],
    )
    return _GENERIC_FORGOT_PASSWORD_RESPONSE


@api.post("/auth/reset-password")
async def reset_password(req: ResetPasswordReq):
    token_hash = _hash_reset_token(req.token)
    now = datetime.now(timezone.utc).isoformat()
    record = await db.password_reset_tokens.find_one(
        {"token_hash": token_hash, "used_at": None, "expires_at": {"$gt": now}},
        {"_id": 0},
    )
    if not record:
        raise HTTPException(status_code=400, detail="Link reset tidak valid atau sudah kedaluwarsa.")

    user = await db.users.find_one({"id": record["user_id"]}, {"_id": 0, "id": 1, "token_version": 1})
    if not user:
        raise HTTPException(status_code=400, detail="Link reset tidak valid atau sudah kedaluwarsa.")

    await db.users.update_one(
        {"id": user["id"]},
        {
            "$set": {"password_hash": hash_password(req.new_password)},
            "$inc": {"token_version": 1},
        },
    )
    await db.password_reset_tokens.update_many(
        {"user_id": user["id"], "used_at": None},
        {"$set": {"used_at": now}},
    )
    return {"ok": True, "message": "Password berhasil diubah. Silakan login dengan password baru."}


# ----------------------------- Orders -----------------------------
async def get_settings():
    s = await db.settings.find_one({"key": "site"}, {"_id": 0})
    if not s:
        s = {
            "key": "site",
            "bank_name": "Bank Mandiri (Placeholder)",
            "account_number": "000-0000-0000",
            "account_holder": "PT Niuva Inovasi Utama",
        }
        await db.settings.insert_one(dict(s))
    return s


@api.post("/orders")
async def create_order(
    file: UploadFile = File(...),
    material_id: str = Form(...),
    notes: str = Form(""),
    user: dict = Depends(get_current_user),
):
    rate_limit(f"order:{user['id']}", limit=10, window=60)
    material = await db.materials.find_one({"id": material_id, "active": True}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=400, detail="Invalid material selected")
    file_meta = await store_upload(file, f"orders/{user['id']}", DESIGN_EXTS)

    count = await db.orders.count_documents({})
    order_number = f"NIV-{datetime.now(timezone.utc).strftime('%y%m')}-{count + 1:04d}"
    ts = now_iso()
    order = {
        "id": str(uuid.uuid4()),
        "order_number": order_number,
        "user_id": user["id"],
        "user_email": user["email"],
        "user_name": user["name"],
        "material_id": material_id,
        "material_name": material["name"],
        "file": file_meta,
        "notes": notes,
        "status": "pending_estimate",
        "estimate": None,
        "payment": None,
        "status_history": [{"status": "pending_estimate", "at": ts, "note": "Order received"}],
        "created_at": ts,
        "updated_at": ts,
    }
    await db.orders.insert_one(order)
    await emailer.send_email(
        user["email"],
        f"Pesanan {order_number} Diterima — NIUVA",
        "Pesanan Anda telah diterima",
        f"<p>Terima kasih! Pesanan <strong>{order_number}</strong> telah kami terima.</p>"
        f"<p>File <strong>{file_meta['original_filename']}</strong> sedang ditinjau oleh Engineer kami. "
        f"Estimasi harga akan dikirim dalam maksimal <strong>1x24 jam</strong>.</p>",
        db=db, user_id=user["id"],
    )
    order.pop("_id", None)
    return order


@api.get("/orders")
async def my_orders(user: dict = Depends(get_current_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/orders/{oid}")
async def get_order(oid: str, user: dict = Depends(get_current_user)):
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not has_permission(user, "orders.read") and order["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return order


@api.post("/orders/{oid}/payment-proof")
async def upload_payment_proof(oid: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
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
        writer.writerow({key: row.get(key, "") for key in fieldnames})
    return Response(
        content=buffer.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


def serialize_admin_order_for(actor: dict, order: dict) -> dict:
    """Return a role-safe order representation for internal readers."""
    value = {key: item for key, item in order.items() if key != "_id"}
    if has_permission(actor, "payments.read"):
        return value
    operational_fields = {
        "id", "order_number", "user_id", "user_name", "user_email", "material_id",
        "material_name", "file", "notes", "status", "status_history", "created_at", "updated_at",
    }
    return {key: value[key] for key in operational_fields if key in value}


# ----------------------------- Admin orders -----------------------------
@api.get("/admin/orders")
async def admin_orders(
    status: Optional[str] = None,
    user: dict = Depends(require_permission("orders.read")),
):
    q = {"status": status} if status else {}
    return [serialize_admin_order_for(user, order) for order in await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)]


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
        "order_number", "user_name", "user_email", "material_name",
        "status", "created_at", "updated_at",
    ]
    if include_payment:
        fieldnames += ["estimate_amount", "estimate_currency", "payment_verified"]

    rows = []
    for order in await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(500):
        safe = serialize_admin_order_for(user, order)
        row = {key: safe.get(key, "") for key in fieldnames if not key.startswith(("estimate_", "payment_"))}
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
    """Advance one order's status and append status history. Raises HTTPException on invalid input."""
    if status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one(
        {"id": oid},
        {"$set": {"status": status, "updated_at": now_iso()},
         "$push": {"status_history": {"status": status, "at": now_iso(), "note": note}}},
    )
    if status == "completed":
        await emailer.send_email(
            order["user_email"],
            f"Pesanan Selesai — {order['order_number']}",
            "Pesanan Anda telah selesai",
            f"<p>Pesanan <strong>{order['order_number']}</strong> telah <strong>selesai</strong>. "
            f"Tim kami akan menghubungi Anda untuk pengambilan/pengiriman.</p>",
            db=db, user_id=order["user_id"],
        )
    return await db.orders.find_one({"id": oid}, {"_id": 0})


@api.post("/admin/orders/{oid}/status")
async def update_status(
    oid: str,
    req: StatusReq,
    user: dict = Depends(require_permission("orders.write")),
):
    return serialize_admin_order_for(user, await apply_order_status(oid, req.status, req.note))


@api.post("/admin/orders/bulk-status")
async def bulk_update_status(
    req: BulkStatusReq,
    user: dict = Depends(require_permission("orders.write")),
):
    if req.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    results = []
    for oid in req.order_ids:
        try:
            await apply_order_status(oid, req.status, req.note)
            results.append({"id": oid, "success": True, "error": None})
        except HTTPException as exc:
            results.append({"id": oid, "success": False, "error": exc.detail})
    return {"results": results}


# ----------------------------- File download -----------------------------
@api.get("/files/{path:path}")
async def download_file(path: str, request: Request):
    authorization = request.headers.get("Authorization", "")
    token = authorization[7:] if authorization.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await get_user_from_token(token)
    # Staff with file-read access can fetch shared files; customers remain path-scoped.
    if not has_permission(user, "files.read") and f"/{user['id']}/" not in f"/{path}":
        raise HTTPException(status_code=403, detail="Forbidden")
    try:
        data, _stored_content_type = storage.get_object(path)
    except storage.InvalidStoragePathError as exc:
        raise HTTPException(status_code=400, detail="Invalid file path") from exc
    except storage.StorageUnavailableError as exc:
        raise HTTPException(status_code=503, detail="File storage unavailable") from exc
    except storage.StorageNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except storage.StorageError as exc:
        logger.exception("Unable to read stored file")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    return Response(
        content=data,
        media_type=safe_file_content_type(path),
        headers={
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
        },
    )


# ----------------------------- Contact -----------------------------
@api.post("/contact")
async def contact(req: ContactReq, request: Request):
    rate_limit(f"contact:{client_ip(request)}", limit=5, window=600)

    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.contacts.insert_one(dict(doc))
    try:
        email_result = await emailer.send_email(
            HRD_EMAIL,
            f"Inquiry Baru: {req.subject}",
            "Pesan Kontak Baru",
            f"<p>Dari <strong>{html.escape(req.name)}</strong> ({html.escape(str(req.email))})</p>"
            f"<p>{html.escape(req.message).replace(chr(10), '<br>')}</p>",
            db=db,
        )
        if email_result.get("status") == "error":
            logger.error("Contact inquiry stored, but notification email failed (contact_id=%s)", doc["id"])
    except Exception:
        logger.exception("Contact inquiry stored, but notification email failed (contact_id=%s)", doc["id"])
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
        await db.contacts.find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    )
    return [
        {**document, "record_class": "legacy_contact", "read_only": True}
        for document in documents
    ]


# ----------------------------- Portfolio -----------------------------
@api.get("/portfolio")
async def list_portfolio():
    return await db.portfolio.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/portfolio")
async def create_portfolio(
    req: PortfolioReq,
    user: dict = Depends(require_permission("content.write")),
):
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.portfolio.insert_one(dict(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/admin/portfolio/{pid}")
async def update_portfolio(
    pid: str,
    req: PortfolioReq,
    user: dict = Depends(require_permission("content.write")),
):
    res = await db.portfolio.update_one({"id": pid}, {"$set": req.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.portfolio.find_one({"id": pid}, {"_id": 0})


@api.delete("/admin/portfolio/{pid}")
async def delete_portfolio(
    pid: str,
    user: dict = Depends(require_permission("content.write")),
):
    await db.portfolio.delete_one({"id": pid})
    return {"ok": True}


# ----------------------------- Settings & Users -----------------------------
@api.get("/settings")
async def settings_public():
    s = await get_settings()
    return {k: v for k, v in s.items() if k != "key"}


@api.put("/admin/settings")
async def update_settings(
    req: SettingsReq,
    user: dict = Depends(require_permission("settings.write")),
):
    await db.settings.update_one({"key": "site"}, {"$set": req.model_dump()}, upsert=True)
    s = await get_settings()
    return {k: v for k, v in s.items() if k != "key"}


@api.post("/admin/users", status_code=201)
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
    customer_roles = {("retail_customer",), ("organization_customer",)}
    return [
        safe_user(candidate)
        for candidate in candidates
        if canonical_roles(candidate) in customer_roles
    ]

@api.get("/admin/stats")
async def admin_stats(
    user: dict = Depends(require_permission("dashboard.read")),
):
    total_orders = await db.orders.count_documents({})
    pending = await db.orders.count_documents({"status": "pending_estimate"})
    awaiting = await db.orders.count_documents({"status": "awaiting_payment"})
    in_process = await db.orders.count_documents({"status": "in_process"})
    completed = await db.orders.count_documents({"status": "completed"})
    clients = await db.users.count_documents(CUSTOMER_QUERY)
    return {
        "total_orders": total_orders, "pending_estimate": pending, "awaiting_payment": awaiting,
        "in_process": in_process, "completed": completed, "clients": clients,
    }


def _validate_date(value: str, label: str) -> str:
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail=f"{label} must be YYYY-MM-DD")
    return value


def _date_bucket(timestamp: str) -> str:
    return (timestamp or "")[:10]


@api.get("/admin/stats/timeseries")
async def admin_stats_timeseries(
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
    now = datetime.now(timezone.utc)
    start = _validate_date(date_from or (now - timedelta(days=30)).strftime("%Y-%m-%d"), "date_from")
    end = _validate_date(date_to or now.strftime("%Y-%m-%d"), "date_to")

    orders = await db.orders.find(
        {"created_at": {"$gte": start, "$lte": f"{end}T23:59:59"}},
        {"_id": 0, "created_at": 1, "status": 1, "payment": 1, "estimate": 1},
    ).to_list(5000)

    orders_by_status: dict = {}
    for order in orders:
        bucket = _date_bucket(order.get("created_at"))
        row = orders_by_status.setdefault(bucket, {status: 0 for status in ORDER_STATUSES})
        status = order.get("status")
        if status in row:
            row[status] += 1

    series = {"orders_by_status": [{"date": date, **counts} for date, counts in sorted(orders_by_status.items())]}

    if has_permission(user, "inventory.read"):
        movements = await db.stock_movements.find(
            {"created_at": {"$gte": start, "$lte": f"{end}T23:59:59"}},
            {"_id": 0, "created_at": 1, "movement_type": 1},
        ).to_list(5000)
        movement_totals: dict = {}
        for movement in movements:
            bucket = _date_bucket(movement.get("created_at"))
            row = movement_totals.setdefault(bucket, {})
            movement_type = movement.get("movement_type", "unknown")
            row[movement_type] = row.get(movement_type, 0) + 1
        series["stock_movements"] = [{"date": date, **counts} for date, counts in sorted(movement_totals.items())]

    if has_permission(user, "payments.read"):
        revenue_totals: dict = {}
        for order in orders:
            payment = order.get("payment") or {}
            if not payment.get("verified"):
                continue
            bucket = _date_bucket(payment.get("verified_at") or order.get("created_at"))
            amount = (order.get("estimate") or {}).get("amount") or 0
            revenue_totals[bucket] = revenue_totals.get(bucket, 0) + amount
        series["revenue"] = [{"date": date, "amount": amount} for date, amount in sorted(revenue_totals.items())]

    return {"date_from": start, "date_to": end, "series": series}


@api.get("/notifications")
async def my_notifications(user: dict = Depends(get_current_user)):
    return await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)


async def resolve_notification_recipients(req: AdminNotificationReq) -> list:
    """Return safe recipient projections ({id, email, name}) for the requested target."""
    if req.target == "user":
        if not req.user_id:
            raise HTTPException(status_code=400, detail="user_id is required for target=user")
        recipient = await db.users.find_one({"id": req.user_id}, {"_id": 0, "id": 1, "email": 1, "name": 1})
        if not recipient:
            raise HTTPException(status_code=404, detail="User not found")
        return [recipient]

    if req.target == "segment":
        if req.segment == "active_orders":
            order_user_ids = await db.orders.distinct(
                "user_id", {"status": {"$in": ["awaiting_payment", "in_process"]}}
            )
            return await db.users.find(
                {"id": {"$in": order_user_ids}}, {"_id": 0, "id": 1, "email": 1, "name": 1}
            ).to_list(500)
        raise HTTPException(status_code=400, detail="segment is required and must be a known segment for target=segment")

    return await db.users.find(CUSTOMER_QUERY, {"_id": 0, "id": 1, "email": 1, "name": 1}).to_list(500)


@api.post("/admin/notifications")
async def send_admin_notification(
    req: AdminNotificationReq,
    actor: dict = Depends(require_permission("notifications.write")),
):
    rate_limit(f"admin_notify:{actor['id']}", limit=10, window=600)
    recipients = await resolve_notification_recipients(req)
    sent_count = 0
    for recipient in recipients:
        await emailer.send_email(
            recipient["email"], req.subject, req.subject,
            html.escape(req.message).replace(chr(10), "<br>"),
            db=db, user_id=recipient["id"],
        )
        sent_count += 1
    log_entry = {
        "id": str(uuid.uuid4()),
        "target": req.target,
        "user_id": req.user_id,
        "segment": req.segment,
        "subject": req.subject,
        "message": req.message,
        "recipient_count": sent_count,
        "sent_by": actor["id"],
        "created_at": now_iso(),
    }
    await db.admin_notification_log.insert_one(dict(log_entry))
    await append_audit_event(
        db, actor=actor, action="notifications.sent",
        target_type="notification", target_id=log_entry["id"],
        after={"target": req.target, "segment": req.segment, "recipient_count": sent_count},
    )
    log_entry.pop("_id", None)
    return log_entry


@api.get("/admin/notifications/sent")
async def list_sent_notifications(
    limit: int = 50,
    _actor: dict = Depends(require_permission("notifications.write")),
):
    return await db.admin_notification_log.find({}, {"_id": 0}).sort("created_at", -1).to_list(min(limit, 200))


@api.get("/health")
async def health():
    return {"status": "ok", "transactions": app.state.database_capabilities.transactions}


@api.get("/health/live")
async def health_live():
    return {"status": "ok"}


@api.get("/health/ready")
async def health_ready():
    capabilities = app.state.database_capabilities
    transaction_mutations = "ready" if capabilities.transactions else "unavailable"
    return {
        "status": "ready" if capabilities.transactions else "degraded",
        "transaction_mutations": transaction_mutations,
        "capabilities": {
            "transactions": capabilities.transaction_diagnostic(),
        },
    }


@api.get("/")
async def root():
    return {"message": "NIUVA API", "status": "ok"}


api.include_router(
    build_identity_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        safe_user=safe_user,
        hash_password=hash_password,
    )
)


def throttle_inquiry_intake(request: Request) -> None:
    """Throttle anonymous project intake at parity with the legacy form."""
    rate_limit(f"inquiry:{client_ip(request)}", limit=5, window=600)


async def notify_new_inquiry(inquiry: dict) -> None:
    """Announce a captured lead. The router swallows failures so intake holds."""
    result = await emailer.send_email(
        HRD_EMAIL,
        f"Inquiry Baru: {inquiry['company']}",
        "Inquiry Proyek Baru",
        f"<p><strong>{html.escape(inquiry['company'])}</strong></p>"
        f"<p>PIC: {html.escape(inquiry['pic_name'])} "
        f"({html.escape(inquiry['pic_email'])})</p>"
        f"<p>Kebutuhan: {html.escape(inquiry['need'])}</p>"
        f"<p>Timeline: {html.escape(inquiry['timeline'] or '-')}</p>"
        f"<p>{html.escape(inquiry['brief']).replace(chr(10), '<br>')}</p>",
        db=db,
    )
    if result.get("status") == "error":
        logger.error(
            "Inquiry stored, but notification email failed (inquiry_id=%s)",
            inquiry["id"],
        )


api.include_router(
    build_b2b_router(
        get_db=lambda: db,
        get_transaction_guard=lambda: app.state.transaction_guard,
        require_permission=require_permission,
        throttle_intake=throttle_inquiry_intake,
        notify_inquiry=notify_new_inquiry,
    )
)

api.include_router(
    build_catalog_router(
        get_db=lambda: db,
        get_client=lambda: client,
        get_capabilities=lambda: app.state.database_capabilities,
        require_permission=require_permission,
    )
)
api.include_router(
    build_material_router(
        get_db=lambda: db,
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
            emailer=emailer,
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
        require_permission=require_permission,
    )
)

app.include_router(api)

cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]
if "*" in cors_origins:
    raise RuntimeError("CORS_ORIGINS must contain exact trusted origins when credentials are enabled")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------- Startup -----------------------------
async def seed():
    await db.users.create_index("email", unique=True)
    inquiries = getattr(db, "inquiries", None)
    if inquiries is not None:
        await inquiries.create_index("id", unique=True)
        await inquiries.create_index([("status", 1), ("updated_at", -1)])
    quotes = getattr(db, "b2b_quotes", None)
    if quotes is not None:
        await quotes.create_index("id", unique=True)
        await quotes.create_index("inquiry_id", unique=True)
    quote_versions = getattr(db, "b2b_quote_versions", None)
    if quote_versions is not None:
        await quote_versions.create_index("id", unique=True)
        await quote_versions.create_index(
            [("quote_id", 1), ("revision", 1)],
            unique=True,
        )
    projects = getattr(db, "b2b_projects", None)
    if projects is not None:
        await projects.create_index("id", unique=True)
        await projects.create_index("quote_id", unique=True)
        await projects.create_index([("status", 1), ("updated_at", -1)])
    work_orders = getattr(db, "work_orders", None)
    if work_orders is not None:
        await work_orders.create_index("id", unique=True)
        await work_orders.create_index([("project_id", 1), ("updated_at", -1)])
        await work_orders.create_index([("status", 1), ("updated_at", -1)])
    await db.users.create_index("id", unique=True)
    await db.users.create_index([("roles", 1), ("status", 1)])
    await db.audit_events.create_index("id", unique=True)
    await db.audit_events.create_index("created_at")
    await db.audit_events.create_index("actor_user_id")
    await db.audit_events.create_index([("target_type", 1), ("target_id", 1)])
    await db.organizations.create_index("id", unique=True)
    await db.organizations.create_index("status")
    await db.organization_memberships.create_index("id", unique=True)
    await db.organization_memberships.create_index(
        [("organization_id", 1), ("user_id", 1)], unique=True
    )
    await db.organization_memberships.create_index([("user_id", 1), ("status", 1)])
    await db.orders.create_index("id", unique=True)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "NIUVA Admin", "email": admin_email,
            "password_hash": hash_password(admin_password), "phone": "", "company": "PT Niuva Inovasi Utama",
            "roles": [], "status": "active",
            "access_state": "access_review_required",
            "role_policy_version": ROLE_POLICY_VERSION,
            "created_at": now_iso(),
        })
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})

    if await db.materials.count_documents({}) == 0:
        defaults = [
            {"name": "PLA", "description": "Polylactic Acid — serbaguna, ramah lingkungan", "color": "Multi"},
            {"name": "ABS", "description": "Kuat & tahan panas, cocok untuk fungsional part", "color": "Black/White"},
            {"name": "PETG", "description": "Tahan benturan & kimia, semi-fleksibel", "color": "Clear"},
            {"name": "Resin (SLA)", "description": "Detail tinggi untuk prototipe presisi", "color": "Grey"},
            {"name": "TPU", "description": "Fleksibel & elastis untuk part lentur", "color": "Black"},
        ]
        for m in defaults:
            await db.materials.insert_one({"id": str(uuid.uuid4()), **m, "active": True, "created_at": now_iso()})

    if await db.portfolio.count_documents({}) == 0:
        seeds = [
            {
                "title_id": "MotoEV V3 x PT Pindad", "title_en": "MotoEV V3 x PT Pindad",
                "client": "PT Pindad", "category": "EV Design",
                "description_id": "Desain & prototipe motor listrik generasi ketiga hasil kolaborasi strategis dengan PT Pindad.",
                "description_en": "Third-generation electric motorcycle design & prototype in strategic collaboration with PT Pindad.",
                "images": ["https://images.unsplash.com/photo-1737982560500-e152da0e770e?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"],
                "featured": True,
            },
            {
                "title_id": "Casing Prototipe Industrial", "title_en": "Industrial Prototype Casing",
                "client": "Bandung Techno Park", "category": "3D Printing",
                "description_id": "Pencetakan 3D presisi untuk casing perangkat IoT industrial.",
                "description_en": "Precision 3D printing for industrial IoT device casings.",
                "images": ["https://images.unsplash.com/photo-1642969164999-979483e21601?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"],
                "featured": True,
            },
            {
                "title_id": "Rapid Prototyping Komponen", "title_en": "Rapid Component Prototyping",
                "client": "TelU Makerspace", "category": "Prototyping",
                "description_id": "Iterasi cepat komponen mekanik dari konsep ke prototipe fungsional.",
                "description_en": "Rapid iteration of mechanical components from concept to functional prototype.",
                "images": ["https://images.unsplash.com/photo-1555550252-fc3187f10240?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200"],
                "featured": False,
            },
        ]
        for p in seeds:
            await db.portfolio.insert_one({"id": str(uuid.uuid4()), **p, "created_at": now_iso()})

    await get_settings()
    logger.info("Seed complete")


async def auto_delete_loop():
    """Soft-delete design files for awaiting_payment orders older than 14 days."""
    while True:
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
            stale = await db.orders.find(
                {"status": "awaiting_payment", "created_at": {"$lt": cutoff}, "file.deleted": {"$ne": True}},
                {"_id": 0, "id": 1},
            ).to_list(500)
            for o in stale:
                await db.orders.update_one({"id": o["id"]}, {"$set": {"file.deleted": True}})
            if stale:
                logger.info(f"Auto-deleted design files for {len(stale)} stale orders")
        except Exception as e:
            logger.error(f"auto_delete_loop error: {e}")
        await asyncio.sleep(6 * 3600)


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
                emailer=emailer,
            )
            await service.expire_due_reservations(actor=system_actor)
        except Exception as exc:
            logger.error("reservation_expiry_loop error: %s", exc)
        await asyncio.sleep(60)


@app.on_event("startup")
async def startup():
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
    await ensure_catalog_inventory_indexes(db)
    asyncio.create_task(auto_delete_loop())
    app.state.reservation_expiry_task = asyncio.create_task(reservation_expiry_loop())


@app.on_event("shutdown")
async def shutdown():
    expiry_task = app.state.reservation_expiry_task
    if expiry_task is not None:
        expiry_task.cancel()
        try:
            await expiry_task
        except asyncio.CancelledError:
            pass
    client.close()
