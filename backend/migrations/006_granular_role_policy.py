"""Granular internal-role migration.

Dry-run is the default. Apply and rollback require a transaction-capable guard
and an explicit backup path. Reviewed mappings use opaque user IDs only.
"""

import argparse
import asyncio
import json
import os
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from audit import append_identity_governance_event
from database_capabilities import probe_database_capabilities
from permissions import (
    CUSTOMER_ROLES,
    INTERNAL_ROLES,
    ROLE_POLICY_VERSION,
    validate_roles,
)
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard

MIGRATION_ID = "006_granular_role_policy"
MIGRATION_MARKER = "granular_role_migration_version"
MUTATED_FIELDS = (
    "role",
    "roles",
    "status",
    "access_state",
    "role_policy_version",
    MIGRATION_MARKER,
    "version",
    "token_version",
    "updated_at",
)
AGGREGATE_ROLES = frozenset({"operations", "commercial_finance"})


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def transaction_mutations_enabled() -> bool:
    return (
        os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").strip().lower()
        == "true"
    )


def _is_customer(account: dict) -> bool:
    roles = account.get("roles")
    return account.get("role") == "client" or (
        isinstance(roles, list) and bool(set(roles) & CUSTOMER_ROLES)
    )


def _mapping_entry(entry: object) -> dict:
    if not isinstance(entry, dict):
        raise ValueError("Reviewed mapping entries must be objects")
    roles = entry.get("roles")
    canonical = validate_roles(roles)
    if not canonical or any(role not in INTERNAL_ROLES for role in canonical):
        raise ValueError("Reviewed mapping must contain valid internal roles")
    reason = entry.get("reason")
    if not isinstance(reason, str) or not 3 <= len(reason.strip()) <= 500:
        raise ValueError("Reviewed mapping reason must be 3-500 characters")
    return {"roles": list(canonical), "reason": reason.strip()}


def _validate_mapping(accounts: list[dict], reviewed_mapping: dict | None) -> dict:
    mapping = reviewed_mapping or {}
    if not isinstance(mapping, dict):
        raise ValueError("reviewed_mapping must be an object keyed by opaque user ID")
    known_ids = {account.get("id") for account in accounts}
    unknown = sorted(set(mapping) - known_ids)
    if unknown:
        raise ValueError(f"Reviewed mapping contains unknown user ID: {unknown[0]}")
    accounts_by_id = {account.get("id"): account for account in accounts}
    customer_ids = sorted(
        user_id for user_id in mapping if _is_customer(accounts_by_id[user_id])
    )
    if customer_ids:
        raise ValueError(
            f"Reviewed mapping targets a customer account: {customer_ids[0]}"
        )
    return {user_id: _mapping_entry(entry) for user_id, entry in mapping.items()}


def _bootstrap_owner_ineligibility(
    account: dict | None,
    *,
    require_current_policy: bool,
) -> str | None:
    if account is None:
        return "bootstrap_owner_id does not identify a known user"
    if account.get("status") != "active":
        return "bootstrap_owner_id must identify an active user"
    if _is_customer(account):
        return "bootstrap_owner_id cannot identify a customer"
    if account.get("access_state") != "approved":
        return "bootstrap_owner_id must identify an approved user"
    if account.get("roles") != ["super_admin"] or "role" in account:
        return "bootstrap_owner_id must identify a canonical Super Admin candidate"
    if (
        require_current_policy
        and account.get("role_policy_version") != ROLE_POLICY_VERSION
    ):
        return "bootstrap_owner_id must use the current role policy"
    return None


def _validate_bootstrap_owner(
    accounts: list[dict],
    bootstrap_owner_id: str | None,
    *,
    required: bool,
    require_current_policy: bool = False,
) -> str | None:
    if bootstrap_owner_id is None:
        if required:
            raise ValueError("bootstrap_owner_id is required")
        return None
    if not isinstance(bootstrap_owner_id, str) or not bootstrap_owner_id.strip():
        raise ValueError("bootstrap_owner_id must be an opaque user ID")
    bootstrap_owner_id = bootstrap_owner_id.strip()
    account = next(
        (item for item in accounts if item.get("id") == bootstrap_owner_id),
        None,
    )
    error = _bootstrap_owner_ineligibility(
        account,
        require_current_policy=require_current_policy,
    )
    if error is not None:
        raise ValueError(error)
    return bootstrap_owner_id


