# Candidate Niuva UX/UI Reconciliation Packet

**Status:** Candidate — owner approved reconciliation direction; not canonical,
not implementation authority, and not readiness evidence

**Date:** 14 August 2026

**Repository baseline:** `origin/main`
`15b759a02b036330f1dd0913611043e0fd6134e2`

**Purpose:** Reconcile four owner-supplied UX/UI documents into one bounded
candidate contract. The packet closes lifecycle, route, and state ambiguity
first; visual and motion recommendations are accepted only after those
boundaries; project evidence uses real, attributable assets or an honest
text-only placeholder.

**Owner decision:** UXR-01 through UXR-22 are approved as candidate
reconciliation direction on 14 August 2026. Publication, canonical promotion,
implementation, and all delivery gates remain separate.

This packet does not amend canonical authority. It does not authorize source,
dependency, route, redirect, CMS, API, schema, provider, migration,
deployment, readiness, or go-live work.

## 1. Executive disposition

The four source documents remain **owner-held external inputs**, identified by
filename and SHA-256. This packet is the durable, self-contained reconciled
candidate record of their reviewed recommendations. The raw files are neither
repository authority nor prerequisites for interpreting this packet, and
publication of this packet would not publish or archive them. They must not be
treated as four parallel implementation instructions.

The reconciliation order is:

1. preserve Public, B2B, Retail, Account, and Operations lifecycle boundaries;
2. resolve canonical route, locale, and compatibility ownership;
3. define complete visible, recovery, and uncertain state contracts;
4. refine Public composition, typography, color, and component treatment;
5. adopt a bounded Niuva motion grammar; and
6. admit project evidence only when its provenance and factual claims are
   reviewable.

The result is a candidate planning source, not a new design system. The Master
Specification, approved decisions, and `DESIGN.md` remain authoritative.

## 2. Authority and precedence

### 2.1 Reading order

When this packet conflicts with another source, use this order:

1. [`NIUVA_MASTER_SPEC.md`](../../../NIUVA_MASTER_SPEC.md)
2. [`DOCUMENT_REGISTER.md`](../../../context/DOCUMENT_REGISTER.md)
3. [`DECISION_REGISTER.md`](../../../decisions/DECISION_REGISTER.md)
4. The approved decision or ADR applicable to the task
5. [`DESIGN.md`](../../../../DESIGN.md) within its approved scope
6. The applicable runbook
7. Current source and tests as implementation evidence
8. This packet
9. The four raw source documents

The primary applicable decisions are:

- [`DEC-UX-003`](../../../decisions/experience/DEC-UX-003-mvp-user-flow-and-route-contract.md)
  for Public routes, locale behavior, B2B intake, and route ownership;
- [`DEC-UX-004`](../../../decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md)
  for NDS 2.0, four equal Services, surface registers, component/state
  contracts, and motion;
- [`DEC-OFFER-01`](../../../decisions/product/DEC-OFFER-01-retail-offer-file-and-quote-routing.md)
  for Retail configuration, file eligibility, `quote_required`, and Assisted
  Retail Offer boundaries; and
- [`DEC-RT-02`](../../../decisions/product/DEC-RT-02-retail-account-required-checkout.md)
  for public versus authenticated Retail capability and ownership.

### 2.2 Maturity rule

This packet may:

- consolidate compatible candidate recommendations;
- reject or amend recommendations that conflict with authority;
- expose missing lifecycle, route, state, content, accessibility, or evidence
  requirements; and
- serve as input to a later exact-file task card.

This packet may not:

- promote itself or any source document to canonical status;
- activate a reserved route, provider, upload, registration, checkout, or
  project-detail capability;
- replace backend authorization or domain state machines with UI behavior;
- infer implementation completion from file existence or green checks; or
- create a publication, commit, push, PR, merge, deployment, readiness, or
  go-live approval.

## 3. Source inventory and provenance

The owner supplied four external Markdown documents on 14 August 2026. Their
filenames and hashes identify the exact revisions reviewed. They remain
owner-held external provenance; local filesystem locations are not part of the
repository contract. This packet records the material adopted, amended,
rejected, and deferred recommendations self-sufficiently. Publishing this
packet would not archive or publish the raw inputs.

<!-- markdownlint-disable MD013 -->

