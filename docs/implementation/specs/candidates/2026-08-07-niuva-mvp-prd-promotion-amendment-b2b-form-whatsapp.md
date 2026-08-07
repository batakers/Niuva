# Niuva MVP PRD Promotion/Amendment Packet — B2B Form + WhatsApp

Status: **Approved Documentation Promotion Input — No Implementation Authority**
Prepared: 7 August 2026 (Asia/Jakarta)
Scope: B2B and partnership inquiry intake for the narrowed Niuva MVP
Approval: Explicit user approval recorded on 8 August 2026 (Asia/Jakarta)

Related authority:

- [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
- [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
- [`DEC-OPS-003`](../../../decisions/experience/DEC-OPS-003-reduced-integrated-cms-mvp.md)
- [`DEC-DATA-003`](../../../decisions/product/DEC-DATA-003-notification-schema-retention-and-delivery-boundary.md)
- [`ADR-002`](../../../decisions/architecture/ADR-002-production-file-storage-architecture.md)
- [Candidate MVP PRD](2026-07-30-niuva-mvp-prd.md)
- [Candidate MVP User Flow & Route Contract](2026-07-31-niuva-mvp-user-flow-and-route-contract.md)

This packet is the promotion provenance for the approved PRD amendment. The
packet itself does not amend the Master Spec or Decision Register; the
canonical amendment is recorded in those documents and in `DEC-UX-003`. It
does not authorize source/schema changes, select a provider, authorize
deployment, or authorize production readiness or go-live.

## 1. Decision being recorded

The selected B2B intake pattern is:

> **Structured public form first, persist the Inquiry, then offer an optional
> user-initiated WhatsApp continuation.**

The form is the system-of-record intake. WhatsApp is a fast human follow-up
channel, not the inquiry database and not an automated notification channel.

This keeps B2B manual while preserving a reference, operator queue, history,
deduplication boundary, response measurement, and a future path to quotation
or project tracking. A customer B2B portal remains outside this MVP.

### 1.1 Boundaries preserved

- A public B2B inquiry may start without login.
- The inquiry does not create a Retail Order, payment attempt, reservation,
  quotation, project, or production commitment.
- Retail Order and B2B Quote/Project remain separate lifecycles.
- The Retail notification policy remains unchanged: Retail notifications do
  not use WhatsApp.
- This amendment does not introduce WhatsApp automation, a WhatsApp webhook,
  campaign messaging, or an operator-support channel.

### 1.2 Why WhatsApp-only is not selected

WhatsApp-only is fast, but it does not reliably preserve required project
context, ownership, status history, duplicate handling, or follow-up metrics.
It also makes handover difficult when the single operator is unavailable.
The hybrid flow keeps the speed benefit without making a chat transcript the
canonical business record.

## 2. Target PRD amendment map

| Candidate PRD area | Proposed amendment | Authority impact |
| --- | --- | --- |
| Section 4.2 — B2B prospect | Clarify that the public inquiry is form-first and may continue to WhatsApp after persistence. | Narrows the manual intake behavior; does not add a portal. |
| Section 5.1 — Public website | `/contact` owns the structured B2B/partnership form; direct WhatsApp remains a secondary contact action. | Aligns the public route with `DEC-UX-003`. |
| Section 5.3 — Operator backoffice | The existing inquiry queue is the source for triage and manual follow-up. | Preserves the existing B2B queue and permission boundary. |
| Section 6 — Explicit non-goals | Keep WhatsApp notification, campaign, and portal exclusions. Add public raw-file upload exclusion for this intake. | No change to Retail notification policy. |
| Section 14 — Notifications | Explicitly distinguish a user-clicked WhatsApp continuation from automatic notification. | Does not amend `DEC-DATA-003`. |
| Section 16 — Dashboard | Track inquiry intake and follow-up queue, not WhatsApp delivery or chat analytics. | Keeps reporting operational rather than marketing-oriented. |
| Sections 18–19 — Acceptance/gates | Add persistence-before-WhatsApp, safe reference, failure, privacy, and response-expectation checks. | Remains activation and implementation gated. |

### 2.1 Proposed canonical record changes

- Amend `DEC-UX-003` to show the optional, user-initiated WhatsApp
  continuation after a successful public B2B Inquiry submission.
- Promote this PRD amendment as the approved B2B intake behavior through the
  canonical documentation process; the final register ID is assigned by the
  register maintainer.
- Do not amend `DEC-DATA-003`: its Retail no-WhatsApp notification boundary
  remains unchanged.
- Do not amend `ADR-002` or `DEC-OPS-003`: the no-public-upload and existing
  integrated inquiry-queue boundaries remain in force.

## 3. Canonical customer and operator flow

```text
Homepage / Capabilities / Projects
  -> /contact#form-konsultasi
  -> visitor submits the public form (no login)
  -> server persists Inquiry with status `new`
  -> success acknowledgement with opaque inquiry reference
  -> optional "Lanjutkan ke WhatsApp"
  -> operator reviews / contacts manually
  -> existing B2B Inquiry transitions
  -> conversion to B2B Quote/Project when appropriate
```

The primary project-discussion CTA should lead to the structured form. The
existing public WhatsApp destination may remain visible as a secondary,
clearly labelled contact action for visitors who do not yet want to submit a
brief.

### 3.1 Submission behavior

1. The client validates the form for accessible, immediate correction.
2. The server validates and persists one Inquiry before any WhatsApp CTA is
   shown.
3. A successful response returns a customer-safe acknowledgement and an opaque
   reference. It may echo the submitter's own submitted fields for continuity,
   but must not expose triage state, operator identity, audit history, internal
   notes, or provider payloads.
4. If persistence fails or the response is ambiguous, the UI must not claim
   success and must not generate a reference-based WhatsApp message.
5. Double-submit protection and a server-side idempotency strategy remain
   required in the technical contract; a disabled button alone is not enough.

### 3.2 WhatsApp continuation

- The CTA is shown only after a confirmed successful Inquiry persistence.
- The CTA is optional. Declining it does not change the Inquiry status.
- The destination is the approved Niuva public WhatsApp setting; it must not
  be accepted from a user-supplied URL or hard-coded in a new feature without
  configuration ownership.
- The prefilled message contains only a safe reference and a short neutral
  context, for example: `Saya baru mengirim inquiry <reference> ke Niuva.`
- Do not prefill raw brief text, private file links, secrets, internal notes,
  or unnecessary personal data.
- Opening WhatsApp does not automatically mark the Inquiry as `contacted`.
  Only an operator action or an approved future integration may change that
  status.
- If no approved WhatsApp destination is configured, hide the CTA and retain
  the acknowledgement plus the stated manual follow-up channel.

## 4. Public inquiry field contract (candidate)

The contract intentionally reuses the existing B2B Inquiry field names so the
PRD does not invent a second intake aggregate. Labels are Indonesian-facing;
the API names below are implementation-contract inputs, not implementation
authorization.

| Field | Required in public UX | Candidate validation | Purpose and privacy boundary |
| --- | --- | --- | --- |
| `company` | Yes | String, 2–200 characters | Perusahaan/organisasi. Do not expose to unrelated users. |
| `pic_name` | Yes | String, 2–120 characters | Named contact person. |
| `pic_email` | Yes | Valid email address | Manual follow-up destination. |
| `pic_phone` | Yes | 8+ digits after normalization, max 50 characters; non-empty at the API boundary | Active WhatsApp/phone contact. The current API accepts an empty value; closing that mismatch is an implementation gate. |
| `need` | Yes | Controlled service choice, 3–500 characters | Research & Development, Design & Prototyping, Consultant & Workshop, Apparel & Merchandise, or other approved partnership category. |
| `timeline` | Yes | Controlled value, max 200 characters; `Belum ditentukan` is valid | Planning context, not a delivery promise. |
| `brief` | Yes | 10–5,000 characters | Problem, intended output, scale, constraints, or collaboration context. |
| privacy acknowledgement | Yes | Required checkbox with the approved copy below; link to the applicable Privacy page | The notice covers inquiry review and manual follow-up. It does not grant marketing consent. At the authorized API/data boundary, persist `privacy_policy_version` and `accepted_at` on the same Inquiry; exclude both from the customer projection. Do not add IP, raw-payload, or marketing-consent fields in this amendment. |

Approved checkbox copy:

> Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
> menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
> untuk marketing tanpa persetujuan terpisah.

Final legal/privacy publication review remains an operational gate, but the
product decision is no longer open.

The public UX may show a concise quantity/scale prompt inside the brief, but a
new persisted `quantity` field is not introduced by this packet. A new field,
service taxonomy, or channel-preference field requires a separate contract
change.

### 4.1 Customer-safe response

The acknowledgement may include:

- a success message;
- the opaque Inquiry reference;
- the manual-review expectation;
- the optional WhatsApp continuation action; and
- a safe way to start another inquiry.

It may echo the submitter's own submitted fields when useful for continuity,
but must not include internal status transitions, operator notes, quotation
amounts, ETA promises, or an unrestricted link to stored files.

The existing opaque Inquiry UUID is the selected MVP customer reference. A
display-only human-friendly format may be added later without changing the
underlying record identity.

### 4.2 Current source reconciliation note

The current source is evidence, not implementation authorization:

- `ContactPage` already maps the public form to the existing Inquiry fields and
  validates a WhatsApp number, but its successful acknowledgement does not yet
  offer the post-persistence WhatsApp CTA.
- The current Contact-page hero still exposes a direct WhatsApp action. The
  form-first project CTA described by this packet is a later UX/runtime change.
- `InquiryPayload` currently permits an empty `pic_phone`; the target contract
  above makes it required, so a later API change must close that gap.
- `PublicInquiryResponse` currently projects the submitter's own fields. That
  is compatible with this packet's customer-owned echo rule; internal fields
  remain excluded by the existing projection boundary.

## 5. Inquiry status contract (candidate)

The MVP preserves the existing B2B state machine rather than introducing a
second set of statuses:

| Status | Customer-safe meaning | Operator meaning | Allowed next states |
| --- | --- | --- | --- |
| `new` | Inquiry diterima | Persisted and awaiting triage | `reviewed`, `rejected` |
| `reviewed` | Tidak perlu ditampilkan sebagai internal detail | Operator completed initial triage | `contacted`, `rejected` |
| `contacted` | Follow-up manual sedang/ telah dilakukan | Operator has started human follow-up | `converted`, `rejected` |
| `converted` | Inquiry moved to the separately governed B2B Quote/Project process | Conversion completed with the existing conversion contract | Terminal |
| `rejected` | Inquiry tidak dilanjutkan | Out of scope, duplicate, spam, or otherwise rejected with a reason | Terminal |

`needs_information`, `quotation_sent`, `won`, and `lost` are not added as
Inquiry statuses in this MVP. Additional information can be requested during
manual follow-up; quotation and project states belong to their own B2B
aggregates. The existing version, transition reason, and audit-history
requirements remain applicable.

## 6. Attachment and file policy

Public B2B form submission does **not** accept raw file uploads in this MVP.

- The visitor provides context in `brief`; the operator may request a file
  after triage through an approved private process.
- No public file/storage URL, arbitrary external redirect, or unscanned
  attachment becomes part of the Inquiry record.
- This avoids silently activating provider, quarantine, malware, quota,
  retention, access, backup, and incident decisions governed by `DEC-STOR-01`.
- A future B2B attachment flow requires a separate storage/security contract
  covering limits, validation, quarantine, retention, access, audit, and
  rollback before implementation.

## 7. Response expectation and ownership

The candidate customer-facing expectation is:

- durable acknowledgement is immediate after successful persistence;
- a human operator targets first follow-up within **one working day**;
- the wording is a target, not a guaranteed quotation, price, or delivery ETA;
- after-hours and non-working-day handling starts on the next applicable
  working day; and
- missing information may extend quotation preparation, but the operator
  should record the follow-up attempt and next action.

The approved working calendar and ownership defaults are:

- owner: `Niuva Operations`, mapped to the existing `sales_estimator` queue and
  permission boundary; no new RBAC role is introduced;
- the existing provider-neutral operator notification destination
  (`HRD_EMAIL`) must resolve to a Niuva Operations mailbox before activation;
- calendar: Monday–Friday, 09.00–17.00 WIB, excluding public holidays;
- the existing `new` Inquiry queue is triaged oldest-first and shows an age /
  response-target indicator to the operator; and
- no scheduler, automatic reminder, automatic WhatsApp message, or SLA
  notification is introduced by this packet.

The approved public WhatsApp setting must contain a valid international /
E.164-compatible destination that can be safely converted to the existing
`wa.me` form. If the setting is empty or invalid, the continuation CTA is
hidden and the durable acknowledgement remains available. Operational
measurement, escalation, and holiday-calendar maintenance remain activation
gates.

## 8. Acceptance criteria for later implementation planning

The B2B intake slice is acceptable only when all of the following are true:

1. A visitor can submit the approved form without creating an account.
2. The persisted Inquiry contains the agreed fields and starts at `new`.
3. A successful submission returns a safe reference and no internal data.
4. A failed or ambiguous persistence response never presents a false success
   state or a reference-based WhatsApp CTA.
5. The WhatsApp CTA appears only after persistence and contains no raw brief,
   private file URL, token, or internal data.
6. The operator can find the Inquiry in the existing queue and use only the
   approved transitions, with version/conflict and reason handling preserved.
7. Public raw-file upload is absent from the MVP form.
8. The acknowledgement states that follow-up is manual and does not promise a
   quote, price, production slot, or delivery date.
9. The route, form, success state, and WhatsApp CTA remain keyboard-accessible,
   responsive, and usable at the existing mobile target baseline.
10. Retail notification tests continue to prove that WhatsApp is not an
    automatic Retail notification channel.
11. The consent version and acceptance timestamp are stored with the Inquiry,
    while customer-facing projections exclude them and no raw payload or IP is
    added.
12. The operator ownership maps to the existing `sales_estimator` role and
    does not create a new role.
13. The `new` queue is presented oldest-first with a visible age /
    response-target indicator and no automatic reminder.
14. An empty or malformed public WhatsApp setting hides the CTA and cannot
    produce an unsafe destination.

## 9. Open gates after documentation promotion and before API backlog

The following four bounded defaults were approved on 8 August 2026. They
close the product-level choices for this amendment, but each still requires
an authorized implementation and activation check:

1. Consent evidence uses `privacy_policy_version` and `accepted_at` on the
   existing Inquiry; customer projections exclude them.
2. `Niuva Operations` maps to the existing `sales_estimator` queue and
   permission boundary; the existing `HRD_EMAIL` destination resolves to the
   operational mailbox before activation.
3. The response target is operated through an oldest-first `new` queue with a
   visible age / target indicator, without a scheduler or auto-reminder.
4. The public WhatsApp setting is validated as an international /
   E.164-compatible destination; an empty or invalid value hides the CTA.

The following items remain open before this candidate becomes an
implementation/API contract:

1. Implementation details, tests, and rollback evidence for the four approved
   defaults above.
2. Operational measurement and escalation for the approved one-working-day
   target, including holiday-calendar ownership.
3. Any future attachment requirement and its separate storage/security gate.
4. Idempotency, abuse/rate-limit, audit, and notification behavior in the
   later technical contract.

## 10. Approval record

| Item | Candidate record |
| --- | --- |
| User selection | Form + WhatsApp: quick follow-up while the Inquiry remains recorded |
| Product scope | Public B2B/partnership manual inquiry; no customer portal |
| Selected MVP defaults | Existing Inquiry UUID as reference; `pic_phone` required at the target API boundary; one-working-day response target as an Operations-owned target |
| WhatsApp owner/destination | `Niuva Operations`; use the existing approved destination in public settings |
| Privacy/consent | Checkbox required; approved wording recorded; persist `privacy_policy_version` and `accepted_at` on the Inquiry and exclude them from customer projection |
| Operator mapping | `Niuva Operations` uses the existing `sales_estimator` queue/permission boundary; no new role |
| Operator notification | Existing provider-neutral `HRD_EMAIL` destination must resolve to the Niuva Operations mailbox before activation |
| Queue/SLA handling | Existing `new` queue, oldest-first with visible age / response-target indicator; no scheduler or auto-reminder |
| Response calendar | Monday–Friday, 09.00–17.00 WIB; public holidays excluded |
| WhatsApp setting validation | Require an international / E.164-compatible destination; hide the CTA when empty or invalid |
| Documentation scope | This candidate packet and the identified PRD amendment map |
| Source/API scope | None authorized by this packet |
| Schema/migration scope | None authorized by this packet |
| Provider/activation scope | No WhatsApp automation, provider selection, or activation authorized |
| Production/readiness scope | Not authorized |
| Canonical promotion | Explicitly approved on 8 August 2026 for the listed documentation-only records |

This document remains promotion provenance. It must not be treated as a
runtime implementation authorization, provider activation, migration
authorization, production-readiness approval, or go-live approval.
