# DS-03 Shared Feedback, Overlay, and State Region Specification

**Status:** Candidate — Context Only — Phase 6 `DS-03` completed for internal
self-review; owner review is consolidated with DS-02, DS-04, and DS-05

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Objective:** Define the shared perceivable and operable contract for
`Dialog`, `AlertDialog`, `Alert`, the Sonner reinforcement adapter, `Skeleton`,
`EmptyState`, `ErrorState`, `OperationalState`, and `SurfacePanel` without
changing source, lifecycle labels, token values, or domain recovery rules.

**Authorization:** This is the second documentation task in the owner-
authorized DS-02–DS-05 goal. It is not application implementation, a new
overlay dependency, a state-machine change, or a route/capability activation.

## 1. Authority and boundary

Read this record after the canonical authority order, approved semantic token
contract, [`DESIGN_BRIEF.md`](../DESIGN_BRIEF.md),
[`INFORMATION_ARCHITECTURE.md`](../INFORMATION_ARCHITECTURE.md),
[`COMPONENT_STATUS.md`](COMPONENT_STATUS.md), and the DS-01B route matrix.
`OperationalState` and similar components present state; the domain still
owns why the state exists, whether a retry is safe, what persisted, who owns
the resource, and what success means.

### Included

- current adopted overlay, feedback, loading, empty, error, state-region, and
  grouping primitives;
- keyboard/focus entry and return, Escape/dismissal, screen-reader
  name/role/value, visible critical feedback, reduced motion, and responsive
  behavior;
- state grammar for loading, empty/no-match, validation, system error,
  permission, conflict/stale, expired, offline, uncertain, recovery, and
  success; and
- current Public plus private/Operations consumers as evidence.

### Excluded

- `Drawer` and its undeclared `vaul` import; it remains quarantined;
- a new toast provider, overlay dependency, state enum, lifecycle label, or
  token;
- automatic retry, optimistic success, payment/order/inquiry authority,
  backend permission, API/schema, or route changes; and
- visual redesign of existing overlays or panels.

## 2. Shared feedback laws

1. **Visible first:** Critical failure, conflict, uncertainty, permission,
   recovery, and success remain in the page/task region. A toast or live region
   may reinforce them but cannot be the only representation.
2. **Authority stays domain-owned:** A shared component never converts
   `loading`, `success`, `quote_required`, or `uncertain` into a backend state.
3. **Retry is conditional:** A retry is offered only when the owning domain
   confirms it is safe, idempotent, and does not duplicate an irreversible
   effect. Uncertain payment/order/reservation/inquiry outcomes reconcile first.
4. **Focus follows the task:** Opening an overlay moves focus to an appropriate
   labelled target; closing returns it to the invoking control when it remains
   valid; page errors move focus to a visible summary or state region without
   stealing focus on every update.
5. **State is not color-only:** Text, semantics, icon, and action explain the
   state. Icons and tone are supporting cues.
6. **Motion is optional:** Reduced motion removes spatial/scale/path motion but
   keeps the state, focus, loading feedback, and success/recovery content.

## 3. Contract records

### 3.1 `Dialog`

1. **Purpose/owner/status:** Radix-based modal overlay, Foundation maintainer,
   adopted; current API is the local wrapper in `dialog.jsx`.
2. **Use / not use:** Use for bounded contextual work that does not need a
   durable route. Do not use to hide critical errors, replace a page-level
   recovery path, or make a domain mutation authoritative by opening.
3. **Anatomy:** Root, trigger, portal, overlay, content, title, description,
   close, header, and footer; title/description are required when the dialog
   has nontrivial meaning.
4. **Variants/content:** Current content max width, panel radius, overlay, and
   footer slots remain API-compatible; long ID/EN headings and errors wrap.
5. **API continuity:** Preserve Radix controlled/uncontrolled `open`,
   `onOpenChange`, trigger/close/portal/content exports, refs, and children.
6. **States:** Closed, opening/open, closing, disabled action, inline
   validation, dependency failure, conflict/uncertain mutation, and success
   handoff where the domain can state exactly what completed.