| Source | SHA-256 | Reconciled role | Result |
| --- | --- | --- | --- |
| `niuva-ui-component-spec.md` | `696CCEAFEA1E57FD618213448AA06F9CCCD31FD8DB32F1E4B01367D59879F75B` | Component and interaction proposal | Adopt selectively; amend to NDS component contract; reject conflicting typography, shadow, upload, and dependency assumptions. |
| `niuva-wireframe-proposal.md` | `F281A5A37BA1E8859D66304598D5261E1FDDB19E26521CDDF3A979D9FC56654A` | Public/Homepage composition proposal | Adopt compatible information architecture; amend route, locale, B2B form, Rental, and evidence claims. |
| `niuva-uiux-audit.md` | `BB4F61519F0FCC1731BEB3318F77F39BA43D142D8235D491B5A3F0D0CF6C0A7A` | Qualitative critique and hypotheses | Retain as critique input; scores and severity are not validation evidence or closure. |
| `Rancangan Interaksi, State Transition, dan Animasi Niuva.md` | `0A62EADF22493A8E13EFF4EEEE63DE278D336A0209ACF38196C7DD89B426A2B9` | Motion and state proposal | Adopt bounded feedback grammar; amend contour, reduced-motion, persistence, shadow, and dependency clauses. |

<!-- markdownlint-enable MD013 -->

If any source changes, its hash changes and the reconciliation must identify
the new revision rather than silently treating it as the reviewed input.

## 4. Lifecycle contract — resolved first

### 4.1 Surface and lifecycle boundaries

<!-- markdownlint-disable MD013 -->

| Surface | Primary job | Durable lifecycle owner | Allowed candidate UI responsibility | Must not imply |
| --- | --- | --- | --- | --- |
| Public | Persuade, prove, explain, route | Public content and B2B Inquiry entry | Positioning, four equal Services, factual project evidence, Public route selection, form-first inquiry | Retail Order, private upload, quotation, reservation, payment, unverified production capacity, or an automatic production commitment |
| B2B intake | Capture a structured business need without login | Inquiry | Validate fields, preserve safe draft values, persist `new`, acknowledge UUID, offer optional user-clicked WhatsApp | Automatic WhatsApp, public raw-file upload, Quote/Project creation, price, ETA, or delivery guarantee |
| Commerce/Retail | Discover, configure, and transact safely where authorized | Retail Request, Assisted Retail Offer, Retail Order | Show eligibility, account boundary, safe configuration, `quote_required`, context handoff, and owned next action | Guest checkout, approximate final promise after failure, Order/reservation/payment before authority |
| Account | Authenticate, recover, and act on owned records | Customer/session and owned resources | Identity, privacy, recovery, owned Order/Request/Offer state | Public campaign layout, Admin authority, Google or `/register` activation without separate approval |
| Operations | Process queues and resolve state | Domain-owned operational records | Role-aware queues, permission, conflict, history, recovery, audit-safe presentation | Route visibility as authorization, Public conversion motifs, invented KPI or broad audit access |

<!-- markdownlint-enable MD013 -->

Shared tokens and primitives do not merge these lifecycles. A shared button,
panel, or status presentation never becomes authority for an Inquiry, Retail
Request, Offer, Order, payment, or operational transition.

### 4.2 Public B2B Inquiry contract

The candidate Public contact experience must represent this approved flow:

```text
/kontak#form-konsultasi or /en/contact#form-konsultasi
  -> public form without login
  -> client validation without losing entered values
  -> persistence attempt
  -> Inquiry persisted with status `new`
  -> visible acknowledgement with existing Inquiry UUID
  -> optional user-clicked WhatsApp continuation
  -> manual Niuva Operations triage and follow-up
```

Required form contract:

- `company`;
- `pic_name`;
- `pic_email`;
- required `pic_phone`;
- `need`;
- `timeline`;
- `brief`; and
- the exact approved privacy consent checkbox.

The approved consent wording is:

> Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
> menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
> untuk marketing tanpa persetujuan terpisah.

The form does not include public raw-file upload. If a file is needed later,
an operator requests it through a separately approved private-storage process.

The visible success state states what actually completed: an Inquiry was
persisted, its UUID is the customer reference, and Niuva Operations targets a
first human response within one working day, Monday–Friday 09.00–17.00 WIB,
excluding public holidays. It must not describe that target as a quotation,
price, ETA, delivery, or resolution guarantee.

WhatsApp remains:

- optional;
- initiated by the visitor;
- secondary to the persisted form flow;
- based on the approved destination from public settings; and
- unable to create, update, retry, or prove an Inquiry by itself.

The UI must distinguish validation failure from persistence or dependency
failure. A false success, generic `Sent`, or success that exists only in a
toast/ARIA live region is prohibited.

### 4.3 Retail, account, and `quote_required` contract

Anonymous Retail behavior is limited to public discovery, non-sensitive
configuration, and a non-authoritative local draft. Authentication is required
before private artwork upload, authoritative checkout submission, Order or
payment-attempt creation, reservation, payment, history, file access, and
production tracking.

