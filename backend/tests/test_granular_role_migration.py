import asyncio
import importlib.util
import json
import os
import sys
from pathlib import Path

import pytest
from permissions import ROLE_POLICY_VERSION, canonical_roles

from backend.tests.test_identity_access_migration import (
    FakeCollection,
    FakeDatabase,
    RecordingGuard,
    user,
)

ROOT = Path(__file__).resolve().parents[2]
MIGRATION_PATH = ROOT / "backend" / "migrations" / "006_granular_role_policy.py"


def load_migration():
    spec = importlib.util.spec_from_file_location(
        "granular_role_policy_migration", MIGRATION_PATH
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def source_users():
    return [
        user(
            "bootstrap-owner",
            roles=["super_admin"],
            role_policy_version="2026-07-22-v1",
        ),
        user(
            "aggregate-operations",
            roles=["operations"],
            role_policy_version="2026-07-22-v1",
        ),
        user(
            "aggregate-commercial",
            roles=["commercial_finance"],
            role_policy_version="2026-07-22-v1",
        ),
        user(
            "legacy-granular-marker",
            role="warehouse",
            roles=["operations"],
            role_policy_version="2026-07-22-v1",
        ),
        user(
            "customer",
            roles=["retail_customer"],
            role_policy_version="2026-07-22-v1",
        ),
        user(
            "already-v2",
            roles=["content_editor"],
            role_policy_version=ROLE_POLICY_VERSION,
        ),
    ]


def reviewed_mapping():
    return {
        "aggregate-operations": {
            "roles": ["manager_approver", "warehouse"],
            "reason": "Reviewed warehouse lead assignment",
        },
        "aggregate-commercial": {
            "roles": ["finance"],
            "reason": "Reviewed finance assignment",
        },
    }


def fake_database(users):
    database = FakeDatabase(users)
    database.staff_invitations = FakeCollection()
    return database


def test_dry_run_is_read_only_and_reports_reviewed_and_blocked_accounts(tmp_path):
    migration = load_migration()
    database = fake_database(source_users())
    before = json.loads(json.dumps(database.users.items))

    report = asyncio.run(
        migration.run(
            database,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=tmp_path / "identity-backup.json",
        )
    )

    assert report["dry_run"] is True
    assert report["categories"] == {
        "bootstrap_super_admin_preserved": 1,
        "reviewed_mapping_applied": 2,
        "access_review_required": 1,
    }
    assert database.users.items == before
    assert database.audit_events.items == []
    assert not (tmp_path / "identity-backup.json").exists()


def test_apply_requires_backup_is_idempotent_and_rollback_restores_fields(tmp_path):
    migration = load_migration()
    original = source_users()
    database = fake_database(original)
    guard = RecordingGuard(database)
    backup_path = tmp_path / "identity-backup.json"

    with pytest.raises(ValueError, match="backup_path"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                reviewed_mapping=reviewed_mapping(),
                bootstrap_owner_id="bootstrap-owner",
                guard=guard,
            )
        )

    first = asyncio.run(
        migration.run(
            database,
            apply=True,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=backup_path,
            guard=guard,
        )
    )
    by_id = {record["id"]: record for record in database.users.items}

    assert first["updated"] == 4
    assert canonical_roles(by_id["bootstrap-owner"]) == ("super_admin",)
    assert by_id["bootstrap-owner"]["role_policy_version"] == ROLE_POLICY_VERSION
    assert canonical_roles(by_id["aggregate-operations"]) == (
        "warehouse",
        "manager_approver",
    )
    assert canonical_roles(by_id["aggregate-commercial"]) == ("finance",)
    assert by_id["legacy-granular-marker"]["roles"] == []
    assert by_id["legacy-granular-marker"]["access_state"] == "access_review_required"
    assert len(database.audit_events.items) == 4

    backup = json.loads(backup_path.read_text(encoding="utf-8"))
    assert backup["migration"] == "006_granular_role_policy"
    assert backup["bootstrap_owner_id"] == "bootstrap-owner"
    assert len(backup["accounts"]) == 4
    assert all("password_hash" not in record for record in backup["accounts"])

    second = asyncio.run(
        migration.run(
            database,
            apply=True,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=backup_path,
            guard=guard,
        )
    )
    assert second["updated"] == 0
    assert second["second_run_noop"] is True

    rolled_back = asyncio.run(
        migration.run(
            database,
            rollback=True,
            bootstrap_owner_id="bootstrap-owner",
            backup_path=backup_path,
            guard=guard,
        )
    )
    restored = {record["id"]: record for record in database.users.items}
    original_by_id = {record["id"]: record for record in original}
    assert rolled_back["restored"] == 3
    assert rolled_back["bootstrap_owner_preserved"] == 1
    for user_id in (
        "aggregate-operations",
        "aggregate-commercial",
        "legacy-granular-marker",
    ):
        for field in migration.MUTATED_FIELDS:
            assert restored[user_id].get(field) == original_by_id[user_id].get(field)
    assert canonical_roles(restored["aggregate-operations"]) == ()
    assert canonical_roles(restored["bootstrap-owner"]) == ("super_admin",)


