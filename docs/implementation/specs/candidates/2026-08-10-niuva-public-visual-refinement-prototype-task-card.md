# Candidate Task Card — Niuva Public Visual Refinement Prototype

**Status:** Candidate — Context Only — isolated prototype build authorized by
the owner; not canonical and not production implementation authority

**Date:** 10 August 2026
**Baseline:** `origin/main` at
`954837c9dd4fcaeb9438c16fb6934210e082a364`
**Parent direction packet:**
[`2026-08-10-niuva-visual-refinement-direction-packet.md`](2026-08-10-niuva-visual-refinement-direction-packet.md)
**Design brief:**
[`DESIGN_BRIEF.md`](../../../../.design/niuva-public-visual-refinement/DESIGN_BRIEF.md)
**Build tasks:**
[`TASKS.md`](../../../../.design/niuva-public-visual-refinement/TASKS.md)

## 1. Objective

Build a bounded, synthetic, clickable visual prototype that tests the
candidate direction **Evidence-led Prototyping Editorial** on exactly three
public/B2B routes:

- `/` — B2B-primary Home with one credible artifact and a `Diskusikan Project`
  action;
- `/projects` — artifact-first project index and one readable detail state; and
- `/contact` — inquiry-first form, consent, response target, and deliberate
  WhatsApp handoff boundary.

The purpose is to validate visual specificity, route differentiation, copy,
responsive composition, accessibility, and recovery states before any source
implementation. Retail/customer and Admin/CMS are guardrails only in this
slice; they are not redesigned here.

This task follows the repository authority order: Master Spec → Document
Register → Decision Register/approved decisions → source/tests. The parent
direction packet and this task card remain candidate planning inputs. They do
not alter canonical product decisions or authorize production work.

## 2. Boundary and exclusions

The prototype must not:

- edit or import runtime code from `frontend/` or `backend/`;
- call APIs, databases, map providers, payment, upload, analytics, or WhatsApp;
- create an Inquiry, Order, reservation, payment attempt, or durable state;
- add dependencies, fonts, tokens, routes, providers, secrets, or environment
  configuration;
- redesign Retail checkout/customer Order or Admin/CMS;
- invent metrics, client logos, testimonials, CAD/slicer/printer telemetry, or
  project evidence; or
- promote the direction, open a PR, commit, push, mark ready, merge, deploy, or
  claim production/readiness/go-live status.

All data is synthetic except approved local Niuva mark/project media copied into
the prototype with provenance. Every synthetic state is visibly marked
`SIMULASI`.

## 3. Isolation and exact file ownership

Build only in:

`C:\tmp\niuva-public-visual-refinement-prototype-r1`

The worktree must be created from freshly fetched `origin/main` and must not
touch the dirty primary worktree or the existing R6 prototype. The bounded
artifact owns only these paths:

```text
docs/implementation/prototypes/2026-08-10-niuva-public-visual-refinement-prototype-r1/
  index.html
  review.html
  styles.css
  app.js
  fixtures.js
  server.cjs
  prototype-flow.contract.test.cjs
  README.md
  BROWSER_REVALIDATION.md
  VISUAL_QA.md
  COMPLETION_AUDIT.md
  ASSET_MANIFEST.md
  assets/niuva-mark.svg
  assets/projects/*
  evidence/*
.design/niuva-public-visual-refinement/DESIGN_BRIEF.md
.design/niuva-public-visual-refinement/TASKS.md
docs/implementation/specs/candidates/2026-08-10-niuva-public-visual-refinement-prototype-task-card.md
docs/implementation/specs/candidates/2026-08-10-niuva-public-visual-refinement-owner-review-packet.md
```

The evidence directory may contain local screenshots/contact sheets and must
not be imported by production code. No generated asset may be presented as
client proof; if a synthetic visual is needed, it must be explicitly labelled
and recorded in the manifest.

## 4. Participant and Review Mode

- **Participant Mode** is `index.html` and its route states. It contains only
  public product navigation, one neutral `SIMULASI` notice, and the task
  controls. It must not contain fixture IDs, frame IDs, packet terms, evaluator
  instructions, review toggles, open-gate panels, route diagnostics, or event
  logs.
- **Review Mode** is `review.html`. It may seed/reset fixtures and show
  scenario/evidence metadata. The reviewer must explicitly hand off to a clean
  Participant URL before judging a task.
- Review controls and diagnostics never share the Participant DOM or screenshot
  surface.

## 5. Required route and state coverage

### Home (`/`)

- Initial and mobile state with one dominant approved artifact.
- B2B-primary `Diskusikan Project` action and secondary Retail link, with no
  marketplace framing.
- Evidence thread: need → investigation → decision → artifact → output.
- At least one open editorial section using a divider/rail/band rather than
  repeating equal rounded cards.

### Projects (`/projects` and detail)

- Artifact-first index with non-identical image/text scale and route context.
- Detail state exposes truthful challenge, intervention/decision, and output
  using approved source content only.
- Missing evidence is stated as missing; no filler image or invented metric.

### Contact (`/contact`)

- Empty, invalid, submitting, persistence-unavailable simulation, success, and
  preserved-field recovery states.
- Approved B2B fields and exact consent wording:
  “Saya setuju Niuva menggunakan data ini untuk meninjau inquiry dan
  menghubungi saya terkait kebutuhan yang saya kirim. Data tidak digunakan
  untuk marketing tanpa persetujuan terpisah.”
- Calendar target: Niuva Operations, Senin–Jumat, 09.00–17.00 WIB, hari libur
  dikecualikan; first human response maksimal satu hari kerja, bukan jaminan
  quotation/ETA.
- Success state confirms the synthetic Inquiry record and next human step,
  without creating a real record or promising a quote/project.
- WhatsApp requires an explicit confirmation boundary and never auto-sends.
- Map `loading` and `unavailable` states have useful fallback content.

## 6. Visual and content acceptance

The build must satisfy the parent packet's `CVR-001`–`CVR-013` with evidence:

- route compositions are recognizably different, not one relabelled shell;
- blue is semantic; no gradients, neon, glow, glass, dark-mode rollout, or
  ornamental technical vocabulary;
- Poppins/Inter use is labelled as Homepage-approved or candidate extension;
- primary copy is Indonesian-first and actions have stable intent;
- media is artifact-led and provenance/alt text is documented;
- no evaluator/fixture language leaks into Participant Mode;
- public/B2B composition stays separate from Retail/Admin guardrails; and
- all critical compositions remain usable at 390px.

## 7. Verification contract

From the prototype root, run and record:

```text
node --check app.js
node --check fixtures.js
node --check server.cjs
node --test prototype-flow.contract.test.cjs
node C:\Users\FAIZ\.agents\skills\impeccable\scripts\detect.mjs --json index.html review.html styles.css app.js
```

Use a local server only for browser checks at 390, 768, 1024, and 1440px.
Record console output, overflow, keyboard/focus order, reduced-motion behavior,
Participant/Review handoff, visible-string audit, and screenshot paths in
`BROWSER_REVALIDATION.md` and `VISUAL_QA.md`. If markdownlint is unavailable,
record that fact; do not install a dependency for this artifact.

Acceptance is prototype-only and is not a readiness or go-live claim. A later
independent expert critique remains a separate gate.

## 8. Handover

Handover must name every changed file, every intentionally unchanged source
area, checks passed/not run, evidence locations, owner decisions still open,
and the separate authorization required for commit/push/PR/merge or source
implementation. The existing primary worktree and R6 prototype must remain
unchanged.
