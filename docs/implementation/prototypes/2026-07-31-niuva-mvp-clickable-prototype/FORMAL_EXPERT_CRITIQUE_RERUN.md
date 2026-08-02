# Formal Expert Critique Rerun — Niuva MVP Prototype

Method: dual-agent (A: `/root/formal_critique_a` · B: `/root/formal_critique_b`)

Date: 31 July 2026
Target: Niuva MVP clickable customer/operator prototype
Scope: post-remediation expert critique; no human-participant, application,
production-readiness, route-promotion, or go-live evidence
Gate verdict: **FAIL — NOT READY TO RUN MODERATED SESSIONS**
Current route recommendation: **INSUFFICIENT_EVIDENCE**

## Executive Decision

The earlier P0 involving cart and refresh state is no longer reproduced, and
the prototype is materially stronger in Participant/Moderator separation,
canonical aliases, mobile reachability, persistence, lifecycle gating, and
browser stability. The formal gate nevertheless fails because five open P1
issues can still teach participants an incorrect transaction, allow a false
success, encourage a duplicate complaint, collapse operator/manager authority,
or expose scenario controls in Participant Mode.

No moderated customer or operator session may begin from this artifact. This
critique does not authorize remediation. After separately authorized fixes,
all five P1 findings require focused browser revalidation and another formal
expert critique before the plan can become `READY TO RUN`.

## Design Health Score

Assessment A scored the rendered experience independently of detector output.

| # | Heuristic | Score | Key evidence |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3 | Milestones, reservation, cancellation, and email recovery are clear; some transitions produce the wrong state |
| 2 | Match between system and real world | 2 | Transaction language is mostly understandable, but fixture controls and collapsed approval do not represent the real event |
| 3 | User control and freedom | 2 | Back/cancel exists; existing-case and operator-context recovery remains weak |
| 4 | Consistency and standards | 2 | Visual system is cohesive, but a Ready Product becomes Custom FDM after payment |
| 5 | Error prevention | 1 | Revision can succeed without a file, complaint duplication is not prevented, and operator submission becomes manager approval |
| 6 | Recognition rather than recall | 2 | Status and summaries help; case and cross-area operational context are not reliably recoverable |
| 7 | Flexibility and efficiency | 2 | Queues support routine work; resuming the active record across areas remains inefficient |
| 8 | Aesthetic and minimalist design | 3 | Calm, professional, responsive presentation; simulation/governance copy still adds noise |
| 9 | Error recognition and recovery | 3 | Expiry, cancellation review, conflicts, and email retry are actionable |
| 10 | Help and documentation | 2 | Guidance is generally useful; revision deadline disappears and evaluator language leaks into task surfaces |
| **Total** | **Overall** | **22/40** | **Acceptable foundation; participant evidence is not yet trustworthy** |

Trend against the initial expert critique is `23/40 → 22/40`. The one-point
change is less important than the risk profile: the original P0 is resolved,
but the more complete end-to-end rerun exposed five P1 research-validity
blockers.

## Gate Checklist

| Requirement | Result | Evidence |
| --- | --- | --- |
| No P0/P1 that can contaminate participant evidence | **FAIL** | Five P1 findings remain open |
| Participant-facing routes do not expose evaluator controls | **FAIL** | Panel/selector separation passes, but failure-simulation controls remain visible on task pages |
| Customer and Admin flows preserve canonical lifecycle meaning | **FAIL** | Order identity and manager approval transitions are not truthful |
| Critical state survives direct entry/navigation/refresh | **PARTIAL PASS** | Cart, checkout, cancellation, complaint case, and reservation state persist; recovery links and resulting resource identity remain incorrect |
| Mobile actions and audited accessibility/browser basics are non-blocking | **PASS WITH LIMITATIONS** | No audited overflow or sub-44 px controls; skip link/focus ring work; focus is lost after a configuration rerender |
| Both independent assessments support the decision | **PASS** | A and B independently returned `FAIL` |

## P1 Findings

