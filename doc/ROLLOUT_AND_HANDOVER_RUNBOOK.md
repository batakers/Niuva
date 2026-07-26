# Rollout and Handover Runbook

Staging smoke, canary, post-deploy checks, and handover for the Admin Studio.

Nothing in this document has been executed. It needs staging access and an
approval that has not been given. It is written so that when someone does run
it, the steps are already decided rather than invented under pressure.

## Before anything is deployed

- [ ] `python -m pytest -n 0 -q backend` green.
- [ ] `CI=true npx craco test --watchAll=false` green.
- [ ] Real transaction modules green against `rs-test`
      (see `TRANSACTION_CAPABILITY_RUNBOOK.md`). A skip is not evidence.
- [ ] `npx craco build` compiles.
- [ ] Backup exercise rehearsed
      (see `MIGRATION_BACKUP_RESTORE_RUNBOOK.md`).
- [ ] Migration 005 is **not** scheduled. It archives `organizations`,
      `organization_memberships`, and `internships`, and the plan holds it.

## Smoke, immediately after deploy

```powershell
python scripts\staging_smoke.py --base-url https://staging.example
```

Exit 0 or stop the rollout. The checks are deliberately unauthenticated: every
one is a boundary that must hold for a stranger, who is the reader most likely
to find it broken.

What it covers, and why each one is there:

| Check | Why it would matter |
| --- | --- |
| Readiness responds | The process is serving. |
| Transaction capability ready | Every cross-collection guarantee rests on it; without it most writes fail closed. |
| Admin surfaces refuse a stranger | The one failure that cannot be allowed to ship. |
| Public settings withhold bank details | They were once public; a regression republishes a payment instruction. |
| Public portfolio withholds internal fields | Drafts, versions, and customer names must not reach the public read. |
| Legacy payment proof stays 410 | A 404 would mean the lockdown was removed rather than enforced. |
| Dashboard stats are not public | Operational counts are staff-only. |

**A 404 on an admin surface is a failure, not a pass.** It usually means the
route is missing from the deployed build. Confirm the deployed commit before
investigating anything else; a stale process explains most of these at once.

## Canary

Feature-flag the Admin Studio surfaces rather than the API. The lifecycles are
already enforced server-side, so flagging the UI limits who can reach a new
workbench without weakening any rule.

- [ ] Enable for internal staff accounts only.
- [ ] Watch for 409 and 412 rates. A rise means version conflicts, which
      usually means two surfaces are writing the same aggregate.
- [ ] Watch for 503 on transaction-guarded routes. That is fail-closed working,
      but a sustained rate means the database lost transaction capability.
- [ ] Watch `work_order_shortages` growth. A jump means production is stalled
      on material, not that the deploy failed.
- [ ] Hold at canary for one full working day before widening.

## Post-deploy checks

- [ ] Smoke passed, and its output is attached to the release record.
- [ ] Sign in as one account per role and confirm the navigation matches
      `BROWSER_VERIFICATION_RUNBOOK.md`. Automate it if the accounts exist.
- [ ] Create one Inquiry through the public form. Confirm it appears in triage
      and that the response carried no internal fields.
- [ ] Walk one Quote to accepted and open a Project from it. Confirm exactly
      one Project exists.
- [ ] Open one Work Order and allocate it. Confirm reservations appear and
      balances moved.
- [ ] Confirm revenue is still withheld on the dashboard.
- [ ] Confirm the bell shows unread state and a notification deep link lands
      on the record it names.

## Rollback

- [ ] Redeploy the previous build. The API is additive across this work, so an
      older frontend against the newer backend degrades rather than breaks.
- [ ] Restore the database **only** if a migration ran. Follow
      `MIGRATION_BACKUP_RESTORE_RUNBOOK.md`, and compare after restoring.
- [ ] Do not roll back by editing data. Every aggregate here is append-only
      with a version; a manual edit leaves no audit trail and can strand a
      version guard.

## Handover

What the next person needs to know, beyond the code:

- **Money is integer minor units, and IDR is treated as zero-decimal.** One
  minor unit is one rupiah. No scaling is applied anywhere.
- **Withheld is not missing.** Revenue, cancellation, refund, return, and the
  payment providers are all deliberately closed and say so in their responses.
  A 409 with a named code is the design, not a bug to fix.
- **Snapshots on immutable documents are the truth.** Quote versions, work
  order requirements, and retail order lines are frozen at the moment they were
  committed. A catalog change does not reach back into them, and that is why.
- **Public projections are allowlists.** Adding a field to an aggregate does
  not publish it. Publishing is a deliberate edit to the allowlist, and the
  tests will tell you when you have done it by accident.
- **`organizations` is archived.** Ownership of a B2B record by a customer is
  not modelled. Any customer portal work starts by deciding that.
- **Migration 005 must not be run** without a separate decision.
- **Not covered by any approval yet:** production upload, payment or WhatsApp
  providers, infrastructure activation, Finance activation, push, merge, and
  go-live.

## Open items at handover

- Browser role matrix has not been run with credentials; it needs one seeded
  account per role.
- Screen-reader announcement quality needs a human with a screen reader. The
  suite checks the structures exist, not that they read well.
- The retail public checkout is intentionally absent.
- The quote revision editor cannot yet pick a catalog variant, so lines
  authored there carry no product snapshot.
