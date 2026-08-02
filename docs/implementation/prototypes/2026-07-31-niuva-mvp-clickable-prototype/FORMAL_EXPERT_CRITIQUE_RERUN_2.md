# Formal Expert Critique Rerun 2 — Niuva MVP Prototype

Method: dual-agent (A: `/root/formal_recritique_a2` · B: `/root/formal_recritique_b_browser`)

Date: 2 August 2026
Target: clickable customer/operator prototype only
Gate verdict: **FAIL — NOT READY TO RUN MODERATED SESSIONS**

## Executive Decision

The five P1 findings recorded in `FORMAL_EXPERT_CRITIQUE_RERUN.md` were
retested and did not reappear in the focused remediation pass. This rerun
nevertheless fails the human-session gate because two independent assessments
found two new P1 defects that would teach participants an incorrect commercial
or transactional model:

1. the calculated Custom Print price is not the approved canonical price; and
2. the 30-minute reservation is represented as active before its canonical
   creation event.

No P0 was found. Do not run a moderated customer or operator session from this
artifact. Candidate route recommendations remain `INSUFFICIENT_EVIDENCE`.

## Assessment Provenance and Protocol Variation

Assessment A was an unanchored design/flow review. Assessment B independently
performed the live browser pass after Assessment A completed. The Impeccable
detector was executed exactly once by the root reviewer rather than Assessment
B because the subagent sandbox could not relay the required external-tool
approval. Its deterministic output was supplied to B only after A completed.
This is a transparent orchestration variation, not a claim that the detector
covered the dynamically rendered `app.js` interface.

## Design Health Score

| # | Heuristic | Score | Key issue |
| --- | --- | ---: | --- |
| 1 | Visibility of system status | 3/4 | Milestones and recovery notices are clear, but reservation status names the wrong lifecycle moment. |
| 2 | Match between system and real world | 2/4 | The FDM vocabulary is appropriate; an incorrect payable price breaks commercial truthfulness. |
| 3 | User control and freedom | 3/4 | Recovery works; legacy `/order` is not yet a purpose-built safe-unavailable exit. |
| 4 | Consistency and standards | 2/4 | Desktop state-specific actions and mobile fixed `Lanjut` are not equivalently explicit. |
| 5 | Error prevention | 2/4 | Original remediation holds, but price and reservation sequencing remain preventable misconceptions. |
| 6 | Recognition rather than recall | 3/4 | Order, case, revision, and operator context are generally visible. |
| 7 | Flexibility and efficiency | 3/4 | Core paths and recovery work, with no major P1 efficiency defect observed. |
| 8 | Aesthetic and minimalist design | 3/4 | Calm structure supports the task, although mobile CTA wording is overly generic. |
| 9 | Error recognition and recovery | 3/4 | Request, offer, case, revision, and notification recovery are clear. |
| 10 | Help and documentation | 2/4 | Inline explanations do not resolve the inaccurate commercial/lifecycle model. |
| **Total** | | **26/40** | **Acceptable — significant correction required before participant research** |

Assessment A scored 25/40 and Assessment B scored 30/40 because B used a
narrower browser pass. The conservative synthesis above is not a release score;
the gate is determined by P0/P1 evidence, not by the average.

## Detector and Visual Evidence

The prototype remains product-specific through FDM configuration, slicer
weight/time, distinct Retail/B2B paths, production milestones, and a
customer-safe after-sales surface. Its visual system is still more generic than
a finished branded product, but that is not the gate blocker.

The detector was run once against `index.html` with no ignore file:

```text
IGNORE_ABSENT
[]
```

This is a clean result for the HTML shell only. Most relevant UI is rendered by
`app.js`, so the scan neither validates nor contradicts the browser findings.
No reliable user-visible overlay is claimed: the browser assessor did not
report a successful mutable injection/overlay run.

## Gate Checklist

| Gate | Result | Evidence |
| --- | --- | --- |
| Original five P1 remediation remains observable | PASS | Cart identity, revision, active-case recovery, approval separation, and Participant Mode hygiene remain functional. |
| No P0 is open | PASS | Neither independent assessment found a task-blocking P0. |
| No P1 can contaminate participant evidence | FAIL | Price and reservation P1s remain visible in Participant Mode. |
| Participant and moderator modes remain separated | PASS | Moderator panel, governance notes, and manager fixture are hidden in Participant Mode. |
| Responsive/focus baseline remains usable | PASS with limits | Representative 390 px views had no global overflow; skip link and main focus worked. |
| Formal expert gate permits human sessions | FAIL | Two corroborated P1s remain. |

