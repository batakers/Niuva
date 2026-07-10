from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import logging
import os
import time
import uuid
from html import escape
from datetime import datetime, timezone

from fastapi import APIRouter, FastAPI, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware

import emailer

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("niuva")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "niuvamakerspace@gmail.com")

app = FastAPI(title="NIUVA Website API")
api = APIRouter(prefix="/api")


class ContactReq(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=10, max_length=5000)


_rate_buckets: dict[str, list[float]] = {}


def rate_limit(key: str, limit: int = 5, window: int = 60) -> None:
    now = time.time()
    bucket = [timestamp for timestamp in _rate_buckets.get(key, []) if now - timestamp < window]
    if len(bucket) >= limit:
        raise HTTPException(status_code=429, detail="Terlalu banyak permintaan. Silakan coba lagi sebentar.")
    bucket.append(now)
    _rate_buckets[key] = bucket


@api.get("/")
async def root():
    return {"message": "NIUVA Website API", "status": "ok"}


@api.post("/contact", status_code=201)
async def contact(req: ContactReq, request: Request):
    client_ip = request.client.host if request.client else "unknown"
    rate_limit(f"contact:{client_ip}")

    document = {
        "id": str(uuid.uuid4()),
        **req.model_dump(),
        "status": "new",
        "source_page": "/contact",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.contacts.insert_one(document)

    email_result = await emailer.send_email(
        CONTACT_EMAIL,
        f"Inquiry Website: {req.subject}",
        "Inquiry baru dari website Niuva",
        (
            f"<p><strong>Nama:</strong> {escape(req.name)}</p>"
            f"<p><strong>Email:</strong> {escape(str(req.email))}</p>"
            f"<p><strong>Subjek:</strong> {escape(req.subject)}</p>"
            f"<p><strong>Pesan:</strong><br>{escape(req.message)}</p>"
        ),
    )
    if email_result.get("status") == "error":
        logger.error("Lead tersimpan tetapi notifikasi email gagal: %s", email_result.get("error"))

    return {"message": "Permintaan berhasil dikirim", "id": document["id"]}


app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=False,
    allow_origins=os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.on_event("startup")
async def startup():
    await client.admin.command("ping")
    logger.info("MongoDB connected")


@app.on_event("shutdown")
async def shutdown():
    client.close()
