# DEC-UX-001 — Unified Homepage with Business/B2B-Primary Narrative

ID: `DEC-UX-001`
Title: Unified Homepage with Business/B2B-Primary Narrative
Status: **Approved Decision**
Decision date: 23 July 2026
Decision source: Explicit user decision recorded during documentation consolidation, 23 July 2026.

## Context

The approved v2.1 platform defines one Niuva website and one operational platform with Retail and Business/B2B customer journeys. Earlier v2.1 sources intentionally left the Homepage pattern open between split gateway, unified, and Retail-first options.

The existing Homepage production plan is dated 13 July 2026. It was prepared before the Retail-B2B v2.1 baseline dated 14 July 2026 and therefore does not define a clear Retail entry path. Leaving that plan unchanged would preserve Niuva's B2B positioning but fail to communicate the approved two-journey platform.

The Homepage must express both journeys without weakening the core identity of Niuva as an R&D, design engineering, and prototyping partner.

## Decision

Niuva will use a **Unified Homepage**.

- Business/B2B is the primary narrative.
- R&D, design engineering, prototyping, capabilities, and authentic project proof establish the first and strongest impression.
- Retail is a secondary but clearly discoverable path into catalog, standardized configuration, safe price/ETA, checkout, payment, and tracking.
- The Homepage must not be Retail-first, marketplace-first, or e-commerce-only.
- Retail and B2B remain part of one website and one identity rather than separate products or unrelated sub-sites.

This decision closes the former deferred decision about Homepage pattern.

## Rationale

- Business/B2B best represents Niuva's established positioning and strongest credibility evidence.
- Retail is an approved first-class journey and must not be hidden behind a B2B-only Homepage.
- A unified pattern communicates shared foundations without implying shared customer lifecycles.
- Retail-first treatment would risk turning Niuva into a commodity or merchandise marketplace.
- A split gateway would delay positioning and project evidence before the visitor understands what Niuva does.
- A governed unified narrative allows B2B credibility and Retail discoverability to coexist.

## Consequences

- Future canonical documents must remove Homepage pattern from deferred decisions.
- Homepage information architecture and content must include a clear Retail entry without giving it narrative dominance.
- The Homepage production implementation plan dated 13 July 2026 requires reconciliation before it can be considered implementation-ready.
- Homepage CMS schema may be designed from the unified pattern, but implementation still requires explicit authorization.
- Retail discoverability must be verified on desktop, tablet, and mobile once implementation is authorized.
- Retail and B2B calls to action must preserve their different intents and destination flows.

## Constraints

- Do not make all journeys visually equal if that weakens the B2B-primary positioning.
- Do not hide Retail so deeply that visitors cannot discover the transaction path.
- Do not collapse Retail Order and B2B Quote/Project into one state machine or ambiguous conversion flow.
- Do not introduce a marketplace, multi-vendor, discount-led, or merchandise-led identity.
- Do not invent Retail products, prices, ETA, policies, inventory availability, or payment-provider behavior.
- Do not implement navigation, Homepage schema, route changes, or source-code changes without separate authorization.

## Deferred Details

This decision does not determine:

- detailed visual navigation or switch treatment for Retail and B2B;
- exact mobile navigation behavior;
- exact Retail CTA label, placement, or interaction pattern;
- first Retail implementation vertical slice;
- catalog information architecture;
- provider, shipping, pickup, tax, reservation, refund, or return policy;
- visual rollout to About, Capabilities, Projects, or Contact.

## Superseded Statements

This decision supersedes only the following statements or assumptions within otherwise active documents:

- `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`: Homepage pattern remains deferred.
- `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`: Homepage pattern remains deferred.
- `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`: split gateway, unified Homepage, or Retail-first remains open.
- `PRODUCT.md`: Homepage pattern remains deferred.
- `AGENTS.md`: Homepage pattern remains deferred.
- `doc/APPROVAL_Platform_Niuva_v2_1_retail_b2b.md`: Homepage pattern is listed as outside the earlier approval.
- `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`: any assumption that the production Homepage can proceed without a clear secondary Retail path.

The documents themselves are not superseded in full. Their other approved scopes remain unchanged.

## References

- `doc/BRD_Website_Niuva.md`
- `doc/PRS_Website_Niuva.md`
- `doc/BRD_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `doc/PRS_Platform_Niuva_v2_1_retail_b2b_addendum.md`
- `doc/PRD_Platform_Niuva_v2_1_retail_b2b.md`
- `docs/superpowers/specs/2026-07-14-unified-retail-b2b-platform-design.md`
- `docs/decisions/evidence/HOMEPAGE_PROTOTYPE_DECISION.md`
- `doc/brand/HOMEPAGE_PRODUCTION_IMPLEMENTATION_PLAN.md`
