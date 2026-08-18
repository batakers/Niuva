# DS-04 Collection, Record, and Status Mechanics Specification

**Status:** Candidate — Context Only — Phase 6 `DS-04` completed for internal
self-review; owner review is consolidated with DS-02, DS-03, and DS-05

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Objective:** Define reusable mechanics for search, filters, reset, cursor or
load-more pagination, collection presentation, record identity, and status
presentation without merging Retail, Account, Operations, Public, or B2B
lifecycles.

**Authorization:** The owner authorized DS-02 through DS-05 to run as one
documentation goal with independent self-review and one consolidated
owner-report. This specification is planning evidence only. It does not
authorize application source, tests, tokens, dependency, route, API, schema,
privacy, business-rule, stage, commit, push, PR, merge, deployment, readiness,
or go-live work.

## 1. Authority and relationship

Read this specification after the repository authority order, the approved
semantic token contract, [`DESIGN_BRIEF.md`](../DESIGN_BRIEF.md),
[`INFORMATION_ARCHITECTURE.md`](../INFORMATION_ARCHITECTURE.md),
[`DS-01A`](COMPONENT_STATUS.md),
[`DS-01B`](../inventory/ROUTE_COMPONENT_MATRIX.md), and the DS-02 and DS-03
contracts. Current source and tests at the selected
SHA remain implementation evidence; this document does not promote a wrapper,
status adapter, route, or lifecycle.

The shared layer owns query mechanics, collection structure, record identity
presentation, and neutral status presentation. The owning route or domain
still owns filtering policy, authorization, persistence, pricing, inventory,
publication, transition rules, and authoritative success.

## 2. Scope and non-goals

### In scope

- Query/search input, selected-filter visibility, reset, and stable query
  context;
- collection loading, empty, no-match, dependency-error, and load-more
  failure states;
- table, list, and card presentation mechanics with a narrow-screen
  alternative;
- record identity, reference, metadata, breadcrumb, and return context;
- row/card action hierarchy and permission-safe affordances; and
- neutral `Badge` presentation plus domain-owned status adapters for current
  Inquiry, Quote, Project, Retail Order, Work Order, Portfolio, Account, and
  legacy Order resources.

### Explicitly out of scope

- a new Search, FilterBar, Collection, Pagination, Table, RecordCard, or
  Status component or token;
- adopting zero-consumer `ResponsiveTable`, `Progress`, `Separator`, or
  `StatCard` merely because their files exist;
- merging resources because their labels or badge tones look similar;
- authoritative price, stock, eligibility, checkout, payment, upload,
  reservation, production, publication, or permission behavior;
- inventing result counts, progress, ETA, telemetry, or operational KPIs; and
- source, route, API/schema, lifecycle, or visual redesign changes.

## 3. Shared collection laws

The following laws apply to every consumer, then receive a surface-native
composition and domain state contract.

1. **Query ownership is explicit.** A route owns the meaning of its query,
   filters, sort, and cursor. URL persistence is used only when that route's
   contract permits it; local draft state is not authoritative.
2. **Selected criteria remain visible.** A selected filter, query, sort, or
   result scope is named in text/semantics and has an explicit reset or remove
   action. Color, icon, or hidden hover is insufficient.
3. **Counts are factual.** A result count or “showing more” statement is
   rendered only from an authoritative response. A skeleton, cached draft, or
   failed request must not invent a count.
4. **Failure types stay distinct.** Empty means no records exist for the
   authoritative scope; no-match means records exist elsewhere but current
   criteria match none; dependency/system error means the answer is unknown.
5. **Load-more is bounded.** Cursor or page navigation prevents duplicate
   requests, keeps the existing records, exposes a contextual loading label,
   and distinguishes end-of-list from failure. Retry is conditional on the
   authoritative request contract.
6. **Focus follows the task.** Reset, filter removal, result replacement, and
   load-more return focus to a visible, stable control or summary without
   jumping to an unrelated route.
