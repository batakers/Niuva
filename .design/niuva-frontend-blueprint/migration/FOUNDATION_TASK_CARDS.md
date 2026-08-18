# MIG-05 — Candidate foundation task cards

**Status:** Candidate planning-only foundation register — no source migration
**Baseline:** `origin/main` at `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Authority:** `DESIGN_TOKENS.md`, DS-01A, DS-02–DS-05, QA-05, and the
two-real-consumer promotion rule

## Candidate exact-file groups

| Candidate group | Exact files to inspect at G3 | Evidence required before change | Rollback |
| --- | --- | --- | --- |
| Runtime semantic token bridge | `frontend/src/index.css`, `frontend/tailwind.config.js`, existing token/component tests | At least two real consumers with identical purpose, contrast and long-content evidence, fallback mapping, bundle/diff impact | Revert only named token declarations and consumers; preserve legacy aliases until migration proves safe |
| Shared action/form compatibility | Existing Button/Label/Input/Textarea/FormField/Select/Switch source and their tests, identified by DS-01A | NDS 13 fields, API compatibility, two same-meaning consumers across allowed surfaces, keyboard/focus/error evidence | Revert exact API/style change; no broad rename or destructive removal |
| Shared feedback/state compatibility | Existing Dialog/Alert/Skeleton/EmptyState/ErrorState/OperationalState/SurfacePanel source/tests | Visible critical state, focus return, reduced motion, resource-specific adapters, two consumers | Revert exact state presentation; domain lifecycle remains unchanged |
| Collection/status mechanics | Existing collection/table/filter/status files and tests named in DS-01A/DS-04 | Distinct resource semantics, narrow-screen alternative, stable return context, no zero-consumer promotion | Revert adapter/presentation only; retain resource-specific labels |

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
