import asyncio
import io
import os
import sys
import types
from pathlib import Path

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

from tests.auth_support import AuthCollection  # noqa: E402


class FileDatabase:
    def __init__(self, metadata):
        self.file_objects = AuthCollection(metadata)


class MediaObjects:
    def __init__(self, *, fail=False):
        self.rows = []
        self.fail = fail

    async def insert_one(self, document):
        if self.fail:
            raise RuntimeError("injected metadata failure")
        self.rows.append(dict(document))
        return types.SimpleNamespace(inserted_id=document["id"])


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


def test_store_upload_enforces_size_while_reading_without_persisting_partial_data(
    local_storage_root,
):
    async def run():
        upload = UploadFile(
            filename="oversized.stl",
            file=io.BytesIO(b"x" * (64 * 1024 + 1)),
        )
        return await server.store_upload(
            upload,
            "orders/customer-1",
            {"stl"},
            max_size=64 * 1024,
        )

    with pytest.raises(HTTPException) as caught:
        asyncio.run(run())
    assert caught.value.status_code == 400
    assert caught.value.detail == "File exceeds size limit"
    assert [path for path in local_storage_root.rglob("*") if path.is_file()] == []


def test_store_upload_maps_storage_failure_to_controlled_http_error(monkeypatch):
    def fail_store(*_args, **_kwargs):
        raise storage.StorageError("disk details must stay private")

    monkeypatch.setattr(storage, "put_file_object", fail_store)

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


def test_development_media_upload_validates_signature_and_persists_ownership(
    local_storage_root,
    monkeypatch,
):
    objects = MediaObjects()
    monkeypatch.setattr(server, "db", types.SimpleNamespace(file_objects=objects))

    async def run():
        upload = UploadFile(
            filename="../../catalog-cover.png",
            file=io.BytesIO(b"\x89PNG\r\n\x1a\nimage"),
            headers={"content-type": "text/html"},
        )
        return await server.upload_admin_media(
            upload,
            {"id": "staff-content", "roles": ["content_editor"]},
        )

    result = asyncio.run(run())
    assert result["owner_id"] == "staff-content"
    assert result["reference"] == f"media:{result['id']}"
    assert result["original_filename"] == "catalog-cover.png"
    assert result["content_type"] == "image/png"
    assert result["state"] == "active"
    assert objects.rows == [result]
    assert (
        (local_storage_root / result["storage_path"])
        .read_bytes()
        .startswith(b"\x89PNG\r\n\x1a\n")
    )


def test_development_media_upload_rejects_extension_spoof_without_writing(
    local_storage_root,
    monkeypatch,
):
    objects = MediaObjects()
    monkeypatch.setattr(server, "db", types.SimpleNamespace(file_objects=objects))

    async def run():
        upload = UploadFile(
            filename="not-an-image.png",
            file=io.BytesIO(b"<script>alert(1)</script>"),
        )
        return await server.upload_admin_media(
            upload,
            {"id": "staff-content", "roles": ["content_editor"]},
        )

    with pytest.raises(HTTPException) as caught:
        asyncio.run(run())
    assert caught.value.status_code == 400
    assert caught.value.detail["code"] == "media_signature_invalid"
    assert objects.rows == []
    assert list(local_storage_root.rglob("*")) == []


def test_public_media_requires_an_active_immutable_publication(
    local_storage_root,
    monkeypatch,
):
    path = "niuva/media/public/cover.png"
    storage.put_object(path, b"\x89PNG\r\n\x1a\nimage", "image/png")
    monkeypatch.setattr(
        server,
        "db",
        FileDatabase(
            [
                {
                    "id": "media-public",
                    "storage_path": path,
                    "purpose": "admin_media",
                    "state": "active",
                }
            ]
        ),
    )

    async def unpublished(_reference):
        return False

    monkeypatch.setattr(server, "_public_media_is_published", unpublished)
    with pytest.raises(HTTPException) as hidden:
        asyncio.run(server.download_public_media("media-public"))
    assert hidden.value.status_code == 404

    async def published(reference):
        return reference == "media:media-public"

    monkeypatch.setattr(server, "_public_media_is_published", published)

    async def published_response():
        response = await server.download_public_media("media-public")
        body = b"".join([chunk async for chunk in response.body_iterator])
        return response, body

    response, body = asyncio.run(published_response())
    assert body == b"\x89PNG\r\n\x1a\nimage"
    assert response.media_type == "image/png"
    assert response.headers["content-length"] == str(len(body))
    assert response.headers["cache-control"] == "public, max-age=31536000, immutable"
    assert response.headers["x-content-type-options"] == "nosniff"


