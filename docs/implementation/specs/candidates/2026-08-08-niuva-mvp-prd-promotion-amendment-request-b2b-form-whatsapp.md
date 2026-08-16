# Promotion/Amendment Request — B2B Form + WhatsApp Continuation

Status: **Approved Documentation Promotion Record — No Implementation Authority**
Prepared: 8 August 2026 (Asia/Jakarta)
Approval: Explicit user approval recorded on 8 August 2026 (Asia/Jakarta)
Decision packet: [`2026-08-07-niuva-mvp-prd-promotion-amendment-b2b-form-whatsapp.md`](2026-08-07-niuva-mvp-prd-promotion-amendment-b2b-form-whatsapp.md)

This record documents the approved documentation-only promotion of the
reviewed B2B intake decision. It is not itself a runtime authorization and
does not authorize code, API/schema work, migration, provider activation,
deployment, production readiness, or go-live.

> **Read-first notice:** This is an approval and provenance record, not the
> active PRD. Start with
> [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md); use this file only to
> verify the 8 August 2026 promotion scope and its explicit exclusions.

## 1. Requested promotion

Promote the following MVP behavior into canonical product/experience
documentation:

> A public B2B or partnership prospect submits a structured inquiry form
> without login. After the Inquiry is successfully persisted, the customer may
> continue to the approved Niuva WhatsApp destination with a safe reference.
> The Inquiry record remains the system of record and B2B follow-up remains
> manual.

The proposed flow is:

```text
/contact#form-konsultasi
  -> submit public form
  -> persist Inquiry (`new`)
  -> show safe acknowledgement and existing Inquiry UUID
  -> optional user-clicked WhatsApp continuation
  -> operator triage and manual follow-up
  -> existing B2B Quote/Project conversion when appropriate
```

## 2. Canonical amendment scope

| Canonical surface | Requested treatment | Not requested |
| --- | --- | --- |
| Candidate MVP PRD | Promote the B2B form-first + optional WhatsApp behavior and its field/status/attachment/response contract. | Reopening Retail pricing, checkout, payment, or production policy. |
| `DEC-UX-003` | Amend the public B2B flow to include the optional post-persistence WhatsApp continuation. | Adding a customer B2B portal or changing route topology. |
| `DEC-DATA-003` | Leave unchanged; its no-WhatsApp boundary applies to automatic Retail notifications. | B2B notification automation, campaigns, or webhooks. |
| `ADR-002` / `DEC-STOR-01` | Leave unchanged; public raw-file upload remains excluded. | Selecting storage, scanning, quota, retention, or backup providers. |
| `DEC-OPS-003` | Leave unchanged; the existing inquiry queue remains the operator surface. | New CMS topology or operator role. |
| `DECISION_REGISTER.md` | Update only after explicit approval of this request, with the exact final amendment ID and effective date. | Editing the register in this draft stage. |

## 3. Contract proposed for canonical recording

### 3.1 Public fields

The form reuses the existing Inquiry names:

| Field | Canonical MVP rule |
| --- | --- |
| `company` | Required, 2–200 characters. |
| `pic_name` | Required, 2–120 characters. |
| `pic_email` | Required, valid email. |
| `pic_phone` | Required, 8+ normalized digits, max 50 characters. |
| `need` | Required approved service category. |
| `timeline` | Required controlled value; `Belum ditentukan` is valid. |
| `brief` | Required, 10–5,000 characters. |
| Privacy acknowledgement | Required checkbox with approved copy: “Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan untuk marketing tanpa persetujuan terpisah.” At the authorized API/data boundary, persist `privacy_policy_version` and `accepted_at` on the same Inquiry; exclude them from customer projection. |

The form does not add a new quantity, channel-preference, or second inquiry
aggregate. Scale and quantity remain part of `brief` until a separately
approved data contract adds a field.

### 3.2 Response and reference

- Successful persistence returns a customer-safe acknowledgement and the
  existing opaque Inquiry UUID.
- The response may echo only the submitter's own submitted fields for
  continuity.
- Triage status beyond the initial `new` state, operator identity, history,
  internal notes, provider payloads, cost, margin, and private file data remain
  excluded.
- A failed or ambiguous persistence result must not show success or generate a
  reference-based WhatsApp message.

### 3.3 Statuses and attachment policy

The existing inquiry state machine remains canonical for this slice:

```text
new -> reviewed -> contacted -> converted
  \-> rejected at the permitted triage transitions
```

`converted` enters the separately governed B2B Quote/Project lifecycle. No
new `needs_information`, `quotation_sent`, `won`, or `lost` Inquiry states are
introduced.

The public form accepts no raw file upload. The operator may request files
later through an approved private process after the storage/security gates are
closed.

### 3.4 WhatsApp boundary

- WhatsApp is an optional user-clicked continuation only.
- It appears only after successful Inquiry persistence.
- The destination comes from the approved Niuva public setting; users cannot
  supply the destination URL.
- The prefilled message contains the Inquiry UUID and short neutral context,
  not raw brief text, file links, tokens, or internal data.
