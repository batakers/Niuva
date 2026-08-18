# DS-02 Shared Action and Form Primitive Specification

**Status:** Candidate — Context Only — Phase 6 `DS-02` completed for internal
self-review; owner review is consolidated with DS-03 through DS-05

**Date:** 18 August 2026

**Repository baseline:** `origin/main`
`8555685c29a3fde9976ae6499336e2eb45a330ba`

**Objective:** Complete the NDS 13-field contract for the current shared
action and form mechanics without changing their source APIs, adding a
component, promoting a token, or assigning lifecycle authority to a primitive.

**Authorization:** The owner authorized DS-02 through DS-05 to be executed as
one documentation goal with independent self-review and one consolidated
owner-report. This document is design-system planning evidence only. It does
not authorize application source, tests, tokens, dependency, route, API,
schema, privacy, business-rule, stage, commit, push, PR, merge, deployment,
readiness, or go-live work.

## 1. Authority and relationship

Read this specification after the repository authority order, the approved
semantic token contract, [`DESIGN_BRIEF.md`](../DESIGN_BRIEF.md),
[`INFORMATION_ARCHITECTURE.md`](../INFORMATION_ARCHITECTURE.md),
[`DS-01A`](COMPONENT_STATUS.md), and
[`DS-01B`](../inventory/ROUTE_COMPONENT_MATRIX.md). The source and tests at
the selected SHA remain implementation evidence; this specification does not
supersede the active component register or `DESIGN.md`.

The shared layer owns interaction mechanics, API continuity, baseline
perceivable state, and accessibility wiring. The owning page or domain still
owns labels, copy, consent, password policy, validation rules, persistence,
permission, lifecycle meaning, pricing, and authoritative success.

## 2. Scope and non-goals

### In scope

- `Button`, `Label`, `Input`, `Textarea`, `FormField`, the Radix `Select`
  family, `Switch`, `Tabs`, and the approved native checkbox mechanic;
- current API continuity and explicit state/interaction contracts;
- current real-consumer evidence across Public, Commerce, Account, and
  Operations;
- Indonesian/English long-content, 44px target, focus, keyboard, touch,
  reduced-motion, and 200% reflow requirements; and
- migration/rollback notes that keep source changes in a later exact-file
  task.

### Explicitly out of scope

- a new component, wrapper, Storybook, token, dependency, or runtime donor;
- changes to `BrandButton`, `Drawer`, `ResponsiveTable`, or any domain status
  adapter;
- consent wording, password policy, price/quote rules, upload authority,
  persistence/API schemas, permission decisions, or lifecycle transitions;
- visual redesign of Public, Retail, Account, or Operations compositions; and
- component promotion based only on file existence, exports, or tests.

## 3. NDS 13-field adoption contract

Every future adoption record must fill all fields below. The component records
in Section 4 use this contract; a shared mechanic never becomes a domain state
machine.

<!-- markdownlint-disable MD013 -->

| Field | Required evidence |
| --- | --- |
| 1. Name, purpose, owner, adoption status | Stable name, one purpose, named Foundation or surface owner, and `adopted`, `compatibility-bounded`, `provisional`, or `quarantined` status. |
| 2. When to use / not use | Positive task fit and explicit anti-patterns. |
| 3. Anatomy | Required/optional children, accessible name, relationship, and structural slots. |
| 4. Variants, sizes, content limits | Existing API values, minimum targets, label/error limits, and long-content behavior. |
| 5. Props/API continuity | Existing props, `asChild`/native continuity, controlled/uncontrolled behavior, and breaking-change boundary. |
| 6. Interaction/data states | Ready, hover, focus, active, selected, disabled, loading, validation, dependency, empty/no-match, conflict/stale, expired, offline/uncertain, recovery, and success where relevant. |
| 7. Input/focus/screen-reader behavior | Mouse, keyboard, touch, focus entry/return, name/role/value, error association, and announcement rules. |
| 8. Responsive/overflow behavior | 44px general mobile target, narrow content, wrapping, scroll alternatives, and no clipped critical action. |
| 9. Token dependencies | Core semantic and justified surface/component roles only; no raw page/art-direction value. |
| 10. Localization/long content | ID/EN labels, error/action copy, expansion, and no English-only fallback hidden in the primitive. |
| 11. Surface/domain restrictions | Public, Commerce, Account, Operations, or shared mechanics; lifecycle owner remains explicit. |
| 12. Anti-patterns | Generic card/template reuse, hover-only meaning, color-only state, fake success, and unsafe retry rules as applicable. |
| 13. Migration/deprecation | Current consumers, compatibility plan, verification, rollback, and retirement evidence. |

