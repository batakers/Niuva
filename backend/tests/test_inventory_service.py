import asyncio
from copy import deepcopy
from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

import pytest
from database_capabilities import DatabaseCapabilities
from inventory_service import InventoryError, InventoryService
from permissions import ROLE_POLICY_VERSION
from restock import shortage_triggers
from transaction_execution import TransactionExecutor
from transaction_guard import TransactionMutationGuard


class FakeCursor:
    def __init__(self, items):
        self.items = [deepcopy(item) for item in items]

    def sort(self, key, direction):
        self.items.sort(key=lambda item: item.get(key, ""), reverse=direction < 0)
        return self

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, limit):
        return deepcopy(self.items[:limit])


class FakeCollection:
    def __init__(self, items=None):
        self.items = deepcopy(items or [])
        self.fail_next_cas_updates = 0

    @classmethod
    def matches(cls, item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(cls.matches(item, branch) for branch in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$ne" in expected and actual == expected["$ne"]:
                    return False
                if "$in" in expected and actual not in expected["$in"]:
                    return False
                if "$lte" in expected and not (actual <= expected["$lte"]):
                    return False
                continue
            if isinstance(actual, list):
                if expected not in actual:
                    return False
            elif actual != expected:
                return False
        return True

    @staticmethod
    def project(item, projection):
        value = deepcopy(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    value.pop(key, None)
        return value

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self.matches(item, query):
                return self.project(item, projection)
        return None

    def find(self, query, projection=None, **_options):
        return FakeCursor(
            self.project(item, projection)
            for item in self.items
            if self.matches(item, query)
        )

    async def insert_one(self, item, **_options):
        self.items.append(deepcopy(item))
        return SimpleNamespace(inserted_id=item.get("id"))

    async def update_one(self, query, update, **_options):
        if self.fail_next_cas_updates and "version" in query:
            self.fail_next_cas_updates -= 1
            return SimpleNamespace(matched_count=0, modified_count=0)
        for item in self.items:
            if self.matches(item, query):
                item.update(deepcopy(update.get("$set", {})))
                return SimpleNamespace(matched_count=1, modified_count=1)
        return SimpleNamespace(matched_count=0, modified_count=0)


class FakeDatabase:
    def __init__(self):
        self.materials = FakeCollection(
            [
                {
                    "id": "mat-1",
                    "sku": "MAT-1",
                    "name": "PLA",
                    "base_unit": "kg",
                    "setup_status": "ready",
                    "status": "active",
                    "active": True,
                    "inventory_tracking_enabled": True,
                    "reorder_point": "5",
                }
            ]
        )
        self.product_variants = FakeCollection(
            [
                {
                    "id": "variant-1",
                    "sku": "VAR-1",
                    "name": "Ready Sign",
                    "status": "active",
                    "production_type": "ready_stock",
                    "inventory_tracking_enabled": True,
                    "reorder_point": "2",
                }
            ]
        )
        self.inventory_balances = FakeCollection()
        self.stock_movements = FakeCollection()
        self.inventory_reservations = FakeCollection()
        self.inventory_adjustment_requests = FakeCollection()
        self.restock_alerts = FakeCollection()
        self.notifications = FakeCollection()
        self.notification_outbox = FakeCollection()
        self.audit_events = FakeCollection()
        self.users = FakeCollection(
            [
                {
                    "id": "warehouse-1",
                    "email": "warehouse@test",
                    "roles": ["warehouse"],
                    "status": "active",
                    "access_state": "approved",
                    "role_policy_version": ROLE_POLICY_VERSION,
                },
                {
                    "id": "manager-1",
                    "email": "manager@test",
                    "roles": ["manager_approver"],
                    "status": "active",
                    "access_state": "approved",
                    "role_policy_version": ROLE_POLICY_VERSION,
                },
                {
                    "id": "admin-1",
                    "email": "admin@test",
                    "roles": ["super_admin"],
                    "status": "active",
                    "access_state": "approved",
                    "role_policy_version": ROLE_POLICY_VERSION,
                },
                {
                    "id": "customer-1",
                    "email": "customer@test",
                    "roles": ["retail_customer"],
                    "status": "active",
                    "access_state": "approved",
                    "role_policy_version": ROLE_POLICY_VERSION,
                },
                {
                    "id": "disabled-1",
                    "email": "disabled@test",
                    "roles": ["warehouse"],
                    "status": "disabled",
                    "access_state": "approved",
                    "role_policy_version": ROLE_POLICY_VERSION,
                },
            ]
        )

    def collections(self):
        return [
            value for value in vars(self).values() if isinstance(value, FakeCollection)
        ]


class FakeTransaction:
    def __init__(self, db):
        self.db = db
        self.snapshots = None

    async def __aenter__(self):
        self.snapshots = {
            id(collection): deepcopy(collection.items)
            for collection in self.db.collections()
        }
        return self

    async def __aexit__(self, exc_type, _exc, _tb):
        if exc_type is not None:
            for collection in self.db.collections():
                collection.items = self.snapshots[id(collection)]
        return False


class FakeSession:
    """Mirrors the driver surface TransactionExecutor drives.

    Snapshot and restore live here rather than in FakeTransaction because the
    executor calls start_transaction/commit_transaction/abort_transaction
    directly instead of using the transaction as a context manager.
    """

    def __init__(self, db):
        self.db = db
        self.snapshots = None
        self.in_transaction = False

    async def __aenter__(self):
        return self

    async def __aexit__(self, _exc_type, _exc, _tb):
        return False

    def start_transaction(self):
        self.snapshots = {
            id(collection): deepcopy(collection.items)
            for collection in self.db.collections()
        }
        self.in_transaction = True
        return FakeTransaction(self.db)

    async def commit_transaction(self):
        self.in_transaction = False
        self.snapshots = None

    async def abort_transaction(self):
        if self.snapshots is not None:
            for collection in self.db.collections():
                collection.items = self.snapshots[id(collection)]
        self.in_transaction = False
        self.snapshots = None

    async def end_session(self):
        return None


class FakeClient:
    def __init__(self, db):
        self.db = db

    async def start_session(self):
        return FakeSession(self.db)


WAREHOUSE = {"id": "warehouse-1", "email": "warehouse@test", "roles": ["warehouse"]}
MANAGER = {"id": "manager-1", "email": "manager@test", "roles": ["manager_approver"]}


def operation(operation_id, movement_type="receive", quantity="10", **extra):
    return {
        "operation_id": operation_id,
        "subject_type": "material",
        "subject_id": "mat-1",
        "movement_type": movement_type,
        "quantity": quantity,
        "reference_type": "manual_receipt",
        "reference_id": "receipt-1",
        "reason": "Warehouse inventory operation",
        **extra,
    }


class RecordingSink:
    def __init__(self):
        self.events = []

    def __call__(self, event, fields):
        self.events.append((event, fields["operation_name"]))


def build_service(*, transactions=True):
    db = FakeDatabase()
    client = FakeClient(db)
    capabilities = DatabaseCapabilities(transactions=transactions)
    service = InventoryService(
        db=db,
        client=client,
        capabilities=capabilities,
        guard=TransactionMutationGuard(
            TransactionExecutor(
                client, lambda: capabilities, event_sink=RecordingSink()
            )
        ),
    )
    return service, db


def test_shortage_trigger_rules():
    assert shortage_triggers({"available": "5", "projected": "5"}, "5") == {
        "reorder_point"
    }
    assert shortage_triggers({"available": "10", "projected": "-1"}, "5") == {
        "projected_shortage"
    }
    assert shortage_triggers({"available": "4", "projected": "-1"}, "5") == {
        "reorder_point",
        "projected_shortage",
    }


async def run_operation_idempotency_and_rollback():
    service, db = build_service()
    payload = operation("11111111-1111-1111-1111-111111111111")
    result = await service.apply_operation(actor=WAREHOUSE, payload=payload)
    assert result["balance"]["on_hand"] == "10"
    assert len(db.stock_movements.items) == 1
    assert len(db.audit_events.items) == 1

    replayed = await service.apply_operation(actor=WAREHOUSE, payload=dict(payload))
    assert replayed["movement"]["id"] == result["movement"]["id"]
    assert len(db.stock_movements.items) == 1

    with pytest.raises(InventoryError) as mismatch:
        await service.apply_operation(
            actor=WAREHOUSE, payload={**payload, "quantity": "11"}
        )
    assert mismatch.value.status_code == 409
    assert mismatch.value.code == "operation_id_conflict"

    before = deepcopy(db.inventory_balances.items)
    with pytest.raises(InventoryError) as negative:
        await service.apply_operation(
            actor=WAREHOUSE,
            payload=operation(
                "22222222-2222-2222-2222-222222222222",
                movement_type="consume",
                quantity="11",
            ),
        )
    assert negative.value.status_code == 409
    assert db.inventory_balances.items == before
    assert len(db.stock_movements.items) == 1
    assert len(db.audit_events.items) == 1


def test_operation_idempotency_conflict_and_negative_rollback():
    asyncio.run(run_operation_idempotency_and_rollback())


async def run_adjustment_requires_independent_approval():
    service, db = build_service()
    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("12111111-1111-1111-1111-111111111111"),
    )
    request = await service.create_adjustment_request(
        actor=WAREHOUSE,
        payload={
            "request_operation_id": "12222222-2222-2222-2222-222222222222",
            "subject_type": "material",
            "subject_id": "mat-1",
            "on_hand_delta": "-2",
            "reference_type": "cycle_count",
            "reference_id": "count-1",
            "expected_balance_version": 1,
            "reason": "Cycle count found a discrepancy",
        },
    )
    assert request["status"] == "pending"
    with pytest.raises(InventoryError) as self_approval:
        await service.approve_adjustment_request(
            request["id"],
            expected_version=1,
            operation_id="12333333-3333-3333-3333-333333333333",
            reason="Approve own request",
            actor=WAREHOUSE,
        )
    assert self_approval.value.code == "self_approval_forbidden"

    approved = await service.approve_adjustment_request(
        request["id"],
        expected_version=1,
        operation_id="12444444-4444-4444-4444-444444444444",
        reason="Manager verified cycle-count evidence",
        actor=MANAGER,
    )
    assert approved["request"]["status"] == "approved"
    assert approved["balance"]["on_hand"] == "8"
    assert len(db.stock_movements.items) == 2

    replayed = await service.approve_adjustment_request(
        request["id"],
        expected_version=1,
        operation_id="12444444-4444-4444-4444-444444444444",
        reason="Manager verified cycle-count evidence",
        actor=MANAGER,
    )
    assert replayed["replayed"] is True
    assert len(db.stock_movements.items) == 2


def test_adjustment_is_atomic_single_use_and_cannot_be_self_approved():
    asyncio.run(run_adjustment_requires_independent_approval())


async def run_compare_and_set_retry():
    service, db = build_service()
    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("31111111-1111-1111-1111-111111111111"),
    )
    db.inventory_balances.fail_next_cas_updates = 1
    result = await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("32222222-2222-2222-2222-222222222222", quantity="2"),
    )
    assert result["balance"]["on_hand"] == "12"
    assert result["balance"]["version"] == 2
    assert len(db.stock_movements.items) == 2


