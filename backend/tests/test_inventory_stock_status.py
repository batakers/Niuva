"""Stock status and identity on the balance read surface.

A stored balance is deliberately lean, so the read surface must attach the
subject's name, the derived figures, and a verdict. The verdict is computed
server-side so the admin table, the CSV export, and any later consumer state
the same thing for the same numbers: normal, rendah, or habis.
"""

import asyncio

from tests.test_inventory_service import build_service


async def seed_balance(db, *, subject_id, on_hand, reserved, subject_type="material"):
    await db.inventory_balances.insert_one(
        {
            "id": f"bal-{subject_id}",
            "subject_type": subject_type,
            "subject_id": subject_id,
            "on_hand": on_hand,
            "reserved": reserved,
            "incoming": "0",
            "planned_demand": "0",
            "version": 1,
            "updated_at": "2026-07-27T00:00:00Z",
        }
    )


async def single_balance(service):
    balances = await service.list_balances()
    assert len(balances) == 1
    return balances[0]


def test_a_balance_carries_its_subject_identity():
    async def scenario():
        service, db = build_service()
        # mat-1 exists in the register as PLA with reorder point 5.
        await seed_balance(db, subject_id="mat-1", on_hand="10", reserved="1")
        balance = await single_balance(service)

        assert balance["subject_name"] == "PLA"
        assert balance["sku"] == "MAT-1"
        assert balance["available"] == "9"
        assert balance["projected"] == "9"
        assert balance["reorder_point"] == "5"
        assert balance["stock_status"] == "normal"

    asyncio.run(scenario())


def test_available_at_or_under_the_reorder_point_reads_rendah():
    async def scenario():
        service, db = build_service()
        await seed_balance(db, subject_id="mat-1", on_hand="7", reserved="2")
        balance = await single_balance(service)

        # available 5 == reorder point 5: already time to reorder.
        assert balance["stock_status"] == "rendah"

    asyncio.run(scenario())


def test_nothing_available_reads_habis_even_with_stock_on_hand():
    async def scenario():
        service, db = build_service()
        # Everything on hand is reserved: the shelf is full, the stock is gone.
        await seed_balance(db, subject_id="mat-1", on_hand="4", reserved="4")
        balance = await single_balance(service)

        assert balance["stock_status"] == "habis"

    asyncio.run(scenario())


def test_a_variant_balance_uses_its_own_register():
    async def scenario():
        service, db = build_service()
        await seed_balance(
            db,
            subject_id="variant-1",
            subject_type="product_variant",
            on_hand="3",
            reserved="1",
        )
        balance = await single_balance(service)

        assert balance["subject_name"] == "Ready Sign"
        # available 2 == reorder point 2.
        assert balance["stock_status"] == "rendah"

    asyncio.run(scenario())


def test_an_unregistered_subject_still_gets_a_verdict():
    async def scenario():
        service, db = build_service()
        # The subject was archived or removed after the balance was written.
        await seed_balance(db, subject_id="mat-ghost", on_hand="0", reserved="0")
        balance = await single_balance(service)

        assert balance["subject_name"] == ""
        assert balance["stock_status"] == "habis"

    asyncio.run(scenario())
