# Expert UX/UI, Visual Quality, User Flow, and Validation-Tool Review

Method: dual-agent (A: `/root/impeccable_assessment_a` · B: `/root/impeccable_assessment_b`)

Review artifact status: **initial findings preserved; remediation record
preserved; formal expert critique rerun failed**

Date: 31 July 2026
Target: Niuva MVP clickable customer/operator prototype
Scope: initial expert review plus bounded remediation record; no participant evidence and no production-readiness claim
Initial verdict: **NOT READY for route-promotion moderated sessions**
Current gate: **NOT READY — latest formal rerun found two corroborated P1 research-validity blockers**

The historical post-remediation decision is recorded in
[`FORMAL_EXPERT_CRITIQUE_RERUN.md`](./FORMAL_EXPERT_CRITIQUE_RERUN.md). The
latest current gate is recorded in
[`FORMAL_EXPERT_CRITIQUE_RERUN_2.md`](./FORMAL_EXPERT_CRITIQUE_RERUN_2.md).
The initial score and findings below remain historical evidence and must not be
read as the current gate result.

## Design Health Score

| # | Heuristic | Score | Key issue |
| --- | --- | ---: | --- |
| 1 | Visibility of System Status | 3 | Notices, milestones, stale/expired/conflict states are strong; configurator stepper remains stale after price calculation and reservation has no running countdown |
| 2 | Match System / Real World | 2 | Customer surfaces expose `quote_required`, provider-neutral, irreversible work, remedy, customer-safe, and route-governance language |
| 3 | User Control and Freedom | 2 | Cart lacks edit/remove/quantity actions; checkout and after-sales forms have incomplete safe exits |
| 4 | Consistency and Standards | 2 | Tokens are cohesive, but canonical public route names, terminology, and flow state are inconsistent |
| 5 | Error Prevention | 3 | Invalid, stale, expired, and conflict states fail safely; complaint lifecycle/evidence does not match the rendered outcome |
| 6 | Recognition Rather Than Recall | 3 | Status, context, summaries, and identifiers are visible; evaluator controls compete with product navigation |
| 7 | Flexibility and Efficiency | 1 | Admin lacks search, filters, bulk actions, recent context, and accelerators; mobile commerce requires long scrolling |
| 8 | Aesthetic and Minimalist Design | 2 | Calm palette and typography are coherent, but evaluator chrome, governance copy, card repetition, and spacing add noise |
| 9 | Error Recovery | 3 | Recovery copy is generally actionable; refresh resets important simulated task state |
| 10 | Help and Documentation | 2 | Inline guidance exists, but domain jargon is not explained and some guidance describes governance instead of user decisions |
| **Total** | | **23/40** | **Acceptable foundation; significant fixes required before participant evidence can be trusted** |

## Design Specificity Verdict

**Product-specific core, category-generic shell.**

The prototype is distinctly Niuva where it uses FDM layer language, STL/3MF
handling, slicer weight/time pricing, `quote_required`, production milestones,
and operator/manager/Finance separation. Those elements could not be moved
unchanged into ordinary commerce.

Specificity weakens in cart, checkout, and operational detail. Rounded white
cards, pale-blue notices, abstract product placeholders, oversized headings,
and repeated status chips are category-interchangeable. Participant-facing
evaluator chrome becomes more visually dominant than the customer journey.

### Deterministic scan

Impeccable detector ran once and returned exit code `2` with exactly three
`side-tab` warnings in `styles.css`:

- line 925, `.progress-rail`: contextual false positive; this is a semantic
  status rail;
- line 1029, active Admin navigation: false positive; this is current-location
  feedback;
- line 1071, `.next-action`: confirmed visually; four Admin next-action cards
  repeat the side-tab treatment and weaken differentiation.

The detector did not identify the higher-impact flow and research-validity
issues. Those required source, browser, and authority review.

### Visual overlay

Mutable browser injection succeeded, but the detector overlay script was
blocked by the prototype CSP (`script-src 'self'`). Therefore no reliable
user-visible Impeccable overlay exists. Browser screenshots, DOM snapshots,
console checks, and geometry probes were used instead.

## Overall Impression

The prototype has a credible visual foundation and unusually good recovery-state
coverage. Its strongest moment is the Custom Print price calculation: technical
complexity becomes an understandable weight/material/machine-time decision.