def test_compare_and_set_retries_without_duplicate_movement():
    asyncio.run(run_compare_and_set_retry())


async def run_reservation_lifecycle_and_expiry():
    service, db = build_service()
    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("41111111-1111-1111-1111-111111111111"),
    )
    reservation_payload = {
        "operation_id": "42222222-2222-2222-2222-222222222222",
        "subject_type": "material",
        "subject_id": "mat-1",
        "quantity": "4",
        "reference_type": "order",
        "reference_id": "order-1",
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat(),
        "reason": "Reserve material for confirmed order",
    }
    reserved = await service.create_reservation(
        actor=WAREHOUSE, payload=reservation_payload
    )
    replayed = await service.create_reservation(
        actor=WAREHOUSE, payload=dict(reservation_payload)
    )
    assert replayed["reservation"]["id"] == reserved["reservation"]["id"]
    assert reserved["balance"]["reserved"] == "4"

    consumed = await service.transition_reservation(
        actor=WAREHOUSE,
        reservation_id=reserved["reservation"]["id"],
        action="consume",
        operation_id="43333333-3333-3333-3333-333333333333",
        reason="Consumed during production",
    )
    assert consumed["reservation"]["status"] == "consumed"
    assert consumed["balance"]["on_hand"] == "6"
    assert consumed["balance"]["reserved"] == "0"
    consumed_replay = await service.transition_reservation(
        actor=WAREHOUSE,
        reservation_id=reserved["reservation"]["id"],
        action="consume",
        operation_id="43333333-3333-3333-3333-333333333333",
        reason="Consumed during production",
    )
    assert consumed_replay["movement"]["id"] == consumed["movement"]["id"]

    with pytest.raises(InventoryError) as already_closed:
        await service.transition_reservation(
            actor=WAREHOUSE,
            reservation_id=reserved["reservation"]["id"],
            action="release",
            operation_id="44444444-4444-4444-4444-444444444444",
            reason="Cannot release consumed reservation",
        )
    assert already_closed.value.code == "reservation_not_active"

    expiring = await service.create_reservation(
        actor=WAREHOUSE,
        payload={
            **reservation_payload,
            "operation_id": "45555555-5555-5555-5555-555555555555",
            "reference_id": "order-2",
            "quantity": "2",
            "expires_at": (
                datetime.now(timezone.utc) - timedelta(minutes=1)
            ).isoformat(),
        },
    )
    first_expiry = await service.expire_due_reservations(actor=MANAGER)
    second_expiry = await service.expire_due_reservations(actor=MANAGER)
    assert first_expiry["expired"] == 1
    assert second_expiry["expired"] == 0
    stored = await db.inventory_reservations.find_one(
        {"id": expiring["reservation"]["id"]}
    )
    assert stored["status"] == "expired"