7. **Interaction/accessibility:** Radix focus trap and return, Escape where
   safe, labelled title/description, visible close name, keyboard action parity,
   and no outside-click dismissal for an in-progress irreversible action unless
   the domain defines cancellation safety.
8. **Responsive/overflow:** Content fits 320px and 200% zoom, scrolls inside a
   bounded region when needed, and keeps primary/cancel actions reachable.
9. **Tokens:** Surface, border, overlay, shadow, radius, focus, and deliberate
   motion roles; current blur/overlay values are existing implementation
   evidence, not a new global visual direction.
10. **Localization:** Caller supplies title, description, close, actions,
    errors, and recovery; no English-only fallback may be the only label.
11. **Restrictions:** Shared mechanics across surfaces; Public, Commerce,
    Account, and Operations own content, permission, mutation, and recovery.
12. **Anti-patterns:** No modal for every confirmation, hidden critical state,
    modal stacking without an owner, or success before persistence.
13. **Migration:** Preserve current Radix wrapper. Any focus/dismissal change
    requires keyboard and screen-reader tests plus rollback.

### 3.2 `AlertDialog`

1. **Purpose/owner/status:** Radix alert-dialog for consequential confirmation,
   Foundation maintainer, adopted.
2. **Use / not use:** Use when an action is destructive, irreversible, or needs
   explicit confirmation. Do not use for ordinary information or as a toast.
3. **Anatomy:** Root, trigger, portal, overlay, content, title, description,
   action, and cancel; both actions have visible labels.
4. **Variants/content:** Current full-width bounded content and stacked mobile
   footer; long policy/reason/error copy must wrap before actions.
5. **API continuity:** Preserve Radix controlled open state, action/cancel
   semantics, refs, and exported wrapper names.
6. **States:** Closed/open, action pending, validation/dependency failure,
   conflict/stale recheck, cancelled, completed, and uncertain outcome.
7. **Interaction/accessibility:** Focus enters title or first meaningful action,
   Escape/cancel is safe, destructive action is not defaulted by focus alone,
   and completion/error remains visible after close when relevant.
8. **Responsive/overflow:** Actions stack without clipped labels; 44px targets
   and 200% reflow remain intact.
9. **Tokens:** Overlay, surface, border, action/destructive, focus, radius, and
   deliberate motion roles; no domain status encoded in a tone alone.
10. **Localization:** Exact destructive consequence, cancel, action, pending,
    error, and recovery copy are domain-owned ID/EN content.
11. **Restrictions:** The component confirms intent; backend permission,
    lifecycle, idempotency, and final success remain authoritative elsewhere.
12. **Anti-patterns:** No confirm dialog for a reversible navigation, no vague
    `OK`, no duplicate submit, and no claimed success merely because the dialog
    closed.
13. **Migration:** Preserve current Radix API and focus contract. Any new
    destructive action requires domain-specific state and test evidence.

### 3.3 `Alert`

1. **Purpose/owner/status:** Visible inline feedback region with `info`,
   `success`, `warning`, `error`, and `default` tones; Foundation maintainer,
   adopted.
2. **Use / not use:** Use for contextual status that belongs beside the task.
   Do not use color as the message or call a provider success without proof.
3. **Anatomy:** Visible region, optional heading/content/actions, semantic role
   selected by caller, and optional associated control.
4. **Variants/content:** Existing tone variants and className; long errors,
   consent text, and recovery actions wrap; no fixed-height clipping.
5. **API continuity:** Preserve `tone`, `role`, ref, className, and native
   div/ARIA props.
6. **States:** Informational, validation, dependency/system, permission,
   conflict, uncertain, and authoritative success as applicable.
7. **Interaction/accessibility:** Default alert role remains available; polite
   status is used when interruption is not urgent; visible text is always
   present and action controls are keyboard reachable.
8. **Responsive/overflow:** Full-width region can wrap at 320px; action links
   stack or wrap and retain 44px targets.
