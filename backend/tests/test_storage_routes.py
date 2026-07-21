import asyncio
import io
import os
import sys
import tempfile
import types
import unittest
from pathlib import Path
from unittest import mock

from fastapi import HTTPException
from starlette.datastructures import UploadFile
from starlette.requests import Request

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://storage-route-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_storage_route_test")
os.environ.setdefault("JWT_SECRET", "storage-route-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

motor_package = types.ModuleType("motor")
motor_asyncio = types.ModuleType("motor.motor_asyncio")


class _BootstrapMongoClient:
    def __init__(self, *_args, **_kwargs):
        pass

    def __getitem__(self, _name):
        return object()


motor_asyncio.AsyncIOMotorClient = _BootstrapMongoClient
motor_package.motor_asyncio = motor_asyncio
sys.modules.setdefault("motor", motor_package)
sys.modules.setdefault("motor.motor_asyncio", motor_asyncio)

resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402
import storage  # noqa: E402

TEST_TMP_PARENT = Path("C:/tmp") if os.name == "nt" else Path(tempfile.gettempdir())


def request_with_token(token: str) -> Request:
    return Request(
        {
            "type": "http",
            "method": "GET",
            "path": "/api/files/test",
            "headers": [(b"authorization", f"Bearer {token}".encode("ascii"))],
        }
    )


class StorageRouteTests(unittest.TestCase):
    def local_environment(self, root: Path):
        return mock.patch.dict(
            os.environ,
            {
                "APP_ENV": "test",
                "STORAGE_BACKEND": "local",
                "LOCAL_STORAGE_ROOT": str(root),
            },
            clear=False,
        )

    def test_store_upload_persists_relative_path_and_uses_safe_mime(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            with self.local_environment(root):
                upload = UploadFile(
                    filename="part.stl",
                    file=io.BytesIO(b"solid part"),
                    headers={"content-type": "text/html"},
                )
                metadata = asyncio.run(
                    server.store_upload(upload, "orders/customer-1", {"stl"})
                )

                self.assertTrue(
                    metadata["storage_path"].startswith("niuva/orders/customer-1/")
                )
                self.assertFalse(Path(metadata["storage_path"]).is_absolute())
                self.assertEqual(metadata["content_type"], "model/stl")
                self.assertEqual(
                    storage.get_object(metadata["storage_path"]),
                    (b"solid part", "model/stl"),
                )

    def test_disabled_upload_returns_controlled_503(self):
        with mock.patch.dict(
            os.environ,
            {"APP_ENV": "production", "STORAGE_BACKEND": "disabled"},
            clear=False,
        ):
            upload = UploadFile(filename="part.stl", file=io.BytesIO(b"solid part"))
            with self.assertRaises(HTTPException) as caught:
                asyncio.run(server.store_upload(upload, "orders/customer-1", {"stl"}))

        self.assertEqual(caught.exception.status_code, 503)
        self.assertEqual(caught.exception.detail, "File storage unavailable")

    def test_owner_can_download_local_file(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            path = "niuva/orders/customer-1/model.stl"
            with self.local_environment(root):
                storage.put_object(path, b"solid part", "model/stl")

                async def fake_user(_token):
                    return {
                        "id": "customer-1",
                        "email": "owner@example.com",
                        "role": "client",
                    }

                with mock.patch.object(
                    server, "get_user_from_token", side_effect=fake_user
                ):
                    response = asyncio.run(
                        server.download_file(
                            path, request_with_token("owner"), auth=None
                        )
                    )

                self.assertEqual(response.body, b"solid part")
                self.assertEqual(response.media_type, "model/stl")
                self.assertEqual(response.headers["x-content-type-options"], "nosniff")

    def test_missing_local_file_returns_controlled_404(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            with self.local_environment(Path(temporary_directory) / "uploads"):

                async def fake_user(_token):
                    return {
                        "id": "customer-1",
                        "email": "owner@example.com",
                        "role": "client",
                    }

                with mock.patch.object(
                    server, "get_user_from_token", side_effect=fake_user
                ):
                    with self.assertRaises(HTTPException) as caught:
                        asyncio.run(
                            server.download_file(
                                "niuva/orders/customer-1/missing.stl",
                                request_with_token("owner"),
                                auth=None,
                            )
                        )

                self.assertEqual(caught.exception.status_code, 404)
                self.assertEqual(caught.exception.detail, "File not found")

    def test_disabled_download_returns_controlled_503(self):
        with mock.patch.dict(
            os.environ,
            {"APP_ENV": "production", "STORAGE_BACKEND": "disabled"},
            clear=False,
        ):

            async def fake_user(_token):
                return {
                    "id": "customer-1",
                    "email": "owner@example.com",
                    "role": "client",
                }

            with mock.patch.object(
                server, "get_user_from_token", side_effect=fake_user
            ):
                with self.assertRaises(HTTPException) as caught:
                    asyncio.run(
                        server.download_file(
                            "niuva/orders/customer-1/model.stl",
                            request_with_token("owner"),
                            auth=None,
                        )
                    )

        self.assertEqual(caught.exception.status_code, 503)
        self.assertEqual(caught.exception.detail, "File storage unavailable")


if __name__ == "__main__":
    unittest.main()
