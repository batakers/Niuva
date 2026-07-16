import json
import sys
from pathlib import Path

import pytest


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

import storage  # noqa: E402


def test_exposes_local_storage_contract():
    assert issubclass(storage.StorageNotFoundError, storage.StorageError)
    assert issubclass(storage.InvalidStoragePathError, storage.StorageError)
    assert callable(storage.init_storage)
    assert callable(storage.put_object)
    assert callable(storage.get_object)


@pytest.fixture
def local_root(tmp_path, monkeypatch):
    root = tmp_path / "uploads"
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(root))
    return root


def test_init_storage_creates_configured_root(local_root):
    assert storage.init_storage() == local_root.resolve()
    assert local_root.is_dir()


def test_init_storage_rejects_file_as_root(tmp_path, monkeypatch):
    root = tmp_path / "not-a-directory"
    root.write_text("occupied", encoding="utf-8")
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(root))

    with pytest.raises(storage.StorageError, match="Unable to initialize local storage"):
        storage.init_storage()


def test_put_and_get_object_preserve_bytes_and_metadata(local_root):
    result = storage.put_object(
        "niuva/orders/user-1/model.stl",
        b"solid niuva",
        "model/stl",
    )

    assert result == {
        "path": "niuva/orders/user-1/model.stl",
        "size": 11,
        "content_type": "model/stl",
    }
    assert (local_root / "niuva/orders/user-1/model.stl").read_bytes() == b"solid niuva"
    metadata = json.loads(
        (local_root / "niuva/orders/user-1/model.stl.metadata.json").read_text(
            encoding="utf-8"
        )
    )
    assert metadata == {"version": 1, "content_type": "model/stl", "size": 11}
    assert storage.get_object(result["path"]) == (b"solid niuva", "model/stl")


@pytest.mark.parametrize(
    "unsafe_path",
    [
        "../outside.stl",
        "niuva/../../outside.stl",
        "/absolute/outside.stl",
        r"C:\outside.stl",
        r"..\outside.stl",
        "niuva//empty-segment.stl",
        "niuva/bad\x00name.stl",
    ],
)
def test_rejects_paths_outside_storage_root(local_root, unsafe_path):
    with pytest.raises(storage.InvalidStoragePathError):
        storage.put_object(unsafe_path, b"data", "application/octet-stream")


def test_missing_object_raises_typed_error(local_root):
    with pytest.raises(storage.StorageNotFoundError):
        storage.get_object("niuva/orders/user-1/missing.stl")


def test_missing_metadata_uses_extension_fallback(local_root):
    target = local_root / "niuva/payments/user-1/proof.png"
    target.parent.mkdir(parents=True)
    target.write_bytes(b"png")

    assert storage.get_object("niuva/payments/user-1/proof.png") == (b"png", "image/png")


def test_metadata_write_failure_removes_partial_object(local_root, monkeypatch):
    original_atomic_write = storage._atomic_write

    def fail_metadata(target, payload):
        if target.name.endswith(".metadata.json"):
            raise OSError("simulated metadata failure")
        original_atomic_write(target, payload)

    monkeypatch.setattr(storage, "_atomic_write", fail_metadata)

    with pytest.raises(storage.StorageError, match="Unable to store object"):
        storage.put_object(
            "niuva/orders/user-1/model.stl",
            b"solid niuva",
            "model/stl",
        )

    assert not (local_root / "niuva/orders/user-1/model.stl").exists()
    assert not list(local_root.rglob("*.tmp"))
