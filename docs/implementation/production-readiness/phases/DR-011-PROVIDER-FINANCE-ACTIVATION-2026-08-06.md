# DR-011 — Provider and Finance Activation Decision Packet

<!-- markdownlint-disable MD013 -->

**Status:** `OPEN` / `HUMAN_DECISION_BLOCKED`
**Prepared:** 2026-08-06 (Asia/Jakarta; actual preparation date)
**Observed baseline:** `origin/main` at `c84743c8fcbc158721037b3c02dc0dff0c872242`
**Decision owners:** Product, Finance, storage/payment, security, and
operations owners as assigned by the Project Owner
**Scope:** Decision preparation only; no activation

## 1. Purpose and boundary

DR-011 controls the point at which Niuva may move from a provider-neutral
candidate to a file-enabled or payment-enabled operational scope. The current
architecture deliberately keeps provider selection and activation open. This
packet turns the open fields into an owner decision without selecting a vendor
or authorizing execution.

The packet does not amend ADR-002, ADR-003, `DEC-PAY-02`, or the canonical
decision register. It does not authorize source changes, external credentials,
provider calls, Finance operations, migration, deployment, readiness, or
go-live.

The observed SHA is a point-in-time remote observation only and is not a DR-001
release-candidate selection.

## 2. Authority and evidence sources

The canonical read order used for this packet is: Master Spec, Document
Register, Decision Register, applicable decision/ADR, applicable runbook, then
current source and tests.

Applicable authority:

- `docs/NIUVA_MASTER_SPEC.md` — one platform, separate Retail/B2B lifecycles,
  provider-neutral and fail-closed boundaries;
- `docs/context/DOCUMENT_REGISTER.md` — status and authority limits;
- `docs/decisions/DECISION_REGISTER.md` — DR-011 and approved open-decision
  consequences;
- `docs/implementation/production-readiness/DECISIONS_REQUIRED.md` — DR-011
  remains deliberately open;
- `docs/decisions/architecture/ADR-002-production-file-storage-architecture.md`
  — provider-neutral storage port/private persistent adapter direction;
- `docs/decisions/architecture/ADR-003-retail-payment-orchestration-boundary.md`
  — provider-neutral online-payment direction and deferred gateway;
- `docs/decisions/product/DEC-PAY-02-legacy-manual-transfer-read-only.md` —
  historical compatibility and disabled new manual-transfer mutations; and
- `doc/PRODUCTION_DEPLOYMENT.md` — provider-neutral deployment guidance.

There is no approved provider-specific ADR or activation runbook applicable to
this packet. ADR-002/003 are approved with open decisions and are technical
boundaries, not procurement, Finance, deployment, or go-live authorization.

## 3. Current approved boundary and evidence

| Area | Current authority/source observation | Limit |
| --- | --- | --- |
| Storage architecture | ADR-002 approves a stable provider-neutral storage port and private persistent object storage as the production adapter class. Local filesystem storage is development/demo only. | Actual provider, RPO/RTO, retention, quota, backup/restore, malware, incident, migration, and owners remain open. |
| Storage safety | ADR-002 requires private access, backend authorization, validated metadata, malware/quarantine boundary, reconciliation, encryption, and recovery ownership. | No provider adapter, production upload activation, restore rehearsal, or shared/staging/production proof is authorized here. |
| Payment architecture | ADR-003 approves provider-neutral online-payment orchestration with adapter isolation, idempotency, event deduplication, refund/reconciliation boundaries, and customer-safe projection. | Gateway, payment state mapping, webhook authentication, reconciliation SLA, Finance accounting/tax correction, event retention, and go-live remain open. |
| Legacy payment | `DEC-PAY-02` keeps existing manual-transfer records read-only and disables new transfer instructions, attempts, payment-proof uploads, and proof-driven transitions. | No manual-transfer fallback may be invented while the gateway is deferred. |
| Current backend configuration | `backend/.env.example` uses `STORAGE_BACKEND=local` for development/demo/test and states that production upload is not enabled by default. | Example configuration is not production configuration or deployment evidence. |
| Current capability response | Current backend health/capability evidence reports `payment` and `production_upload` as inactive; source/test contracts preserve that inactive boundary. | A passing capability test does not prove a selected provider, secret custody, operational readiness, or production activation. |
| Current Retail surface | The current Retail product surface presents discovery-only/inactive messaging for checkout, payment, upload, reservation, and fulfilment where the capability is unavailable. | Discovery evidence is not a transaction or provider-integration release. |
| Decision queue | DR-011 is deliberately open and blocks file-enabled/payment-enabled production scope. | The row must not be changed to resolved by a packet, branch, passing test, or merged PR. |

## 4. Scope decision before provider selection

The owner must first choose the operational scope. Provider selection without a
scope decision would create an unnecessary activation assumption.

### Option A — Provider-neutral release candidate; activation remains inactive

Keep storage production upload and payment inactive. Release evidence may cover
read-only catalog/discovery and other explicitly approved provider-free
surfaces. The project records no provider credentials, no payment settlement,
and no persistent production upload.

### Option B — File-enabled scope only

Authorize a separately bounded storage implementation and environment proof.
This requires all storage decision fields below, a controlled target, backup and
restore evidence, malware/quarantine evidence, ownership/privacy proof, and a
rollback/disable plan before activation.

### Option C — Payment-enabled scope only

Authorize a separately bounded payment adapter and Finance/reconciliation
contract. This requires all payment fields below, webhook/idempotency proof,
refund and reconciliation ownership, secret evidence, safe customer
projection, and a rollback/disable plan before activation.

### Option D — File and payment scope together

Authorize two independently reviewable slices with separate owners and
activation gates. Combining them does not merge their data, security, Finance,
or rollback responsibilities.

