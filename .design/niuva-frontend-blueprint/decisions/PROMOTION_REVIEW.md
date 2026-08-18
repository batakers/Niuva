# QA-05 — Component, pattern, and token promotion review

**Status:** Candidate promotion review — no runtime promotion
**Selected SHA:** `8555685c29a3fde9976ae6499336e2eb45a330ba`
**Authority:** DS-01A exact-SHA ledger, DS-01B route matrix, DS-02–DS-05
contracts, QA-01 through QA-04, `DESIGN_TOKENS.md`, and the two-real-consumer
rule

## Promotion ledger

| Candidate | Current status | Consumer evidence | Semantic meaning and restriction | Next gate |
| --- | --- | --- | --- | --- |
| Button, Label, Input, Textarea, FormField, Select family, Switch | Adopted shared primitives | Multiple current consumers recorded in DS-01A/DS-02 | Interaction and form mechanics only; domain copy and authority remain local | Compatibility-preserving source pilot only |
| Dialog, AlertDialog, Alert, Sonner reinforcement, Skeleton | Adopted feedback primitives | Multiple consumers and tests recorded in DS-01A/DS-03 | Visible critical feedback precedes toast/live-region reinforcement | Runtime state/accessibility evidence in source pilot |
| EmptyState, ErrorState, OperationalState, SurfacePanel | Adopted shared state/surface mechanics | Public/private/Operations consumers recorded in DS-01A/DS-03 | Surface and lifecycle meaning is supplied by domain adapters | Exact state consumer review |
| Domain status adapters (Inquiry, Account, Portfolio, Retail Order, Work Order) | Adopted pattern adapters | Resource-specific consumers in DS-01A/DS-04 | Similar visual status does not merge lifecycles | Server/source-state verification |
| Tabs | Held / provisional | One current consumer; no speculative second consumer | Shared mechanics are documented, but promotion threshold is unmet | Wait for a second real same-meaning consumer |
| Drawer | Quarantined | No approved consumer; undeclared `vaul` boundary | No adoption or dependency admission | Separate dependency and accessibility decision |
| ResponsiveTable, Progress, Separator, StatCard, Tooltip | Provisional / zero-consumer | Zero current application consumers in DS-01A | Presence/export/test is not adoption proof | Real consumer and contract evidence required |
| BrandButton | Compatibility split | Legacy/compatibility consumers recorded | Do not create a new consumer; migrate only with replacement and rollback | Separate compatibility task card |
| Public `HOME_ART_DIRECTION_A` | LOCAL preferred | One page study only | Evidence-led Homepage expression; not a durable token or shared component | Owner art-direction selection, then G3 |
| Public `HOME_ART_DIRECTION_B` | Held evidence | One alternative study | Historical comparison only; no new consumer | Retain until owner disposition |
| Operations grid A/B | LOCAL preferred/held | One Operations study only | Density experiment; not shared bento or token promotion | Owner selection and G3 |
| FDM replacement | Not selected | Zero approved consumer | No replacement visual is canonized by this packet | Separate canonical/design decision |
| React Bits/Magic UI donors | Reference-only / held | No runtime consumer | Donor catalog popularity is not need, contract, or license evidence | Donor admission per EXP-01 |
| Public page-local colors, line treatments, art values | LOCAL | One page/surface consumer | Promote only after two real consumers with the same semantic meaning | QA + migration evidence |
| `DESIGN_TOKENS.css` preview values | Candidate preview only | Blueprint preview, not runtime source | Cannot promote or replace `frontend/src/index.css` here | Foundation G3 task |

## Promotion rules applied

1. A source file, export, test, or visual similarity does not promote a
   component.
2. A candidate must have at least two real consumers with the same semantic
   meaning, a complete NDS 13-field contract, surface restrictions, state and
   accessibility evidence, owner, migration path, and rollback.
3. Page-local or art-direction values remain LOCAL until that evidence exists.
4. Compatibility, quarantine, zero-consumer, and held records remain visible;
   they are not silently deleted or renamed.
5. A promotion review cannot activate routes, APIs, providers, checkout,
   upload, payment, production, or canonical design authority.

## Findings and dispositions

Adopted records remain compatible with current source evidence. Tabs,
zero-consumer components, Drawer, BrandButton compatibility, page-local
art-direction values, and donor experiments remain held or provisional for
explicit reasons. No P0/P1 promotion conflict exists; the unresolved items
are deliberate evidence and approval gates.

## Self-review

- [x] Every status names consumer evidence, meaning, restriction, and next
  gate.
- [x] Two-real-consumer and NDS 13-field rules are applied consistently.
- [x] LOCAL, held, provisional, compatibility, and quarantined records remain
  distinct from adopted primitives.
- [x] No source, token, dependency, route, or canonical status changed.
- [x] QA-01 through QA-04 limitations are carried into promotion decisions.

**Self-review result:** Pass as candidate promotion ledger; no runtime
promotion authorized.