After authentication, the server revalidates publication, configuration,
price, stock/material, file, ETA, fulfillment, and eligibility. UI state does
not make those values authoritative.

A `quote_required` result:

- describes commitment uncertainty, not a customer type;
- creates no Order, inventory reservation, payment attempt, paid state, or
  checkout total;
- separates from eligible direct-checkout items in a mixed cart;
- preserves account, product/variant, configuration, quantity, file version,
  safe analysis, contact, fulfillment context, and reason codes without
  re-entry;
- provides a stable request reference, safe reason/status, and next action;
  and
- keeps Retail Request, Assisted Retail Offer, Retail Order, and B2B
  Inquiry/Quote/Project as separate resources and lifecycles.

Bulk, partnership, borongan, recurring, organizational, contractual, and
special-fulfillment work may enter B2B after its applicable gates. An
individual or UMKM request that can remain in Retail may receive a private,
versioned Assisted Retail Offer. Accepting an active offer only permits entry
to normal Retail checkout after revalidation; it does not itself create an
Order, reservation, or payment attempt.

Self Service, customer-owned-filament service, printer rental, membership,
bundle/borongan, partnership, and recurring work remain manual
request/reservation/quotation paths until a later decision approves direct
checkout. Candidate copy must not present an inactive provider or reservation
workflow as available automation.

Approved durable state references remain unchanged:

- Inquiry: `new -> reviewed -> contacted -> converted`, with only the
  separately permitted rejection transitions;
- Assisted Retail Offer: `draft -> awaiting_approval -> offered`, followed by
  `accepted`, `declined`, `expired`, or `superseded`; and
- Retail Request, Assisted Retail Offer, Retail Order, and B2B Quote/Project
  remain separate even when the UI carries context between them.

`quote_required`, `validating`, `submitting`, `loading`, and similar view terms
must not be silently promoted into backend lifecycle enums. Exact API/schema
state machines remain separately gated.

### 4.4 Recovery invariants

Across the lifecycle boundaries above:

- invalid input preserves safe user-entered values and moves visible focus to
  an actionable summary or field;
- dependency failure does not add `aria-invalid` to otherwise valid fields;
- refresh, retry, or reauthentication preserves only context allowed by the
  governing decision;
- stale price, offer, file version, fulfillment, or session requires explicit
  revalidation and, where applicable, reconfirmation;
- an uncertain irreversible action reconciles authoritative state before
  exposing a retry that could duplicate effects;
- disabled actions explain why and identify an authorized next step when one
  exists; and
- recovery never fabricates persistence, availability, reservation, payment,
  Order, or provider success.

## 5. Route and localization contract

### 5.1 Canonical Public pairs

<!-- markdownlint-disable MD013 -->

| Responsibility | Indonesian | English |
| --- | --- | --- |
| Homepage | `/` | `/en` |
| Company and approach | `/tentang` | `/en/about` |
| Service overview | `/layanan` | `/en/services` |
| Project archive | `/proyek` | `/en/projects` |
| B2B inquiry and contact | `/kontak` | `/en/contact` |
| Retail entry | `/retail` | `/en/retail` |
| FAQ | `/faq` | `/en/faq` |
| Privacy | `/privasi` | `/en/privacy` |

<!-- markdownlint-enable MD013 -->

The source wireframe's English-first labels are therefore not launch copy.
Indonesian is primary; every activated counterpart must have complete system,
navigation, form, error, privacy, and conversion copy in both languages.

For a complete translated pair, each page uses the correct `lang`, is
self-canonical, references its counterpart reciprocally through `hreflang`,
and enters the applicable sitemap. `x-default` points to the Indonesian route
with the same content responsibility; only the Homepage pair uses `/` for that
role. The selector links the exact counterpart and does not redirect
automatically from IP, browser language, or inferred location.

An English CMS item without an English translation shows Indonesian content
with the visible notice `English translation belum tersedia`, uses
`noindex,follow`, canonicalizes to the same-content Indonesian route, and is
omitted from the English sitemap and `hreflang` set. Automatic machine
translation is not permitted.

### 5.2 Compatibility and reserved paths

The following former paths are compatibility aliases, not independent content
owners:

| Superseded path | Canonical destination |
| --- | --- |
| `/about` | `/tentang` |
| `/capabilities` | `/layanan` |
| `/services` | `/layanan` |
| `/projects` | `/proyek` |
| `/portfolio` | `/proyek` |
| `/contact` | `/kontak` |
| `/privacy` | `/privasi` |
| `/en/capabilities` | `/en/services` |

