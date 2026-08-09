# Candidate Task Card — Build Bounded MVP UX/UI Prototype

**Status:** Candidate — Context Only — build authorization is separate
**Amended:** 9 August 2026 — visual-craft, asset, Participant Mode, and anti-generic acceptance contract

**Packet prerequisite:**
`2026-08-08-niuva-mvp-annotated-wireframe-bounded-prototype-packet.md`

**Parent-packet formal gate:** `PASS WITH CONDITIONS`, Round 5 evidence in
`2026-08-08-niuva-mvp-annotated-wireframe-bounded-prototype-formal-expert-critique-r5.md`

Round 5 proves the annotated packet's flow and traceability maturity. It does
not prove the visual quality of the existing R5 prototype. The existing
`C:\tmp\niuva-mvp-ux-ui-bounded-prototype-r5` screenshots are retained as
anti-reference evidence and must not be overwritten.

**Baseline:** `origin/main` at
`a61cc2be6a10a4dd5e04d4343cf9d293404a8f30`

## 1. Objective

Build one isolated, synthetic-data, clickable prototype that exercises the
approved annotated frames and lets a reviewer evaluate flow integrity,
Participant Mode neutrality, route/canonical alignment, responsive composition,
accessibility, recovery states, and the amended Niuva-specific visual-craft
contract before application implementation.

The prototype must demonstrate three related but intentionally different
surface directions from the amended Candidate MVP UX/UI Design Packet:

- approved Experimental Editorial Hybrid for public/B2B/project evidence;
- candidate Product Specification Workspace for Retail/customer tasks; and
- candidate Calm Operational Workspace for Admin/CMS tasks.

The shared recognition anchor is the need/file-to-physical-output evidence
thread, not a reusable generic dashboard shell.

This task card does not authorize production application changes or any
provider, database, authentication, upload, payment, fulfillment, notification,
deployment, readiness, or go-live action.

Applicable authority is the Master Spec, Document Register, Decision Register,
and the approved decisions/ADRs referenced by the packet, especially
`DEC-UX-003`, `DEC-OFFER-01`, `DEC-INV-01`, `DEC-ETA-01`, `DEC-FUL-01`,
`DEC-AFTER-01`, `DEC-ACCESS-002`, `DEC-OPS-002`, `ADR-001`, `ADR-003`, and
`ADR-004`. If any source, candidate, or fixture conflicts with those records,
the authority-first order in the packet wins and the prototype stops safely.

## 2. Planned isolation and exact files

The build driver must create a new isolated worktree or directory from the
baseline above. The amended planned build root is:

`C:\tmp\niuva-mvp-ux-ui-bounded-prototype-r6`

The R5 root is read-only evidence for comparison. Do not edit, clean, rename,
or delete it during the R6 build.

The prototype is a standalone static surface. The only planned prototype files
are:

| File | Purpose |
| --- | --- |
| `index.html` | Participant-only semantic shell and accessible landmarks; contains no Review Mode switch or evaluator chrome |
| `review.html` | Reviewer-only fixture/scenario controls and the explicit handoff into Participant Mode |
| `styles.css` | Existing-token-aligned candidate composition, responsive behavior, focus/error/status styles, and surface-specific visual calibration |
| `app.js` | Deterministic frame/transition state machine; no network calls |
| `fixtures.js` | Synthetic `FX-*` data and resettable scenario seeds |
| `server.cjs` | Local-only static server for browser validation |
| `prototype-flow.contract.test.cjs` | Node standard-library contract tests for transitions, forbidden side effects, Participant/Review separation, and anti-generic structural assertions |
| `README.md` | Run instructions, scope boundary, evidence and cleanup notes |
| `BROWSER_REVALIDATION.md` | Recorded browser evidence and disposition of prototype-only fixes |
| `VISUAL_QA.md` | Before/after critique table, design-read/dial record, contact-sheet index, copy review, detector result, and visual disposition |
| `ASSET_MANIFEST.md` | Source, licence/provenance, dimensions, content/decorative role, alt-text intent, and simulation status for every visual asset |
| `assets/niuva-mark.svg` | Local copy of the approved mark; provenance recorded in the manifest |
| `assets/projects/` | Local copies of only the approved project images used by public/B2B frames |
| `assets/synthetic/` | Optional prototype-only renders for synthetic Retail fixtures; each is visibly simulated and provenance-labelled |
| `evidence/` | Local screenshots/contact sheets from the required viewport checks; not application assets |

No file under `frontend/`, `backend/`, production routes, API clients,
database models, provider adapters, secrets, or environment configuration may
be imported or modified. Approved logo/project media may be copied one-way into
the prototype `assets/` directory only when its source SHA/path and checksum are
recorded in `ASSET_MANIFEST.md`; the prototype must not runtime-import from the
application tree. The packet and task card are read-only inputs copied or
referenced for traceability; they are not runtime data.

