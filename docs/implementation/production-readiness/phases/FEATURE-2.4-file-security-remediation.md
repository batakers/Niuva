# Feature 2.4 — File Authorization and Security Remediation

Date: 29 July 2026
Branch: `fix/backend-file-security`
PR: `#93`
Baseline: `7d8d5c90f6440f1276ee4b82c166258514a93cd1` (`origin/main`)
Authority: `DEC-STOR-01` / `ADR-002`, `DEC-ACCESS-002`, and
`DEC-REMED-001`

## Bounded outcome

The local/CI file boundary now preserves the existing disabled-production
posture while strengthening the development adapter and controlled download
surface:

- upload content is read in bounded chunks, checked against the selected
  application limit, and never persisted when it exceeds that limit;
- the storage adapter rejects invalid declared sizes, stops when a source
  exceeds its declared size, and compensates partial object/sidecar writes;
- PNG, JPEG, WebP, GIF, PDF, ASCII/binary STL, and OBJ signatures have explicit
  bounded-prefix validators for callers that enable content validation;
- active development media requires a valid image signature and records
  validation evidence in database-backed metadata;
- customer downloads require exact metadata ownership, while internal
  downloads require the permission associated with the file's domain;
- internal uploader identity does not create a permanent owner bypass;
- deleted, quarantined, pending, unknown, or unauthorized metadata is hidden as
  `404`;
- an opaque file-object-ID endpoint is available; the retained logical-path
  compatibility endpoint uses the same database-backed authorization;
- file authentication remains cookie-based in normal runtime, and query
  parameters named `auth`, `token`, or `access_token` do not authenticate a
  download;
- controlled downloads use a server-selected safe media type, attachment
  disposition, `nosniff`, a restrictive CSP, and `private, no-store`;
- public media requires an active published reference plus coherent,
  signature-validated metadata and an allowlisted image type;
- a failed metadata write deletes the just-written development object, and
  metadata or compensation failures return normalized `503` responses without
  exposing adapter details.

No production file upload, legacy payment-proof upload, or legacy Order
creation/mutation was activated.

## Verification

Focused storage, authorization, legacy projection, and identity matrix:

```text
99 passed
```

This covers upload size and spoofing negatives, signature allow/deny cases,
path safety, partial-write cleanup, metadata-write compensation, compensation
failure normalization, opaque-ID authorization, cross-owner denial,
domain-permission denial, deleted/quarantined denial, query-token rejection,
safe media types, customer Order file access, granular RBAC, and Feature 2.3
projection regression.

Full backend regression:

```text
646 passed, 12 skipped, 14 subtests passed after rebasing onto the PR #96 merge
```

Repository quality checks passed:

- `pip check`;
- `pip-audit` against `backend/requirements.txt` with no known
  vulnerabilities;
- backend compile;
- critical Flake8 selection;
- focused MyPy for `storage.py`;
- Black and isort for the changed Python scope;
- `git diff --check`.

## Remaining production gates

The following are not completed or authorized by this remediation:

- selecting and provisioning the private persistent production adapter;
- selecting and operating a malware-scanning provider/boundary;
- approving per-type retention, quota, archive, hard-delete, and legal-hold
  policy;
- naming storage, backup, restore, malware, reconciliation, and incident owners;
- approving RPO/RTO and provider-outage behavior;
- testing coordinated metadata/object backup, restore, orphan reconciliation,
  and multi-instance consistency in an approved isolated environment;
- inventorying and reconciling historical objects whose validation evidence is
  absent;
- retiring the logical-path compatibility endpoint after all internal
  consumers use opaque IDs or domain-specific routes;
- migration execution, `.env` changes, provider activation, deployment,
  production readiness, release, or go-live.

## Safety boundary

No dependency, schema, migration, `.env`, provider, shared database, production
data, deployment, or go-live state was changed. Commit and PR publication are
review artifacts only and do not grant production authority.