### FXR-P1-01 — Checkout loses the cart's product identity

- **Route:** Ready or mixed cart → login → `/retail/checkout` →
  `/orders/NV-DEMO-014`.
- **Evidence:** the cart can contain `Keychain Layer` and `model-v7.stl` with
  the correct subtotal, but checkout omits line identity and payment always
  opens a fixed `Custom FDM / model-v7.stl` Order. A Ready Product disappears.
- **Research risk:** customer comprehension of checkout, fulfillment, and
  tracking would be measured against the wrong commercial object.
- **Required correction:** construct checkout and resulting Order from the
  same cart snapshot, preserving every line, product type, file only when
  applicable, price, ETA, and fulfillment grouping.

### FXR-P1-02 — File revision can succeed without a replacement file

- **Route:** `/orders/NV-DEMO-014/file-revision`.
- **Evidence:** the Order shows an exact revision deadline, while the task
  route shows neither that deadline nor a file input. `Kirim revisi simulasi`
  immediately returns the Order to Printing.
- **Research risk:** task `C-04` cannot test deadline comprehension, file
  selection, version creation, or safe error prevention.
- **Required correction:** display `revision_due_at`, require a simulated
  replacement selection before submit, and explicitly preserve prior file
  history.

### FXR-P1-03 — Existing complaint case is not recoverable from the Order

- **Route:** complaint case → Order → `/complaints/new`.
- **Evidence:** `CASE-DEMO-01` persists through refresh, but returning to the
  Order shows `Ajukan komplain` rather than `Lihat status CASE-DEMO-01`; the
  new-complaint form remains active without an existing-case warning.
- **Research risk:** task `C-07` encourages the duplicate action that it is
  intended to test and prevent.
- **Required correction:** show the active case on the Order, provide a durable
  case-detail action, and prevent or explicitly reconcile duplicate intake.

### FXR-P1-04 — Operator submission is rendered as manager approval

- **Route:** `/admin/retail-cases/CASE-DEMO-01`.
- **Evidence:** `Ajukan approval manager` changes the manager stage directly
  from `Menunggu` to `Disetujui`; Finance becomes available and the submission
  button remains active. No separate manager actor/action is demonstrated.
- **Research risk:** operator task evidence would falsely validate separation
  of duties and approval comprehension.
- **Required correction:** operator action must create `Menunggu approval`;
  manager approval must be a distinct role/fixture action with actor, time,
  state, and idempotent post-approval controls.

### FXR-P1-05 — Scenario controls leak into Participant Mode

- **Route:** Custom configurator, `/register`, and Admin Retail Order detail.
- **Evidence:** the global moderator panel, fixture selector, route tags, and
  governance notes are correctly hidden by default, but task pages still show
  `Simulasikan file bermasalah`, `Simulasikan gagal slicing`, `UX validation
  only`, and `Simulasikan email gagal` without a moderator-only guard.
- **Research risk:** participants are shown the intended failure branches and
  research mechanics, biasing task discovery and recovery behavior.
- **Required correction:** move fixture/failure triggers and activation-gate
  wording behind Moderator Mode. Participant Mode should expose only natural
  customer/operator actions plus a neutral simulation disclosure.

## Lower-Priority Findings

- **P2:** configuration rerender returns focus to `BODY`, weakening keyboard
  and screen-reader continuity.
- **P2:** active operator context is described as persistent but has no direct
  resume action from other Admin areas.
- **P2:** desktop keeps a redundant `Menu operator` control while the sidebar
  is already visible.
- **P3:** mobile sticky action uses the generic label `Lanjut` rather than a
  task-specific label.
- **P3:** mixed terms such as `Artwork`, `Fulfillment`, `remedy`, and
  `activation gate` add avoidable cognitive load for first-time customers and
  a non-IT operator.

## Strengths Preserved

- Participant Mode is the default; the global moderator panel, fixture
  selector, route tags, and candidate governance notes are hidden.
- Canonical public aliases resolve to `/capabilities` and `/projects`, while
  the official `ni` mark and B2B-primary Homepage direction are preserved.
