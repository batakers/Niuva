from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, UploadFile, File, Form, Query, Header, Response
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
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


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ----------------------------- Models -----------------------------
class RegisterReq(BaseModel):
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
    full_name: str
    email: EmailStr
    phone: str
    university: str
    major: str
    semester: Optional[str] = ""
    duration: Optional[str] = ""
    motivation: str
    portfolio_url: Optional[str] = ""


class ContactReq(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str


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


_rate_buckets: dict = {}


def rate_limit(key: str, limit: int = 10, window: int = 60):
    now = datetime.now(timezone.utc).timestamp()
    bucket = [t for t in _rate_buckets.get(key, []) if now - t < window]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Too many uploads. Please wait a moment.")
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


# ----------------------------- Auth routes -----------------------------
@api.post("/auth/register")
async def register(req: RegisterReq):
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
    token = create_token(user["id"], email, "client")
    return {"token": token, "user": {k: user[k] for k in ("id", "name", "email", "role", "phone", "company")}}


@api.post("/auth/login")
async def login(req: LoginReq):
    email = req.email.lower()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user["id"], email, user["role"])
    return {"token": token, "user": {k: user.get(k) for k in ("id", "name", "email", "role", "phone", "company")}}


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
async def download_file(path: str, request: Request, auth: Optional[str] = Query(None)):
    token = auth
    if not token:
        h = request.headers.get("Authorization", "")
        if h.startswith("Bearer "):
            token = h[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    # access control: admins can fetch anything; clients only their own paths
    if user["role"] != "admin" and f"/{user['id']}/" not in f"/{path}":
        raise HTTPException(status_code=403, detail="Forbidden")
    data, content_type = storage.get_object(path)
    return Response(content=data, media_type=content_type)


# ----------------------------- Internship -----------------------------
@api.post("/internships")
async def apply_internship(req: InternshipReq):
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.internships.insert_one(dict(doc))
    await emailer.send_email(
        HRD_EMAIL,
        f"Pelamar Magang Baru: {req.full_name}",
        "Pendaftaran Magang Baru",
        f"<p><strong>{req.full_name}</strong> ({req.email}, {req.phone}) mendaftar magang.</p>"
        f"<p>Universitas: {req.university} — {req.major} (Sem {req.semester})<br>Durasi: {req.duration}</p>"
        f"<p>Motivasi: {req.motivation}</p>"
        f"<p>Portofolio: {req.portfolio_url or '-'}</p>",
        db=db,
    )
    return {"ok": True, "message": "Pendaftaran berhasil dikirim"}


@api.get("/admin/internships")
async def list_internships(user: dict = Depends(require_admin)):
    return await db.internships.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ----------------------------- Contact -----------------------------
@api.post("/contact")
async def contact(req: ContactReq):
    doc = {"id": str(uuid.uuid4()), **req.model_dump(), "created_at": now_iso()}
    await db.contacts.insert_one(dict(doc))
    await emailer.send_email(
        HRD_EMAIL,
        f"Inquiry Baru: {req.subject}",
        "Pesan Kontak Baru",
        f"<p>Dari <strong>{req.name}</strong> ({req.email})</p><p>{req.message}</p>",
        db=db,
    )
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

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------- Startup -----------------------------
async def seed():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    await db.orders.create_index("id", unique=True)
    admin_email = os.environ["ADMIN_EMAIL"].lower()
    admin_password = os.environ["ADMIN_PASSWORD"]
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        await db.users.insert_one({
            "id": str(uuid.uuid4()), "name": "NIUVA Admin", "email": admin_email,
            "password_hash": hash_password(admin_password), "phone": "", "company": "PT Niuva Inovasi Utama",
            "role": "admin", "created_at": now_iso(),
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