<!-- markdownlint-enable MD013 -->

### 3.1 Promotion rule

Two independent real consumers with the same semantic meaning are necessary
before a LOCAL or single-surface expression is promoted. They are not
sufficient: the NDS 13 fields, accessibility, localization, state coverage,
owner, migration, and rollback must also be recorded. A component with one
consumer may retain its current source status but must not gain a speculative
second consumer from this document.

## 4. Primitive contracts

The following records describe current source APIs and the bounded contract for
later use. No record changes source today.

### 4.1 `Button`

1. **Name/purpose/owner/status:** `components/ui/button.jsx`, shared action
   mechanic, Foundation maintainer, adopted.
2. **Use / not use:** Use for an action, submit, navigation link with action
   semantics, or bounded disclosure. Do not use to label lifecycle success,
   create an Order, or replace a link whose destination is the primary meaning.
3. **Anatomy:** Native button or Radix `Slot` via `asChild`; visible label or
   accessible name; optional icon; loading icon plus retained label.
4. **Variants/sizes/content:** `default`, `secondary`, `outline`, `ghost`,
   `destructive`, `success`, `link`; `default`, `sm`, `lg`, `icon`; labels wrap
   or remain readable rather than clipping; `icon` requires an accessible name.
5. **API continuity:** Preserve `variant`, `size`, `asChild`, `loading`,
   `disabled`, `className`, native button props, and event behavior. Do not
   change `asChild` disabled semantics without a migration task.
6. **States:** Ready, hover, focus, pressed, disabled, loading, and recovery
   after a failed action. Loading keeps the label and sets `aria-busy`; disabled
   explains the reason when the action would otherwise be expected.
7. **Interaction/accessibility:** Native keyboard activation, pointer/touch
   parity, visible focus ring, no pointer event while unavailable, deterministic
   focus return after a bounded action, and no icon-only unlabeled action.
8. **Responsive/overflow:** Minimum 44px general mobile target; labels may wrap
   or stack; action groups must preserve the primary action at 320px.
9. **Tokens:** Core action, text, border, focus, disabled, radius, and motion
   roles from `DESIGN_TOKENS.md`; no page-specific color or shadow.
10. **Localization:** Label, loading label, unavailable reason, and error
    recovery are caller-owned ID/EN copy and must survive long translations.
11. **Restrictions:** Shared mechanics across all surfaces; Public may compose
    it expressively, while lifecycle and permission semantics remain
    domain-owned.
12. **Anti-patterns:** No `transition: all`, fake success, automatic WhatsApp,
    magnetic/bounce motion, color-only disabled state, or permanent commercial
    commitment styling.
13. **Migration:** Keep current API and consumers. `BrandButton` convergence,
    if desired, requires a separate exact-file task with link-disabled parity,
    consumer inventory, focused tests, and rollback.

### 4.2 `Label`

1. **Name/purpose/owner/status:** `components/ui/label.jsx`, explicit form
   control naming, Foundation maintainer, adopted.
2. **Use / not use:** Use for a visible control label or a deliberately
   documented non-form label. Do not use placeholder text, tooltip, or an
   uppercase eyebrow as the only label.
3. **Anatomy:** Radix label root linked with `htmlFor` to one control; required
   marker is supplemental and not the only required indication.