def test_development_media_upload_compensates_failed_metadata_write(
    local_storage_root,
    monkeypatch,
):
    monkeypatch.setattr(
        server,
        "db",
        types.SimpleNamespace(file_objects=MediaObjects(fail=True)),
    )

    async def run():
        upload = UploadFile(
            filename="cover.webp",
            file=io.BytesIO(b"RIFF\x04\x00\x00\x00WEBPdata"),
        )
        return await server.upload_admin_media(
            upload,
            {"id": "staff-content", "roles": ["content_editor"]},
        )

    with pytest.raises(RuntimeError, match="metadata failure"):
        asyncio.run(run())
    assert [path for path in local_storage_root.rglob("*") if path.is_file()] == []


def test_development_media_upload_stays_disabled_in_production(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    objects = MediaObjects()
    monkeypatch.setattr(server, "db", types.SimpleNamespace(file_objects=objects))

    async def run():
        upload = UploadFile(
            filename="cover.png",
            file=io.BytesIO(b"\x89PNG\r\n\x1a\nimage"),
        )
        return await server.upload_admin_media(
            upload,
            {"id": "staff-content", "roles": ["content_editor"]},
        )

    with pytest.raises(HTTPException) as caught:
        asyncio.run(run())
    assert caught.value.status_code == 503
    assert caught.value.detail["code"] == "development_media_upload_inactive"
    assert objects.rows == []


def test_file_download_requires_authorization_header_and_safe_media_type(
    local_storage_root, monkeypatch
):
    path = "niuva/orders/customer-1/model.stl"
    storage.put_object(path, b"solid part", "model/stl")
    monkeypatch.setattr(
        server,
        "db",
        FileDatabase(
            [
                {
                    "id": "file-1",
                    "storage_path": path,
                    "owner_id": "customer-1",
                    "state": "active",
                },
                {
                    "id": "missing-file",
                    "storage_path": "niuva/orders/customer-1/missing.stl",
                    "owner_id": "customer-1",
                    "state": "active",
                },
            ]
        ),
    )

    async def fake_user(token):
        users = {
            "owner": {
                "id": "customer-1",
                "email": "owner@example.com",
                "role": "client",
            },
            "other": {
                "id": "customer-2",
                "email": "other@example.com",
                "role": "client",
            },
            "staff": {
                "id": "staff-1",
                "email": "staff@niuva.com",
                "roles": ["super_admin"],
                "status": "active",
                "access_state": "approved",
                "role_policy_version": server.ROLE_POLICY_VERSION,
            },
        }
        return users[token]

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    class FakeAdminSessions:
        async def authenticate_admin_session(self, context):
            if context.get("access_secret") != "admin-cookie":
                raise server.SessionExpiredError()
            return types.SimpleNamespace(session_id="session-1", user_id="staff-1")

    class FakeUsers:
        async def find_one(self, *_args, **_kwargs):
            return {
                "id": "staff-1",
                "roles": ["super_admin"],
                "status": "active",
                "access_state": "approved",
                "role_policy_version": server.ROLE_POLICY_VERSION,
            }

    server.app.state.admin_session_module = FakeAdminSessions()
    original_db = server.db
    server.db = types.SimpleNamespace(
        users=FakeUsers(),
        file_objects=FileDatabase(
            [
                {
                    "id": "file-1",
                    "storage_path": path,
                    "owner_id": "customer-1",
                    "state": "active",
                },
                {
                    "id": "missing-file",
                    "storage_path": "niuva/orders/customer-1/missing.stl",
                    "owner_id": "customer-1",
                    "state": "active",
                },
            ]
        ).file_objects,
    )

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="https://testserver"
        ) as api:
            owner = await api.get(f"/api/files/{path}", params={"auth": "owner"})
            owner_header = await api.get(
                f"/api/files/{path}", headers={"Authorization": "Bearer owner"}
            )
            other = await api.get(
                f"/api/files/{path}", headers={"Authorization": "Bearer other"}
            )
            staff = await api.get(
                f"/api/files/{path}", headers={"Authorization": "Bearer staff"}
            )
            api.cookies.set(server.ACCESS_COOKIE_NAME, "admin-cookie")
            staff_cookie = await api.get(f"/api/files/{path}")
            missing = await api.get(
                "/api/files/niuva/orders/customer-1/missing.stl",
                headers={"Authorization": "Bearer owner"},
            )
            return owner, owner_header, other, staff, staff_cookie, missing

    try:
        owner, owner_header, other, staff, staff_cookie, missing = asyncio.run(run())
    finally:
        server.db = original_db
        server.app.state.admin_session_module = None
    assert owner.status_code == 401
    assert owner_header.status_code == 200
    assert owner_header.content == b"solid part"
    assert owner_header.headers["content-type"] == "model/stl"
    assert owner_header.headers["x-content-type-options"] == "nosniff"
    assert other.status_code == 403
    assert staff.status_code == 401
    assert staff_cookie.status_code == 200
    assert missing.status_code == 404
    assert missing.json()["detail"] == "File not found"
    assert missing.json()["error"]["code"] == "http_404"
    assert missing.headers["x-request-id"] == missing.json()["request_id"]


