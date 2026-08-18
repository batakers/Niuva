# MIG-05 — Candidate foundation task cards

**Status:** Candidate planning-only foundation register — no source migration
**Baseline:** `origin/main` at `814a46329b8de7775c2de8b1ee34536d73df63e1`
**Authority:** `DESIGN_TOKENS.md`, DS-01A, DS-02–DS-05, QA-05, and the
two-real-consumer promotion rule

## Candidate exact-file groups

| Candidate group | Exact files to inspect at G3 | Evidence required before change | Rollback |
| --- | --- | --- | --- |
| Runtime semantic token bridge | `frontend/src/index.css`, `frontend/tailwind.config.js`, existing token/component tests | At least two real consumers with identical purpose, contrast and long-content evidence, fallback mapping, bundle/diff impact | Revert only named token declarations and consumers; preserve legacy aliases until migration proves safe |
| Shared action/form compatibility | Existing Button/Label/Input/Textarea/FormField/Select/Switch source and their tests, identified by DS-01A | NDS 13 fields, API compatibility, two same-meaning consumers across allowed surfaces, keyboard/focus/error evidence | Revert exact API/style change; no broad rename or destructive removal |
| Shared feedback/state compatibility | Existing Dialog/Alert/Skeleton/EmptyState/ErrorState/OperationalState/SurfacePanel source/tests | Visible critical state, focus return, reduced motion, resource-specific adapters, two consumers | Revert exact state presentation; domain lifecycle remains unchanged |
| Collection/status mechanics | Existing collection/table/filter/status files and tests named in DS-01A/DS-04 | Distinct resource semantics, narrow-screen alternative, stable return context, no zero-consumer promotion | Revert adapter/presentation only; retain resource-specific labels |

## Post-pilot evidence reconciliation

PR #288 (Account/Auth) and PR #290 (Operations) provide two additional
consumer families for review, but they do not by themselves authorize a
foundation migration. Their changes stayed page/surface-owned: auth copy and
safe-return behavior remain in Auth, while Operations record labels remain in
Operations. No identical-purpose token or shared component contract has been
promoted by those pilots.

The next foundation G3 must re-run exact consumer searches at the baseline
above and prove two same-meaning consumers before changing `index.css`, the
Tailwind bridge, or a shared primitive. The existing React Router audit hold,
long-content evidence, fallback mapping, and rollback requirements remain
unchanged.

## Rules

- `frontend/src/index.css` remains the runtime token source; the blueprint
  preview is not a replacement.
- LOCAL page/art values cannot enter this card without two real consumers with
  the same semantic meaning.
- Breaking API, deprecated aliases, Drawer/`vaul`, zero-consumer components,
  and compatibility BrandButton require separate task cards and approvals.
- Foundation work must not change routes, APIs, schemas, provider boundaries,
  lifecycle enums, authorization, checkout, upload, payment, or production.

## Required verification and delivery gates

Fresh `origin/main`, one owned worktree, exact consumer search, focused and full
tests, production build, dependency/bundle audit, `git diff --check`, browser
responsive/accessibility/reduced-motion evidence, Impeccable critique, and
explicit rollback. G3 exact-file review precedes G4 source authorization; stage,
commit, push, PR, review, merge, deployment, readiness, and go-live are
separate.

## Self-review

- [x] Every candidate group has exact-file boundaries and evidence gates.
- [x] Two-real-consumer rule and LOCAL boundary are explicit.
- [x] Breaking/compatibility/quarantine cases are not silently promoted.
- [x] No source migration is performed or authorized by this card.

**Self-review result:** Pass as a candidate foundation register.
