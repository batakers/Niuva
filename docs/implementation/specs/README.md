# Implementation Specs Index

This directory groups implementation specifications by lifecycle, but a folder
name never grants authority or implementation approval. Read the file header,
then `docs/context/DOCUMENT_REGISTER.md`, before using any specification.

## Folder Meaning

| Location | Meaning | Safe use |
| --- | --- | --- |
| `active/` | Current approved baselines and retained execution records | Use only the file's recorded status and scope; do not treat the folder as a work queue. |
| `candidates/` | Unapproved proposals | Review or refine after authority review; do not implement. |
| `active/` records marked `Implementation Merged` or `Implementation Completed` | Stable evidence paths retained for audit traceability | Review prior scope, verification, and remaining gates; do not re-execute the slice. |
| `candidates/` records marked `Superseded` | Historical proposal retained in place for traceability | Compare with the successor decision only; do not use as backlog or authority. |

## Current Classification

The following approved baselines remain applicable within their documented
scope:

- `active/2026-07-14-unified-retail-b2b-platform-design.md`
- `active/2026-07-14-catalog-material-pricing-inventory-foundation-design.md`
- `active/2026-07-16-remove-emergent-local-storage-design.md`

The following paths remain under `active/` only because audit and decision
evidence already cite them. Their headers and the Document Register classify
them as execution records rather than pending work:

- `active/2026-07-21-backend-framework-security-upgrade-design.md`
- `active/2026-07-27-admin-auth-phase-1-implementation-authorization-packet.md`
- `active/2026-07-27-admin-auth-phase-2-session-safety-authorization-packet.md`

`candidates/2026-07-16-retail-order-checkout-foundation-design.md` remains an
unapproved candidate. The read-only Retail catalog-discovery candidate is
superseded; `ADR-005` is the current bounded decision for that scope.

## Path Stability

Do not move a specification merely to match its current status. Some paths are
referenced by historical audits, approval packets, and decision records. A
move requires a separately approved documentation migration that preserves and
revalidates all inbound evidence references.
