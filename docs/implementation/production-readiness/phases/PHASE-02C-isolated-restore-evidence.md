# PHASE-02C Isolated Backup/Restore Evidence

Status: **disposable local proof passed; independent acceptance and operational
DR-012 gates remain open**

Task card: [PHASE-02C-task-card.md](PHASE-02C-task-card.md)

Baseline: `a2b7be0d445cf3a338d91cf74841e3bf8be11a91` (`origin/main`,
verified 2 August 2026).

Branch: `ops/backend-isolated-restore-proof`.

## Authorization and target

The Project Owner explicitly authorized completion, commit, push, and pull
request delivery for Feature 9.2 on 2 August 2026. The bounded target was the
local Docker Compose `mongodb-test` service: MongoDB 7.0 on the loopback-only
port, single-node replica set `rs-test`, writable primary. Docker Desktop server
version was `29.6.2`.

Faiz was the executor and evidence custodian. The window began with local
Compose startup and ended after both generated databases, every raw snapshot,
and the Compose volume were removed. No shared, staging, production, or
application database was connected.

## Aggregate evidence

Snapshot/restore evidence interval (UTC): `2026-08-02T11:19:07.423654+00:00`
through `2026-08-02T11:19:07.713622+00:00`.

| Check | Result |
| --- | --- |
| Replica set / primary | `rs-test`; writable primary `true` |
| Source database identity | SHA-256 `c07d891dd09d42e8bbad60deb3a1deb955ef443bffaebcc631e9785c9f43bb07` |
| Restore database identity | SHA-256 `6ecfcb96b02a509d9f91de0a5983cc6e64af6f9361314e9d092580b5d35b0542` |
| Databases distinct | Passed |
| Snapshot inventory | 5 collections; 7 synthetic documents |
| Snapshot file checksum | SHA-256 `d5d3a97b580287c08bcd2e114a339de03b89453b5ffa4e0799e51dd2eee52d59` |
| Migration-shaped source change detected | Passed; mutated, deleted, and new-collection differences reported |
| Restore target | A second, initially empty, uniquely named database |
| Post-restore digest comparison | Identical across all captured collections |
| Historical record validation | Accepted Quote version, immutable `quote_line_id`, Project `source_quote_version_id`, and snapshot line reference preserved |
| BSON validation | `Decimal128("10.5")` and balance version `3` preserved |
| Focused real-replica suite | `4 passed in 0.78s` |
| Database cleanup | Source and restore database absent after the run |
| Snapshot cleanup | Current snapshot deleted automatically; two synthetic snapshots from earlier attempts were found and deleted explicitly |

The initial rehearsal attempt stopped safely because appending `_restore` made
the generated target database name 64 characters, exceeding MongoDB's
63-character limit. The source database cleanup still ran, no restore target
was created, and the bounded identifier was corrected before the complete
suite passed. This failure is retained as negative stop-condition evidence.

## What the proof establishes

- The snapshot file has an externally recordable SHA-256 checksum in addition
  to per-collection content digests.
- A verified snapshot can restore into a distinct empty database without
  mutating the changed source database.
- Historical Quote/Project references and BSON decimal types survive the
  capture/write/read/restore cycle.
- Test-generated databases and raw snapshot files can be removed and verified
  absent at the end of the bounded window.

## Limitations and remaining gates

- No migration `001`–`010`, migration dry-run/apply/rollback, real customer
  data, shared backup, deployment, or production operation ran.
- This is synthetic disposable-local evidence, not staging or production
  recovery proof and not an RPO/RTO measurement.
- PHASE-02B is merged through PR #112; its planning result does not authorize
  a migration or broaden this proof.
- Independent Lead/human review is still required. The Driver does not verify
  its own evidence for final acceptance.
- DR-012 remains open for operational target/topology, RPO/RTO, approved shared
  evidence format, secret evidence, and incident/release/on-call ownership.

The next authorized action is independent review. Any
shared/staging/production rehearsal needs a new task card, exact target/window,
separate owner approval, and its own rollback/cleanup authority.
