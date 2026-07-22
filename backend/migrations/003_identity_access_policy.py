import argparse
import asyncio
import json
import os
from collections import Counter
from pathlib import Path

from audit import append_identity_audit_event
from database_capabilities import probe_database_capabilities
from permissions import (
    CUSTOMER_ROLES,
    INTERNAL_ROLES,
    ROLE_POLICY_VERSION,
    SUPERSEDED_INTERNAL_ROLE_MARKERS,
    canonical_roles,
)
from transaction_execution import TransactionExecutor, TransactionUnavailableError
from transaction_guard import TransactionMutationGuard

POLICY_STATE_ID = "identity_access_policy"
EVIDENCE_FIELD = "identity_policy_migration_evidence"
MARKER_FIELD = "identity_policy_migration_version"
MIGRATION_REASON_CODE = "policy_migration_v1"
MIGRATE_OPERATION = "identity.policy.migrate_account"
ROLLBACK_OPERATION = "identity.policy.rollback_account"


class MigrationSafetyError(RuntimeError):
    """Raised when an identity migration precondition is not satisfied."""


def transaction_mutations_enabled() -> bool:
    return (
        os.environ.get("TRANSACTION_MUTATIONS_ENABLED", "false").strip().lower()
        == "true"
    )


def _safe_status(account: dict) -> str:
    return (
        account.get("status")
        if account.get("status") in {"active", "disabled"}
        else "active"
    )


def _projection(account: dict) -> dict:
    return {
        "roles": list(canonical_roles(account)),
        "access_state": account.get("access_state", "approved"),
        "status": _safe_status(account),
    }


def _evidence(account: dict) -> dict:
    evidence = {"policy_version": ROLE_POLICY_VERSION}
    existing = account.get(EVIDENCE_FIELD)
    if isinstance(existing, dict):
        legacy_role = existing.get("legacy_role")
        if isinstance(legacy_role, str):
            evidence["legacy_role"] = legacy_role
        legacy_roles = existing.get("legacy_roles")
        if isinstance(legacy_roles, list) and all(
            isinstance(role, str) for role in legacy_roles
        ):
            evidence["legacy_roles"] = list(legacy_roles)
    if "role" in account:
        evidence["legacy_role"] = account.get("role")
    if "roles" in account:
        roles = account.get("roles")
        if isinstance(roles, list) and roles:
            evidence["legacy_roles"] = list(roles)
        elif not isinstance(roles, list):
            evidence["legacy_roles"] = []
    return evidence


def _has_internal_legacy_marker(account: dict) -> bool:
    if account.get("role") in SUPERSEDED_INTERNAL_ROLE_MARKERS:
        return True
    roles = account.get("roles")
    return isinstance(roles, list) and any(
        role in SUPERSEDED_INTERNAL_ROLE_MARKERS for role in roles
    )


def _is_current(account: dict) -> bool:
    if account.get(MARKER_FIELD) == ROLE_POLICY_VERSION:
        return True
    return (
        "role" not in account
        and EVIDENCE_FIELD not in account
        and account.get("role_policy_version") == ROLE_POLICY_VERSION
        and account.get("status") in {"active", "disabled"}
        and account.get("access_state") in {"approved", "access_review_required"}
        and (
            account.get("access_state") == "access_review_required"
            or len(canonical_roles(account)) == 1
        )
    )


def _is_current_bootstrap_owner(account: dict, bootstrap_owner_id: str) -> bool:
    if account.get("id") != bootstrap_owner_id:
        return False
    approved_owner = (
        "role" not in account
        and account.get("roles") == ["super_admin"]
        and account.get("status") == "active"
        and account.get("access_state") == "approved"
        and account.get("role_policy_version") == ROLE_POLICY_VERSION
    )
    if not approved_owner:
        return False
    return account.get(MARKER_FIELD) == ROLE_POLICY_VERSION or (
        MARKER_FIELD not in account and EVIDENCE_FIELD not in account
    )