7. **Collection presentation is not authority.** A table, list, or card is a
   view of records. Row click, card click, and action buttons never grant
   permission or create a transition.
8. **Protected data stays projected.** Identity and metadata expose only the
   audience-safe projection. Internal cost, margin, supplier, notes, secrets,
   or unauthorized status details never enter a shared display by accident.
9. **Status adapters require resource kind.** An adapter receives both a
   resource kind and a status, uses a neutral fallback for unknown values, and
   never maps one lifecycle into another merely because the tone is shared.

## 4. NDS 13-field mechanics contract

Every future promotion record still fills all NDS fields from DS-02. These
records describe mechanics and existing evidence; they are not new component
adoption decisions.

<!-- markdownlint-disable MD013 -->

| Field | Required treatment for collection/record/status mechanics |
| --- | --- |
| 1. Name, purpose, owner, status | Name the existing mechanic or candidate pattern, its one job, owner, and current `adopted`, `compatibility-bounded`, `provisional`, or `quarantined` status. |
| 2. Use / not use | State the query, collection, record, or status task fit and the lifecycle or authority anti-pattern. |
| 3. Anatomy | Identify label, query input, filter/remove controls, summary, collection region, record identity, status text, and action slots. |
| 4. Variants, sizes, content limits | Preserve current APIs and 44px targets; specify long labels, result text, dense queues, and narrow alternatives. |
| 5. Props/API continuity | Reuse `Input`, `Select`, `Button`, `Table`, `Badge`, state primitives, and existing domain adapters; no speculative wrapper API. |
| 6. Interaction/data states | Ready, selected, loading, empty, no-match, dependency error, load-more, conflict/stale, permission, expired, offline/uncertain, recovery, and success where applicable. |
| 7. Input/focus/screen-reader behavior | Name query and filters, expose collection semantics, preserve keyboard order, announce bounded status changes, and return focus deterministically. |
| 8. Responsive/overflow behavior | Keep the primary query/action available at 320px/390px; use a semantic list/card alternative when a table cannot reflow without data loss. |
| 9. Token dependencies | Use durable text, surface, border, focus, spacing, density, radius, and motion roles; no page-specific color or elevation. |
| 10. Localization/long content | ID/EN labels, status names, filters, counts, dates, identifiers, and empty/error copy wrap or expand without clipping. |
| 11. Surface/domain restrictions | Public, Commerce, Account, Operations, or B2B owner is named; shared mechanics do not merge lifecycle meaning. |
| 12. Anti-patterns | No hover-only metadata, color-only status, clickable-row-only keyboard path, fake counts, generic KPI, silent stale data, or cross-resource status reuse. |
| 13. Migration/deprecation | Name current consumers, compatibility limits, evidence needed for future promotion, verification, and rollback; no migration is authorized here. |

<!-- markdownlint-enable MD013 -->

## 5. Mechanics records

### 5.1 Query and search control

1. **Name/purpose/owner/status:** Existing `Input`, `Select`, and `Button`
   mechanics composed by the route owner; Foundation mechanics adopted, no
   new `Search` component proposed.
2. **Use / not use:** Use for a factual query or route-owned filter. Do not
   treat a local query as a persisted preference, analytics truth, or
   authorization signal.
3. **Anatomy:** Visible label or labelled search field, optional clear action,
   filter trigger/select, result summary region, and submit/apply behavior
   appropriate to the route.
4. **Variants/sizes/content:** Current Input/Select/Button variants; controls
   retain 44px general mobile targets; long ID/EN labels wrap and the query
   remains readable.
5. **API continuity:** Preserve native input events, controlled value, form
   submission, Select value, and Button loading/disabled behavior. Do not add
   an unowned query cache or new URL schema.
6. **States:** Ready, editing, selected, loading, no-match, dependency error,
   reset/recovery, and stale query where a route can refresh its data.
7. **Interaction/accessibility:** Label and clear action are keyboard reachable;
   Enter semantics are explicit; focus remains on the query or moves to the
   result summary after replacement; status is not announced only by color.