4. **Variants/sizes/content:** Current label API plus className; wraps for ID/EN
   and long product/admin labels without truncating the accessible name.
5. **API continuity:** Preserve Radix label props, ref, className, and peer
   disabled styling. No new visual variant is needed for a domain status.
6. **States:** Ready, required, disabled association, and validation/error
   association through the owning `FormField`.
7. **Interaction/accessibility:** Clicking the label focuses/toggles its
   control; the label itself is not a fake button; the relationship remains
   inspectable in the accessibility tree.
8. **Responsive/overflow:** Allow two-line labels and keep the control/action
   below it in narrow layouts; never hide the label to make a row fit.
9. **Tokens:** Core text, disabled, and spacing roles only.
10. **Localization:** Caller supplies ID/EN text; required and privacy meaning
    must not be translated inside the primitive.
11. **Restrictions:** Shared form mechanics; domain owns whether a field is
    required, private, consent-bearing, or commercially consequential.
12. **Anti-patterns:** No placeholder-only names, tooltip-only instructions,
    color-only required/error meaning, or decorative section heading misuse.
13. **Migration:** Current consumers retain the API. Any label/field contract
    change must preserve `htmlFor`, error IDs, and screen-reader tests.

### 4.3 `Input`

1. **Name/purpose/owner/status:** `components/ui/input.jsx`, native single-line
   value entry, Foundation maintainer, adopted.
2. **Use / not use:** Use for one value with a native input type. Do not encode
   persistence, price authority, file authorization, or backend lifecycle.
3. **Anatomy:** Native input, caller-owned label, hint/error relationship, and
   optional native type affordance.
4. **Variants/sizes/content:** Native `type`, h-11 current control, full-width
   default, text/email/number/file-compatible behavior; long values remain
   editable and may scroll horizontally within the control.
5. **API continuity:** Preserve native input props, ref, `className`, `id`,
   `name`, `value/defaultValue`, `onChange`, `disabled`, `required`, and ARIA
   attributes. No API widening in this task.
6. **States:** Ready, hover, focus, invalid, disabled, and caller-owned loading
   or stale/uncertain state. Dependency failure must not mark valid input
   `aria-invalid`.
7. **Interaction/accessibility:** Native keyboard editing, visible focus,
   programmatic error association through `FormField`, sensible input mode,
   and no color-only error.
8. **Responsive/overflow:** Minimum 44px height and 16px mobile text; full-width
   or grid placement must avoid horizontal overflow at 320px.
9. **Tokens:** Core surface, control border, focus, error, disabled, text,
   radius, and fast motion roles.
10. **Localization:** Placeholder is optional and never the sole instruction;
    caller-owned ID/EN label, hint, error, and format guidance may expand.
11. **Restrictions:** Shared mechanics; field meaning, privacy, validation,
    sensitive data, and persistence belong to the owning surface/domain.
12. **Anti-patterns:** No placeholder-as-label, silent truncation, arbitrary
    page color, masked failure, or client-only authority claim.
13. **Migration:** Preserve current native behavior and all consumer tests.
    Any file-input or numeric validation change needs a separate exact-file
    contract and rollback.

### 4.4 `Textarea`

1. **Name/purpose/owner/status:** `components/ui/textarea.jsx`, native
   multi-line value entry, Foundation maintainer, adopted.
2. **Use / not use:** Use for briefs, descriptions, and bounded long text. Do
   not use for a rich editor, chat stream, or hidden overflow workaround.
3. **Anatomy:** Native textarea, visible caller label, hint/error relation, and
   optional length/help text owned by the domain.
4. **Variants/sizes/content:** Current min-height 96px; width follows parent;
   long content scrolls inside the control without clipping or losing cursor.
5. **API continuity:** Preserve native textarea props, ref,
   controlled/uncontrolled value, `id`, `name`, `rows`, `maxLength`, disabled,
   required, and ARIA.
6. **States:** Ready, focus, invalid, disabled, submitting/loading owned by
   the form, dependency failure without false field invalidation, and recovery
   with safe entered values.