## 3. Required prototype coverage

The implementation must represent all 37 `WF-*` frames, 95 `PT-*` transition
contracts, and 43 `FX-*` fixtures as deterministic prototype state. All 44
`SCN-*` cards remain selectable in Review Mode.

The R6 presentation and evidence layer must additionally trace
`UX-VIS-001`, `UX-VIS-002`, `UX-ASSET-001`, `UX-MOTION-001`, and
`UX-COPY-001` from the amended parent design packet. These requirements add
visual and evidence acceptance; they do not alter the 37 frame identities, 95
flow transitions, 43 fixtures, or 44 scenario meanings.

Browser evidence must execute at least the following high-risk scenario set
before the prototype can be reviewed:

`SCN-B2B-01`, `SCN-B2B-HANDOFF-01`, `SCN-READY-01`,
`SCN-AUTH-CART-01`, `SCN-AUTH-CFG-01`, `SCN-CUSTOM-01`,
`SCN-CUSTOM-RECOVERY-01`, `SCN-QUOTE-01`, `SCN-QUOTE-ROUTING-01`,
`SCN-OFFER-01`, `SCN-OFFER-RECOVERY-01`, `SCN-OFFER-DECLINE-01`,
`SCN-CHK-01`, `SCN-CHK-FULFILLMENT-01`, `SCN-CHK-CREATION-FAIL-01`,
`SCN-RES-01`, `SCN-PAY-01`, `SCN-PAY-RECOVERY-01`, `SCN-ORD-01`,
`SCN-ORD-PICKUP-OVERDUE-01`, `SCN-ORD-EXCEPTIONS-01`, `SCN-AFS-01`,
`SCN-AFS-REVIEW-01`, `SCN-AFS-FINANCE-01`, `SCN-ADM-01`,
`SCN-ADM-REQUEST-01`, `SCN-ADM-02`, `SCN-ADM-TRANSACTION-01`,
`SCN-CMS-01`, `SCN-CMS-02`, `SCN-CMS-03`, `SCN-DASH-01`,
`SCN-MIXED-01`, `SCN-OWNERSHIP-01`, `SCN-OWNERSHIP-02`, `SCN-STOCK-01`,
`SCN-NOTIF-01`, and `SCN-LEGACY-01`.

The remaining scenario cards must still have a deterministic fixture/frame
entry and a Review Mode reset path, but are not claimed as human-validated
until evidence is recorded.

## 4. Mode and data contract

- Participant Mode is served from `index.html`. It shows the applicable
  product navigation, one neutral `SIMULASI` notice, and role-appropriate task
  controls only. It must not show a Review Mode switch, numbered prototype
  surface navigation, packet route labels, open gates, responsive-contract
  labels, fixture/frame/scenario/transition IDs, annotations, event logs,
  evaluator instructions, expected answers, or “bounded prototype” branding.
- Review Mode is served separately from `review.html`. It is used only to
  select/reset a synthetic fixture, seed the exact role, inspect state, and
  capture evidence. Every operator task must perform a Review Mode seed → clean
  Participant Mode handoff before task actions. Returning to Review Mode is an
  evaluator action outside the participant task surface.
- All values are synthetic and visibly labelled `SIMULASI`. State resets must
  remove local persistence and leave no real submission, Order, reservation,
  payment attempt, notification, WhatsApp handoff, or provider call.
- Ownership-safe states must return the same non-enumerating projection for
  foreign and missing records. Internal cost, margin, supplier, profit, notes,
  and provider payloads must never enter Participant Mode.

### 4.1 Visual direction and surface calibration

The amended Candidate MVP UX/UI Design Packet is the visual planning input.
Canonical Niuva decisions and `DESIGN.md` continue to override it.

| Surface family | Required direction | Candidate dials: variance / motion / density | Recognition anchor |
| --- | --- | --- | --- |
| Public/B2B/projects | Experimental Editorial Hybrid with authentic evidence and asymmetric hierarchy | 7 / 4 / 4 | Need-to-output transformation and real project proof |
| Retail/customer | Product Specification Workspace; calm commerce without marketplace styling | 4 / 2 / 5 | Persistent Object Specification across configure, checkout, and Order |
| Admin/CMS | Calm Operational Workspace; dense, stable, recovery-led | 2 / 1 / 7 | Record identity, state, next action, conflict, and audit history |
| Review Mode | Compact evidence tool, visually outside the product | 1 / 1 / 7 | Fixture/scenario/evidence controls only |

