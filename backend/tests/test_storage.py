import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import storage  # noqa: E402

TEST_TMP_PARENT = Path("C:/tmp") if os.name == "nt" else Path(tempfile.gettempdir())


class LocalStorageTests(unittest.TestCase):
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

    def test_exposes_typed_storage_contract(self):
        self.assertTrue(
            issubclass(storage.StorageUnavailableError, storage.StorageError)
        )
        self.assertTrue(
            issubclass(storage.StorageConfigurationError, storage.StorageError)
        )
        self.assertTrue(issubclass(storage.StorageNotFoundError, storage.StorageError))
        self.assertTrue(
            issubclass(storage.InvalidStoragePathError, storage.StorageError)
        )

    def test_disabled_mode_keeps_startup_available_but_blocks_operations(self):
        with mock.patch.dict(
            os.environ,
            {"APP_ENV": "production", "STORAGE_BACKEND": "disabled"},
            clear=False,
        ):
            self.assertIsNone(storage.init_storage())
            with self.assertRaises(storage.StorageUnavailableError):
                storage.put_object(
                    "niuva/orders/user-1/model.stl", b"data", "model/stl"
                )
            with self.assertRaises(storage.StorageUnavailableError):
                storage.get_object("niuva/orders/user-1/model.stl")

    def test_local_mode_is_rejected_in_production(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            with mock.patch.dict(
                os.environ,
                {
                    "APP_ENV": "production",
                    "STORAGE_BACKEND": "local",
                    "LOCAL_STORAGE_ROOT": temporary_directory,
                },
                clear=False,
            ):
                with self.assertRaises(storage.StorageConfigurationError):
                    storage.init_storage()

    def test_unknown_backend_is_rejected(self):
        with mock.patch.dict(
            os.environ,
            {"APP_ENV": "test", "STORAGE_BACKEND": "remote-mystery"},
            clear=False,
        ):
            with self.assertRaises(storage.StorageConfigurationError):
                storage.init_storage()

    def test_local_round_trip_preserves_logical_path_bytes_and_metadata(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            with self.local_environment(root):
                self.assertEqual(storage.init_storage(), root.resolve())
                result = storage.put_object(
                    "niuva/orders/user-1/model.stl",
                    b"solid niuva",
                    "model/stl",
                )

                self.assertEqual(
                    result,
                    {
                        "path": "niuva/orders/user-1/model.stl",
                        "size": 11,
                        "content_type": "model/stl",
                    },
                )
                self.assertEqual(
                    storage.get_object(result["path"]), (b"solid niuva", "model/stl")
                )
                metadata_path = root / "niuva/orders/user-1/model.stl.metadata.json"
                self.assertEqual(
                    json.loads(metadata_path.read_text(encoding="utf-8")),
                    {"content_type": "model/stl", "size": 11, "version": 1},
                )

    def test_relative_root_resolves_from_backend_directory(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            temporary_backend = Path(temporary_directory)
            with mock.patch.object(storage, "BACKEND_DIR", temporary_backend):
                with mock.patch.dict(
                    os.environ,
                    {
                        "APP_ENV": "development",
                        "STORAGE_BACKEND": "local",
                        "LOCAL_STORAGE_ROOT": "relative-uploads",
                    },
                    clear=False,
                ):
                    self.assertEqual(
                        storage.init_storage(),
                        (temporary_backend / "relative-uploads").resolve(),
                    )

    def test_duplicate_write_preserves_existing_object(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            with self.local_environment(root):
                path = "niuva/orders/user-1/model.stl"
                storage.put_object(path, b"original", "model/stl")
                with self.assertRaises(storage.StorageError):
                    storage.put_object(path, b"replacement", "application/octet-stream")
                self.assertEqual(storage.get_object(path), (b"original", "model/stl"))

    def test_rejects_unsafe_logical_paths(self):
        unsafe_paths = (
            "../outside.stl",
            "niuva/../../outside.stl",
            "/absolute/outside.stl",
            r"C:\outside.stl",
            r"..\outside.stl",
            "niuva//empty-segment.stl",
            "niuva/bad\x00name.stl",
            "niuva/orders/file.stl:alternate",
        )
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            with self.local_environment(Path(temporary_directory) / "uploads"):
                for unsafe_path in unsafe_paths:
                    with self.subTest(path=repr(unsafe_path)):
                        with self.assertRaises(storage.InvalidStoragePathError):
                            storage.put_object(
                                unsafe_path, b"data", "application/octet-stream"
                            )

    def test_missing_object_raises_typed_error(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            with self.local_environment(Path(temporary_directory) / "uploads"):
                with self.assertRaises(storage.StorageNotFoundError):
                    storage.get_object("niuva/orders/user-1/missing.stl")

    def test_missing_metadata_uses_extension_fallback(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            with self.local_environment(root):
                target = root / "niuva/payments/user-1/proof.png"
                target.parent.mkdir(parents=True)
                target.write_bytes(b"png")
                self.assertEqual(
                    storage.get_object("niuva/payments/user-1/proof.png"),
                    (b"png", "image/png"),
                )

    def test_metadata_failure_removes_partial_object_and_temporary_files(self):
        with tempfile.TemporaryDirectory(dir=TEST_TMP_PARENT) as temporary_directory:
            root = Path(temporary_directory) / "uploads"
            with self.local_environment(root):
                original_atomic_write = storage._atomic_write

                def fail_metadata(target, payload):
                    if target.name.endswith(".metadata.json"):
                        raise OSError("simulated metadata failure")
                    original_atomic_write(target, payload)

                with mock.patch.object(
                    storage, "_atomic_write", side_effect=fail_metadata
                ):
                    with self.assertRaises(storage.StorageError):
                        storage.put_object(
                            "niuva/orders/user-1/model.stl",
                            b"solid niuva",
                            "model/stl",
                        )

                self.assertFalse((root / "niuva/orders/user-1/model.stl").exists())
                self.assertEqual(list(root.rglob("*.tmp")), [])


if __name__ == "__main__":
    unittest.main()
