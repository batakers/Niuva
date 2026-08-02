# Moderated Usability Review Results — Niuva MVP

Status: **HUMAN SESSIONS BLOCKED — ROUND 7 HAS FOUR OPEN P1s**
Prepared: 31 July 2026
Required evidence: `P-C01` and `P-O01`
Current route recommendation: **INSUFFICIENT_EVIDENCE**

Do not replace blanks with inferred or synthetic results. Automated prototype
validation is recorded in `VALIDATION_REPORT.md` and cannot be reused as human
usability evidence.

## 1. Session register

| Session | Participant profile | Date/time WIB | Moderator | Consent to participate | Consent to record | Completed |
| --- | --- | --- | --- | --- | --- | --- |
| `USR-C01` | Prospective Retail customer | `pending` | `pending` | `pending` | `pending` | No |
| `USR-O01` | Niuva non-IT operator | `pending` | `pending` | `pending` | `pending` | No |

Participant names and personal contact details must not be added to this file.

## 2. Customer task results

Outcome values: `UA`, `A`, `F`, or `NA`.

| Task | Outcome | Time | Assists | Confidence 1–5 | Observation/evidence | Finding IDs |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `C-01` Ready Product → cart | `pending` | — | — | — | — | — |
| `C-02` Mixed cart → login boundary | `pending` | — | — | — | — | — |
| `C-03` Expired reservation recovery | `pending` | — | — | — | — | — |
| `C-04` File revision deep link | `pending` | — | — | — | — | — |
| `C-05` Cancellation request | `pending` | — | — | — | — | — |
| `C-06` Complaint intake → case | `pending` | — | — | — | — | — |
| `C-07` Existing case recovery | `pending` | — | — | — | — | — |

### Customer comprehension

| Question | Participant answer/paraphrase | Correct/partial/incorrect | Finding IDs |
| --- | --- | --- | --- |
| Is cart already a paid Order? | `pending` | `pending` | — |
| What is revalidated before payment? | `pending` | `pending` | — |
| What happens to the prior file version? | `pending` | `pending` | — |
| Does cancellation guarantee refund? | `pending` | `pending` | — |
| Is complaint intake already remedy approval? | `pending` | `pending` | — |
| How is an existing case reopened? | `pending` | `pending` | — |

### Customer closing ratings

| Statement | Rating 1–5 | Notes |
| --- | ---: | --- |
| Position before payment is clear | — | — |
| Revision/cancellation/complaint are distinct | — | — |
| Existing case status is findable | — | — |
| Customer-facing language is clear | — | — |
| Duplicate action risk feels controlled | — | — |

## 3. Operator task results

| Task | Outcome | Time | Assists | Confidence 1–5 | Observation/evidence | Finding IDs |
| --- | --- | ---: | ---: | ---: | --- | --- |
| `O-01` Prioritize work | `pending` | — | — | — | — | — |
| `O-02` Request → offer approval | `pending` | — | — | — | — | — |
| `O-03` Milestone + email failure | `pending` | — | — | — | — | — |
| `O-04` After-sales triage | `pending` | — | — | — | — | — |
| `O-05` Cross-area context | `pending` | — | — | — | — | — |

### Operator comprehension

| Question | Participant answer/paraphrase | Correct/partial/incorrect | Finding IDs |
| --- | --- | --- | --- |
| Difference between Request, Order, and case | `pending` | `pending` | — |
| What remains saved when email fails? | `pending` | `pending` | — |
| Who proposes, approves, and executes refund? | `pending` | `pending` | — |
| Which notes are customer-visible? | `pending` | `pending` | — |
| What is `/admin/orders` used for? | `pending` | `pending` | — |

### Operator closing ratings

| Statement | Rating 1–5 | Notes |
| --- | ---: | --- |
| Next action is clear without technical training | — | — |
| Request, Order, and case are distinct | — | — |
| Approval and Finance execution are distinct | — | — |
| Internal/customer-safe notes are distinct | — | — |
| Cross-area context is retained | — | — |

## 4. Findings register

Severity: `S1`, `S2`, `S3`, or `S4`.

| ID | Participant/task | Observed evidence | Severity | Candidate route(s) | Recommended change | Retest status |
| --- | --- | --- | --- | --- | --- | --- |
| `F-001` | `pending` | `pending` | `pending` | `pending` | `pending` | `not_run` |

Add rows without deleting historical findings. If an issue is disproved or
resolved, update its retest status and preserve the original evidence.

