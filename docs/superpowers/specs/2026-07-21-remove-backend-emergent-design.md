# Remove Backend Emergent Storage Design

**Status:** Approved by the user on 21 July 2026

This change keeps `backend/storage.py` as the provider-neutral storage port, removes every active backend dependency on Emergent, and preserves logical relative `storage_path` values. `STORAGE_BACKEND=local` is permitted only when `APP_ENV` is `development`, `demo`, or `test`; `STORAGE_BACKEND=disabled` is the safe default and causes upload/download operations to return a controlled `503` while the rest of the backend remains available.

The local adapter stores data under `backend/.local-storage/` by default, supports a backend-relative or absolute `LOCAL_STORAGE_ROOT`, validates paths against traversal and absolute/drive-qualified access, writes object bytes and MIME metadata atomically, and never exposes the directory as public static content. Missing local objects return a controlled `404`.

No production provider is selected. Production local storage is rejected during initialization, and production uploads remain disabled until all ADR-002 readiness gates are approved. Existing Emergent objects are not migrated.

Tests cover disabled mode, production rejection, local round trips, path validation, partial-write cleanup, route-level `503`/`404` mapping, repository hygiene, and preservation of authenticated download authorization.
