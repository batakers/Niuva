# Superpowers Specs Compatibility Index

Status: **Context Only — legacy compatibility and historical evidence**

This directory contains no active implementation specification. Do not use its
name or contents as authority for a new task. Start with the Master Spec,
Document Register, Decision Register, applicable decision or ADR, runbook, and
current source/tests instead.

| File | Current role | Do not use for |
| --- | --- | --- |
| `2026-07-14-unified-retail-b2b-platform-design.md` | Compatibility pointer to the [canonical active specification](../../implementation/specs/active/2026-07-14-unified-retail-b2b-platform-design.md) | Independent authority or a second copy of the platform direction |
| `2026-07-22-identity-access-model-design.md` | Superseded historical evidence; the [DEC-ACCESS-001 granular role decision](../../decisions/access/DEC-ACCESS-001-granular-internal-role-boundary.md) governs current role direction | Aggregate three-role authority, account migration, permission rollout, or Task 8 |

Keep both files at their stable paths. They are referenced by historical audit
and migration evidence. Do not move or delete them without a separately
approved documentation migration that revalidates every inbound reference.
