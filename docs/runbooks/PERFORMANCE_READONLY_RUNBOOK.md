# Read-only Performance Verification Runbook

Status: **Runbook — thresholds require owner approval**

This runbook measures the active read-only Retail catalog without creating
orders, reservations, uploads, payments, or other mutations. It does not
authorize staging/production access, select an SLA, or invent a performance
budget.

## Preconditions

1. Record the tested revision, environment owner, approved HTTPS origin,
   test window, request count, concurrency, timeout, maximum p95 latency, and
   maximum error rate.
2. Confirm the target is an isolated or approved non-production environment
   with representative published catalog data and observability enabled.
3. Confirm the test cannot reach checkout/payment because those capabilities
   remain inactive.
4. Stop if no numerical thresholds have been explicitly approved. Do not
   derive them from this repository.

## Command

Supply the approved values explicitly:

```bash
python scripts/load_readonly_api.py \
  --base-url https://approved-staging.example \
  --requests APPROVED_REQUEST_COUNT \
  --concurrency APPROVED_CONCURRENCY \
  --timeout-seconds APPROVED_TIMEOUT \
  --max-p95-ms APPROVED_P95_MS \
  --max-error-rate APPROVED_ERROR_RATE
```

Local HTTP is rejected unless `--allow-http-local` is supplied, and that
exception only accepts `localhost` or `127.0.0.1`. The probe performs GET
requests only against `/api/catalog/products?limit=24`, caps concurrency at
200 and total requests at 10,000, emits no response bodies, credentials, or
personal data, and exits non-zero when an approved threshold is exceeded.

## Evidence

Retain the revision, sanitized command parameters, environment identifier,
UTC/offset timestamp, JSON aggregate output, application request/DB metrics,
reviewer, and outcome. Do not store credentials, raw response bodies, customer
data, or provider secrets.

This probe is one staging gate. It does not replace query-plan review,
transaction/concurrency tests, worker outage/recovery testing, or go-live
approval.
