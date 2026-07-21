# Remove Backend Emergent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Remove active backend Emergent storage dependencies while preserving safe local development/demo upload behavior and failing closed everywhere else.

**Architecture:** Keep `backend/storage.py` as the stable module-level storage port. Select either a validated local filesystem adapter or a disabled adapter from explicit environment configuration; production may never select local storage. FastAPI translates typed storage errors into controlled HTTP responses.

**Tech Stack:** Python 3.12, FastAPI, pathlib, tempfile, unittest/pytest.

## Global Constraints

- `STORAGE_BACKEND` defaults to `disabled`.
- `STORAGE_BACKEND=local` is accepted only for `APP_ENV=development`, `demo`, or `test`.
- The default local root is `backend/.local-storage/`; a relative `LOCAL_STORAGE_ROOT` resolves from `backend/`.
- Persist only logical relative paths and reject traversal, absolute paths, drive paths, null bytes, empty segments, and NTFS alternate-stream syntax.
- Preserve the existing 50 MB limit and extension allowlists.
- Do not select a production storage provider or migrate Emergent objects.
- Do not commit or push without separate user authorization.

---

### Task 1: Add failing storage-port tests

**Files:**
- Create: `backend/tests/test_storage.py`
- Modify: `backend/tests/test_repository_credential_hygiene.py`

**Interfaces:**
- Produces expectations for `StorageError`, `StorageUnavailableError`, `StorageConfigurationError`, `StorageNotFoundError`, and `InvalidStoragePathError`.
- Produces expectations for `init_storage()`, `put_object()`, and `get_object()`.

- [x] Write tests that set `APP_ENV=test` and `STORAGE_BACKEND=local`, then verify root creation, byte/MIME round-trip, relative logical paths, and metadata fallback.
- [x] Write parameterized tests rejecting `..`, absolute, drive-qualified, null-byte, empty-segment, and colon paths.
- [x] Write tests proving disabled mode raises `StorageUnavailableError` and production-local initialization raises `StorageConfigurationError`.
- [x] Extend repository hygiene coverage to reject `EMERGENT_LLM_KEY`, `integrations.emergentagent.com`, and the `emergentintegrations` package from active backend files.
- [x] Run `python -B -m unittest backend.tests.test_storage backend.tests.test_repository_credential_hygiene -v` and confirm failures are caused by the missing local/disabled storage implementation.

### Task 2: Implement the provider-neutral local/disabled storage port

**Files:**
- Modify: `backend/storage.py`
- Modify: `.gitignore`

**Interfaces:**
- `init_storage() -> pathlib.Path | None`: creates/validates local storage, returns `None` in disabled mode, rejects production-local configuration.
- `put_object(path: str, data: bytes, content_type: str) -> dict`: returns logical `path`, byte `size`, and normalized `content_type`.
- `get_object(path: str) -> tuple[bytes, str]`: returns bytes and stored/fallback MIME type.

- [x] Replace the HTTP implementation with environment selection, typed errors, safe resolution, atomic data/JSON sidecar writes, and MIME fallback.
- [x] Add `backend/.local-storage/` to `.gitignore`.
- [x] Re-run the focused unit tests and confirm they pass.

### Task 3: Map storage errors at the FastAPI boundary

**Files:**
- Create: `backend/tests/test_storage_routes.py`
- Modify: `backend/server.py`

**Interfaces:**
- Disabled upload/download returns HTTP `503` with `File storage unavailable`.
- Missing local data returns HTTP `404` with `File not found`.
- Invalid logical paths return HTTP `400` without exposing filesystem paths.
- Other local I/O failures return HTTP `500` with controlled detail.

- [x] Write route/helper tests before production changes, using a real temporary local root for round trips and a minimal boundary substitution only for an unavailable adapter.
- [x] Run the route tests and verify the expected `503`/`404` assertions fail against current `server.py`.
- [x] Add typed exception translation around upload and download calls.
- [x] Keep startup available when storage is disabled, but let invalid/unwritable local configuration fail startup.
- [x] Re-run storage, route, and authentication-security tests.

### Task 4: Remove backend Emergent configuration and stale deployment guidance

**Files:**
- Modify: `backend/requirements.txt`
- Modify: `backend/.env.example`
- Modify: `doc/PRODUCTION_DEPLOYMENT.md`
- Modify: `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`

- [x] Remove the unused `emergentintegrations` requirement.
- [x] Replace `EMERGENT_LLM_KEY` with explicit development examples for `APP_ENV`, `STORAGE_BACKEND`, and `LOCAL_STORAGE_ROOT`.
- [x] Remove stale frontend runtime/CSP references and document disabled/local storage behavior plus the production prohibition.
- [x] Remove the stale Emergent test-ID note.
- [x] Run the hygiene test and an explicit active-code/config search.

### Task 5: Verify the complete change

**Files:**
- Verify all intended files and documentation.

- [x] Create/use an isolated Python 3.12 virtual environment and install the cleaned backend requirements if necessary.
- [x] Run the focused storage, route, authentication, and credential-hygiene tests.
- [x] Run the complete configured backend suite and record environment-driven skips separately from failures.
- [x] Run the frontend test command and optimized production build as regression checks.
- [x] Run a direct isolated local-storage smoke test.
- [x] Run `git diff --check`, inspect `git status --short`, and confirm no unintended files or secrets were added.
- [x] Leave the branch uncommitted and unpushed pending explicit user authorization.
