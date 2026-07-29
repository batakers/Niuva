# Feature 1.7 — Authentication Security Events Revalidation

Date: 29 July 2026
Branch: `feat/backend-auth-security-events`
Initial revalidation baseline:
`a2747aab58ae25536cab28f55415c5628559c27e`
PR baseline after final synchronization:
`e6d7e451208c5ef45e0f723c5fdb4645802a27fb` (`origin/main`)
Review mode: source, schema, test, permission, and decision revalidation only

Supersession note: the blocked-state findings below describe the initial branch
baseline. The Project Owner subsequently approved `DEC-AUTH-011`; bounded
implementation evidence is recorded in
`FEATURE-1.7-auth-security-events-remediation.md`. Production gates remain.

## Outcome

Authentication security-event persistence is not implemented. The backend has
a general `audit_events` collection and append helpers for business and
identity-governance mutations, but it has no dedicated authentication-event
module, storage interface, collection, retention cleanup, analyst access
boundary, or alert pipeline.

`DEC-AUTH-009` approves dedicated redacted event families, pseudonymized unknown
identifiers, least-privilege access, and 90-day retention. It also explicitly
withholds source implementation until the storage/deletion design and named
owners are approved. The feature therefore remains **blocked by decision** and
is not production-ready.

## Audit status

| Audited area | Status | Current state |
|---|---|---|
| Dedicated authentication-event schema | `BELUM_DIKERJAKAN` | No authentication security-event collection, model, field allowlist, or storage port exists. |
| Separation from general audit/notifications | `SUDAH_SEBAGIAN` | Decisions prohibit using general stores, but no dedicated replacement exists. Existing `audit_events` is a business/identity audit store and must not be reused by assumption. |
| Approved event families | `BELUM_DIKERJAKAN` | Login success/failure, reset processing/completion, session revocation, MFA lifecycle, and limiter decisions are not persisted through a classified auth-event interface. |
| Public response protection | `SUDAH_SELESAI` for current auth contracts | Login and recovery responses remain generic. This does not prove internal event classification. |
| Field redaction and allowlist | `SUDAH_SEBAGIAN` outside this feature | General audit helpers redact selected keys, but they are not the stricter authentication-event allowlist and do not provide nested prohibited-value rejection evidence required by `DEC-AUTH-009`. |
| Unknown-identifier pseudonymization | `SUDAH_SEBAGIAN` | The limiter uses secret-keyed HMAC identifiers. No approved reusable auth-event pseudonymization/key-rotation contract exists. |
| Ninety-day retention | `BELUM_DIKERJAKAN` | The policy is approved, but no auth-event expiry index, cleanup worker, aggregation boundary, backup interaction, or deletion proof exists. |
| Authorized analyst boundary | `TERBLOKIR_KEPUTUSAN` | No security/technical primary or backup owner is named and no dedicated read permission/API exists. A broad Admin Audit viewer remains unauthorized. |
| Alerting | `TERBLOKIR_KEPUTUSAN` | Thresholds, destination, SLA, escalation, on-call ownership, and provider are unselected. |
| Cleanup procedure | `TERBLOKIR_KEPUTUSAN` | Storage adapter, deletion job, backup expiry interaction, evidence owner, and longer-lived aggregate policy are unapproved. |
| Migration/schema execution | `BELUM_DIKERJAKAN` and `TERBLOKIR_ENVIRONMENT` | No migration exists and no isolated target/window/backup/rollback authorization was provided. |
| Security-event tests | `BELUM_DIKERJAKAN` | No field-allowlist, nested secret rejection, access denial, controlled-clock expiry, cleanup, alert, or failure-mode test suite exists. |

## Approved contract that later work must preserve

- Use a dedicated authentication-event module and storage interface, not
  general notifications or the general Admin audit presentation.
- Allow only login success, classified login failure, reset-request processing,
  reset completion, session revocation, MFA enrollment/change/recovery, and
  limiter-decision event families unless a later decision extends the set.
- Persist only minimum actor/account reference, event type, safe reason,
  timestamp, approved request context, outcome, and correlation data.
- Never persist passwords or hashes, reset tokens or hashes, OTPs, recovery
  codes, cookies, Authorization headers, CSRF secrets, provider payloads, or
  raw exception bodies.
- Pseudonymize unknown identifiers and exclude classified reason/security
  metadata from customer-facing responses.
- Restrict access to explicitly designated security/technical owners; do not
  restore a general Admin Audit viewer.
- Delete or irreversibly aggregate directly identifiable records after 90 days.
- Keep public login/recovery behavior generic regardless of internal reason.

## Decisions required before source implementation

1. Name the primary security/technical owner and backup owner.
2. Select the storage adapter and collection boundary.
3. Approve the exact event schema, safe reason vocabulary, request-context
   allowlist, identifier pseudonymization key source, key rotation, and outage
   behavior.
4. Approve the read boundary: service identity, analyst roles, query limits,
   export prohibition/allowance, evidence handling, and break-glass access.
5. Define the 90-day deletion mechanism, schedule, lease/concurrency behavior,
   retry/dead-letter policy, backup expiry interaction, proof of deletion, and
   cleanup owner.
6. Decide whether longer-lived non-identifying aggregates are required and
   define their minimum fields and retention.
7. Approve alert families, thresholds, destination, deduplication/cooldown,
   response SLA, escalation runbook, monitoring owner, and provider outage
   behavior.
8. Approve transaction/failure behavior when an auth operation succeeds but
   event persistence or alert delivery fails; do not silently downgrade auth
   security.
9. Authorize a separate schema/migration plan with isolated preflight, backup,
   dry run, validation, rollback/compensation, and stop conditions.

## Required verification after approval

- allowlist construction rejects unknown fields and all prohibited values,
  including nested mappings, arrays, encoded/common aliases, and exception
  representations;
- known and unknown public login/recovery results remain equivalent;
- unknown identifiers are pseudonymized and plaintext identifiers never enter
  events, logs, notifications, or alert payloads;
- operational roles, customers, and ordinary Admin sessions cannot read,
  query, export, or infer classified events;
- controlled-clock tests prove 90-day selection and deletion without removing
  newer records, while backup/restore behavior matches policy;
- concurrent cleanup workers cannot double-process or skip eligible records;
- storage, cleanup, pseudonymization-key, alert-provider, and notification
  failures follow the approved fail-safe policy;
- repeated privileged failures, recovery abuse, revocation anomalies, and MFA
  recovery produce deduplicated alerts without sensitive material;
- migration dry-run/idempotence/validation/rollback passes only on an approved
  isolated target.

## Safety boundary

This revalidation did not create an event store, permission, route, migration,
cleanup job, alert provider, dependency, secret, `.env` setting, commit, push,
deployment, or production activation.