- Opening WhatsApp does not automatically change the Inquiry status.
- The configured destination must be a valid international / E.164-compatible
  WhatsApp number that can be safely converted to the existing `wa.me` form.
  If the setting is empty or invalid, the CTA is hidden.
- No automatic WhatsApp notification, retry worker, webhook, campaign, or SLA
  reminder is part of this promotion.

### 3.5 Response expectation

The product copy may state that Niuva targets first human follow-up within one
working day. This is an Operations-owned target, recorded for `Niuva
Operations` on the Monday–Friday, 09.00–17.00 WIB calendar excluding public
holidays, and is not a quotation, price, or delivery guarantee. The owner maps
to the existing `sales_estimator` queue and permission boundary; no new RBAC
role is introduced. The existing `new` queue is triaged oldest-first with a
visible age / response-target indicator. The existing provider-neutral operator
notification destination (`HRD_EMAIL`) must resolve to a Niuva Operations
mailbox before activation. No scheduler or automatic reminder is introduced.
Operational execution, escalation, measurement, and holiday calendar
maintenance remain activation/operations gates.

### 3.6 Bounded audit decisions approved on 8 August 2026

The following choices close the product-level defaults for this amendment but
do not authorize runtime implementation:

1. Store `privacy_policy_version` and `accepted_at` with the existing Inquiry;
   keep both out of customer-facing projections and do not add IP, raw-payload,
   or marketing-consent fields.
2. Map `Niuva Operations` to the existing `sales_estimator` queue and
   permission boundary rather than creating a new role; verify the existing
   `HRD_EMAIL` destination resolves to the operational mailbox before
   activation.
3. Operate the one-working-day target with the existing `new` queue, oldest
   first, and a visible age / response-target indicator; do not add a scheduler
   or auto-reminder.
4. Validate the public WhatsApp setting as an international /
   E.164-compatible destination and hide the CTA when empty or invalid.

## 4. Evidence and reconciliation

The reviewed packet was checked against:

- `NIUVA_MASTER_SPEC.md` — public B2B inquiry without login and separate B2B
  lifecycle;
- `DEC-UX-003` — public `/contact` and manual B2B inquiry flow;
- amended `DEC-DATA-003` — automatic Retail notification boundary with no
  WhatsApp;
- `ADR-002` / `DEC-STOR-01` — B2B attachments remain within the private
  storage boundary;
- current `backend/b2b_routes.py` and `backend/b2b_domain.py` — field names,
  customer projection, and existing status transitions; and
- current `frontend/src/pages/marketing/ContactPage.jsx` — existing form
  mapping and current direct-WhatsApp/acknowledgement behavior.

The source findings below are implementation follow-up, not hidden promotion:

1. The current API permits an empty `pic_phone`; a later authorized API change
   must enforce the promoted required-field rule.
2. The current Contact-page hero has a direct WhatsApp action; the later UX
   implementation must make the structured form the project-discussion CTA
   while retaining WhatsApp as a secondary action.
3. The current acknowledgement has no post-persistence WhatsApp CTA; that is a
   later runtime change.
4. The consent evidence, queue age indicator, and destination-format check are
   later implementation/activation work; this request records their bounded
   target behavior only.

## 5. Approval checklist

Canonical promotion should occur only after the approving owner records:

- [x] approval of the form-first + optional WhatsApp product behavior;
- [x] acceptance that `DEC-UX-003` will be amended;
- [x] confirmation that `DEC-DATA-003` remains unchanged;
- [x] confirmation of the existing Inquiry UUID as the MVP reference;
- [x] confirmation that `pic_phone` is required at the target API boundary;
- [x] owner and destination for the public Niuva WhatsApp setting: `Niuva
      Operations`, existing public-settings destination;
- [x] privacy wording and required checkbox;
- [x] one-working-day response target owned by `Niuva Operations`, Monday–Friday
      09.00–17.00 WIB, public holidays excluded;
- [x] bounded consent evidence: `privacy_policy_version` and `accepted_at` on
      the Inquiry, excluded from customer projection;
- [x] existing `sales_estimator` mapping, oldest-first `new` queue with a
      visible age / target indicator, and no scheduler or auto-reminder;
- [x] existing provider-neutral `HRD_EMAIL` destination resolves to the
      Niuva Operations mailbox before activation;
- [x] public WhatsApp setting validation with CTA hidden when empty or invalid;
- [x] acknowledgement that public raw-file upload remains excluded; and
- [x] explicit statement that source implementation, migration, provider
      activation, deployment, readiness, and go-live remain separate gates.

## 6. Executed documentation scope

The approved documentation-only action is to:

1. amend the canonical `DEC-UX-003` record;
2. promote the approved PRD amendment according to the repository's canonical
   document convention;
3. update `DOCUMENT_REGISTER.md` and `DECISION_REGISTER.md` with the final
   record IDs, effective date, and packet link; and
4. leave source code, API/schema, migrations, providers, deployment, readiness,
   and go-live unchanged.

The canonical records are being amended in a clean documentation worktree.
This approval does not authorize source code, API/schema changes, migrations,
provider activation, deployment, production readiness, or go-live.