def _classify(account: dict, bootstrap_owner_id: str | None) -> str:
    if bootstrap_owner_id and account.get("id") == bootstrap_owner_id:
        if _is_current_bootstrap_owner(account, bootstrap_owner_id):
            return "already_current"
        return "bootstrap_owner_assigned"
    if account.get(MARKER_FIELD) == ROLE_POLICY_VERSION:
        return "already_current"
    if _is_current(account):
        return "already_current"
    if account.get("role") == "client":
        return "legacy_client"
    if _has_internal_legacy_marker(account):
        return "legacy_internal_review_required"
    roles = account.get("roles")
    if isinstance(roles, list) and any(role in INTERNAL_ROLES for role in roles):
        return "canonical_internal_review_required"
    if isinstance(roles, list) and len(roles) == 1 and roles[0] in CUSTOMER_ROLES:
        return "canonical_customer_updated"
    return "unclassified_review_required"


def _desired(account: dict, category: str) -> tuple[dict, dict]:
    status = _safe_status(account)
    if category == "bootstrap_owner_assigned":
        roles = ["super_admin"]
        access_state = "approved"
    elif category in {"legacy_client", "canonical_customer_updated"}:
        roles = (
            ["retail_customer"]
            if category == "legacy_client"
            else list(account["roles"])
        )
        access_state = "approved"
    else:
        roles = []
        access_state = "access_review_required"

    values = {
        "roles": roles,
        "status": status,
        "access_state": access_state,
        "role_policy_version": ROLE_POLICY_VERSION,
        EVIDENCE_FIELD: _evidence(account),
        MARKER_FIELD: ROLE_POLICY_VERSION,
    }
    projection = {
        "roles": roles,
        "status": status,
        "access_state": access_state,
    }
    return values, projection


async def _accounts(database) -> list[dict]:
    return [account async for account in database.users.find({})]


def _report(accounts: list[dict], bootstrap_owner_id: str | None) -> dict:
    categories = Counter()
    remediation_ids = []
    for account in accounts:
        category = _classify(account, bootstrap_owner_id)
        categories[category] += 1
        if category in {
            "legacy_internal_review_required",
            "canonical_internal_review_required",
            "unclassified_review_required",
        }:
            account_id = account.get("id")
            if isinstance(account_id, str) and account_id:
                remediation_ids.append(account_id)
    remediation = (
        {"access_review_required": sorted(remediation_ids)} if remediation_ids else {}
    )
    return {
        "policy_version": ROLE_POLICY_VERSION,
        "categories": dict(sorted(categories.items())),
        "remediation_ids": remediation,
        "failures": {"total": 0},
    }


def _reject_unready_guard(guard, operation_name: str) -> None:
    if guard is None:
        raise MigrationSafetyError("A transaction mutation guard is required")
    executor = guard.executor
    if not guard.enabled_provider() or not executor.capability_provider().transactions:
        executor.reject_unavailable(operation_name=operation_name)


async def ensure_indexes(database) -> None:
    await database.identity_policy_state.create_index("key", unique=True)
    await database.users.create_index("access_state")
    await database.users.create_index("roles")
    await database.users.create_index("role_policy_version")


def _conditional_update_filter(account_id: str, category: str) -> dict:
    query = {"id": account_id}
    if category != "bootstrap_owner_assigned":
        query[MARKER_FIELD] = {"$ne": ROLE_POLICY_VERSION}
        return query
    query["$or"] = [
        {MARKER_FIELD: {"$ne": ROLE_POLICY_VERSION}},
        {"role": {"$exists": True}},
        {"roles": {"$ne": ["super_admin"]}},
        {"status": {"$ne": "active"}},
        {"access_state": {"$ne": "approved"}},
        {"role_policy_version": {"$ne": ROLE_POLICY_VERSION}},
    ]
    return query