## 5. Candidate route scorecard

### CAND-CART-01 — `/retail/cart`

| Gate | Result | Evidence |
| --- | --- | --- |
| `C-01` unaided | `pending` | — |
| `C-02` unaided | `pending` | — |
| Non-authoritative cart understood | `pending` | — |
| Revalidation understood | `pending` | — |
| Login continuity understood | `pending` | — |
| Mixed-cart separation understood | `pending` | — |
| Refresh/back recovery understood | `pending` | — |
| No open S1/S2/unresolved S3 | `pending` | — |
| Technical follow-up passed | `not_run` | Requires later contract review |

Recommendation: **INSUFFICIENT_EVIDENCE**

### CAND-AFTER-01 — `/orders/:id/file-revision`

| Gate | Result | Evidence |
| --- | --- | --- |
| `C-04` unaided | `pending` | — |
| Exact deadline understood | `pending` | — |
| Prior file history understood | `pending` | — |
| Direct-link recovery understood | `pending` | — |
| No open S1/S2/unresolved S3 | `pending` | — |
| Technical follow-up passed | `not_run` | Requires later contract review |

Recommendation: **INSUFFICIENT_EVIDENCE**

### CAND-AFTER-02 — `/orders/:id/cancellation`

| Gate | Result | Evidence |
| --- | --- | --- |
| `C-05` unaided | `pending` | — |
| Cancellation distinguished from complaint | `pending` | — |
| No automatic refund expectation | `pending` | — |
| Durable request/outcome route understood | `pending` | — |
| No open S1/S2/unresolved S3 | `pending` | — |
| Technical follow-up passed | `not_run` | Requires later contract review |

Recommendation: **INSUFFICIENT_EVIDENCE**

### CAND-AFTER-03 — `/orders/:id/complaints/new`

| Gate | Result | Evidence |
| --- | --- | --- |
| Complaint intake in `C-06` unaided | `pending` | — |
| Reasonable evidence understood | `pending` | — |
| Intake not confused with remedy approval | `pending` | — |
| No open S1/S2/unresolved S3 | `pending` | — |
| Technical follow-up passed | `not_run` | Requires later contract review |

Recommendation: **INSUFFICIENT_EVIDENCE**

### CAND-AFTER-04 — `/orders/:id/complaints/:caseId`

| Gate | Result | Evidence |
| --- | --- | --- |
| Existing case reopened unaided | `pending` | — |
| Case status/next action understood | `pending` | — |
| Duplicate complaint avoided | `pending` | — |
| `O-04` and `O-05` unaided | `pending` | — |
| Approval and Finance execution distinct | `pending` | — |
| No open S1/S2/unresolved S3 | `pending` | — |
| Technical follow-up passed | `not_run` | Requires later contract review |

Recommendation: **INSUFFICIENT_EVIDENCE**

## 6. Contradictions and limitations

- Minimum sample is directional and not statistically representative.
- Participant familiarity bias: `pending`.
- Moderator/designer bias: `pending`.
- Device/browser limitations: `pending`.
- Tasks not run or interrupted: `pending`.
- Contradictory customer/operator evidence: `pending`.

Do not delete this section when no contradiction is observed; record `none
observed in this sample`.

## 7. Final recommendation packet

Complete only after all required sessions and findings triage.

| Candidate | Recommendation | Open blockers | Required revision/retest |
| --- | --- | --- | --- |
| `CAND-CART-01` | `INSUFFICIENT_EVIDENCE` | Human sessions pending | Yes |
| `CAND-AFTER-01` | `INSUFFICIENT_EVIDENCE` | Human sessions pending | Yes |
| `CAND-AFTER-02` | `INSUFFICIENT_EVIDENCE` | Human sessions pending | Yes |
| `CAND-AFTER-03` | `INSUFFICIENT_EVIDENCE` | Human sessions pending | Yes |
| `CAND-AFTER-04` | `INSUFFICIENT_EVIDENCE` | Human sessions pending | Yes |

Overall recommendation: **INSUFFICIENT_EVIDENCE**

This packet may recommend a later canonical decision. It does not itself
authorize canonical promotion, implementation backlog creation, API/schema
work, migration, provider activation, commit, or push.

## 8. Review sign-off

| Role | Participant ID/name policy | Decision | Date |
| --- | --- | --- | --- |
| Moderator | `pending` | `pending` | `pending` |
| Product decision authority | Do not store participant personal data | `pending` | `pending` |
