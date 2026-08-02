# Focused Browser Revalidation — Round 6

Status: **TARGETED PASS — FULL FORMAL EXPERT CRITIQUE STILL REQUIRED**
Date: 2 August 2026
Scope: prototype-only direct/deep Order identity

## Why Round 6 was required

Pre-publication review opened `/orders/NV-DIRECT-999` in a clean browser
session. The URL retained `NV-DIRECT-999`, but the H1 and customer after-sales
links used fixture fallback `NV-DEMO-014`. Round 5 tested generated and retry
Order references, not this clean direct-entry case. Its cited recording is not
present in the repository artifact, so the historical Round 5 PASS cannot serve
as the current human-session gate.

## Prototype-only remediation

- Extract the first Order path segment from `/orders/:orderId` and owned
  after-sales descendants.
- Decode and accept only a bounded reference containing letters, digits, dot,
  underscore, or hyphen.
- Make the valid route reference authoritative for customer-facing display and
  persist it to prototype session state for later dashboard/client navigation.
- Preserve generated/retry Order behavior and the fixture fallback.
- Do not modify production frontend, backend, API, schema, migration, provider,
  or canonical decisions.

## Executed evidence

Environment: local Node prototype server on isolated port `4181`; Google Chrome
through Playwright CLI session `niuva113`.

| Check | Result |
| --- | --- |
| `node --check app.js` | PASS |
| Clean direct URL | PASS — `/orders/NV-DIRECT-999` |
| Order H1 | PASS — `NV-DIRECT-999` |
| Cancellation link | PASS — `/orders/NV-DIRECT-999/cancellation` |
| Cancellation page context | PASS — `Order NV-DIRECT-999` |
| Return link | PASS — `/orders/NV-DIRECT-999` |
| Dashboard next action | PASS — `Order NV-DIRECT-999` |
| Dashboard tracking link | PASS — `/orders/NV-DIRECT-999` |
| Session state | PASS — `orderReference` is `NV-DIRECT-999` |
| Browser console | PASS — 0 errors, 0 warnings |

The browser session began with a new Playwright session. Snapshots were taken
after the direct route, cancellation route, return route, and dashboard route.
No screenshot or recording is claimed as repository evidence.

## Result

`R6-P1-01` direct/deep Order identity is closed for focused revalidation. The
route, H1, after-sales links, persisted session state, and dashboard now agree
for a non-fixture Order reference.

This is not a complete formal expert critique. It does not re-execute every P0
and P1 scenario from earlier rounds and therefore does not change the moderated
review plan to `READY TO RUN`.

## Boundaries retained

- Human moderated sessions remain **NOT READY TO RUN**.
- Route recommendation remains `INSUFFICIENT_EVIDENCE`.
- Candidate cart and after-sales routes are not promoted.
- No application implementation, migration, provider selection, deployment,
  production-readiness, or go-live authority is granted.
