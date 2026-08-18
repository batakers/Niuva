# PUB-05 Project Evidence Archive Wireframe

**Status:** Candidate — Context Only — Public evidence artifact

**Routes:** `/proyek` and `/en/projects`

## 1. Archive responsibility

The archive answers “What has Niuva actually done and what does it prove?”
Each item exposes published factual evidence: context, challenge,
method/contribution, output, and capability proven. The archive does not assume
`/proyek/:slug` or `/en/projects/:slug` detail ownership.

```text
archive heading + scope
  → factual evidence collection
  → caption/action available without hover
  → missing-media/text fallback
  → loading/error/empty/no-match
  → archive/contact recovery
```

## 2. Evidence item contract

| Field | Requirement |
| --- | --- |
| Identity | Approved project/content record or honest generic label |
| Claim | Exact factual claim supported by the asset |
| Context/challenge | Visible only when verified |
| Contribution/output | Captioned, attributed, and bilingual when activated |
| Capability proven | Omit if evidence does not support it |
| Asset | Rights, source, checksum/revision, crop/edit disclosure |
| Fallback | “Dokumentasi visual untuk tahap ini belum tersedia…” or omit claim |
| Action | Archive/non-link until detail route separately activated |

## 3. States and accessibility

Empty is distinct from dependency failure; loading preserves hierarchy; no-match
shows selected criteria and reset; focus returns after filter/media action.
Captions remain visible, media has meaningful alt text, and keyboard users can
reach every action at 320–1440px and 200% zoom. Conceptual/stock/generated
visuals are labelled and cannot substantiate Niuva work.

## 4. Self-review

Passed against PUB-02, DS-04, evidence provenance contract, reserved route
rules, and ID/EN requirements. No CMS, asset, route, sitemap, or source change.
