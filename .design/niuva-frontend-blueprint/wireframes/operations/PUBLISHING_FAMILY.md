# OPS-06 Publishing Family

**Status:** Candidate — Context Only — Operations publishing artifact; no CMS,
asset, route, publication, or source change

**Routes:** `/admin/portfolio`, `/admin/portfolio/:id`, `/admin/content`

## 1. Hierarchy

```text
draft/published context
  → factual content + asset provenance
  → locale readiness (ID/EN)
  → version/history + preview/diff where available
  → guarded publish or rollback gate
  → conflict/permission/failure recovery
```

Publishing status, version, owner, and rollback are domain-owned. Missing
translation or media remains explicit; a toast cannot prove publication.

## 2. Provenance/state contract

An evidence record carries source/rights, owner, evidence type, exact claim,
caption/alt text, derivative disclosure, checksum/revision, language readiness,
and factual review date. States include draft, validation error, missing asset,
missing translation, dependency error, conflict, permission, guarded publish,
published success, and rollback/recovery.

## 3. Accessibility and review

Editor controls are labelled, keyboard reachable, focus returns after dialog or
conflict, long bilingual content reflows at 200%, and factual captions remain
visible. No generated/stock/conceptual visual may masquerade as project proof.

## 4. Self-review

Passed against PUB-05, OPS-01, DS-03, evidence provenance, locale contract, and
publication authority. No CMS schema, asset, route, publish action, or source
behavior changed.