def _plan(
    account: dict,
    mapping: dict,
    bootstrap_owner_id: str | None,
) -> dict | None:
    if _is_customer(account):
        return None
    if (
        account.get("role_policy_version") == ROLE_POLICY_VERSION
        and validate_roles(account.get("roles"))
        and account.get("access_state") == "approved"
    ):
        return None

    account_id = account["id"]
    roles = account.get("roles") if isinstance(account.get("roles"), list) else []
    legacy_role = account.get("role")
    if account_id == bootstrap_owner_id:
        category = "bootstrap_super_admin_preserved"
        next_roles = ["super_admin"]
        access_state = "approved"
        reason = "Preserve reviewed bootstrap Super Admin authority"
    elif account_id in mapping:
        category = "reviewed_mapping_applied"
        next_roles = mapping[account_id]["roles"]
        access_state = "approved"
        reason = mapping[account_id]["reason"]
    elif (
        legacy_role in INTERNAL_ROLES
        or legacy_role == "admin"
        or bool(set(roles) & (INTERNAL_ROLES | AGGREGATE_ROLES))
    ):
        category = "access_review_required"
        next_roles = []
        access_state = "access_review_required"
        reason = "No reviewed granular role mapping was supplied"
    else:
        return None

    next_record = {
        **account,
        "roles": next_roles,
        "access_state": access_state,
        "role_policy_version": ROLE_POLICY_VERSION,
        MIGRATION_MARKER: ROLE_POLICY_VERSION,
        "version": account.get("version", 1) + 1,
        "token_version": account.get("token_version", 0) + 1,
        "updated_at": now_iso(),
    }
    next_record.pop("role", None)
    return {
        "id": account_id,
        "category": category,
        "reason": reason,
        "before": account,
        "after": next_record,
    }


def _backup_document(plans: list[dict], bootstrap_owner_id: str) -> dict:
    return {
        "migration": MIGRATION_ID,
        "policy_version": ROLE_POLICY_VERSION,
        "bootstrap_owner_id": bootstrap_owner_id,
        "created_at": now_iso(),
        "accounts": [
            {
                "id": plan["id"],
                "fields": {
                    field: plan["before"][field]
                    for field in MUTATED_FIELDS
                    if field in plan["before"]
                },
            }
            for plan in plans
        ],
    }


def _write_backup(
    path: Path,
    plans: list[dict],
    bootstrap_owner_id: str,
) -> None:
    if path.exists():
        raise ValueError("backup_path already exists; refusing to overwrite")
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(
            _backup_document(plans, bootstrap_owner_id),
            indent=2,
            sort_keys=True,
        ),
        encoding="utf-8",
    )


async def _ensure_indexes(database) -> None:
    invitations = database.staff_invitations
    await invitations.create_index("token_hash", unique=True)
    await invitations.create_index(
        "email",
        unique=True,
        partialFilterExpression={"status": "pending"},
        name="one_pending_staff_invitation_per_email",
    )


async def _apply_plans(database, guard, plans: list[dict]) -> None:
    async def mutate(session):
        for plan in plans:
            before = plan["before"]
            after = plan["after"]
            expected_version = (
                before["version"] if "version" in before else {"$exists": False}
            )
            result = await database.users.update_one(
                {"id": plan["id"], "version": expected_version},
                {
                    "$set": {
                        field: after[field]
                        for field in MUTATED_FIELDS
                        if field != "role" and field in after
                    },
                    "$unset": {"role": ""},
                },
                session=session,
            )
            if result.matched_count == 0:
                raise RuntimeError(
                    f"Concurrent identity change detected for {plan['id']}"
                )
            await append_identity_governance_event(
                database,
                actor={"id": "migration:006", "email": None},
                action="identity.granular_role_migrated",
                target_type="user",
                target_id=plan["id"],
                before=before,
                after=after,
                reason=plan["reason"],
                session=session,
            )

    await guard.run(
        mutate,
        operation_name="identity.granular_role_migration.apply",
    )


def _load_backup(path: Path) -> dict:
    if not path.exists():
        raise ValueError("backup_path does not exist")
    backup = json.loads(path.read_text(encoding="utf-8"))
    if backup.get("migration") != MIGRATION_ID:
        raise ValueError("backup_path is not a migration 006 backup")
    return backup


