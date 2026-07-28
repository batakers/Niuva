# Niuva Production-Readiness Audit Evidence Guide

Status: Context Only — Audit Evidence and Progress Tracker — Not Implementation Authority

Baseline SHA: `c28684d34c03505ea2f862f32c6edc24b1d7bfba`
Last updated: 2026-07-28 01:53:32 WIB (UTC+07:00)

## Purpose

This directory is reserved for durable, sanitized audit evidence that is too
large or too execution-specific for a layer document. No evidence file was
created during initialization.

## Evidence requirements

Every evidence artifact must record:

- evidence ID;
- related layer and finding IDs;
- repository SHA and dirty-state note;
- Asia/Jakarta timestamp;
- environment class: local, isolated CI, staging, production-like, or
  production;
- exact safe command or collection method;
- exit code and relevant result;
- source path and line references where applicable;
- redactions and known limitations;
- collector and reviewer when operational evidence requires them.

## Prohibited content

Do not store:

- credentials, API keys, tokens, cookies, signing material, password hashes, or
  secret values;
- database URLs or provider secrets;
- raw customer files or documents;
- direct personal contact or payment identifiers;
- unnecessary names, emails, addresses, bank data, raw provider payloads, or
  internal notes;
- production data extracts;
- unreviewed generated reports that contain secrets or sensitive fixtures.

Use opaque IDs, aggregate counts, allowlisted fields, and redacted excerpts.

## Naming convention

Use:

```text
YYYYMMDD-HHMMSS-WIB_<layer>_<finding-or-check>_<kind>.<ext>
```

Examples:

```text
20260728-093000-WIB_06_SEC-001_pytest.txt
20260728-101500-WIB_08_deploy-config_review.md
```

Do not encode a customer, user, provider credential, or production hostname in
the filename.

## Evidence kinds

- `command`: exact command, exit code, and bounded output
- `test`: deterministic test result and environment
- `static`: source/configuration excerpt referenced by `path:line`
- `decision`: approved decision reference, never a copied substitute
- `operational`: redacted backup/restore, deployment, incident, or ownership
  record
- `screenshot`: only when essential, redacted, and tied to a reproducible state

## Storage rules

- Prefer `path:line` references over copying source into this directory.
- Keep command output bounded and remove secrets before writing.
- Record a hash for externally supplied evidence when practical.
- Do not overwrite old evidence; create a new timestamped artifact.
- Mark superseded evidence and link to the replacement.
- Generated cache files such as `.coverage`, build output, browser traces, and
  test reports are not evidence until their provenance and baseline are
  verified.
- Evidence status never grants implementation or go-live authority.

## Index template for future evidence

| Evidence ID | Layer/Finding | SHA | Timestamp WIB | Environment | Method | Result | Redactions | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _none recorded_ | — | — | — | — | — | — | — | — |

## Changelog

### 2026-07-28 — Evidence directory initialized

- Added evidence handling, redaction, provenance, and naming rules.
- Stored no source output, test report, credential, or secret.
