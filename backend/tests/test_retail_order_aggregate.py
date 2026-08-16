"""The separate retail order aggregate.

Retail orders are their own aggregate, not a variation on the B2B chain and
not the legacy uploads collection. What matters here is that a line commits to
a price the catalog set, that the order number is drawn rather than counted,
and that the canonical lifecycle is walked one stage at a time.
"""

import asyncio

import pytest
from retail_domain import (
    RETAIL_STATUSES,
    RetailDomainError,
    retail_next_actions,
    validate_retail_transition,
)
from retail_service import RetailOrderService

from tests.test_b2b_quote_conversion import EnabledGuard, FakeCollection, FakeDatabase

ACTOR = {"id": "order-admin", "email": "orders@niuva.test"}

VARIANT = {
    "id": "var-1",
    "product_id": "prod-1",
    "sku": "SIGN-BLUE",
    "name": "Blue",
    "option_values": {"finish": "matte"},
    "production_type": "ready_stock",
    "fixed_price": 150000,
    "currency": "IDR",
}
PRODUCT = {"id": "prod-1", "name": "Desk Sign", "slug": "desk-sign"}

CUSTOMER = {"name": "Ayu", "email": "ayu@example.com", "phone": "081234567890"}


class RetailDatabase(FakeDatabase):
    def __init__(self):
        super().__init__()
        self.retail_orders = FakeCollection()
        self.retail_order_counters = CounterCollection()


class CounterCollection(FakeCollection):
    async def find_one_and_update(
        self, query, update, upsert=False, return_document=None, **_options
    ):
        for item in self.items:
            if item["id"] == query["id"]:
                item["sequence"] += update["$inc"]["sequence"]
                return dict(item)
        document = {"id": query["id"], "sequence": update["$inc"]["sequence"]}
        self.items.append(document)
        return dict(document)


async def build_service():
    db = RetailDatabase()
    await db.products.insert_one(dict(PRODUCT))
    await db.product_variants.insert_one(dict(VARIANT))
    return RetailOrderService(db=db, transaction_guard=EnabledGuard()), db


async def create_order(service, *, operation_id="op-create", quantity=2):
    return await service.create_order(
        operation_id=operation_id,
        customer=dict(CUSTOMER),
        items=[{"variant_id": "var-1", "quantity": quantity}],
        fulfilment_method="ship",
        notes="Kirim ke alamat kantor",
        actor=ACTOR,
    )


def test_the_canonical_lifecycle_is_walked_one_stage_at_a_time():
    validate_retail_transition("created", "awaiting_payment", reason="Tagihan dikirim")
    validate_retail_transition("quality_control", "ready_to_ship", reason="Lolos QC")
    validate_retail_transition("quality_control", "ready_to_pickup", reason="Lolos QC")

    with pytest.raises(RetailDomainError) as skipped:
        validate_retail_transition("created", "paid", reason="Lompat tagihan")
    assert skipped.value.code == "retail_transition_invalid"

    with pytest.raises(RetailDomainError) as terminal:
        validate_retail_transition("completed", "shipped", reason="Ulangi")
    assert terminal.value.code == "retail_terminal"

    with pytest.raises(RetailDomainError) as missing:
        validate_retail_transition("created", "awaiting_payment", reason="  ")
    assert missing.value.code == "reason_required"


def test_shipping_and_pickup_are_parallel_tails_that_rejoin():
    assert retail_next_actions("quality_control") == [
        "mark_ready_to_ship",
        "mark_ready_to_pickup",
    ]
    validate_retail_transition("shipped", "completed", reason="Diterima pelanggan")
    validate_retail_transition("picked_up", "completed", reason="Diambil pelanggan")

    # A shipped order cannot be picked up, and vice versa.
    with pytest.raises(RetailDomainError):
        validate_retail_transition("ready_to_ship", "picked_up", reason="Salah jalur")


def test_every_declared_status_is_reachable_from_created():
    reachable = {"created"}
    frontier = ["created"]
    from retail_domain import RETAIL_TRANSITIONS

    while frontier:
        for target in RETAIL_TRANSITIONS[frontier.pop()]:
            if target not in reachable:
                reachable.add(target)
                frontier.append(target)

    assert reachable == set(RETAIL_STATUSES)


def test_an_order_line_takes_its_price_from_the_catalog():
    async def scenario():
        service, _db = await build_service()
        order = await create_order(service)

        line = order["items"][0]
        assert line["unit_price_minor"] == 150000
        assert line["line_total_minor"] == 300000
        assert order["total_minor"] == 300000
        assert line["configuration_snapshot"]["sku"] == "SIGN-BLUE"
        assert line["product_snapshot"]["name"] == "Desk Sign"
        assert line["price_snapshot"]["unit_price_minor"] == 150000

    asyncio.run(scenario())