8. **Responsive/overflow:** Query and primary apply/reset action remain usable
   at 320px; filters may wrap or open a route-owned panel without hiding the
   current criteria.
9. **Tokens:** Input, border, focus, text, surface, spacing, and motion roles
   from the approved token contract; no collection-specific accent.
10. **Localization:** Placeholder is supplementary, not the only label; ID/EN
    query, clear, apply, reset, count, and error copy must expand safely.
11. **Restrictions:** Public discovery, Commerce catalog, Account-owned list,
    and Operations queues may compose it; query meaning stays route/domain
    owned.
12. **Anti-patterns:** No instant filtering that implies authoritative price,
    no invisible selected criteria, no query-as-permission, no fake result
    count, and no automatic redirect on language or filter change.
13. **Migration:** Reuse current Input/Select/Button consumers. A future
    Search wrapper requires two independent same-meaning consumers, 13-field
    evidence, API continuity, and rollback.

### 5.2 Filter and reset controls

1. **Name/purpose/owner/status:** Existing control primitives plus a route
   composition for selected criteria; Foundation mechanics adopted, pattern
   remains surface/domain-owned and is not a new shared component.
2. **Use / not use:** Use when a collection has multiple factual scopes. Do
   not expose filters that the backend does not support or imply that a
   filtered view changes lifecycle authority.
3. **Anatomy:** Filter label, control(s), selected-value summary/chips or text,
   individual remove actions when useful, and a reset-all action with a clear
   result target.
4. **Variants/sizes/content:** Select, checkbox, or Button mechanics retain
   existing APIs; selected labels may wrap; 44px target applies to removers
   and reset.
5. **API continuity:** Route owns selected values and serialization; no new
   global filter store or component API is proposed.
6. **States:** Unselected, selected, disabled due to unavailable data,
   applying/loading, no-match, failed reset, and restored context.
7. **Interaction/accessibility:** Every selected value has text and a named
   remove path; reset returns focus to the filter summary or first control;
   screen readers receive the updated collection status.
8. **Responsive/overflow:** Controls wrap or stack; a mobile filter disclosure
   must preserve open/close focus and must not clip long ID/EN labels.
9. **Tokens:** Semantic surface, border, focus, selected, spacing, and motion
   roles only; selected is not a commercial or lifecycle commitment.
10. **Localization:** Filter names, values, clear/remove/reset, and no-match
    copy are caller-owned and tested with long translations.
11. **Restrictions:** Catalog, owned records, and operations queues define
    which filters are valid; Public filters cannot expose private fields.
12. **Anti-patterns:** No hidden filter state, color-only selected chips,
    unsupported “all” claim, destructive reset without recovery, or automatic
    provider/price promise.
13. **Migration:** Keep current page-local controls. Promote only after two
    same-meaning consumers and route/state evidence; rollback is removal of
    the composition, not deletion of current controls.

### 5.3 Collection shell and presentation

1. **Name/purpose/owner/status:** Existing page-local collection regions,
   `Table`, `EmptyState`, `ErrorState`, `OperationalState`, `Skeleton`, and
   `SurfacePanel`; adopted mechanics with surface-native composition. No new
   `CollectionShell` is adopted.
2. **Use / not use:** Use to frame a factual set of records. Do not use a
   generic shell to flatten Public evidence, Commerce discovery, Account
   ownership, and Operations density into one visual template.
3. **Anatomy:** Heading/description, query/filter context, factual result
   status, collection region, loading/empty/error branch, and authorized
   actions.
4. **Variants/sizes/content:** Table for column relationships; list/card when
   narrow or when an item needs richer identity; skeleton mirrors the final
   hierarchy; no generic KPI card.
5. **API continuity:** Compose existing state and surface primitives. Do not
   adopt `ResponsiveTable`, `StatCard`, `Progress`, or a new collection API.
