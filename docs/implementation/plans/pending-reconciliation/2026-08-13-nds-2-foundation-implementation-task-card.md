# NDS 2.0 Foundation Implementation Task Card

Status: **IMPLEMENTED AND VERIFIED LOCALLY — PUBLICATION NOT YET AUTHORIZED**

## Identity and baseline

- **Requester / product owner:** Faiz
- **Driver:** Codex in one isolated worktree
- **Branch:** `feat/niuva-nds-foundation-20260813`
- **Worktree:** `C:\tmp\niuva-nds-foundation-20260813`
- **Selected baseline:** `origin/main` at
  `c5054ede2ae868858b8764c27587c10144bf39a4`
- **Date:** 13 August 2026, Asia/Jakarta
- **Publication authority:** local implementation and verification only.
  Commit, push, PR, merge, deployment, readiness, and go-live require separate
  approval.

## Objective

Implement Gate 1 of the approved NDS 2.0 migration: a compatibility-preserving
foundation for typography delivery, global and semantic tokens, surface
aliases, focus and motion roles, and the retained Button, form, state, and
Skeleton primitives. This slice prepares the shared contract for the later
Homepage R4 and Auth production pilots without redesigning any route page.

## Authority and workflow

Authority is resolved in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md`;
4. `docs/decisions/experience/DEC-UX-004-cross-surface-design-system-reconstruction.md`;
5. `DESIGN.md`;
6. the current frontend component register; and
7. current source and tests.

Execution uses Impeccable as the primary quality gate, Owl Listener guidance
for token/governance/component completeness, Taste as an anti-template red
team, Emil Design Engineering for interaction and motion restraint, and the
previous Plugin87 pilot only as validator-donor context. No Plugin87 package or
other dependency is installed into the repository.

## In scope

- Self-hosted Mona Sans Variable and Bona Nova Italic assets, licenses, and a
  provenance record containing source, hashes, supported axes, and owner.
- NDS 2.0 blue values, core semantic roles, surface aliases, spacing, shape,
  focus, and motion tokens in the existing CSS-variable runtime.
- Compatibility mappings for current public semantic, HSL/shadcn, legacy
  Niuva, typography, Tailwind, and component contracts.
- Compatible improvements to Button loading/disabled/focus presentation,
  form validation semantics, visible state variants/recovery, and
  hierarchy-preserving Skeleton composition.
- Proportional contract/unit tests, reduced-motion checks, build, and bounded
  browser evidence for a foundation specimen or current shared-component
  harness.
- Update of this task card and the current frontend component register with
  fresh baseline, compatibility, provenance, and verification evidence.

## Expected affected paths

- `frontend/public/fonts/niuva/`
- `frontend/src/index.css`
- `frontend/tailwind.config.js`
- bounded files under `frontend/src/components/ui/`
- proportional tests under `frontend/src/components/ui/`
- `docs/implementation/plans/pending-reconciliation/2026-08-05-frontend-component-register.md`
- this task card
- `docs/context/DOCUMENT_REGISTER.md` if this task card is proposed for
  publication

The exact changed-path set must be reviewed before any staging operation.

## Explicit exclusions

- No route-page redesign, Homepage R4 adaptation, Auth visual adaptation,
  Retail/Customer/Admin decomposition, content rewrite, or new lifecycle.
- No route, redirect, locale, sitemap, API, schema, database, CMS, permission,
  customer-data projection, test-id, or business-state change.
- No Google Identity, upload, storage, payment, Finance, provider activation,
  dependency addition/removal, build migration, deployment, readiness, or
  go-live.
- No removal of Poppins, Inter, hosted JetBrains Mono, current token aliases,
  component variants/sizes, or other compatibility contracts.
- No synthetic visual identity, page-local palette, generic component-library
  theme, dark mode, decorative motion, or external catalog installation.

## Acceptance criteria

1. Approved local fonts resolve through NDS 2.0 roles with `font-display:
   swap`; Bona Nova remains Public-only and is not preloaded globally.
2. Global values map through core semantics and surface aliases without route
   pages consuming raw values directly.
3. Current semantic/HSL/Tailwind/component APIs remain functional and receive
   no undocumented breaking change.
4. Shared focus is visible and non-color-only; validation, loading, disabled,
   error, conflict, unavailable, recovery, and success contracts remain
   visible to sighted and assistive-technology users where applicable.
5. Motion uses the approved `0/120/180/280ms` grammar, has no `transition:
   all`, and reduced motion preserves essential non-moving feedback without a
   global `0.01ms` wipe.
6. Skeleton composition mirrors content hierarchy and has an explicit loading
   announcement contract rather than relying on decorative pulse alone.
7. Foundation tests, affected UI tests, production build, Impeccable detector,
   responsive/focus/reduced-motion browser checks, and `git diff --check` pass,
   or limitations are reported without reclassification.
8. The worktree contains no unrelated tracked or untracked changes.

## Local implementation result

Gate 1 is implemented on the selected baseline without changing a route page,
business lifecycle, package manifest, lockfile, API, database, provider, or
deployment configuration.

The bounded change contains:

- self-hosted font assets, licenses, provenance, and document-level delivery;
- NDS global values, semantic and RGB-channel compatibility aliases, four
  opt-in surface scopes, focus, spacing, radius, and motion roles;
- Tailwind mappings that preserve existing opacity modifiers and legacy
  aliases while exposing the new target roles;
- compatible Button, form-control, FormField, Alert, OperationalState, and
  Skeleton/SkeletonGroup contracts;
- 320/390/768/1024/1440 Playwright projects and one foundation browser contract;
  and
- updated component/document registers plus this task-bounded record.

No current route opts into an NDS surface scope yet. This is intentional:
Homepage R4 and Auth remain separate migration pilots rather than receiving an
unreviewed global font or composition cutover.

## Verification plan

- Run baseline and post-change foundation/UI Jest tests serially.
- Run the frontend production build and existing bundle policy checks.
- Run the Impeccable detector exactly once after UI edits are complete.
- Validate a bounded browser matrix at 320, 390, 768, 1024, and 1440px,
  including keyboard focus, disabled/loading, validation/error/recovery,
  Skeleton, font loading, and reduced motion.
- Measure or record font-request and layout-shift evidence where the current
  harness permits; do not invent fallback metric overrides.
- Run `git diff --check`, inspect exact changed paths, and compare hashes of
  copied font/license assets against their approved repository provenance.

## Rollback

Before publication, rollback is deletion or restoration of only the exact
paths changed in this isolated worktree. The implementation does not alter
data, dependencies, environment configuration, providers, or external state.
After a future merge, the compatibility aliases permit a standard revert of
the bounded foundation PR without requiring route or data migration.

## Handover requirements

The handover must state changed and intentionally unchanged files, tests and
browser checks run, font provenance and hashes, compatibility contracts kept,
remaining risks, rollback, and the separate approval still required for
commit/push/PR/merge and for the Homepage/Auth production pilots.

## Verification and findings

Passed locally on 13 August 2026:

- Jest: **64/64 suites, 401/401 tests**;
- bundle contract: **5/5 tests**;
- production dependency audit: passed with the two exact accepted RSC-only
  React Router advisories for this BrowserRouter SPA;
- optimized production build: passed; report-only total **588.06 kB gzip**,
  with no bundle-budget decision applied;
- focused Playwright foundation matrix: **5/5** at 320, 390, 768, 1024, and
  1440 pixels; the 390 and 1440 error/recovery states were also captured for
  screenshot critique;
- browser assertions: local Mona Sans response, runtime token values, visible
  focus, 44px controls, disabled/loading/error/recovery, reduced motion, no
  unintended overflow, layout shift below 0.1, and no axe WCAG A/AA violation;
- contrast: all tested text/action/status pairs passed 4.5:1; control border
  and focus passed 3:1;
- font/license SHA-256 values matched the approved R4 provenance; and
- `git diff --check`: passed.

Impeccable detector disposition:

- three warnings identify Inter in the compatibility Google-font delivery;
  this is accepted Gate 1 migration debt because current consumers have not
  yet moved to the opt-in NDS surface scopes;
- one warning classifies Mona Sans as an overused font, which is a detector
  false positive against the explicitly approved NDS 2.0 target; and
- no P0/P1 visual, accessibility, or interaction finding remains in the Gate 1
  scope.

The local Impeccable context check also reported that `PRODUCT.md` uses the
legacy Impeccable context schema. That is pre-existing metadata debt and was
not modified through this foundation task; `impeccable init` remains a
separate optional maintenance action.

## Publication boundary and next gate

The worktree remains uncommitted. Stage, commit, push, PR, merge, Homepage R4
adaptation, Auth adaptation, and the three parallel surface lanes each require
their applicable separate approval. Rollback before publication remains an
exact-path restore/delete inside this isolated worktree.
