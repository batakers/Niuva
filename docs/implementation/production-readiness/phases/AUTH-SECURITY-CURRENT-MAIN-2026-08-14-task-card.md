# Auth, Authorization, and Privacy Current-Main Audit Task Card

<!-- markdownlint-disable MD013 -->

**Lane:** Readiness.

**Branch/worktree:** `audit/backend-auth-security-current-main` /
`Niuva-worktrees/backend-auth-security-current-main`.

**Stacked base:** `audit/backend-current-main-rebaseline` at `ea964d8` so this
feature audit does not collide with the still-open tracker rebaseline PR #244.
The audited runtime baseline remains `origin/main` at `15b759a`.

## Brief

| Field | Contract |
| --- | --- |
| Title and user outcome | Revalidate current-main authentication, authorization, and privacy controls with exact-SHA evidence and a reviewable gap disposition. |
| In scope | Customer/Admin sessions; recovery/revocation; password policy and Argon2 boundary; MongoDB-backed abuse limiting and failure behavior; security-event redaction/retention; bootstrap Admin preservation; negative RBAC across sensitive routes; customer-safe projections. |
| Out of scope | MFA implementation, DR-005 selection, secret/key changes, migration execution, shared/staging/production access, providers, deployment, readiness approval, and go-live. |
| Authority | Master Spec; Document Register; Decision Register; `DEC-ACCESS-001/002`; `DEC-AUTH-001` through `DEC-AUTH-012`; `ADR-005`; applicable auth/session/RBAC runbooks. |
| Affected areas | Read-only inspection of backend auth, permission, projection, migration, bootstrap, and test paths; new audit evidence plus primary readiness tracker updates. |
| Contract/dependency | Preserve generic public failures, least privilege, transaction fail-closed behavior, safe customer allowlists, existing-account password preservation, and the DR-005 MFA block. |
| Done when | Exact source identity and control matrix are recorded; proportional positive/negative tests pass; unsupported production claims remain explicitly open; trackers point to the new packet. |
| Verification | Auth/security and authorization/privacy pytest selections; expected-skip review; static credential/projection checks; current-head CI provenance where available; Markdown lint and `git diff --check`. |
| Owner and verifier | Codex is Driver; repository reviewer/security owner is the required independent verifier before merge. |
| Commit/push/PR permitted | Yes, explicitly requested by the user on 14 August 2026. |
| Risks/open decisions | DR-005 blocks internal MFA; production proxy/TLS, key custody, retention operations, migration, real transaction, external target, and named-owner evidence remain separate gates. |

## Negative cases required

- Customer and internal identities cannot cross authentication surfaces.
- Disabled, review-blocked, wrong-role, expired, revoked, replayed, and
  cross-origin sessions fail closed without differentiated credential detail.
- Non-Super-Admin roles cannot use identity-governance or unrestricted audit
  routes; each sensitive domain route denies unrelated roles.
- Customer responses exclude cost, margin, supplier, profit, and internal-note
  fields, including nested or legacy-shaped records.
- Bootstrap does not replace an existing Admin password or silently elevate an
  existing account.
- Limiter/event-store dependency failures follow their approved operation-
  specific fail-closed or degraded behavior without leaking identifiers.

## Rollback and handover

This task changes audit documentation only unless a reproducible repository
defect requires a separately visible bounded correction. Documentation rollback
is a normal revert. The PR remains stacked behind #244 until that base enters
`main`, after which its base must be retargeted and its checks rerun.

<!-- markdownlint-enable MD013 -->