The biggest opportunity is not decorative polish. It is separating the
participant experience from the evaluator experience and making simulated state
truthful across the complete task. Until that happens, the prototype can teach
participants the expected answer or show the wrong commercial object, producing
misleading research evidence.

## Remediation Record

Remediation was authorized on 31 July 2026 for the recommended priority
**Flow integrity + Participant Mode + canonical alignment** and all `P0`/`P1`
findings. The original score and observations above remain the pre-remediation
baseline; they are not silently rewritten.

| Finding | Remediation | Bounded evidence |
| --- | --- | --- |
| P0 transactional state fidelity | Cart lines now come from the selected Ready/Custom action; mixed cart, auth continuation, cancellation, and case state persist in tab-scoped `sessionStorage` | Custom Print remained `model-v7.stl` at `Rp71.950` after add-to-cart and reload; cancellation retained `Permintaan tercatat` after reload; mixed cart retained both lines |
| P1 evaluator chrome | Participant Mode is default and shows only a compact simulation notice; scenario, surface, route, and reset controls live in `?mode=moderator` | Browser snapshot confirmed no moderator panel, route tag, scenario selector, or governance copy in Participant Mode |
| P1 authority fidelity | Public navigation now uses `/capabilities` and `/contact`; `/services` and `/portfolio` simulate compatibility redirects; official `ni` asset is reused byte-identically | `/services?mode=moderator` resolved to `/capabilities?mode=moderator`; brand asset loaded at its intrinsic `738 × 741` size |
| P1 after-sales lifecycle/evidence | Complaint intake is unavailable before recorded receipt; `Produk diterima` opens intake; optional private photo/video input stores count only; customer/Admin views render only submitted evidence | Printing-state deep link failed closed; a zero-evidence submission showed “tidak ada foto atau video” on both customer and Admin views |
| P1 mobile commercial actions | Participant chrome is compact and Ready Product, calculated Custom Print, cart, and checkout use a fixed bottom summary/CTA at 390 px | At `390 × 844`, action bar occupied `y=760..844`; document had no horizontal overflow and participant chrome ended around `y=109` |

The Impeccable detector rerun after remediation returned `[]` with exit code
`0`. JavaScript syntax, the 29-scenario matrix, console, approved mark request,
canonical alias, refresh persistence, lifecycle gate, and representative
desktop/mobile geometry passed. This is implementation/revalidation evidence,
not a new independent heuristic score.

## What Is Working

1. **FDM-specific commercial transparency.** The configurator separates safe
   automatic calculation from Assisted Retail Offer routing and shows a legible
   price breakdown.
2. **Status and recovery architecture.** Invalid file, stale checkout,
   reservation expiry, conflict, ETA change, access denial, and email retry are
   explicit without fake percentage progress.
3. **Admin task framing.** The dashboard prioritizes concrete next actions;
   order and case detail distinguish customer-facing information, internal
   context, manager approval, and Finance execution.

## Cognitive Load

Result: **high cognitive load, 6/8 checklist failures**.

| Criterion | Result | Evidence |
| --- | --- | --- |
| Single focus | Fail | Scenario selector, surface switch, route path, route status, and governance prose compete with the task |
| Chunking | Fail | The global selector exposes 28 states and the order timeline shows eight equal-weight milestones |
| Grouping | Pass | Forms, summaries, notices, timelines, and operational context use clear grouping |
| Visual hierarchy | Fail | Strong headings are offset by about 235 px of evaluator/header chrome on 390 px |
| One thing at a time | Fail | Participants must interpret prototype governance while making commercial or after-sales decisions |
| Minimal choices | Fail | Twenty-eight scenario options; customer and Admin navigation also exceed four visible choices |
| Working memory | Pass | Order, file, material, ETA, price, fulfillment, and context are generally repeated near decisions |
| Progressive disclosure | Fail | Moderator tools and route-governance copy are always visible |

Decision points above the four-item working-memory guideline:

- global scenario dropdown: 28 options;
- customer desktop header: five public destinations plus scenario/surface
  controls;
- Admin desktop: seven sidebar destinations plus partially duplicated header
  navigation;
- Detailed configurator: multiple configuration, upload, and slicing choices in
  one current-step surface.

## Emotional Journey