Use the existing semantic Niuva palette and type roles: Poppins for approved
display/UI emphasis, Inter for body/forms/operations, and mono only for genuine
identifiers. Do not add a new font, unrelated palette, dark-mode system,
gradient, glow, glassmorphism, UI kit, or icon family. If icons are necessary,
use one repository-approved Lucide family with accessible names; do not use
emoji or hand-drawn decorative SVG paths.

### 4.2 Anti-reference findings from R5

R5 is preserved because it provides concrete recurrence tests. The R6 handoff
must include this table with exact after-screenshot evidence:

| Before (R5 anti-reference) | After required in R6 | Why |
| --- | --- | --- |
| Numbered `SURFACES` sidebar and `OPEN GATES` panel appear beside Participant tasks | Product-appropriate public/customer/operator navigation only; review controls exist solely in `review.html` | Participant Mode must test the product, not teach the specification |
| `WF-*`, `SCN-*`, `FX-*`, route paths, “responsive contract”, and event metadata are visible in Participant screenshots | Zero packet/evaluator identifiers in Participant DOM and screenshots | Technical traceability belongs to Review Mode and evidence files |
| Repeated large rounded white panels carry forms, explanations, states, and actions | Open editorial regions for public/B2B, specification groups for Retail, and queue/detail ledgers for Admin | Meaningful hierarchy cannot come from putting every block in the same card |
| Large marketing-style English headings are reused across inquiry, authentication, and Admin recovery | Indonesian-first, task-specific hierarchy; marketing scale is limited to public persuasion surfaces | Surface mode must shape typography and density |
| One generic blue/white shell makes customer and operator frames differ mainly by copy | Three calibrated surface families share tokens but use different composition and density | Shared identity does not mean shared template |
| Simulated status is shown with decorative dots and technical labels | One neutral simulation notice; status indicators carry real semantic text and never decorate every row | Decorative technical language is a known Niuva anti-pattern |

### 4.3 Asset and copy contract

- Public/B2B/project frames use the official mark and approved local project
  images where relevant. Missing process photography is recorded, not
  fabricated.
- A synthetic Retail object image is optional. If used, it must be generated or
  sourced specifically for a named fixture, visibly marked `SIMULASI`, and
  recorded in `ASSET_MANIFEST.md`. It must not resemble customer evidence,
  production telemetry, or an approved ready-product listing.
- No fake CAD, slicer, G-code, printer telemetry, trust badge, certificate,
  metric, testimonial, client logo, or SaaS stock illustration may be used to
  fill space.
- Participant copy is Indonesian-first. English remains only for approved
  domain terms. One action intent uses one stable label within a surface.
- Every visible string receives a final copy pass for grammar, fabricated
  precision, vague AI marketing language, blame, mixed-language filler, and
  false assurance.

## 5. Non-negotiable flow assertions

The contract tests and browser checks must fail if the prototype:

1. creates an Order, reservation, payment attempt, or checkout total from
   `quote_required`, a Request, or an Offer alone;
2. turns an accepted Offer into payment without checkout revalidation;
3. shows a blind duplicate-payment action for uncertain/pending payment;
4. merges Retail Request/Offer with B2B Inquiry/Quote/Project;
5. hides a permission, version, transaction, file, fulfillment, or ownership
   failure while displaying success;
6. exposes a foreign/missing record or internal operational data;
7. uses fake production percentage, queue position, telemetry, or provider
   branding;
8. makes the Review Mode seed or evaluator hint visible during Participant Mode;
9. renders packet IDs, numbered prototype navigation, open-gate content, route
   contracts, responsive-contract labels, event logs, or a Review Mode control
   in Participant Mode;
10. uses one generic rounded-card shell for public, customer, and operator
    frames, or makes those surface families distinguishable only by their
    heading text;
11. invents or misrepresents visual evidence, product media, client proof,
    metrics, CAD/slicer output, or synthetic fixtures;
12. introduces an unapproved font, palette, gradient, glow, glassmorphism,
    icon family, or decorative technical vocabulary; or
13. mixes participant language, duplicates CTA intent, or uses marketing-scale
    hierarchy on routine checkout, Order, Admin, or CMS tasks.

## 6. Responsive, accessibility, and visual checks

For each selected scenario, capture or otherwise record desktop/mobile evidence
at 390px, 768px, 1024px, and 1440px. Verify:

- no horizontal overflow or clipped primary action;
- reading order and landmark structure remain meaningful;
- keyboard traversal, visible focus, skip/navigation behavior, and focus return
  work for dialogs/drawers;
