# Niuva Homepage Production Implementation Plan — Pending Reconciliation

## Authority and Non-Authorization Gate

This plan is governed by DEC-UX-001 and DEC-UX-002. It specifies one Unified
Homepage with a B2B-primary narrative, a clear Retail secondary path, and the
Experimental Editorial Hybrid visual direction. It does not decide the detailed
Retail/B2B navigation treatment and does not authorize implementation.

This document does not authorize source-code changes, Auth or Admin redesign, detailed Retail/B2B navigation, provider selection, production activation, commit creation, or push.

Stop before any source, route, component, stylesheet, asset, CMS-schema, or
production change until a separate implementation approval is recorded.

## Homepage-Only Scope

This replacement reconciles the public Homepage plan only. It establishes the
Homepage narrative, the relationship between the two customer journeys, and the
approved visual direction that a later implementation plan must follow.

It does not expand to Auth, Admin Studio, other public routes, checkout,
payments, catalog information architecture, provider selection, shipping,
pickup, tax, reservation, refund, or return policy. Detailed Retail/B2B
navigation remains deferred.

## Unified Homepage Information Architecture

The Homepage presents one Niuva identity and one website with two distinct
journeys. Its information architecture must first establish Niuva's R&D, design
engineering, and prototyping credibility; then make project evidence,
capabilities, and a clear B2B discussion path understandable; and provide a
clearly discoverable Retail path without making Retail the primary narrative.

The later implementation must preserve distinct destinations and intents for
Retail purchase/configuration and B2B inquiry/RFQ. It must not imply that Retail
Order and B2B Quote/Project share one lifecycle or state machine.

## B2B-Primary Narrative

B2B is the first and strongest Homepage narrative. The opening hierarchy should
communicate R&D, design engineering, prototyping, capabilities, and authentic
project proof before directing visitors toward a project discussion or inquiry.

Research & Development and Design & Prototyping remain visually dominant.
Consultant & Workshop and Apparel & Merchandise remain supporting capabilities.
Content must use approved, factual project evidence and must not invent clients,
metrics, outcomes, process artifacts, or other claims.

## Retail Secondary Path

Retail is a first-class but secondary customer path. It must be discoverable on
desktop, tablet, and mobile and lead toward catalog discovery, standardized
configuration, safe price/ETA, checkout, payment, and tracking when those
surfaces are separately implemented and approved.

This plan does not select a Retail CTA label, placement, navigation control, or
interaction pattern. It must not make the Homepage Retail-first,
marketplace-first, discount-led, or e-commerce-only.

## Experimental Editorial Hybrid Translation

The Homepage visual direction is the Experimental Editorial Hybrid. A later
implementation must combine technical transformation logic with editorial
clarity, readable hierarchy, open project presentation, and restraint.

Use Poppins for display, headings, navigation-style UI, and buttons; use Inter
for body copy, labels, captions, forms, and public metadata. Use the approved
lowercase `ni` mark, authentic project evidence, differentiated capability
chapters, and a semantic `Need → Research → Experiment → Prototype → Output`
U-curve. The initial Homepage permits exactly two dominant U-curve placements:
a compact hero path and a complete process path.

Do not use gradients, neon, glassmorphism, particles, decorative telemetry,
fake dashboards, generic futuristic effects, decorative public monospace, or
repeated U-curves as wallpaper or ornament. Motion must remain at or below 5/10
intensity and must not be necessary to understand content or reach an action.

## Responsive and Accessible States

The later implementation must preserve the B2B-primary hierarchy and Retail
discoverability across desktop, tablet, and mobile without deciding the detailed
navigation treatment in this plan. Retail discovery must be verified at each
viewport before approval.

Every motion-dependent expression requires a complete static equivalent for
reduced-motion users. Typography, contrast, semantic structure, keyboard reach,
and action clarity must be verified with the actual implementation and approved
content; no fabricated imagery or inaccessible visual effect may substitute for
evidence.

## Verification Before Implementation Approval

Before any source-code authorization, confirm that:

- DEC-UX-001's Unified Homepage and B2B-primary narrative remain intact.
- DEC-UX-002's Experimental Editorial Hybrid constraints are translated without
  copying prototype composition wholesale or extending it to other routes.
- Retail remains clear but secondary, with separate Retail and B2B destination
  flows and no detailed navigation decision implied.
- Authentic project evidence, approved brand assets, reduced-motion behavior,
  responsive Retail discovery, accessibility, and performance constraints have
  a concrete implementation review plan.
- The historical plan at `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`
  and its test pin remain preserved until a separately authorized source-change
  transition removes that dependency.

Only a separate, explicit implementation authorization may permit source changes
for the Homepage.
