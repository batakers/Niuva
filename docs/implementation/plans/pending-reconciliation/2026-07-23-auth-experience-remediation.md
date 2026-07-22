# Niuva Auth Experience Remediation Plan — Pending Reconciliation

## Authority and Non-Authorization Gate

This plan is a bounded customer-access planning document. It is subordinate to
the approved product requirements, backend authorization boundary, and the
experience decisions recorded in `docs/decisions/experience/`. `DEC-UX-001`
governs the Unified Homepage separately; it does not make Homepage work part of
this plan.

This document does not authorize source-code changes, authentication-provider
selection, changes to backend authorization, role-model changes, detailed
Retail/B2B navigation, Homepage work, Admin Studio redesign, production
activation, commit creation, or push. A later, explicit implementation approval
is required before any source change.

## Bounded Scope

The bounded scope is the customer-access experience only: entry to sign-in or
account-access flows, form clarity, error and recovery states, safe return
destination behavior, loading and disabled controls, accessible labels, and
customer-safe session messaging.

The plan preserves the existing backend authorization boundary and least-
privilege role model. It does not merge Retail and B2B lifecycles, invent an
identity provider, alter organization access, or treat a hidden control as
authorization.

Homepage composition, public navigation, project narrative, Retail catalog and
checkout, Admin Studio, CMS, and Operations Back-office are explicitly excluded.
The Unified Homepage remains approved rather than deferred, and this plan does
not remove or replace Inter; Inter remains the approved body, metadata, form,
and dense operational text face under the cross-surface design guidance.

## Experience Constraints

Customer access must be calm, understandable, and accessible. It must preserve
safe return behavior, avoid fabricated security claims, disclose no internal
operational data, and keep errors actionable without revealing sensitive account
or authorization details.

Future visual work must use the approved lowercase `ni` mark and shared semantic
tokens. It must not import Homepage-only editorial composition, U-curve motifs,
decorative telemetry, simulated-terminal language, or generic marketplace
treatment into access flows.

## Verification

Before any implementation authorization, verify that a bounded source plan:

- preserves backend authorization and current customer-data boundaries;
- defines accessible labels, keyboard behavior, visible focus, loading,
  disabled, error, retry, expired, and safe recovery states;
- keeps Homepage and Admin Studio changes out of scope;
- retains Inter and the shared semantic-token/component compatibility boundary;
- identifies affected routes, components, tests, privacy impact, and rollback
  steps without performing them; and
- receives separate approval for source changes and any later commit or push.

This plan does not authorize implementation.
