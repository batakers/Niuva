from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import asyncio
import html
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Query, Header, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ReturnDocument
from pydantic import BaseModel, EmailStr, Field

import storage
import emailer

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("niuva")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGO = "HS256"
HRD_EMAIL = os.environ.get("HRD_EMAIL", "hrd@niuva.com")
APP_NAME = os.environ.get("APP_NAME", "niuva")

MAX_FILE_SIZE = 50 * 1024 * 1024
DESIGN_EXTS = {"stl", "obj"}
IMAGE_EXTS = {"jpg", "jpeg", "png", "webp", "gif", "pdf"}

ORDER_STATUSES = ["pending_estimate", "awaiting_payment", "in_process", "completed", "cancelled"]
MERCHANDISE_ORDER_STATUSES = ["submitted", "confirmed", "in_process", "completed", "cancelled"]

app = FastAPI(title="NIUVA API")
api = APIRouter(prefix="/api")


# ----------------------------- Auth utils -----------------------------
def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode(), bcrypt.gensalt()).decode()


def verify_password(p: str, h: str) -> bool:
    try:
        return bcrypt.checkpw(p.encode(), h.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
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


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


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


class MaterialReq(BaseModel):
    name: str
    description: Optional[str] = ""
    color: Optional[str] = ""
    active: bool = True


class EstimateReq(BaseModel):
    amount: float
    note: Optional[str] = ""


class StatusReq(BaseModel):
    status: str
    note: Optional[str] = ""


class InternshipReq(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=6, max_length=40)
    university: str = Field(min_length=2, max_length=180)
    major: str = Field(min_length=2, max_length=120)
    semester: Optional[str] = Field(default="", max_length=60)
    duration: Optional[str] = Field(default="", max_length=80)
    motivation: str = Field(min_length=10, max_length=5000)
    portfolio_url: Optional[str] = Field(default="", max_length=500)


class ContactReq(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=3, max_length=180)
    message: str = Field(min_length=10, max_length=5000)


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


class MerchandisePrintMethodReq(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    price: int = Field(ge=0)
    minOrder: int = Field(default=1, ge=1)


class MerchandiseReq(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    basePrice: int = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    description: str = Field(default="", max_length=2000)
    image: str = Field(default="🛍️", max_length=16)
    sizes: List[str] = Field(default_factory=list, max_length=30)
    colors: List[str] = Field(default_factory=list, max_length=30)
    printMethods: List[MerchandisePrintMethodReq] = Field(default_factory=list, max_length=20)
    active: bool = True


class MerchandiseOrderReq(BaseModel):
    product_id: str = Field(min_length=1)
    quantity: int = Field(ge=1, le=100000)
    color: str = Field(default="", max_length=120)
    size: str = Field(default="", max_length=60)
    print_method: str = Field(min_length=1, max_length=120)
    customer_name: str = Field(min_length=2, max_length=120)
    customer_email: EmailStr
    customer_phone: str = Field(min_length=6, max_length=40)
    notes: str = Field(default="", max_length=3000)


class MerchandiseOrderStatusReq(BaseModel):
    status: str
    note: str = Field(default="", max_length=1000)


# ----------------------------- Helpers -----------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def auth_response(user: dict) -> dict:
    token = create_token(user["id"], user["email"], user["role"])
    return {
        "token": token,
        "user": {
            key: user.get(key)
            for key in ("id", "name", "email", "role", "phone", "company")
        },
    }


async def authenticate_credentials(req: LoginReq) -> dict:
    user = await db.users.find_one({"email": req.email.lower()})
    if not user or not verify_password(req.password, user["password_hash"]):
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
        "role": "client",
        "created_at": now_iso(),
    }
    await db.users.insert_one(user)
    return {
        key: user[key]
        for key in ("id", "name", "email", "role", "phone", "company", "created_at")
    }


_rate_buckets: dict = {}


def rate_limit(key: str, limit: int = 10, window: int = 60, detail: str = "Terlalu banyak permintaan. Coba lagi sesaat."):
    now = datetime.now(timezone.utc).timestamp()
    bucket = [t for t in _rate_buckets.get(key, []) if now - t < window]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail=detail)
    bucket.append(now)
    _rate_buckets[key] = bucket


async def store_upload(file: UploadFile, prefix: str, allowed_exts: set) -> dict:
    ext = (file.filename.rsplit(".", 1)[-1] if "." in file.filename else "bin").lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"File type .{ext} not allowed")
    data = await file.read()
    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 50MB limit")
    path = f"{APP_NAME}/{prefix}/{uuid.uuid4()}.{ext}"
    result = storage.put_object(path, data, file.content_type or "application/octet-stream")
    return {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type or "application/octet-stream",
        "size": result.get("size", len(data)),
    }


