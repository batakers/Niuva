"""The migration backup exercise, run end to end against a real replica set.

The exercise is not "a backup file was produced". It is: capture, run a
migration, observe the change, restore, and land back exactly where you
started. Only the last step proves the backup was worth taking.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
"""

import asyncio
import hashlib
import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path
from urllib.parse import parse_qs, urlparse

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if (
    os.environ.get("NIUVA_RUN_REAL_TRANSACTION_TESTS") != "1"
    or not MONGO_TRANSACTION_TEST_URL
):
    pytest.skip(
        "Explicit real transaction opt-in and MONGO_TRANSACTION_TEST_URL are required",
        allow_module_level=True,
    )

parsed_test_url = urlparse(MONGO_TRANSACTION_TEST_URL)
if (
    parsed_test_url.hostname not in {"127.0.0.1", "localhost"}
    or parsed_test_url.port != 27018
    or parse_qs(parsed_test_url.query).get("replicaSet") != ["rs-test"]
):
    raise RuntimeError(
        "backup/restore proof requires loopback port 27018 and replicaSet=rs-test"
    )

from bson.decimal128 import Decimal128  # noqa: E402
from migration_backup import (  # noqa: E402
    capture,
    checksum_manifest_path,
    compare,
    read_verified_snapshot,
    restore,
    restore_from_path,
    snapshot_file_digest,
    verify_snapshot,
    write_snapshot,
)
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402


async def seed(database):
    """Data shaped like the real thing: decimals, versions, and history."""
    await database.materials.insert_many(
        [
            {
                "id": "mat-ply",
                "sku": "PLY-18",
                "name": "Plywood 18mm",
                "reorder_point": "5",
                "status": "active",
            },
            {
                "id": "mat-ink",
                "sku": "INK-BLK",
                "name": "Ink Black",
                "reorder_point": "2",
                "status": "active",
            },
        ]
    )
    await database.inventory_balances.insert_one(
        {
            "id": "bal-1",
            "subject_type": "material",
            "subject_id": "mat-ply",
            # Decimal128 is the case a naive json snapshot silently corrupts.
            "on_hand": Decimal128(Decimal("10.5")),
            "reserved": Decimal128(Decimal("0")),
            "version": 3,
        }
    )
    await database.users.insert_many(
        [
            {"id": "u-1", "email": "a@niuva.test", "roles": ["warehouse"]},
            {"id": "u-2", "email": "b@niuva.test", "roles": ["order_admin"]},
        ]
    )
    await database.b2b_quote_versions.insert_one(
        {
            "id": "quote-version-accepted-1",
            "quote_id": "quote-1",
            "version": 2,
            "status": "accepted",
            "items": [
                {
                    "quote_line_id": "quote-line-1",
                    "quantity": "2",
                }
            ],
        }
    )
    await database.b2b_projects.insert_one(
        {
            "id": "project-1",
            "source_quote_id": "quote-1",
            "source_quote_version_id": "quote-version-accepted-1",
            "quote_snapshot": {
                "items": [
                    {
                        "quote_line_id": "quote-line-1",
                        "quantity": "2",
                    }
                ]
            },
        }
    )