def test_a_repriced_variant_does_not_reach_back_into_a_placed_order():
    async def scenario():
        service, db = await build_service()
        order = await create_order(service)

        await db.product_variants.update_one(
            {"id": "var-1"}, {"$set": {"fixed_price": 999000, "sku": "SIGN-RED"}}
        )

        stored = await service.get_order(order["id"])
        assert stored["items"][0]["unit_price_minor"] == 150000
        assert stored["items"][0]["configuration_snapshot"]["sku"] == "SIGN-BLUE"
        assert stored["total_minor"] == 300000

    asyncio.run(scenario())


def test_order_numbers_are_drawn_from_a_counter_not_a_document_count():
    async def scenario():
        service, _db = await build_service()
        first = await create_order(service, operation_id="op-1")
        second = await create_order(service, operation_id="op-2")

        assert first["order_number"] != second["order_number"]
        assert first["order_number"].endswith("0001")
        assert second["order_number"].endswith("0002")

    asyncio.run(scenario())


def test_a_replayed_creation_returns_the_same_order():
    async def scenario():
        service, db = await build_service()
        first = await create_order(service, operation_id="op-same")
        second = await create_order(service, operation_id="op-same")

        assert second["id"] == first["id"]
        assert len(db.retail_orders.items) == 1

    asyncio.run(scenario())


def test_an_unpriced_variant_cannot_be_ordered_retail():
    async def scenario():
        service, db = await build_service()
        await db.product_variants.update_one(
            {"id": "var-1"}, {"$set": {"fixed_price": None}}
        )

        with pytest.raises(RetailDomainError) as rejected:
            await create_order(service)
        assert rejected.value.code == "retail_item_not_priced"
        assert db.retail_orders.items == []

    asyncio.run(scenario())


def test_a_line_cannot_order_a_variant_that_does_not_exist():
    async def scenario():
        service, db = await build_service()

        with pytest.raises(RetailDomainError) as rejected:
            await service.create_order(
                operation_id="op-ghost",
                customer=dict(CUSTOMER),
                items=[{"variant_id": "var-ghost", "quantity": 1}],
                fulfilment_method="pickup",
                notes="",
                actor=ACTOR,
            )
        assert rejected.value.code == "retail_item_variant_not_found"
        assert db.retail_orders.items == []

    asyncio.run(scenario())


def test_a_transition_carries_version_and_replays_idempotently():
    async def scenario():
        service, _db = await build_service()
        order = await create_order(service)

        billed = await service.transition_order(
            order["id"],
            target_status="awaiting_payment",
            expected_version=order["version"],
            operation_id="op-bill",
            reason="Tagihan dikirim",
            actor=ACTOR,
        )
        assert billed["status"] == "awaiting_payment"
        assert billed["version"] == 2

        replay = await service.transition_order(
            order["id"],
            target_status="awaiting_payment",
            expected_version=order["version"],
            operation_id="op-bill",
            reason="Tagihan dikirim",
            actor=ACTOR,
        )
        assert replay["version"] == 2

        with pytest.raises(RetailDomainError) as stale:
            await service.transition_order(
                order["id"],
                target_status="paid",
                expected_version=1,
                operation_id="op-paid",
                reason="Pembayaran diterima",
                actor=ACTOR,
            )
        assert stale.value.code == "version_conflict"

    asyncio.run(scenario())


@pytest.mark.parametrize(
    ("action", "code"),
    [
        ("cancel", "retail_cancellation_suspended"),
        ("refund", "retail_refund_suspended"),
        ("return", "retail_return_suspended"),
    ],
)
def test_suspended_actions_answer_with_their_reason(action, code):
    async def scenario():
        service, _db = await build_service()

        with pytest.raises(RetailDomainError) as refused:
            await service.refuse_suspended_action(action)
        # Named, not missing: the caller learns it is withheld, not absent.
        assert refused.value.status_code == 409
        assert refused.value.code == code

    asyncio.run(scenario())


def test_a_projected_order_declares_what_is_withheld():
    async def scenario():
        service, _db = await build_service()
        order = await create_order(service)

        assert order["record_class"] == "retail_order"
        assert order["permitted_next_actions"] == ["request_payment"]
        assert order["suspended_actions"] == ["cancel", "refund", "return"]

    asyncio.run(scenario())