def test_apply_requires_one_explicit_eligible_bootstrap_owner(tmp_path):
    migration = load_migration()
    database = fake_database(
        [
            *source_users(),
            user(
                "other-historical-owner",
                roles=["super_admin"],
                role_policy_version="2026-07-22-v1",
            ),
        ]
    )
    guard = RecordingGuard(database)

    for bootstrap_owner_id, message in (
        (None, "required"),
        ("unknown-owner", "known user"),
        ("customer", "customer"),
        ("aggregate-operations", "Super Admin candidate"),
    ):
        with pytest.raises(ValueError, match=message):
            asyncio.run(
                migration.run(
                    database,
                    apply=True,
                    reviewed_mapping=reviewed_mapping(),
                    bootstrap_owner_id=bootstrap_owner_id,
                    backup_path=tmp_path / f"{bootstrap_owner_id}.json",
                    guard=guard,
                )
            )

    report = asyncio.run(
        migration.run(
            database,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
        )
    )
    assert report["categories"] == {
        "bootstrap_super_admin_preserved": 1,
        "reviewed_mapping_applied": 2,
        "access_review_required": 2,
    }
    assert guard.calls == []

    applied = asyncio.run(
        migration.run(
            database,
            apply=True,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=tmp_path / "selected-owner.json",
            guard=guard,
        )
    )
    by_id = {record["id"]: record for record in database.users.items}
    assert applied["updated"] == 5
    assert canonical_roles(by_id["bootstrap-owner"]) == ("super_admin",)
    assert canonical_roles(by_id["other-historical-owner"]) == ()
    assert by_id["other-historical-owner"]["access_state"] == "access_review_required"


def test_rollback_rejects_concurrent_identity_change_atomically(tmp_path):
    migration = load_migration()
    database = fake_database(source_users())
    guard = RecordingGuard(database)
    backup_path = tmp_path / "identity-backup.json"
    asyncio.run(
        migration.run(
            database,
            apply=True,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=backup_path,
            guard=guard,
        )
    )
    changed = next(
        item for item in database.users.items if item["id"] == "aggregate-commercial"
    )
    changed["version"] += 1
    before = json.loads(json.dumps(database.users.items))

    with pytest.raises(RuntimeError, match="Concurrent identity change"):
        asyncio.run(
            migration.run(
                database,
                rollback=True,
                bootstrap_owner_id="bootstrap-owner",
                backup_path=backup_path,
                guard=guard,
            )
        )

    assert database.users.items == before


@pytest.mark.parametrize(
    ("field", "invalid_value"),
    [
        ("role_policy_version", "2026-07-22-v1"),
        ("roles", ["warehouse"]),
    ],
)
def test_rollback_rechecks_bootstrap_owner_inside_transaction(
    tmp_path,
    field,
    invalid_value,
):
    migration = load_migration()
    database = fake_database(source_users())
    backup_path = tmp_path / "identity-backup.json"
    asyncio.run(
        migration.run(
            database,
            apply=True,
            reviewed_mapping=reviewed_mapping(),
            bootstrap_owner_id="bootstrap-owner",
            backup_path=backup_path,
            guard=RecordingGuard(database),
        )
    )
    before = json.loads(json.dumps(database.users.items))

    class OwnerChangingGuard(RecordingGuard):
        async def run(self, callback, *, operation_name, retry_safe=False):
            async def change_owner_then_run(session):
                owner = next(
                    item
                    for item in self.database.users.items
                    if item["id"] == "bootstrap-owner"
                )
                owner[field] = invalid_value
                return await callback(session)

            return await super().run(
                change_owner_then_run,
                operation_name=operation_name,
                retry_safe=retry_safe,
            )

    with pytest.raises(RuntimeError, match="no longer eligible"):
        asyncio.run(
            migration.run(
                database,
                rollback=True,
                bootstrap_owner_id="bootstrap-owner",
                backup_path=backup_path,
                guard=OwnerChangingGuard(database),
            )
        )

    assert database.users.items == before