def test_reservation_transitions_and_expiry_are_exactly_once():
    asyncio.run(run_reservation_lifecycle_and_expiry())


async def run_generic_reservation_movements_are_rejected():
    service, db = build_service()
    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("46666666-6666-6666-6666-666666666666"),
    )
    for movement_type in ("reserve", "release"):
        with pytest.raises(InventoryError) as guarded:
            await service.apply_operation(
                actor=WAREHOUSE,
                payload=operation(
                    f"47777777-7777-7777-7777-77777777777{1 if movement_type == 'reserve' else 2}",
                    movement_type=movement_type,
                    quantity="2",
                ),
            )
        assert guarded.value.status_code == 409
        assert guarded.value.code == "reservation_endpoint_required"
    assert len(db.stock_movements.items) == 1
    assert db.inventory_balances.items[0]["reserved"].to_decimal() == 0

    reservation = await service.create_reservation(
        actor=WAREHOUSE,
        payload={
            "operation_id": "48888888-8888-8888-8888-888888888888",
            "subject_type": "material",
            "subject_id": "mat-1",
            "quantity": "2",
            "reference_type": "order",
            "reference_id": "order-guard",
            "reason": "Reserve through lifecycle endpoint",
        },
    )
    listed = await service.list_reservations(
        subject_type="material",
        subject_id="mat-1",
        status="active",
        limit=20,
    )
    assert [item["id"] for item in listed] == [reservation["reservation"]["id"]]
    assert listed[0]["quantity"] == "2"


