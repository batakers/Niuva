Method: dual-agent (A: /root/formal_critique_a · B: /root/formal_critique_b)

# Formal Expert Critique — Public Visual Refinement Prototype R1

## Scope and provenance

- Target: `docs/implementation/prototypes/2026-08-10-niuva-public-visual-refinement-prototype-r1/index.html` plus the linked prototype routes and assets.
- Date: 2026-08-10.
- Surface: isolated visual/UX validation prototype only; no production source, API, database, provider, deployment, or go-live authority is implied.
- Review method: Assessment A was a design-director review of source, route behavior, and screenshots. Assessment B independently ran the Impeccable detector and browser evidence. Assessment A completed before its findings were combined with Assessment B.
- Review modes: Participant Mode and Review Mode were assessed as separate surfaces.

## Gate verdict

**FAIL — NOT READY FOR OWNER PUBLICATION OR MODERATED VALIDATION.**

The visual direction is specific and substantially less generic than a template, and the technical/browser evidence is clean. The formal gate remains closed because three P1 issues affect the core Projects and B2B Contact validation flows. There are no P0 findings. Remediation must remain prototype-only, followed by focused browser revalidation and another independent critique.

## Specificity and overall impression

**Specific with important gaps.** The `Evidence-led Prototyping Editorial` direction is grounded in Niuva: artifact-led project storytelling, challenge → decision → output framing, a B2B-primary narrative, factual inquiry boundaries, restrained ink/blue semantic color, and an open editorial sheet rather than a generic card grid. It does not read as interchangeable SaaS or portfolio template work.

The remaining gaps are trust-breaking rather than merely decorative. A visitor opening a shared project detail URL can see a broken mark and artifact, Contact feedback can be logically present but visually out of context, and the mobile first viewport hides the response promise and primary action. These defects undermine the very evidence-led validation the prototype is intended to support.

## Nielsen heuristic scores

| Heuristic | Score | Assessment |
| --- | ---: | --- |
| Visibility of system status | 3/4 | Simulated submitting, invalid, success, persistence, map, and WhatsApp states exist; sighted feedback can be below the current viewport or under the sticky header. |
| Match between system and real world | 3/4 | Inquiry, PIC, response target, challenge/decision/output, and simulation boundaries use credible Niuva language; map fallback lacks a concrete approved location detail. |
| User control and freedom | 3/4 | Navigation, retry, cancel, back, and Review → Participant handoff exist; state transitions do not always establish a strong visible focus point. |
| Consistency and standards | 2/4 | Token and component language is cohesive, but direct project deep-links break the mark and artifact because relative assets resolve under `/projects/`. |
| Error prevention | 3/4 | Required fields, consent, email validation, and value preservation are present; WhatsApp validation remains minimal. |
| Recognition rather than recall | 2/4 | Labels and context help, but broken detail imagery and below-fold Contact actions force inference at important moments. |
| Flexibility and efficiency | 2/4 | Responsive layouts and a WhatsApp alternative help; the mobile Contact path remains scroll-heavy and hides key contract/action information. |
| Aesthetic and minimalist design | 3/4 | Editorial composition, artifact prominence, and restrained palette are strong; broken deep-link output and some empty whitespace reduce polish. |
| Help users recognize, diagnose, and recover from errors | 2/4 | Plain validation and persistence recovery exist; success/error summaries can be missed visually and map-unavailable recovery has no actionable approved location detail. |
| Help and documentation | 3/4 | Response contract, consent, simulation copy, and review harness are discoverable; provider-unavailable location help is incomplete. |

**Total: 26/40 — Acceptable foundation, significant improvements required.**

## Cognitive load and emotional journey

The decision surface is generally low-load: the primary B2B action is clear, information is chunked into editorial sections, visible choices remain below four, and the prototype separates Participant Mode from Review Mode. One clear checklist failure remains: Contact mobile visual hierarchy does not surface the response contract and primary action in the first viewport. Status/feedback placement creates two conditional failures for sighted users because the next step may be below the fold or beneath the sticky header.

The emotional peak is the artifact-led project story and the reassuring inquiry success state. The largest valleys are (1) a shared project link that appears visually broken and (2) a submitted inquiry whose success acknowledgement is not immediately visible. Both occur at trust-sensitive moments and should be fixed before human validation.

## Priority findings

### R9-P1-01 — Deep-link asset resolution breaks the project detail experience

**Severity:** P1 — fix before the next gate.

Direct `/projects/:slug` routes resolve `assets/niuva-mark.svg` and project media relative to `/projects/`, producing `/projects/assets/...` instead of the prototype asset root. Assessment A observed broken mark/artifact rendering in the direct-detail screenshots. This invalidates the visual evidence for Projects/detail and weakens brand trust when a reviewer shares or opens a deep link.

**Impact:** Projects detail, shared-link validation, CVR-003, CVR-010, and CVR-013.

**Required direction:** use a route-safe root/base asset strategy for all supported deep links, then recapture the detail evidence at every required viewport.

### R9-P1-02 — Invalid/success feedback can be outside the sighted user’s visual context

**Severity:** P1 — fix before the next gate.

`handleSubmit()` rerenders the success state without ensuring the visible success heading is focused or scrolled into a safe position. The invalid summary has logical focus, but the sticky header and preserved scroll position can hide the most important context. A screen reader announcement may succeed while a sighted participant misses the same result.

**Impact:** B2B prospect confidence, keyboard/sighted parity, CVR-005, CVR-010, and error recovery.