def test_invalid_or_unreviewed_mapping_fails_before_any_write(tmp_path):
    migration = load_migration()
    database = fake_database(source_users())
    guard = RecordingGuard(database)

    with pytest.raises(ValueError, match="unknown user ID"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                reviewed_mapping={
                    "unknown-id": {
                        "roles": ["warehouse"],
                        "reason": "Invalid mapping target",
                    }
                },
                bootstrap_owner_id="bootstrap-owner",
                backup_path=tmp_path / "backup.json",
                guard=guard,
            )
        )

    with pytest.raises(ValueError, match="valid internal roles"):
        asyncio.run(
            migration.run(
                database,
                apply=True,
                reviewed_mapping={
                    "aggregate-operations": {
                        "roles": ["retail_customer"],
                        "reason": "Invalid customer elevation",
                    }
                },
                bootstrap_owner_id="bootstrap-owner",
                backup_path=tmp_path / "backup.json",
                guard=guard,
            )
        )
    assert guard.calls == []
    assert database.audit_events.items == []


@pytest.mark.skipif(
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not os.environ.get("MONGO_TRANSACTION_TEST_URL"),
    reason="Explicit real transaction opt-in and URL are required",
)
def test_real_replica_set_applies_and_rolls_back_granular_roles_atomically(
    tmp_path, transaction_database_name
):
    loaded_motor = sys.modules.get("motor.motor_asyncio")
    if loaded_motor is not None and getattr(loaded_motor, "__file__", None) is None:
        sys.modules.pop("motor.motor_asyncio", None)
        sys.modules.pop("motor", None)
    from database_capabilities import DatabaseCapabilities
    from motor.motor_asyncio import AsyncIOMotorClient
    from transaction_execution import TransactionExecutor
    from transaction_guard import TransactionMutationGuard

    migration = load_migration()
    client = AsyncIOMotorClient(os.environ["MONGO_TRANSACTION_TEST_URL"])
    database = client[transaction_database_name]
    guard = TransactionMutationGuard(
        TransactionExecutor(
            client,
            lambda: DatabaseCapabilities(transactions=True),
        ),
        lambda: True,
    )

    async def scenario():
        try:
            await database.users.insert_many(
                [
                    user(
                        "real-owner",
                        roles=["super_admin"],
                        role_policy_version="2026-07-22-v1",
                    ),
                    user(
                        "real-operations",
                        roles=["operations"],
                        role_policy_version="2026-07-22-v1",
                    ),
                ]
            )
            backup_path = tmp_path / "real-granular-role-backup.json"
            applied = await migration.run(
                database,
                apply=True,
                reviewed_mapping={
                    "real-operations": {
                        "roles": ["warehouse"],
                        "reason": "Reviewed real transaction assignment",
                    }
                },
                bootstrap_owner_id="real-owner",
                backup_path=backup_path,
                guard=guard,
            )
            assert applied["updated"] == 2
            migrated = await database.users.find_one({"id": "real-operations"})
            assert canonical_roles(migrated) == ("warehouse",)
            assert await database.audit_events.count_documents({}) == 2

            second = await migration.run(
                database,
                apply=True,
                reviewed_mapping={},
                bootstrap_owner_id="real-owner",
                backup_path=backup_path,
                guard=guard,
            )
            assert second["second_run_noop"] is True

            rolled_back = await migration.run(
                database,
                rollback=True,
                bootstrap_owner_id="real-owner",
                backup_path=backup_path,
                guard=guard,
            )
            assert rolled_back["restored"] == 1
            assert rolled_back["bootstrap_owner_preserved"] == 1
            restored = await database.users.find_one({"id": "real-operations"})
            assert canonical_roles(restored) == ()
            assert await database.audit_events.count_documents({}) == 3
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
