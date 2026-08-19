# OPS-03 — Operations Quotes and B2B Projects G3 Exact-File Review

**Status:** Candidate G3 task card — owner/domain review required; no G4
implementation authority

**Date:** 19 August 2026

**Repository baseline:** `origin/main`
`74967a33abc6537bdd4a5c0eaec826ad251b8d91`

**Surface:** Operations / Admin — Quotes and B2B Projects

**Phase:** Phase 6 frontend migration; Phase 7 remains frozen

## 1. Purpose

Review the existing Operations Quotes and B2B Projects presentation and
recovery contract against the approved Niuva authority. The review must decide
whether a later, bounded G4 source slice is justified, and if so, lock the
smallest exact file set. This card is documentation and review scope only. It
does not authorize source, API, schema, permission, lifecycle, provider,
payment, fulfillment, production, migration, deployment, readiness, or
go-live work.

The candidate is intentionally separate from Operations Inquiry, Retail Order,
catalog/materials/inventory, publishing/CMS, governance/settings, and the
Customer or Public surfaces. It is also separate from the durable resources
that may appear in a shared workbench:

- `Inquiry` remains the B2B intake resource;
- `Quote` remains a quotation resource with its own revision and approval
  authority; and
- `Project` remains a project resource and is not silently created by a Quote
  revision or a UI success state.

## 2. Authority and precedence

Resolve a conflict in this order:

1. `docs/NIUVA_MASTER_SPEC.md`;
2. `docs/context/DOCUMENT_REGISTER.md`;
3. `docs/decisions/DECISION_REGISTER.md` and the applicable approved
   Operations/product decision or ADR;
4. `DESIGN.md` within its approved scope;
5. the applicable runbook and current source/tests as implementation evidence;
6. the Phase 6 closure ledger and this task card.

The source and tests prove current presentation behavior only. They do not
activate a Quote/Project lifecycle, grant a permission, create a revision,
or authorize a provider or financial effect.

## 3. Exact-file candidate scope

The following files are the only proposed G3/G4 source and test paths. A G4
implementation may not expand this list without a new review.

| Path | G3 purpose | G4 write status |
| --- | --- | --- |
| `frontend/src/pages/admin/B2BList.jsx` | Collection identity, query/filter, pagination, loading/empty/error, and resource-specific actions | Candidate write, only if a bounded presentation defect is proven |
| `frontend/src/pages/admin/B2BDetail.jsx` | Resource detail, status/history, permission, conflict/stale, and recovery presentation | Candidate write, only if a bounded presentation defect is proven |
| `frontend/src/pages/admin/QuoteRevisionEditor.jsx` | Quote revision form, validation, immutable version, conflict, and uncertain outcome presentation | Candidate write, only if a bounded presentation defect is proven |
| `frontend/src/lib/b2bPagination.js` | Cursor/next-page continuity and duplicate-safe collection recovery | Candidate write, only if a reproducible presentation-support defect is proven |
| `frontend/src/pages/admin/b2b-workbench.contract.test.js` | Contract evidence for list/detail resource separation and states | Candidate test update paired with a proven source change |
| `frontend/src/pages/admin/QuoteRevisionEditor.test.jsx` | Revision validation, conflict, status, and recovery evidence | Candidate test update paired with a proven source change |

These paths remain read-only during G3 review unless a separate G4 gate is
recorded. The following may be inspected for authority or callers, but are not
part of the candidate write set: `frontend/src/i18n.js`, permission maps,
route registration, `B2BStatusBadge`, and API/client modules. No backend file,
schema, provider, role/permission definition, or route activation belongs in
this card.

## 4. G3 review contract

### 4.1 Collection and search behavior

- Preserve the current resource identity (`Inquiry`, `Quote`, `Project`, and
  any separately named work-queue record); do not collapse them into one
  generic “lead” or “deal” object.
- Query, filter, sort, and cursor state must be represented visibly and must
  survive a safe retry or load-more operation without duplicating rows.
- A zero-result response explains whether the collection is empty or the
  active query/filter found no results and offers an explicit reset or next
  action. A blank table or spinner-only page is not sufficient.
- Load-more failure must retain already loaded results and provide a bounded
  retry. It must not silently restart the collection or imply a new lifecycle.
- Long Indonesian and English labels, client names, quote/project identifiers,
  and status text must not hide the primary identity or action.

### 4.2 Detail and revision behavior

- Detail views state which durable resource is open and keep resource-specific
  status adapters, history, blockers, and permission boundaries intact.
- A Quote revision is a revision request or domain-owned mutation only when
  the authoritative API confirms it. The editor must not turn a local form
  state into an accepted Quote, Project, Order, payment, reservation, or
  production commitment.
- `expected_version`/stale checks and `operation_id`/uncertain outcomes must
  be visible when applicable. An uncertain mutation reconciles authoritative
  state before exposing an irreversible retry.
- Validation errors preserve safe values and focus. Dependency, permission,
  conflict, and expired-session errors remain distinct from invalid fields.
- Success names exactly what the authoritative operation completed and gives a
  reference or next owned action. It must not be a generic `Saved` toast.

### 4.3 Accessibility and localization

- All state changes have a visible representation and an assistive-technology
  status; a toast or live region is supplementary, not the only critical
  message.
- Keyboard order, focus visibility, focus return, Escape behavior where a
  dialog is involved, and touch targets remain deterministic.
- ID/EN copy, labels, validation, errors, conflict/recovery, empty states,
  and action names are complete enough for the bounded path. Missing English
  content must follow the approved fallback contract rather than inventing a
  translation.
- Long content must remain usable at the 320px floor, 390px mobile baseline,
  768px intermediate, 1024px compact desktop, and 1440px desktop; 200% zoom
  must not remove the task or the recovery action.

## 5. Required G3 evidence

The self-review must record:

1. the selected baseline SHA and exact source/test files inspected;
2. the current route and permission boundary, without treating URL visibility
   as authorization;
3. a state matrix covering ready, loading, empty, validation, dependency,
   permission, conflict/stale, expired/offline or unavailable, uncertain,
   recovery, and success where the path can reach them;
4. query/filter/result identity and pagination behavior;
5. ID/EN, keyboard/focus, reduced-motion, responsive, and 200% zoom evidence
   requirements for any future G4 claim; and
6. every proven gap, its owner, and whether a G4 source change is necessary.

G3 must end with one of these bounded outcomes:

- `PASS` — no source change is justified; record the existing evidence;
- `PASS WITH HOLD` — a bounded presentation gap is named, but authority or
  contract work must precede G4; or
- `FAIL` — the exact candidate cannot be reviewed safely until a missing
  authority, route, permission, or API contract is supplied.

## 6. G4 entry criteria and exclusions

G4 may be requested only after owner/domain review of this card, an exact-file
diff plan, and a current API/permission/lifecycle contract for every mutation
the UI presents. G4 must include proportional tests and browser/accessibility
evidence, and must preserve unrelated work in an owned worktree.

Explicitly excluded:

- Quote/Project lifecycle enum or transition changes;
- API/schema/database/migration/storage changes;
- staff/customer identity or role/permission changes;
- Order, payment, inventory reservation, fulfillment, production, refund, or
  provider activation;
- CMS/content migration or project evidence approval;
- new runtime dependency, design-token promotion, Phase 7 work, commit, push,
  merge, deployment, readiness, or go-live authority.

**Next gate:** owner/domain review of this exact-file G3 card, followed by a
separate G4 authorization only if the review establishes a bounded source gap.
