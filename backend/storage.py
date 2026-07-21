"""Safe local object storage for NIUVA development and demonstrations."""

import json
import mimetypes
import os
import tempfile
from pathlib import Path, PurePosixPath, PureWindowsPath


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_STORAGE_ROOT = BACKEND_DIR / ".local-storage"
LOCAL_ENVIRONMENTS = frozenset({"development", "demo", "test"})
DEFAULT_CONTENT_TYPE = "application/octet-stream"
MAX_CONTENT_TYPE_LENGTH = 255


class StorageError(RuntimeError):
    """Base error for local storage failures."""


class StorageUnavailableError(StorageError):
    """Raised when persistent storage is intentionally disabled."""


class StorageConfigurationError(StorageError):
    """Raised when the selected storage configuration is unsupported or unsafe."""


class StorageNotFoundError(StorageError):
    """Raised when a logical storage path has no local object."""


class InvalidStoragePathError(StorageError):
    """Raised when a logical path could escape the configured root."""


def _storage_root() -> Path:
    configured = os.environ.get("LOCAL_STORAGE_ROOT", "").strip()
    root = Path(configured) if configured else DEFAULT_STORAGE_ROOT
    if not root.is_absolute():
        root = BACKEND_DIR / root
    return root.resolve()


def _normalized_environment(name: str, default: str) -> str:
    return os.environ.get(name, "").strip().lower() or default


def init_storage() -> Path | None:
    backend = _normalized_environment("STORAGE_BACKEND", "disabled")
    if backend == "disabled":
        return None
    if backend != "local":
        raise StorageConfigurationError("Unsupported storage backend")

    app_environment = _normalized_environment("APP_ENV", "production")
    if app_environment not in LOCAL_ENVIRONMENTS:
        raise StorageConfigurationError(
            "Local storage is only available in development, demo, or test"
        )

    descriptor = None
    probe = None
    try:
        root = _storage_root()
        root.mkdir(parents=True, exist_ok=True)
        if not root.is_dir():
            raise OSError("Local storage root is not a directory")
        descriptor, probe_name = tempfile.mkstemp(
            prefix=".niuva-storage-probe-",
            dir=root,
        )
        probe = Path(probe_name)
        os.close(descriptor)
        descriptor = None
        probe.unlink()
        probe = None
    except (OSError, ValueError) as exc:
        raise StorageConfigurationError("Unable to initialize local storage") from exc
    finally:
        if descriptor is not None:
            try:
                os.close(descriptor)
            except OSError:
                pass
        if probe is not None:
            try:
                probe.unlink(missing_ok=True)
            except OSError:
                pass
    return root


def _resolve_path(storage_path: str) -> tuple[Path, str]:
    if not isinstance(storage_path, str) or not storage_path or "\x00" in storage_path:
        raise InvalidStoragePathError("Invalid storage path")

    normalized = storage_path.replace("\\", "/")
    windows_path = PureWindowsPath(storage_path)
    parts = normalized.split("/")
    if (
        PurePosixPath(normalized).is_absolute()
        or windows_path.drive
        or any(
            part in {"", ".", ".."}
            or ":" in part
            or part.endswith((" ", "."))
            for part in parts
        )
    ):
        raise InvalidStoragePathError("Invalid storage path")

    root = init_storage()
    if root is None:
        raise StorageUnavailableError("Storage is disabled")
    candidate = root.joinpath(*parts).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise InvalidStoragePathError("Invalid storage path") from exc
    return candidate, "/".join(parts)


def _metadata_path(target: Path) -> Path:
    return target.with_name(f"{target.name}.metadata.json")


def _atomic_write(target: Path, payload: bytes) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{target.name}.",
        suffix=".tmp",
        dir=target.parent,
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)


def _sanitize_content_type(content_type: object) -> str:
    if not isinstance(content_type, str):
        return DEFAULT_CONTENT_TYPE
    normalized = content_type.strip()
    if (
        not normalized
        or len(content_type) > MAX_CONTENT_TYPE_LENGTH
        or "\r" in content_type
        or "\n" in content_type
    ):
        return DEFAULT_CONTENT_TYPE
    return normalized


def put_object(path: str, data: bytes, content_type: str) -> dict:
    target, normalized = _resolve_path(path)
    metadata_target = _metadata_path(target)
    if target.exists() or metadata_target.exists():
        raise StorageError("Stored object already exists")

    metadata = {
        "version": 1,
        "content_type": _sanitize_content_type(content_type),
        "size": len(data),
    }
    try:
        _atomic_write(target, data)
        _atomic_write(
            metadata_target,
            json.dumps(metadata, sort_keys=True).encode("utf-8"),
        )
    except OSError as exc:
        target.unlink(missing_ok=True)
        metadata_target.unlink(missing_ok=True)
        raise StorageError("Unable to store object") from exc
    return {"path": normalized, "size": len(data), "content_type": metadata["content_type"]}


def get_object(path: str) -> tuple[bytes, str]:
    target, _normalized = _resolve_path(path)
    try:
        data = target.read_bytes()
    except FileNotFoundError as exc:
        raise StorageNotFoundError("Stored file not found") from exc
    except OSError as exc:
        raise StorageError("Unable to read stored file") from exc

    content_type = None
    try:
        metadata = json.loads(_metadata_path(target).read_text(encoding="utf-8"))
        if isinstance(metadata, dict):
            metadata_content_type = metadata.get("content_type")
            if isinstance(metadata_content_type, str) and metadata_content_type.strip():
                content_type = _sanitize_content_type(metadata_content_type)
    except (FileNotFoundError, OSError, ValueError, TypeError):
        content_type = None

    if not content_type:
        content_type = mimetypes.guess_type(target.name)[0] or DEFAULT_CONTENT_TYPE
    return data, content_type
