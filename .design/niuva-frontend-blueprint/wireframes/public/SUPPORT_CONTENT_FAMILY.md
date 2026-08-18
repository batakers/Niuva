# PUB-06 FAQ, Privacy, and Not Found Support Family Wireframe

**Status:** Candidate — Context Only — Public support-family artifact

**Routes:** `/faq`, `/en/faq`, `/privasi`, `/en/privacy`, and locale-aware `*`

## 1. Archetypes

```text
FAQ: topic/search only when volume justifies it → answer → owned related route
Privacy: scope → data purpose → retention/contact route → revision
Not Found: missing-route explanation → locale-aware Home/Services/Projects/Contact recovery
```

FAQ search is not universal navigation. Privacy does not hide the exact Inquiry
consent. Not Found does not expose route inventory or reserved project paths.

## 2. States

| Surface | Ready | Empty/error/recovery |
| --- | --- | --- |
| FAQ | Scannable topic groups, answer, related destination | No-match reset; dependency error with owned FAQ/Home recovery |
| Privacy | Current approved revision and purpose | Missing revision is a content governance gap, not invented policy |
| Not Found | Clear missing-route state | Locale-aware links to owned Public routes; no automatic IP locale redirect |

## 3. Interaction/accessibility

Use semantic headings and landmarks, keyboard disclosure with focus return,
visible search label if justified, long legal ID/EN copy at 200% reflow, and
critical error/recovery in-page. Reduced motion keeps answer content and
recovery links static.

## 4. Self-review

Passed against DS-04/DS-05, Public route/locale authority, and privacy/consent
boundaries. No policy, indexing, analytics, route, or source behavior changed.