7. **Interaction/accessibility:** Keyboard editing, resize behavior as the
   owner permits, visible focus, label/error association, and summary focus on
   validation failure.
8. **Responsive/overflow:** At least 44px touch affordance at the top edge;
   width remains within the form at 320px; long ID/EN error copy wraps.
9. **Tokens:** Core surface, border, focus, error, text, radius, and motion
   roles; no page-specific editorial background.
10. **Localization:** Caller owns ID/EN labels, hint, consent explanation,
    error, character limits, and response expectation.
11. **Restrictions:** Public Inquiry, Auth, and Operations may share mechanics;
    their privacy, content, and persistence meanings remain separate.
12. **Anti-patterns:** No hidden required consent, textarea-only error toast,
    fake autosave, public raw-file upload implication, or destructive retry.
13. **Migration:** Preserve current consumers and value retention. A new rich
    text or autosave consumer requires a separate component decision.

### 4.5 `FormField`

1. **Name/purpose/owner/status:** `components/ui/form-field.jsx`, control-label-
   hint-error wiring, Foundation maintainer, adopted.
2. **Use / not use:** Use for one supported control and its visible metadata.
   Do not nest unrelated controls or hide the only critical recovery message.
3. **Anatomy:** Container, `Label`, one child control, optional hint, optional
   error with stable IDs, required marker, and caller-owned summary.
4. **Variants/sizes/content:** Current `label`, `hint`, `error`, `required`,
   `className`, ref, and child clone behavior; long labels/hints/errors wrap.
5. **API continuity:** Preserve generated IDs, existing child IDs,
   `aria-describedby`, `aria-errormessage`, and `aria-invalid` continuity.
6. **States:** Ready, required, invalid, disabled through child, submitting
   through form owner, and recovery with values preserved. A dependency error
   stays a system state, not a field error.
7. **Interaction/accessibility:** `htmlFor` and ID are deterministic for the
   render; error has a visible `role=alert`; parent summary may move focus to
   the first invalid field without stealing focus on every keystroke.
8. **Responsive/overflow:** Vertical default stack; labels and errors wrap at
   320px; no horizontal form row is required by the primitive.
9. **Tokens:** Label, hint, error, spacing, focus/error semantic roles from
   core tokens; no consent-specific token.
10. **Localization:** All copy is caller-owned and can expand in Indonesian or
    English; primitive must not hardcode `Required` or `Retry`.
11. **Restrictions:** Shared wiring only. Inquiry consent, password policy,
    file policy, pricing, and permission are domain-owned.
12. **Anti-patterns:** No generic `aria-invalid` on provider failure, toast-only
    errors, duplicate label IDs, or error text hidden behind hover.
13. **Migration:** Keep current one-child contract. A field-group or composite
    control needs a separate NDS record and accessibility tests.

### 4.6 `Select` family

1. **Name/purpose/owner/status:** `select.jsx` Radix wrapper family, bounded
   single-choice selection, Foundation maintainer, adopted.
2. **Use / not use:** Use for a bounded set where opening a list is useful. Do
   not use for navigation, a large searchable dataset, or a lifecycle action.
3. **Anatomy:** Root, trigger, value, content/portal, viewport, scroll controls,
   group/label, item, indicator, and optional separator; caller supplies label.
4. **Variants/sizes/content:** Current trigger/item minimum 44px, placeholder,
   disabled, invalid, selected, scrollable content; long options wrap or are
   readable without a clipped selected value.
5. **API continuity:** Preserve Radix controlled/uncontrolled value,
   `onValueChange`, disabled, required, name/form integration where supported,
   refs, and exported subcomponents.
6. **States:** Closed/open, placeholder, focus, disabled, invalid, selected,
   empty option set, loading/unavailable owned by caller, and recovery/reset.
7. **Interaction/accessibility:** Radix keyboard navigation, Escape, typeahead,
   focus return to trigger, visible selected state, and screen-reader name/role.
