# OPS-02 Role-Aware Operations Work Home

**Status:** Candidate — Context Only — Operations work-home artifact; no source,
permission, metric, data, or lifecycle change

**Route:** `/admin`

## 1. Hierarchy

```text
role/workspace context
  → owned or assigned work queues
  → factual age/exception context when provided
  → next valid queue/detail action
  → history/recovery and permission-safe empty/error branches
```

The home is a work-oriented entry, not a generic KPI dashboard. It may use
unequal modules when real work priority justifies them, but every module must
name its source and authorized next action.

## 2. Role variants

| Role/permission | Visible work | Boundary |
| --- | --- | --- |
| Sales/Inquiries | Inquiry queue and owned triage | No production/customer-wide audit |
| Quotes/Projects | Quote/project revision queues | Separate resource/lifecycle |
| Catalog/Inventory | Catalog/material/stock work | No payment/provider inference |
| Production | Work-order/QC queues | No machine telemetry invented |
| Content | Portfolio/content evidence/publish work | Provenance and rollback remain required |
| Missing permission | Safe unavailable state | Hidden route is not authorization |

## 3. States and responsive behavior

Loading mirrors module hierarchy; empty identifies why no work exists; error
retains safe context; conflict/permission/recovery are in-page. At 390/768/
1024/1440px, modules stack by authorized priority; keyboard order follows task
criticality. No bento or fake telemetry is required.

## 4. Self-review

Passed against OPS-01, DS-04/DS-05, Product register, and permission
boundaries. No KPI, data, permission, source, or route behavior changed.