def test_generic_reservation_movements_are_rejected_and_active_rows_are_listed():
    asyncio.run(run_generic_reservation_movements_are_rejected())


async def run_restock_dedup_resolution_and_email_isolation():
    service, db = build_service()
    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("51111111-1111-1111-1111-111111111111"),
    )
    low = await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation(
            "52222222-2222-2222-2222-222222222222",
            movement_type="consume",
            quantity="6",
        ),
    )
    assert low["balance"]["available"] == "4"
    assert (
        len([item for item in db.restock_alerts.items if item["status"] == "active"])
        == 1
    )
    assert len(db.notifications.items) == 3

    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation(
            "53333333-3333-3333-3333-333333333333",
            movement_type="plan_demand",
            quantity="10",
        ),
    )
    assert (
        len([item for item in db.restock_alerts.items if item["status"] == "active"])
        == 2
    )
    assert len(db.notifications.items) == 6

    await service.apply_operation(
        actor=WAREHOUSE,
        payload=operation("54444444-4444-4444-4444-444444444444", quantity="20"),
    )
    assert all(item["status"] == "resolved" for item in db.restock_alerts.items)
    assert len(db.notification_outbox.items) == 6
    assert all(item["status"] == "pending" for item in db.notification_outbox.items)
    assert db.inventory_balances.items[0]["version"] == 4

    manually_active = deepcopy(db.restock_alerts.items[0])
    manually_active.update(
        {"id": "manual-alert", "status": "active", "deduplication_key": "manual"}
    )
    db.restock_alerts.items.append(manually_active)
    resolved = await service.resolve_alert(
        alert_id="manual-alert",
        actor=MANAGER,
        reason="Reviewed and replenishment confirmed",
    )
    assert resolved["status"] == "resolved"
    assert db.audit_events.items[-1]["action"] == "inventory.restock_alert_resolved"


