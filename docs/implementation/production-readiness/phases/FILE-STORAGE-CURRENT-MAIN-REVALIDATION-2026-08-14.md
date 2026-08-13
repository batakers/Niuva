# File Security and Storage Current-Main Revalidation

<!-- markdownlint-disable MD013 -->

Status: **repository audit complete; production storage and historical custody operations remain blocked**

Audited runtime baseline: `origin/main` at
`15b759a02b036330f1dd0913611043e0fd6134e2`.

Audit stack base: `audit/backend-commerce-lifecycle` at `24b7221`. The stacked
audit commits do not change backend/frontend runtime behavior, so the source
conclusions below apply to the selected current-main runtime.

## 1. Outcome

The current repository has a strong bounded development/demo/test file
boundary. Database metadata, not path text, controls object identity,
ownership, domain permission, and active state. Uploads use bounded reads,
server-selected logical keys and content types, allowlisted signatures, exact
declared sizes, and safe local compensation. Downloads stream in bounded
chunks and use safe response headers without exposing absolute/provider paths.

Production remains correctly disabled. `STORAGE_BACKEND=local` is rejected
outside development, demo, or test, and no private persistent production
adapter is implemented. Development media upload explicitly reports production
upload inactive. No legacy payment-proof upload or verification route can
write storage or advance an Order.

The audit found no new P0/P1 repository defect in the selected scope. The file
ownership/content-validation source finding remains
`resolved_for_active_development_scope / blocked_by_decision_for_production`.
Production-provider, malware, retention/quota, backup/restore, RPO/RTO,
multi-instance, reconciliation, ownership, deployment, and go-live confidence
remain zero; passing repository tests do not change those gates.

## 2. Control matrix

| Boundary | Current-main evidence | Disposition |
| --- | --- | --- |
| Object-scoped authorization | `GET /api/file-objects/{file_id}` resolves one active database record by opaque ID before any storage read. Missing, inactive, or denied objects return indistinguishable `404`. | Revalidated for repository/local scope. No checked-in frontend consumer currently uses the opaque route. |
| Ownership and domain permission | A non-internal actor may read only an exact `owner_id` match. Internal actors need an explicit permission mapped from `object_type`, `purpose`, or supported linked domain. Unknown scope and internal-uploader ownership fail closed. | Revalidated. Production organization/project membership policy remains separate. |
| MIME/signature validation | Client MIME is ignored. Server extension mapping controls stored/download types; PNG/JPEG/WebP/GIF/PDF/STL/OBJ have bounded signature validators. Unknown/unsafe download extensions become `application/octet-stream` with `nosniff` and attachment disposition. | Revalidated for implemented formats. Malware and broader format policy remain blocked. |
| Streaming and size | Upload reads 64 KiB chunks into a bounded spooled temporary file, enforces 50 MiB general/10 MiB media limits before persistence, and rejects empty/oversized content. Storage verifies the exact declared byte count. Download iterators default to 64 KiB and cap a caller-selected chunk at 1 MiB. | Revalidated locally. Provider-side multipart/stream/timeout and quota behavior are absent. |
| Deleted/quarantined/unpublished | Controlled private routes query `state=active`; deleted, quarantined, pending, unknown, and inconsistent metadata are hidden. Public media additionally requires active immutable publication, passed validation, signature evidence, coherent allowlisted image MIME, and an existing object. | Revalidated. Scanner-produced quarantine lifecycle is not implemented. |
| Metadata/object compensation | Local object and sidecar writes are atomic/compensated. After database metadata failure, stable ID/reference lookup distinguishes committed success from absence; absence deletes the just-written object, while unknown/conflicting outcomes preserve it and return retryable `503`. Compensation failure is named and never leaks a local path. | Revalidated. There is no production orphan queue, reconciliation worker, or provider transaction. |
| Logical-path compatibility | `GET /api/files/{path}` remains metadata-backed, active-state checked, ownership/domain authorized, and path-safe. Query parameters named `auth`, `token`, or `access_token` do not authenticate it. Current frontend download helpers and direct tests still reference logical paths/design-file routes. | Retain; retirement is blocked until consumers move to opaque/domain routes and external usage is proven absent. |
| Historical payment-proof custody | New proof upload, estimate, and verification return `410 legacy_manual_transfer_disabled`. Customer/internal projections expose only safe metadata/`proof_recorded` under owner/permission boundaries and never raw proof paths/provider payloads. | API custody is fail-closed; historical object inventory, object-to-record mapping, validation state, backup/restore, retention, and reconciliation remain unexecuted. |

