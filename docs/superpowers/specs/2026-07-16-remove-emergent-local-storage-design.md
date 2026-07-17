# Remove Emergent and Add Local Development Storage Design

**Date:** 2026-07-16
**Status:** Approved with Open Decisions
**Base:** `design/catalog-material-inventory-foundation` at `f00c662`
**Approved scope:** Development/demo storage only
**Related requirements:** `AGENTS.md`, `PRODUCT.md`, `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`, and `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
**Approved architecture pointers:** `doc/decisions/ADR-002-production-file-storage-architecture.md` and `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

## 1. Context

The current application depends on Emergent in two separate areas:

1. The backend uses Emergent object-storage endpoints for order design files and payment-proof uploads.
2. The frontend optionally loads the Emergent hosted runtime and includes the Emergent visual-edits development package.

This dependency causes the backend to make an external storage initialization request during startup. Without an Emergent key, startup logs an external-storage error even though the rest of the application can continue. The project must no longer depend on Emergent.

For the current development and demonstration phase, uploaded files use local filesystem storage. This approved scope does not make the local adapter production-ready. `doc/decisions/ADR-002-production-file-storage-architecture.md` separately approves a stable provider-neutral storage port with private persistent object storage as the production adapter class; production provider and operational readiness remain open.

## 2. Goals

1. Remove all active Emergent runtime, package, configuration, storage, and deployment dependencies.
2. Preserve the existing order design-file and payment-proof upload flows for local development and demonstrations.
3. Preserve the current backend storage interface so order and payment handlers require minimal changes.
4. Store local files outside source-controlled content and prevent them from being committed.
5. Prevent absolute-path access and path traversal outside the configured storage root.
6. Keep file downloads behind the existing authentication and ownership checks.
7. Return controlled API errors for missing files and storage failures.
8. Add focused automated coverage for local storage behavior and upload/download integration.

## 3. Non-goals

- Production object storage selection.
- AWS S3, MinIO, Google Cloud Storage, Azure Blob Storage, or another remote provider.
- Multi-instance shared storage.
- Backup, replication, retention, quota, malware scanning, or disaster recovery.
- Migrating files previously stored by Emergent.
- Automatically deleting physical files for expired or soft-deleted orders.
- Redesigning the order, checkout, payment, or catalog media workflows.
- Exposing the local storage directory as a public static directory.

## 4. Locked Decisions

1. Local filesystem storage is limited to development and demonstration environments.
2. `backend/storage.py` remains the stable provider-neutral storage port for this application and keeps the existing `init_storage`, `put_object`, and `get_object` responsibilities; local filesystem is only its development/demo adapter.
3. The default storage root is `backend/.local-storage/`.
4. `LOCAL_STORAGE_ROOT` may override the default with an absolute or backend-relative directory.
5. Stored database values remain relative storage paths such as `niuva/orders/<user-id>/<uuid>.stl`; absolute server paths are never persisted or returned.
6. File access continues through `/api/files/{path}` so backend authentication and ownership checks remain authoritative.
7. No fallback to Emergent is retained.
8. Existing Emergent file references are not migrated. If their corresponding local file does not exist, the API returns a controlled `404`.
9. The Emergent frontend runtime and visual-edit tooling are removed rather than merely disabled.

## 5. Considered Approaches

### 5.1 Replace the internals of `storage.py` - selected

The storage module keeps a small stable interface while its implementation changes from HTTP requests to safe local file operations.

Advantages:

- Minimal changes to order and payment routes.
- Storage behavior is isolated and directly testable.
- A future provider can replace the same boundary without rewriting business routes.
- Emergent is removed without introducing a premature multi-provider framework.

### 5.2 Put filesystem operations directly in `server.py`

This has fewer files but further couples upload, security, path handling, and persistence to an already large server module. It is rejected because it reduces testability and maintainability.

### 5.3 Build a generic provider framework now

This would add provider interfaces and runtime selection for local, S3, or other storage. It is rejected for this phase because only local development storage is approved and the abstraction would add unused complexity.

## 6. Backend Architecture

### 6.1 Storage boundary

`backend/storage.py` owns:

- Resolving and creating the configured storage root.
- Validating relative storage paths.
- Writing file bytes and metadata.
- Reading file bytes and content type.
- Converting filesystem failures into storage-specific exceptions.

Route handlers continue to own:

- Authentication and authorization.
- Customer ownership checks.
- Allowed extension validation.
- Maximum upload-size validation.
- Database metadata and business workflow changes.