The owner must record retained exclusions, effective environment, approval
expiry, and the exact source/adapter scope. This packet selects none of these
options.

## 5. Storage decision fields

Complete these fields only if the owner chooses a file-enabled scope:

- provider/adapter and supported regions or residency boundary;
- private namespace, database-backed ownership, access/signing policy, and
  customer/internal projection rules;
- encryption in transit/at rest, secret custody, rotation, access review, and
  provider outage behavior;
- extension/MIME/signature/size validation, malware scanning, quarantine,
  release-to-workflow rule, and evidence owner;
- per-file, per-user, per-organization, per-order/project, and global quotas;
- retention, archive, legal hold, hard-delete restrictions, orphan cleanup, and
  audit policy;
- database metadata/object consistency, replacement semantics, reconciliation,
  and failure recovery;
- backup/versioning, restore procedure, restore rehearsal, RPO/RTO, retention,
  and named backup/restore owner;
- staging-like target, representative fixture policy, evidence custody, and
  rollback/disable procedure; and
- cost/usage ceiling and accountable approver.

No field is filled by this packet.

## 6. Payment and Finance decision fields

Complete these fields only if the owner chooses a payment-enabled scope:

- gateway/adapter and supported countries/currencies/payment methods;
- provider-neutral state mapping for pending, processing, succeeded, failed,
  expired, cancelled, review, refunded, and reconciliation states;
- idempotency identity, event deduplication, conflict handling, webhook
  authentication, signature-verification credential lifecycle, replay
  protection, and outage mode;
- authoritative amount/currency/tax/fulfillment snapshots and customer-safe
  projection; never expose raw provider payloads or sensitive Finance data;
- payment intent/attempt, refund, underpayment, overpayment, duplicate/late
  event, uncertain-status, dispute, and reconciliation workflows;
- Finance owner, reconciliation SLA, settlement evidence, accounting/tax
  correction authority, refund execution/timing, and separation of duties;
- payment-event retention, privacy/access, audit, incident response, and
  evidence custody;
- staging-like test account/secret reference, controlled webhook endpoint,
  test-data purge/retention, and emergency disable/rollback; and
- cost, transaction limits, provider support/escalation, and contract owner.

The gateway and all values remain blank until separately approved.

## 7. Activation, rollback, and evidence contract

Any later activation task must record, at minimum:

1. exact selected decision, adapter/source paths, owner, reviewer, verifier, and
   environment boundary;
2. secret/config reference names only, with no values in Git, PRs, logs, or
   evidence artifacts;
3. clean-install/build artifact identity and rollback/disable control;
4. positive/negative authorization, idempotency, outage, retry, reconciliation,
   privacy, retention, and customer-projection proof;
5. backup/restore and migration dependency analysis without applying a real
   database migration from this packet;
6. monitoring/alert/on-call ownership and abort thresholds;
7. independent review and redacted evidence custody; and
8. an explicit approval for the next environment. A sandbox or staging result
   cannot be promoted to production or go-live by inference.

The capability must remain fail-closed/inactive when the provider contract or
required operational evidence is absent.

## 8. Owner decision form

Complete this form in an approved canonical decision record. Blank fields keep
DR-011 open.

| Field | Owner entry |
| --- | --- |
| Selected scope: inactive / file / payment / both | `____________________________` |
| Product owner and retained exclusions | `____________________________` |
| Storage provider/adapter (if applicable) | `____________________________` |
| Storage owner, RPO/RTO, retention, quota | `____________________________` |
| Storage backup/restore/malware owners | `____________________________` |
| Payment gateway/adapter (if applicable) | `____________________________` |
| Payment state/webhook/idempotency contract | `____________________________` |
| Finance owner, reconciliation SLA, refund/accounting policy | `____________________________` |
| Event retention/privacy/access owner | `____________________________` |
| Environment and secret/config reference custody | `____________________________` |
| Rollback/disable owner and trigger | `____________________________` |
| Required independent reviewer/verifier | `____________________________` |
| Evidence format and custody | `____________________________` |
| Decision date, expiry, and approver | `____________________________` |

## 9. Traceability and current readiness

| Gate | Relationship | Current state |
| --- | --- | --- |
| DR-011 | Storage/payment/provider/Finance decision | Deliberately open; no activation authorized. |
| ADR-002 | Private persistent provider-neutral storage direction | Approved with operational/provider decisions open. |
| ADR-003 / DEC-PAY-02 | Provider-neutral online payment and read-only legacy transfer | Approved boundary; gateway/Finance/activation open. |
| PHASE-07E | Provider/file/payment boundary | Must preserve disabled capability until DR-011 is recorded. |
| PHASE-07A–07D | Staging, artifact, rollback, migration, release ownership | Also depends on DR-012/DR-013 and environment proof. |
| V-07-01 / V-10-01 | Release artifact, topology, recovery, and final candidate proof | Blocked by prior decisions/environment; this packet does not provide evidence. |

Current verdict remains **NOT READY for file-enabled/payment-enabled
production, deployment, or go-live**. A provider-neutral discovery candidate may
remain separately bounded, but it must not be represented as a transaction or
provider-integrated production release.

## 10. Handover

Changed for this packet: only the task card and this decision packet.

Intentionally unchanged: ADR-002, ADR-003, DEC-PAY-02, decision-register
status, source/config/dependencies/tests/CI, provider adapters, credentials,
migrations, databases, deployment state, and the dirty main worktree.

Local validation for this docs-only packet is limited to markdownlint,
whitespace, exact-path, and staged secret-pattern checks. No application test,
provider call, Finance operation, credential use, migration, deployment, or
production operation is run or implied.

<!-- markdownlint-enable MD013 -->
