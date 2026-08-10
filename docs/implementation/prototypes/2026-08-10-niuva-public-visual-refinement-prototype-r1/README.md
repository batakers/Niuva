# Niuva Public Visual Refinement Prototype — r1

**Status:** Candidate, prototype-only, synthetic data; R13 `PASS WITH CONDITIONS`
with 0 P0/0 P1. This status does not imply production readiness.

This is an isolated visual prototype for the candidate direction **Evidence-led
Prototyping Editorial**. It covers only the public/B2B slice:

- `/` — B2B-primary Home and artifact evidence;
- `/projects` and `/projects/pindad-ev-motor` — project index/detail reading;
- `/contact` — B2B Inquiry form, validation, response contract, and WhatsApp
  boundary.

It does not implement production UI, API, database, authentication, uploads,
map provider, payment, analytics, or WhatsApp activation. The `SIMULASI` notice
is intentionally neutral and does not represent a real submission.

## Run locally

From this directory:

```text
node server.cjs
```

Open `http://127.0.0.1:4178/` for Participant Mode. Open
`http://127.0.0.1:4178/review.html` only when preparing a synthetic state for
review. The server binds to loopback and serves no external content.

## Checks

```text
node --check app.js
node --check fixtures.js
node --check server.cjs
node --test prototype-flow.contract.test.cjs
node C:\Users\FAIZ\.agents\skills\impeccable\scripts\detect.mjs --json index.html review.html styles.css app.js
```

Browser checks must cover 390, 768, 1024, and 1440px, include keyboard/focus
and reduced-motion checks, and record results in `BROWSER_REVALIDATION.md` and
`VISUAL_QA.md`.

## Boundaries

Do not copy these files into `frontend/`, do not add dependencies, and do not
publish or merge them without a separate explicit approval. The parent packet,
task card, and candidate visual direction are planning inputs only.

## Latest gate

R13 focused remediation and revalidation are recorded in
`FORMAL_EXPERT_CRITIQUE_RERUN_13.md` and `R13_BROWSER_REVALIDATION.md`.
Publication of this candidate artifact is separate from production
implementation, canonical promotion, provider activation, deployment, and
moderated human research.