9. **Tokens:** Status semantic pairings, surface, border, text, focus, and
   spacing roles; tone does not create a lifecycle enum.
10. **Localization:** Caller-owned ID/EN heading, body, action, and next step;
    error text cannot be English-only inside the primitive.
11. **Restrictions:** Shared presentation. Inquiry, Retail, Account, and
    Operations supply their own factual cause and recovery.
12. **Anti-patterns:** No color-only meaning, toast-only critical message,
    generic `Sent`, or alert that permanently blocks unrelated work.
13. **Migration:** Existing `Alert` API remains. Tone/status consolidation needs
    consumer and contrast evidence; no source change in DS-03.

### 3.4 Sonner reinforcement adapter

1. **Purpose/owner/status:** `Toaster` plus `toast` export, transient
   reinforcement, Foundation maintainer, adopted.
2. **Use / not use:** Use for noncritical confirmation or a reinforcement of a
   visible region. Do not use as the only failure, conflict, uncertainty,
   permission, or success representation.
3. **Anatomy:** App-level Toaster plus caller-provided title/description/action
   and duration policy; no hidden critical details.
4. **Variants/content:** Current adapter preserves Sonner API and dark theme
   configuration; long content must remain readable or have an in-page source.
5. **API continuity:** Preserve `toast` calls and `Toaster` placement; do not
   introduce a second provider or a new wrapper without a separate decision.
6. **States:** Reinforce visible ready, success, error, or retry state; it does
   not own loading, persistence, uncertain, or lifecycle authority.
7. **Interaction/accessibility:** Dismissible and keyboard reachable according
   to Sonner; critical content also exists in the document flow or state region.
8. **Responsive/overflow:** Toasts must not cover sticky controls, focus, or
   essential actions at mobile widths; in-page fallback remains available.
9. **Tokens:** Existing adapter surface/text/border/shadow roles only; its
   `theme="dark"` is not a global dark theme decision.
10. **Localization:** Caller supplies ID/EN title, description, action, and
    dismissible labels; timeout must not be the only chance to read a result.
11. **Restrictions:** Reinforcement only across surfaces; domain state remains
    in the page and backend.
12. **Anti-patterns:** No toast-only form failure, no `Sent` without UUID, no
    retry that can duplicate an irreversible mutation, and no stacked noise for
    every field.
13. **Migration:** Current 22 direct package consumers are a convergence
    finding. A wrapper migration requires inventory, parity tests, and rollback;
    DS-03 does not perform it.

### 3.5 `Skeleton` and `SkeletonGroup`

1. **Purpose/owner/status:** Shape-matched loading placeholder and announced
   loading group, Foundation maintainer, adopted.
2. **Use / not use:** Use when final hierarchy is known and content is loading.
   Do not use blank spinner-only pages or imply data exists before it does.
3. **Anatomy:** `Skeleton` shape, optional `SkeletonText`, `SkeletonCard`,
   `SkeletonTableRow`, and `SkeletonGroup` status wrapper.
4. **Variants/content:** Current text/heading/avatar/card/button shapes and
   sizes; shapes must mirror final content without layout shift.
5. **API continuity:** Preserve current variant/size/className and group label/
   children; no stateful data fetching in the primitive.
6. **States:** Loading only; transition to ready, empty, error, unavailable, or
   retry is owned by the route. Skeleton content is not a success claim.
7. **Interaction/accessibility:** Visual shapes are `aria-hidden`; group exposes
   one polite busy status; no focusable skeleton controls.
8. **Responsive/overflow:** Placeholder geometry follows the final responsive
   hierarchy at 320/390/768/1024/1440 and 200% zoom.
9. **Tokens:** Muted surface, radius, spacing, and reduced-motion-safe pulse;
   no page-specific image or metric placeholder.
10. **Localization:** Group label is caller-owned ID/EN and announces the task,
    not a fabricated result.
11. **Restrictions:** Shared visual loading mechanic; domain owns what is
    pending and whether cancellation is safe.
