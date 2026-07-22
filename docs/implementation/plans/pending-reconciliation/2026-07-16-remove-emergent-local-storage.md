# Remove Emergent and Add Local Development Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all active Emergent dependencies while preserving authenticated order-design and payment-proof upload/download flows through safe local development storage.

**Architecture:** Keep `backend/storage.py` as the storage boundary and replace its HTTP implementation with validated, atomic local filesystem operations. Preserve logical relative `storage_path` values and the existing API contract, then remove Emergent runtime/tooling from the frontend and deployment configuration. Local storage is development/demo-only; no production provider or migration is introduced.

**Tech Stack:** Python 3.12, FastAPI, pathlib, pytest, MongoDB metadata, React 19, CRACO, Jest, npm.

## Global Constraints

- Local filesystem storage is for development and demonstration only.
- Default storage root: `backend/.local-storage/`.
- Optional override: `LOCAL_STORAGE_ROOT`, resolved against `backend/` when relative.
- Persist and return logical relative storage paths only; never expose absolute server paths.
- Keep `/api/files/{path}` authenticated and ownership/permission protected.
- No Emergent fallback, network request, package, runtime script, environment flag, or deployment domain remains in active code/configuration.
- Do not migrate old Emergent files.
- Do not add runtime dependencies.
- Preserve the 50 MB upload limit and existing allowed-extension rules.
- Preserve unrelated user changes, especially the checklist edit in `docs/implementation/plans/pending-reconciliation/2026-07-14-foundation-identity-rbac-organization-audit.md`.
- Use TDD for behavior changes and run focused checks before full suites.

---

## File Map

| File | Responsibility |
|---|---|
| `backend/storage.py` | Local storage root resolution, safe path validation, atomic writes, metadata, reads, and typed storage errors |
| `backend/tests/test_storage.py` | Unit coverage for local storage, traversal rejection, metadata, missing files, and cleanup |
| `backend/server.py` | Translate storage errors into controlled API responses and make storage initialization startup-blocking |
| `backend/tests/test_storage_routes.py` | Upload helper and authenticated download integration coverage |
| `.gitignore` | Exclude development upload data |
| `backend/.env.example` | Document `LOCAL_STORAGE_ROOT`; remove the Emergent key |
| `frontend/public/index.html` | Remove hosted Emergent runtime injection |
| `frontend/craco.config.js` | Remove Emergent visual-edit wrapper |
| `frontend/package.json` | Remove Emergent development dependency |
| `frontend/package-lock.json` | Remove locked Emergent package and remote tarball |
| `frontend/.env.example` | Remove Emergent runtime flag |
| `frontend/src/constants/testIds/home.js` | Delete unused Emergent-only test ID |
| `frontend/src/constants/testIds/index.js` | Remove the deleted home registry export |
| `frontend/src/emergent-removal.test.js` | Regression scan for active Emergent frontend/config references |
| `doc/PRODUCTION_DEPLOYMENT.md` | Remove Emergent/CSP guidance and document local-storage limitations |
| `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md` | Remove stale active-behavior note about the Emergent test ID |

---

### Task 1: Replace Emergent Storage With a Safe Local Storage Module

**Files:**
- Modify: `backend/storage.py`
- Create: `backend/tests/test_storage.py`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `StorageError`, `StorageNotFoundError`, and `InvalidStoragePathError`.
- Produces: `init_storage() -> pathlib.Path`.
- Produces: `put_object(path: str, data: bytes, content_type: str) -> dict` with `path`, `size`, and `content_type`.
- Produces: `get_object(path: str) -> tuple[bytes, str]`.
- Consumed by: Task 2 route error translation and existing upload/download handlers.

- [x] **Step 1: Write failing unit tests for local storage**

Create `backend/tests/test_storage.py`:

```python
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
```

- [x] **Step 2: Run the contract test and confirm it fails without making an external request**