**Required direction:** give the state heading/summary a visible focus target and `scroll-margin` safe area, move focus after rerender, and recapture invalid and success mobile evidence.

### R9-P1-03 — Contact mobile first viewport hides the response contract and primary action

**Severity:** P1 — fix before the next gate.

At 390px the first viewport shows the intro and “Mulai isi form”, but not the owner/SLA/working calendar, WhatsApp choice, or submit action. Desktop also places the submit action below the first fold. This weakens trust and conversion for the primary B2B path and conflicts with the packet’s first-viewport contract.

**Impact:** Mobile B2B prospect, CVR-004, CVR-010, and first-action discoverability.

**Required direction:** surface a compact response contract and action/choice rail in the first viewport without adding a second competing primary CTA.

### R9-P2-01 — Retail secondary CTA has no visible destination or state

**Severity:** P2.

The Home Retail bridge is rendered as an actionable-looking `#retail` link, but no destination target exists and its handler only updates a hidden live region. Because Retail remains deliberately deferred, the prototype should expose a visible bounded “Retail sedang disiapkan” state or an explicit unavailable screen rather than a dead-looking control.

### R9-P2-02 — Map-unavailable fallback is not actionable

**Severity:** P2.

The fallback says an address can be used but provides only retry. No approved static address or safe contact path is shown. Add approved static location detail when available, or state clearly that location help is inquiry-only; do not activate a provider as part of this prototype fix.

## Persona impact

- **Jordan — confused first-timer:** understands the B2B vocabulary and CTA, but may not know whether an inquiry succeeded when the acknowledgement is below the fold.
- **Casey — distracted mobile user:** cannot see the response promise, WhatsApp option, or primary submit action in the first viewport; an interruption increases the chance of abandonment.
- **Sam — keyboard/screen-reader user:** receives logical status announcements and focus in the tested paths, but the visual focus/scroll contract is not consistently aligned for sighted keyboard users.
- **Riley — deliberate stress tester:** opening a direct project URL exposes the relative-asset defect; map-unavailable and deferred-Retail states also reveal incomplete fallback contracts.

## Strengths to preserve

- Artifact-led Home and Projects composition with challenge → decision → output storytelling.
- B2B-primary narrative, exact consent language, owner/response target, and non-guarantee boundary.
- Participant Mode / Review Mode separation with synthetic fixtures and no evaluator vocabulary leak.
- Approved local mark and project media with provenance recorded in the asset manifest.
- Factual simulation boundary, map/WhatsApp/persistence states, retry paths, and no fabricated metrics.
- Responsive structure, 44px target checks, semantic landmarks, skip-link, labels, and live-region coverage.

## Minor observations and open questions

- Projects desktop leaves a large quiet area before the artifact; consider a meaningful crop after the deep-link fix rather than filling it with generic UI.
- Poppins/Inter are currently CSS fallbacks without local font assets, so captures can vary by machine; preserve the canonical pairing and document the fallback expectation.
- Mobile invalid/success screenshots should be recaptured after focus/scroll remediation so the evidence frame itself communicates the result.
- Confirm whether shared `/projects/:slug` is an explicitly supported participant route; the current task card includes it, so this critique treats it as supported.
- Confirm the approved studio address/contact text for a provider-unavailable fallback.

## Independent Assessment B evidence

- Impeccable detector: `node C:\Users\FAIZ\.agents\skills\impeccable\scripts\detect.mjs --json index.html review.html styles.css app.js` → `[]`, exit 0.
- Syntax: `node --check app.js fixtures.js server.cjs` → PASS.
- Contract test: `node --test prototype-flow.contract.test.cjs` → 6/6 PASS.
- Browser matrix: Home, Projects, Pindad detail, and Contact × 390/768/1024/1440px → 16/16 PASS for no console errors/warnings, no external requests, no horizontal overflow, no checked target below 44px, landmarks, labels, image alt text, skip-link, aria-live, and no Review/evaluator vocabulary in Participant Mode.
- Critical interactions PASS: invalid summary focus and value preservation; persistence-unavailable recovery; success acknowledgement and WhatsApp action; map unavailable/retry; Review → Participant handoff; dynamic Pindad/Agate/Xeon detail routes.
- Assessment B noted one serialized persistence-key anomaly in a combined harness run; isolated reruns were consistently PASS, so it is treated as a harness artifact rather than a product failure.

## Run notes

- Target slug: `a-public-visual-refinement-prototype-r1-index-html`.
- Ignore list: no `.impeccable/critique/ignore.md` was present in the prototype worktree.
- Assessment independence: A and B were separate subagents; A completed before B evidence was used in synthesis.
- Browser server: local `server.cjs` on port 4178; stopped after evidence collection and port 4178 was confirmed free.
- Overlay injection: not used; no user-visible Impeccable overlay is claimed. Browser evidence came from the bounded Playwright checks.
- Temporary artifacts: no new temporary files were retained from the critique run; no production or canonical files were changed.
- Publication: no commit, push, PR, merge, provider activation, deployment, or readiness decision was performed.

## Next gate

Keep the prototype and route recommendation in candidate status. Remediate R9-P1-01 through R9-P1-03 in the isolated prototype only, rerun the focused browser evidence (including direct detail links and mobile Contact states), then request another independent dual-agent critique. R9-P2-01 and R9-P2-02 should be addressed in the same pass if they can be fixed without expanding scope.