def test_restock_dedup_resolution_and_email_failure_after_commit():
    asyncio.run(run_restock_dedup_resolution_and_email_isolation())


def test_stock_movements_run_through_the_central_transaction_boundary():
    async def run():
        service, _db = build_service()
        await service.apply_operation(
            actor=WAREHOUSE,
            payload=operation("62222222-2222-2222-2222-222222222222"),
        )
        events = service.guard.executor.event_sink.events
        assert ("transaction_start", "inventory.apply_operation") in events
        assert ("transaction_commit", "inventory.apply_operation") in events

    asyncio.run(run())


def test_transaction_capability_is_required():
    async def run():
        service, _db = build_service(transactions=False)
        with pytest.raises(InventoryError) as unavailable:
            await service.apply_operation(
                actor=WAREHOUSE,
                payload=operation("61111111-1111-1111-1111-111111111111"),
            )
        assert unavailable.value.status_code == 503
        assert unavailable.value.code == "transaction_unavailable"

    asyncio.run(run())


async def run_restock_recipients_follow_capability_and_access_state():
    service, db = build_service()
    db.users.items = [
        {
            "id": "ops-approved",
            "email": "ops@test",
            "roles": ["warehouse"],
            "status": "active",
            "access_state": "approved",
            "role_policy_version": ROLE_POLICY_VERSION,
        },
        {
            "id": "ops-review",
            "email": "review@test",
            "roles": ["warehouse"],
            "status": "active",
            "access_state": "access_review_required",
            "role_policy_version": ROLE_POLICY_VERSION,
        },
        {
            "id": "ops-disabled",
            "email": "disabled@test",
            "roles": ["warehouse"],
            "status": "disabled",
            "access_state": "approved",
            "role_policy_version": ROLE_POLICY_VERSION,
        },
    ]
    actor = {
        "id": "ops-approved",
        "roles": ["warehouse"],
        "status": "active",
        "access_state": "approved",
        "role_policy_version": ROLE_POLICY_VERSION,
    }
    await service.apply_operation(
        actor=actor, payload=operation("71111111-1111-1111-1111-111111111111")
    )
    await service.apply_operation(
        actor=actor,
        payload=operation(
            "72222222-2222-2222-2222-222222222222",
            movement_type="consume",
            quantity="6",
        ),
    )
    assert [item["user_id"] for item in db.notifications.items] == ["ops-approved"]


def test_restock_recipients_use_canonical_capability_and_fail_closed_access_state():
    asyncio.run(run_restock_recipients_follow_capability_and_access_state())