- Cart, auth continuation, checkout, cancellation, complaint case, and
  reservation-expiry state survive the audited refresh paths.
- Invalid upload, stale/expired checkout, manual cancellation review,
  customer-safe complaint evidence, conflict, and email retry are explicit.
- Customer/Admin queue separation and the read-only legacy Admin Order surface
  remain conceptually clear.
- Audited 390 px views had no horizontal overflow or visible target below 44
  px; skip-link focus and visible focus treatment worked.
- The browser run found no application page exception or failed route/asset
  response. Detector output was `[]` with exit code `0`.

## Persona and Cognitive-Limit Readout

- **Jordan, first-time Retail customer:** hierarchy and status help, but a
  Ready Product becoming Custom FDM breaks the core mental model.
- **Riley, stress tester:** refresh/expiry recovery is strong; revision success
  without a file and duplicate complaint intake are decisive failures.
- **Casey, distracted mobile customer:** actions are reachable and fit the
  viewport, though the flow remains long and generic sticky labels reduce
  confidence after interruption.
- **Sam, accessibility-dependent user:** semantic labels, focus visibility,
  and skip navigation are present; focus loss after rerender needs correction.
- **Alex, experienced operator:** next-action prioritization is useful, but
  approval and cross-area resume behavior are not safe or efficient enough.

The emotional peak remains the transparent Custom Print price calculation and
the factual milestone view. The main trust valley is now the transition from
cart/checkout into an Order that does not represent what the customer selected.
For the operator, confidence drops when an operator submission silently becomes
a manager decision.

## Assessment Reconciliation

Assessment A reviewed UX, visual hierarchy, customer/operator journeys,
cognitive load, personas, and emotional flow without detector or prior-critique
access. Assessment B then ran the detector exactly once and used a fresh
browser session without seeing A's output.

Both assessments independently confirmed `FXR-P1-01` through `FXR-P1-04`.
Assessment B confirmed that the global Participant/Moderator shell separation
works. Assessment A separately found task-local fixture controls; source
inspection confirmed that those controls are unconditional. These facts are
not contradictory: the moderator panel is hidden, while several evaluator
actions still leak inside Participant Mode.

## Run Notes

- Target slug: `026-07-31-niuva-mvp-clickable-prototype-index-html`.
- Ignore list: `.impeccable/critique/ignore.md` did not exist.
- Independence: A completed before detector findings entered synthesis; neither
  reviewer read the other review, the initial expert report, validation report,
  or critique history.
- Detector: one B-owned run against `index.html`; exit `0`, output `[]`. Dynamic
  `app.js` rendering remains outside that shell-only scan's proof boundary.
- Browser A: fresh isolated headless Chrome, desktop `1440 × 1000` and mobile
  `390 × 844`.
- Browser B: fresh visible Chrome tab, representative desktop/mobile customer
  and Admin routes.
- Overlay injection: mutable-injection preflight did not establish a safe
  mutation; no live overlay server was started and no visible overlay is
  claimed. Screenshot, DOM, computed geometry/focus, console, source, and HTTP
  evidence were used.
- Live-server cleanup: isolated prototype PID `37796` on port `4181` was owned
  by the root review and is stopped after evidence capture. Pre-existing port
  `4177` remains untouched.
- Temp cleanup: B reported no overlay PID, port, or temp artifact. Any leftover
  review-owned process was checked by the root reviewer; no broad Chrome or
  user process termination was used.
- Snapshot/trend: this report is persisted under the stable target slug; trend
  is compared with the initial `23/40` snapshot.

## Next Gate

The next safe action is a separately authorized, prototype-only remediation of
`FXR-P1-01` through `FXR-P1-05`, followed by focused browser revalidation and a
new formal expert critique. Moderated sessions remain blocked. All candidate
route recommendations remain `INSUFFICIENT_EVIDENCE`.

Questions skipped: the failed gate and bounded remediation target are
unambiguous; no new business or route-policy decision is required.