- field errors have a summary and adjacent message, with an announced target;
- state changes use an appropriate live region without duplicate announcements;
- status, old/new deltas, timers, and terminal payment meanings are visible;
- reduced-motion preference removes non-essential animation;
- touch targets meet the repository's current accessible target contract; and
- browser console has zero errors and warnings during the selected flows.

The prototype quality floor also requires:

- a 4.5:1 text-contrast check for normal participant copy and 3:1 for large
  text/control boundaries as prototype evidence, without claiming canonical
  WCAG conformance while `AG-UX-A11Y` remains open;
- at least one public/B2B, configurator, checkout/payment-recovery,
  Order/after-sales, Admin/CMS, and Review Mode contact-sheet entry at 390px and
  1440px, plus the existing 768px and 1024px functional checks;
- one logo-hidden identity review showing that the need/file-to-output evidence
  thread remains recognizable without technical labels;
- side-by-side R5/R6 screenshots for inquiry, one Retail/customer task, and one
  Admin recovery task with a `Before | After | Why` disposition in
  `VISUAL_QA.md`;
- exact review of hover/focus/active/disabled/loading/error/stale/success states
  with no layout-shifting hover and no feedback hidden only in a live region;
- motion restricted to named properties, with no `transition: all`, no
  `scale(0)` entry, no `ease-in` UI entrance, and no animation on
  keyboard-initiated or high-frequency Admin actions;
- hover-only visual effects gated to fine pointers and every non-essential
  displacement removed under reduced motion;
- reserved image dimensions and an asset-manifest match for every rendered
  visual; and
- a final visible-string audit confirming Indonesian-first Participant Mode,
  stable CTA labels, and zero fixture/evaluator language.

The prototype must visually distinguish public, customer, operator, and Review
Mode surfaces through the amended candidate directions without inventing a new
brand or production design system. ASCII frames, candidate dials, and open
gates remain traceability inputs, not canonical CSS authority.

## 7. Verification commands and evidence

At minimum, the driver must run and record:

```text
node --check app.js
node --check fixtures.js
node --check server.cjs
node --test prototype-flow.contract.test.cjs
node C:\Users\FAIZ\.agents\skills\impeccable\scripts\detect.mjs --json index.html review.html styles.css app.js
```

Run the Impeccable detector once after the complete R6 visual build, not as an
open-ended polish loop. Detector output is mechanical evidence only; it does
not replace the required human screenshot critique.

Browser validation must use a local server only and record the URL, viewport,
fixture/scenario, transition path, console output, overflow result, keyboard
result, Participant/Review entry, asset-manifest identity, and
screenshot/evidence location. The browser pass must inspect the Participant DOM
for forbidden evaluator strings as well as the rendered screenshot. No external
endpoint, provider, or credential may be contacted. `markdownlint` remains
optional; if unavailable, record it rather than installing a dependency for
this task.

## 8. Acceptance and handover

The build is acceptable for a separate expert/browser review only when:

- all exact prototype files stay within the isolated build root;
- contract tests pass and forbidden transitions are covered;
- selected scenarios reach the expected frame/state without evaluator hints;
- all required viewports and accessibility checks are recorded;
- `index.html` contains no Review Mode navigation or evaluator-only DOM;
- the contact sheet proves three surface families rather than one relabelled
  shell, and the logo-hidden review can identify the Niuva evidence thread;
- `VISUAL_QA.md` closes every R5 anti-reference row with before/after evidence;
- `ASSET_MANIFEST.md` resolves every rendered visual and no fabricated proof is
  present;
- the visible-string audit proves Indonesian-first Participant Mode, stable CTA
  intent, and no packet/fixture/evaluator language;
- the final detector has no unresolved in-scope finding, and an independent
  expert critique reports 0 P0 and 0 P1 for flow integrity, Participant Mode,
  canonical alignment, accessibility, and visual craft;
- no real endpoint/provider or production import is observed; and
- the handover lists changed files, unchanged source areas, checks, evidence,
  open gates, and cleanup/retention steps.

The next expert critique and any moderated human session remain separate gates.
The prototype must not be promoted to canonical documentation or merged into
the application without explicit approval.

A visually improved screenshot does not waive flow, ownership, commitment,
privacy, or activation assertions. Likewise, green contract tests do not waive
the visual-craft and Participant Mode acceptance criteria.

## 9. Authorization boundaries

This task card authorizes planning only. Separate approvals are required for:

- creating the prototype files or worktree;
- committing, pushing, opening, marking ready, or merging a PR;
- modifying production source, tests, APIs, schemas, migrations, or providers;
- activating authentication, storage, calculation, checkout, payment,
  fulfillment, notifications, or WhatsApp integrations;
- running a moderated customer/operator session;
- canonical promotion, deployment, production-readiness, or go-live.
