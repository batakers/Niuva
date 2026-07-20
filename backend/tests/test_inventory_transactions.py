import asyncio
import os
import uuid

import pytest

MONGO_TRANSACTION_TEST_URL = os.environ.get("MONGO_TRANSACTION_TEST_URL")
if not MONGO_TRANSACTION_TEST_URL:
    pytest.skip(
        "MONGO_TRANSACTION_TEST_URL is required for real transaction tests",
        allow_module_level=True,
    )

from motor.motor_asyncio import AsyncIOMotorClient  # noqa: E402

from database_capabilities import DatabaseCapabilities  # noqa: E402
from inventory_service import InventoryError, InventoryService  # noqa: E402


ACTOR = {"id": "warehouse-real", "email": "warehouse@test", "roles": ["warehouse"]}


def operation(operation_id, quantity, movement_type="receive"):
    return {
        "operation_id": operation_id,
        "subject_type": "material",
        "subject_id": "material-real",
        "movement_type": movement_type,
        "quantity": str(quantity),
        "reference_type": "transaction_test",
        "reference_id": operation_id,
        "reason": "Real replica-set transaction verification",
    }


async def run_transaction_evidence():
    client = AsyncIOMotorClient(MONGO_TRANSACTION_TEST_URL)
    database_name = f"niuva_inventory_test_{uuid.uuid4().hex}"
    db = client[database_name]
    try:
        await db.inventory_balances.create_index(
            [("subject_type", 1), ("subject_id", 1)], unique=True
        )
        await db.stock_movements.create_index("operation_id", unique=True)
        await db.restock_alerts.create_index(
            "deduplication_key",
            unique=True,
            partialFilterExpression={"status": "active"},
        )
        await db.materials.insert_one(
            {
                "id": "material-real",
                "sku": "MATERIAL-REAL",
                "name": "Transaction Test Material",
                "base_unit": "kg",
                "setup_status": "ready",
                "status": "active",
                "active": True,
                "inventory_tracking_enabled": True,
                "reorder_point": "0",
            }
        )
        service = InventoryService(
            db=db,
            client=client,
            capabilities=DatabaseCapabilities(transactions=True),
        )

        first_payload = operation("71111111-1111-1111-1111-111111111111", 10)
        committed = await service.apply_operation(actor=ACTOR, payload=first_payload)
        assert committed["balance"]["on_hand"] == "10"

        replayed = await service.apply_operation(actor=ACTOR, payload=dict(first_payload))
        assert replayed["replayed"] is True
        assert replayed["movement"]["id"] == committed["movement"]["id"]
        assert await db.stock_movements.count_documents({}) == 1

        with pytest.raises(InventoryError, match="berbeda") as mismatch:
            await service.apply_operation(
                actor=ACTOR,
                payload={**first_payload, "quantity": "11"},
            )
        assert mismatch.value.code == "operation_id_conflict"

        with pytest.raises(InventoryError) as rolled_back:
            await service.apply_operation(
                actor=ACTOR,
                payload=operation(
                    "72222222-2222-2222-2222-222222222222",
                    11,
                    "consume",
                ),
            )
        assert rolled_back.value.code == "inventory_conflict"
        assert await db.stock_movements.count_documents({}) == 1
        balance_after_rollback = await service.get_balance("material", "material-real")
        assert balance_after_rollback["on_hand"] == "10"

        await asyncio.gather(
            service.apply_operation(
                actor=ACTOR,
                payload=operation("73333333-3333-3333-3333-333333333333", 2),
            ),
            service.apply_operation(
                actor=ACTOR,
                payload=operation("74444444-4444-4444-4444-444444444444", 4),
            ),
        )
        final_balance = await service.get_balance("material", "material-real")
        assert final_balance["on_hand"] == "16"
        assert final_balance["version"] == 3
        assert await db.stock_movements.count_documents({}) == 3
    finally:
        await client.drop_database(database_name)
        client.close()


def test_real_replica_set_commit_rollback_replay_and_concurrency():
    asyncio.run(run_transaction_evidence())