## Confirmed P1 Findings

### R2-P1-01 — Custom Print price contradicts the approved price policy

On `/retail/products/custom-fdm/configure`, the 86.4 g PLA fixture shows
`Rp500/g` plus 5.75 hours at `Rp5.000`, for `Rp71.950`. The approved
`NIUVA-CP-FDM-001` policy applies `Rp1.000/g` to the first 200 g of PLA. The
same fixture should therefore show `Rp86.400 + Rp28.750 = Rp115.150` before
fulfillment.

Participant Mode exposes this as a precise slicer calculation. Calling it a
simulation does not prevent a participant from forming the wrong affordability
and trust judgment. Apply the canonical formula literally to every fixture or
remove payable commercial figures until a named approved price version can be
used faithfully.

### R2-P1-02 — Reservation begins before the approved lifecycle event

After login, `/retail/checkout` says `Reservasi aktif 30 menit` and that
stock/slot is held while payment has not started. In the prototype, the Order
snapshot is only created when `Bayar sekarang` is pressed. The approved rule
starts the 30-minute reservation after successful Order and payment-attempt
creation, not merely on opening checkout.

This teaches that browsing/conforming the checkout page itself holds inventory
and production capacity. Model the sequence explicitly as:

`checkout preview/revalidation → explicit confirmation → Order + payment attempt → reservation timer`.

If the prototype intentionally creates an Order before payment, show that
reference and event truthfully rather than implying it is not yet created.

## Additional Follow-up Findings

- **P2 — Legacy `/order`:** safe from mutation but still a generic unavailable
  page instead of the explicit safe-unavailable compatibility state expected by
  `DEC-UX-003`.
- **P2 — Complaint due detail:** active case and recovery work, but the customer
  cannot inspect `complaint_due_at`, working-day calendar, or timezone detail.
- **P2 — Mobile CTA:** the fixed 390 px CTA can remain `Lanjut` where desktop
  names materially different actions. Give it a state-specific verb in the
  next visual pass.

## Strengths Preserved

- Mixed Ready Product and Custom Print identity persists through checkout,
  simulated payment, Order, and reload.
- Revision displays a WIB deadline, requires an STL/3MF replacement, preserves
  v1 history, and confirms v2.
- An existing case is linked from Order; direct duplicate intake shows recovery.
- Operator submission, manager approval, and Finance execution remain distinct.
- Participant Mode hides scenario/evaluator controls while retaining a clear
  prototype disclosure.
- `quote_required` moves to Request/Offer without creating payment or Order.

## Browser Evidence and Limits

The live retry at `http://127.0.0.1:4182` covered Participant Mode, calculated
Custom Print, mixed cart/checkout/Order, quote-required Request/Offer, revision,
active complaint case, operator resolution, reload, keyboard skip-link, and
390×844 customer/operator views. Representative mobile views reported no
horizontal overflow. The console contained three extension-like `message
channel closed` errors without an `app.js` stack, so this run cannot claim a
clean console.

The review remains prototype-only. It does not validate real payments, uploads,
authentication/RBAC, provider behavior, real devices, slow networks, screen
readers, or human participant behavior.

## Next Gate

1. Obtain explicit authorization for a new, bounded prototype-only remediation
   of `R2-P1-01` and `R2-P1-02`.
2. Re-run focused browser evidence for canonical price calculation and the
   exact reservation lifecycle.
3. Run a new formal critique. Only a PASS with no P0/P1 can change the plan to
   `READY TO RUN`.
4. Then run the approved moderated review with one non-IT operator and one
   prospective Retail customer. Route recommendations remain
   `INSUFFICIENT_EVIDENCE` until those sessions complete.

## Run Notes

- Target slug: `026-07-31-niuva-mvp-clickable-prototype-index-html`.
- Ignore list: absent.
- Assessment independence: A did not see detector or old review artifacts; B
  did not see A or old review artifacts.
- CLI detector: executed exactly once by root because subagent sandbox approval
  could not be relayed; result `[]` for `index.html` only.
- Browser visibility: fresh browser retry succeeded on port 4182; no user
  overlay is claimed.
- Overlay injection: no successful injection evidence reported.
- Live server: isolated 4182 was started solely for browser evidence; port 4177
  was preserved and untouched.
- Cleanup: assessor browser tabs/viewport were finalized. Root server/temp
  cleanup occurs after documentation persistence.
- No source code, canonical decision, migration, commit, push, provider, or
  human-session action was performed.
