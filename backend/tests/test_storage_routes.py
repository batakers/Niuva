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


@pytest.fixture
def local_storage_root(tmp_path, monkeypatch):
    root = tmp_path / "uploads"
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(root))
    return root


def test_store_upload_persists_relative_logical_path(local_storage_root):

    async def run():
        upload = UploadFile(filename="part.stl", file=io.BytesIO(b"solid part"))
        return await server.store_upload(upload, "orders/customer-1", {"stl"})

    metadata = asyncio.run(run())
    assert metadata["storage_path"].startswith("niuva/orders/customer-1/")
    assert not Path(metadata["storage_path"]).is_absolute()
    assert metadata["size"] == len(b"solid part")
    assert (local_storage_root / metadata["storage_path"]).read_bytes() == b"solid part"


def test_store_upload_does_not_trust_client_content_type(local_storage_root):

    async def run():
        upload = UploadFile(
            filename="proof.png",
            file=io.BytesIO(b"png proof"),
            headers={"content-type": "text/html"},
        )
        return await server.store_upload(upload, "payments/customer-1", {"png"})

    metadata = asyncio.run(run())
    assert metadata["content_type"] == "image/png"
    assert storage.get_object(metadata["storage_path"])[1] == "image/png"


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


def test_disabled_storage_upload_returns_controlled_503(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "disabled")

    async def run():
        upload = UploadFile(filename="part.stl", file=io.BytesIO(b"solid part"))
        return await server.store_upload(upload, "orders/customer-1", {"stl"})

    with pytest.raises(HTTPException) as caught:
        asyncio.run(run())

    assert caught.value.status_code == 503
    assert caught.value.detail == "File storage unavailable"


def test_file_download_requires_authorization_header_and_safe_media_type(local_storage_root, monkeypatch):
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
            owner_header = await api.get(f"/api/files/{path}", headers={"Authorization": "Bearer owner"})
            other = await api.get(f"/api/files/{path}", headers={"Authorization": "Bearer other"})
            staff = await api.get(f"/api/files/{path}", headers={"Authorization": "Bearer staff"})
            missing = await api.get(
                "/api/files/niuva/orders/customer-1/missing.stl",
                headers={"Authorization": "Bearer owner"},
            )
            return owner, owner_header, other, staff, missing

    owner, owner_header, other, staff, missing = asyncio.run(run())
    assert owner.status_code == 401
    assert owner_header.status_code == 200
    assert owner_header.content == b"solid part"
    assert owner_header.headers["content-type"] == "model/stl"
    assert owner_header.headers["x-content-type-options"] == "nosniff"
    assert other.status_code == 403
    assert staff.status_code == 200
    assert missing.status_code == 404
    assert missing.json() == {"detail": "File not found"}


def test_disabled_storage_download_returns_controlled_503(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "disabled")
    path = "niuva/orders/customer-1/model.stl"

    async def fake_user(_token):
        return {"id": "customer-1", "email": "owner@example.com", "role": "client"}

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
            return await api.get(
                f"/api/files/{path}",
                headers={"Authorization": "Bearer owner"},
            )

    response = asyncio.run(run())
    assert response.status_code == 503
    assert response.json() == {"detail": "File storage unavailable"}


def test_file_download_forces_active_metadata_to_binary(local_storage_root, monkeypatch):
    path = "niuva/orders/customer-1/payload.html"
    storage.put_object(path, b"<script>alert(1)</script>", "text/html")

    async def fake_user(_token):
        return {"id": "customer-1", "email": "owner@example.com", "role": "client"}

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
            return await api.get(
                f"/api/files/{path}",
                headers={"Authorization": "Bearer owner"},
            )

    response = asyncio.run(run())
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/octet-stream"
    assert response.headers["x-content-type-options"] == "nosniff"


def test_payment_proof_upload_uses_local_storage(local_storage_root, monkeypatch):

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
    assert (local_storage_root / proof["storage_path"]).read_bytes() == b"png proof"