The local storage module does not access MongoDB and does not make network calls.

### 6.2 Configuration

The default root is resolved from the backend directory:

```text
backend/.local-storage/
```

An optional environment variable may override it:

```env
LOCAL_STORAGE_ROOT=C:/tmp/niuva-storage
```

Relative override values are resolved against the backend directory, not the process's arbitrary current working directory. Startup creates the root directory if it does not exist.

`backend/.local-storage/` is added to `.gitignore`.

### 6.3 Safe path resolution

Storage paths are logical relative paths, not operating-system paths. The resolver:

1. Rejects empty paths, absolute paths, drive-qualified paths, null bytes, and parent traversal segments.
2. Normalizes separators into a relative logical path.
3. Resolves the candidate beneath the configured root.
4. Verifies the resolved candidate remains inside the configured root.

Unsafe paths raise `InvalidStoragePathError`. No error response exposes the absolute storage root.

### 6.4 Atomic writes and metadata

`put_object(path, data, content_type)` performs these operations:

1. Validate and resolve the path.
2. Create required parent directories.
3. Write bytes to a unique temporary file in the target directory.
4. Flush and atomically replace the final data file.
5. Write a versioned JSON sidecar named `<filename>.metadata.json` containing `content_type` and `size` through the same temporary-file pattern.
6. Remove incomplete temporary files if an operation fails.

If metadata writing fails after the data file is replaced, the implementation removes the new data file and reports a storage error. This avoids treating a partially completed upload as successful.

The return shape remains compatible with current callers:

```json
{
  "path": "niuva/orders/user-id/file-id.stl",
  "size": 12345,
  "content_type": "model/stl"
}
```

### 6.5 Reads and missing files

`get_object(path)` validates the path and reads the file. It obtains content type from the sidecar metadata. If legacy or manually copied data lacks a sidecar, it may fall back to a standard extension-based MIME guess and then `application/octet-stream`.

Missing files raise `StorageNotFoundError`. The file-download route translates this to HTTP `404` without revealing local filesystem details.

Other filesystem failures raise `StorageError` and produce a controlled server error. Full details are logged server-side only.

### 6.6 Startup

Backend startup calls `storage.init_storage()` to create and validate the local root. It performs no external request. A root that cannot be created or written is a startup-blocking configuration error because uploads would otherwise fail later in a less predictable way.

## 7. Upload and Download Data Flow

### 7.1 Order design upload

```text
Authenticated customer
-> extension and size validation
-> UUID logical storage path
-> local atomic write
-> file metadata stored on order
-> order creation continues
```

If storage fails, the order is not created.

### 7.2 Payment-proof upload

```text
Authenticated order owner
-> order and state validation
-> extension and size validation
-> local atomic write
-> payment metadata stored on order
```

If the database update fails after a successful local write, the file can become an orphan. Automatic orphan cleanup is outside this phase; the failure is logged so it can be inspected during development.

### 7.3 Download

```text
Authenticated request
-> token validation
-> staff file-read permission or customer path ownership
-> safe local path resolution
-> file read
-> response with stored content type
```

The storage directory is never mounted as a public web directory.

## 8. Frontend Cleanup

The following Emergent-specific frontend behavior is removed:

- The conditional `emergent-main.js` injection from `frontend/public/index.html`.
- `REACT_APP_ENABLE_EMERGENT_RUNTIME` from `frontend/.env.example`.
- `@emergentbase/visual-edits` from `frontend/package.json` and the lockfile.
- The `withVisualEdits` development wrapper and fallback warning from `frontend/craco.config.js`.
- The unused `home-emergent-link` test ID.

The remaining CRACO, health endpoint, React, and development-server behavior remains unchanged.

## 9. Backend and Documentation Cleanup

- Remove `EMERGENT_LLM_KEY` and its comments from `backend/.env.example`.
- Add `LOCAL_STORAGE_ROOT` documentation to `backend/.env.example`.
- Remove Emergent runtime instructions and domains from `doc/PRODUCTION_DEPLOYMENT.md`.
- Remove Emergent-specific historical implementation notes when they describe active behavior. Historical test reports may remain unchanged only when clearly preserved as historical evidence; they do not influence runtime or deployment.
- Update operational documentation to state that local storage is development/demo-only and is not production-ready.

The `requests` Python dependency is not removed solely as part of this change because backend integration tests still use it. Dependency cleanup outside Emergent-specific runtime code is not included.