- **Opening:** technically credible, but the full-width simulation banner,
  scenario control, and route bar interrupt the Niuva impression.
- **Peak:** the calculated-price state is clear, transparent, and action-oriented.
- **Valley:** cart and checkout. Governance prose replaces reassurance,
  correction controls are absent, and mobile CTA placement creates long scroll.
- **Recovery:** factual tracking and ETA restore confidence.
- **After-sales ending:** calm status and next action are present, but the case
  claims evidence that the intake never collected, reducing trust.

The Admin journey opens strongly with ranked work. Its best moment is the
operator → manager → Finance separation. It ends clearly but lacks the
high-volume tools an experienced operator would expect.

## Priority Issues

### P0 — Transactional state fidelity is broken

- **Where:** Custom Print → `/retail/cart`; mixed cart refresh; cancellation
  submission and refresh.
- **Evidence:** Browser verification started from a calculated Custom Print,
  clicked **Tambahkan ke keranjang**, and landed on `/retail/cart` showing
  **Keychain Layer**, no `model-v7.stl`, and `Rp45.000`. Cancellation showed
  **Permintaan tercatat** before refresh and lost it after refresh.
- **Why it matters:** The core Custom Print task becomes the wrong product, and
  durable cart/cancellation behavior cannot be validated. This can produce
  false participant findings.
- **Fix:** Replace scenario-derived rendering with an explicit prototype state
  model for cart lines, auth continuation, cancellation request, and case
  status. Persist safe mock state across refresh or encode deterministic fixture
  state in moderator-controlled session URLs.
- **Suggested command:** `$impeccable harden`

### P1 — Evaluator chrome contaminates participant behavior

- **Where:** Every route: scenario selector, surface switch, route path,
  canonical/candidate badge, and route-promotion prose.
- **Why it matters:** It exposes the research hypothesis, teaches participants
  the intended classification, and pushes task content roughly 235 px down on
  mobile.
- **Fix:** Add separate moderator and participant modes. Participant mode keeps
  only a compact “simulasi—tidak ada transaksi nyata” notice. Moderator controls
  belong in a hidden drawer or separate controller.
- **Suggested command:** `$impeccable distill`

### P1 — Authority fidelity is incorrect

- **Where:** Public navigation/route tagging and brand mark.
- **Evidence:** Prototype treats `/services` as content-owning/canonical and
  uses `/contacts`; `DEC-UX-003` requires canonical `/capabilities`, a
  `/services` compatibility redirect, and `/contact`. The CSS-constructed mark
  also conflicts with `DESIGN.md`, which requires the approved lowercase
  `ni` asset rather than an alternative letterform.
- **Why it matters:** Participants learn the wrong IA and visual identity, so
  route and brand evidence cannot support canonical decisions.
- **Fix:** Align navigation and aliases with `DEC-UX-003`, remove duplicate
  `/services` content ownership, and use the approved Niuva mark.
- **Suggested command:** `$impeccable shape`

### P1 — After-sales lifecycle and evidence are contradictory

- **Where:** `/orders/NV-DEMO-014`,
  `/orders/NV-DEMO-014/complaints/new`, customer case detail, and Admin case
  detail.
- **Evidence:** A Printing order exposes complaint intake; intake provides issue
  type and text only, while the resulting case says photo evidence exists and
  Admin says two photos are available.
- **Why it matters:** The prototype promises evidence it never collected and
  blurs cancellation-before/after-work with complaint-after-receipt.
- **Fix:** Gate actions using factual lifecycle fixtures, show why an action is
  unavailable, add an optional private photo/video evidence control with
  format/size/privacy guidance, and render only submitted evidence.
- **Suggested command:** `$impeccable harden`

### P1 — Mobile commercial actions are buried

- **Where:** 390 px Retail catalog, cart, and checkout.
- **Evidence:** Product CTA began around y=1117, cart CTA around y=1078, and
  payment CTA around y=1943 during visual measurement.
- **Why it matters:** The next action is absent from the first viewport during
  the highest-intent stages. Interrupted mobile participants may abandon or
  misreport discoverability.
- **Fix:** Compact participant header and progress UI, reduce oversized vertical
  hierarchy, and add a non-obscuring sticky bottom summary/CTA for cart and
  checkout.
- **Suggested command:** `$impeccable adapt`