8. **Responsive/overflow:** Portal/content respects available viewport, supports
   narrow screens and scroll buttons, and never hides the trigger or selected
   value behind horizontal overflow.
9. **Tokens:** Core control, selected, border, focus, disabled, overlay, radius,
   and deliberate/standard motion roles.
10. **Localization:** Labels, options, placeholder, empty/loading/error copy,
    and selected-value length are caller-owned ID/EN content.
11. **Restrictions:** Shared selection mechanics; catalog filters, material
    units, publication status, and permission rules remain domain-owned.
12. **Anti-patterns:** No select as a hidden route switch, color-only selected
    state, destructive mutation on selection alone, or fake availability.
13. **Migration:** Preserve Radix exports and current consumers. Searchable or
    multi-select behavior requires a separate spec, not a silent API extension.

### 4.7 `Switch`

1. **Name/purpose/owner/status:** `switch.jsx`, binary persistent preference or
   configuration toggle, Foundation maintainer, adopted.
2. **Use / not use:** Use when the change can be understood as on/off and can
   persist safely. Do not use for a one-time command, a three-state status, or
   an irreversible action without confirmation.
3. **Anatomy:** Radix root/thumb plus an external visible label; caller owns
   grouping and description.
4. **Variants/sizes/content:** Current 44px hit area around visual 36x20 track;
   checked/unchecked/disabled; adjacent label wraps.
5. **API continuity:** Preserve Radix `checked/defaultChecked`,
   `onCheckedChange`, disabled, name/value, ref, and ARIA props.
6. **States:** Unchecked, checked, focus, disabled, submitting/busy owned by
   caller, conflict/stale if server persistence can reject, and recovery.
7. **Interaction/accessibility:** Space/keyboard and pointer parity, visible
   focus, explicit label, checked state exposed semantically, and no color-only
   meaning.
8. **Responsive/overflow:** Keep the hit area at least 44px; label/action rows
   wrap without moving the switch away from its explanation.
9. **Tokens:** Core action, border, surface, focus, disabled, thumb, radius,
   and standard motion roles.
10. **Localization:** Label, description, saving/error/conflict copy are caller
    owned and may expand in ID/EN.
11. **Restrictions:** Current real consumers are Operations catalog/material/
    portfolio controls. It must not toggle payment, reservation, or lifecycle
    authority without a domain contract.
12. **Anti-patterns:** No unlabeled switch, instant irreversible mutation,
    optimistic success without reconciliation, or decorative animation.
13. **Migration:** Preserve current Radix API. Any server-persisted switch needs
    an explicit pending/error/conflict contract and rollback behavior.

### 4.8 `Tabs`

1. **Name/purpose/owner/status:** `tabs.jsx`, local mode selection within one
   task, Foundation maintainer, adopted but single-consumer held.
2. **Use / not use:** Use for related modes that can remain in one task context.
   Do not use to hide critical errors, replace route ownership, or split a
   lifecycle resource into unrelated tabs.
3. **Anatomy:** Root, list, trigger, and content; each trigger has a visible
   label and one panel relationship.
4. **Variants/sizes/content:** Current minimum 44px triggers, active/focus/
   disabled, wrapping list on narrow screens; labels must remain readable.
5. **API continuity:** Preserve Radix controlled/uncontrolled value,
   `defaultValue`, `value`, `onValueChange`, orientation, ref, and content
   association.
6. **States:** Selected/current, focus, disabled, panel loading/error/empty
   owned by the panel, and recovery that preserves the selected mode when safe.
7. **Interaction/accessibility:** Radix roving focus and arrow-key behavior,
   Home/End, visible active/focus state, and panel `aria-labelledby` relation.
8. **Responsive/overflow:** Current list wraps in the catalog editor; future
   consumers must avoid clipped tabs and provide an alternative when a long
   label cannot fit.
9. **Tokens:** Core selected surface, text, focus, border, radius, and fast
   motion roles; no page-specific tab color.