12. **Anti-patterns:** No skeleton forever, fake metrics, spinner-only page,
    or hidden final action while loading.
13. **Migration:** Keep current shapes and tests. `SkeletonGroup` has no current
    production consumer despite module adoption; first use needs consumer QA.

### 3.6 `EmptyState`

1. **Purpose/owner/status:** Visible no-data or loading-intent region,
   Foundation maintainer, adopted.
2. **Use / not use:** Use when the owning query has resolved to no data or a
   bounded loading presentation. Do not use for dependency failure or as a
   decorative illustration without a valid next action.
3. **Anatomy:** Optional icon, visible message, optional frame, and caller-owned
   action or recovery.
4. **Variants/content:** `none`, `solid`, `dashed`, icon, and loading branches;
   long copy/action wraps and remains visible.
5. **API continuity:** Preserve `frame`, `icon`, `loading`, `as`, className,
   children, ref, and native props.
6. **States:** Empty, loading placeholder, no-match via caller distinction,
   and recovery/next action. Error and unavailable use error/state components.
7. **Interaction/accessibility:** Visible message explains why and what next;
   action is keyboard reachable; loading announcement is not the only hierarchy.
8. **Responsive/overflow:** Content stays readable at narrow widths and 200%
   zoom; icon does not displace the recovery action.
9. **Tokens:** Empty surface/text/icon, border, spacing, radius, and reduced
   motion roles.
10. **Localization:** Caller owns ID/EN reason and action; no generic English
    sentence hidden in the primitive.
11. **Restrictions:** Domain supplies whether no data is normal, filtered,
   unpublished, permission-scoped, or a failed dependency.
12. **Anti-patterns:** No empty state for an error, no invented metric, no
   disabled action without reason, and no repeated decorative card parade.
13. **Migration:** Resolve overlap with Skeleton and OperationalState through
   later source/consumer QA; do not delete or merge in DS-03.

### 3.7 `ErrorState`

1. **Purpose/owner/status:** Visible compact/full error plus optional retry,
   Foundation maintainer, adopted.
2. **Use / not use:** Use for a known failed load/action with safe recovery.
   Do not mark valid fields invalid for a dependency error or promise success.
3. **Anatomy:** Alert region, error message, optional detail, optional retry
   Button; compact mode must preserve an accessible retry name.
4. **Variants/content:** Full and compact; current message may wrap and must
   not rely on the existing English `Retry` fallback for localized routes.
5. **API continuity:** Preserve `error`, `onRetry`, `compact`, children,
   className, ref, and native props.
6. **States:** Dependency/system error, retry pending via caller, permission or
   conflict variant via `OperationalState` where richer semantics are needed.
7. **Interaction/accessibility:** `role=alert` is visible; retry has a 44px
   target, name, focus behavior, and idempotency; focus returns to task context.
8. **Responsive/overflow:** Long error and retry copy wrap; compact controls do
   not clip or cover the page action at 320px.
9. **Tokens:** Error status pair, border, surface, text, focus, spacing, and
   Button roles.
10. **Localization:** Error, detail, retry, and context are caller-owned ID/EN;
    replacing the current hardcoded fallback needs a separate source task.
11. **Restrictions:** Shared presentation; caller states whether persistence
    happened, whether retry is safe, and where to return.
12. **Anti-patterns:** No toast-only error, no generic `Retry` with unknown
    effect, no field invalidation for provider failure, and no blind retry loop.
13. **Migration:** Preserve API. A richer error taxonomy belongs in
    `OperationalState` or a domain spec, not a hidden variant expansion.

### 3.8 `OperationalState`

1. **Purpose/owner/status:** Perceivable state region for private/Operations
   task states, Foundation plus surface owners, adopted.
2. **Use / not use:** Use when the page needs explicit loading, empty,
   no-match, error, conflict, stale, expired, unavailable, uncertain, or
   success meaning. Do not use it as a backend enum or generic decoration.
3. **Anatomy:** Section, state icon, visible title, optional description, and
   optional retry; caller supplies domain-safe copy.