They require a one-hop HTTP `308` at the selected delivery boundary when that
infrastructure is separately authorized. Application navigation alone does
not prove the HTTP contract.

At the recorded repository baseline, current application source and tests
still encode `/services -> /capabilities` and `/portfolio -> /projects`. That
is implementation drift against `DEC-UX-003`, not an approved intermediate
redirect chain; reconciling it remains a separately authorized exact-file
route task.

The candidate project-detail prefixes `/proyek/:slug` and
`/en/projects/:slug` remain reserved. A project card must not assume a detail
route, sitemap entry, CMS URL, canonical tag, analytics identity, or active
navigation until route ownership is separately activated. Until then it may:

- present its factual evidence in place;
- link to the approved archive; or
- render a non-link action whose unavailable state is explicit.

One explicit stored language preference applies across Public, Retail, Login,
customer, and Admin surfaces. Downstream Retail product, configurator,
Request, Offer, checkout, Order, customer, Login, Admin, and operational routes
remain unprefixed and private/noindex where applicable. On those retained
unprefixed routes, changing language preserves the current canonical URL and
owned-resource context while updating the stored preference and supported
interface copy. It must not invent an `/en` counterpart or return the user to
the Retail entry.

### 5.3 Navigation disposition

The source documents' exact floating pill, link order, mega-menu, drawer,
language placement, and CTA composition remain candidate treatments. Canonical
authority defines route labels and language behavior but explicitly leaves
detailed desktop/mobile navigation separately gated.

Any later navigation task must preserve:

- the official `niuva-mark.svg` plus visible `Niuva` text;
- four Services at one information rank;
- Retail as a clearly discoverable secondary journey;
- a conventional globe plus visible `ID` or `EN` code;
- keyboard navigation, visible focus, Escape, outside-click, and focus return;
- no hidden hover-only destination; and
- exact current-route context when changing language.

## 6. Complete state contract

The following is the minimum reconciliation matrix. It describes visible UX
meaning, not a new backend enum.

<!-- markdownlint-disable MD013 -->

| State | Required visible behavior | Recovery/next action | Prohibited shortcut |
| --- | --- | --- | --- |
| Default/ready | Identity, task, relevant context, and primary action are clear. | Continue the owned task. | Ambiguous decorative shell. |
| Hover | Affordance changes without shifting layout or hiding information. | Pointer can leave without state loss. | Hover-only content or lift on every surface. |
| Focus | Non-color-only focus ring remains unobscured by sticky UI. | Keyboard order and focus return are deterministic. | Removing outline without replacement. |
| Active/pressed | Immediate, bounded feedback confirms input. | Return to stable control state. | Bounce, large scale, or layout movement. |
| Selected/current | Selection and current location are explicit in text/semantics as well as color. | Change selection without losing unrelated work. | Styling selection as a permanent commercial or lifecycle commitment. |
| Disabled | Reason is visible when the action would otherwise be expected. | Show an authorized alternative when one exists. | Silent permanent disabled control. |
| Loading/bootstrap | Skeleton mirrors final hierarchy; task/action loading keeps its label; status is announced. | Cancel only when safe; prevent duplicate submit. | Blank spinner-only page. |
| Empty | Explain why no data exists and what authorized action is available. | Offer the next valid action. | Decorative empty illustration without recovery. |
| Validation error | Summary and field relationship are visible; values are preserved; focus is managed. | Correct and resubmit. | Toast-only, color-only, or generic error. |
| System/dependency error | Distinguish persistence/provider/dependency failure from invalid input. | Preserve safe context and expose bounded retry/fallback. | Marking valid fields invalid or claiming success. |
| Conflict/stale | Show what changed, preserve work, and identify authoritative version. | Reload, compare, or reconfirm safely. | Silent last-write-wins. |
| Permission/forbidden | Explain the unavailable action without exposing protected detail. | Return to an owned resource or request authorized help. | Treating a hidden control or route as authorization. |
| Expired | State what expired: session, offer, reservation, or quote. | Reauthenticate or restart the specific safe step. | Reusing stale authority. |
| Offline/unavailable | State what is unavailable and whether anything was persisted. | Retry only when safe; retain allowed draft context. | Fake success or blind retry loop. |
| Uncertain | Explain that final outcome is not yet known. | Reconcile authoritative state before irreversible retry. | Duplicate payment, Order, reservation, or Inquiry action. |
| Recovery | Return focus and scroll to the recovered task context. | Continue without re-entering permitted context. | Sending the user to an unrelated route or losing work. |
| Success | State exactly what completed, reference, ownership, and what remains. | Provide the next owned action. | Provider/Order/Inquiry success before authority. |

<!-- markdownlint-enable MD013 -->