async def _migrate_account(
    database, guard, account: dict, bootstrap_owner_id: str
) -> bool:
    account_id = account["id"]

    async def mutate(session):
        current = await database.users.find_one({"id": account_id}, session=session)
        if current is None:
            return False
        category = _classify(current, bootstrap_owner_id)
        if category == "already_current":
            return False
        values, result_projection = _desired(current, category)
        result = await database.users.update_one(
            _conditional_update_filter(account_id, category),
            {"$set": values, "$unset": {"role": ""}},
            session=session,
        )
        if result.matched_count == 0:
            return False
        if category == "bootstrap_owner_assigned":
            await _reconcile_policy_state(database, session=session)
        action = (
            "identity.bootstrap_owner_assigned"
            if category == "bootstrap_owner_assigned"
            else "identity.policy_migrated"
        )
        await append_identity_audit_event(
            database,
            actor_user_id=bootstrap_owner_id,
            action=action,
            target_type="user",
            target_id=account_id,
            previous=_projection(current),
            result=result_projection,
            reason_code=MIGRATION_REASON_CODE,
            policy_version=ROLE_POLICY_VERSION,
            session=session,
        )
        return True

    return await guard.run(
        mutate,
        operation_name=MIGRATE_OPERATION,
        retry_safe=False,
    )


async def _rollback_account(database, guard, account_id: str, actor_id: str) -> bool:
    async def mutate(session):
        current = await database.users.find_one({"id": account_id}, session=session)
        if current is None or current.get(MARKER_FIELD) != ROLE_POLICY_VERSION:
            return False
        status = _safe_status(current)
        was_owner = canonical_roles(current) == ("super_admin",)
        result_projection = {
            "roles": [],
            "status": status,
            "access_state": "access_review_required",
        }
        result = await database.users.update_one(
            {"id": account_id, MARKER_FIELD: ROLE_POLICY_VERSION},
            {
                "$set": {
                    "roles": [],
                    "status": status,
                    "access_state": "access_review_required",
                },
                "$unset": {
                    "role": "",
                    "role_policy_version": "",
                    EVIDENCE_FIELD: "",
                    MARKER_FIELD: "",
                },
            },
            session=session,
        )
        if result.matched_count == 0:
            return False
        if was_owner:
            await _reconcile_policy_state(database, session=session)
        await append_identity_audit_event(
            database,
            actor_user_id=actor_id,
            action="identity.policy_migration_rolled_back",
            target_type="user",
            target_id=account_id,
            previous=_projection(current),
            result=result_projection,
            reason_code=MIGRATION_REASON_CODE,
            policy_version=ROLE_POLICY_VERSION,
            session=session,
        )
        return True

    return await guard.run(
        mutate,
        operation_name=ROLLBACK_OPERATION,
        retry_safe=False,
    )


async def _approved_owner_count(database, *, session) -> int:
    count = 0
    async for account in database.users.find({}, session=session):
        if canonical_roles(account) == ("super_admin",):
            count += 1
    return count


async def _reconcile_policy_state(database, *, session) -> None:
    approved_owner_count = await _approved_owner_count(database, session=session)
    await database.identity_policy_state.update_one(
        {"_id": POLICY_STATE_ID},
        {
            "$set": {
                "key": POLICY_STATE_ID,
                "approved_owner_count": approved_owner_count,
                "policy_version": ROLE_POLICY_VERSION,
            },
            "$setOnInsert": {"version": 1},
        },
        upsert=True,
        session=session,
    )


async def _ensure_policy_state(database, guard) -> None:
    current_count = await _approved_owner_count(database, session=None)
    state = await database.identity_policy_state.find_one({"_id": POLICY_STATE_ID})
    if (
        state is not None
        and state.get("policy_version") == ROLE_POLICY_VERSION
        and state.get("approved_owner_count") == current_count
    ):
        return

    async def mutate(session):
        await _reconcile_policy_state(database, session=session)

    await guard.run(
        mutate,
        operation_name="identity.policy.reconcile_state",
        retry_safe=False,
    )