## Persona Red Flags

### Jordan — Confused first-timer

- `quote_required`, provider-neutral, irreversible work, remedy, and
  customer-safe require domain translation.
- Candidate-route prose and the scenario selector look like product
  navigation.
- Contextual explanations focus on governance rather than the customer's
  decision.

### Riley — Deliberate stress tester

- Custom Print changes into a Ready Product in cart.
- Cancellation state disappears after refresh.
- Complaint intake cannot collect evidence later claimed by case views.
- Configurator progress remains on File & Configuration after price is ready.

### Casey — Distracted mobile customer

- Evaluator/header chrome consumes the top of the screen.
- Product, cart, and payment CTAs require long scrolling.
- Refresh and interruption lose important simulated state.
- Touch targets and horizontal fit are good, but continuation fidelity is weak.

### Alex — Admin power user

- No search, filters, batch work, queue shortcuts, or recent-context switcher.
- Header navigation duplicates much of the sidebar.
- Simulation controls share visual priority with operational controls.

### Sam — Accessibility-dependent user

- Positive: skip link, semantic landmarks, labels, live region, visible focus,
  text labels, and 44 px targets.
- Risk: public active navigation lacks consistent `aria-current`; stepper state
  leans on CSS styling; full `innerHTML` rerenders may destroy focus after
  dynamic actions.

## Validation-Tool Readiness

| Gate | Result | Reason |
| --- | --- | --- |
| Canonical scope alignment | **Fail** | Public route and mark contradict current authority |
| Customer task coverage | **Pass** | Ready, Custom, quote, checkout, tracking, and after-sales scenarios exist |
| Core flow integrity | **Fail** | Custom cart identity is wrong |
| Durable state simulation | **Fail** | Mixed cart/cancellation state is lost on refresh |
| Participant neutrality | **Fail** | Moderator controls and route hypothesis are visible |
| UI/accessibility baseline | **Partial pass** | No overflow, clipping, console errors, or sub-44 px targets in sampled views; AT/device coverage remains open |
| Visual/content fidelity | **Partial** | Coherent system, but placeholder products, unofficial mark, and governance copy limit realism |
| Moderator repeatability | **Partial pass** | Scenario fixtures are easy to select but not isolated from participants |
| Observation traceability | **Pass** | Moderated plan, task IDs, severity, and per-route scorecards are ready |

**Readiness decision:** use for internal walkthrough only. Fix all P0/P1
validation blockers and rerun expert critique before involving participants in
a route-promotion study.

## Minor Observations

- Cart lacks edit, remove, quantity, and continue-shopping controls; checkout
  lacks an explicit return to cart.
- Cancellation and complaint forms need visible Batal/Kembali ke Order actions.
- Product shapes are abstract placeholders and cannot validate product
  desirability, print finish, scale, or merchandise trust.
- Poppins and Inter are declared but not packaged, so visual identity depends on
  fonts installed on the review device.
- Customer copy mixes Indonesian with Fulfillment, Live estimate, tracking,
  offer, remedy, Finance, and customer-safe.
- Eight full timeline rows create unnecessary mobile length; completed stages
  could collapse behind a history disclosure.
- Repeated side-tab next-action cards are the one meaningful detector/browser
  agreement; the progress rail and active navigation warnings are contextual
  false positives.

## Questions to Consider

- What would a participant understand if route badges, scenario selector, and
  governance sentences disappeared?
- Should the FDM layer rail become the functional grammar of price formation,
  production progress, and approval handoff rather than mainly a motif?
- Which three facts must remain visible above the fold before a cautious
  customer pays?
- If the operator has 40 active Orders rather than three demo rows, how do they
  reach the right record in under 30 seconds?

## Evidence Boundaries

- Design review used fresh Chrome inspection at desktop 1440×1000 and mobile
  390×844 across public, Retail, cart, checkout, tracking, after-sales, and
  Admin routes.
- Detector/browser pass inspected five representative views. It found no
  document overflow, visible clipping, console warning/error, or visible target
  below 44 px.
- Mutable overlay preflight worked, but CSP blocked the cross-origin detector
  script; no user-visible overlay is claimed.
- This expert review cannot establish participant comprehension, screen-reader
  output, real-device font fidelity, backend persistence, authorization,
  production readiness, or go-live status.