async def run_exercise(source_database_name, restore_database_name, snapshot_path):
    assert source_database_name != restore_database_name
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    source_database = client[source_database_name]
    restore_database = client[restore_database_name]
    evidence = None
    cleanup = None
    try:
        topology = await client.admin.command("hello")
        assert topology["setName"] == "rs-test"
        assert topology["isWritablePrimary"] is True
        await seed(source_database)

        # 1. Capture, and check the file is what it claims to be.
        snapshot = await capture(source_database)
        written = write_snapshot(snapshot, snapshot_path)
        assert written["collections"] == 5
        assert written["documents"] == 7
        assert written["checksum"]["algorithm"] == "sha256"
        assert len(written["checksum"]["value"]) == 64
        assert snapshot_file_digest(snapshot_path) == written["checksum"]["value"]
        assert Path(written["checksum_manifest"]).exists()

        reloaded = read_verified_snapshot(snapshot_path, written["checksum"]["value"])
        assert verify_snapshot(reloaded)["intact"] is True

        original_snapshot_bytes = snapshot_path.read_bytes()
        snapshot_path.write_bytes(original_snapshot_bytes + b"\n")
        with pytest.raises(ValueError, match="checksum mismatch"):
            read_verified_snapshot(snapshot_path, written["checksum"]["value"])
        snapshot_path.write_bytes(original_snapshot_bytes)

        # A snapshot taken of an unchanged database compares identical.
        assert (await compare(source_database, reloaded))["identical"] is True

        # 2. A migration-shaped change: rewrite roles, drop a material, and
        # move stock. None of it is anticipated by the snapshot.
        await source_database.users.update_one(
            {"id": "u-1"}, {"$set": {"roles": ["warehouse", "production"]}}
        )
        await source_database.materials.delete_one({"id": "mat-ink"})
        await source_database.inventory_balances.update_one(
            {"id": "bal-1"},
            {"$set": {"on_hand": Decimal128(Decimal("4.25")), "version": 4}},
        )
        await source_database.b2b_quote_versions.delete_one(
            {"id": "quote-version-accepted-1"}
        )
        await source_database.work_order_shortages.insert_one(
            {"id": "shortage-1", "status": "open"}
        )

        difference = await compare(source_database, reloaded)
        assert difference["identical"] is False
        changed = {item["collection"] for item in difference["differences"]}
        # Every touched collection is reported, including the new one.
        assert changed == {
            "users",
            "materials",
            "inventory_balances",
            "b2b_quote_versions",
            "work_order_shortages",
        }

        # 3. Restore into a distinct empty database. The source remains changed,
        # proving that the comparison below is against a second target.
        assert await restore_database.list_collection_names() == []
        assert snapshot_file_digest(snapshot_path) == written["checksum"]["value"]
        snapshot_path.write_bytes(original_snapshot_bytes + b"\n")
        with pytest.raises(ValueError, match="checksum mismatch"):
            await restore_from_path(
                restore_database,
                snapshot_path,
                expected_sha256=written["checksum"]["value"],
            )
        assert await restore_database.list_collection_names() == []
        snapshot_path.write_bytes(original_snapshot_bytes)
        result = await restore_from_path(
            restore_database,
            snapshot_path,
            expected_sha256=written["checksum"]["value"],
        )
        assert result["dropped"] == []

        assert (await compare(restore_database, reloaded))["identical"] is True
        assert (await compare(source_database, reloaded))["identical"] is False

        # The decimal survived the round trip as a decimal, not a float.
        balance = await restore_database.inventory_balances.find_one({"id": "bal-1"})
        assert isinstance(balance["on_hand"], Decimal128)
        assert balance["on_hand"].to_decimal() == Decimal("10.5")
        assert balance["version"] == 3

        restored_material = await restore_database.materials.find_one({"id": "mat-ink"})
        assert restored_material is not None
        accepted_version = await restore_database.b2b_quote_versions.find_one(
            {"id": "quote-version-accepted-1"}
        )
        restored_project = await restore_database.b2b_projects.find_one(
            {"id": "project-1"}
        )
        assert accepted_version["status"] == "accepted"
        assert accepted_version["items"][0]["quote_line_id"] == "quote-line-1"
        assert restored_project["source_quote_version_id"] == accepted_version["id"]
        assert (
            restored_project["quote_snapshot"]["items"][0]["quote_line_id"]
            == accepted_version["items"][0]["quote_line_id"]
        )
        assert await restore_database.work_order_shortages.count_documents({}) == 0
        evidence = {
            "topology": {
                "replica_set": topology["setName"],
                "writable_primary": topology["isWritablePrimary"],
            },
            "source_database_sha256": hashlib.sha256(
                source_database_name.encode("utf-8")
            ).hexdigest(),
            "restore_database_sha256": hashlib.sha256(
                restore_database_name.encode("utf-8")
            ).hexdigest(),
            "databases_distinct": source_database_name != restore_database_name,
            "snapshot_created_at": reloaded["created_at"],
            "snapshot_checksum": written["checksum"],
            "collections": written["collections"],
            "documents": written["documents"],
            "source_change_detected": not difference["identical"],
            "restore_comparison_identical": True,
            "historical_reference_preserved": (
                restored_project["source_quote_version_id"] == accepted_version["id"]
            ),
            "decimal128_preserved": isinstance(balance["on_hand"], Decimal128),
        }
    finally:
        remaining = None
        try:
            try:
                await client.drop_database(source_database_name)
            finally:
                await client.drop_database(restore_database_name)
            remaining = await client.list_database_names()
        finally:
            snapshot_path.unlink(missing_ok=True)
            checksum_manifest_path(snapshot_path).unlink(missing_ok=True)
            cleanup = {
                "source_database_absent": (
                    remaining is not None and source_database_name not in remaining
                ),
                "restore_database_absent": (
                    remaining is not None and restore_database_name not in remaining
                ),
                "snapshot_deleted": not snapshot_path.exists(),
                "checksum_manifest_deleted": not checksum_manifest_path(
                    snapshot_path
                ).exists(),
            }
            client.close()
    assert all(cleanup.values())
    if os.environ.get("NIUVA_CAPTURE_RESTORE_EVIDENCE") == "1":
        print(
            "ISOLATED_RESTORE_EVIDENCE="
            + json.dumps(
                {
                    **evidence,
                    "completed_at": datetime.now(timezone.utc).isoformat(),
                    "cleanup": cleanup,
                },
                sort_keys=True,
            )
        )


