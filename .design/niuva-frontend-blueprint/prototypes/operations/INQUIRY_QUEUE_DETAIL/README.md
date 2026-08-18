# OPS-01 Inquiry Queue to Record Detail Prototype

**Status:** Candidate — Context Only — Operations calibration prototype; no
role, permission, API, mutation, or source change

**Routes:** `/admin/inquiries` → `/admin/inquiries/:id`

## 1. Queue/detail pattern

```text
role scope + queue heading
  → query/filter/reset + factual count/cursor
  → rows/list alternative with Inquiry identity/status/age
  → selected record detail: reference, safe contact, history, permitted action
  → conflict/uncertain/retry/recovery
  → return to queue with safe query/cursor context
```

The queue distinguishes Inquiry from Quote, Project, Retail Order, and Work
Order. Status tones are presentation only; Inquiry transitions remain domain
owned (`new`, `reviewed`, `contacted`, `converted`, and permitted rejection).

## 2. Role projection matrix

| Role scope | Queue | Detail | Forbidden |
| --- | --- | --- | --- |
| `inquiries.read` | Inquiry records in authorized scope, factual count/cursor | Safe contact/need/timeline/brief, status/history allowed by policy | Broad audit, unrelated resources, hidden permission metadata |
| Missing permission | No queue data or a safe forbidden state | No protected detail | Route visibility as authorization |
| Operator action permission | Guarded action with confirmation and current state | Result names what persisted and existing reference | Invented conversion, Quote, Project, or WhatsApp success |

## 3. State and density notes

- Loading/skeleton mirrors queue columns; empty and no-match are distinct.
- Dependency failure retains safe filter/query context and offers bounded retry.
- Stale/conflict shows authoritative version and requires reload/reconfirm.
- Uncertain action reconciles before any retry that could duplicate effects.
- A dense queue may use a semantic mobile list; row click alone is never the
  only keyboard path.
- “Urgent” or “aged” must come from factual domain data; no fake KPI or broad
  audit dashboard is introduced.

## 4. Self-review

Passed against DS-03/DS-04/DS-05, B2B lifecycle authority, current B2BList
route evidence, and permissions. Role-safe variants, keyboard return, dense
390/768/1024/1440 reasoning, and customer-data boundary are explicit. No source
or role behavior changed.