10. **Localization:** Labels and panel headings are caller-owned ID/EN copy;
    translated labels may wrap.
11. **Restrictions:** Current real consumer is `pages/admin/ProductEditor.jsx`.
    A second consumer is not present; this contract does not create one or
    claim multi-surface promotion.
12. **Anti-patterns:** No tabs for Public global navigation, permission hiding,
    irreversible submit, or status that exists only in an inactive panel.
13. **Migration:** Preserve current Radix API. Revisit promotion after a second
    independent real consumer and focused keyboard/long-label evidence.

### 4.9 Approved native checkbox mechanic

1. **Name/purpose/owner/status:** Native `input type="checkbox"` with an
   explicit label, shared mechanic, Foundation plus owning surface, approved
   mechanic; no new Checkbox wrapper is proposed.
2. **Use / not use:** Use for an explicit boolean acknowledgement or preference.
   Do not use for a multi-step consent substitute, selection with unrelated
   lifecycle meaning, or hidden privacy notice.
3. **Anatomy:** Native input, visible label, optional hint/error, and a stable
   group/summary relationship.
4. **Variants/sizes/content:** Native checked/unchecked/disabled/invalid; hit
   target is at least 44px; label and privacy text wrap.
5. **API continuity:** Preserve native `checked/defaultChecked`, `onChange`,
   `name`, `value`, `required`, `disabled`, ref, and form submission semantics.
6. **States:** Unchecked, checked, focus, disabled, validation error, submitting
   owner state, and recovery with the choice retained when safe.
7. **Interaction/accessibility:** Space and pointer parity, explicit label
   association, visible focus, error relationship, and no color-only consent.
8. **Responsive/overflow:** The label is a readable block beside or below the
   control; long consent copy remains visible at 320px and 200% zoom.
9. **Tokens:** Core control border, action, focus, error, disabled, text, and
   spacing roles only.
10. **Localization:** Exact approved consent or policy copy is supplied by the
    domain and must not be shortened by the mechanic.
11. **Restrictions:** Public Inquiry consent and Operations/Auth checkboxes
    retain separate meaning. This mechanic does not create an upload, marketing
    permission, or persistence result.
12. **Anti-patterns:** No consent hidden in a tooltip, prechecked privacy
    permission, disabled submit without reason, or success before persistence.
13. **Migration:** Keep current native inputs. A future wrapper requires a
    separate NDS record, exact consent review, and parity tests.

## 5. Consumer and evidence ledger

The examples are current source consumers at the selected SHA. They are
evidence of use, not permission to redesign those pages.

<!-- markdownlint-disable MD013 -->

| Role | At least two real consumer examples | Evidence / promotion disposition |
| --- | --- | --- |
| Button | `pages/marketing/ContactPage.jsx`, `pages/auth/CustomerLogin.jsx`, `pages/admin/B2BDetail.jsx` | Multi-surface mechanics are evidenced; Public `BrandButton` remains a compatibility split. |
| Label | `components/brand/BrandSystem.jsx`, `pages/admin/Catalog.jsx` | Shared form naming is evidenced; domain label meaning remains local. |
| Input | `components/brand/BrandSystem.jsx`, `pages/auth/CustomerLogin.jsx` | Public and Account use are evidenced; privacy/validation remain domain-owned. |
| Textarea | `components/brand/BrandSystem.jsx`, `pages/admin/ContentEditor.jsx` | Public and Operations use are evidenced; brief/content semantics remain separate. |
| FormField | `components/brand/BrandSystem.jsx`, `pages/auth/CustomerLogin.jsx`, `pages/admin/Catalog.jsx` | Shared label/hint/error wiring is evidenced. |
| Select family | `pages/admin/Catalog.jsx`, `pages/admin/Materials.jsx`, `pages/admin/Inventory.jsx` | Operations collection/filter and editor choices are evidenced; future Commerce use must preserve authority boundaries. |
| Switch | `pages/admin/Materials.jsx`, `pages/admin/PortfolioAdmin.jsx`, `pages/admin/ProductEditor.jsx` | Multiple Operations consumers are evidenced; persistence/conflict meaning remains local. |
| Tabs | `pages/admin/ProductEditor.jsx` only | One real consumer at this SHA; contract is held and no second consumer is invented. |
| Native checkbox | `pages/marketing/ContactPage.jsx`, `pages/admin/AdminLogin.jsx`, `pages/admin/Users.jsx` | Multiple native consumers are evidenced; no wrapper promotion is proposed. |