## 3. Authorization and compatibility details

Known private object domains map only to approved permissions:
`admin_media → media.read`, Order design/payment proof to their Order/design or
payment permission, Project/design to Project/design permission, production to
`production.read`, QC to `qc.read`, and fulfilment to `fulfilment.read`. Unknown
domains grant no internal access. Internal uploader identity is not treated as
customer ownership.

The opaque-ID route is the preferred future boundary because callers need not
retain a logical storage key. Repository search finds no frontend call to it;
the current Order detail uses the owner-scoped domain endpoint and generic
helpers still construct `/api/files/{logical-path}`. Removing or redirecting
the compatibility route now would therefore be unsafe. Both paths share the
same metadata/status/authorization/streaming implementation.

## 4. Validation, streaming, and failure behavior

- Generated paths reject traversal, absolute POSIX/Windows paths, drive or
  colon components, null bytes, empty/dot segments, and unsafe trailing
  characters before touching the configured root.
- Upload names are reduced to a bounded safe basename. Security metadata,
  destination keys, content type, validation result, owner, and object state
  are server-generated.
- Partial local file or sidecar failures clean up both artifacts; duplicate
  writes preserve the existing object rather than overwrite it.
- Private downloads force a server-selected media type, attachment filename,
  `private, no-store`, `nosniff`, restrictive CSP, and exact content length.
- Public media uses the same storage port but additionally requires a current
  catalog/portfolio publication. Unpublished or retired references return
  `404`, even if bytes and active metadata still exist.

These controls are development adapter evidence only. They do not demonstrate
provider encryption, signed URLs, provider consistency, malware scanning,
network timeout/retry behavior, capacity, quotas, or multi-instance recovery.

## 5. Historical payment-proof custody

`DEC-PAY-02` is enforced at the mutation boundary: upload and verification are
disabled before a storage write. Retained legacy projections preserve the fact
that a proof was recorded and safe historical filename/type/size fields when
present, but withhold `storage_path`, raw provider payloads, finance-only
details, and unknown fields. Internal payment history requires the explicit
payment projection permission.

Current-main does not provide an approved proof-download route or claim that
every historical proof has canonical `file_objects` metadata. This reduces
accidental exposure but is not complete operational custody. Before any
historical support/read process is enabled, an aggregate-only inventory must
classify missing objects, orphan objects, absent ownership/domain metadata,
validation/scanning status, backup coverage, and ambiguous references without
rewriting or deleting history. Execution remains separately gated by
`ADR-002`, `DEC-PAY-02`, and the migration/data-integrity audit.

## 6. Verification evidence

Focused supported-runtime Python 3.14.3 results:

```text
Local storage port/path/size/MIME/compensation: 42 passed
File routes/auth/signature/state/streaming: 33 passed
Legacy proof/projection/RBAC privacy: 26 passed
Combined selection: 101 passed
Full hermetic backend: 1032 passed, 15 skipped, 14 subtests passed
Expected-skip enforcement: zero unexpected skips
```

The focused selection had zero skips. It includes production-local rejection,
query-token denial, owner and wrong-domain negatives, safe binary fallback,
deleted/quarantined/unpublished denial, payment-proof lockdown, metadata
unknown/conflict compensation, and legacy projection privacy.

No storage provider, shared database, historical object, migration, scanner,
external server, or production environment was contacted. Exact-head quality
and transaction CI remain required after publication because the PR is stacked
on a non-`main` audit base.

## 7. Tracker disposition and next steps

- Keep the canonical file ownership/content validation finding resolved only
  for active development scope; link this packet as current-main evidence.
- Keep `ADR-002` production gates decision/environment blocked: provider,
  malware boundary, retention/quota/legal hold, RPO/RTO, owners,
  backup/restore, multi-instance consistency, reconciliation, and incident
  handling.
- Keep the logical-path route retained until checked-in and external consumers
  have migrated with a measured compatibility window and rollback.
- Keep historical payment proofs read-only and inaccessible by raw path. The
  next safe data task is an approved aggregate-only custody inventory, not a
  backfill, deletion, or new proof-download feature.
- Do not implement or activate production upload, signed URLs, scanner,
  retention, quota, payment, deployment, or go-live from this audit.

<!-- markdownlint-enable MD013 -->
