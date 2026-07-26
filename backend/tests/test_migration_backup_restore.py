"""The migration backup exercise, run end to end against a real replica set.

The exercise is not "a backup file was produced". It is: capture, run a
migration, observe the change, restore, and land back exactly where you
started. Only the last step proves the backup was worth taking.

Opt in with NIUVA_RUN_REAL_TRANSACTION_TESTS=1 and MONGO_TRANSACTION_TEST_URL.
"""

import asyncio
import os
from decimal import Decimal
from pathlib import Path

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

from bson.decimal128 import Decimal128  # noqa: E402
from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from migration_backup import (  # noqa: E402
    capture,
    compare,
    read_snapshot,
    restore,
    verify_snapshot,
    write_snapshot,
)


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


async def run_exercise(database_name, snapshot_path):
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database = client[database_name]
    try:
        await seed(database)

        # 1. Capture, and check the file is what it claims to be.
        snapshot = await capture(database)
        written = write_snapshot(snapshot, snapshot_path)
        assert written["collections"] == 3
        assert written["documents"] == 5

        reloaded = read_snapshot(snapshot_path)
        assert verify_snapshot(reloaded)["intact"] is True

        # A snapshot taken of an unchanged database compares identical.
        assert (await compare(database, reloaded))["identical"] is True

        # 2. A migration-shaped change: rewrite roles, drop a material, and
        # move stock. None of it is anticipated by the snapshot.
        await database.users.update_one(
            {"id": "u-1"}, {"$set": {"roles": ["warehouse", "production"]}}
        )
        await database.materials.delete_one({"id": "mat-ink"})
        await database.inventory_balances.update_one(
            {"id": "bal-1"},
            {"$set": {"on_hand": Decimal128(Decimal("4.25")), "version": 4}},
        )
        await database.work_order_shortages.insert_one(
            {"id": "shortage-1", "status": "open"}
        )

        difference = await compare(database, reloaded)
        assert difference["identical"] is False
        changed = {item["collection"] for item in difference["differences"]}
        # Every touched collection is reported, including the new one.
        assert changed == {
            "users",
            "materials",
            "inventory_balances",
            "work_order_shortages",
        }

        # 3. Restore, and land exactly where we started.
        result = await restore(database, reloaded, allow_non_empty=True)
        assert result["dropped"] == ["work_order_shortages"]

        assert (await compare(database, reloaded))["identical"] is True

        # The decimal survived the round trip as a decimal, not a float.
        balance = await database.inventory_balances.find_one({"id": "bal-1"})
        assert isinstance(balance["on_hand"], Decimal128)
        assert balance["on_hand"].to_decimal() == Decimal("10.5")
        assert balance["version"] == 3

        restored_material = await database.materials.find_one({"id": "mat-ink"})
        assert restored_material is not None
        assert await database.work_order_shortages.count_documents({}) == 0
    finally:
        await client.drop_database(database_name)
        client.close()


def test_backup_restore_returns_the_database_to_its_captured_state(
    transaction_database_name, tmp_path
):
    asyncio.run(
        run_exercise(transaction_database_name, tmp_path / "snapshot.json")
    )


def test_a_restore_refuses_a_populated_target_unless_told(
    transaction_database_name, tmp_path
):
    async def scenario():
        client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
        database = client[transaction_database_name]
        try:
            await seed(database)
            snapshot = await capture(database)
            write_snapshot(snapshot, tmp_path / "snapshot.json")

            with pytest.raises(ValueError, match="not empty"):
                await restore(database, snapshot)
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())


def test_a_tampered_snapshot_fails_verification(
    transaction_database_name, tmp_path
):
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
        try:
            await seed(database)
            snapshot = await capture(database)
            path = Path(tmp_path / "snapshot.json")
            write_snapshot(snapshot, path)

            # Overwriting silently would destroy the only copy of the state
            # someone is about to migrate away from.
            with pytest.raises(ValueError, match="refusing to overwrite"):
                write_snapshot(snapshot, path)
        finally:
            await client.drop_database(transaction_database_name)
            client.close()

    asyncio.run(scenario())
