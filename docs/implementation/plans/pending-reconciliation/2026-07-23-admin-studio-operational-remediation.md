# Niuva Admin Studio Operational Remediation Plan — Pending Reconciliation

## Authority and Non-Authorization Gate

This plan is a bounded operational-experience planning document governed by
`DEC-OPS-001`, the approved platform requirements, and the backend authorization
boundary. Admin Studio contains CMS and Operations Back-office; it is not a
third customer journey.

This document does not authorize source-code changes, dashboard or navigation
implementation, role-model changes, backend authorization changes, Homepage
work, Auth redesign, provider selection, production activation, commit creation,
or push. A later, explicit implementation approval is required before any source
change.

## Bounded Scope

The bounded scope is Admin Studio's role-aware, permission-aware, task-oriented,
dense-but-calm, status-led operational experience. It covers the planning needed
to review information hierarchy, next actions, filters, data density, validation,
auditable activity, recovery, and applicable loading, empty, error, conflict,
retry, permission, stale, and expired states.

This plan does not determine exact Admin information architecture, dashboard
composition per role, navigation grouping, responsive drawer behavior,
role-homepage mapping, analytics/KPI definitions, visualization library, or
component API. It does not alter backend authorization, expose internal data to
customers, or invent operational metrics.

Homepage composition and Auth experience are explicitly excluded. The Unified
Homepage remains approved rather than deferred, and this plan does not remove or
replace Inter; Inter remains the approved body, metadata, form, and dense
operational text face under the cross-surface design guidance.

## Operational Experience Constraints

Admin Studio must prioritize data clarity, visible next action, status,
validation, filters, permission boundaries, audit history, and recovery. It must
not copy public Homepage composition, U-curve decoration, generic KPI-card grids,
decorative telemetry, fabricated data, or simulated-terminal language into
operational surfaces.

Monospace remains limited to genuine technical data such as SKU, order number,
revision, timestamp, operation ID, status code, and audit identifier. It must
not turn ordinary labels, explanations, navigation, metrics, or empty states into
a pseudo-terminal treatment.

## Verification

Before any implementation authorization, verify that a bounded source plan:

- preserves backend authorization, least privilege, customer-data boundaries,
  auditability, and recovery requirements;
- identifies the affected role, task, state, data-density, accessibility, and
  responsive behaviors without changing implementation;
- keeps Homepage and Auth changes out of scope;
- retains Inter and the shared semantic-token/component compatibility boundary;
- avoids fabricated KPI values, public-marketing decoration, and decorative
  terminal language; and
- receives separate approval for source changes and any later commit or push.

This plan does not authorize implementation.
