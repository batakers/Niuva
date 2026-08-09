# B2B Inquiry MVP Implementation Contract

<!-- markdownlint-disable MD013 -->

**Status:** Candidate implementation contract — no source authority<br>
**Date:** 2026-08-08 (Asia/Jakarta)<br>
**Observed baseline:** `origin/main` at `2cd4ab29f3f618005ea7063b6f54df9563ba6eb3`<br>
**Prepared in branch:** `docs/b2b-inquiry-mvp-implementation-rebaseline-20260810`<br>
**Worktree:** `C:\tmp\niuva-next-origin-main-20260810`<br>
**Owner:** Project Lead / Integrator<br>
**Commit/push/PR:** No — documentation preparation only

## 1. Purpose and boundary

This contract turns the approved B2B Form + WhatsApp product decision into a
bounded implementation brief. It is not a new product decision and does not
authorize source changes, database migration, provider activation, deployment,
production readiness, or go-live.

The slice covers the public B2B/partnership Inquiry, the existing Admin Inquiry
queue, and the optional customer-clicked WhatsApp continuation. It does not
implement the B2B organization portal, quotation/project customer access,
public file upload, WhatsApp automation, or Retail transaction behavior.

## 2. Authority and evidence

Read in this order before source work:

1. [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
5. [`PRD v2.1`](../../../references/requirements/approved-baselines/PRD_Platform_Niuva_v2_1_retail_b2b.md)
6. [`DEC-ACCESS-002`](../../../decisions/access/DEC-ACCESS-002-granular-role-permission-matrix.md)
7. [`DEC-DATA-003`](../../../decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md)
8. [`B2B Form + WhatsApp promotion request`](2026-08-08-niuva-mvp-prd-promotion-amendment-request-b2b-form-whatsapp.md)

Current source is evidence, not authority. At the selected baseline:

| Area | Current evidence | Implication for this slice |
| --- | --- | --- |
| Public API | `POST /api/inquiries` already returns `PublicInquiryResponse`; `pic_phone` and `timeline` are currently optional at the Pydantic boundary. | Close the promoted required-field gap without changing the route owner. |
| Persistence | `B2BService.create_inquiry()` stores a `new` Inquiry, history, version, and timestamps, but no consent evidence or create idempotency. | Add consent evidence and freeze a bounded duplicate-submission strategy before source work. |
| Projection | `project_customer_inquiry()` is an allowlist. | Keep consent evidence, triage history, operator data, and internal fields out of the public response. |
| Operator queue | Admin list/detail/transition routes and `inquiries.read/write` permissions already exist. | Reuse the queue and existing `sales_estimator` role; do not add a role or portal. |
| Notifications | New Inquiry alerts use provider-neutral operational email through `HRD_EMAIL`; public intake is rate-limited. | Include only safe reference/contact context and validate the mailbox before activation. |
| Public UX | Contact form submits successfully and the hero still uses direct WhatsApp as its primary action; acknowledgement has no post-persistence WhatsApp CTA. | Make the project CTA form-first and add the optional continuation only after persistence. |
| Public settings | `publicSettings.js` derives a `wa.me` URL by stripping non-digits. | Add strict international/E.164-compatible validation and hide the CTA for empty/invalid settings. |

## 3. Full-stack integration decisions

These choices adapt the full-stack workflow to the existing Niuva stack; they
do not authorize a framework or architecture refactor.

| Boundary | Contract decision |
| --- | --- |
| Backend | Extend the existing FastAPI/Pydantic B2B modules and MongoDB aggregate. Keep controller, service, and projection responsibilities in their current modules. |
| Frontend | Extend the existing React 19 pages and Axios client in `frontend/src/lib/api.js`; add no new client-state dependency. |
| API | Preserve the existing REST paths, response envelope, status codes, and OpenAPI declarations. |
| Authentication | Public Inquiry remains unauthenticated. Admin Inquiry access remains cookie-session/RBAC protected by `inquiries.read` and `inquiries.write`. |
| Real-time | No SSE/WebSocket is required. The operator queue uses request-time sorting and a visible age/target indicator; automatic reminders are excluded. |
| Errors | Preserve the shared error envelope. Cover validation (`422`), abuse throttle (`429`), server failure (`500`), and duplicate/conflict behavior once the idempotency shape is frozen. |
| Data | MongoDB writes remain additive and non-destructive. No historical backfill, collection validator, unique index, or migration is implied by this packet. If idempotency requires one, stop and create a separate Layer 04/data decision packet. |

## 4. Product and runtime contract

### 4.1 Public flow

```text
/contact#form-konsultasi
  -> visitor submits the structured form without login
  -> server validates and persists one Inquiry with status `new`
  -> customer receives a safe acknowledgement with the Inquiry UUID
  -> optional customer-clicked WhatsApp continuation is shown
  -> operator triages the existing queue manually
  -> existing B2B Quote/Project conversion is used when appropriate
```

The form is the system of record. WhatsApp is only a human follow-up channel;
opening it does not change Inquiry status and does not create an automatic
notification, webhook, campaign, retry worker, or SLA reminder.

### 4.2 Request contract

The existing route remains `POST /api/inquiries`. The implementation fixture
must freeze the exact OpenAPI shape before source work. The target fields are:

| Field | Target rule |
| --- | --- |
| `company` | Required, trimmed, 2–200 characters. |
| `pic_name` | Required, trimmed, 2–120 characters. |
| `pic_email` | Required, valid email. |
| `pic_phone` | Required, 8+ digits after normalization, max 50 characters. |
| `need` | Required approved service category; do not accept an unbounded business rule without an owner decision. |
| `timeline` | Required controlled value; `Belum ditentukan` remains valid and is not a delivery promise. |
| `brief` | Required, 10–5,000 characters. |
| `privacy_acknowledged` | Required boolean and must be `true`; the server, not the client, owns the recorded policy version. |
| create idempotency | A bounded operation identifier or equivalent must be frozen before implementation so network retries cannot create duplicate inquiries. Do not build a generic idempotency framework. |

On successful persistence, the server records:

- `privacy_policy_version` using a server-owned initial identifier such as
  `b2b-inquiry-v1`;
- `accepted_at` as a UTC timestamp; and
- the existing Inquiry UUID, `status = new`, version, history, and timestamps.

Changing the approved privacy wording requires a new version and privacy-owner
review. No IP address, raw request payload, marketing consent, or user-supplied
WhatsApp destination is stored by this contract.

### 4.3 Response and error contract

- `201` returns the existing customer-safe response and Inquiry UUID.
- The public response may echo the submitter's own form fields, but never
  exposes consent evidence, triage history, operator identity, internal notes,
  provider payloads, cost, margin, or private files.
- A failed or ambiguous write does not show success and never exposes a
  reference-based WhatsApp CTA.
- `422`, `429`, and `500` preserve the current shared error envelope.
- A repeated create operation must resolve deterministically according to the
  frozen idempotency contract; it must not create a second Inquiry silently.

### 4.4 Operator contract

- Reuse `/api/admin/inquiries` and `/api/admin/inquiries/{id}`.
- `Niuva Operations` maps to the existing `sales_estimator` role and its
  `inquiries.read/write` permissions; no new RBAC role is introduced.
- The `new` queue is ordered oldest-first by creation time and displays an age
  / one-working-day target indicator.
- The operator detail may show `pic_phone`, safe Inquiry reference, consent
  evidence, and a user-initiated WhatsApp action according to existing Admin
  permissions.
- Status transitions remain `new -> reviewed -> contacted -> converted`, with
  permitted rejection transitions and existing version/conflict rules.
- `HRD_EMAIL` must resolve to the Niuva Operations mailbox before activation;
  this does not select an email provider.

### 4.5 WhatsApp contract

- The destination comes only from the approved public setting.
- The setting must be a valid international/E.164-compatible number that can
  be converted safely to `https://wa.me/<digits>`.
- Missing or invalid configuration hides the CTA and leaves the acknowledgement
  usable.
- The prefilled message contains only the Inquiry UUID and short neutral
  context. It must not contain the raw brief, private file URL, token, cost,
  margin, or internal note.
- WhatsApp opening never changes the Inquiry status automatically.

## 5. Data-integrity and privacy floor

- Existing historical Inquiries without consent fields remain unchanged and are
  not backfilled by this slice.
- New writes carry the server-owned consent version and acceptance timestamp.
- Customer projections remain explicit allowlists and exclude consent evidence.
- Operator projections may expose consent evidence only within the existing
  `inquiries.read` boundary.
- Cross-collection B2B Quote/Project conversion keeps its existing transaction
  guard and is not refactored in this slice.
- No destructive cleanup, migration apply, live database query, backup/restore,
  or production target is part of this contract.

## 6. Non-goals and stop conditions

Do not add:

- an authenticated B2B organization portal or customer project tracking;
- public raw-file upload, storage provider, scanning, or quarantine;
- WhatsApp automation, webhook, broadcast, campaign, or CRM integration;
- a new role, CMS topology, payment, shipping, tax, or Retail flow;
- a generic idempotency framework, broad schema validator, or migration;
- a new frontend state library or cross-surface refactor.

Stop and request a separate decision if implementation requires a new unique
index, migration/backfill, external provider, new permission, new customer
route, policy/version owner, or a change to the Retail notification boundary.

## 7. Acceptance gates for source authorization

Source work is ready only after the exact request/response/idempotency fixture
is reviewed and the user separately authorizes implementation. The later slice
must prove:

1. public form-first submission and safe acknowledgement;
2. required field, consent, and server-owned version behavior;
3. deterministic duplicate/retry handling;
4. customer projection privacy and Admin permission boundaries;
5. oldest-first queue and visible response-target indicator;
6. safe WhatsApp continuation and invalid-setting fallback;
7. operator email safety and `HRD_EMAIL` activation check;
8. keyboard, responsive, and failure-state behavior; and
9. no Retail/B2B lifecycle collapse or excluded feature activation.

## 8. Delivery order and task cards

The three cards below use disjoint ownership. Backend/API semantics are the
producer contract; frontend can work against the frozen fixture, while the
verification owner prepares tests and read-only Layer 04 evidence. Integration
merges backend semantics before frontend consumer integration.

- [Backend/data task card](2026-08-08-b2b-inquiry-mvp-backend-data-task-card.md)
- [Frontend task card](2026-08-08-b2b-inquiry-mvp-frontend-task-card.md)
- [Verification/integration task card](2026-08-08-b2b-inquiry-mvp-verification-task-card.md)

All three cards are planning artifacts. They grant no source, commit, push, PR,
migration, provider, deployment, readiness, or go-live authority.

<!-- markdownlint-enable MD013 -->