def test_disabled_storage_download_returns_controlled_503(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "disabled")
    path = "niuva/orders/customer-1/model.stl"
    monkeypatch.setattr(
        server,
        "db",
        FileDatabase(
            [
                {
                    "id": "file-1",
                    "storage_path": path,
                    "owner_id": "customer-1",
                    "state": "active",
                }
            ]
        ),
    )

    async def fake_user(_token):
        return {"id": "customer-1", "email": "owner@example.com", "role": "client"}

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            return await api.get(
                f"/api/files/{path}",
                headers={"Authorization": "Bearer owner"},
            )

    response = asyncio.run(run())
    assert response.status_code == 503
    assert response.json()["detail"] == "File storage unavailable"
    assert response.json()["error"]["code"] == "http_503"


def test_file_download_forces_active_metadata_to_binary(
    local_storage_root, monkeypatch
):
    path = "niuva/orders/customer-1/payload.html"
    storage.put_object(path, b"<script>alert(1)</script>", "text/html")
    monkeypatch.setattr(
        server,
        "db",
        FileDatabase(
            [
                {
                    "id": "file-html",
                    "storage_path": path,
                    "owner_id": "customer-1",
                    "state": "active",
                }
            ]
        ),
    )

    async def fake_user(_token):
        return {"id": "customer-1", "email": "owner@example.com", "role": "client"}

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="http://testserver"
        ) as api:
            return await api.get(
                f"/api/files/{path}",
                headers={"Authorization": "Bearer owner"},
            )

    response = asyncio.run(run())
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/octet-stream"
    assert response.headers["x-content-type-options"] == "nosniff"


def test_legacy_order_design_file_download_is_owner_scoped(
    local_storage_root, monkeypatch
):
    path = "niuva/orders/customer-1/design.stl"
    storage.put_object(path, b"solid design", "model/stl")
    monkeypatch.setattr(
        server,
        "db",
        types.SimpleNamespace(
            orders=AuthCollection(
                [
                    {
                        "id": "order-1",
                        "user_id": "customer-1",
                        "file": {"storage_path": path},
                    }
                ]
            ),
            file_objects=AuthCollection(
                [
                    {
                        "id": "file-1",
                        "storage_path": path,
                        "owner_id": "customer-1",
                        "state": "active",
                    }
                ]
            ),
        ),
    )

    async def fake_user(token):
        return {
            "owner": {"id": "customer-1", "email": "owner@example.com"},
            "other": {"id": "customer-2", "email": "other@example.com"},
        }[token]

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport, base_url="https://testserver"
        ) as api:
            owner = await api.get(
                "/api/orders/order-1/design-file",
                headers={"Authorization": "Bearer owner"},
            )
            other = await api.get(
                "/api/orders/order-1/design-file",
                headers={"Authorization": "Bearer other"},
            )
            return owner, other

    owner, other = asyncio.run(run())
    assert owner.status_code == 200
    assert owner.content == b"solid design"
    assert owner.headers["x-content-type-options"] == "nosniff"
    assert other.status_code == 403


def test_deleted_or_quarantined_metadata_is_never_downloadable(
    local_storage_root,
    monkeypatch,
):
    deleted_path = "niuva/orders/customer-1/deleted.stl"
    quarantined_path = "niuva/orders/customer-1/quarantined.stl"
    storage.put_object(deleted_path, b"deleted", "model/stl")
    storage.put_object(quarantined_path, b"quarantined", "model/stl")
    monkeypatch.setattr(
        server,
        "db",
        FileDatabase(
            [
                {
                    "id": "file-deleted",
                    "storage_path": deleted_path,
                    "owner_id": "customer-1",
                    "state": "deleted",
                },
                {
                    "id": "file-quarantined",
                    "storage_path": quarantined_path,
                    "owner_id": "customer-1",
                    "state": "quarantined",
                },
            ]
        ),
    )

    async def fake_user(_token):
        return {"id": "customer-1", "email": "owner@example.com", "role": "client"}

    monkeypatch.setattr(server, "get_user_from_token", fake_user)

    async def run():
        transport = httpx.ASGITransport(app=server.app)
        async with httpx.AsyncClient(
            transport=transport,
            base_url="http://testserver",
        ) as api:
            return (
                await api.get(
                    f"/api/files/{deleted_path}",
                    headers={"Authorization": "Bearer owner"},
                ),
                await api.get(
                    f"/api/files/{quarantined_path}",
                    headers={"Authorization": "Bearer owner"},
                ),
            )

    deleted, quarantined = asyncio.run(run())
    assert deleted.status_code == 404
    assert quarantined.status_code == 404


def test_payment_proof_upload_is_disabled_without_storage_write(
    local_storage_root, monkeypatch
):

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

    with pytest.raises(HTTPException) as blocked:
        asyncio.run(run())
    assert blocked.value.status_code == 410
    assert blocked.value.detail["code"] == "legacy_manual_transfer_disabled"
    assert "payment" not in orders.order
    assert list(local_storage_root.rglob("*")) == []
