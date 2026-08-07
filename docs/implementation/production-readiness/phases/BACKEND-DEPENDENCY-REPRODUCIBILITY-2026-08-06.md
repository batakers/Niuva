# Backend Dependency Reproducibility — 2026-08-06

**Status:** bounded source and CI evidence; production-readiness and go-live
remain separate gates
**Baseline:** `origin/main` at `dd4f5356496bd16195808f410ed3cc940baeca9a`

## Contract

- CPython `3.14.3` is the repository backend runtime, declared in
  `.python-version` and used by backend, transaction, and external-smoke CI.
- `backend/requirements.txt` remains the human-reviewed direct dependency
  input. It does not authorize automatic upgrades.
- `backend/requirements.lock` is the install artifact. It pins the resolved
  graph and includes package-index hashes; CI installs it with
  `pip --require-hashes`.
- Regenerate the lock only as a reviewed dependency change:

  ```bash
  uv pip compile backend/requirements.txt \
    --universal \
    --python-version 3.14.3 \
    --generate-hashes \
    --output-file backend/requirements.lock
  ```

- CI pins the audit tools separately because they inspect the application
  graph but are not application dependencies. The quality gate publishes the
  JSON vulnerability and license inventories for the exact CI run.
- `pip-audit` uses `--no-deps --disable-pip` because the lock already contains
  the fully resolved graph. This prevents the audit from performing a second,
  potentially drifting resolution.

## Verification evidence

On the baseline working tree, a clean Python 3.14.3 virtual environment:

- installed all 72 locked distributions with `pip --require-hashes`;
- returned `No broken requirements found` from `pip check`;
- returned no known vulnerabilities from `pip-audit 2.10.1` against the lock;
- recorded license metadata for 71 installed application distributions with
  no empty, `None`, or `UNKNOWN` values.

The lock is universal. Platform markers select applicable distributions while
the retained hashes allow pip to verify the chosen source or wheel artifact.

## License review

The generated inventory contains permissive and weak-copyleft metadata,
including two MPL-2.0 distributions (`certifi` and `pathspec`). This task does
not make a legal compatibility determination. Release/legal ownership must
review redistribution and notice obligations and record any exception before
a production-readiness claim. CI fails on missing/unknown metadata and retains
the complete report for review; it does not reject a known license merely by
name.

## Deprecation and compatibility review

- Python 3.14 is in the CPython bugfix support phase with an October 2030
  end-of-life target. Pinning the micro release makes rebuilds attributable;
  upgrading the micro version requires a lock refresh and regression run.
- MongoDB officially deprecated Motor on 14 May 2026 and recommends migration
  to the PyMongo Async API. The repository still pins `motor==3.3.1`; migrating
  the database API is a separate source/transaction compatibility project and
  is intentionally not attempted by this lock task.
- `pymongo==4.6.3` has no CPython 3.14 wheel for the verified macOS target, so
  pip built the hash-verified source distribution. Linux CI must prove its own
  install. Production builders require a compiler until a separately reviewed
  driver upgrade provides a supported wheel.
- The existing direct dependency input still combines runtime, test, and
  developer tooling. The lock removes resolver drift but does not reduce the
  production dependency surface. A runtime/dev split remains separate work.

Official lifecycle references:

- <https://devguide.python.org/versions/>
- <https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/>

## Operational boundary and rollback

No dependency was removed and no provider, migration, deployment, production
data, or credential was touched. Rollback is the ordinary source rollback of
the lock/runtime/workflow commit. Existing environments are unchanged until
they explicitly reinstall from the lock.