6. **States:** Bootstrap/loading, ready, empty, no-match, dependency error,
   load-more, conflict/stale, permission, offline/uncertain, and recovery.
7. **Interaction/accessibility:** Collection has a semantic heading and region;
   rows/cards expose names and actions; focus is not trapped in a data set;
   critical state is visible in-page and available to assistive technology.
8. **Responsive/overflow:** At 320px/390px, preserve identity and the primary
   action; use a semantic list/card alternative rather than horizontal scroll
   that hides critical columns unless the domain explicitly requires it.
9. **Tokens:** Layout, density, surface, border, focus, text, and motion roles;
   no raw page art-direction value or ordinary card shadow by default.
10. **Localization:** Headings, metadata, empty/error state, table headings,
    dates, numbers, and actions expand for ID/EN; no text is clipped or hidden
    behind hover.
11. **Restrictions:** Commerce, Account, and Operations owners choose density;
    Public uses evidence-led composition and does not inherit an admin queue.
12. **Anti-patterns:** No repeated card parade, fake metrics, pointer-only row
    activation, spinner-only loading, or collection state that implies an
    Order, reservation, payment, or production result.
13. **Migration:** Existing page-local collections remain. `ResponsiveTable`
    stays provisional until keyboard, identity, mobile, and domain evidence
    are reviewed; rollback means retaining the current page composition.

### 5.4 Cursor and load-more mechanics

1. **Name/purpose/owner/status:** Existing route-local pagination/cursor or
   load-more controls using Button and state primitives; adopted mechanics,
   no shared Pagination component.
2. **Use / not use:** Use only when the route/API defines a stable cursor or
   page contract. Do not simulate pagination, fabricate an end state, or
   re-submit an uncertain irreversible mutation.
3. **Anatomy:** Existing-record region, contextual loading label, load-more or
   next/previous control, end-of-list indication, and failure/retry region.
4. **Variants/sizes/content:** Button/loading label stays readable; long
   result copy wraps; a page may use cursor or page controls without changing
   record identity.
5. **API continuity:** Preserve current route/API request shape and cursor
   ownership; no new backend field, cache, or provider is introduced.
6. **States:** Ready, loading more, end, dependency failure, retry-safe,
   stale/conflict, offline/unavailable, and recovery with existing records
   retained.
7. **Interaction/accessibility:** Disable duplicate requests, announce the
   bounded status, keep focus on the control or new-result summary, and expose
   end/error text independent of color.
8. **Responsive/overflow:** Control remains 44px and available at narrow
   widths; new records do not push the focused control offscreen without a
   predictable scroll/focus policy.
9. **Tokens:** Button, focus, text, surface, spacing, and motion roles; no
   decorative progress or production telemetry token.
10. **Localization:** Loading-more, end-of-results, retry, and failure copy
    are complete in ID/EN and tolerate long wording.
11. **Restrictions:** Retail, Account, and Operations may use it when their
    resource contract supports it; no Public route gains hidden data access.
12. **Anti-patterns:** No blind retry loop, duplicate Order/payment/Inquiry
    mutation, progress bar implying production, or silent record replacement.
13. **Migration:** Existing route-local controls are preserved. Any future
    shared pagination requires two same-meaning consumers and rollback notes.

### 5.5 Record identity and return context

1. **Name/purpose/owner/status:** Surface-native record heading/metadata and
   breadcrumb/return composition using Heading, TechnicalLabel, Button, and
   route-owned links; adopted mechanics, no new RecordCard component.
2. **Use / not use:** Use to identify an authorized record and its current
   context. Do not expose a private identifier, client detail, internal note,
   or stale authority merely because a component can render it.
3. **Anatomy:** Accessible heading, human label, safe reference when allowed,
   factual metadata, status adapter where applicable, breadcrumb/back link,
   and owned actions.
4. **Variants/sizes/content:** Queue row/list item/detail header; identifiers
   wrap or use a copy-safe presentation; long names do not clip the primary
   action.