def request_client_host(request: Request) -> str:
    """Use forwarded client IP only when a trusted proxy is configured."""
    host = request.client.host if request.client else "unknown"
    if os.environ.get("TRUST_PROXY_HEADERS", "false").lower() == "true":
        return request.headers.get("x-forwarded-for", host).split(",", 1)[0].strip()
    return host


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
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return auth_response(user)


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return user


# ----------------------------- Materials -----------------------------
@api.get("/materials")
async def list_materials():
    q = {"active": True}
    items = await db.materials.find(q, {"_id": 0}).sort("name", 1).to_list(200)
    return items


@api.get("/admin/materials")
async def admin_materials(user: dict = Depends(require_admin)):
    return await db.materials.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/materials")
async def create_material(req: MaterialReq, user: dict = Depends(require_admin)):
    mat = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.materials.insert_one(mat)
    return {k: v for k, v in mat.items() if k != "_id"}


@api.put("/admin/materials/{mid}")
async def update_material(mid: str, req: MaterialReq, user: dict = Depends(require_admin)):
    res = await db.materials.update_one({"id": mid}, {"$set": req.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Material not found")
    return await db.materials.find_one({"id": mid}, {"_id": 0})


@api.delete("/admin/materials/{mid}")
async def delete_material(mid: str, user: dict = Depends(require_admin)):
    await db.materials.delete_one({"id": mid})
    return {"ok": True}


# ----------------------------- Merchandise catalog -----------------------------
@api.get("/merchandise")
async def list_merchandise():
    """Public catalog. Only products deliberately published by an admin are exposed."""
    return await db.merchandise.find({"active": True}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.get("/admin/merchandise")
async def admin_merchandise(user: dict = Depends(require_admin)):
    return await db.merchandise.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/merchandise", status_code=201)
async def create_merchandise(req: MerchandiseReq, user: dict = Depends(require_admin)):
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso(), "updated_at": now_iso()}
    await db.merchandise.insert_one(dict(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/admin/merchandise/{product_id}")
async def update_merchandise(product_id: str, req: MerchandiseReq, user: dict = Depends(require_admin)):
    res = await db.merchandise.update_one(
        {"id": product_id},
        {"$set": {**req.model_dump(), "updated_at": now_iso()}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Produk merchandise tidak ditemukan")
    return await db.merchandise.find_one({"id": product_id}, {"_id": 0})


@api.delete("/admin/merchandise/{product_id}")
async def delete_merchandise(product_id: str, user: dict = Depends(require_admin)):
    res = await db.merchandise.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produk merchandise tidak ditemukan")
    return {"ok": True}


@api.post("/merchandise/orders", status_code=201)
async def create_merchandise_order(req: MerchandiseOrderReq, request: Request):
    """Save a merchandise order before opening the WhatsApp confirmation flow."""
    rate_limit(f"merchandise-order:{request_client_host(request)}", limit=5, window=600)
    product = await db.merchandise.find_one({"id": req.product_id, "active": True}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produk tidak tersedia")
    if product.get("sizes") and req.size not in product["sizes"]:
        raise HTTPException(status_code=400, detail="Ukuran produk tidak valid")
    if product.get("colors") and req.color not in product["colors"]:
        raise HTTPException(status_code=400, detail="Warna produk tidak valid")
    print_method = next((item for item in product.get("printMethods", []) if item["name"] == req.print_method), None)
    if not print_method:
        raise HTTPException(status_code=400, detail="Metode cetak tidak valid")
    if req.quantity < print_method.get("minOrder", 1):
        raise HTTPException(status_code=400, detail=f"Minimal pesanan {print_method.get('minOrder', 1)} pcs")

    # Reserve stock atomically so two customers cannot order the same final units.
    reserved = await db.merchandise.find_one_and_update(
        {"id": req.product_id, "active": True, "stock": {"$gte": req.quantity}},
        {"$inc": {"stock": -req.quantity}, "$set": {"updated_at": now_iso()}},
        return_document=ReturnDocument.AFTER,
    )
    if not reserved:
        raise HTTPException(status_code=400, detail="Stok tidak mencukupi")

    subtotal = (product["basePrice"] + print_method["price"]) * req.quantity
    discount = round(subtotal * 0.1) if req.quantity >= 50 else 0
    tax = round(subtotal * 0.1)
    period = datetime.now(timezone.utc).strftime("%y%m")
    counter = await db.counters.find_one_and_update(
        {"_id": f"merchandise_order_number:{period}"},
        {"$inc": {"value": 1}}, upsert=True, return_document=ReturnDocument.AFTER,
    )
    ts = now_iso()
    order = {
        "id": str(uuid.uuid4()), "order_number": f"MRCH-{period}-{counter['value']:04d}",
        "product_id": product["id"], "product_name": product["name"], "product_image": product.get("image", "🛍️"),
        "quantity": req.quantity, "color": req.color, "size": req.size,
        "print_method": {"name": print_method["name"], "price": print_method["price"], "minOrder": print_method.get("minOrder", 1)},
        "pricing": {"base_price": product["basePrice"], "subtotal": subtotal, "discount": discount, "tax": tax, "total": subtotal - discount + tax, "currency": "IDR"},
        "customer_name": req.customer_name, "customer_email": str(req.customer_email).lower(), "customer_phone": req.customer_phone,
        "notes": req.notes, "status": "submitted",
        "status_history": [{"status": "submitted", "at": ts, "note": "Pesanan dikirim dari katalog"}],
        "created_at": ts, "updated_at": ts,
    }
    await db.merchandise_orders.insert_one(dict(order))
    return {k: v for k, v in order.items() if k != "_id"}


@api.get("/admin/merchandise/orders")
async def list_merchandise_orders(user: dict = Depends(require_admin)):
    return await db.merchandise_orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.put("/admin/merchandise/orders/{order_id}/status")
async def update_merchandise_order_status(order_id: str, req: MerchandiseOrderStatusReq, user: dict = Depends(require_admin)):
    if req.status not in MERCHANDISE_ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Status pesanan tidak valid")
    order = await db.merchandise_orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pesanan merchandise tidak ditemukan")
    if order["status"] == "cancelled" and req.status != "cancelled":
        raise HTTPException(status_code=400, detail="Pesanan yang dibatalkan tidak dapat diaktifkan kembali")

    ts = now_iso()
    res = await db.merchandise_orders.update_one(
        {"id": order_id, "status": order["status"]},
        {"$set": {"status": req.status, "updated_at": ts}, "$push": {"status_history": {"status": req.status, "at": ts, "note": req.note}}},
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=409, detail="Status pesanan baru saja berubah. Muat ulang data.")
    if req.status == "cancelled" and order["status"] != "cancelled":
        await db.merchandise.update_one({"id": order["product_id"]}, {"$inc": {"stock": order["quantity"]}, "$set": {"updated_at": ts}})
    return await db.merchandise_orders.find_one({"id": order_id}, {"_id": 0})


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

    period = datetime.now(timezone.utc).strftime('%y%m')
    counter = await db.counters.find_one_and_update(
        {"_id": f"order_number:{period}"},
        {"$inc": {"value": 1}},
        upsert=True,
        return_document=ReturnDocument.AFTER,
    )
    order_number = f"NIV-{period}-{counter['value']:04d}"
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
    if user["role"] != "admin" and order["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    return order


@api.post("/orders/{oid}/payment-proof")
async def upload_payment_proof(oid: str, file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    rate_limit(f"proof:{user['id']}", limit=10, window=60)
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if order["status"] != "awaiting_payment":
        raise HTTPException(status_code=400, detail="Order is not awaiting payment")
    proof = await store_upload(file, f"payments/{user['id']}", IMAGE_EXTS)
    payment = {"proof": proof, "uploaded_at": now_iso(), "verified": False, "verified_at": None}
    await db.orders.update_one(
        {"id": oid},
        {"$set": {"payment": payment, "updated_at": now_iso()},
         "$push": {"status_history": {"status": "awaiting_payment", "at": now_iso(), "note": "Payment proof uploaded"}}},
    )
    return await db.orders.find_one({"id": oid}, {"_id": 0})


# ----------------------------- Admin orders -----------------------------
@api.get("/admin/orders")
async def admin_orders(status: Optional[str] = None, user: dict = Depends(require_admin)):
    q = {"status": status} if status else {}
    return await db.orders.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


@api.post("/admin/orders/{oid}/estimate")
async def set_estimate(oid: str, req: EstimateReq, user: dict = Depends(require_admin)):
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    settings = await get_settings()
    estimate = {"amount": req.amount, "currency": "IDR", "note": req.note, "estimated_at": now_iso()}
    await db.orders.update_one(
        {"id": oid},
        {"$set": {"estimate": estimate, "status": "awaiting_payment", "updated_at": now_iso()},
         "$push": {"status_history": {"status": "awaiting_payment", "at": now_iso(), "note": f"Estimate set: Rp {req.amount:,.0f}"}}},
    )
    await emailer.send_email(
        order["user_email"],
        f"Estimasi Biaya Pesanan {order['order_number']} — NIUVA",
        "Estimasi biaya pesanan Anda sudah siap",
        f"<p>Estimasi biaya untuk pesanan <strong>{order['order_number']}</strong> adalah "
        f"<strong>Rp {req.amount:,.0f}</strong>.</p>"
        f"<p>{req.note or ''}</p>"
        f"<p>Silakan lakukan pembayaran ke:<br>"
        f"<strong>{settings['bank_name']}</strong><br>No. Rek: <strong>{settings['account_number']}</strong><br>"
        f"a.n. <strong>{settings['account_holder']}</strong></p>"
        f"<p>Setelah transfer, unggah bukti pembayaran di dashboard Anda.</p>",
        db=db, user_id=order["user_id"],
    )
    return await db.orders.find_one({"id": oid}, {"_id": 0})


@api.post("/admin/orders/{oid}/verify-payment")
async def verify_payment(oid: str, user: dict = Depends(require_admin)):
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if not order.get("payment"):
        raise HTTPException(status_code=400, detail="No payment proof uploaded")
    await db.orders.update_one(
        {"id": oid},
        {"$set": {"payment.verified": True, "payment.verified_at": now_iso(), "status": "in_process", "updated_at": now_iso()},
         "$push": {"status_history": {"status": "in_process", "at": now_iso(), "note": "Payment verified, production started"}}},
    )
    await emailer.send_email(
        order["user_email"],
        f"Pembayaran Terverifikasi — {order['order_number']}",
        "Pembayaran Anda telah terverifikasi",
        f"<p>Pembayaran untuk pesanan <strong>{order['order_number']}</strong> telah kami verifikasi. "
        f"Pesanan Anda kini <strong>sedang diproses</strong>.</p>",
        db=db, user_id=order["user_id"],
    )
    return await db.orders.find_one({"id": oid}, {"_id": 0})


@api.post("/admin/orders/{oid}/status")
async def update_status(oid: str, req: StatusReq, user: dict = Depends(require_admin)):
    if req.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Invalid status")
    order = await db.orders.find_one({"id": oid}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await db.orders.update_one(
        {"id": oid},
        {"$set": {"status": req.status, "updated_at": now_iso()},
         "$push": {"status_history": {"status": req.status, "at": now_iso(), "note": req.note}}},
    )
    if req.status == "completed":
        await emailer.send_email(
            order["user_email"],
            f"Pesanan Selesai — {order['order_number']}",
            "Pesanan Anda telah selesai",
            f"<p>Pesanan <strong>{order['order_number']}</strong> telah <strong>selesai</strong>. "
            f"Tim kami akan menghubungi Anda untuk pengambilan/pengiriman.</p>",
            db=db, user_id=order["user_id"],
        )
    return await db.orders.find_one({"id": oid}, {"_id": 0})


# ----------------------------- File download -----------------------------
@api.get("/files/{path:path}")
async def download_file(path: str, request: Request):
    h = request.headers.get("Authorization", "")
    token = h[7:] if h.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = await get_user_from_token(token)
    # access control: admins can fetch anything; clients only their own paths
    if user["role"] != "admin" and f"/{user['id']}/" not in f"/{path}":
        raise HTTPException(status_code=403, detail="Forbidden")
    order = await db.orders.find_one(
        {"$or": [{"file.storage_path": path}, {"payment.proof.storage_path": path}]},
        {"_id": 0, "user_id": 1, "file.deleted": 1},
    )
    if not order:
        raise HTTPException(status_code=404, detail="File not found")
    if user["role"] != "admin" and order.get("user_id") != user["id"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    if order.get("file", {}).get("deleted"):
        raise HTTPException(status_code=410, detail="File has expired")
    data, content_type = storage.get_object(path)
    return Response(content=data, media_type=content_type, headers={"Cache-Control": "private, no-store"})


# ----------------------------- Internship -----------------------------
@api.post("/internships")
async def apply_internship(req: InternshipReq, request: Request):
    rate_limit(f"internship:{request_client_host(request)}", limit=3, window=3600)
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.internships.insert_one(dict(doc))
    await emailer.send_email(
        HRD_EMAIL,
        f"Pelamar Magang Baru: {req.full_name}",
        "Pendaftaran Magang Baru",
        f"<p><strong>{html.escape(req.full_name)}</strong> ({html.escape(str(req.email))}, {html.escape(req.phone)}) mendaftar magang.</p>"
        f"<p>Universitas: {html.escape(req.university)} — {html.escape(req.major)} (Sem {html.escape(req.semester or '')})<br>Durasi: {html.escape(req.duration or '')}</p>"
        f"<p>Motivasi: {html.escape(req.motivation)}</p>"
        f"<p>Portofolio: {html.escape(req.portfolio_url or '-')}</p>",
        db=db,
    )
    return {"ok": True, "message": "Pendaftaran berhasil dikirim"}


@api.get("/admin/internships")
async def list_internships(user: dict = Depends(require_admin)):
    return await db.internships.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ----------------------------- Contact -----------------------------
@api.post("/contact")
async def contact(req: ContactReq, request: Request):
    rate_limit(f"contact:{request_client_host(request)}", limit=5, window=600)
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
async def list_contacts(user: dict = Depends(require_admin)):
    return await db.contacts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ----------------------------- Portfolio -----------------------------
@api.get("/portfolio")
async def list_portfolio():
    return await db.portfolio.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api.post("/admin/portfolio")
async def create_portfolio(req: PortfolioReq, user: dict = Depends(require_admin)):
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.portfolio.insert_one(dict(doc))
    return {k: v for k, v in doc.items() if k != "_id"}


@api.put("/admin/portfolio/{pid}")
async def update_portfolio(pid: str, req: PortfolioReq, user: dict = Depends(require_admin)):
    res = await db.portfolio.update_one({"id": pid}, {"$set": req.model_dump()})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Not found")
    return await db.portfolio.find_one({"id": pid}, {"_id": 0})


@api.delete("/admin/portfolio/{pid}")
async def delete_portfolio(pid: str, user: dict = Depends(require_admin)):
    await db.portfolio.delete_one({"id": pid})
    return {"ok": True}


# ----------------------------- Settings & Users -----------------------------
@api.get("/settings")
async def settings_public():
    s = await get_settings()
    return {k: v for k, v in s.items() if k != "key"}


@api.put("/admin/settings")
async def update_settings(req: SettingsReq, user: dict = Depends(require_admin)):
    await db.settings.update_one({"key": "site"}, {"$set": req.model_dump()}, upsert=True)
    s = await get_settings()
    return {k: v for k, v in s.items() if k != "key"}


@api.get("/admin/users")
async def list_users(user: dict = Depends(require_admin)):
    return await db.users.find({"role": "client"}, {"_id": 0, "password_hash": 0}).sort("created_at", -1).to_list(500)


@api.post("/admin/users", status_code=201)
async def create_client_user(req: ClientProvisionReq, user: dict = Depends(require_admin)):
    return await provision_client(req)


@api.get("/admin/stats")
async def admin_stats(user: dict = Depends(require_admin)):
    total_orders = await db.orders.count_documents({})
    pending = await db.orders.count_documents({"status": "pending_estimate"})
    awaiting = await db.orders.count_documents({"status": "awaiting_payment"})
    in_process = await db.orders.count_documents({"status": "in_process"})
    completed = await db.orders.count_documents({"status": "completed"})
    clients = await db.users.count_documents({"role": "client"})
    interns = await db.internships.count_documents({})
    return {
        "total_orders": total_orders, "pending_estimate": pending, "awaiting_payment": awaiting,
        "in_process": in_process, "completed": completed, "clients": clients, "internships": interns,
    }


@api.get("/notifications")
async def my_notifications(user: dict = Depends(get_current_user)):
    return await db.notifications.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)


@api.get("/")
async def root():
    return {"message": "NIUVA API", "status": "ok"}


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
    await db.users.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    await db.orders.create_index("order_number", unique=True)
    await db.merchandise.create_index("id", unique=True)
    await db.merchandise_orders.create_index("id", unique=True)
    await db.merchandise_orders.create_index("order_number", unique=True)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "NIUVA Admin", "email": admin_email,
            "password_hash": hash_password(admin_password), "phone": "", "company": "PT Niuva Inovasi Utama",
            "role": "admin", "created_at": now_iso(),
        })
    else:
        admin_updates = {
            "name": "NIUVA Admin",
            "role": "admin",
            "company": "PT Niuva Inovasi Utama",
        }
        if not verify_password(admin_password, existing["password_hash"]):
            admin_updates["password_hash"] = hash_password(admin_password)
        await db.users.update_one({"email": admin_email}, {"$set": admin_updates})

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

    if await db.merchandise.count_documents({}) == 0:
        merchandise_defaults = [
            {
                "name": "T-Shirt", "basePrice": 75000, "stock": 100,
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "colors": ["Midnight Blue", "Steel Gray", "Frost White", "Sky Blue"],
                "printMethods": [
                    {"name": "Screen Print", "price": 25000, "minOrder": 10},
                    {"name": "Embroidery", "price": 35000, "minOrder": 5},
                    {"name": "Direct Print", "price": 30000, "minOrder": 1},
                ],
                "description": "Kaos berkualitas tinggi dengan material premium", "image": "👕", "active": True,
            },
            {
                "name": "Hoodie", "basePrice": 150000, "stock": 60,
                "sizes": ["XS", "S", "M", "L", "XL", "XXL"],
                "colors": ["Midnight Blue", "Steel Gray", "Black"],
                "printMethods": [
                    {"name": "Embroidery", "price": 45000, "minOrder": 5},
                    {"name": "Screen Print", "price": 35000, "minOrder": 10},
                ],
                "description": "Hoodie premium dengan desain modern", "image": "🧥", "active": True,
            },
            {
                "name": "Cap", "basePrice": 45000, "stock": 45,
                "sizes": ["One Size"], "colors": ["Niuva Blue", "Black", "White"],
                "printMethods": [
                    {"name": "Embroidery", "price": 20000, "minOrder": 5},
                    {"name": "Screen Print", "price": 15000, "minOrder": 10},
                ],
                "description": "Topi dengan logo NIUVA minimalis", "image": "🧢", "active": True,
            },
            {
                "name": "Tote Bag", "basePrice": 65000, "stock": 80,
                "sizes": ["One Size"], "colors": ["Natural", "Midnight Blue", "Black"],
                "printMethods": [
                    {"name": "Screen Print", "price": 25000, "minOrder": 10},
                    {"name": "Embroidery", "price": 30000, "minOrder": 5},
                ],
                "description": "Tas tote berkualitas untuk branding", "image": "🛍️", "active": True,
            },
        ]
        for item in merchandise_defaults:
            ts = now_iso()
            await db.merchandise.insert_one({"id": str(uuid.uuid4()), **item, "created_at": ts, "updated_at": ts})

    await get_settings()
    logger.info("Seed complete")


async def auto_delete_loop():
    """Soft-delete design files for awaiting_payment orders older than 14 days."""
    while True:
        try:
            cutoff = (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()
            stale = await db.orders.find(
                {"status": "awaiting_payment", "created_at": {"$lt": cutoff}, "file.deleted": {"$ne": True}},
                {"_id": 0, "id": 1, "file.storage_path": 1},
            ).to_list(500)
            for o in stale:
                storage.delete_object(o["file"]["storage_path"])
                await db.orders.update_one(
                    {"id": o["id"]},
                    {"$set": {"file.deleted": True, "file.deleted_at": now_iso()}},
                )
            if stale:
                logger.info(f"Auto-deleted design files for {len(stale)} stale orders")
        except Exception as e:
            logger.error(f"auto_delete_loop error: {e}")
        await asyncio.sleep(6 * 3600)


@app.on_event("startup")
async def startup():
    try:
        storage.init_storage()
    except Exception as e:
        logger.error(f"Storage init failed: {e}")
    await seed()
    asyncio.create_task(auto_delete_loop())


@app.on_event("shutdown")
async def shutdown():
    client.close()
