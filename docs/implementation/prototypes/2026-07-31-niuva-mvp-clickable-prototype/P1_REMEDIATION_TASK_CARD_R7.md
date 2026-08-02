# P1 Remediation — Round 7 Task Card

Status: **COMPLETE — TARGETED PASS; FORMAL GATE STILL BLOCKED**
Date: 3 August 2026
Source findings: `R7-P1-01` through `R7-P1-04`, plus `R7-P2-01`

## Boundary

| Field | Contract |
| --- | --- |
| Objective | Remove the Round 7 participant-contaminating behavior while preserving the approved Retail, Order, and Admin lifecycle boundaries. |
| In scope | Prototype `app.js`, `styles.css`, focused contract tests, browser revalidation, and prototype validation records. |
| Out of scope | Production frontend/backend, API/schema/migration, provider activation, canonical promotion, human sessions, deployment, readiness, and go-live. |
| Authority | `DEC-UX-003`; `DEC-INV-01`; Round 7 critique; existing prototype-only contract. |
| Publication | Commit and push to existing draft PR #114 are authorized by the repository-reconciliation instruction. Merge remains blocked while the formal gate is not passed. |

## Acceptance Criteria

- default Participant Mode Admin actions never lead to a fixture-only dead end
  or mention Panel Moderator;
- `/order` renders a dedicated non-mutating safe-unavailable compatibility
  state and is classified as legacy;
- every mobile sticky action names its actual action;
- an active Order/payment attempt appears as a locked cart snapshot with a
  direct return to payment and no cart mutation affordance;
- checkout no longer promises return to a pre-Order preview after Order
  creation;
- current checkout step is exposed with `aria-current="step"`;
- mobile Ready Product identity and form appear materially earlier than the
  previous 936 px H1 position;
- focused RED/GREEN contract tests, syntax checks, mobile browser checks, and
  exact-scope Git checks pass.

## Evidence Rule

Focused remediation can close these source findings, but it cannot clear the
formal human-session gate. A later full expert critique still requires restored
independent assessment evidence and zero open P0/P1.

## Outcome

- RED: 0/6 focused contract tests passed before remediation.
- GREEN: 6/6 focused contract tests passed after remediation.
- Browser: all five findings passed focused checks at 390 x 844 px.
- Syntax: `app.js` and `server.js` passed `node --check`.
- Human-session gate: **NOT READY TO RUN** pending full independent expert
  critique.

See `FOCUSED_BROWSER_REVALIDATION_R8.md`.
