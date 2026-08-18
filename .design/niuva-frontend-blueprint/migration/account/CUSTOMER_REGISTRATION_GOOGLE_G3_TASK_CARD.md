# MIG-03B — Customer Registration with optional Google identity

**Status:** Candidate G3 contract — documentation-only; G4 source and provider
implementation not authorized by this card

**Follow-up status:** This historical G3 contract was followed by the separately
approved G4 scope and merged implementation in [PR #296](https://github.com/batakers/Niuva/pull/296).
The runtime slice is now source-present but remains disabled by
`CUSTOMER_REGISTRATION_ENABLED=false` and `CUSTOMER_GOOGLE_OIDC_ENABLED=false`;
no provider credentials or activation are implied here.

**Parent:** Account/Auth route family; separate from the completed MIG-03A
Customer Login/recovery pilot

**Baseline:** `origin/main` at
`e0e43e5ca3126acc7604e2f312abcd7723ed70e4`

**Follow-up baseline:** `origin/main` at
`b1142f1d0bf1edcad33498e71b6a950aa6039450` after PR #296.

**Surface:** Customer Account entry for the Retail journey

**Related authority:** `DEC-UX-003`, `DEC-UX-004`, `DEC-RT-02`, current
Customer/Auth source and tests, and the companion template compatibility review
at [`TEMPLATE_COMPATIBILITY_REVIEW_FASTAPI_REACT_MONGODB.md`](../../validation/TEMPLATE_COMPATIBILITY_REVIEW_FASTAPI_REACT_MONGODB.md)

## Objective

Define the smallest truthful Customer Registration contract for `/register`,
with email/password and an optional Google Identity path, before any runtime
route, provider, session, API, schema, or secret is activated.

At the reviewed G3 baseline, `/register` was canonical but inactive. The later
G4 slice adds the route and its verification path, while the feature flags keep
public registration and Google OIDC disabled. Google remains an optional
identity provider, not a new Customer lifecycle and not a checkout shortcut.

## Existing boundary

- `/login`, password recovery, and reset presentation are already bounded by
  the MIG-03A Customer Login/recovery pilot.
- `/register` is absent from the current runtime route table and public
  registration remains disabled by backend authority.
- Staff login, staff invitation, Admin, Operations, Customer Dashboard, and
  Order Detail remain separate surfaces and route owners.
- Retail still requires an authenticated Customer before private upload and
  authoritative checkout. Registration or Google login creates no Order,
  reservation, payment attempt, upload authority, or production state.

## G3 read-only evidence paths

These paths are inspected to establish ownership and consumers. Listing them
does not authorize their modification or staging:

- `frontend/src/App.js` — route owner and safe-return boundary;
- `frontend/src/pages/auth/CustomerLogin.jsx` — existing Customer entry;
- `frontend/src/components/auth/AuthShell.jsx` — audience-specific shell;
- `frontend/src/i18n.js` — existing ID/EN copy source;
- `frontend/src/pages/auth/CustomerLogin.test.jsx` and related Auth tests;
- `backend/server.py` — current auth route and session integration owner;
- `backend/auth_sessions.py` — existing session service;
- `backend/auth_recovery.py` — recovery and identity lookup seams;
- `backend/auth_security_events.py` and `backend/auth_security_alerts.py` —
  security/audit seams; and
- `backend/requirements.txt` — dependency baseline only.

Potential new runtime files, provider dependencies, database indexes, and
callback routes must be named only in a later exact-file G4 review after this
contract is approved.

## Candidate user flow

```text
/register or /login
  -> choose email/password or "Lanjutkan dengan Google"
  -> provider/server validation
  -> consent and account outcome
  -> Niuva Customer session
  -> safe local return or explicit next step
```

### Email/password path

The form contract must name the minimum fields, privacy/terms consent, password
policy, duplicate-safe response, verification state, expiry/retry, abuse
control, recovery, and safe return. Exact field names and retention remain an
owner-reviewed G3 decision; this card must not invent them from the template.

### Google path

The provider path must:

1. start from an explicit user-clicked action;
2. use a server-owned authorization-code/OIDC callback;
3. validate issuer, audience, stable subject, expiry, nonce/state/PKCE,
   redirect allowlist, and the approved `email_verified` policy;
4. look up identity by provider plus stable subject;
5. distinguish new account, existing linked account, and account-linking
   required outcomes;
6. never silently merge by email alone;
7. apply Niuva consent, customer lifecycle, session, security-event, and
   safe-return authority; and
8. expose a bounded recovery or alternate email/password path when Google is
   canceled, unavailable, expired, or rejected.

Google may supply an identity assertion, but it does not decide Niuva roles,
permissions, customer projection, Retail eligibility, price, stock, file
access, checkout, or payment authority.

## Required visible states

| State | Required UX meaning | Prohibited shortcut |
| --- | --- | --- |
| Ready | Explain account purpose, email path, Google path, privacy, and safe return. | Implying checkout or upload is available before authentication. |
| Validation error | Preserve safe fields, show summary/field relationship, manage focus. | Generic toast or wiping the form. |
| Submitting/redirecting | Label the action and prevent duplicate submit. | Spinner-only or repeated provider requests. |
| Duplicate/account exists | Explain the next authorized sign-in/link path without revealing account existence unnecessarily. | Silent merge or account enumeration. |
| Verification pending | State what is pending, expiry, resend/retry, and recovery route. | Calling the account fully active without authority. |
| Provider canceled/unavailable | Preserve safe context and offer bounded alternate path. | Treating cancellation as success. |
| Callback invalid/expired | Explain that Google verification did not complete and provide safe retry. | Accepting an unverified client claim. |
| Linking required | Require explicit, authenticated account-link action and reconfirmation. | Linking by matching email alone. |
| Abuse/rate limited | State that the action is temporarily unavailable and when/how to retry. | Exposing internal thresholds or looping retries. |
| Session failure | State whether account creation/linking persisted before retry. | Blind retry that can duplicate identity effects. |
| Success | State account/session outcome, owner, safe destination, and remaining setup. | Claiming Order, upload, payment, or Retail eligibility. |

All critical states must be visible to sighted users and assistive technology,
localized in Indonesian and English, keyboard reachable, and independent of
color, hover, or a conversational-only channel.

## Component and interaction contract

- Registration remains a graphical form flow. Search UX may surface an active
  `/register` destination as a navigational result only after activation;
  conversational UX is not a substitute for required fields or account
  consent.
- The Google action is a normal labeled button with provider state, focus,
  cancel, error, retry, and reduced-motion behavior.
- AuthShell may be reused only for matching Customer semantics; staff and
  Operations compositions remain separate.
- No new shared primitive or token is promoted by this card. Any new control
  must use existing component/state contracts or receive a separate foundation
  review.
- Safe return accepts only the existing owned Account/Retail allowlist; no
  external or invented private `/en` destination is allowed.

## Security and backend contract gates

Before G4, the contract owner must resolve:

- provider client configuration, environment separation, callback allowlist,
  secret custody, and redacted observability;
- provider subject persistence, uniqueness, account-linking and unlink policy;
- session issuance, revocation, rotation, replay, and Customer/Admin boundary;
- verification, consent, privacy, abuse/rate-limit, audit, and retention rules;
- duplicate-safe responses and non-enumerating account states;
- safe return and post-auth context preservation; and
- provider outage, callback uncertainty, retry, recovery, and rollback.

The backend implementation must preserve Niuva's layered route/controller/
service/repository boundaries where a new provider module is approved, validate
all external input, and test the critical service and route paths. A working
local callback is not staging, production, readiness, or go-live evidence.

## Candidate G3 acceptance criteria

- [ ] Exact current source/test consumers are revalidated against the selected
  `origin/main` SHA.
- [ ] Registration fields, consent, password policy, verification, recovery,
  abuse control, and account states are explicitly approved.
- [ ] Google provider protocol, callback, claims, subject mapping, linking,
  cancel/error/retry, and provider outage behavior are explicitly approved.
- [ ] Niuva session/customer projection and Customer/Admin boundaries are
  preserved; no provider creates business authority.
- [ ] Safe return, ID/EN copy, accessibility, responsive, and reduced-motion
  requirements are complete.
- [ ] The template compatibility review is recorded with exact external SHA,
  license, adopt/amend/reject/defer disposition, and no copied runtime code.
- [ ] G4 exact-file source scope, dependency decision, and rollback are named
  in a separate approval.

## Explicit exclusions

This card does not authorize:

- edits to `frontend/src/App.js`, Customer Login, AuthShell, backend auth, or
  any runtime source;
- a new `/register` route, Google callback, OAuth/OIDC provider, client ID,
  client secret, dependency, database index, schema, migration, or API;
- session, role, permission, identity-linking, customer-projection, Retail
  upload, checkout, payment, reservation, or production changes;
- public registration activation, staging, production readiness, deployment,
  or go-live; or
- copying, vendoring, or publishing the external template as Niuva source.

## Gate and delivery record

This candidate card and its companion compatibility review may be delivered as
documentation only. G3 owner review, G4 exact-file implementation, dependency/
secret activation, provider verification, staging, and readiness remain
separate gates. The owner Goal may perform documentation staging, commit, push,
PR, thread handling, and merge after self-review, but it does not collapse G3
into G4.