## 10. Error Handling

| Condition | Result |
|---|---|
| Disallowed extension | Existing HTTP `400` behavior |
| File exceeds 50 MB | Existing HTTP `400` behavior |
| Unsafe storage path | HTTP `400` for invalid caller input or controlled server error for corrupted stored metadata |
| File missing | HTTP `404` |
| Storage root unavailable at startup | Backend startup fails with a concise configuration error |
| Disk write or read failure | Controlled HTTP `500`; details logged server-side |
| Authentication missing | Existing HTTP `401` behavior |
| Customer requests another user's path | Existing HTTP `403` behavior |

## 11. Security and Privacy

- Never trust a database storage path without validating it again at read time.
- Never return absolute filesystem paths.
- Keep UUID-based filenames; preserve the original filename only as database metadata.
- Keep the storage root outside publicly served frontend content.
- Continue checking file extension and size before writing.
- Continue requiring authentication and ownership or staff permission for download.
- Do not log file bytes, authentication tokens, payment-proof content, or full local paths in client-facing errors.
- Development data inside `.local-storage` must not be committed.

Content signature inspection, malware scanning, and quarantine are mandatory production blockers under ADR-002; they are not solved by this development/demo adapter.

## 12. Testing Strategy

Create focused backend storage tests using a temporary directory:

1. `init_storage` creates the configured root.
2. `put_object` writes bytes and returns compatible metadata.
3. `get_object` returns the original bytes and content type.
4. Nested logical paths work.
5. Missing files raise `StorageNotFoundError`.
6. Absolute paths, drive paths, parent traversal, and null bytes are rejected.
7. Metadata fallback returns a safe content type.
8. A simulated write failure does not leave temporary or successful-looking partial files.

Add or extend API-level tests for:

1. An authenticated customer can create an order with a valid design file.
2. The stored database record contains a relative logical path, not an absolute filesystem path.
3. The same customer can download the file.
4. Another customer receives `403`.
5. Staff with `files.read` can download it.
6. Missing local data returns `404`.
7. Payment-proof upload continues to work for the order owner in the correct state.

Frontend verification includes the existing test suite and an optimized build after removing the package and runtime injection.

## 13. Development Operations

For local development, no storage service or API key is required. Starting the backend creates the default storage directory automatically.

Developers may reset demonstration uploads by stopping the backend and deleting only the configured development storage root. Deleting files does not remove MongoDB metadata, so the database should be reset consistently when a clean demonstration environment is required.

The run documentation must explicitly warn that this storage mode is unsuitable for production because it lacks shared persistence, backup, retention, quota enforcement, and recovery procedures.

## 14. Acceptance Criteria

1. A repository-wide active-code and active-configuration search finds no Emergent package, script, environment variable, endpoint, or runtime domain.
2. Backend startup makes no Emergent or other storage-network request.
3. Backend startup creates or validates the local storage root.
4. Order design uploads and payment-proof uploads work locally.
5. Authorized downloads return the original bytes and content type.
6. Unauthorized downloads remain blocked.
7. Unsafe storage paths cannot escape the configured root.
8. Missing files return `404` without exposing local paths.
9. The local storage directory is ignored by Git.
10. Focused backend tests, the full backend suite, frontend tests, and frontend production build pass.
11. Deployment documentation clearly identifies local filesystem storage as development/demo-only.

## 15. Future Production Transition

`doc/decisions/ADR-002-production-file-storage-architecture.md` defines the approved production direction:

- application storage uses a stable provider-neutral storage port;
- the production adapter class is private persistent object storage;
- production objects are private by default;
- backend authorization is the default access model;
- signed access requires prior authorization, is short-lived, and is scoped to one object and one action;
- database-backed ownership replaces path-substring authorization;
- public buckets and public static directories are prohibited.

The following remain explicitly open:

- actual production provider;
- RPO and RTO;
- retention and quota;
- storage, backup, restore, malware, and incident owners;
- Emergent migration/decommission policy;
- production readiness.

Production upload remains blocked until:

- query-string access tokens are removed;
- database-backed ownership is implemented;
- MIME/signature validation is implemented;
- malware scanning and quarantine are implemented;
- backup and restore are tested;
- metadata/object reconciliation is tested;
- operational readiness is approved.

The stable logical `storage_path` contract is preserved so the approved production adapter can be introduced without changing order and payment database schemas. This document does not select a provider, approve production uploads, or claim that the local adapter solves production persistence.
