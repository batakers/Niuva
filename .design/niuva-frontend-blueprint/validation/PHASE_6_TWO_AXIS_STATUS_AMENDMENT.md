# Phase 6 Two-Axis Status Amendment

**Status:** Candidate amendment — owner-approved direction; documentation and
governance only

**Date:** 19 August 2026

**Repository baseline:** `origin/main`
`0bb9111b2052baa2aef0f52196e700519e61284c`

**Purpose:** Separate the state of the frontend presentation from the state of
the underlying capability or authority. This amendment allows a bounded UI
contract to be reviewed and, where justified, delivered without pretending
that an API, identity provider, legal content, payment flow, operational
lifecycle, or production capability is active.

This file does not change application source, routes, dependencies, APIs,
schemas, providers, permissions, lifecycle state machines, legal content, or
business rules. It does not open Phase 7.

## 1. Why two axes are required

The previous single status collapsed different facts into one label. For
example, the current staff invitation surface has a bounded presentation and
tests, while invitation validity, identity ownership, and staff lifecycle are
still backend-owned and deferred. A single `DEFERRED_WITH_OWNER_REASON` label
made the frontend evidence look less complete than it is; changing it directly
to `DELIVERED_BOUNDED` would overstate capability readiness.

The ledger therefore records two independent facts:

1. `frontend_status` — what the current frontend contract and evidence prove;
2. `capability_status` — what the authoritative API, domain, provider, legal,
   or content owner proves.

Neither axis grants the other axis authority. A green frontend test cannot
activate a provider, and a backend contract cannot prove accessible UI
delivery without frontend evidence.

## 2. Status vocabulary

### 2.1 `frontend_status`

| Status | Meaning | Minimum evidence |
| --- | --- | --- |
| `DELIVERED_BOUNDED` | A named G4 source slice is merged and verified for its approved frontend scope. | Exact source/test paths, responsive and accessibility evidence, state review, commit and PR evidence. |
| `PRESENTATION_BOUNDED` | Existing source presents a bounded, truthful UI contract, but no new Phase 6 G4 migration result is claimed for this family. | Current source/tests, route ownership, state and component review, and explicit limitations. |
| `STRUCTURE_DELIVERED` | Route/layout/structure exists, but final content or legal authority prevents completion of the user-facing contract. | Structure/state evidence plus a named content or legal hold. |
| `CONTRACT_ONLY` | A wireframe, task card, or component contract exists without an eligible runtime consumer or with an intentionally inactive capability. | Candidate contract and explicit inactive/no-consumer reason. |
| `INVENTORY_ONLY` | The item is recorded for compatibility, reservation, or historical evidence only. | Inventory row and ownership boundary. |

`PRESENTATION_BOUNDED` is deliberately not a readiness or go-live status. It
is the safe intermediate state for a deferred family whose current UI can be
reviewed without inventing domain authority.

### 2.2 `capability_status`

| Status | Meaning | Prohibited inference |
| --- | --- | --- |
| `BOUNDED_ACTIVE` | The approved route or capability is currently represented within its known lifecycle and provider limits. | Production readiness, provider SLA, or go-live. |
| `DEFERRED` | A domain/API/provider/permission/source decision or exact G4 scope is still required. | Treating presentation as active capability. |
| `LEGAL_HOLD` | Final legal or content-owner approval is required. | Inventing, translating, or publishing policy content. |
| `INACTIVE` | The capability is intentionally not activated by current authority. | Presenting checkout, payment, reservation, automation, or provider success. |
| `INVENTORY_ONLY` | No active content owner or capability is claimed. | Treating aliases, reserved paths, or prototypes as live features. |

Capability status is not an environment or deployment claim. `BOUNDED_ACTIVE`
means only that the bounded product contract is represented in the reviewed
source; staging, production, restore, readiness, and go-live remain separate.

## 3. Compatibility mapping from the previous ledger

The former single-axis labels remain readable as derived reporting labels, but
the two axes are authoritative for new reviews.

| Former label | New frontend axis | New capability axis | Rule |
| --- | --- | --- | --- |
| `DELIVERED_BOUNDED` | `DELIVERED_BOUNDED` | `BOUNDED_ACTIVE` | Use only when both the merged frontend slice and bounded capability evidence are present. |
| `HOLD_LEGAL_CONTENT` | `STRUCTURE_DELIVERED` | `LEGAL_HOLD` | Structure may be complete; legal/content completion is not claimed. |
| `CONTRACT_ONLY_INACTIVE` | `CONTRACT_ONLY` | `INACTIVE` | The contract may explain a safe boundary, but the capability remains unavailable. |
| `INVENTORY_ONLY` | `INVENTORY_ONLY` | `INVENTORY_ONLY` | Compatibility, reserved, and prototype records remain non-owning. |
| `DEFERRED_WITH_OWNER_REASON` | `PRESENTATION_BOUNDED` or `CONTRACT_ONLY` | `DEFERRED` | Preserve the reason and open one exact G3/G4 family at a time. |

The former label must not be used to hide either axis. Every deferred row must
state whether its current frontend is `PRESENTATION_BOUNDED` or
`CONTRACT_ONLY`, and why the capability remains `DEFERRED`.

## 4. Reopening rule for deferred families

Reopening a deferred family means opening a new G3 contract review. It does
not mean that the family is automatically implementation-ready.

For each family, the sequence is:

1. identify the owner and exact current source/test consumers;
2. confirm the applicable authority and unresolved domain/API/provider/legal
   decisions;
3. write one exact-file G3 task card with state, localization,
   accessibility, rollback, and exclusion requirements;
4. record a self-review result as `PASS`, `PASS WITH HOLD`, or `BLOCKED`;
5. request G4 only if the exact source scope and capability boundary are
   reviewable;
6. implement and verify only the approved frontend slice; and
7. update both axes with commit/PR evidence and remaining limitations.

If the authority is still missing, the correct result is a more precise
`DEFERRED` reason—not speculative source work.

## 5. First reopened family: Staff login and invitation

The first family is Staff login and invitation acceptance because it has a
narrow, existing frontend surface and explicit AUTH-01/AUTH-03 wireframes. It
also has a clear security boundary: no new provider, role, session, invitation
API, or permission behavior may be inferred from the UI.

The first G3 artifact is:

[`STAFF_LOGIN_INVITATION_G3_TASK_CARD.md`](../migration/account/STAFF_LOGIN_INVITATION_G3_TASK_CARD.md)

Its self-review is:

[`STAFF_LOGIN_INVITATION_G3_SELF_REVIEW.md`](STAFF_LOGIN_INVITATION_G3_SELF_REVIEW.md)

The family may move from `PRESENTATION_BOUNDED + DEFERRED` to
`DELIVERED_BOUNDED + DEFERRED` only after an approved frontend G4 slice is
merged. It may move to `BOUNDED_ACTIVE` only when the applicable authoritative
staff contract is separately evidenced. Neither transition activates a
provider or changes staff roles.

## 6. Acceptance criteria for this amendment

- the ledger records `frontend_status` and `capability_status` separately;
- the former single-axis labels remain traceable as derived dispositions;
- Privacy remains a legal/content hold rather than fabricated completion;
- inactive Retail transaction paths remain inactive;
- aliases, reserved paths, and prototypes remain inventory-only;
- deferred families have a named owner/domain reason and exact next G3 gate;
- Staff login/invitation is the first reopened family;
- Phase 7 remains frozen; and
- no source, provider, deployment, readiness, or go-live authority is implied.
