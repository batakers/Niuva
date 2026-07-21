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
def local_storage_env(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("STORAGE_BACKEND", "local")


@pytest.fixture
def local_root(tmp_path, monkeypatch, local_storage_env):
    root = tmp_path / "uploads"
    monkeypatch.setenv("LOCAL_STORAGE_ROOT", str(root))
    return root


def test_init_storage_creates_configured_root(local_root):
    assert storage.init_storage() == local_root.resolve()
    assert local_root.is_dir()


def test_init_storage_rejects_file_as_root(tmp_path, monkeypatch, local_storage_env):
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


def test_duplicate_write_preserves_existing_object_and_metadata(local_root):
    path = "niuva/orders/user-1/model.stl"
    storage.put_object(path, b"original", "model/stl")
    target = local_root / path
    metadata_target = target.with_name(f"{target.name}.metadata.json")
    original_metadata = metadata_target.read_bytes()

    with pytest.raises(storage.StorageError, match="already exists"):
        storage.put_object(path, b"replacement", "application/octet-stream")

    assert target.read_bytes() == b"original"
    assert metadata_target.read_bytes() == original_metadata
    assert storage.get_object(path) == (b"original", "model/stl")


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


@pytest.mark.parametrize(
    "metadata",
    [
        [],
        {},
        {"content_type": ""},
        {"content_type": "   "},
        {"content_type": 42},
    ],
)
def test_unusable_metadata_uses_extension_fallback(local_root, metadata):
    path = "niuva/payments/user-1/proof.png"
    target = local_root / path
    target.parent.mkdir(parents=True)
    target.write_bytes(b"png")
    target.with_name(f"{target.name}.metadata.json").write_text(
        json.dumps(metadata),
        encoding="utf-8",
    )

    assert storage.get_object(path) == (b"png", "image/png")


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


def test_exposes_typed_storage_environment_errors():
    assert issubclass(storage.StorageUnavailableError, storage.StorageError)
    assert issubclass(storage.StorageConfigurationError, storage.StorageError)


def test_disabled_storage_returns_none_and_rejects_reads_and_writes(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("STORAGE_BACKEND", "disabled")

    assert storage.init_storage() is None
    with pytest.raises(storage.StorageUnavailableError):
        storage.put_object("niuva/orders/user-1/model.stl", b"solid niuva", "model/stl")
    with pytest.raises(storage.StorageUnavailableError):
        storage.get_object("niuva/orders/user-1/model.stl")


def test_local_storage_is_rejected_in_production(monkeypatch):
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "local")

    with pytest.raises(storage.StorageConfigurationError):
        storage.init_storage()


def test_unknown_storage_backend_is_rejected(monkeypatch):
    monkeypatch.setenv("APP_ENV", "test")
    monkeypatch.setenv("STORAGE_BACKEND", "unconfigured-provider")

    with pytest.raises(storage.StorageConfigurationError):
        storage.init_storage()


@pytest.mark.parametrize(
    "unsafe_path",
    [
        "niuva/file:stream.stl",
        "niuva/trailing-space /model.stl",
        "niuva/trailing-dot./model.stl",
    ],
)
def test_rejects_colon_and_windows_unsafe_path_components(local_root, unsafe_path):
    with pytest.raises(storage.InvalidStoragePathError):
        storage.put_object(unsafe_path, b"data", "application/octet-stream")


@pytest.mark.parametrize(
    "content_type",
    [
        "",
        "a" * 256,
        "image/png\rmalicious",
        "image/png\nmalicious",
    ],
)
def test_unsafe_mime_metadata_is_stored_as_binary(local_root, content_type):
    result = storage.put_object(
        "niuva/orders/user-1/model.stl",
        b"solid niuva",
        content_type,
    )

    assert result["content_type"] == "application/octet-stream"
    assert storage.get_object(result["path"]) == (
        b"solid niuva",
        "application/octet-stream",
    )