5. **API continuity:** Reuse current page props and route params; ownership
   and data projection remain server/domain contracts; no generic record API.
6. **States:** Loading identity, ready, not found/permission-safe, stale or
   conflict, expired, dependency error, recovery, and success for an owned
   action.
7. **Interaction/accessibility:** Heading and current location are semantic;
   back/return is keyboard reachable; focus returns to the invoking queue item
   when safe; unavailable actions explain the next authorized step.
8. **Responsive/overflow:** Detail header stacks at narrow widths; metadata
   wraps; action grouping keeps the primary next action visible at 320px.
9. **Tokens:** Heading, text, surface, border, focus, spacing, and status
   presentation roles; no lifecycle-colored page background.
10. **Localization:** ID/EN headings, metadata labels, dates, references,
    not-found and permission-safe copy must remain factual and readable.
11. **Restrictions:** Account receives owned-record projections; Operations
    receives role-filtered projections; Public and Retail receive only public
    or non-sensitive discovery data.
12. **Anti-patterns:** No route visibility as authorization, guessed detail
    links for reserved project paths, fake reference, or stale action retry.
13. **Migration:** Preserve current route components and return behavior;
    future shared record patterns require consumer and projection evidence.

### 5.6 Neutral status presentation and domain adapters

1. **Name/purpose/owner/status:** Shared `Badge` is adopted presentation;
   `B2BStatusBadge`, `PortfolioStatusBadge`, `RetailOrderStatusBadge`,
   `WorkOrderStatusBadge`, `AccountStatusBadge`, and
   `LegacyOrderStatusBadge` are adopted, lifecycle-bounded domain adapters.
2. **Use / not use:** Use a named adapter when a resource status must be
   presented. Do not use a generic Badge tone or adapter as a transition,
   permission, payment, production, or availability authority.
3. **Anatomy:** Visible localized status label, optional non-authoritative
   tone/icon, and a neutral fallback for unknown values. Critical meaning is
   present in text.
4. **Variants/sizes/content:** Existing Badge tones and adapter APIs; labels
   wrap; no animated status color or required hover tooltip.
5. **API continuity:** Adapters require their resource kind/status where
   applicable and preserve current fallback behavior; no cross-resource alias.
6. **States:** Known, unknown/fallback, loading, stale/conflict, permission
   safe, expired, and dependency/uncertain presentation as defined by owner.
7. **Interaction/accessibility:** Non-interactive status is a semantic text
   element; status changes are visible and announced through the owning region;
   color never carries the only meaning.
8. **Responsive/overflow:** Long statuses wrap within row/detail constraints;
   no clipped badge or status-only column at narrow widths.
9. **Tokens:** Neutral Badge tone, text, border, focus only when interactive,
   and motion-instant/feedback roles; no raw lifecycle color token.
10. **Localization:** Adapter owns ID/EN label mapping for its resource;
    unknown values use safe localized fallback, never raw backend secrets.
11. **Restrictions:** One adapter per lifecycle/resource family. Similar tones
    do not merge Inquiry, Quote, Project, Retail Order, Work Order, Portfolio,
    Account, or legacy Order.
12. **Anti-patterns:** No `quote_required` as a status authority, no generic
    “active” across resources, no fake production progress, and no click action
    implied by a badge.
13. **Migration:** Current adapters and lifecycle tests remain. Any convergence
    must prove same resource meaning, consumer evidence, fallback behavior, and
    rollback; no adapter is retired by DS-04.

## 6. Surface and lifecycle calibration

<!-- markdownlint-disable MD013 -->

