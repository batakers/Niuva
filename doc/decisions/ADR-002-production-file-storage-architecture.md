# ADR-002 — Production File Storage Architecture

Status: Technical Design Candidate — not approved
Decision ID: `DEC-STOR-01`
Decision owner: Operations / Platform owner — Not assigned
Technical approver: Not recorded
Decision date: Pending
Related baseline: `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
Decision log: `doc/decisions/DECISION_LOG_Platform_Niuva_v2_1.md`

## Context and Scope

Local filesystem storage is approved only for development and demonstration. Production cannot depend on one application instance's local directory because uploads must survive restart, redeployment, scaling, backup/restore, and incident recovery.

This ADR covers **all persistent uploads**, not only payment proof:

- Retail design files.
- B2B/RFQ attachments.
- Design versions and review artifacts.
- Operational files, QC evidence, fulfillment evidence, and customer-approved files.
- Payment proof if the manual-transfer adapter is explicitly approved.

The ADR defines a provider-neutral production contract. It does not choose a storage vendor or write credentials.

## Decision Question

What production storage architecture provides private, durable, recoverable, validated, and multi-instance-safe persistence while preserving the logical `storage_path` contract?

## Options

### Option A — Private persistent object storage

Objects are private by default. Backend authorization or short-lived signed URLs mediate access. Metadata remains in MongoDB and stores only logical paths/object keys plus validated metadata.

### Option B — Persistent shared volume

Application instances use a shared persistent volume with backend-proxied access. Deployment, locking, backup, capacity, and cross-instance semantics are owned operationally.

### Option C — Hybrid/provider abstraction

Use a stable storage port with local development implementation and a production object/volume adapter. The production adapter is selected and tested before persistent uploads are enabled.

## Recommended Baseline

**Option A with the stable logical storage contract from Option C** is recommended: private persistent object storage behind backend authorization or short-lived signed access, with provider-neutral application contracts. This is a recommendation only and is not approved.

## Access and Authorization Model

- Objects are never exposed as a public static directory or public bucket.
- Customer access requires authenticated ownership or an order/project-scoped authorization check.
- Internal access requires backend role/permission checks.
- Signed URLs, if used, are short-lived, scoped to one object/action, and revocable through the backend boundary.
- Absolute filesystem paths or provider credentials are never stored in customer-visible fields.
- Object metadata must not expose supplier, margin, internal notes, or unrelated customer data.

## Validation and Malware Handling

Before persistence or release to a downstream workflow:

- validate extension, MIME, size, and file signature where applicable;
- reject path traversal, absolute paths, null bytes, and unsafe logical keys;
- quarantine suspicious or unscanned objects;
- perform malware scanning or an approved scanning boundary before production/download release;
- retain validation/scanning result, actor, time, object reference, and reason in audit metadata;
- return controlled errors without exposing provider paths or secret details.

## Backup and Restore

Production storage must define:

- object backup or versioning strategy;
- database metadata backup coordination;
- restore procedure for metadata-only, object-only, and combined failure;
- periodic restore exercise with measured result;
- orphan-object and orphan-metadata reconciliation;
- deletion/retention interaction with backup copies;
- encryption and credential rotation for backup access.

Backup is not considered sufficient until a restore test has an identified owner, timestamp, result, and corrective action if it fails.

## Retention and Quota

The approved policy must define:

- retention by upload type and business lifecycle;
- archive versus hard-delete behavior;
- legal/contractual hold behavior;
- per-file maximum size;
- per-user, per-organization, per-order/project, and global quota;
- quota enforcement and customer-safe error behavior;
- orphan cleanup and exception review;
- audit trail for retention or deletion decisions.

No automatic deletion policy is implied by this ADR.

## Encryption and Privacy

- TLS/in-transit protection is required.
- At-rest encryption is required for production objects and backups.
- Credentials use server-side secret management and rotation.
- Logs must not include file bytes, tokens, payment-proof content, or unnecessary personal data.
- Access events and sensitive download events are auditable.

## Multi-Instance and Recovery Behavior

- All production instances must resolve the same durable object namespace.
- A write acknowledged by the API must be readable according to the documented consistency contract after restart or instance change.
- Upload replacement must be atomic from the metadata/workflow perspective or expose an explicit pending state.
- Database update failure after object write must create a reconciliation/orphan record; silent loss is not acceptable.
- Provider outage, quota exhaustion, scan failure, and metadata/object mismatch must produce controlled retry or quarantine states.
- Recovery must define RPO, RTO, escalation owner, and customer-safe messaging.

## RPO/RTO and Operational Ownership

| Requirement | Current state |
|---|---|
| RPO for persistent objects | Not assigned |
| RTO for object access restoration | Not assigned |
| Storage/service owner | Not assigned |
| Backup owner | Not assigned |
| Restore exercise owner | Not assigned |
| Malware scanning owner | Not assigned |
| Quota/retention owner | Not assigned |
| Incident escalation | Not assigned |
| Approval date | Pending |

## Environment Boundary

| Environment | Allowed storage |
|---|---|
| Local development/demo | Local filesystem storage may be used; it is not production-ready |
| CI | Temporary isolated storage with test cleanup; no production persistence assumption |
| Staging | Persistent storage candidate only after validation, access, backup, and restore checks |
| Production | Approved private persistent storage only; local filesystem is prohibited |

Production upload enablement must be blocked until this ADR and the corresponding operational readiness criteria are approved.

## Consequences

### Positif

- Retail, B2B, operational, and payment-proof files share one explicit production boundary.
- Deployment can scale without losing objects to an instance-local directory.
- Backup, restore, retention, quota, validation, and access become reviewable gates.

### Trade-off

- Production requires infrastructure and operational ownership beyond the local development adapter.
- Provider selection, cost, quota, and retention policy require follow-up decisions.
- Migration/reconciliation must account for existing local or legacy references.

## Approval Record

- **Technical approver:** Not recorded
- **Decision date:** Pending
- **Approval source:** Not recorded
- **Final decision:** Pending review; recommendation is not approved.