4. **Variants/content:** Current state names and `data-testid`; descriptions
   and retry labels wrap; success must name reference/ownership when relevant.
5. **API continuity:** Preserve `state`, title, description, retryLabel,
   onRetry, className, and semantic attributes.
6. **States:** Current `STATE_META` states are supported; mapping does not imply
   a new backend lifecycle or a universal status set.
7. **Interaction/accessibility:** Error/conflict/uncertain use assertive alert;
   other states use polite status; loading exposes `aria-busy`; retry is visible
   and bounded.
8. **Responsive/overflow:** Minimum region remains usable at 320px/200% zoom;
   long recovery copy and actions stack without clipped context.
9. **Tokens:** State semantic colors/icons, surface, border, focus, spacing,
   and reduced-motion-safe loading roles.
10. **Localization:** Caller supplies state title, description, retry, and next
    action in ID/EN; icon/tone cannot carry translation alone.
11. **Restrictions:** Domain-owned for Inquiry, Retail Request/Offer/Order,
    Account, B2B, Work Order, permission, and publication meanings.
12. **Anti-patterns:** No status transition implied by visual state, no
    duplicate payment/order/inquiry retry, no internal detail leakage, no
    toast-only state.
13. **Migration:** Preserve current tests and state names. Any new state needs
    authority, consumer, copy, accessibility, and rollback review.

### 3.9 `SurfacePanel`

1. **Purpose/owner/status:** Semantic grouping surface, Foundation maintainer,
   adopted.
2. **Use / not use:** Use for one meaningful contained region. Do not use every
   section as a card, nest panels into card soup, or imply lifecycle authority.
3. **Anatomy:** Polymorphic panel, optional header, content, padding, and
   default/dashed intent.
4. **Variants/content:** `none/sm/md/lg` padding and `default/dashed` intent;
   panel titles/actions wrap; no fixed-height content clipping.
5. **API continuity:** Preserve `as`, `padding`, `intent`, className, ref, and
   native props; header remains separate.
6. **States:** Container may host any domain state but does not own it; panel
   loading/empty/error content belongs to the child state region.
7. **Interaction/accessibility:** Use semantic element/heading as appropriate;
   no focus trap; focus belongs to child controls and remains visible.
8. **Responsive/overflow:** Padding collapses only through caller composition;
   contained tables/forms need an explicit narrow-screen alternative.
9. **Tokens:** Surface, border, radius, shadow, spacing, and muted header roles;
   flat-first rules apply.
10. **Localization:** Header and content are caller-owned ID/EN; long titles
    wrap without changing meaning.
11. **Restrictions:** Shared grouping across surfaces; Public, Commerce,
   Account, and Operations decide density and content ownership.
12. **Anti-patterns:** No default shadow on every block, decorative header,
   panel as permission, or panel used to hide critical error.
13. **Migration:** Preserve current API and existing consumers. Two direct
   consumers are unused candidates in DS-01A; first real adoption needs DS-04/
   surface QA.

## 4. State ownership matrix

<!-- markdownlint-disable MD013 -->

| State | Shared presentation contract | Domain-owned meaning and next action |
| --- | --- | --- |
| Loading/bootstrap | Stable hierarchy, one announced status, `aria-busy`, duplicate-action prevention | Which route/content/session dependency is pending and whether cancellation is safe |
| Empty/no-match | Visible explanation and reset/next-action slot | Why no data exists, current filter/query, and authorized next route |
| Validation | Visible summary/field relationship, focus recovery, retained values | Field rules, consent, password policy, commercial/file constraints |
| Dependency/system error | In-page alert/state region and bounded retry slot | Whether anything persisted, fallback, idempotency, and dependency truth |
| Permission/forbidden | Non-leaking unavailable region and safe return slot | Role, ownership, escalation, and protected-detail boundary |
| Conflict/stale/expired | Compare/reload/reconfirm presentation and preserved work | Authoritative version, offer/file/session expiry, and safe mutation |
| Offline/uncertain | Visible unknown/unavailable message and no duplicate action | Reconciliation before irreversible retry and exact persisted result |
| Recovery | Focus/scroll return to task context | Which context may be retained and which authority must be reacquired |
| Success | Persistent visible reference, ownership, and remaining-next-step slots | Existing Inquiry UUID, Order/payment/publication result, lifecycle owner, and what did not complete |