async def run(
    database,
    *,
    apply: bool = False,
    rollback: bool = False,
    bootstrap_owner_id: str | None = None,
    guard=None,
) -> dict:
    if apply and rollback:
        raise MigrationSafetyError("Apply and rollback are mutually exclusive")
    accounts = await _accounts(database)
    if not apply and not rollback:
        return _report(accounts, bootstrap_owner_id)
    if not isinstance(bootstrap_owner_id, str) or not bootstrap_owner_id.strip():
        raise MigrationSafetyError("A reviewed bootstrap Owner ID is required")
    bootstrap = next(
        (account for account in accounts if account.get("id") == bootstrap_owner_id),
        None,
    )
    if bootstrap is None or bootstrap.get("status") != "active":
        raise MigrationSafetyError("The bootstrap Owner must exist and be active")
    if rollback and canonical_roles(bootstrap) != ("super_admin",):
        raise MigrationSafetyError("Rollback requires the active approved Owner")

    operation = ROLLBACK_OPERATION if rollback else MIGRATE_OPERATION
    _reject_unready_guard(guard, operation)
    await ensure_indexes(database)

    report = _report(accounts, bootstrap_owner_id)
    if apply:
        if _classify(bootstrap, bootstrap_owner_id) == "already_current":
            await _ensure_policy_state(database, guard)
        pending = [
            account
            for account in accounts
            if _classify(account, bootstrap_owner_id) != "already_current"
        ]
        pending.sort(key=lambda account: account.get("id") == bootstrap_owner_id)
        for account in pending:
            await _migrate_account(database, guard, account, bootstrap_owner_id)
        return report

    owned = [
        account
        for account in accounts
        if account.get(MARKER_FIELD) == ROLE_POLICY_VERSION
    ]
    owned.sort(key=lambda account: account.get("id") == bootstrap_owner_id)
    rolled_back = 0
    for account in owned:
        if await _rollback_account(database, guard, account["id"], bootstrap_owner_id):
            rolled_back += 1
    report["categories"] = {"rolled_back": rolled_back}
    report["remediation_ids"] = {
        "access_review_required": sorted(account["id"] for account in owned)
    }
    return report


async def run_cli(
    *,
    apply: bool = False,
    rollback: bool = False,
    bootstrap_owner_id: str | None = None,
) -> dict:
    from dotenv import load_dotenv
    from motor.motor_asyncio import AsyncIOMotorClient

    if (apply or rollback) and not bootstrap_owner_id:
        raise MigrationSafetyError("A reviewed bootstrap Owner ID is required")
    backend_dir = Path(__file__).resolve().parents[1]
    load_dotenv(backend_dir / ".env")
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    database_name = os.environ["DB_NAME"]
    try:
        database = client[database_name]
        guard = None
        if apply or rollback:
            capabilities = await probe_database_capabilities(client, database_name)
            executor = TransactionExecutor(client, lambda: capabilities)
            guard = TransactionMutationGuard(executor, transaction_mutations_enabled)
        return await run(
            database,
            apply=apply,
            rollback=rollback,
            bootstrap_owner_id=bootstrap_owner_id,
            guard=guard,
        )
    finally:
        client.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Safely migrate the versioned identity access policy. Dry-run is the default."
    )
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true")
    mode.add_argument("--rollback", action="store_true")
    parser.add_argument("--bootstrap-owner-id", metavar="OPAQUE_USER_ID")
    return parser


def main() -> None:
    args = build_parser().parse_args()
    try:
        report = asyncio.run(
            run_cli(
                apply=args.apply,
                rollback=args.rollback,
                bootstrap_owner_id=args.bootstrap_owner_id,
            )
        )
    except (MigrationSafetyError, TransactionUnavailableError):
        report = {
            "policy_version": ROLE_POLICY_VERSION,
            "categories": {},
            "remediation_ids": {},
            "failures": {"total": 1},
        }
        print(json.dumps(report, sort_keys=True))
        raise SystemExit(2) from None
    print(json.dumps(report, sort_keys=True))


if __name__ == "__main__":
    main()
