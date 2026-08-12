# Homepage R4 Candidate Publication Scope Audit

Status: **PASS WITH CONDITIONS — EXACT-PATH PUBLICATION ELIGIBLE**

Audit date: 2026-08-12

Candidate root: `docs/implementation/prototypes/2026-08-12-niuva-homepage-r4-prototype/`

Baseline: `8334b7053d72b1676cb022333b1b35ad5d4f6f04`

Fetched `origin/main`: `8334b7053d72b1676cb022333b1b35ad5d4f6f04`

Divergence: `0 ahead / 0 behind`

## Audit outcome

R4 is eligible for a prototype-only documentation PR after it is copied into a
clean publication worktree created from the fetched `origin/main`. The current
exploration worktree must not be staged wholesale because it also contains the
untracked R2 and R3 prototype folders and nine unused R4 carryover assets.

This audit does not authorize staging, commit, push, PR creation, merge,
canonical promotion, production implementation, dependency changes,
deployment, readiness, or go-live.

## Exact publication scope

Publish only the following R4 groups:

### Prototype and documentation

- `index.html`
- `styles.css`
- `app.js`
- `server.cjs`
- `homepage-r4.contract.test.cjs`
- `browser-validate.cjs`
- `README.md`
- `VISUAL_QA.md`
- `ASSET_MANIFEST.md`
- `PUBLICATION_SCOPE_AUDIT.md`

### Rendered assets

- `assets/niuva-mark.svg`
- `assets/projects/pindad-ev-motor.webp`
- `assets/projects/xeon-redesign.webp`
- `assets/projects/agate-motorcycle-simulator.webp`

### Candidate fonts and licenses

- `fonts/MonaSansVF.woff2`
- `fonts/BonaNova-Italic.woff2`
- `fonts/OFL-Mona-Sans.txt`
- `fonts/OFL-Bona-Nova.txt`

### Validation evidence

- `evidence/browser-results.json`
- all twelve R4 screenshots currently under `evidence/screenshots/`

Expected publication: **31 files**, approximately **6.44 MB**. The screenshots
account for most of the size and are retained because they directly support the
ID/EN, desktop/mobile, 320px resilience, and full-page visual evidence.

## Explicit exclusions

Do not publish:

- the sibling `2026-08-12-niuva-homepage-r2-prototype/` folder;
- the sibling `2026-08-12-niuva-homepage-r3-prototype/` folder;
- `assets/projects/agate-bicycle-arcade.webp`;
- all eight files under `assets/company-profile/`;
- production files under `frontend/`;
- `DESIGN.md` or canonical documents;
- dependency manifests or lockfiles;
- provider, API, database, CMS, deployment, or environment configuration; or
- any generated temporary server file or local tool configuration.

The nine excluded R4 carryovers total **889,101 bytes** and are not referenced
by `index.html`, `styles.css`, or `app.js`.

## Verification carried forward

- source syntax checks: PASS;
- contract tests: **18/18 PASS**;
- browser matrix: **10/10 PASS**;
- focused browser interactions: PASS;
- 320, 390, 768, 1024, and 1440px evidence: PASS;
- ID and EN candidate routes: PASS;
- official mark hash matches `frontend/public/niuva-mark.svg`: PASS;
- final root-file whitespace and newline check: PASS; and
- Impeccable detector: one unsuppressed P2 `overused-font` warning for the
  owner-selected Mona Sans candidate.

## Conditions before publication

1. Create a clean branch and worktree from the fetched `origin/main`.
2. Copy only the 31 exact-scope files above.
3. Verify that R2, R3, and all nine excluded carryovers are absent.
4. Stage explicit paths only; do not use `git add .`.
5. Re-run syntax, 18 contract tests, whitespace checks, and referenced-asset
   checks in the clean worktree.
6. Request separate authorization before commit, push, and PR creation.
7. Keep the PR prototype-only; do not combine it with canonical amendments or
   production implementation.

## Post-publication gates

After the prototype PR is merged, stable product and information-architecture
decisions may proceed through a separate canonical amendment. Pixel-level CSS,
spacing, animation parameters, and the Mona Sans + Bona Nova pairing remain
candidate design choices unless the owner explicitly promotes them.

Production implementation remains a later gate and must be based on canonical
authority plus a production implementation task card. R4 HTML, CSS, and
JavaScript are reference evidence, not code to copy directly into the
application.