| Surface / route family | Shared mechanics | Owner-specific meaning and states | Explicit boundary |
| --- | --- | --- | --- |
| Commerce — `/retail`, `/en/retail` | Query/filter controls, collection shell, product identity, empty/no-match/error, cursor or load-more where API supports it | `RetailCatalogPage` presents public discovery, categories, factual availability, loading, dependency error, empty, filter/no-match, pagination/loading-more, and ready states | No guest checkout, private upload, authoritative price, reservation, payment, production ETA, or provider promise. |
| Account — `/dashboard`, `/orders/:id` | Collection/list, record identity, safe return, loading/empty/error/retry, status presentation | `ClientDashboard` and `OrderDetail` present owned legacy Order projections and permitted status/download actions | Customer-safe projection excludes internal cost, margin, supplier, profit, and notes; ownership remains server-enforced. |
| Operations — B2B queues, Catalog, Inventory, Orders, Portfolio, Work Orders | Dense table/list, query/filter/reset, cursor/load-more, record identity, permission-safe actions, conflict/recovery | `B2BList` separates Inquiry, Quote, Project, Work Order, and Retail Order queues; admin pages own resource-specific status adapters and mutations | Route visibility is not authorization; no invented KPI, telemetry, payment/provider truth, or cross-resource lifecycle. |
| Public — Projects, FAQ, Marketing archive | Factual collection/empty/error and record identity where useful | Public evidence and FAQ use editorial composition, visible captions, and truthful missing-content treatment | No reserved project-detail link, private record, generated evidence, or Operations queue density. |

<!-- markdownlint-enable MD013 -->

### 6.1 Status mapping rule

The shared `Badge` may render a `success` tone for unrelated statuses, but the
adapter remains the owner of the label and allowed values. `quote_required` is
a routing/commitment result, not an arbitrary Badge status. Inquiry, Quote,
Project, Retail Request, Assisted Retail Offer, Retail Order, legacy Order,
Work Order, Portfolio, and Account transitions remain distinct even when a
screen presents them in the same collection shell.

## 7. State and recovery matrix

<!-- markdownlint-disable MD013 -->

| State | Collection requirement | Record/status requirement | Recovery and prohibited shortcut |
| --- | --- | --- | --- |
| Ready | Query scope, factual results, and available next action are clear. | Identity and status are readable in context. | Continue owned task; no decorative shell without task. |
| Loading/bootstrap | Skeleton mirrors the final hierarchy; duplicate query/load-more is prevented. | Identity/status skeleton does not imply a value. | Cancel only when safe; no spinner-only collection. |
| Empty | State why the authoritative scope has no records. | No fake status or count. | Offer the next authorized action; do not imply dependency failure. |
| No-match | Distinguish criteria mismatch from globally empty collection. | Preserve record identity outside current scope when route permits. | Remove/reset filters; do not erase query silently. |
| Dependency/system error | Keep prior safe records/context when allowed and expose bounded retry. | Do not mark valid record fields invalid or claim a status. | Retry/fallback only when safe; no fake count or success. |
| Loading more | Retain existing records and label the loading control. | Existing statuses remain stable. | Retry the safe request; no duplicate mutation or blind loop. |
| Conflict/stale | State what changed and preserve safe query/selection. | Show authoritative version or require reload/reconfirm. | No silent last-write-wins or stale status action. |
| Permission/forbidden | Avoid revealing protected collection/record detail. | Use permission-safe identity/status copy. | Return to owned context or authorized help; route visibility is not authority. |
| Expired/offline/uncertain | State whether data is stale, unavailable, or final outcome unknown. | Do not present cached status as current authority. | Reconcile before irreversible retry; retain only permitted context. |
| Recovery | Return focus and scroll to the active collection/record context. | Restore only safe filters, cursor, and route context. | No unrelated redirect, lost work, or fabricated persistence. |
| Success | Collection refresh names what changed only when authoritative. | Status/action success names resource, reference, owner, and remaining work. | Provide next owned action; no Order/payment/provider success before authority. |

<!-- markdownlint-enable MD013 -->

## 8. Accessibility, responsive, localization, and motion checks

- Query, filters, reset, result summary, collection region, record heading,
  status, and actions have semantic names, roles, values, and relationships.
- Keyboard users can apply/remove/reset criteria, reach each row/card action,
  load more, recover errors, and return to the invoking context without a
  pointer-only row or card path.