async def _rollback(
    database,
    guard,
    backup: dict,
    bootstrap_owner_id: str,
) -> dict:
    accounts = backup.get("accounts")
    if not isinstance(accounts, list):
        raise ValueError("Migration backup accounts are invalid")
    if backup.get("bootstrap_owner_id") != bootstrap_owner_id:
        raise ValueError("bootstrap_owner_id does not match the migration backup")
    account_ids = [entry.get("id") for entry in accounts]
    if any(not isinstance(account_id, str) for account_id in account_ids):
        raise ValueError("Migration backup contains an invalid account ID")
    if len(set(account_ids)) != len(account_ids):
        raise ValueError("Migration backup contains duplicate account IDs")

    async def mutate(session):
        current_owner = await database.users.find_one(
            {"id": bootstrap_owner_id},
            session=session,
        )
        if _bootstrap_owner_ineligibility(
            current_owner,
            require_current_policy=True,
        ):
            raise RuntimeError("Reviewed bootstrap Owner is no longer eligible")

        for entry in accounts:
            account_id = entry["id"]
            current = await database.users.find_one({"id": account_id}, session=session)
            if not current:
                raise RuntimeError(f"Rollback user is missing: {account_id}")
            if account_id == bootstrap_owner_id:
                continue
            fields = entry.get("fields") or {}
            if not isinstance(fields, dict):
                raise ValueError("Migration backup fields are invalid")
            expected_migrated_version = fields.get("version", 1) + 1
            unset = {field: "" for field in MUTATED_FIELDS if field not in fields}
            result = await database.users.update_one(
                {
                    "id": account_id,
                    "version": expected_migrated_version,
                    MIGRATION_MARKER: ROLE_POLICY_VERSION,
                },
                {"$set": fields, "$unset": unset},
                session=session,
            )
            if result.matched_count == 0:
                raise RuntimeError(
                    f"Concurrent identity change detected for {account_id}"
                )
            restored = {**current, **fields}
            for field in unset:
                restored.pop(field, None)
            await append_identity_governance_event(
                database,
                actor={"id": "migration:006", "email": None},
                action="identity.granular_role_migration_rolled_back",
                target_type="user",
                target_id=account_id,
                before=current,
                after=restored,
                reason="Restore reviewed migration 006 backup",
                session=session,
            )

    await guard.run(
        mutate,
        operation_name="identity.granular_role_migration.rollback",
    )
    return {
        "restored": len(accounts) - int(bootstrap_owner_id in account_ids),
        "bootstrap_owner_preserved": int(bootstrap_owner_id in account_ids),
    }


async def run(
    database,
    *,
    apply: bool = False,
    rollback: bool = False,
    reviewed_mapping: dict | None = None,
    bootstrap_owner_id: str | None = None,
    backup_path: str | Path | None = None,
    guard=None,
) -> dict:
    if apply and rollback:
        raise ValueError("apply and rollback are mutually exclusive")
    if (apply or rollback) and guard is None:
        raise ValueError("A transaction-capable guard is required")
    if (apply or rollback) and backup_path is None:
        raise ValueError("backup_path is required for apply and rollback")

    path = Path(backup_path) if backup_path is not None else None
    if rollback:
        backup = _load_backup(path)
        current_accounts = [
            account async for account in database.users.find({}, {"_id": 0})
        ]
        reviewed_owner_id = _validate_bootstrap_owner(
            current_accounts,
            bootstrap_owner_id,
            required=True,
            require_current_policy=True,
        )
        result = await _rollback(
            database,
            guard,
            backup,
            reviewed_owner_id,
        )
        return {"rollback": True, **result}

    accounts = [account async for account in database.users.find({}, {"_id": 0})]
    mapping = _validate_mapping(accounts, reviewed_mapping)
    reviewed_owner_id = _validate_bootstrap_owner(
        accounts,
        bootstrap_owner_id,
        required=apply,
    )
    if reviewed_owner_id in mapping:
        raise ValueError("bootstrap_owner_id must not also appear in reviewed_mapping")
    plans = [
        plan
        for account in accounts
        if (plan := _plan(account, mapping, reviewed_owner_id)) is not None
    ]
    categories = Counter(plan["category"] for plan in plans)
    report = {
        "dry_run": not apply,
        "scanned": len(accounts),
        "updated": len(plans) if apply else 0,
        "planned": len(plans),
        "categories": dict(categories),
        "second_run_noop": apply and not plans,
    }
    if not apply or not plans:
        return report

    _write_backup(path, plans, reviewed_owner_id)
    await _ensure_indexes(database)
    await _apply_plans(database, guard, plans)
    return report


def _load_mapping(path: str | None) -> dict:
    if not path:
        return {}
    return json.loads(Path(path).read_text(encoding="utf-8"))


async def run_cli(args) -> dict:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    database_name = os.environ["DB_NAME"]
    try:
        database = client[database_name]
        guard = None
        if args.apply or args.rollback:
            capabilities = await probe_database_capabilities(client, database_name)
            executor = TransactionExecutor(client, lambda: capabilities)
            guard = TransactionMutationGuard(
                executor,
                transaction_mutations_enabled,
            )
        return await run(
            database,
            apply=args.apply,
            rollback=args.rollback,
            reviewed_mapping=_load_mapping(args.mapping),
            bootstrap_owner_id=args.bootstrap_owner_id,
            backup_path=args.backup,
            guard=guard,
        )
    finally:
        client.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Dry-run/apply/rollback granular internal roles (migration 006)."
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--rollback", action="store_true")
    parser.add_argument("--mapping", metavar="REVIEWED_MAPPING_JSON")
    parser.add_argument("--bootstrap-owner-id", metavar="OPAQUE_USER_ID")
    parser.add_argument("--backup", metavar="BACKUP_JSON")
    return parser


def main() -> None:
    print(json.dumps(asyncio.run(run_cli(build_parser().parse_args())), indent=2))


if __name__ == "__main__":
    main()
