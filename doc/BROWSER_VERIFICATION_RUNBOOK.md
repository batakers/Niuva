# Browser Verification Runbook

Status: Runbook — manual verification procedure; execution evidence requires a
current environment, approved accounts, and captured results.

Provenance: This document provides operational verification guidance. It does
not independently authorize product, role, deployment, or go-live decisions.

Role matrix and responsive verification for the Admin Studio, in a real
browser at the four widths the plan names: 375, 768, 1024, and 1440.

## What this covers

- **Role matrix.** Each role sees exactly the navigation its permissions
  allow, and is refused at every forbidden route even when the URL is typed
  directly. Hiding a link is not access control, so both are checked.
- **Responsive.** No surface scrolls the page sideways at any of the four
  widths. Wide content scrolls inside its own container.
- **Touch targets.** No interactive control is under 44 px tall.
- **Keyboard.** The first tab stop is the skip link, and it moves focus to
  main content.
- **Mobile drawer.** Traps focus, closes on Escape, and returns focus to the
  control that opened it. Runs only at 375 and 768.
- **Reduced motion.** Nothing animates when the user asks for less motion.

Each width is a separate Playwright project, so a failure names the width it
happened at instead of being averaged away by the widths that passed.

## Prerequisites

The suite tests a running application. Nothing here starts a server, so a
missing environment fails loudly rather than silently testing nothing.

1. MongoDB running.
2. Backend running, **on the current code**. A server started before a route
   existed answers 404 where the suite expects 401, and the failure is the
   stale process rather than the product.
3. Frontend running or built and served.
4. One account per role, seeded and active.

## Accounts

Credentials come from the environment. A missing pair raises rather than
skips: a silent skip reports a pass for a role nobody checked.

```powershell
$env:E2E_SUPER_ADMIN_EMAIL = "..."; $env:E2E_SUPER_ADMIN_PASSWORD = "..."
$env:E2E_SALES_EMAIL       = "..."; $env:E2E_SALES_PASSWORD       = "..."
$env:E2E_WAREHOUSE_EMAIL   = "..."; $env:E2E_WAREHOUSE_PASSWORD   = "..."
$env:E2E_CONTENT_EMAIL     = "..."; $env:E2E_CONTENT_PASSWORD     = "..."
$env:E2E_PRODUCTION_EMAIL  = "..."; $env:E2E_PRODUCTION_PASSWORD  = "..."
```

Use accounts created for verification. Do not use a real operator's
credentials, and do not commit any of these values.

## Running

```powershell
$env:PLAYWRIGHT_BASE_URL = "http://localhost:3000"
# The API origin, which is not the app origin: the dev server answers any
# path with the SPA shell and a 200, which would let an authorization
# assertion pass against an HTML page.
$env:PLAYWRIGHT_API_URL  = "http://localhost:8010"

cd frontend
npx playwright test                      # all four widths
npx playwright test --project=mobile     # one width
npx playwright test --project=desktop -g "unauthenticated"
```

A failure leaves a trace:

```powershell
npx playwright show-trace test-results\<folder>\trace.zip
```

## Reading the results

- A pass at 1440 says nothing about 375. Read every project.
- Retries are off. An assertion that only passes on a second attempt is not
  evidence.
- A 404 where 401 is expected usually means the backend process predates the
  route. Restart it against the current code before investigating further.

## Not covered here

Screen-reader announcement quality needs a human with a screen reader; the
suite checks that the structures exist, not that they read well. Staging
smoke, canary, and post-deploy checks are separate and need their own
authorization.