Important feedback is visible to sighted users and available to assistive
technology. A toast or ARIA live region may reinforce state, but may not be the
only representation of critical failure, conflict, uncertainty, or success.

## 7. Visual reconciliation after contract closure

### 7.1 Adopt

The following source recommendations align with current authority:

- one Unified Homepage with a B2B-primary narrative and a clear Retail route;
- a calm, open, evidence-led Public composition rather than a generic SaaS or
  marketplace template;
- Research & Development, Consultant & Workshop, Design & Prototyping, and
  Apparel & Merchandise as four equal primary Services;
- one dedicated `Need → Research → Experiment → Prototype → Output` process
  rail, vertical on mobile;
- project presentation that exposes context, challenge, method/contribution,
  output, and capability proven without hover-only disclosure;
- a short decision aid near the entry point when it reduces journey ambiguity;
- Mona Sans Variable for digital display/body/UI, with Bona Nova Italic at
  most once as a short Public interruption;
- official `ni` mark plus visible `Niuva` text in primary navigation;
- Niuva blue as scarce, purposeful identity/action/focus support;
- 44px general mobile targets, visible focus, semantic headings/landmarks, and
  content available at 200% zoom; and
- truthful FAQ and Contact expectation-setting.

### 7.2 Amend

The following source recommendations require modification:

- Poppins is not a new fallback or target consumer; use Mona Sans Variable
  with the approved system fallback while legacy fonts remain compatibility
  only.
- Public editorial sections are not forced into repeated 2×2 card grids.
  Equal Service rank is an information and action contract, not a demand for
  one transferable card template.
- Default elevation is flat. Use shadow for an overlay, navigation layer, or
  real depth transition—not ordinary service/evidence cards.
- The hero evidence strip must contain factual evidence, not a second process
  rail or unverified phrases such as `Production direction`.
- Project status, client contribution, output, timing, and capability labels
  require provenance. Unknown fields are omitted or marked honestly.
- Contact must use the complete Inquiry contract and may not advertise an
  optional public attachment.
- Rental/Self Service language must state its manual request/quotation
  boundary until separately activated.
- A response target is phrased as a first human response target, not an SLA,
  quotation, price, ETA, or resolution promise.

### 7.3 Reject or defer

Reject as a baseline:

- generic floating PDF controls as a P0 requirement;
- repeated tiny uppercase eyebrows or decorative section numbering;
- bento or one-card-per-field composition;
- generic gradient, glass, neon, fake metrics, fake telemetry, or stock imagery
  presented as Niuva work;
- unverified numeric scores, `2–3 minutes`, project status, outcomes, or
  operational promises;
- project-detail links whose reserved routes are not active; and
- copying Public campaign composition into Commerce, Account, or Operations.

Defer to separately reviewed experiments:

- shared-element project transitions;
- magnetic CTA behavior;
- pinned process storytelling;
- new image-generation workflows; and
- any new visual or motion runtime dependency.

## 8. Motion reconciliation

### 8.1 Approved candidate grammar

Motion exists to explain affordance, hierarchy, continuity, feedback, or media
state. Candidate timing follows the NDS grammar:

| Token | Duration | Candidate use |
| --- | ---: | --- |
| `motion-instant` | `0ms` | Immediate semantic state change |
| `motion-fast` | `120ms` | Hover, press, icon, color, opacity |
| `motion-standard` | `180ms` | Disclosure, feedback, compact enter/exit |
| `motion-deliberate` | `280ms` | Bounded panel/modal or page-state change |
| `motion-ambient` | `12–18s` | FDM contour cycle only |

The `12–18s` value is the allowed NDS ambient range from `DESIGN.md`, not an
instruction to vary the runtime token. At the recorded repository baseline,
the implementation token remains exactly `15s`, which is within that range.
Any runtime change remains separately gated.

CSS is the default. Bounded existing GSAP use may support a Public signature
choreography only after exact-file review. Canvas/RAF remains progressive
enhancement. No new Framer Motion consumer or other runtime library is implied.

Button, disclosure, form, drawer, and project-media feedback may use small
opacity, color, border, arrow, or 1–3px movement. Avoid `transition: all`,
large text movement, bounce, elastic scale, shake, card tilt, autoplay
carousel, scramble/typewriter delay, decorative progress, or motion-dependent
meaning.

### 8.2 FDM contour and process separation

The FDM contour is a bounded identity gesture at:

1. the Homepage hero boundary; and
2. the terminal closing canvas.

It is not the five-stage process rail, printer telemetry, capacity, production
progress, or an Order state. It must remain complete and meaningful when
static. The process rail may animate its semantic connector once, but must not
be styled or described as a third FDM contour placement.