Run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py::test_exposes_local_storage_contract -q -n 0
```

Expected: FAIL with `AttributeError` because the current module has no typed local-storage exceptions. The targeted test does not call the current Emergent HTTP implementation.

- [x] **Step 3: Implement the local storage module**

Replace `backend/storage.py` with:

```python
"""Safe local object storage for NIUVA development and demonstrations."""

import json
import mimetypes
import os
import tempfile
from pathlib import Path, PurePosixPath, PureWindowsPath


BACKEND_DIR = Path(__file__).resolve().parent
DEFAULT_STORAGE_ROOT = BACKEND_DIR / ".local-storage"


class StorageError(RuntimeError):
    """Base error for local storage failures."""


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


def init_storage() -> Path:
    root = _storage_root()
    try:
        root.mkdir(parents=True, exist_ok=True)
    except OSError as exc:
        raise StorageError("Unable to initialize local storage") from exc
    if not root.is_dir():
        raise StorageError("Local storage root is not a directory")
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
        or any(part in {"", ".", ".."} for part in parts)
    ):
        raise InvalidStoragePathError("Invalid storage path")

    root = init_storage()
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


def put_object(path: str, data: bytes, content_type: str) -> dict:
    target, normalized = _resolve_path(path)
    metadata_target = _metadata_path(target)
    metadata = {
        "version": 1,
        "content_type": content_type or "application/octet-stream",
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
        content_type = metadata.get("content_type")
    except (FileNotFoundError, OSError, ValueError, TypeError):
        content_type = None

    if not content_type:
        content_type = mimetypes.guess_type(target.name)[0] or "application/octet-stream"
    return data, content_type
```

- [x] **Step 4: Ignore local development uploads**

Add this entry under the data/database section of `.gitignore`:

```gitignore
# Development/demo uploads; production storage is not defined yet.
backend/.local-storage/
```

- [x] **Step 5: Run the focused storage tests**

Run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py -q -n 0
```

Expected: all tests in `test_storage.py` PASS and no network call is made.

- [x] **Step 6: Commit the local storage boundary**

```powershell
git add -- .gitignore backend/storage.py backend/tests/test_storage.py
git commit -m "feat: replace Emergent storage with local development storage"
```

---

### Task 2: Integrate Typed Storage Errors With Upload and Download APIs

**Files:**
- Modify: `backend/server.py:263-278`
- Modify: `backend/server.py:510-519`
- Modify: `backend/server.py:846-852`
- Create: `backend/tests/test_storage_routes.py`

**Interfaces:**
- Consumes: Task 1 `storage.put_object`, `storage.get_object`, and typed exceptions.
- Preserves: `store_upload(file, prefix, allowed_exts) -> dict` metadata shape.
- Preserves: `/api/files/{path}` authentication and authorization contract.
- Produces: controlled HTTP `400`, `404`, and `500` responses without local paths.

- [x] **Step 1: Write failing upload/download integration tests**

Create `backend/tests/test_storage_routes.py`:

```python
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

```
- [x] **Step 2: Run the route tests and verify the current error behavior fails**

Run from `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_storage_routes.py -q -n 0
```

Expected: the upload-error and missing-file assertions FAIL because `server.py` does not yet translate typed storage errors; the payment-proof test also proves the preserved local upload flow once Task 1 is present.

- [x] **Step 3: Map upload storage failures without exposing server details**

Replace the storage call inside `store_upload` in `backend/server.py` with:

```python
    path = f"{APP_NAME}/{prefix}/{uuid.uuid4()}.{ext}"
    try:
        result = storage.put_object(
            path,
            data,
            file.content_type or "application/octet-stream",
        )
    except storage.InvalidStoragePathError as exc:
        logger.warning("Rejected generated storage path")
        raise HTTPException(status_code=400, detail="Invalid file storage path") from exc
    except storage.StorageError as exc:
        logger.exception("Unable to store uploaded file")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
```

Keep the existing returned database metadata dictionary unchanged.

- [x] **Step 4: Map download failures to controlled responses**

Replace the direct `storage.get_object(path)` call in `download_file` with:

```python
    try:
        data, content_type = storage.get_object(path)
    except storage.InvalidStoragePathError as exc:
        raise HTTPException(status_code=400, detail="Invalid file path") from exc
    except storage.StorageNotFoundError as exc:
        raise HTTPException(status_code=404, detail="File not found") from exc
    except storage.StorageError as exc:
        logger.exception("Unable to read stored file")
        raise HTTPException(status_code=500, detail="File storage unavailable") from exc
    return Response(content=data, media_type=content_type)
```

- [x] **Step 5: Make local storage initialization a startup requirement**

Replace the current caught initialization block in `startup()`:

```python
    storage.init_storage()
    await seed()
```

Do not retain the `try/except` that logs and continues. An unusable local root must stop startup.

- [x] **Step 6: Run focused storage and route tests**

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py tests\test_storage_routes.py -q -n 0
```

Expected: all focused tests PASS.

- [x] **Step 7: Run existing authentication and upload-flow regression tests**

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_auth_security.py -q -n 0
```

Expected: PASS with existing authentication, ownership, and role behavior unchanged.

- [x] **Step 8: Commit API integration**

```powershell
git add -- backend/server.py backend/tests/test_storage_routes.py
git commit -m "feat: integrate local storage with upload APIs"
```

---

### Task 3: Remove Emergent Frontend Runtime and Development Tooling

**Files:**
- Create: `frontend/src/emergent-removal.test.js`
- Modify: `frontend/public/index.html:34-41`
- Modify: `frontend/craco.config.js:140-156`
- Modify: `frontend/package.json`
- Modify: `frontend/package-lock.json`
- Modify: `frontend/.env.example:13-14`
- Delete: `frontend/src/constants/testIds/home.js`
- Modify: `frontend/src/constants/testIds/index.js`

**Interfaces:**
- Removes: `REACT_APP_ENABLE_EMERGENT_RUNTIME`.
- Removes: `@emergentbase/visual-edits` and `withVisualEdits`.
- Preserves: CRACO aliases, health-check plugin, dev-server compatibility, React startup, and production build behavior.
- Produces: a static regression test scanning active frontend files.

- [x] **Step 1: Write a failing frontend regression test**

Create `frontend/src/emergent-removal.test.js`:

```javascript
const fs = require("fs");
const path = require("path");


const frontendRoot = path.resolve(__dirname, "..");
const activeFrontendFiles = [
  "public/index.html",
  "craco.config.js",
  "package.json",
  "package-lock.json",
  ".env.example",
  "src/constants/testIds/home.js",
  "src/constants/testIds/index.js",
];


describe("Emergent removal", () => {
  test.each(activeFrontendFiles)("%s has no active Emergent reference", (relativePath) => {
    const absolutePath = path.join(frontendRoot, relativePath);
    if (!fs.existsSync(absolutePath)) return;
    const content = fs.readFileSync(absolutePath, "utf8").toLowerCase();
    expect(content).not.toContain("emergent");
  });
});
```

- [x] **Step 2: Run the regression test and verify it fails**

Run from `frontend/`:

```powershell
npm.cmd test -- --watchAll=false --runTestsByPath src/emergent-removal.test.js
```

Expected: FAIL for `index.html`, `craco.config.js`, `package.json`, `package-lock.json`, `.env.example`, and the home test ID.

- [x] **Step 3: Remove the hosted runtime injection and environment flag**

Delete this entire block from `frontend/public/index.html`:

```html
<script>
    if ("%REACT_APP_ENABLE_EMERGENT_RUNTIME%" === "true") {
        var emergentScript = document.createElement("script");
        emergentScript.src = "https://assets.emergent.sh/scripts/emergent-main.js";
        emergentScript.defer = true;
        document.head.appendChild(emergentScript);
    }
</script>
```

Delete these lines from `frontend/.env.example`:

```env
# Emergent's hosted runtime is optional; keep disabled unless the deployment platform requires it.
REACT_APP_ENABLE_EMERGENT_RUNTIME=false
```

- [x] **Step 4: Remove the CRACO visual-edit wrapper**

Delete the `if (isDevServer) { ... }` block that requires `@emergentbase/visual-edits/craco`. Keep this existing dev-server compatibility code directly after the base `webpackConfig.devServer` definition:

```javascript
const configureDevServer = webpackConfig.devServer;
webpackConfig.devServer = (devServerConfig) =>
  makeDevServerV5Compatible(configureDevServer(devServerConfig));

module.exports = webpackConfig;
```

- [x] **Step 5: Remove the package and regenerate the lockfile mechanically**

Run from `frontend/`:

```powershell
npm.cmd uninstall --save-dev @emergentbase/visual-edits
```

Expected: `package.json` and `package-lock.json` no longer contain the package or `assets.emergent.sh` tarball.

- [x] **Step 6: Remove the unused Emergent-only test ID**

Delete `frontend/src/constants/testIds/home.js`.

Remove this line from `frontend/src/constants/testIds/index.js`:

```javascript
export * from './home';
```

Leave the registry documentation comments intact.

- [x] **Step 7: Run the focused frontend regression test**

```powershell
npm.cmd test -- --watchAll=false --runTestsByPath src/emergent-removal.test.js
```

Expected: PASS.

- [x] **Step 8: Build the frontend without Emergent tooling**

```powershell
$env:REACT_APP_PUBLIC_SITE_URL='http://localhost:3000'
$env:REACT_APP_BACKEND_URL='http://127.0.0.1:8001'
$env:GENERATE_SOURCEMAP='false'
npm.cmd run build
```

Expected: optimized build completes successfully and no Emergent module warning appears.

- [x] **Step 9: Commit frontend removal**

```powershell
git add -- frontend/public/index.html frontend/craco.config.js frontend/package.json frontend/package-lock.json frontend/.env.example frontend/src/emergent-removal.test.js frontend/src/constants/testIds/index.js
git add --update -- frontend/src/constants/testIds/home.js
git commit -m "chore: remove Emergent frontend runtime and tooling"
```

---

### Task 4: Clean Backend Configuration and Deployment Documentation

**Files:**
- Modify: `backend/.env.example`
- Modify: `frontend/src/emergent-removal.test.js`
- Modify: `doc/PRODUCTION_DEPLOYMENT.md`
- Modify: `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`

**Interfaces:**
- Documents: `LOCAL_STORAGE_ROOT` as development/demo-only.
- Removes: `EMERGENT_LLM_KEY`, Emergent CSP domain, runtime instructions, and stale active-behavior notes.
- Preserves: provider-neutral production guidance and historical test reports.

- [x] **Step 1: Extend the regression test to active backend/deployment configuration**

Add this repository root and append the three active files in `frontend/src/emergent-removal.test.js`:

```javascript
const repositoryRoot = path.resolve(frontendRoot, "..");

const activeRepositoryFiles = [
  path.join(repositoryRoot, "backend/.env.example"),
  path.join(repositoryRoot, "doc/PRODUCTION_DEPLOYMENT.md"),
  path.join(repositoryRoot, "doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md"),
];

test.each(activeRepositoryFiles)("%s has no active Emergent reference", (absolutePath) => {
  const content = fs.readFileSync(absolutePath, "utf8").toLowerCase();
  expect(content).not.toContain("emergent");
});
```

- [x] **Step 2: Run the extended scan and verify it fails**

```powershell
npm.cmd test -- --watchAll=false --runTestsByPath src/emergent-removal.test.js
```

Expected: FAIL for the backend environment example and both deployment/implementation documents.

- [x] **Step 3: Replace the backend Emergent key with local storage configuration**

Delete from `backend/.env.example`:

```env
# Required only for the current Emergent-backed object-storage integration.
EMERGENT_LLM_KEY=
```

Add:

```env
# Development/demo only. Relative paths resolve from backend/.
LOCAL_STORAGE_ROOT=.local-storage
```

- [x] **Step 4: Update the production deployment runbook**

Make these exact policy changes in `doc/PRODUCTION_DEPLOYMENT.md`:

1. Remove the `REACT_APP_ENABLE_EMERGENT_RUNTIME` bullet.
2. Change the backend secret paragraph to:

```markdown
Backend memakai `backend/.env.example`. Nilai `JWT_SECRET`, kredensial admin, MongoDB, dan Resend adalah secret server-side; jangan memakai prefix `REACT_APP_`, jangan menyimpannya di Git, dan rotasi jika pernah terpapar. `LOCAL_STORAGE_ROOT` hanya untuk development/demo dan bukan rancangan storage production.
```

3. Remove `https://assets.emergent.sh` from `script-src` in the CSP example.
4. Replace the CSP note with:

```markdown
Aktifkan HSTS hanya setelah HTTPS dan seluruh subdomain dipastikan siap. Bila analytics dimatikan, hapus domain PostHog dari CSP.
```

5. Add this operational warning under backend readiness:

```markdown
- Filesystem lokal di `LOCAL_STORAGE_ROOT` hanya untuk development/demo. Jangan deploy portal upload ke production sebelum persistent object storage, backup, recovery, retention, dan capacity limit disetujui.
```

6. Add this pre-deploy gate:

```markdown
- Production yang menerima upload telah memakai persistent storage yang disetujui; jangan memakai `backend/.local-storage/`.
```

- [x] **Step 5: Remove the stale Emergent test-ID note**

Delete this active-behavior sentence from `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`:

```markdown
- `HOME.emergentLink` in `constants/testIds/home.js` remains untouched even though the current Home does not consume it.
```

Do not rewrite `test_reports/iteration_1.json`; it is preserved historical evidence rather than active configuration.

- [x] **Step 6: Run the active-reference regression test**

```powershell
npm.cmd test -- --watchAll=false --runTestsByPath src/emergent-removal.test.js
```

Expected: PASS.

- [x] **Step 7: Run an explicit active-code/configuration search**

Run from the repository root:

```powershell
$paths=@(
  'backend/storage.py',
  'backend/server.py',
  'backend/.env.example',
  'frontend/public/index.html',
  'frontend/craco.config.js',
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/.env.example',
  'frontend/src/constants/testIds',
  'doc/PRODUCTION_DEPLOYMENT.md',
  'doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
)
rg -n -i 'emergent|EMERGENT_LLM_KEY|ENABLE_EMERGENT' $paths
if($LASTEXITCODE -eq 0){throw 'Active Emergent reference remains'}
if($LASTEXITCODE -ne 1){throw "rg failed with exit code $LASTEXITCODE"}
'No active Emergent references'
```

Expected: `No active Emergent references`.

- [x] **Step 8: Commit configuration and documentation cleanup**

```powershell
git add -- backend/.env.example frontend/src/emergent-removal.test.js doc/PRODUCTION_DEPLOYMENT.md doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md
git commit -m "docs: remove Emergent configuration and deployment guidance"
```

---

### Task 5: Perform Full Verification and Update Plan Tracking

**Files:**
- Verify: all files from Tasks 1-4
- Modify: `docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md` checkboxes only after each command succeeds

**Interfaces:**
- Verifies: local storage, authorization, backend regressions, frontend regressions, production build, active-reference removal, and clean staging boundaries.
- Produces: execution evidence recorded in the implementation handoff.

- [x] **Step 1: Run focused backend storage verification**

From `backend/`:

```powershell
.\.venv\Scripts\python.exe -m pytest tests\test_storage.py tests\test_storage_routes.py tests\test_auth_security.py -q -n 0
```

Expected: exit code `0`; all focused tests PASS.

- [x] **Step 2: Run the complete backend suite**

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Expected: exit code `0`. Environment-dependent live MongoDB transaction and URL-driven integration modules may report their documented skips when their environment variables are absent.

- [x] **Step 3: Run the complete frontend test suite**

From `frontend/`:

```powershell
npm.cmd test -- --watchAll=false
```

Expected: exit code `0`; all suites PASS.

- [ ] **Step 4: Run a fresh optimized frontend build**

```powershell
$env:REACT_APP_PUBLIC_SITE_URL='http://localhost:3000'
$env:REACT_APP_BACKEND_URL='http://127.0.0.1:8001'
$env:GENERATE_SOURCEMAP='false'
npm.cmd run build
```

Expected: exit code `0`; build completes without Emergent module/runtime warnings.

- [x] **Step 5: Verify local storage directly with an isolated temporary root**

From `backend/`:

```powershell
$tempRoot=Join-Path $env:TEMP ('niuva-storage-smoke-' + [guid]::NewGuid())
$env:LOCAL_STORAGE_ROOT=$tempRoot
.\.venv\Scripts\python.exe -c "import storage; result=storage.put_object('niuva/smoke/file.txt', b'niuva', 'text/plain'); assert result['path']=='niuva/smoke/file.txt'; assert storage.get_object(result['path'])==(b'niuva','text/plain'); print('local storage smoke passed')"
Remove-Item -LiteralPath $tempRoot -Recurse -Force
```

Expected: `local storage smoke passed`.

- [x] **Step 6: Repeat the explicit active-reference scan**

```powershell
$paths=@(
  'backend/storage.py',
  'backend/server.py',
  'backend/.env.example',
  'frontend/public/index.html',
  'frontend/craco.config.js',
  'frontend/package.json',
  'frontend/package-lock.json',
  'frontend/.env.example',
  'frontend/src/constants/testIds',
  'doc/PRODUCTION_DEPLOYMENT.md',
  'doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md'
)
rg -n -i 'emergent|EMERGENT_LLM_KEY|ENABLE_EMERGENT' $paths
if($LASTEXITCODE -eq 0){throw 'Active Emergent reference remains'}
if($LASTEXITCODE -ne 1){throw "rg failed with exit code $LASTEXITCODE"}
'No active Emergent references'
```

Expected: `No active Emergent references`.

- [x] **Step 7: Check formatting and repository boundaries**

From the repository root:

```powershell
git diff --check
git status --short
```

Expected: no whitespace errors. Status contains only the intended implementation files plus the previously existing identity-plan checklist edit and the approved spec/plan if they have not yet been committed separately.

- [x] **Step 8: Mark only verified plan steps complete**

Change a checkbox from `[ ]` to `[x]` only when its command or required inspection has succeeded. Leave any environment-dependent check unchecked and document why.

- [x] **Step 9: Commit verification tracking if authorized**

Do this only when the user has explicitly authorized committing documentation:

```powershell
git add -- docs/implementation/specs/active/2026-07-16-remove-emergent-local-storage-design.md docs/implementation/plans/pending-reconciliation/2026-07-16-remove-emergent-local-storage.md
git commit -m "docs: add local storage design and implementation plan"
```

Do not stage the unrelated identity-plan checklist edit in this commit.

---

## Package Exit Criteria

- Backend startup performs no Emergent storage request.
- `backend/.local-storage/` is created automatically and ignored by Git.
- Uploaded order designs and payment proofs retain relative logical storage paths.
- Owner/staff download authorization remains enforced.
- Missing files return `404`; invalid paths cannot leave the storage root.
- No active frontend/backend/configuration/deployment reference to Emergent remains.
- Focused and full backend tests pass subject only to documented environment skips.
- Full frontend tests and optimized build pass.
- Documentation warns that local filesystem storage is development/demo-only.
- No production storage provider or migration is silently selected.