def test_backup_restore_returns_the_database_to_its_captured_state(
    transaction_database_name, tmp_path
):
    unique_suffix = transaction_database_name.rsplit("_", 1)[-1]
    restore_database_name = f"niuva_restore_{unique_suffix}"
    assert len(restore_database_name) <= 63
    asyncio.run(
        run_exercise(
            transaction_database_name,
            restore_database_name,
            tmp_path / "snapshot.json",
        )
    )


def test_a_restore_refuses_a_populated_target_unless_told(
    transaction_database_name, tmp_path
):
    async def scenario():
        client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
        database = client[transaction_database_name]
        snapshot_path = tmp_path / "snapshot.json"
        try:
            await seed(database)
            snapshot = await capture(database)
            write_snapshot(snapshot, snapshot_path)

            with pytest.raises(ValueError, match="not empty"):
                await restore(database, snapshot)
        finally:
            await client.drop_database(transaction_database_name)
            snapshot_path.unlink(missing_ok=True)
            checksum_manifest_path(snapshot_path).unlink(missing_ok=True)
            client.close()

    asyncio.run(scenario())


def test_a_tampered_snapshot_fails_verification(transaction_database_name, tmp_path):
    """A snapshot nobody checked is a backup nobody has."""

    async def scenario():
        client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
        database = client[transaction_database_name]
        try:
            await seed(database)
            snapshot = await capture(database)
            snapshot["collections"]["users"].append(
                {"id": "u-smuggled", "email": "x@niuva.test"}
            )

            check = verify_snapshot(snapshot)
            assert check["intact"] is False
            assert check["mismatched"] == ["users"]
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())


def test_a_snapshot_refuses_to_overwrite_an_existing_file(
    transaction_database_name, tmp_path
):
    async def scenario():
        client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
        database = client[transaction_database_name]
        path = Path(tmp_path / "snapshot.json")
        try:
            await seed(database)
            snapshot = await capture(database)
            write_snapshot(snapshot, path)

            # Overwriting silently would destroy the only copy of the state
            # someone is about to migrate away from.
            with pytest.raises(ValueError, match="refusing to overwrite"):
                write_snapshot(snapshot, path)
        finally:
            await client.drop_database(transaction_database_name)
            path.unlink(missing_ok=True)
            checksum_manifest_path(path).unlink(missing_ok=True)
            client.close()

    asyncio.run(scenario())