### 8.3 Reveal and stagger limits

- content exists and is readable before enhancement;
- reveal runs once, never on every scroll reversal;
- a staggered task sequence remains below 500ms total unless a separate
  Public evidence review approves otherwise;
- repeated fade-up on every section is rejected as generic and tiring;
- project image reveal must not delay access to its factual caption/action;
- layout space is reserved to prevent cumulative layout shift; and
- ambient effects pause offscreen or while the document is hidden.

### 8.4 Reduced motion

Reduced motion removes scroll-linked movement, parallax, path morphing, scale,
rotation, magnetic/pointer response, and stagger. It retains:

- complete static content and contour;
- visible focus, validation, conflict, recovery, and success state;
- essential loading/progress feedback; and
- short non-moving color or opacity feedback when useful.

A global rule that forces every animation and transition to `1ms` is rejected
because it can erase meaningful feedback and produce fragile intermediate
states. Reduced behavior is defined per motion contract.

## 9. Project evidence and provenance contract

### 9.1 Admission rule

Only a real, approved asset may be labelled as Niuva project evidence. Before
use, the content owner records at least:

1. evidence identifier;
2. related project/content record, if one exists;
3. repository asset path or controlled source reference;
4. original source and rights/permission basis;
5. owner responsible for factual review;
6. evidence type: project photo, process photo, document capture, final object,
   or test/demonstration;
7. exact factual claim supported by the asset;
8. caption and alternative text;
9. crop/edit/derivative disclosure where relevant;
10. checksum or revision identifier;
11. Indonesian and English content readiness; and
12. last factual review date.

This is a candidate content-review record, not authorization for a new CMS
schema or asset migration.

A supporting or explanatory visual is a separate class, not a project-evidence
type. A conceptual illustration, stock image, or generated visual may be used
only under its applicable rights and workflow approvals, must be labelled
honestly, and may explain a concept. It cannot substantiate a Niuva project,
client, process, capability, output, or outcome claim.

### 9.2 Truthful treatment

- Stock, AI-generated, or conceptual illustration may explain a concept only
  when clearly labelled; it may not be presented as Niuva project evidence.
- A Company Profile image is not automatically approved for digital reuse.
  Ownership, permission, project identity, and claim still require review.
- Do not invent clients, metrics, awards, status, outcomes, methods, dates,
  capabilities, or production facts to fill a layout.
- Do not claim that a final-object photo proves research, testing, or process
  evidence unless the source actually supports that claim.
- A factual caption remains visible; critical provenance is not hover-only.

### 9.3 Missing-asset fallback

When a required asset is unavailable, use a text-led evidence structure rather
than fabricated imagery. Example candidate copy:

> Dokumentasi visual untuk tahap ini belum tersedia. Ringkasan berikut hanya
> memuat fakta project yang telah diverifikasi.

If even the underlying claim is unverified, omit the claim and record the
content gap. A placeholder must never look like a completed client artifact or
production proof.

## 10. Component adoption contract

The component source document is not yet a shared-component handoff. Every
component proposed for adoption must record all NDS minimum fields:

1. name, purpose, owner, and adoption status;
2. when to use and not use;
3. anatomy and required/optional elements;
4. variants, sizes, and content limits;
5. props/API continuity or breaking change;
6. applicable interaction and data states;
7. mouse, keyboard, touch, focus, and screen-reader behavior;
8. responsive and overflow behavior;
9. token dependencies;
10. localization and long-content behavior;
11. surface/domain restrictions;
12. anti-patterns; and
13. migration/deprecation notes.

Public-only compositions such as evidence walls, expressive Bona interruption,
FDM identity fields, and campaign decision aids must declare
`surface: Public`. Commerce, Account, and Operations receive their own
surface/domain compositions and lifecycle-owned status contracts.

Existing shared APIs remain compatible unless a separately approved task
documents migration and rollback. The quarantined Drawer does not become
adopted merely because a source document recommends a focus trap; its
undeclared `vaul` boundary still requires separate resolution.

## 11. Responsive, accessibility, localization, and performance evidence

A later implementation or prototype claim requires evidence at:

- 320px resilience floor;
- 390px mobile design baseline;
- 768px intermediate/tablet;
- 1024px compact desktop/laptop; and
- 1440px representative wide desktop.

Minimum checks include:

