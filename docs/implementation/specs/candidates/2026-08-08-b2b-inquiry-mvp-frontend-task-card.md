# Task Card — B2B Inquiry MVP Frontend and Admin Experience

<!-- markdownlint-disable MD013 -->

**Status:** Candidate delivery task — source authorization required<br>
**Date:** 2026-08-08 (Asia/Jakarta)<br>
**Observed baseline:** `origin/main` at `2cd4ab29f3f618005ea7063b6f54df9563ba6eb3`<br>
**Proposed branch:** `feat/b2b-inquiry-mvp-frontend-20260808`<br>
**Proposed worktree:** `C:\tmp\niuva-b2b-inquiry-mvp-frontend-20260808`<br>
**Driver:** Frontend Developer<br>
**Reviewer:** Project Lead / Integrator<br>
**Verifier:** Verification Developer<br>
**Commit/push/PR:** No — separate authorization required

## Objective

Align the public Contact experience and Admin Inquiry detail with the approved
form-first B2B flow while preserving the existing React/Axios architecture,
accessibility baseline, and Retail/B2B route separation.

## Authority and dependency

The governing brief is the
[B2B Inquiry MVP Implementation Contract](2026-08-08-b2b-inquiry-mvp-implementation-contract.md).
The backend request/response and idempotency fixture must be frozen before
consumer integration. The task does not authorize a new route, auth policy,
provider, or design-system refactor.

## Allowed source paths

Only these paths may change in this task:

- `frontend/src/pages/marketing/ContactPage.jsx`
- `frontend/src/pages/admin/B2BDetail.jsx`
- `frontend/src/lib/publicSettings.js`

Frontend verification files are owned by the Verification task card. Existing
shared components should be reused; add a component only if the exact field or
status state cannot be expressed through the current primitives.

## Required behavior

### Public Contact

- The primary project-discussion CTA enters the structured form. Direct
  WhatsApp remains a clearly secondary contact action for visitors who do not
  submit a brief.
- The form contains the approved fields and required privacy checkbox copy.
- The checkbox is keyboard accessible, clearly associated with its label, and
  blocks submission until accepted.
- After a confirmed `201` response, show the safe Inquiry reference and manual
  follow-up expectation.
- Show an optional “Lanjutkan ke WhatsApp” action only after persistence. The
  action uses the configured safe destination and a neutral reference message.
- Failed, ambiguous, throttled, or invalid responses never show a success or
  reference-based WhatsApp CTA.
- Empty or malformed public WhatsApp settings hide the CTA without breaking
  the acknowledgement or new-submission action.

### Admin Inquiry

- Preserve protected `/admin/inquiries` and `/admin/inquiries/:id` routes and
  existing permission checks.
- Show the operator phone number, Inquiry reference, consent evidence where
  permitted, and a safe copy/open WhatsApp action without exposing internal
  notes or unrelated customer data.
- Preserve existing transition, version-conflict, loading, empty, error, and
  retry states.
- Present the `new` queue oldest-first with a visible age /
  one-working-day target indicator. Do not add a scheduler or notification
  composer.

## Accessibility and responsive acceptance

- All new controls have labels, focus visibility, keyboard operation, and
  status/error announcements consistent with existing primitives.
- Mobile layouts remain usable at the existing 390px target without horizontal
  overflow.
- No raw API error, internal identifier beyond the intended Inquiry reference,
  cost, margin, supplier, or private file data appears in public UI.

## Explicit exclusions

- No new route, customer B2B portal, registration flow, or project tracking UI.
- No public file upload, storage provider, WhatsApp automation, analytics,
  CRM, campaign, or notification-policy change.
- No Retail configuration, checkout, payment, shipment, or production UI.
- No new React state library, API client, design-system rewrite, or broad App.js
  navigation refactor.

## Acceptance criteria

1. Focused tests prove form-first CTA, checkbox validation, acknowledgement,
   safe reference, post-persistence WhatsApp continuation, and invalid-setting
   fallback.
2. Admin tests prove phone/reference visibility, permission preservation, safe
   WhatsApp action, queue ordering/age indicator, and conflict/error states.
3. Browser checks cover desktop and the 390px target, keyboard/focus, console
   cleanliness, and no overflow.
4. Existing public content, Admin B2B/CMS surfaces, and Retail route contracts
   remain unchanged outside the listed paths.
5. `git diff --check`, focused frontend tests, build, and applicable browser
   contracts pass.

## Handover and stop conditions

Handover must list changed and unchanged paths, API fixture version, responsive
and accessibility evidence, tests run/not run, and any unresolved copy/privacy
owner decision. Stop if the work requires App-wide routing, a new role, a new
provider, or a customer portal.

<!-- markdownlint-enable MD013 -->
