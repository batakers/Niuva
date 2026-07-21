"""Provider-neutral storage port for NIUVA.

The local adapter is intentionally limited to development, demo, and test
environments. Production storage remains disabled until ADR-002 readiness
gates and a private persistent provider are approved.
"""

import json
import mimetypes
import os
import tempfile
from pathlib import Path, PurePosixPath, PureWindowsPath

BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_STORAGE_ROOT = BACKEND_DIR / ".local-storage"
LOCAL_ENVIRONMENTS = frozenset({"development", "demo", "test"})


class StorageError(RuntimeError):
    """Base error for controlled storage failures."""


class StorageUnavailableError(StorageError):
    """Raised when persistent file storage is intentionally disabled."""


class StorageConfigurationError(StorageError):
    """Raised when storage configuration violates an environment boundary."""


class StorageNotFoundError(StorageError):
    """Raised when a logical storage path has no local object."""


class InvalidStoragePathError(StorageError):
    """Raised when a logical path is unsafe or could escape the storage root."""


def _storage_backend() -> str:
    return os.environ.get("STORAGE_BACKEND", "disabled").strip().lower() or "disabled"


def _application_environment() -> str:
    return os.environ.get("APP_ENV", "production").strip().lower() or "production"


def _require_local_configuration() -> None:
    backend = _storage_backend()
    if backend == "disabled":
        raise StorageUnavailableError("File storage is disabled")
    if backend != "local":
        raise StorageConfigurationError("Unsupported storage backend")
    if _application_environment() not in LOCAL_ENVIRONMENTS:
        raise StorageConfigurationError(
            "Local file storage is restricted to development, demo, and test"
        )


def _storage_root() -> Path:
    _require_local_configuration()
    configured = os.environ.get("LOCAL_STORAGE_ROOT", "").strip()
    root = Path(configured) if configured else DEFAULT_STORAGE_ROOT
    if not root.is_absolute():
        root = BACKEND_DIR / root
    return root.resolve()


def init_storage() -> Path | None:
    """Initialize the configured adapter without enabling production uploads."""
    if _storage_backend() == "disabled":
        return None

    root = _storage_root()
    probe = None
    try:
        root.mkdir(parents=True, exist_ok=True)
        if not root.is_dir():
            raise StorageConfigurationError("Local storage root is not a directory")
        descriptor, probe_name = tempfile.mkstemp(
            prefix=".niuva-storage-check-", dir=root
        )
        os.close(descriptor)
        probe = Path(probe_name)
        probe.unlink()
    except StorageConfigurationError:
        raise
    except OSError as exc:
        if probe is not None:
            probe.unlink(missing_ok=True)
        raise StorageConfigurationError("Unable to initialize local storage") from exc
    return root


def _resolve_path(storage_path: str) -> tuple[Path, str]:
    if not isinstance(storage_path, str) or not storage_path or "\x00" in storage_path:
        raise InvalidStoragePathError("Invalid storage path")

    normalized = storage_path.replace("\\", "/")
    parts = normalized.split("/")
    windows_path = PureWindowsPath(storage_path)
    if (
        PurePosixPath(normalized).is_absolute()
        or bool(windows_path.drive)
        or any(part in {"", ".", ".."} for part in parts)
        or any(":" in part or part.endswith((" ", ".")) for part in parts)
    ):
        raise InvalidStoragePathError("Invalid storage path")

    root = init_storage()
    if root is None:
        raise StorageUnavailableError("File storage is disabled")
    candidate = root.joinpath(*parts).resolve()
    try:
        candidate.relative_to(root)
    except ValueError as exc:
        raise InvalidStoragePathError("Invalid storage path") from exc
    return candidate, "/".join(parts)


def _metadata_path(target: Path) -> Path:
    return target.with_name(f"{target.name}.metadata.json")


def _safe_content_type(content_type: str | None) -> str:
    candidate = (content_type or "").strip()
    if not candidate or len(candidate) > 255 or "\r" in candidate or "\n" in candidate:
        return "application/octet-stream"
    return candidate


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


def put_object(path: str, data: bytes, content_type: str) -> dict:
    target, normalized = _resolve_path(path)
    metadata_target = _metadata_path(target)
    if target.exists() or metadata_target.exists():
        raise StorageError("Stored object already exists")

    safe_content_type = _safe_content_type(content_type)
    metadata = {
        "version": 1,
        "content_type": safe_content_type,
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
    return {
        "path": normalized,
        "size": len(data),
        "content_type": safe_content_type,
    }


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
            candidate = metadata.get("content_type")
            if isinstance(candidate, str):
                content_type = _safe_content_type(candidate)
    except (FileNotFoundError, OSError, ValueError, TypeError):
        content_type = None

    if not content_type:
        content_type = (
            mimetypes.guess_type(target.name)[0] or "application/octet-stream"
        )
    return data, content_type
