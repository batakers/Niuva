# OPS-07 Governance and Notification Utility Family

**Status:** Candidate — Context Only — Operations utility artifact; no role,
permission, identity, settings, communication provider, or source change

**Routes:** users, customers, settings, communication, notifications, and
compatibility contacts in the current Operations matrix

## 1. Archetypes

```text
Users/customers: identity/projection → permission-safe detail → guarded action
Settings: scope/current value → validation → guarded mutation → audit-safe result
Communication: recipient/context → draft/validation → provider-owned outcome
Notifications: unread/read context → bounded mark/read action → history
Compatibility contacts: retained workflow → explicit ownership/retirement note
```

Route visibility is not authorization. Broad audit access and customer-private
detail are never implied by a shared collection or notification badge.

## 2. State/recovery

Loading, empty/no-match, permission, validation, dependency error, conflict,
uncertain mutation, success/reference, and recovery are visible. Confirmation
is used for consequential operations; retry reconciles when effects could
duplicate. Notification read state does not prove message delivery.

## 3. Accessibility/localization

Role/action matrix, semantic headings, 44px controls, focus return, long setting
copy, ID/EN labels, append-oriented history, and reduced-motion feedback are
required. Protected details stay projected.

## 4. Self-review

Passed against OPS-01, DS-02–DS-05, permission/privacy authority, and current
utility route evidence. No identity, provider, role, settings, or source logic
changed.