<!-- markdownlint-enable MD013 -->

## 6. Shared versus domain-owned contract

<!-- markdownlint-disable MD013 -->

| Shared primitive may own | Domain/page must own |
| --- | --- |
| Native semantics, focus, keyboard/touch parity, minimum target, label/error wiring, visible state presentation, loading affordance, and reduced-motion behavior | Inquiry consent wording, password policy, catalog filter meaning, quote/price/stock/ETA truth, file/permission policy, persistence, idempotency, retry safety, and lifecycle transitions |
| API continuity and token role consumption | Whether a field is required, whether a mutation is allowed, who owns a record, and what success reference is authoritative |
| Stable layout/overflow mechanics and screen-reader relationship | ID/EN copy, long-content policy, privacy explanation, customer-safe projection, and domain-specific recovery |

<!-- markdownlint-enable MD013 -->

## 7. State and interaction checklist

Every later source consumer should verify the applicable subset:

- ready, hover, focus, active/pressed, selected/current, and disabled are
  visible and semantically exposed;
- loading retains an action label, prevents duplicate submit, and does not
  replace the final hierarchy with a blank spinner;
- validation preserves safe values and moves focus to a visible summary or
  first invalid field;
- dependency/system failure does not mark valid fields invalid and exposes a
  bounded retry or fallback;
- stale/conflict/expired/uncertain outcomes reconcile authoritative state
  before irreversible retry;
- keyboard, pointer, and touch paths have equivalent actions;
- critical state is not hover-only, color-only, icon-only, or toast-only; and
- `prefers-reduced-motion` removes spatial/interpolated feedback while keeping
  focus, validation, loading, conflict, recovery, and success perceivable.

## 8. Verification and self-review

Completed for DS-02 against `8555685c`:

<!-- markdownlint-disable MD013 -->

| Check | Result |
| --- | --- |
| API/source reconciliation | Pass — current exports and major prop/state behavior were checked against the eight shared modules and native checkbox consumers. |
| Consumer evidence | Pass with condition — two real consumers are recorded for every multi-surface proposed role; `Tabs` remains explicitly held with one current consumer. |
| NDS 13 fields | Pass — all nine contract records include all 13 fields. |
| Accessibility | Pass as specification evidence — 44px target, visible focus, names/roles/values, error association, keyboard/touch parity, and 200% reflow are explicit. Runtime proof remains a later source/QA gate. |
| Localization | Pass as specification evidence — ID/EN labels, long errors, consent, and caller-owned copy boundaries are explicit. |
| Lifecycle/privacy boundary | Pass — primitives never own Inquiry, Retail, Account, Order, payment, permission, or Operations transitions. |
| Dependency/source scope | Pass — no new wrapper, package, token, or source change is proposed. |
| Whitespace/links | Pass — local links and file whitespace were checked after creation. |

<!-- markdownlint-enable MD013 -->

This is a documentation contract, not a claim that every current consumer has
complete runtime evidence or that `Tabs` is promoted across surfaces.

## 9. Next gate and explicit exclusions

DS-03 may be documented next under the same owner-authorized goal. Source
implementation, API changes, migration, token promotion, component promotion,
route activation, and delivery gates remain separate.

This specification does not authorize application source/tests, new consumers,
new dependencies, `Drawer`/`vaul`, `BrandButton` migration, `ResponsiveTable`,
`Progress`, `Separator`, `StatCard`, `Tooltip`, checkout, upload, registration,
payment, provider, or business-rule work.