- no unintended horizontal overflow or lost critical action;
- normal-text contrast at least 4.5:1 and large text at least 3:1;
- meaningful control/focus boundary at least 3:1;
- mobile body text at least 16px;
- 44 × 44px general mobile interaction target;
- approximately 65–75 characters for prose where appropriate;
- semantic landmarks, heading order, labels, names, roles, values, and status;
- visible, unobscured focus and deterministic focus return;
- 200% zoom/reflow without task or action loss;
- Indonesian and English long-content checks;
- information and state independent of color, icon, hover, or animation;
- `prefers-reduced-motion` behavior; and
- measured need, bundle/runtime impact, license, owner, and removal plan before
  any external runtime component is introduced.

The four source documents contain useful intent but do not supply this full
evidence matrix. Their claims therefore remain candidate requirements, not
runtime proof.

## 12. Source-by-source disposition

### 12.1 UI component specification

**Adopt:** semantic tokens, equal Service rank, 44px controls, visible focus,
keyboard/touch parity, information not hidden behind hover, and complete
control feedback intent.

**Amend:** replace Poppins fallback guidance, remove ordinary card shadows,
complete the 13-field component contract, bind all lifecycle states, add
surface restrictions, use the canonical Contact fields, and mark manual Retail
paths honestly.

**Reject:** public raw attachment, generic elevation, floating PDF as P0,
unclassified dependency adoption, and component existence as adoption proof.

### 12.2 Wireframe proposal

**Adopt:** B2B-primary/Retail-secondary hierarchy, decision aid, four equal
Services, one process rail with vertical mobile treatment, project mini-case
evidence, semantic FAQ, and clear Contact expectation.

**Amend:** localize Indonesian first, treat exact navigation as candidate,
replace the partial Contact form, remove unverified timing/status claims, mark
Rental/Self Service manual, and prevent the hero evidence strip from becoming
a second process rail.

**Reject/defer:** active project-detail assumptions, floating PDF requirement,
English-first launch, repeated card-template rhythm, and any unverified project
or operational claim.

### 12.3 UI/UX audit

**Adopt:** its concerns about decision clarity, evidence depth, service
hierarchy, PDF interruption, and mobile/accessibility verification as review
hypotheses.

**Amend:** replace unsupported numeric scores and P0 labels with reproducible
route/SHA/viewport/browser/assistive-technology evidence and lifecycle-aware
severity.

**Reject:** treating qualitative screenshot review as audit closure, using an
unverified project `status`, or treating visual polish as a task-blocking P0
without demonstrated impact.

### 12.4 Interaction, state, and animation proposal

**Adopt:** 120/180/280ms feedback grammar, contextual loading labels,
keyboard/focus parity, no `transition: all`, no hover-only content, bounded
project-media feedback, and restrained anti-pattern list.

**Amend:** use two approved contour placements, keep the process rail semantic,
map success to durable authority, define recovery/uncertain/offline states,
keep surfaces flat-first, limit Public choreography, and classify every
external dependency.

**Reject/defer:** global 1ms reduced-motion reset, ordinary card shadow,
motion on every section, broad 600–800ms choreography as a shared default,
magnetic CTA, shared-element transition, and pinned scroll without separate
evidence and approval.

## 13. Candidate decision record

The packet records the following candidate reconciliation decisions:

<!-- markdownlint-disable MD013 -->

