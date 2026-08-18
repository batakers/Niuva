# PUB-01 Homepage Structure Wireframe

**Status:** Candidate — Context Only — Wave B calibration artifact; preferred
structure only, not art-direction or source authority

**Date:** 18 August 2026

**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`

**Route responsibility:** `/` and `/en` share Homepage responsibility. Public
content and the B2B Inquiry entry own the page; Retail remains a clearly
discoverable secondary journey.

## 1. Purpose and invariants

This wireframe answers “Is Niuva relevant, credible, and where do I start?”
with structure before signature visual. It reuses the owner-approved facts and
does not invent project assets, metrics, clients, production capacity, or
checkout behavior.

Hard invariants:

- four equal Services: Research & Development, Consultant & Workshop, Design &
  Prototyping, and Apparel & Merchandise;
- one five-stage process rail: Need → Research → Experiment → Prototype →
  Output;
- project evidence appears after the process and exposes context, challenge,
  method/contribution, output, and capability proven;
- B2B inquiry is form-first and persistence-first; Retail is secondary;
- no Homepage FDM replacement is selected here; the retired visual remains a
  separate canonical-amendment concern; and
- no project card assumes a reserved `/proyek/:slug` or `/en/projects/:slug`
  detail route.

## 2. Desktop plate — 1440px reasoning

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Public Navbar: mark + text | Services Projects About Contact Retail | ID/EN │
├──────────────────────────────────────────────────────────────────────────────┤
│ HERO                                                                        │
│ clear Niuva positioning                                                     │
│ [Mulai dari kebutuhan bisnis]                  [Jelajahi Retail]            │
│ factual supporting note; no invented proof                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ DUA CARA MEMULAI                                                            │
│ B2B inquiry: question/need → /kontak#form-konsultasi                        │
│ Retail: published discovery → /retail                                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ CARA KERJA                                                                  │
│ Need → Research → Experiment → Prototype → Output                          │
│ one semantic process rail; vertical treatment at narrow widths             │
├──────────────────────────────────────────────────────────────────────────────┤
│ PROJECT EVIDENCE                                                            │
│ factual project mini-cases: context | challenge | contribution | output     │
│ [archive / non-link when detail route is not active]                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ EMPAT SERVICES                                                             │
│ four equal information/action blocks; editorial arrangement, not 2×2 grid  │
├──────────────────────────────────────────────────────────────────────────────┤
│ RETAIL SECONDARY PATH                                                       │
│ published products / configuration boundary / no guest checkout promise    │
├──────────────────────────────────────────────────────────────────────────────┤
│ CONTACT SUMMARY → FAQ SUPPORT → CLOSING ACTION → FOOTER                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

The container uses the approved semantic layout roles and approximately
65–70ch prose measures. Section rhythm is created by content hierarchy and
spacing, not repeated rules, eyebrows, decorative numbering, or card shadows.

## 3. Mobile plate — 390px reasoning

```text
┌──────────────────────────────┐
│ mark + menu                  │
├──────────────────────────────┤
│ HERO                         │
│ positioning                  │
│ [B2B]                        │
│ [Retail]                     │
├──────────────────────────────┤
│ DUA CARA MEMULAI             │
│ B2B explanation + action     │
│ Retail explanation + action  │
├──────────────────────────────┤
│ CARA KERJA                   │
│ Need                         │
│ ↓ Research                   │
│ ↓ Experiment                 │
│ ↓ Prototype                  │
│ ↓ Output                     │
├──────────────────────────────┤
│ PROJECT EVIDENCE             │
│ caption + factual action     │
├──────────────────────────────┤
│ FOUR SERVICES, equal order  │
│ Retail → Contact → FAQ      │
│ Closing → Footer             │
└──────────────────────────────┘
```

The mobile menu owns focus while open and the compact Navbar is frozen. No
horizontal shrink hides the logo, text, locale, or primary action.

## 4. Hierarchy and state contract

| Region | Ready | Missing/dependency state | Recovery and boundary |
| --- | --- | --- | --- |
| Hero | Positioning and two valid starts are clear | Supporting media may be absent without replacing factual copy | B2B goes to Contact; Retail goes to public discovery; no checkout implication |
| Journey choice | B2B and Retail have equal clarity but different prominence | Destination unavailable state names the route boundary | Preserve locale and current context; do not auto-redirect |
| Process | Five semantic stages are readable | Static ordered list remains complete if motion is unavailable | No progress, capacity, or Order meaning |
| Projects | Factual evidence caption is visible | Missing asset uses text-led verified-fact placeholder | Archive/non-link action until detail route activation |
| Services | Four equal names and detail actions | Unknown detail remains an explicit unavailable state | No primary/supporting split or invented capability |
| Contact/FAQ | Expectations and owned next action visible | Dependency error is in-page and distinguishable from validation | Inquiry persistence/UUID rules remain on Contact route |

Critical state must be visible to sighted users and assistive technology. Toast
or live-region reinforcement cannot replace an in-page error, conflict,
uncertainty, or success message.

## 5. Responsive and accessibility checks

- Reasoned at 320, 390, 768, 1024, and 1440px; no critical action depends on
  a fixed desktop row.
- Heading order follows page responsibility; each section has a meaningful
  landmark/heading rather than decorative labels.
- Prose targets approximately 65–70ch; mobile body text remains at least 16px.
- General interaction targets are 44 × 44px; focus remains visible and
  unobscured by the fixed Navbar.
- 200% zoom/reflow keeps the two journey actions, process stages, project
  caption/action, Services, Contact, and FAQ reachable.
- ID/EN content uses the same responsibility and tolerates long labels; an
  incomplete English counterpart uses the approved fallback notice.
- Reduced motion leaves the complete static process and evidence readable.

## 6. Anti-template and truth review

- No repeated 2×2 service grid is required; equal rank is preserved through
  information and action parity.
- No duplicate process rail, FDM substitute, bento, glass, fake metric,
  stock/generated project proof, or decorative line system is introduced.
- Public expression stays distinct from Retail, Account, and Operations.
- Unknown project fields are omitted or marked; no client, outcome, status, or
  production claim is filled merely to complete a layout.

## 7. Self-review record

Self-reviewed against the selected SHA and DS-01B/DS-05:

- route pairs, aliases, reserved detail paths, and Public navigation boundary
  match the IA;
- one process rail and the approved Homepage order are present;
- desktop/mobile plates preserve hierarchy, focus, targets, and long content;
- B2B/Retail lifecycle boundaries and evidence truth are explicit; and
- no application source, token, asset, route, or business rule was modified.

**Verification:** structural wireframe review passed. Browser screenshots are
deferred to the later QA artifact because this is a static design plate.

## 8. Exclusions and rollback

This artifact does not select a Homepage signature visual, retire or replace
FDM canonically, activate project details, or authorize source changes. To
discard PUB-01, remove this file and its two static plates before staging.