- 44 × 44px remains the general mobile target; narrow layouts preserve the
  primary query, identity, status, and action at 320px and 390px.
- Tables use real headings and relationships; when reflow is unsafe, a
  semantic list/card alternative repeats all critical identity and action
  content without inventing a new lifecycle.
- Indonesian and English labels, statuses, dates, identifiers, filter values,
  counts, and error/recovery copy are tested as long content. Approximately
  65–75ch is used for prose where appropriate.
- Important state is visible to sighted users and assistive technology; a
  toast/live region may reinforce but cannot be the only error, conflict,
  uncertainty, or success representation.
- Reduced motion removes spatial movement, stagger, and decorative progress;
  it retains visible collection replacement, loading, focus, error, recovery,
  and success feedback. No `transition: all` or motion-dependent meaning is
  introduced.

## 9. Consumer and promotion evidence

<!-- markdownlint-disable MD013 -->

| Candidate mechanic | Current evidence | Status and next gate |
| --- | --- | --- |
| Query/filter/reset | Retail catalog controls; Operations catalog, inventory, orders, and B2B lists | Reuse primitives and route-local composition; no shared Search/FilterBar promotion. |
| Collection shell | Retail catalog, Account dashboard/order detail, Operations queues and editors | Shared laws documented; density and lifecycle remain surface/domain-owned. |
| Table/list/card alternative | Existing `Table`/page-local lists; `ResponsiveTable` has zero consumers | `ResponsiveTable` remains provisional until keyboard, identity, narrow-layout, and domain evidence exists. |
| Cursor/load-more | Route/API evidence only where current source exposes it | No shared Pagination API; exact consumer and safe retry evidence required. |
| Record identity/return | Product detail, customer order detail, Admin detail/queue routes | Keep route/domain components; reserved project-detail paths remain inactive. |
| Neutral Badge | Current lifecycle adapters and legacy status adapter | Shared presentation adopted; resource adapters remain separate and tested per kind. |
| `Progress` / `StatCard` | Zero application consumers in DS-01A | Provisional; no adoption or factual KPI/production progress claim. |

<!-- markdownlint-enable MD013 -->

Two visually similar statuses do not constitute one semantic consumer. A future
promotion requires two independent real consumers with the same meaning, the
NDS 13 fields, state/accessibility/localization evidence, owner approval, and a
separate exact-file migration card.

## 10. Internal self-review record

Self-review completed against `8555685c29a3fde9976ae6499336e2eb45a330ba` before
moving to DS-05:

- source and DS-01A/DS-01B consumer names were spot-checked against current
  component and route ledgers;
- every mechanics record in Section 5 contains all 13 NDS fields;
- collection, no-match, empty, error, load-more, conflict, permission,
  expired/offline/uncertain, recovery, and success states are explicit;
- Retail, Account, Operations, and Public boundaries remain separate;
- `ResponsiveTable`, `Progress`, `Separator`, and `StatCard` are not adopted;
- status adapters retain resource kind and lifecycle ownership;
- keyboard, narrow-screen, ID/EN, 200% zoom, reduced-motion, focus/recovery,
  and visible-state requirements are recorded;
- local links resolve; trailing whitespace is absent; and lines over 80 columns
  occur only inside MD013-disabled tables or code-like identifiers; and
- no application source, dependency, route, token, API, or lifecycle file was
  modified.

**Verification:** Structural checks passed for record fields, required states,
local links, trailing whitespace, and scoped long-line exceptions. Markdownlint
was not available in the worktree and was not installed. Browser and runtime
checks are not claimed because this task changed documentation only.

## 11. Rollback and handoff

This artifact is untracked documentation in the blueprint working set. To
discard DS-04 only, remove this file before any staging; no source rollback,
database rollback, route rollback, or migration is required. The next gate is
consolidated owner review after DS-05, followed separately by any exact-file
source task authorization.