| ID | Candidate decision | Status |
| --- | --- | --- |
| `UXR-01` | Treat the four supplied documents as owner-held external inputs and use this packet as the durable, self-contained, sole reconciled candidate interpretation of those four reviewed revisions. | Owner-approved candidate |
| `UXR-02` | Lifecycle, route, and state authority precede visual and motion preference. | Owner-approved candidate |
| `UXR-03` | Public, B2B, Retail, Account, and Operations retain separate lifecycle ownership. | Owner-approved restatement of canonical authority |
| `UXR-04` | Public B2B intake is form-first, persists `new`, acknowledges the existing Inquiry UUID, and only then offers optional user-clicked WhatsApp. | Owner-approved restatement of canonical authority |
| `UXR-05` | Public raw-file upload remains excluded; optional attachment recommendations are rejected. | Owner-approved restatement of canonical authority |
| `UXR-06` | `quote_required` preserves context without creating an Order, reservation, payment attempt, paid state, or checkout total. | Owner-approved restatement of canonical authority |
| `UXR-07` | Account authentication precedes private upload and authoritative Retail checkout. | Owner-approved restatement of canonical authority |
| `UXR-08` | Manual service, Rental, Self Service, membership, and similar paths are not presented as activated direct checkout. | Owner-approved restatement of canonical authority |
| `UXR-09` | Canonical Public route and locale pairs follow `DEC-UX-003`; project-detail prefixes remain reserved. | Owner-approved restatement of canonical authority |
| `UXR-10` | Exact navigation composition remains separately gated; the source wireframe is candidate treatment only. | Owner-approved candidate |
| `UXR-11` | The complete cross-surface state matrix in Section 6 is required before implementation-ready status. | Owner-approved candidate |
| `UXR-12` | Four Services retain equal information, visual rank, and default detail action without forcing a repeated card grid. | Owner-approved restatement of canonical authority |
| `UXR-13` | Public composition remains evidence-led, B2B-primary, Retail-secondary, anti-template, and surface-specific. | Owner-approved restatement of canonical authority |
| `UXR-14` | FDM contour remains a two-placement identity gesture; the five-stage process rail remains separate. | Owner-approved restatement of canonical authority |
| `UXR-15` | Motion uses the NDS timing grammar, CSS-first delivery, purposeful feedback, and bounded Public expression. | Owner-approved candidate within NDS authority |
| `UXR-16` | Reduced motion is defined per contract and preserves essential feedback; a global 1ms reset is rejected. | Owner-approved restatement of canonical authority |
| `UXR-17` | No new runtime component or motion dependency is approved by this packet. | Owner-approved candidate |
| `UXR-18` | Project evidence requires real assets, provenance, factual captions, and reviewable claims. | Owner-approved restatement of canonical authority |
| `UXR-19` | Supporting conceptual, stock, or generated imagery is labelled separately and never treated as project evidence; missing assets use honest text-led placeholders. | Owner-approved candidate within truth guardrail |
| `UXR-20` | Components require the 13-field NDS adoption contract and explicit surface/domain restrictions. | Owner-approved restatement of canonical authority |
| `UXR-21` | A later bounded implementation or prototype validation claim requires the full responsive, accessibility, localization, lifecycle, and browser evidence matrix. | Owner-approved candidate within NDS authority |
| `UXR-22` | Publication, canonical promotion, implementation, dependency, route activation, deployment, readiness, and go-live remain separate gates. | Owner-approved candidate |

<!-- markdownlint-enable MD013 -->

## 14. Acceptance criteria for this packet

This candidate reconciliation is complete only when:

- owner approval of UXR-01 through UXR-22 as candidate direction is recorded;
- all four owner-held external source documents and their exact hashes are
  listed, and the self-contained provenance boundary is explicit;
- every material recommendation has an adopt, amend, reject, or defer
  disposition;
- Public/B2B/Retail/Account/Operations boundaries are explicit;
- B2B Inquiry fields, persistence, UUID, consent, response target, WhatsApp,
  and no-public-upload rules are present;
- Retail account, `quote_required`, mixed-cart, Assisted Offer, and manual-path
  boundaries are present;
- canonical localized routes, aliases, reserved project-detail paths, the
  exact missing-English notice, global language-preference scope, and
  detailed-navigation gate are present;
- the complete visible/recovery state matrix is present;
- visual refinement follows four equal Services and anti-template rules;
- motion separates contour identity from process, preserves reduced-motion
  feedback, and approves no new dependency;
- project evidence is distinct from supporting or explanatory visuals, and
  evidence provenance plus the honest missing-asset fallback are explicit;
- component adoption uses the NDS minimum contract;
- responsive, accessibility, localization, and performance floors are listed
  as requirements for a later bounded validation claim, not readiness
  evidence; and
- no source, implementation, publication, activation, readiness, or go-live
  authority is implied.

## 15. Next gated sequence

With owner approval recorded, the next steps remain separate:

1. publication authorization for this one documentation file;
2. optional canonical amendment review only for clauses not already governed
   by current authority;
3. exact-file task cards derived from approved, currently implemented surface
   scope;
4. implementation in one owned worktree per slice;
5. proportional tests, Impeccable detector, browser interaction, screenshot
   critique, and P0/P1 closure; and
6. separate commit, push, PR, merge, deployment, readiness, and go-live gates.

The lifecycle/route/state contract must not be reopened merely to make a visual
pattern easier to implement. Visual and motion refinements remain replaceable
inside the approved product and state boundaries.

## 16. Explicit exclusions

This packet does not authorize or claim:

- production source, dependency, framework, font, route, redirect, sitemap,
  indexing, or CMS changes;
- API, schema, database, migration, storage, upload, payment, fulfillment,
  reservation, production, notification, or provider activation;
- `/register`, Google Identity/OAuth/OIDC, project-detail route, Retail direct
  checkout, Rental/Self Service automation, or B2B portal activation;
- roles, permissions, sessions, identity linking, or customer projection
  changes;
- content migration or approval of any specific project asset;
- commit, push, PR, merge, deployment, readiness, moderated session, or
  go-live; or
- repository archival or publication of the four owner-held external source
  documents, or deletion of existing prototypes, compatibility aliases,
  components, dependencies, or historical evidence.
