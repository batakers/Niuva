import asyncio
import io
import os
import sys
from pathlib import Path
import types

import httpx
import pytest
from fastapi import HTTPException
from starlette.datastructures import UploadFile


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://storage-route-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_storage_route_test")
os.environ.setdefault("JWT_SECRET", "storage-route-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

import server  # noqa: E402
import storage  # noqa: E402


def test_store_upload_persists_relative_logical_path(tmp_path, monkeypatch):
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(tmp_path / "uploads"))

    async def run():
        upload = UploadFile(filename="part.stl", file=io.BytesIO(b"solid part"))
        return await server.store_upload(upload, "orders/customer-1", {"stl"})

    metadata = asyncio.run(run())
    assert metadata["storage_path"].startswith("niuva/orders/customer-1/")
    assert not Path(metadata["storage_path"]).is_absolute()
    assert metadata["size"] == len(b"solid part")
    assert (tmp_path / "uploads" / metadata["storage_path"]).read_bytes() == b"solid part"


def test_store_upload_maps_storage_failure_to_controlled_http_error(monkeypatch):
    def fail_store(*_args, **_kwargs):
        raise storage.StorageError("disk details must stay private")

    monkeypatch.setattr(storage, "put_object", fail_store)

    async def run():
        upload = UploadFile(filename="part.stl", file=io.BytesIO(b"solid part"))
        return await server.store_upload(upload, "orders/customer-1", {"stl"})

    with pytest.raises(HTTPException) as caught:
        asyncio.run(run())
    assert caught.value.status_code == 500
    assert caught.value.detail == "File storage unavailable"


def test_file_download_enforces_owner_permission_and_missing_file(tmp_path, monkeypatch):
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(tmp_path / "uploads"))
    path = "niuva/orders/customer-1/model.stl"
    storage.put_object(path, b"solid part", "model/stl")

    async def fake_user(token):
        users = {
            "owner": {"id": "customer-1", "email": "owner@example.com", "role": "client"},
            "other": {"id": "customer-2", "email": "other@example.com", "role": "client"},
            "staff": {"id": "staff-1", "email": "staff@niuva.com", "roles": ["super_admin"]},
        }
        return users[token]

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
            owner = await api.get(f"/api/files/{path}", params={"auth": "owner"})
            other = await api.get(f"/api/files/{path}", params={"auth": "other"})
            staff = await api.get(f"/api/files/{path}", params={"auth": "staff"})
            missing = await api.get(
                "/api/files/niuva/orders/customer-1/missing.stl",
                params={"auth": "owner"},
            )
            return owner, other, staff, missing

    owner, other, staff, missing = asyncio.run(run())
    assert owner.status_code == 200
    assert owner.content == b"solid part"
    assert owner.headers["content-type"] == "model/stl"
    assert other.status_code == 403
    assert staff.status_code == 200
    assert missing.status_code == 404
    assert missing.json() == {"detail": "File not found"}


def test_payment_proof_upload_uses_local_storage(tmp_path, monkeypatch):
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(tmp_path / "uploads"))

    class FakeOrders:
        def __init__(self):
            self.order = {
                "id": "order-1",
                "user_id": "customer-1",
                "status": "awaiting_payment",
                "status_history": [],
            }

        async def find_one(self, query, projection=None):
            if query.get("id") != self.order["id"]:
                return None
            return dict(self.order)

        async def update_one(self, query, update):
            assert query == {"id": "order-1"}
            for key, value in update.get("$set", {}).items():
                self.order[key] = value
            history = update.get("$push", {}).get("status_history")
            if history:
                self.order["status_history"].append(history)

    orders = FakeOrders()
    monkeypatch.setattr(server, "db", types.SimpleNamespace(orders=orders))

    async def run():
        upload = UploadFile(filename="proof.png", file=io.BytesIO(b"png proof"))
        return await server.upload_payment_proof(
            "order-1",
            upload,
            {"id": "customer-1", "email": "owner@example.com", "role": "client"},
        )

    order = asyncio.run(run())
    proof = order["payment"]["proof"]
    assert proof["storage_path"].startswith("niuva/payments/customer-1/")
    assert not Path(proof["storage_path"]).is_absolute()
    assert (tmp_path / "uploads" / proof["storage_path"]).read_bytes() == b"png proof"