<!-- markdownlint-enable MD013 -->

## 5. Consumer evidence

At least one Public and one private/Operations consumer are required for the
state-region contract. Current evidence includes:

<!-- markdownlint-disable MD013 -->

| Primitive | Public or Commerce evidence | Account/Operations evidence | Disposition |
| --- | --- | --- | --- |
| `Alert` / `ErrorState` | `pages/marketing/ContactPage.jsx`, `AboutPage.jsx`, `CapabilitiesPage.jsx` | `pages/auth/CustomerLogin.jsx`, `pages/admin/Customers.jsx`, `Orders.jsx` | Shared presentation; copy, retry, and persistence remain local. |
| `Skeleton` / `EmptyState` | `pages/marketing/ProjectsPage.jsx`, `CapabilitiesPage.jsx`, `pages/retail/RetailCatalogPage.jsx` | `pages/admin/Catalog.jsx`, `Inventory.jsx`, `PortfolioAdmin.jsx` | Shape/data distinction remains explicit. |
| `OperationalState` | `pages/retail/RetailProductPage.jsx` | `pages/operational/ClientDashboard.jsx`, `OrderDetail.jsx`, multiple Admin detail/queue pages | Domain state names and retries remain separate. |
| `SurfacePanel` | Current public panel compositions are page-owned | `AuthShell`, `pages/operational/*`, and Admin pages | Grouping only; no lifecycle authority. |
| `Dialog` / `AlertDialog` | Public use is limited/current evidence; no new Public modal is implied | Admin confirmation/edit consumers and shared Radix wrappers | Focus/dismissal contract is specified; Drawer remains excluded. |
| Sonner | Contact and Public action reinforcement | Admin/auth mutation reinforcement | Never the only critical feedback; direct-consumer convergence is deferred. |

<!-- markdownlint-enable MD013 -->

## 6. Verification and self-review

Completed for DS-03 against `8555685c`:

<!-- markdownlint-disable MD013 -->

| Check | Result |
| --- | --- |
| API/source reconciliation | Pass — current wrapper exports, state names, Radix mechanics, Toaster adapter, and DS-01A restrictions were checked. |
| Visible critical feedback | Pass — failure, conflict, uncertain, permission, recovery, and success cannot be toast/live-region-only. |
| Overlay focus/dismissal | Pass as specification evidence — focus entry/return, Escape, outside-click safety, action/cancel, and long-content rules are explicit. |
| State grammar | Pass — loading, empty/no-match, validation, dependency error, permission, conflict/stale, expired, offline, uncertain, recovery, and success are mapped. |
| Public/private consumers | Pass — current Public/Commerce and Account/Operations examples are recorded. |
| Accessibility/localization | Pass as specification evidence — names/roles/values, keyboard, 44px target, ID/EN expansion, 200% reflow, and reduced motion are explicit. |
| Drawer boundary | Pass — `Drawer` and undeclared `vaul` remain quarantined and excluded. |
| Scope | Pass — no source, state enum, token, dependency, route, or lifecycle change is proposed. |
| Links/whitespace | Pass — local links and whitespace were checked after creation. |

<!-- markdownlint-enable MD013 -->

Runtime browser and screen-reader proof remains a later source/QA gate; this
document does not claim it.

## 7. Next gate and explicit exclusions

DS-04 may be documented next under the same owner-authorized goal. Source
implementation, overlay changes, toast convergence, token promotion, and
delivery gates remain separate.

This record does not authorize `Drawer`/`vaul`, a new feedback provider,
automatic retries, page redesign, route/API/schema changes, payment/order/
Inquiry authority, or any application source/test modification.
